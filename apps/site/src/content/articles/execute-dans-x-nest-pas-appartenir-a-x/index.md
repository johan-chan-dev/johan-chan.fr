---
title: "« Exécuté dans X » n'est pas « appartenir à X »"
registre: design
date: "2026-06-24"
tags: ["architecture", "design", "testabilité", "backend"]
readingTime: 4
live: false
draft: true
image: ./images/hero.webp
imageFocus: center
excerpt: "Le code qui calcule tes prix tourne dans un serveur HTTP. Ça ne veut pas dire qu'il y habite. Confondre les deux, c'est marier ta logique métier à un transport qu'elle ne devrait pas connaître."
---

Ta règle de calcul de prix s'exécute dans un serveur HTTP. Donc elle appartient au serveur HTTP, non ?

Non. Et cette confusion-là, entre *où le code s'exécute* et *où la règle réside*, est à l'origine d'une bonne moitié des backends qu'on n'arrive plus à tester ni à réutiliser.

Le facteur passe par ta rue tous les matins. Ça ne fait pas de ta rue le bureau de poste.

## La confusion fondatrice

Quand tu écris un endpoint, tout est là, au même endroit : tu reçois une requête, tu lis le corps, tu valides la disponibilité, tu calcules le prix et la TVA, tu écris en base, tu renvoies une réponse. Le geste naturel, c'est de tout poser dans le handler. Ça marche. Ça part en prod.

Mais tu viens de décider, sans le formuler, que ta règle de prix *appartient* au transport HTTP. Elle est mariée à l'objet requête, à l'objet réponse, au client de base de données. Pour l'exécuter, il faut tout ce décor.

Or le lieu d'exécution et le lieu de résidence sont deux choses différentes. Le code *s'exécute* dans le runtime — c'est un fait technique, contingent, qui changera. Le code *appartient* à un domaine — c'est une décision de conception, qui devrait durer. Les confondre, c'est laisser un détail d'infrastructure dicter l'architecture de ta logique métier.

## Le critère qui tranche

Il y a une question toute bête qui range chaque morceau de code du bon côté :

> **Que dois-je démarrer pour tester cette règle ?**

Si pour vérifier ta ventilation de TVA tu dois lancer un serveur HTTP, ouvrir un port, forger une requête et lire une réponse — alors tu as répondu : ta règle métier *appartient* à l'infra. C'est un problème, parce que la ventilation de TVA n'a rien à voir avec HTTP. Tu paies un coût de démarrage et de mise en scène pour tester une règle d'arithmétique.

Si la réponse est *rien* — j'appelle une fonction avec des données, je vérifie le résultat, point — alors la règle *réside* dans le domaine, et le runtime n'est qu'un endroit de passage. C'est ce qu'on veut.

Le critère est opérationnel, pas philosophique. Tu le passes au code, et il te dit où la règle habite vraiment. Quand tester une règle exige de démarrer l'infrastructure, le problème n'est pas la difficulté des tests. La règle a simplement été rangée au mauvais endroit.

## Ce que coûte la confusion

Une logique mariée au transport, ça se paie de trois façons.

**Elle devient intestable au bon niveau.** Chaque test de règle traîne tout le décor du runtime. Les tests sont lents, fragiles, pénibles à écrire. Résultat : on en écrit moins, et on couvre moins la logique qui compte.

**Elle devient non réutilisable.** La même règle de prix, tu en as besoin côté web, côté appli native, dans un job batch. Mais elle est soudée à *un* transport. Alors on la réécrit ailleurs — et maintenant la vérité existe en deux exemplaires qui divergeront.

**Elle devient opaque.** Quand le métier et le plomberie HTTP sont entremêlés dans le même handler, on ne lit plus l'intention. « Qu'est-ce que cette commande est censée garantir ? » se noie sous le parsing, la sérialisation, la gestion d'erreurs réseau.

## La forme saine

L'inversion est simple à énoncer : **le runtime ne possède rien, il câble.**

Le handler devient mince. Son seul travail : traduire le monde extérieur (la requête) en appels vers des modules métier, puis traduire le résultat en réponse. Il *compose*. Aucune règle ne naît dans le handler.

La logique, elle, vit dans des modules qui ne connaissent ni HTTP, ni le transport, ni le runtime. Disponibilité, prix, ventilation, persistance : chacun est une unité qu'on teste en appelant une fonction, sans rien démarrer. Le handler les assemble derrière les mêmes interfaces que celles qu'on utilise en test avec des doublures.

Tu obtiens alors la propriété qu'on cherchait : *exécuté dans* le runtime, *appartenant* au domaine. Le code tourne bien dans le serveur — mais il réside dans des modules portables, testables en millisecondes, réutilisables partout. Le jour où tu changes de transport, tu réécris le handler mince. La règle, elle, ne bouge pas. Elle n'a jamais été à lui.

## Ce qu'il faut retenir

- *S'exécuter dans* X (fait technique, contingent) ≠ *appartenir à* X (décision de conception, durable). Ne laisse pas le premier dicter le second.
- Le critère qui tranche : « que dois-je démarrer pour tester cette règle ? ». Si la réponse est « l'infrastructure », la règle est au mauvais endroit.
- Une logique mariée au transport est intestable au bon niveau, non réutilisable, et opaque.
- La forme saine : un handler mince qui *compose*, et des modules métier qui ne connaissent pas le runtime. Le runtime se contente de câbler.
