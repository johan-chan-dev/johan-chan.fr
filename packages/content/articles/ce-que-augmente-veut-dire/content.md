Le mot "augmenté" circule beaucoup. En général, il veut dire "plus vite". Un dev augmenté, c'est un dev qui produit plus de code en moins de temps. Le dashboard monte, tout le monde est content.

C'est pas ça.

---

## Deux façons d'utiliser l'IA

Kent Beck a posé la distinction la plus nette. D'un côté, le vibe coding : tu décris ce que tu veux, l'IA génère, tu regardes si ça marche. Si ça casse, tu renvoies l'erreur à l'IA et tu espères un fix. Le code est une boîte noire. Tu ne le lis pas, tu t'en fiches tant que ça tourne.

De l'autre, ce qu'il appelle l'augmented coding : tu gardes les mêmes standards qu'à la main. Le code doit être lisible, testé, simple. Tu ne tapes plus chaque ligne, mais tu prends chaque décision. Beck le dit comme ça : *"I make more consequential programming decisions per hour, fewer boring vanilla decisions."*

La différence n'est pas dans l'outil. C'est dans ce que tu choisis de garder.

---

## D'auteur à architecte

Dans un podcast, Beck décrit l'ingénieur augmenté comme un "constraint writer". Pas quelqu'un qui produit du code, mais quelqu'un qui définit les contraintes dans lesquelles le code est produit. Les specs, les tests, les garde-fous, les limites de complexité. Le code peut être jeté et régénéré. Les contraintes, elles, sont le vrai artefact.

Kief Morris, chez Thoughtworks, formalise la même idée autrement : l'ingénieur n'est plus dans la boucle d'exécution, il est au-dessus. Il améliore le système de contraintes, pas le code lui-même.

Ce glissement est discret mais profond. Écrire du code, ta valeur est dans ce que tu produis. Définir des contraintes, ta valeur est dans ce que tu empêches.

---

## À quoi ça ressemble

Être augmenté, au quotidien, c'est passer plus de temps à écrire des tests qu'à écrire du code. Les tests sont tes contraintes. Le code, l'IA peut le générer. Les contraintes, c'est toi qui décides lesquelles comptent.

C'est aussi lire plus de code qu'on en écrit. Pas parce qu'on est lent. Parce que la review est devenue le vrai travail. L'IA génère vite. Comprendre ce qu'elle a généré et décider si c'est bon, ça prend du temps. Et c'est là que la valeur se crée.

C'est dire non plus souvent. L'IA propose des solutions qui marchent mais qui compliquent. Beck note qu'elle n'a pas de "goût" : elle étend les fonctions, réutilise des patterns problématiques, ne restructure jamais d'elle-même. Accepter sans réfléchir, c'est accumuler de la complexité.

Et c'est explorer plus largement. Simon Willison le résume bien : le gain n'est pas d'aller plus vite, c'est de pouvoir explorer des pistes qu'on n'aurait jamais eu le temps de creuser. Des prototypes en une heure pour vérifier une hypothèse. Des explorations dans des domaines qu'on connaît mal. Le temps que l'IA te libère, tu le mets pas à produire plus mais à mieux comprendre.

Mais Willison met une condition : l'IA amplifie l'expertise existante. Sans expertise, pas d'amplification. Un junior qui utilise l'IA produit du code qu'il ne comprend pas. Un senior qui utilise l'IA explore des territoires qu'il n'aurait pas atteints seul.

---

## Ce que c'est, ce qui ne l'est pas

Augmenté, ça veut dire un peu dépendant, oui. Si l'outil disparaît demain, tu sais toujours coder. Comme le vélo, ça revient. Mais ça fait mal, parce que le cerveau s'est habitué à plus facile. Et surtout, tu perds ce qui te rendait augmenté : la capacité d'explorer ce que tu connais pas. Ce que t'as appris en chemin reste. Mais les territoires que t'aurais pu découvrir, eux, disparaissent.

Ça ne veut pas dire plus productif non plus. En tout cas, pas au sens où on l'entend d'habitude. La productivité qu'on vend, c'est la vitesse : plus de code, plus de features, plus vite. Celle qui compte, c'est la diversité : plus de solutions explorées, plus de problèmes compris en profondeur, plus de chemins envisagés avant de choisir. L'IA nous rend pas directement plus rapide, mais elle peut nous pousser à aller plus loin dans nos réflexions, nos recherches. Et c'est ça qui, au bout du compte, peut nous amener à produire plus.


---

## Ce que ça change vraiment

Le plus dur, c'est pas l'outil. C'est ce que ça fait à ton identité. Si t'as toujours été "celui qui code", "le technicien qu'on appelle quand ça marche pas", l'IA vient toucher quelque chose de plus profond qu'un workflow. Elle touche qui tu es.

Augmenté, c'est pas juste un nouveau rapport à l'outil. C'est un nouveau rapport à soi. Accepter que ta valeur est pas dans le geste mais dans le jugement. Que le métier c'est pas le code, c'est le besoin auquel il répond.

Le Software Craftsmanship, le soin du code, ça disparaît pas. Tant qu'il y aura des passionnés qui veulent comprendre chaque ligne, il existera. Mais à côté, quelque chose émerge. Pas encore de nom. Une pratique qui vient après le soin du code : les contraintes, l'architecture, le problème métier. Penser le système, guider l'IA, assembler le tout. C'est pas moins artisanal. C'est un geste différent.

---

Augmenté, c'est garder le craft. Juste depuis un endroit différent.

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
