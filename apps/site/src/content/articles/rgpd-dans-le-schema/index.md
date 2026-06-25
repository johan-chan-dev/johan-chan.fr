---
title: "RGPD dans le schéma, pas en post-it"
registre: impl
date: "2026-06-24"
tags: ["supabase", "rgpd", "rpc", "postgres", "conformité"]
readingTime: 3
live: false
draft: true
series: supabase-serieusement
order: 7
image: ./images/hero.webp
imageFocus: center
excerpt: "Export, effacement, rétention : des RPC scopées à l'identité, une anonymisation qui préserve la facture, et une purge planifiée. Le droit, gravé dans la base."
---

## Le besoin

Un client écrit : « envoyez-moi toutes les données que vous avez sur moi » (article 15). Un autre : « supprimez-les » (article 17). Deux droits que la loi t'oblige à satisfaire. Mais deux pièges immédiats.

Pour l'export, comment garantir que le client reçoit **ses** données, et pas celles d'un autre ? Pour l'effacement, comment supprimer ses données personnelles tout en **gardant la facture**, que la loi comptable t'oblige à conserver pendant des années ? Si tu traites ça « plus tard, en couche applicative », tu ajoutes un endroit à ne jamais oublier — et un jour tu l'oublieras. La bonne place, c'est la base elle-même.

## Le principe : la conformité est une propriété du schéma

> **↑ Pour aller plus loin :** ce chapitre applique [La conformité est une propriété du schéma](/journal/conformite-propriete-du-schema). Voici la version courte.

Trois idées. Un, le **scope se borne à l'identité authentifiée**, lue par l'opération elle-même plutôt que fournie par le client. Deux, **effacer n'est pas supprimer** : c'est anonymiser sélectivement, retirer ce qui identifie et garder ce que la loi impose. Trois, la **rétention est une politique déclarée** qui s'exécute seule. On va voir les trois gravées dans des fonctions et un planificateur.

## L'implémentation Supabase

### Article 15 : l'export, scopé par `auth.uid()`

Le droit d'accès devient une RPC. Le point décisif : elle ne prend **aucun identifiant client en entrée**. Elle lit elle-même qui appelle, via `auth.uid()`, et borne tout son périmètre à ça.

```sql
-- Art. 15 (accès) : export jsonb des données du client AUTHENTIFIÉ (auth.uid() borne le scope)
create or replace function public.export_customer_data()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_uid uuid;
begin
  v_uid := auth.uid();
  if v_uid is null then raise exception 'not_authenticated' using errcode = 'insufficient_privilege'; end if;
  return jsonb_build_object(
    'customer', (select to_jsonb(c) from public.customers c where c.id = v_uid),
    'orders',  (select coalesce(jsonb_agg(...), '[]'::jsonb) from public.orders o where o.auth_user_id = v_uid),
    'loyalty', (select coalesce(jsonb_agg(...), '[]'::jsonb) from public.loyalty_ledger l where l.customer_id = v_uid)
  );
end; $$;
```

Regarde ce que ça rend **impossible** : il n'y a pas de paramètre « exporte le client X ». Un appelant ne peut pas demander les données d'un autre, parce que la fonction ne lui offre aucune prise pour le faire. Le scope est gravé dans la définition de la fonction. C'est le principe « borné par l'identité », littéralement.

### Article 17 : l'effacement qui anonymise, pas qui détruit

Le droit à l'effacement n'est pas un `DELETE`. La fonction retire la PII et **garde la facture**, dépersonnalisée.

```sql
-- Art. 17 (effacement) : ANONYMISE la PII, GARDE la facture (obligation comptable)
create or replace function public.delete_customer_data()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_uid uuid; v_orders int;
begin
  v_uid := auth.uid();
  if v_uid is null then raise exception 'not_authenticated' using errcode = 'insufficient_privilege'; end if;
  update public.customers set email = null, phone = null where id = v_uid;
  update public.orders set delivery_address = null where auth_user_id = v_uid and delivery_address is not null;
  get diagnostics v_orders = row_count;
  return jsonb_build_object('anonymized', true, 'orders_anonymized', v_orders);
end; $$;
```

Deux obligations contradictoires en apparence — faire disparaître la personne, garder la trace comptable — réconciliées par une opération chirurgicale : on nullifie les champs personnels (email, téléphone, adresse de livraison), on laisse la commande et son montant. La facture demeure, mais elle ne pointe plus vers un individu. Et là encore, le scope est `auth.uid()` : on n'efface que *ses* données. Le retour `anonymized` nomme l'opération pour ce qu'elle est.

### La rétention : une politique qui s'exécute seule

Reste ce qui n'est lié à aucune demande client : la donnée qui expire avec le temps. Logs au-delà de 13 mois, adresses au-delà de 10 ans — ça ne se nettoie pas à la main un trimestre sur deux. C'est une **purge planifiée** : une fonction de purge appelée périodiquement par le planificateur (cf. `pg_cron`, chapitre 6). La rétention devient un comportement du système. (Migrations dédiées : purge + cron ; gouvernance et base légale vivent dans une migration de data-governance séparée.)

## Honnêteté

Le **design** de ces droits est prouvé au bon niveau (les RPC, le bornage par `auth.uid()`, l'anonymisation sont du SQL pur, A-testable en base éphémère — cf. chapitre 5). Deux précisions pour ne rien survendre :

- **Mono-restaurant.** Ce projet n'a pas de `restaurant_id` : les rôles sont globaux et le scope client est l'identité seule. En contexte multi-tenant, il faudrait *en plus* borner par le tenant — c'est une extension du pattern, pas ce que fait ce code.
- La **conformité juridique** complète (registres, bases légales, durées exactes) relève de la gouvernance, pas seulement de ces fonctions. Ce chapitre montre comment le **schéma porte** les garanties techniques — il ne se substitue pas à un avis juridique.

---

**À retenir :** export et effacement sont des RPC scopées par `auth.uid()`, l'effacement anonymise la PII en gardant la facture, et la rétention tourne en purge planifiée.
