---
title: "RBAC orthodoxe sur Supabase"
registre: impl
date: "2026-06-24"
tags: ["supabase", "rbac", "autorisation", "rls", "postgres"]
readingTime: 3
live: false
draft: true
series: supabase-serieusement
order: 1
image: ./images/hero.webp
imageFocus: center
excerpt: "Gérante, chef, comptoir : trois rôles, trois jeux de droits. Le pattern officiel Supabase à deux tables, une fonction d'autorité, et un claim JWT qui n'est qu'un miroir."
---

## Le besoin

Trois personnes derrière le comptoir, trois rôles. La **gérante** peut tout : carte, promotions, remboursements, réglages, staff. Le **chef** gère la cuisine et la carte, rien de plus. Le **comptoir** prend des commandes — et c'est tout : ni remboursements, ni réglages.

Tu pourrais coder ça en dur avec des `if (user.email === ...)`. Mais le jour où une quatrième personne arrive, où un rôle change, où tu veux ajouter une permission, tu repasses dans le code. Ce que tu veux, c'est exprimer **qui a le droit de quoi** comme une donnée, pas comme du code éparpillé.

## Le principe : qui tu es → ce que tu peux

> **↑ Pour aller plus loin :** ce chapitre applique [RBAC vs ABAC : qui tu es vs ce que tu possèdes](/journal/rbac-vs-abac-qui-tu-es-ce-que-tu-possedes), et s'appuie sur [ACL en entrée, RLS en filet](/journal/acl-en-entree-rls-en-filet). Voici la version courte.

