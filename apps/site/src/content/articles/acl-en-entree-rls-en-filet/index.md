---
title: "ACL en entrée, RLS en filet"
registre: design
date: "2026-06-24"
tags: ["architecture", "sécurité", "autorisation", "backend"]
readingTime: 4
live: false
draft: true
image: ./images/hero.webp
imageFocus: center
excerpt: "Un seul point de contrôle, c'est un seul point de défaillance. La sécurité d'accès tient quand deux étages aux rôles distincts se couvrent l'un l'autre."
---

Tu mets un garde à l'entrée. Il vérifie les badges, il refuse les gens qui n'ont rien à faire là. Le jour où tu te dis "bon, on a un garde, c'est réglé", tu viens de créer un point de défaillance unique.

Parce que le garde s'absente. Quelqu'un refait le couloir et oublie de remettre le poste. Une nouvelle porte apparaît dont personne ne lui a parlé. Le garde n'a rien fait de mal — il n'était juste pas au courant. Et derrière lui, il n'y a rien.

C'est exactement ce qui arrive aux contrôles d'accès dans un backend. Un seul niveau de vérification, aussi bien écrit soit-il, finit par être contourné. Rarement par malveillance : plutôt par oubli, par refacto, par un chemin d'accès qu'on n'avait pas prévu.

## Deux étages, deux rôles différents

La réponse n'est pas "un meilleur garde". C'est **deux étages qui ne font pas le même travail**.

Le premier, c'est le **contrôle d'accès en entrée** — l'ACL. C'est la décision explicite : *cet appelant a-t-il le droit de faire cette action ?* Elle se prend tôt, au point d'entrée, avant que la moindre écriture parte. C'est un **prérequis** : si la réponse est non, on s'arrête là, on renvoie un refus, rien ne se passe.

Le second, c'est le **filet** — les policies au niveau des données elles-mêmes (row-level security). Elles ne dépendent pas du chemin emprunté. Que la requête arrive par l'API prévue, par un accès direct à la base, par un script de maintenance — le filet est tendu sous chaque ligne. Il ne pose pas la question "as-tu le droit de faire cette action", il pose la question "as-tu le droit de voir, de toucher *cette ligne-là*".

Les deux étages font un travail distinct. Ils répondent à des questions différentes, à des moments différents, contre des menaces différentes. L'ACL protège l'**action**. Le filet protège la **donnée**. C'est ça, la défense en profondeur : pas deux fois le même mur, mais deux murs qui couvrent les angles morts l'un de l'autre.

## Le piège : l'acteur qui passe à travers le filet

Voici le scénario qui réveille la nuit. Certains composants d'un système s'exécutent avec des **droits élevés** — un service interne, un job d'administration, un worker de confiance. Par construction, ces composants **court-circuitent le filet** : les policies au niveau des lignes ne s'appliquent pas à eux, sinon ils ne pourraient pas faire leur travail d'infrastructure.

Conséquence directe, et c'est l'erreur qu'on voit partout : **un composant privilégié n'est pas protégé par tes policies.** Tu as soigné ton filet, tu as écrit des règles ligne par ligne impeccables — et le code qui s'exécute en mode privilégié passe au travers comme si elles n'existaient pas. Parce que pour lui, elles n'existent pas.

C'est précisément là que l'ACL en entrée devient **obligatoire**. Si un composant contourne le filet, alors le seul rempart qui lui reste, c'est le contrôle explicite à son point d'entrée. Pas de filet en dessous : le garde est tout ce qu'il y a. Donc il doit être là, et il doit être explicite.

La règle qui en découle est simple à énoncer :

> Tout chemin qui contourne le filet doit avoir une ACL en entrée. Sans exception, parce que c'est précisément là qu'il n'y a pas de seconde chance.

## Le compromis : une redondance assumée

Faire vivre deux étages a un coût. Souvent, la même règle d'autorisation existe à deux endroits : dans la logique du contrôle d'entrée, et dans les policies des données. "Le rôle gérant peut gérer le staff" peut être écrit une fois côté entrée, une fois côté filet.

C'est une duplication. Et la première intuition d'un développeur, c'est de la supprimer — un seul endroit, une seule vérité. Mais ici, supprimer la redondance, ce serait supprimer un des deux étages. On revient au point de défaillance unique.

Le bon arbitrage n'est pas "zéro duplication". C'est **redondance contrôlée** : on accepte que la règle existe à deux endroits, et on **arme un test qui échoue si les deux divergent**. Le test devient le gardien de la cohérence. La duplication ne fait plus peur, parce qu'une dérive entre les deux étages casse la CI avant de casser la prod.

C'est un schéma qu'on retrouve partout dès qu'on fait de la défense en profondeur : on rend la redondance **vérifiable** plutôt que de chercher à l'éliminer. Une convention "les deux doivent rester synchronisés" qui n'est pas testée est déjà morte — elle dérivera au premier oubli.

## Ce qu'il faut retenir

- Un seul point de contrôle est un seul point de défaillance. La sécurité d'accès sérieuse a deux étages.
- L'ACL en entrée protège l'**action**, elle se prend tôt, c'est un prérequis. Le filet protège la **donnée**, il est tendu quel que soit le chemin.
- Un acteur privilégié contourne le filet. Donc tout chemin privilégié *doit* avoir une ACL explicite : c'est là qu'il n'y a pas de seconde chance.
- La même règle aux deux étages, c'est une redondance. On la rend vérifiable par un test plutôt que de la supprimer.

La sécurité ne tient pas parce qu'un mur est parfait. Elle tient parce que quand un mur cède, il y en a un autre derrière, et qu'on a un test qui hurle quand ils ne disent plus la même chose.
