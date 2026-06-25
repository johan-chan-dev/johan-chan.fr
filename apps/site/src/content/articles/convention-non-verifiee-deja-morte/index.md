---
title: "Une convention non vérifiée est déjà morte"
registre: design
date: "2026-06-24"
tags: ["architecture", "design", "dépendances", "monorepo"]
readingTime: 4
live: false
draft: true
image: ./images/hero.webp
imageFocus: center
excerpt: "« On importe toujours du haut vers le bas. » Tout le monde est d'accord, c'est écrit dans le README, et six mois plus tard la règle est violée partout. Une frontière qui n'est pas tenue par l'outillage n'existe pas."
---

« Chez nous, on importe toujours du haut vers le bas. La couche métier ne dépend jamais de l'extérieur. »

Tout le monde hoche la tête. C'est écrit dans le README. C'est dit à l'onboarding. Et six mois plus tard, tu ouvres le graphe de dépendances et la règle est violée à douze endroits. Personne ne l'a fait exprès. Chaque entorse était « juste un petit import, le temps de débloquer un truc ».

C'est le destin de toute convention qui repose sur la bonne volonté : elle dérive. Pas d'un coup — par accumulation de petits arrangements, chacun raisonnable pris isolément. Une convention non vérifiée mécaniquement n'est pas « fragile ». Elle est **déjà morte** au moment où tu l'écris, parce que rien ne s'oppose à sa première violation.

## Pourquoi les conventions de gentleman dérivent

Une convention « de gentleman », c'est une règle que tout le monde s'engage à respecter… de mémoire. Elle a trois faiblesses fatales.

Elle est **invisible au moment du code**. Quand tu écris un import interdit, rien ne te le signale. Tu n'as pas la règle sous les yeux — tu as une deadline.

Elle est **asymétrique dans le temps**. La respecter ne rapporte rien aujourd'hui ; la violer débloque tout de suite. À chaque arbitrage, le présent gagne contre le futur.

Et elle **se dégrade en silence**. La première entorse ne casse rien de visible. Elle rend juste la deuxième plus facile à justifier — « il y en a déjà une là ». La dette s'installe sans alarme.

Résultat : la frontière existe sur le papier, mais le code, lui, fait ce qu'il veut. Et un graphe de dépendances qui fait ce qu'il veut, c'est un système qu'on ne peut plus raisonner ni découper.

## La flèche est unidirectionnelle

Le remède commence par une décision de conception nette : **la dépendance a un sens, un seul.**

Tu ranges ton système en couches — disons, de la plus exposée à la plus stable : la couche externe (le transport, l'entrée/sortie) → la couche métier (les règles du domaine) → les primitives (les utilitaires partagés, sans logique métier). La règle est simple : on dépend **toujours vers l'intérieur**. L'externe connaît le métier ; le métier ignore l'externe. Jamais l'inverse.

Ce choix est fonctionnel. Si le métier se met à dépendre de l'externe, tu ne peux plus tester le métier sans monter l'externe, ni le réutiliser sous un autre transport, ni remplacer le transport sans toucher au métier. La flèche dirigée, c'est ce qui garde le cœur stable indépendant de ce qui l'entoure.

Mais énoncer le sens ne suffit pas. On vient de voir pourquoi : énoncé, il dérive.

## La rendre exécutable

La frontière ne devient réelle qu'au moment où **l'outillage refuse la violation**.

Concrètement : une règle de lint qui interdit l'import à contresens, et qui **fait échouer** la vérification quand il apparaît. Pas un avertissement qu'on scrolle — une erreur qui bloque. À partir de là, tout change :

- La règle redevient **visible au moment du code** : tu tentes l'import interdit, ça rougit immédiatement.
- L'asymétrie temporelle **s'inverse** : violer coûte tout de suite (la CI casse), respecter est le chemin de moindre résistance.
- La dégradation silencieuse **devient impossible** : il n'y a plus de « première entorse » qui passe inaperçue.

La convention cesse d'être une promesse pour devenir une propriété du système. On ne demande plus aux gens de s'en souvenir ; on a rendu l'erreur **impossible à committer**.

La règle reste ta décision de conception ; le test, lui, la rend *vivante*. Sans lui, tu as une intention ; avec lui, tu as une frontière.

## Le corollaire qui se mord la queue

Ce principe s'applique à autre chose que le code. Toute documentation, toute architecture éditoriale, tout système de « ceci dépend de cela » subit la même loi : une dépendance qu'on s'interdit mais qu'on ne vérifie pas finira par être prise.

C'est même un bon test pour toi-même : si tu énonces une frontière — dans ton code, dans ta doc, dans ton organisation — demande aussitôt « qu'est-ce qui *refuse* sa violation ? ». Si la réponse est « la vigilance des gens », tu n'as pas de frontière. Tu as un vœu.

## Ce qu'il faut retenir

- Une convention qui repose sur la mémoire et la bonne volonté dérive toujours, par accumulation de petites entorses raisonnables.
- Décider du sens de la dépendance (toujours vers l'intérieur : externe → métier → primitives) est nécessaire mais pas suffisant.
- Une frontière n'existe vraiment que quand l'outillage **refuse** sa violation : la vérification échoue, la CI bloque, l'erreur reste impossible à committer.
- Bon réflexe : devant toute règle, demande « qu'est-ce qui en empêche la violation ? ». Si la réponse est « la vigilance », tu tiens un vœu.
