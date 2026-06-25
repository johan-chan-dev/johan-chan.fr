---
title: "RBAC vs ABAC : qui tu es vs ce que tu possèdes"
registre: design
date: "2026-06-24"
tags: ["architecture", "sécurité", "autorisation", "design"]
readingTime: 4
live: false
draft: true
image: ./images/hero.webp
imageFocus: center
excerpt: "Deux façons d'autoriser un accès : par ton rôle, ou par ce qui t'appartient. Deux axes complémentaires que les systèmes réels combinent."
---

« Est-ce que cette personne a le droit de voir cette commande ? »

Il y a deux bonnes réponses à cette question, et elles ne parlent pas de la même chose. La première : « oui, parce que c'est *sa* commande ». La seconde : « oui, parce que c'est un *gérant* ». La première regarde la donnée, la seconde regarde la personne. Confondre les deux, ou n'en utiliser qu'une, c'est se retrouver coincé à mi-chemin de ce dont on a besoin.

## RBAC : qui tu es

Le contrôle d'accès par rôle (RBAC) range les gens en catégories — admin, éditeur, lecteur — et attache à chaque catégorie un ensemble de permissions. La question qu'il pose est : *qui es-tu ?* Si tu es éditeur, tu peux écrire. Si tu es lecteur, tu ne peux que lire. Peu importe *quoi* : la permission découle du rôle, indépendamment de l'objet visé.

C'est puissant pour tout ce qui est transversal. « Un admin peut gérer le staff » ne dépend d'aucune ligne particulière — ça vaut pour tout le staff, partout. Le rôle est une propriété de la **personne**.

Sa limite est exactement le revers de sa force : le rôle ne sait rien de l'appartenance. RBAC seul ne peut pas exprimer « chacun voit *ses* commandes », parce qu'il n'y a pas un rôle par utilisateur. Si tu tentes de le faire en RBAC, tu finis avec un rôle par personne — c'est-à-dire plus de rôles du tout.

## ABAC : ce que tu possèdes

Le contrôle d'accès par attribut (ABAC) ne regarde pas qui tu es, mais la **relation entre toi et la donnée**. La question qu'il pose est : *est-ce à toi ?* Cette commande porte ton identifiant → tu la vois. Cet enregistrement de fidélité est rattaché à ton compte → tu y as accès. L'autorisation se décide ligne par ligne, en comparant un attribut de la donnée à ton identité.

C'est exactement ce qui manquait au RBAC. « Chacun voit ses propres données » devient trivial : la règle est une comparaison entre un champ de la ligne et l'identité de l'appelant. Aucun rôle à inventer, et plus d'explosion combinatoire.

Sa limite est, là encore, le miroir de sa force : l'appartenance ne sait rien du transversal. ABAC seul ne peut pas exprimer « un gérant voit tout », parce qu'un gérant ne *possède* pas les commandes des autres. Pour lui, il faudrait écrire « appartient à l'appelant », ce qui est faux, ou « tout le monde », ce qui est dangereux.

## Deux axes, pas deux camps

L'erreur, c'est de présenter RBAC et ABAC comme un choix : « notre système est en RBAC » ou « on fait de l'ABAC ». Ce ne sont pas deux écoles rivales. Ce sont **deux axes orthogonaux** :

- *Qui tu es* — ton rôle. Transversal, attaché à la personne.
- *Ce que tu possèdes* — ton lien à la donnée. Local, attaché à la ligne.

Un système d'autorisation réel a besoin des deux, parce que les règles réelles mélangent les deux questions. « Tu vois cette commande si elle est à toi **ou** si tu es gérant » n'est exprimable ni en RBAC pur, ni en ABAC pur. Elle l'est en une ligne dès qu'on accepte de **combiner les deux par un `ou`** :

> tu y as accès **si** (la donnée t'appartient) **ou** (ton rôle te le permet)

Le premier membre est de l'ABAC, le second du RBAC, et le `ou` les réunit sans les confondre. Chacun garde son rôle : l'ABAC couvre l'appartenance, le RBAC couvre le transversal. Ensemble, ils couvrent le réel.

Le critère pour savoir lequel mobiliser est simple : si la règle parle d'une **catégorie de personnes** (« les gérants », « les admins »), c'est du rôle. Si elle parle d'un **lien à un objet** (« sa commande », « son dossier »), c'est de l'appartenance. Et si elle parle des deux, tu les combines.

## Où vit la vérité

Dernier point, et il est commun aux deux modèles : **la source de vérité de l'autorisation vit côté serveur.**

Le rôle d'une personne, comme l'appartenance d'une donnée, sont des faits que le serveur établit et garde. Ce que l'appelant *présente* — un jeton, un identifiant, un attribut affiché — n'est qu'un **miroir** de ces faits. Le piège classique est de faire confiance à un attribut que le client peut modifier lui-même : à ce moment-là, tu n'autorises plus, tu obéis. Le rôle se vérifie contre ce que le serveur a posé ; l'appartenance se vérifie contre l'identité authentifiée, pas contre un paramètre fourni par l'appelant.

## Ce qu'il faut retenir

- RBAC répond à *qui es-tu ?* (rôle, transversal, attaché à la personne). Idéal pour les droits de catégorie.
- ABAC répond à *est-ce à toi ?* (attribut, local, attaché à la ligne). Idéal pour l'appartenance.
- **Deux axes** complémentaires : les règles réelles les combinent par un `ou` (« à moi **ou** mon rôle l'autorise »).
- Pour les deux, la vérité est côté serveur : le rôle posé par le serveur, l'appartenance vérifiée contre l'identité authentifiée — jamais contre un attribut que le client contrôle.
