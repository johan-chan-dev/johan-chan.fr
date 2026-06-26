---
title: "Tester par le bon niveau"
registre: design
date: "2026-06-24"
tags: ["architecture", "tests", "design", "backend"]
readingTime: 5
live: false
draft: true
image: ./images/hero.webp
imageFocus: center
excerpt: "Si une règle est testable sans l'infrastructure, c'est qu'elle ne lui appartient pas. Pousse chaque test au niveau le plus bas où il garde du sens — et assume honnêtement ce qui doit rester en haut."
---

Pour vérifier qu'un calcul de TVA est juste, tu n'as pas besoin d'un serveur, d'un réseau, ni d'une vraie base de données. Tu as besoin de données d'entrée et d'un résultat attendu. Le jour où ton test de TVA exige de démarrer toute la stack, c'est un signe : il a été écrit au mauvais niveau.

Tester par le bon niveau, c'est une seule idée : **mettre chaque test au plus bas étage où il garde encore son sens.** Le plus bas, parce que c'est là qu'il court vite, qu'il reste fiable et qu'il pointe juste quand il casse. Et « où il garde son sens », parce que descendre trop bas ne prouve plus rien.

## Trois niveaux, trois métiers

On peut ranger les tests en trois étages, du plus bas au plus haut.

**Niveau A — la logique, en mémoire.** Une règle pure : on lui donne des entrées, on vérifie des sorties. Pas d'infrastructure, pas d'I/O. Ça s'exécute en millisecondes, c'est déterministe, et quand ça casse, le message est sans ambiguïté. C'est là que doit vivre l'écrasante majorité de tes tests métier.

**Niveau B — l'intégration légère.** Plusieurs morceaux assemblés, parfois avec un substitut léger et éphémère de l'infrastructure (une base en mémoire, une dépendance simulée fidèle). On vérifie que les pièces s'emboîtent, que les contrats tiennent. Plus lent que A, mais toujours rapide et reproductible.

**Niveau C — le bout-en-bout réel.** Le vrai système, les vrais composants, le vrai réseau. C'est lent, plus fragile, coûteux à maintenir. Mais c'est le seul niveau qui prouve certaines choses : que le câblage réel fonctionne, que les composants externes se comportent comme la doc le promet.

Ces trois étages ne sont pas en compétition : ils répondent à des questions différentes. L'erreur, c'est de tester une chose à un niveau qui n'est pas le sien.

## La gravité : pousse le test vers le bas

La règle de conception qui découle de tout ça : **fais descendre chaque test au niveau le plus bas possible.**

Une règle métier testée au niveau C alors qu'elle pourrait l'être au niveau A, c'est un gâchis : tu paies de la lenteur et de la fragilité pour une preuve que tu aurais eue en millisecondes. Pire, c'est un **symptôme** : si tu *dois* monter au niveau C pour tester une règle d'arithmétique, c'est que cette règle est accrochée à de l'infrastructure dont elle devrait être détachée. Le test difficile pointe un problème de conception, pas un problème de test.

D'où le critère, le même que celui qui range le code par appartenance : *de quoi ai-je besoin pour tester cette règle ?* Si la réponse est « rien d'autre que la règle elle-même », ta cible est le niveau A. Si la réponse est « toute la stack », commence par te demander si la règle est au bon endroit — souvent, la rendre testable au niveau A, c'est d'abord la décoller de l'infra.

Une bonne suite ne se mesure pas à son volume de tests. Sa qualité tient à une chose : chaque test est à l'étage le plus bas qui le rende utile.

## Ce qui doit rester en haut — et l'honnêteté que ça demande

Certaines choses ne sont prouvables qu'au niveau C. Le comportement réel d'un composant externe. Un câblage qui dépend de l'environnement réel. Un contrat avec un système qu'on ne contrôle pas. Vouloir les forcer plus bas, c'est fabriquer un test qui passe au vert sans rien garantir — le pire des deux mondes.

Et là vient une exigence d'honnêteté qu'on néglige souvent. Le niveau C est lent et coûteux ; il arrive qu'on **diffère** une partie de cette validation — c'est un choix légitime, à condition de le dire. La règle est simple :

> Ce qui est prouvé au niveau A/B, tu peux l'affirmer. Ce qui relève d'un niveau C que tu n'as pas (encore) exécuté, tu en décris le **design**, pas la validation.

Autrement dit : « voici la forme correcte, et voici pourquoi elle tient » est honnête. « Validé en production, sous charge » alors que le test bout-en-bout est différé, ne l'est pas. Confondre le design prouvé et la validation différée, c'est vendre de l'aspirationnel comme de l'acquis — et ça ruine la confiance bien plus sûrement qu'une dette assumée à voix haute.

## Le bas niveau n'est pas gratuit

Dernier garde-fou, contre l'excès inverse. Pousser les tests vers le bas est la bonne direction, mais aucun étage n'est sans coût. Un substitut d'infrastructure éphémère (niveau B) consomme des ressources — mémoire, temps de démarrage — qu'on oublie facilement parce qu'ils sont « locaux ». Multiplié par la parallélisation, ça se paie : on borne la concurrence, on surveille la mémoire, on ne lance pas mille instances « parce que c'est rapide ».

Présenter un outil de test rapide comme « gratuit » est une erreur de la même famille que prétendre avoir validé ce qu'on a différé : c'est lisser un compromis au lieu de le nommer. Le bon réflexe : connaître le coût de chaque niveau, et le payer en connaissance de cause.

## Ce qu'il faut retenir

- Trois niveaux, trois métiers : A (logique en mémoire), B (intégration légère), C (bout-en-bout réel). Chacun répond à une question différente.
- Pousse chaque test au **plus bas niveau où il garde son sens** : c'est là qu'il est rapide, stable, précis.
- Un test qui *exige* de monter au niveau C pour une règle simple est un symptôme : la règle est mal rangée.
- Assume le niveau C que tu diffères : décris le **design**, pas une validation que tu n'as pas faite.
- Aucun niveau n'est gratuit. Connais le coût (mémoire, lenteur) et paie-le en connaissance de cause.
