---
title: "Réagir sans broker : l'événementiel sur primitives natives"
registre: design
date: "2026-06-24"
tags: ["architecture", "événementiel", "découplage", "design"]
readingTime: 5
live: false
draft: true
image: ./images/hero.webp
imageFocus: center
excerpt: "Une commande est payée, trois services doivent réagir. Le découplage par événements est d'abord une affaire de conception. Souvent, les primitives que tu as déjà suffisent."
---

Une commande est payée. Il faut créditer la fidélité, planifier la livraison, envoyer une notification. Trois réactions, trois services, trois équipes peut-être. La question piège : comment les brancher ?

La réponse réflexe, en 2026, c'est « il nous faut un bus d'événements ». Et souvent, dans la foulée, « donc il nous faut Kafka ». On installe une infrastructure lourde pour un besoin qui, à ce stade, est d'abord un besoin de **conception**. Le découplage par événements n'est pas un produit qu'on achète, c'est une façon de structurer les dépendances. Et ça ne commence pas par un broker.

## L'événement comme couture de découplage

Le modèle vient du domaine. Un fait métier se produit — *la commande a été payée*. Ce fait est une vérité du domaine, indépendante de qui s'y intéresse. Autour de lui, des réactions : la fidélité crédite, la livraison planifie, les notifications partent. Chacune porte **sa propre règle**, dans **son propre service**.

Le point qui fait tout tenir : **l'émetteur ne connaît pas ses réacteurs.** La commande émet « j'ai été payée » et s'arrête là. Elle ne sait pas que la fidélité existe ; elle n'appelle pas la livraison ; elle ne porte aucune liste de conséquences. Ce sont les réactions qui *s'abonnent* au fait, jamais le fait qui *invoque* les réactions.

Cette direction-là est tout le bénéfice. Ajouter une quatrième réaction n'oblige pas à rouvrir la commande. Retirer la fidélité ne casse pas le paiement. Chaque réaction se teste, se déploie, échoue isolément. C'est la même flèche dirigée que partout ailleurs en architecture : le cœur stable (le fait) ignore la périphérie changeante (les réactions).

## Toutes les réactions ne se ressemblent pas

L'erreur suivante serait de croire qu'il existe *un* bon mécanisme pour brancher une réaction. Il y en a plusieurs, et le bon dépend de la **nature de la réaction**. Quelques axes pour trancher :

- **Doit-elle réussir ou échouer avec le fait, de façon atomique ?** Si la conséquence fait partie de la transaction (elle ne *peut pas* ne pas arriver si le fait arrive), elle se branche au plus près, de façon synchrone et transactionnelle.
- **Peut-elle arriver un peu plus tard, mais doit-elle être garantie ?** Alors il lui faut une **file durable** : le fait dépose un message, un consommateur le traite à son rythme, et un échec se rejoue. C'est l'éventuel-mais-fiable.
- **Sort-elle du système ?** Si la réaction vit ailleurs (un tiers, un autre domaine), c'est une **notification sortante** : on prévient, sans attendre, sans coupler le fait au destinataire.
- **Est-elle si critique et immédiate qu'on l'assume en clair ?** Parfois la réponse honnête est un **appel explicite**, ici, maintenant, parce que le découplage n'apporterait que de l'obscurité.

Le piège n'est pas de choisir « le mauvais outil » dans l'absolu, mais de tout brancher de la même façon — tout en synchrone (et un tiers lent fait tomber le paiement), ou tout en asynchrone (et une conséquence critique se perd dans une file). Une réaction = une décision de couplage, prise pour ce qu'elle est.

## Tu n'as pas besoin d'un broker pour ça

Voilà le vrai message. Aucun des mécanismes ci-dessus n'exige une infrastructure de messagerie dédiée. Un système de données moderne offre déjà, en natif, de quoi les implémenter : des déclencheurs pour le synchrone-transactionnel, des files durables pour l'éventuel-fiable, des notifications pour le sortant, des appels pour l'explicite. Le découplage que tu cherchais était une propriété de ta **conception**.

Adopter un broker externe, ce n'est pas gratuit : un composant de plus à exploiter, à superviser, à sécuriser, à faire évoluer. Tant que tes primitives natives portent ton volume, l'ajouter, c'est importer de la complexité pour résoudre un problème que tu n'as pas encore. Le bon ordre est l'inverse : structurer le découplage d'abord, sur ce que tu as déjà, et n'introduire l'infrastructure lourde que **quand une limite réelle se manifeste**.

## Et les limites sont réelles

L'honnêteté impose de dire où le natif s'arrête. Les primitives intégrées portent un débit fini. Le jour où le volume d'événements dépasse ce qu'une file in-système encaisse, où il faut du multi-région, du partitionnement, des garanties d'ordre fines, une rétention longue et rejouable à grande échelle — là, l'outil dédié gagne sa place. Le modèle, lui, ne bouge pas : l'événement comme couture tient. Seul change le mécanisme sous la couture. Et comme l'émetteur n'a jamais connu ses réacteurs, remplacer la file native par un broker ne touche ni le fait, ni les réactions — juste la plomberie entre les deux.

Vendre les primitives natives comme « ça scale à l'infini » serait aussi malhonnête que d'imposer Kafka d'entrée. La vérité tient en une phrase : commence par le découplage, sur ce que tu as ; change de mécanique le jour où une limite *mesurée* l'exige, pas avant.

## Ce qu'il faut retenir

- Le découplage par événements est une **décision de conception**, pas un produit. L'émetteur émet un fait ; il ne connaît pas ses réacteurs.
- Toutes les réactions ne se branchent pas pareil : atomique-synchrone, éventuel-fiable (file durable), sortant (notification), ou appel explicite assumé. Une réaction = une décision de couplage.
- Les primitives natives d'un système de données moderne couvrent ces cas. Pas besoin d'un broker pour *commencer*.
- Le natif a des limites réelles (débit, ordre, multi-région). Change de mécanisme quand une limite se mesure — et comme le modèle ne dépend pas du mécanisme, ce changement ne touche ni le fait ni les réactions.
