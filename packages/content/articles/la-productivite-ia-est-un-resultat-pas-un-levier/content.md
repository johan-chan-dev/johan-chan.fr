<!-- DRAFT v5 — nouvel angle : la productivite est un resultat, pas un levier -->
<!-- Cible : managers, decideurs, directeurs techniques -->
<!-- Angle : mesurer la productivite comme objectif, c'est confondre la consequence avec la cause -->

La productivite n'est pas un levier. C'est un resultat.

On ne rend pas une equipe productive en mesurant sa productivite. On la rend productive en lui donnant les conditions pour comprendre ce qu'elle fait, maitriser ce qu'elle livre, et intervenir quand ca casse. La productivite suit. Ou pas. Mais c'est une consequence, pas une commande.

Avec l'IA, on fait l'inverse. On annonce le resultat d'abord — "10x plus productif" — et on s'attend a ce que la realite suive. C'est mettre la charrue avant les boeufs.

---

## Les chiffres ne suivent pas

En 2025, des chercheurs ont fait un essai controle randomise sur 16 developpeurs seniors. 246 taches, sur leurs propres projets open source. Pas un sondage. Des mesures.

Ils pensaient aller 20% plus vite. Ils allaient 19% plus lentement.

L'ecart n'est pas dans la performance. Il est dans la perception. Les developpeurs etaient convaincus d'etre plus rapides alors qu'ils etaient plus lents. Le chiffre dans leur tete ne correspondait pas au chiffre sur le chronometre.

A l'echelle macro, c'est pareil. En fevrier 2026, l'economiste Torsten Slok a resume la situation : *"AI is everywhere except in the incoming macroeconomic data."* 250 milliards de dollars investis dans l'IA en 2024. Pres de 90% des entreprises interrogees ne rapportent aucun changement mesurable.

Dans les annees 80, les ordinateurs etaient partout sauf dans les statistiques de productivite. L'economiste Robert Solow l'avait note. Il a fallu 15 ans pour que les gains se materialisent. L'IA en est peut-etre au meme stade. Mais on la vend comme si c'etait deja fait.

---

## Le goulot se deplace

En 1983, Lisanne Bainbridge a ecrit que l'automation, en supprimant les parties faciles d'une tache, rend les parties difficiles plus difficiles encore. Quarante ans plus tard, on peut verifier.

L'IA accelere la production de code. Mais ecrire et tester du code, c'est une fraction du temps de developpement. Le reste — comprendre, concevoir, relire, deployer, maintenir — ne va pas plus vite parce qu'un outil genere des lignes.

Faros AI a analyse les donnees de 10 000 developpeurs. Les PRs mergees ont augmente de 98%. Le temps de review a augmente de 91%. Les bugs par developpeur ont augmente de 9%. Au niveau de l'organisation, aucune amelioration mesurable. Les gains individuels sont absorbes par ce qui vient apres : relire, comprendre, corriger.

C'est le mecanisme classique. On accelere une etape, le goulot se deplace a la suivante. La production va plus vite, la comprehension ne suit pas.

---

## Quand la mesure devient l'objectif

L'anthropologue Marilyn Strathern l'a formule en 1997 : quand une mesure devient un objectif, elle cesse d'etre une bonne mesure.

Ca s'est deja vu. La velocite Scrum etait un outil de planification interne. Le jour ou le management l'a transformee en KPI, les equipes ont appris a gonfler les points, pas a livrer mieux. Ron Jeffries, l'un des inventeurs des story points, a fini par s'excuser publiquement.

Chez Facebook, Kent Beck a raconte le meme mecanisme avec un systeme de surveys. Utile au debut. Puis les scores ont ete integres aux evaluations de performance. Les managers ont negocie les notes. Les directeurs ont supprime des equipes sur la base des chiffres. Beck a ecrit : *"This kind of surveillance makes geeks feel less safe. Knock it off."*

Avec l'IA, le schema se repete. Le nombre de PRs mergees, les lignes generees, les tickets fermes. Des chiffres qui montent. Des dashboards qui verdissent. Et la meme question qui finit par arriver : pourquoi est-ce que rien ne s'ameliore ?

---

## Quoi regarder a la place

La prochaine fois que quelqu'un vous montre un dashboard de productivite IA, posez trois questions.

Est-ce que le taux d'incidents a bouge sur la meme periode ? Si les livraisons accelerent et les incidents aussi, le gain est illusoire.

Est-ce que l'equipe peut expliquer ce qu'elle a livre ? Si la reponse est "l'IA l'a genere, ca passait les tests", c'est du code en production que personne ne maitrise. Le jour ou ca casse, personne ne saura intervenir sans regenerer.

Est-ce que le temps de review a explose ? Si oui, la production a accelere mais la comprehension n'a pas suivi.

La productivite, ca ne se decrète pas. Ca se constate, apres coup, quand les bonnes conditions sont reunies. Confondre le resultat avec le levier, c'est le meilleur moyen de n'obtenir ni l'un ni l'autre.

<details>
<summary>Sources</summary>

- [METR — "AI on Experienced OS Dev Productivity" (2025)](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/) — essai contrôlé randomisé, 16 devs seniors, -19% avec IA
- [Fortune — "AI Productivity Paradox" (2026)](https://fortune.com/2026/02/17/ai-productivity-paradox-ceo-study-robert-solow-information-technology-age/) — Torsten Slok, 90% des entreprises sans impact mesurable
- [Bainbridge — "Ironies of Automation" (1983)](https://ckrybus.com/static/papers/Bainbridge_1983_Automatica.pdf) — l'automation rend les parties difficiles plus difficiles
- [Faros AI — "AI Productivity Paradox Report" (2025)](https://www.faros.ai/blog/ai-software-engineering) — +98% PRs, +91% review, 0 gain organisationnel
- [Ron Jeffries — "Story Points Revisited" (2019)](https://ronjeffries.com/articles/019-01ff/story-points/Index.html) — l'inventeur des story points s'excuse
- [Kent Beck + Gergely Orosz vs McKinsey (2023)](https://newsletter.pragmaticengineer.com/p/measuring-developer-productivity) — pourquoi mesurer la productivité dev détruit la collaboration

</details>
