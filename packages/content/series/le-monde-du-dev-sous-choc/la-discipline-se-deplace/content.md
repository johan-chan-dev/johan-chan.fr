La discipline ne disparaît pas. Elle se déplace.

## Un travail qui n'a pas encore de nom

Février 2026, dans l'Utah. Cinquante personnes, vingt-cinq ans après le Manifeste Agile. Des gens qui ont inventé ou fait évoluer des pratiques qu'on utilise tous les jours. Ils se posent la même question que nous.

Chad Fowler formule ça simplement : si on arrête de se soucier du code, la rigueur doit aller quelque part d'autre. La discipline qu'on a construite pendant des décennies ne disparaît pas parce que l'IA écrit du code. Elle se déplace.

Ce qu'ils décrivent, c'est un travail qui n'existe pas encore dans les fiches de poste. Ni écrire du code, ni du release management. Diriger des agents, évaluer ce qu'ils produisent, doser la confiance, poser les contraintes.

Martin Fowler va plus loin. C'est le plus gros saut d'abstraction depuis l'assembleur vers les langages de haut niveau. Sauf que cette fois, on monte en abstraction, mais sans le déterminisme. On a toujours gardé le contrôle en montant. Là, c'est différent.

## La bifurcation

Kent Beck, après cinquante-deux ans de code, pose le diagnostic autrement. Le code commodity inonde le marché. Le code soigné prend de la valeur. Le milieu disparaît.

Pour Beck, écrire du code suit le même chemin que la machine à écrire. Avant l'informatique, taper un document c'était un métier. Il fallait de la technique, de la précision, pas de droit à l'erreur. On dictait, quelqu'un tapait. Puis l'ordinateur a rendu le geste tolérant à l'erreur, et tout le monde a appris à taper. Le métier a disparu, le geste est resté.

Le code suit le même chemin. L'IA rend le geste tolérant à l'erreur. Tu peux coder approximativement, elle corrige, itère, complète. Ce qui disparaît c'est la valeur du geste. Ce qui reste c'est savoir quoi écrire et pourquoi. Le jugement, la pensée systémique, le goût.

Il distingue deux pratiques. L'augmented coding : tu te soucies du code, des tests, de la complexité. Le vibe coding : tu ne te soucies que du comportement. Le craft survit dans la première, pas dans la seconde.

Son conseil : ne cherche pas à deviner quel futur on aura. Construis des capacités qui marchent dans les deux scénarios.

## Plus vieux que le software

Ce que Beck et Fowler décrivent, d'autres l'ont vu avant eux. Pas dans le dev. Dans tous les métiers où la machine remplace le geste.

Y'a un truc qu'on sait faire sans pouvoir l'expliquer. Le coup d'oeil dont on parlait plus tôt dans la série. À force de pratique, ça devient un automatisme. On sait que ça cloche, mais on saurait pas expliquer pourquoi. Comment tu formalises ça dans un prompt ?

Et quand un savoir-faire est formalisé dans un outil, celui qui l'utilisait finit par le perdre. Le tisserand a perdu le geste avec le métier à tisser. Le conducteur perd le sens de la route avec le GPS. C'est pas une disparition. C'est un savoir qui passe de standard à rare. Et pour ceux qui l'ont encore, l'outil devient une augmentation. Pour les autres, il remplace ce qu'ils n'ont jamais eu.

La question a presque deux siècles. Et on se la repose aujourd'hui dans les mêmes termes.

## Le test comme ancrage

Si le code est un sous-produit, qu'est-ce qui ancre la discipline ?

Les participants de cette réunion, dans l'Utah, ont trouvé une réponse qui surprend : le TDD.

Si les tests existent avant le code, l'agent ne peut pas tricher. Il ne peut pas écrire un test qui valide son implémentation cassée. Les tests deviennent la validation déterministe d'une génération non-déterministe.

