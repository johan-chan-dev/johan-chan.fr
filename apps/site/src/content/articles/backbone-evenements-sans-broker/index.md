---
title: "Un backbone d'événements sans broker"
registre: impl
date: "2026-06-24"
tags: ["supabase", "événementiel", "pgmq", "pg-cron", "postgres"]
readingTime: 4
live: false
draft: true
series: supabase-serieusement
order: 6
image: ./images/hero.webp
imageFocus: center
excerpt: "Une commande payée déclenche fidélité, livraison, notifications — sans Kafka. Une file durable (pgmq) et un planificateur (pg_cron) déjà dans Postgres, et une matrice pour choisir le bon branchement."
---

## Le besoin

`OrderPaid`. Une commande vient d'être payée. Trois choses doivent suivre : la fidélité crédite des points, la livraison se planifie, une notification part au client. Trois réactions, portées par trois services distincts, qui ne doivent surtout pas alourdir le paiement ni dépendre les unes des autres.

La tentation est connue : « montons un bus d'événements, donc un Kafka ». Pour un backend Supabase qui démarre, c'est ajouter une infrastructure entière — à exploiter, superviser, sécuriser — pour un besoin que Postgres sait déjà couvrir. Avant de choisir un broker, demande-toi *de quoi tu as réellement besoin sous la couture*.

## Le principe : le découplage est une conception, pas un produit

> **↑ Pour aller plus loin :** ce chapitre applique [Réagir sans broker : l'événementiel sur primitives natives](/journal/evenementiel-sur-primitives-natives). Voici la version courte.

Un fait métier se produit ; des réactions s'y abonnent. L'émetteur **ne connaît pas** ses réacteurs : la commande émet « j'ai été payée » et s'arrête là. Et toutes les réactions ne se branchent pas pareil — atomique-synchrone, éventuel-fiable (file durable), sortant (notification), ou appel explicite. Le découplage que tu cherches est une propriété de conception : pas besoin d'un broker pour *commencer*. Voyons ce que Postgres offre nativement pour ça.

## L'implémentation Supabase

> ⚠️ Les extraits SQL de cette section sont **illustratifs** (forme du pattern), pas des copies vérifiées du projet. L'implémentation réelle vit dans une doc d'architecture interne et des migrations dédiées ; voir la note d'honnêteté en fin de chapitre.

### Deux primitives, déjà dans Postgres

Tu n'as rien à installer en plus. Supabase expose deux extensions Postgres qui suffisent au backbone :

- **`pgmq`** — une file de messages durable, *dans* la base. Un producteur dépose un message, un consommateur le lit, le traite, puis l'acquitte. Un échec ne perd pas le message : il redevient visible et se rejoue. C'est le « éventuel-mais-fiable » du principe.
- **`pg_cron`** — un planificateur *dans* la base. Il exécute une fonction à intervalle régulier — par exemple, vider la file et dispatcher ses messages vers les bons consommateurs.

Le fait émet en déposant dans la file ; un dispatcher périodique draine la file et déclenche les réactions. L'émetteur ignore toujours qui réagit.

```sql
-- ILLUSTRATIF — émettre l'événement = déposer un message dans la file
select pgmq.send('order_events', jsonb_build_object(
  'type', 'OrderPaid',
  'order_id', new.id,
  'paid_at', now()
));

-- ILLUSTRATIF — un dispatcher périodique draine la file (pg_cron)
select cron.schedule('dispatch-order-events', '10 seconds', $$
  select dispatch_order_events();   -- lit pgmq.read(...), route vers les consommateurs, acquitte
$$);
```

La fidélité, la livraison, les notifications consomment chacune le flux à leur rythme, dans leur propre service. Ajouter une quatrième réaction n'oblige pas à rouvrir le paiement.

### Choisir le bon branchement : la matrice

Le cœur du chapitre, c'est de **brancher chaque réaction selon sa nature**. La doc d'architecture du projet en fait une matrice de décision ; voici comment elle se lit :

| Nature de la réaction | Mécanisme natif | Pourquoi |
|---|---|---|
| Doit être atomique avec le fait | **trigger** (même transaction) | si le fait est validé, la conséquence l'est aussi — ou rien |
| Éventuelle mais garantie | **file `pgmq`** + consommateur | découplée, rejouable en cas d'échec |
| Sort du système (tiers) | **webhook / notification DB** | on prévient sans coupler le fait au destinataire |
| Critique, immédiate, locale | **appel explicite** | le découplage n'apporterait que de l'obscurité |

Tout brancher en synchrone, et un tiers lent fait tomber le paiement. À l'inverse, tout passer en asynchrone noie une conséquence critique dans une file. La matrice évite ces deux excès : une réaction, une décision de couplage.

### Le jour où Postgres ne suffit plus

Ce backbone porte un volume, pas un volume infini. Multi-région, partitionnement, garanties d'ordre fines, rétention longue rejouable à grande échelle : à ce moment-là, un broker dédié gagne sa place. Et comme l'émetteur n'a jamais connu ses réacteurs, remplacer `pgmq` par ce broker ne touche ni l'événement, ni les réactions — seulement la plomberie entre les deux. Tu changes de mécanique, pas de modèle.

## Honnêteté

Statut particulier pour ce chapitre, et il faut le dire clairement. Le design de ce backbone est documenté dans une **doc d'architecture interne (v1.0), fact-checkée contre la documentation Supabase officielle** (`pgmq`, `pg_cron`). Mais contrairement aux chapitres sur l'autorisation, il **ne s'appuie pas sur une suite de tests verte** dans ce projet : les extraits ci-dessus sont *illustratifs* de la forme, pas des copies vérifiées. Donc : voici le pattern et la logique de choix, étayés par la doc officielle. Pas « éprouvé en production sous charge ». La distinction design-prouvé / validation-différée vaut ici plus que partout.

---

**À retenir :** un backbone d'événements tient avec ce que Postgres a déjà (`pgmq` + `pg_cron`) ; le travail réel est le **choix du branchement par réaction** — trigger, file, webhook ou appel.
