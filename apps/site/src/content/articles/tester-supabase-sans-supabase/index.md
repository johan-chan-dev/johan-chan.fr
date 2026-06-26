---
title: "Tester ton backend Supabase sans Supabase"
registre: impl
date: "2026-06-24"
tags: ["supabase", "tests", "pglite", "postgres", "rls"]
readingTime: 4
live: false
draft: true
series: supabase-serieusement
order: 5
image: ./images/hero.webp
imageFocus: center
excerpt: "Vérifier tes policies RLS et tes fonctions SQL en millisecondes, sans démarrer la stack. Un Postgres en WASM, un claim JWT simulé, et une honnêteté sur ce qui doit rester en E2E."
---

## Le besoin

Tu as des policies RLS, une fonction `authorize()`, des RPC métier. Tout ça, c'est du code — et du code, ça se teste. Mais à quel prix ?

Si chaque test exige de démarrer une stack Supabase complète — Postgres, GoTrue, PostgREST, le réseau — tu paies des dizaines de secondes par run, une CI lourde, des tests fragiles. Résultat connu : on en écrit moins, on les lance moins, la couverture s'effrite. Ce que tu veux, c'est vérifier la logique de ta base en **millisecondes**, en boucle, pendant que tu codes. Et tu gardes la stack réelle seulement pour ce qui l'exige vraiment.

## Le principe : pousse le test au plus bas niveau

> **↑ Pour aller plus loin :** ce chapitre applique [Tester par le bon niveau](/journal/tester-par-le-bon-niveau). Voici la version courte.

Trois étages : **A** (logique en mémoire, millisecondes), **B** (intégration légère, substitut éphémère de l'infra), **C** (bout-en-bout réel). La règle : fais descendre chaque test au plus bas niveau où il garde son sens. Une policy RLS, une fonction SQL pure de décision — ça n'a pas besoin d'un GoTrue réel pour être prouvé. Ça a juste besoin d'un Postgres. On va lui en donner un, jetable.

## L'implémentation Supabase

### PGlite : un vrai Postgres, en WASM, jetable

PGlite, c'est Postgres compilé en WebAssembly : un vrai moteur Postgres qui démarre dans le process de test, sans serveur, sans conteneur. Tu appliques tes migrations dessus, tu exécutes tes requêtes, tu vérifies le comportement — puis tu le jettes. Niveau A/B atteint : tes policies, ta fonction `authorize()`, tes RPC tournent contre du vrai SQL Postgres, en millisecondes, sans la stack Supabase.

C'est exactement le même moteur Postgres. Une policy qui passe en PGlite passe parce que la sémantique est identique.

### Le claim JWT, simulé par un GUC

Reste un détail qui décide de tout : tes policies lisent l'identité et le rôle de l'appelant. En production, ça vient du JWT. En test, il n'y a pas de JWT. Comment faire croire à `authorize()` qu'un gérant est connecté ?

C'est ici que paie une décision prise au chapitre 1. Souviens-toi : `authorize()` lit `current_setting('request.jwt.claims')` **plutôt que** `auth.jwt()`. La raison est exactement celle-ci : `request.jwt.claims` est un **GUC** (un paramètre de session Postgres), et un GUC, ça se pose à la main.

```sql
-- Le shim de test pose le claim, exactement comme le ferait la vraie stack
select set_config('request.jwt.claims', '{"sub":"...","user_role":"gerante"}', true);
```

À partir de là, `authorize('staff.manage')` répond `true` en test comme en réel, parce qu'elle lit la même source. Le même code d'autorité est **portable** entre le PGlite du niveau A et le GoTrue réel du niveau C. Si la fonction avait dépendu de `auth.jwt()`, ce pont serait impossible : on n'aurait pas pu simuler l'appelant sans un vrai GoTrue.

### Ce qui ne descend pas : `@pglite-skip`

Tout ne peut pas être prouvé en PGlite, et c'est sain. Certaines migrations référencent des rôles que seul l'environnement réel possède — par exemple le rôle d'administration d'authentification qui exécute le Custom Access Token Hook (chapitre 1). PGlite ne connaît pas ce rôle.

Plutôt que de bricoler un faux rôle qui mentirait sur la réalité, ces migrations portent un marqueur en tête :

```sql
-- @pglite-skip  (rôle supabase_auth_admin absent de PGlite : validation en niveau C)
```

Le harnais saute le fichier entier en niveau A. La conséquence est honnête : le Hook ne prétend pas être testé en unitaire — il relève du niveau C, **différé**. Les tables RBAC et `authorize()`, elles, restent A-testables. On ne descend que ce qui garde son sens en bas.

### Le coût de PGlite

Un dernier point qu'on ne lisse pas. PGlite consomme de la mémoire — de l'ordre de **~1,6 Go par fork** non libéré. Lancé en parallèle massif « parce que c'est rapide », tu pars en OOM. Les suites bornent donc la concurrence. La vitesse a un coût mémoire : le bon réflexe, c'est de le connaître et de le payer sciemment, au lieu de découvrir l'OOM en CI.

## Honnêteté

C'est le chapitre qui *incarne* le garde-fou de toute la série. Ce qui est prouvé ici l'est vraiment : policies, `authorize()`, RPC tournent contre un vrai Postgres et sont couvertes (niveau A/B, suite verte). Ce qui dépend du runtime réel — le Hook d'émission de token, les grants spécifiques à GoTrue — est **explicitement marqué comme différé** (niveau C), pas caché sous un faux test vert. La stratégie tient dans cette transparence sur l'état réel de la preuve.

---

**À retenir :** PGlite donne un vrai Postgres jetable pour tester policies et fonctions en millisecondes ; le claim se simule via le GUC `request.jwt.claims` (d'où `current_setting` au lieu de `auth.jwt()` au chapitre 1), ce qui exige un GoTrue réel porte `@pglite-skip` en niveau C, et le coût mémoire est de ~1,6 Go/fork.