Le RBAC (contrôle d'accès par rôle) répond à une seule question : *qui es-tu ?* À un rôle correspond un ensemble de permissions. Le rôle, c'est l'identité ; les permissions, c'est ce que cette identité débloque. Deux idées à garder :

1. La **source de vérité** vit côté serveur. Ce que le client présente (un jeton, un claim) n'en est qu'un **miroir** — jamais l'original.
2. Par défaut, on **refuse**. Une permission n'existe que si elle a été explicitement accordée.

On va voir ces deux idées posées telles quelles dans le schéma.

## L'implémentation Supabase

### Deux tables : l'affectation et la matrice

Le pattern officiel « Custom Claims & RBAC » de Supabase tient en deux tables. L'une dit *qui a quel rôle*, l'autre *quel rôle débloque quelle permission*.

```sql
-- Enums : rôles métier + permissions granulaires
create type public.app_role as enum ('gerante', 'chef', 'comptoir');
create type public.app_permission as enum (
  'catalog.write', 'promotions.write', 'delivery.dispatch', 'refunds.write',
  'settings.write', 'staff.manage', 'compliance.read', 'orders.manage'
);

-- user_roles : affectation rôle ⇄ utilisateur (SOURCE DE VÉRITÉ ; le claim JWT en est le miroir)
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

-- role_permissions : la MATRICE rôle → permission
create table public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  role public.app_role not null,
  permission public.app_permission not null,
  unique (role, permission)
);
alter table public.role_permissions enable row level security;

-- Matrice : Gérante = admin (tout) ; Chef = cuisine + carte ; Comptoir = commandes.
insert into public.role_permissions (role, permission) values
  ('gerante','catalog.write'),('gerante','promotions.write'),('gerante','delivery.dispatch'),
  ('gerante','refunds.write'),('gerante','settings.write'),('gerante','staff.manage'),
  ('gerante','compliance.read'),('gerante','orders.manage'),
  ('chef','catalog.write'),('chef','orders.manage'),
  ('comptoir','orders.manage');
```

Le besoin du début est devenu une **donnée**. Ajouter une permission au chef, c'est une ligne à insérer, sans toucher au code.

### `authorize()` : l'autorité partagée

Il faut un seul endroit qui répond à « ce rôle a-t-il cette permission ? », utilisable aussi bien par la RLS que par le code serveur.

```sql
-- authorize(permission) : l'AUTORITÉ partagée. SECURITY DEFINER pour lire la matrice
-- en bypassant la RLS. search_path = '' (anti-shadowing). Refus par défaut.
create or replace function public.authorize(requested_permission public.app_permission)
returns boolean language plpgsql stable security definer set search_path = ''
as $$
declare
  bind_permissions int;
  v_claims jsonb;
  v_role public.app_role;
begin
  v_claims := nullif(current_setting('request.jwt.claims', true), '')::jsonb;
  v_role := (nullif(v_claims ->> 'user_role', ''))::public.app_role;
  if v_role is null then return false; end if;
  select count(*) into bind_permissions
  from public.role_permissions
  where role_permissions.permission = requested_permission
    and role_permissions.role = v_role;
  return bind_permissions > 0;
exception
  when invalid_text_representation then return false;  -- claim inconnu ⇒ refus, jamais 500
end;
$$;
```

Trois détails qui font la qualité de ce pattern :

- **Refus par défaut.** Pas de rôle, claim illisible, permission absente → `false`. Un claim inconnu lève une exception qu'on rattrape en `false` : jamais de 500, jamais d'ouverture par accident.
- **`security definer` + `search_path = ''`.** La fonction lit la matrice en passant outre la RLS (sinon elle ne pourrait pas la consulter), et le `search_path` vide empêche qu'on lui substitue une table piégée.
- **Lire `current_setting('request.jwt.claims')` plutôt que `auth.jwt()`.** C'est le choix qui rend la fonction **portable** entre la vraie stack et un Postgres de test (on y reviendra au chapitre 5).

### Le claim n'est qu'un miroir

Reste à mettre le rôle dans le JWT. Et c'est là que le principe « source de vérité côté serveur » devient concret : le rôle est **posé par le serveur** à chaque émission de token, via le Custom Access Token Hook.

```sql
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb language plpgsql stable as $$
declare
  claims jsonb;
  v_role public.app_role;
begin
  select role into v_role from public.user_roles
  where user_id = (event->>'user_id')::uuid limit 1;
  claims := event->'claims';
  if v_role is not null then
    claims := jsonb_set(claims, '{user_role}', to_jsonb(v_role));
  else
    claims := jsonb_set(claims, '{user_role}', 'null');
  end if;
  event := jsonb_set(event, '{claims}', claims);
  return event;
end;
$$;

-- Le hook s'exécute en tant que supabase_auth_admin (GoTrue) : exécution RÉVOQUÉE aux rôles applicatifs.
grant execute on function public.custom_access_token_hook to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook from authenticated, anon, public;
```

Et on le câble dans `config.toml` :

```toml
[auth.hook.custom_access_token]
enabled = true
uri = "pg-functions://postgres/public/custom_access_token_hook"
```

**L'anti-pattern à fuir :** stocker le rôle dans `user_metadata`. C'est tentant, c'est à portée de main — mais `user_metadata` est **modifiable par le client**. Tu confierais l'autorité à la partie qu'il faut justement contrôler. La source de vérité est la table `user_roles`, et le claim en découle, posé côté serveur. Si les deux divergent, c'est la table qui a raison.

## Honnêteté

Les tables RBAC et `authorize()` sont testées au bon niveau (A, en base éphémère) : la matrice, le refus par défaut, la lecture du claim — tout ça est couvert. Le **Custom Access Token Hook**, lui, dépend d'un rôle (`supabase_auth_admin`) et d'un GoTrue réels : il porte un marqueur de saut en test unitaire et relève de la validation niveau C, **différée** dans ce projet. Donc : voici le design correct et ce qui est prouvé. Le câblage réel du hook se vérifie en E2E.

---

**À retenir :** deux tables font de « qui a le droit de quoi » une donnée, `authorize()` tranche en refus par défaut, et le rôle voyage dans le JWT mais reste posé par le serveur depuis la table `user_roles`.
