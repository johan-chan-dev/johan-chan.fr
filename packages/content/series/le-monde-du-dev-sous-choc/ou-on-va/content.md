## L'incertitude

Personne sait. Fowler dit qu'il est trop tôt pour conclure quoi que ce soit. Beck dit de ne même pas essayer de prédire. Les gens qui ont inventé les pratiques qu'on utilise tous les jours savent pas non plus. C'est à la fois rassurant et flippant.

Alors plutôt que de deviner ce qui va se passer, j'ai regardé ce qui avait déjà changé. Chez moi. Dans ma façon de bosser.

## Ce que l'IA a changé dans ma façon de travailler

Y'a deux trucs que je vois nulle part dans les démos.

Le premier, c'est la pile de sujets. T'as forcément la tienne. Des trucs que t'as toujours voulu creuser mais que t'as jamais eu le temps de justifier. Comment fonctionne vraiment le garbage collector de V8. Pourquoi tel pattern d'event sourcing marche dans certains contextes et pas d'autres. Les invariants dans un système distribué, les vrais, pas la version simplifiée des tutos.

Avant l'IA, cette pile ne faisait que grossir. T'ajoutais des bookmarks, des onglets, des "je lirai ça ce weekend". Et tu lisais jamais, parce que pour creuser vraiment un sujet technique, faut du temps, et le temps c'est ce que t'as pas.

Maintenant je dépile. Un truc me traverse la tête pendant une review, un détail technique que j'ai toujours à moitié compris sans jamais prendre le temps de vraiment creuser. Je pose la question à l'IA. La question idiote que j'oserais pas poser à un collègue. L'IA répond, je rebondis, ça part dans une direction que j'avais pas prévue. En vingt minutes j'ai compris un truc que j'aurais mis en signet pour l'éternité.

Le deuxième truc, c'est que l'IA te renvoie ta pensée. Mais pas tout à fait.

Le rubber ducking, sauf que le canard répond. Et parfois sa réponse est à côté, et c'est exactement ça qui est utile. Le décalage te force à reformuler, à préciser ce que tu voulais vraiment dire.

Sauf que ça marche dans les deux sens. L'autre jour je bossais avec plusieurs agents en parallèle, chacun sur un sujet différent. J'ai mélangé les contextes. J'ai parlé d'un problème au mauvais agent. Et l'agent a continué comme si de rien n'était. Sans broncher. Il cherchait à implémenter une solution à un problème qui n'existait pas dans ce contexte. Avec aplomb, avec confiance, avec du code propre. Sauf que c'était faux. Et l'IA voyait rien de bizarre. C'est moi qui ai dû réaliser que quelque chose clochait.

Ce jour-là, l'IA m'a rien dit. Le doute, c'est ton boulot. Douter d'elle quand elle implémente un truc faux avec assurance. Et douter de toi, parce que c'est toi qui as mélangé au départ.

## Les disciplines qui reviennent

Cette histoire d'agents mélangés, c'est ce qui m'a ramené aux fondamentaux. Un agent, un contexte borné. Sinon ça part en vrille. Et plus je bossais avec l'IA, plus les vieilles disciplines du craft revenaient dans mon quotidien.

Le vibe coding, j'en fais. C'est de l'exploration, un brouillon. Le problème c'est pas de vibe coder. C'est de shipper du vibe code. Et c'est pas un problème nouveau : on a toujours copié/collé du Stack Overflow. La discipline c'était de comprendre ce qu'on collait avant de commit. Même réflexe, sauf que la vitesse des agents a multiplié le volume de code "pas vraiment compris".

Le TDD, d'abord. Kent Beck disait au retreat Thoughtworks que c'était un superpower avec les agents. Et c'est vrai. Si les tests existent avant le code, l'agent peut pas tricher. Il peut pas écrire un test qui valide son implémentation cassée. En pratique, je définis les tests un par un, et l'agent implémente. Le vrai garde-fou c'est la qualité de ce que tu testes, pas juste le fait que les tests existent. C'est un réflexe qui existait avant l'IA, mais l'IA l'a rendu indispensable.

