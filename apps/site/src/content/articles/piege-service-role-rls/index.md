---
title: "Le piège service_role : pourquoi la RLS ne te protège pas"
registre: impl
date: "2026-06-24"
tags: ["supabase", "rls", "sécurité", "edge-functions", "postgres"]
readingTime: 4
live: false
draft: true
series: supabase-serieusement
order: 3
image: ./images/hero.webp
imageFocus: center
excerpt: "Ton Edge Function admin écrit en base, tu crois que tes policies RLS te couvrent. Elles ne te couvrent pas. Voici pourquoi, et le garde qu'il te faut en entrée."
---

## Le besoin

Une gérante rembourse une commande. Un chef met à jour la carte. Le comptoir, lui, prend des commandes mais ne doit toucher ni aux remboursements, ni à la carte, ni aux réglages.

Pour faire ça proprement, tu écris une Edge Function admin. Elle reçoit la requête, elle écrit en base. Et comme elle doit pouvoir agir sur les données de n'importe quel client, pas seulement celles de l'appelant, elle s'exécute avec la clé `service_role`, la clé toute-puissante de Supabase.

Tu as aussi, en bonne élève, écrit des policies RLS par rôle sur tes tables. Tu te dis : même si je me trompe dans la fonction, la RLS me rattrape.

Non. Elle ne te rattrape pas. Et c'est le piège n°1 de Supabase, celui que 90 % des tutos passent sous silence.

## Le principe : ACL en entrée, RLS en filet

> **↑ Pour aller plus loin :** cet article applique le principe [ACL en entrée, RLS en filet](/journal/acl-en-entree-rls-en-filet). Ici, la version courte.

Un seul point de contrôle, c'est un seul point de défaillance. Une sécurité d'accès sérieuse a **deux étages aux rôles distincts** :

- une **ACL en entrée** — la décision explicite *cet appelant a-t-il le droit de faire cette action ?*, prise tôt, comme prérequis ;
- un **filet** au niveau des données — les policies par ligne, tendues quel que soit le chemin d'accès.

Le point qui fait mal : **un acteur privilégié court-circuite le filet.** Donc tout chemin privilégié *doit* avoir une ACL en entrée — c'est là qu'il n'y a pas de seconde chance. Garde ça en tête, on va le voir littéralement à l'œuvre.

## L'implémentation Supabase

### `service_role` bypasse la RLS — par conception

La clé `service_role` est faite pour l'infrastructure : migrations, jobs, code serveur de confiance. Pour qu'elle puisse faire son travail, Postgres l'exécute en **bypass RLS**. Tes policies `for select/insert/update ... to authenticated` ne la concernent pas. Elle passe à travers comme si elles n'existaient pas.

Conséquence directe : **une Edge Function qui utilise `service_role` n'est protégée par aucune de tes policies.** Le filet est tendu pour les autres, pas pour elle. Si tu n'ajoutes rien, ta fonction admin est une porte grande ouverte : le comptoir peut appeler l'endpoint de remboursement, et la RLS ne dira rien.

La RLS garde tout son sens pour l'**autre** chemin : l'accès direct via PostgREST, où l'appelant est `authenticated` et pas `service_role`. Là, le filet joue son rôle. Chaque étage couvre son chemin.

### Le garde en entrée : `serveAdmin({ requiredPermission })`

Puisque le filet ne couvre pas le chemin Edge, il faut une **ACL explicite** à l'entrée de la fonction. Le rôle voyage dans le JWT (posé côté serveur par un Auth Hook — voir le chapitre 1) ; on le lit, et on refuse 403 si la permission manque.

```js
// Matrice rôle → permissions — MIROIR du seed role_permissions en base.
export const PERMISSION_MATRIX = {
  gerante: ['catalog.write', 'promotions.write', 'delivery.dispatch', 'refunds.write',
            'settings.write', 'staff.manage', 'compliance.read', 'orders.manage'],
  chef: ['catalog.write', 'orders.manage'],
  comptoir: ['orders.manage'],
};

// Lit le claim user_role du Bearer JWT. On NE revérifie PAS la signature :
// en prod la gateway l'a déjà vérifiée (verify_jwt=true) avant d'atteindre l'Edge.
export function roleFromAuthHeader(req) {
  const auth = req.headers.get('Authorization') ?? req.headers.get('authorization');
  if (auth === null || !auth.startsWith('Bearer ')) return null;
  const parts = auth.slice(7).split('.');
  if (parts.length !== 3) return null;
  try {
    const claims = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    const r = claims.user_role;
    return r === 'gerante' || r === 'chef' || r === 'comptoir' ? r : null;
  } catch { return null; }
}
```

`serveAdmin(handlers, { requiredPermission })` enveloppe le handler : il lit le rôle, vérifie la permission dans la matrice, et **refuse 403 avant** d'exécuter quoi que ce soit. C'est le **seul** gate des écritures admin, puisque la fonction agit en `service_role` qui bypasse la RLS. La RLS par rôle reste le filet pour l'accès PostgREST direct.

Le principe, littéralement à l'œuvre : le chemin privilégié n'a pas de filet en dessous, donc tout son contrôle d'accès tient au garde d'entrée.

### Le compromis : une matrice dupliquée, mais armée

Tu l'as remarqué : la matrice rôle → permissions existe **deux fois**. Une fois en base (`role_permissions`, la source de vérité que lit la RLS), une fois en JS (`PERMISSION_MATRIX`, que lit le gate Edge).

C'est de la duplication. La tentation, c'est de la supprimer — interroger la base à chaque requête pour ne garder qu'une vérité. Mais ce serait payer un aller-retour DB sur le chemin chaud de chaque écriture admin, juste pour une matrice qui change deux fois par an.

L'arbitrage retenu : **redondance assumée, mais vérifiable.** Un test arme l'invariant — si la matrice JS et le seed SQL divergent, la CI casse. La duplication ne fait plus peur parce qu'une dérive est attrapée avant la prod. (C'est exactement le "redondance contrôlée" du principe.)

## Honnêteté

Le **design** de ce gate est éprouvé et le flux d'autorisation est couvert par des tests (niveau A/B, en base éphémère). En revanche, la validation E2E du **serving Deno réel** (vraie gateway, vrai GoTrue, sous charge) relève du niveau C et reste **différée** dans ce projet. Donc : voici la forme correcte du garde et pourquoi elle tient, sans prétendre qu'elle est validée en prod sous charge. Le prétendre serait te mentir, et l'honnêteté est tout l'intérêt de cette série.

---

**À retenir :** `service_role` bypasse la RLS, donc une Edge qui l'utilise n'est protégée par aucune policy et exige une ACL explicite en entrée ; la RLS reste le filet pour l'accès direct.
