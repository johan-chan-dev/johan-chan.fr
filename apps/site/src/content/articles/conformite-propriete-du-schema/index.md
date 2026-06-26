---
title: "La conformité est une propriété du schéma"
registre: design
date: "2026-06-24"
tags: ["architecture", "conformité", "rgpd", "design"]
readingTime: 4
live: false
draft: true
image: ./images/hero.webp
imageFocus: center
excerpt: "Le droit d'accès, le droit à l'effacement, la rétention : traités après coup, en couche applicative, ils finissent par fuir. La conformité tient quand elle est inscrite dans le modèle de données lui-même."
---

« On gérera le RGPD plus tard, en couche applicative. » C'est la phrase qui condamne la conformité avant qu'elle commence. « Plus tard, à côté », ça veut dire un endroit de plus à ne pas oublier : à chaque nouvelle table, chaque nouveau chemin d'accès, chaque service ajouté.

La conformité traitée après coup fuit toujours — par structure, pas par négligence. Les grands droits qu'on doit garantir, accès, effacement, rétention, ne sont pas des fonctionnalités qu'on visse à la fin : ce sont des propriétés du modèle de données. Inscrites dans le schéma, elles tiennent.

## Pourquoi le post-traitement fuit

Un traitement de conformité « en couche applicative » repose sur la vigilance. Tu ajoutes une table de données personnelles, et il faut *penser* à l'inclure dans l'export, *penser* à l'anonymiser à l'effacement, *penser* à la purger. Rien ne t'y oblige au moment où tu crées la table.

C'est le problème de toute convention non vérifiée : invisible au moment du code, sans coût immédiat, silencieuse quand elle se dégrade. Sauf qu'ici, une fuite ne coûte pas une dette technique. Elle envoie une donnée personnelle à la mauvaise personne, ou elle détruit ce que la loi t'oblige à garder.

La conformité demande donc mieux qu'une habitude : que la garantie soit portée par la structure, là où on ne peut pas l'oublier.

## Le scope, borné par l'identité

Quand un utilisateur exerce un droit — « exporte mes données », « efface mes données » — la limite de ce qu'il touche ne doit **jamais** être un paramètre qu'il fournit. Ce doit être son **identité authentifiée**, lue au plus près de l'opération.

Compare les deux montages. Si l'opération prend en entrée « l'identifiant du client à exporter », toute la sécurité repose sur le fait que l'appelant passe le bon — et un appelant malveillant passera celui d'un autre. Si l'opération lit elle-même *qui appelle* et borne son périmètre à ça, exporter ou effacer les données d'autrui devient structurellement impossible. Le scope n'est pas vérifié après coup : il est gravé dans la définition de l'opération.

La règle générale : ne demande pas au client la donnée qui définit ses propres droits. Le périmètre d'un droit personnel se déduit de l'identité.

## Effacer n'est pas supprimer

Le droit à l'effacement n'est presque jamais un `DELETE`. C'est contre-intuitif, et c'est pourtant le cœur du sujet.

Tes obligations se contredisent en apparence. D'un côté, la personne a le droit que ses données personnelles disparaissent. De l'autre, d'autres lois t'imposent de conserver certaines traces — une facture, un justificatif comptable, un historique de transaction — pendant des années. Supprimer la ligne entière violerait la seconde obligation pour satisfaire la première.

La réponse, c'est l'**anonymisation sélective** : retirer ce qui identifie la personne (nom, contact, adresse), garder le reste, dépersonnalisé. La facture demeure, mais elle ne pointe plus vers personne. Effacer devient une opération chirurgicale sur les champs personnels.

Conçu ainsi, l'effacement s'inscrit dans le schéma : quels champs sont des données personnelles (nullifiables), quels champs sont une obligation de conservation (intouchables). Cette carte est une propriété du modèle.

## La rétention est une politique déclarée

« On garde les logs un an, les adresses dix ans » : ça ne se fait pas à la main quand on y pense. C'est une politique, et une politique se déclare et tourne toute seule.

La donnée a une durée de vie inscrite dans sa nature : telle catégorie expire après tel délai. Une purge planifiée applique la règle sans intervention humaine. La rétention devient un comportement du système, au même titre qu'une sauvegarde.

## Le fil commun

Ces trois principes disent la même chose sous trois angles : la garantie de conformité doit vivre là où on ne peut pas l'oublier — dans la définition des opérations, dans la forme des tables, dans des politiques qui s'exécutent seules. Pas dans la discipline d'une équipe ni dans une checklist de revue.

Le bon test, comme pour toute frontière : devant une exigence de conformité, demande « qu'est-ce qui *garantit* qu'elle est respectée, même quand personne n'y pense ? ». Si la réponse est « on fera attention », ce n'est pas de la conformité. C'est un risque qui attend son incident.