Le DDD, ensuite. Les bounded contexts, le langage ubiquitaire. L'IA raisonne mieux quand le sujet est focalisé. Un contexte borné, des termes précis, des frontières nettes. Tu bornes le contexte, l'IA produit du code qui reste dans les rails. Tu laisses le contexte ouvert, elle part dans tous les sens. Et derrière, protéger le domaine du reste du code pour que ce que l'IA génère reste maintenable.

Le truc qui me frappe : ces disciplines du craft classique deviennent plus pertinentes avec l'IA. On pourrait croire que l'IA rend les contraintes inutiles. Sans contraintes, ce qu'elle produit est inutilisable à l'échelle.

## La course folle

Et puis y'a la question que je me pose vraiment. Celle qui me prend à 23h quand j'ai fermé le laptop. Est-ce que tout ça sera obsolète dans six mois ? Est-ce que l'IA saura faire le jugement elle-même ? Le DDD, le TDD, l'archi, est-ce qu'elle finira par poser les bonnes contraintes toute seule ?

J'en sais rien.

METR, un labo de recherche indépendant, a publié une étude en 2025 avec un protocole rigoureux. Seize devs seniors, 246 tâches sur leurs propres projets open source. Résultat : avec l'IA, ils allaient 19% plus lentement. Pas plus vite. Plus lentement. Et ils estimaient aller 20% plus vite. Quarante points d'écart entre ce qu'on croit et ce qui est.

Si on est aussi mauvais pour juger notre propre performance avec l'IA, on est probablement pas meilleurs pour prédire ce qui sera encore utile demain. Peut-être que les disciplines que je viens de décrire seront périmées dans un an. Peut-être que le jugement humain sera le dernier truc à tomber, ou le prochain.

La fascination quand ça marche, la trouille que ça avance trop vite pour que quoi que ce soit tienne. Les deux coexistent, tous les jours, et j'ai arrêté d'essayer de choisir.

Même si l'IA rattrape tout, j'aurai appris à penser en systèmes, à structurer un domaine, à remettre en question ce que je crois savoir. Le gain sera peut-être pas celui que j'imaginais. Mais c'est quand même un gain.

---

<details>
<summary>Références</summary>

- [METR — Measuring the Impact of Early AI on Experienced Open Source Developer Productivity](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/) — RCT, 16 devs seniors, -19% avec IA, perception +20%
- [Kent Beck — Augmented Coding: Beyond the Vibes](https://tidyfirst.substack.com/p/augmented-coding-beyond-the-vibes) — TDD "superpower" avec les agents, distinction augmented/vibe
- [Kent Beck — Programming Deflation](https://tidyfirst.substack.com/p/programming-deflation) — "don't bother predicting", bifurcation
- [Martin Fowler — Future Of Software Development](https://martinfowler.com/bliki/FutureOfSoftwareDevelopment.html) — "it's way too early", saut d'abstraction
- [Simon Willison — How I Use LLMs to Help Me Write Code](https://simonw.substack.com/p/how-i-use-llms-to-help-me-write-code) — "disrupted decades of intuition", curiosité libérée
- [Anthropic — How AI Assistance Impacts the Formation of Coding Skills](https://www.anthropic.com/research/AI-assistance-coding-skills) — questions conceptuelles vs délégation, jan 2026
- [Thoughtworks — Reflections on the Future of Software Engineering Retreat](https://www.thoughtworks.com/en-br/insights/articles/reflections-future-software-engineering-retreat) — retreat fév 2026, Fowler, Beck, Vella
- Seymour Papert — *Mindstorms* (1980) — est-ce que tu programmes l'ordinateur, ou l'ordinateur te programme ?
- Donald Schön — *The Reflective Practitioner* (1983) — back-talk, le décalage qui force à recadrer

</details>