Ça veut pas dire écrire chaque test à la main. Ça veut dire les définir, un par un, et les redéfinir au fur et à mesure qu'on comprend mieux le problème. Beck le vit au quotidien : ses agents essaient de supprimer les tests pour les faire passer. Le point important, c'est pas qui écrit le test. C'est qui décide quoi tester, et dans quel ordre. Si l'agent prépare tout d'un coup, il optimise pour le green. Si c'est toi qui canalises, test par test, tu gardes la main sur ce que le système doit faire.

Le TDD est un superpower avec les agents IA. Plusieurs praticiens présents décrivent le même basculement : tout l'effort se déplace vers la suite de tests. Le code généré devient jetable. Si les tests sont bons et que le code passe, peu importe sa forme.

## Ce qu'on risque de perdre

L'IA accélère tout. Y compris ce qu'on ne voit pas ralentir.

Margaret-Anne Storey a posé un concept en février 2026 : la dette cognitive. Pas la dette technique, inscrite dans le code. La dette cognitive, celle qu'on a dans la tête. L'écart entre le système qui grossit et ce que l'équipe comprend vraiment du système.

C'est exactement ce qu'on voit sur le terrain. L'équipe produit plus, mais si tu demandes pourquoi tel service est découpé comme ça, plus personne ne sait. Le savoir s'évapore sans que personne ne s'en rende compte.

Fowler met le doigt sur un truc précis. Ce qu'il aime dans la programmation, c'est construire des modèles mentaux, des abstractions qui aident à penser un domaine. Si les LLMs nous éloignent de ce travail, on perd la compétence la plus précieuse. Il va jusqu'à dire que les LLMs sont "des dealers : ils nous filent des trucs, mais ne se soucient ni du système ni des humains qui le développent et l'utilisent."

Rachel Laycock, CTO de Thoughtworks, résume le risque autrement. L'IA est un accélérateur de ce que t'as déjà. Si tes pratiques sont bonnes, ça amplifie. Si elles sont fragiles, le multiplicateur de vitesse devient un accélérateur de dette.

Et au milieu de tout ça, un détail qui change la perspective : le code propre, la modularité, le nommage clair, ça aide les LLMs autant que les humains. Le craft sert les deux.

---

Reste à savoir ce qu'on fait lundi matin.

---

<details>
<summary>Références</summary>

- [Thoughtworks — Reflections on the Future of Software Engineering Retreat](https://www.thoughtworks.com/en-br/insights/articles/reflections-future-software-engineering-retreat) — retreat fév 2026, "la rigueur doit aller quelque part d'autre", TDD + agents
- [Martin Fowler — Future Of Software Development](https://martinfowler.com/bliki/FutureOfSoftwareDevelopment.html) — saut d'abstraction, non-déterminisme, LLMs comme "dealers"
- [Kent Beck — Programming Deflation](https://tidyfirst.substack.com/p/programming-deflation) — code commodity, bifurcation augmented/vibe, machine à écrire
- [Kent Beck — Augmented Coding: Beyond the Vibes](https://tidyfirst.substack.com/p/augmented-coding-beyond-the-vibes) — system prompt TDD, agents qui suppriment les tests
- [Pragmatic Engineer — TDD, AI agents and coding with Kent Beck](https://newsletter.pragmaticengineer.com/p/tdd-ai-agents-and-coding-with-kent) — TDD "superpower" avec les agents
- [Margaret-Anne Storey — Cognitive Debt](https://margaretstorey.com/blog/2026/02/09/cognitive-debt/) — dette cognitive, écart entre système et compréhension
- [Rachel Laycock / The New Stack — AI Velocity Debt Accelerator](https://thenewstack.io/ai-velocity-debt-accelerator/) — accélérateur de dette
- Michael Polanyi — *The Tacit Dimension* (1966) — savoir tacite, automatisme inexplicable
- Bernard Stiegler — *La Société automatique* (2015) — perte de savoir par l'outil

</details>
