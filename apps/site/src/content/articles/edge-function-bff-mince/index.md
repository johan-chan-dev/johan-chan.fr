---
title: "Ton Edge Function ne devrait rien savoir"
registre: impl
date: "2026-06-24"
tags: ["supabase", "edge-functions", "architecture", "testabilité", "deno"]
readingTime: 3
live: false
draft: true
series: supabase-serieusement
order: 4
image: ./images/hero.webp
imageFocus: center
excerpt: "La logique de prix, de TVA, de disponibilité doit être réutilisable et testable sans démarrer un serveur. La place d'une Edge Function, c'est de câbler — pas de savoir."
---

## Le besoin

Une commande arrive. Il faut vérifier la disponibilité des plats, figer un prix immuable, ventiler la TVA, persister le tout de façon atomique. C'est le cœur du métier — la partie qui doit être *juste*.

Et cette logique-là, tu en as besoin à plusieurs endroits : l'appli web, l'appli native, peut-être un back-office. Tu as besoin de la **tester** vite, en boucle, sans monter toute une stack. Et tu as besoin qu'elle ne dérive jamais d'une copie à l'autre.

Question : où poses-tu ce code ? Le réflexe Supabase, c'est « dans l'Edge Function, évidemment, c'est là qu'arrive la requête ». C'est précisément le piège.

## Le principe : exécuté dans ≠ appartenir à

> **↑ Pour aller plus loin :** ce chapitre applique [« Exécuté dans X » n'est pas « appartenir à X »](/journal/execute-dans-x-nest-pas-appartenir-a-x) et, en filigrane, [la frontière de dépendance vérifiée](/journal/convention-non-verifiee-deja-morte). Voici la version courte.

Le code qui s'exécute dans l'Edge ne lui *appartient* pas pour autant. Le lieu d'exécution (le runtime Deno) est un fait technique, contingent. Le lieu de résidence de la règle (le domaine métier) est une décision de conception, durable. Le critère qui tranche : **que dois-je démarrer pour tester cette règle ?** Si la réponse est « toute la stack », la règle est au mauvais endroit.

Garde ça en tête. On va le voir littéralement dans le handler.

## L'implémentation Supabase

### Le handler `order` : il compose, il n'invente rien

Voici le passage de commande. Regarde ce qu'il *ne fait pas* : aucun calcul de prix inline, aucune règle de TVA, aucune validation métier écrite sur place. Il importe des modules et les enchaîne.

```ts
import { createClient } from '@supabase/supabase-js'
import { createCatalog } from '@baan/catalog'
import { factureDeCommande, lignesFactureFromSnapshots } from '@baan/pricing'
import { createOrderFromResolved } from '@baan/ordering'
import { getDb } from '@baan/db'

// ... dans le handler :
const db = await getDb()
const catalog = createCatalog({ getDb: () => db })
const resolved = await catalog.resolveIntent({ lignes: body.lignes })   // dispo + snapshot immuable
const factureVentilee = factureDeCommande({ /* ... */ })                 // ventilation TVA
const order = await createOrderFromResolved(db, { /* ... */ })           // persistance atomique
```

Toute la sûreté — disponibilité, prix, ventilation, snapshot immuable — vit dans les modules `business/*`. L'Edge **câble les dépendances réelles derrière les mêmes ports que les doublures en test**. Le runtime traduit la requête en appels métier, puis le résultat en réponse. C'est tout son travail.

Conséquence directe : chaque règle se teste en appelant une fonction, sans démarrer Deno ni ouvrir un port. *Exécuté dans* l'Edge, *appartenant* au domaine.

### La frontière qui empêche la dérive

Reste à éviter que la commodité ne ramène la logique dans le handler « juste cette fois ». L'outillage s'en charge.

La règle de dépendance est dirigée : `apps → business → packages`. L'Edge (`apps`) peut importer le métier (`business`) ; l'inverse est interdit. Un import `business → apps` est **refusé au lint** (`eslint-plugin-boundaries`) : la flèche est unidirectionnelle, vérifiée mécaniquement. (C'est le principe de [la frontière vérifiée](/journal/convention-non-verifiee-deja-morte).)

### Le contraste : la version « tout inline »

Pour sentir ce qu'on gagne, regarde ce que les tutos encouragent — calculer le prix et la TVA puis insérer, directement dans le `serve()` :

```ts
// ANTI-PATTERN (illustratif) — logique mariée au transport
serve(async (req) => {
  const body = await req.json()
  let total = 0
  for (const ligne of body.lignes) {
    const { data } = await supabase.from('plats').select('prix').eq('id', ligne.id).single()
    total += data.prix * ligne.qty           // règle de prix inline
  }
  const tva = total * 0.1                     // règle de TVA inline
  await supabase.from('orders').insert({ total, tva })
  return new Response(JSON.stringify({ total, tva }))
})
```

Ça marche. Et c'est un piège : le prix et la TVA sont soudés à `req`, à `Response`, au client Supabase. Pour tester la ventilation, tu dois démarrer tout le runtime. Pour réutiliser la règle côté web ou natif, tu la réécris — et la vérité diverge. Le critère du principe tranche : pour tester cette TVA, il faut démarrer l'infra → elle n'est pas à sa place.

## Honnêteté

Le **flux** que câble ce handler est validé par des tests au bon niveau (A, en base éphémère) : la composition catalogue → prix → persistance est couverte. En revanche, le **serving Deno réel** (vraie gateway, vrai runtime sous charge) relève du niveau C et reste **différé** dans ce projet — ce module n'est pas exécuté par la suite verte. Donc : voici la forme correcte du wrapper et pourquoi elle tient. Pas « éprouvé en prod sous charge ».

---

**À retenir :** la logique métier vit dans des modules qui ignorent Deno et HTTP, testables sans rien démarrer, et la frontière `apps → business → packages` est tenue par le lint.
