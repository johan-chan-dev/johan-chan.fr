<!-- DRAFT v2 — restructure : concret plus tot, anaphores cassees, Morris integre -->
<!-- Cible : devs, crafters, tech leads -->
<!-- Angle : augmente = changement de role, pas acceleration -->

Le mot "augmente" circule beaucoup. En general, il veut dire "plus vite". Un dev augmente, c'est un dev qui produit plus de code en moins de temps. Le dashboard monte, tout le monde est content.

C'est pas ca.

---

## Deux facons d'utiliser l'IA

Kent Beck a pose la distinction la plus nette. D'un cote, le vibe coding : tu decris ce que tu veux, l'IA genere, tu regardes si ca marche. Si ca casse, tu renvoies l'erreur a l'IA et tu esperes un fix. Le code est une boite noire. Tu ne le lis pas, tu t'en fiches tant que ca tourne.

De l'autre, ce qu'il appelle l'augmented coding : tu gardes les memes standards qu'a la main. Le code doit etre lisible, teste, simple. Tu ne tapes plus chaque ligne, mais tu prends chaque decision. Beck le dit comme ca : *"I make more consequential programming decisions per hour, fewer boring vanilla decisions."*

La difference n'est pas dans l'outil. C'est dans ce que tu choisis de garder.

---

## D'auteur a architecte

Dans un podcast, Beck decrit l'ingenieur augmente comme un "constraint writer". Pas quelqu'un qui produit du code, mais quelqu'un qui definit les contraintes dans lesquelles le code est produit. Les specs, les tests, les garde-fous, les limites de complexite. Le code peut etre jete et regenere. Les contraintes, elles, sont le vrai artefact.

Kief Morris, chez Thoughtworks, formalise la meme idee autrement : l'ingenieur n'est plus dans la boucle d'execution, il est au-dessus. Il ameliore le systeme de contraintes, pas le code lui-meme.

Ce glissement est discret mais profond. Ecrire du code, ta valeur est dans ce que tu produis. Definir des contraintes, ta valeur est dans ce que tu empeches.

---

## A quoi ca ressemble

Etre augmente, au quotidien, c'est passer plus de temps a ecrire des tests qu'a ecrire du code. Les tests sont tes contraintes. Le code, l'IA peut le generer. Les contraintes, c'est toi qui decides lesquelles comptent.

C'est aussi lire plus de code qu'on en ecrit. Pas parce qu'on est lent. Parce que la review est devenue le vrai travail. L'IA genere vite. Comprendre ce qu'elle a genere et decider si c'est bon, ca prend du temps. Et c'est la que la valeur se cree.

C'est dire non plus souvent. L'IA propose des solutions qui marchent mais qui compliquent. Beck note qu'elle n'a pas de "gout" : elle etend les fonctions, reutilise des patterns problematiques, ne restructure jamais d'elle-meme. Accepter sans reflechir, c'est accumuler de la complexite. Refuser le code qui marche mais qui n'est pas bon, c'est probablement le geste le plus "augmente" qui existe.

Et c'est explorer plus largement. Simon Willison le resume bien : le gain n'est pas d'aller plus vite, c'est de pouvoir lancer des projets qu'on n'aurait jamais eu le temps de justifier. Des prototypes en une heure pour verifier une hypothese. Des explorations dans des domaines qu'on connait mal. L'espace libere par l'IA n'est pas rempli de plus de code. Il est rempli de plus de curiosite.

Mais Willison met une condition : l'IA amplifie l'expertise existante. Sans expertise, pas d'amplification. Un junior qui utilise l'IA produit du code qu'il ne comprend pas. Un senior qui utilise l'IA explore des territoires qu'il n'aurait pas atteints seul.

---

## Ce que c'est, ce que c'est pas

Augmente, ca ne veut pas dire dependant. Si l'outil disparait demain, tu sais toujours coder. L'IA est un levier, pas une prothese.

Ca ne veut pas dire plus productif non plus. Parfois on va plus lentement parce qu'on explore plus. Parfois on produit moins de code parce qu'on en refuse davantage. La productivite est un resultat possible, pas l'objectif. On en a parle dans l'article sur la productivite IA.

Et surtout, augmente ca ne veut pas dire automatise. L'automatisation retire l'humain de la boucle. L'augmentation le deplace vers les decisions qui comptent. L'une pousse dehors, l'autre pousse vers le haut. La direction n'est pas la meme.

---

Augmente, c'est garder le craft. Juste depuis un endroit different.

<details>
<summary>Sources</summary>

- [Kent Beck — "Augmented Coding: Beyond the Vibes" (2025)](https://tidyfirst.substack.com/p/augmented-coding-beyond-the-vibes) — la distinction augmented/vibe, "more consequential decisions per hour"
- [Kent Beck — "Augmented Coding & Design" (2025)](https://tidyfirst.substack.com/p/augmented-coding-and-design) — l'IA n'a pas de goût, la complexité s'accumule sans supervision
- [Kent Beck — "Programming Deflation" (2025)](https://tidyfirst.substack.com/p/programming-deflation) — le code devient commodity, la valeur migre
- [O11ycast #80 — "Augmented Coding with Kent Beck" (2025)](https://www.heavybit.com/library/podcasts/o11ycast/ep-80-augmented-coding-with-kent-beck) — constraint writer, génie imprévisible
- [Simon Willison — "How I Use LLMs to Help Me Write Code" (2025)](https://simonw.substack.com/p/how-i-use-llms-to-help-me-write-code) — projets qu'on n'aurait jamais lancés, l'IA amplifie l'expertise
- [Kief Morris / Martin Fowler — "Humans and Agents in Software Engineering Loops" (2025)](https://martinfowler.com/articles/exploring-gen-ai/humans-and-agents.html) — l'ingénieur au-dessus de la boucle, le harness comme artefact
- [Kent Beck + Gergely Orosz — "TDD, AI Agents and Coding" (2025)](https://newsletter.pragmaticengineer.com/p/tdd-ai-agents-and-coding-with-kent) — TDD comme superpower avec les agents

</details>
