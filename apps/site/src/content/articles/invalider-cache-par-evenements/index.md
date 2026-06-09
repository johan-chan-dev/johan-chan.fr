---
title: Invalider un cache par événements, pas par TTL
registre: design
date: "2026-05-12"
tags: [Systèmes, Cache]
readingTime: 9
---
Un TTL, c’est espérer que le temps fasse le travail. Mieux vaut invalider quand
l’événement qui rend la donnée obsolète se produit — la cohérence devient une
conséquence du système, pas un pari.
