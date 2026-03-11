# Matériel de réflexion — Chapitre 6

**Thèse du chapitre :** L'IA tient ses promesses côté production. Mais l'outillage de validation n'a pas suivi — on a mis des décennies à construire les garde-fous autour de la faillibilité humaine (TDD, code review, CI). Les équivalents pour l'IA n'existent pas encore. C'est le vrai verrou.

---

## Sources vidéo

- Martin Fowler — *How AI will change software engineering* : https://www.youtube.com/watch?v=CQmI4XKTa0U
- Grady Booch — *The third golden age of software engineering* : https://www.youtube.com/watch?v=OfMAtaocvJw

---

## Fowler — passages clés

### Le "collaborateur douteux" — la formulation la plus directe

> "You've got to treat every slice as a PR from a rather dodgy collaborator who's very productive in the lines of code sense of productivity. But you can't trust a thing that they're doing. So, you've got to review everything very carefully when you play with the genie like that."

C'est la thèse du chapitre en une phrase : l'IA génère vite, mais le coût de vérification retombe entièrement sur le dev. Le filet de sécurité, c'est toi — qui travailles plus fort.

### Le rupture non-déterministe — pourquoi l'outillage existant ne transfère pas

> "The biggest part of it is the shift from determinism to non-determinism and suddenly you're working in an environment that's non-deterministic which completely changes things."

Et la synthèse du podcast host :

> "Our existing software engineering approaches that were based on assuming a fully deterministic system like testing, refactoring and so on, this probably won't work that well and we might need new ones unless we can make elements more deterministic."

TDD et CI ont été conçus pour des systèmes déterministes. Le output d'un LLM ne l'est pas. Le filet ne correspond plus à l'outil.

### Les tests : le problème ouvert — et les LLMs le sabotent activement

> "The testing combo — anything you put in that works you need to have a test for. [...] This is where the LLM struggles because you tell them to do the tests and I'm only hearing problems, or experiencing them myself like when the LLM tells me, 'Oh, and I ran all the tests. Everything's fine.' You got npm test: five failures."

Fowler et le host convergent : les tests sont la pratique non résolue. Et l'IA aggrave la situation en hallusinant la réussite des tests. Pas juste "pas d'outillage" — l'IA sabote l'outillage existant.

### La code review s'effondre sous le volume

> "There's a lot more code going out there, a lot more code to review. They're asking, 'How can I be vigorous at code reviews when there's just more and more of them than before?'"

La review — un garde-fou de l'ère humaine — est déjà en train de craquer. Le volume produit par l'IA dépasse la capacité du processus conçu pour la vitesse humaine.

### "Ne fais pas confiance, mais vérifie" — sans réponse sur le comment

> "In the end, even for the simplest things, you are — when you're a professional working on important stuff — you should not trust. Never. It's got to be: don't trust, but do verify."

Fowler pose la vérification comme réponse obligatoire, mais n'a rien de concret à proposer. Quand on lui demande ce qui aide à rester rigoureux, sa réponse : "Not a huge amount." L'impératif existe. L'outillage, non.

### Ce qui complique la thèse

Fowler attribue la prudence des entreprises à la tolérance au risque et à la culture, pas uniquement au manque d'outillage :

> "You have the startups which have nothing to lose. They have zero customers. They have everything to gain. [...] And of course, 50 or 70 years down the road when the founders have gone and now it's a large enterprise, you will just have different risk tolerance."

→ L'outillage manquant est *une* raison de la lenteur d'adoption — probablement la principale — mais l'inertie des grandes entreprises a des racines que l'outillage seul ne résoudra pas. Nuancer "la vraie raison" en "le verrou le plus concret".

---

## Booch — passages clés

### La vérification : un problème historique jamais résolu

> "Being able to verify that software does what it should has been a problem since the early days of software engineering."

Chaque âge d'or du software engineering a créé une nouvelle crise de vérification. La crise logicielle NATO était exactement un échec qualité/validation. L'industrie a toujours eu du mal à construire les pratiques de vérification assez vite pour suivre les gains de productivité.

### Le bottleneck nommé : la code review

(Extrait du sponsoring du podcast — editorially framed comme conséquence directe de l'argument de Booch) :

> "AI coding assistants generate code faster than we ever thought was possible. This rapid code generation has already created a massive new bottleneck at code review. We're all feeling it. All that new AI generated code must be checked for security, reliability, and maintainability."

### Les problèmes définissants du 3e âge d'or : sécurité et confiance, pas productivité

> "We have to deal with issues of safety and security. Can somebody sneak in something that I can't trust? How do I defend myself against that? It is so easy to inject something in the software supply chain."

Booch cadre le défi de l'époque actuelle comme un problème de confiance et de vérification, pas de génération. L'âge précédent a résolu "comment construire plus". L'âge actuel n'a pas résolu "comment faire confiance à ce qu'on a construit."

### Réfutation directe de Dario Amodei — le génie logiciel ne se réduit pas à la génération de code

> "Software engineers are the engineers who balance these forces. So we use code as one of our mechanisms, but it's not the only thing that drives us. None of the things that he or any of his colleagues are talking about attend to any of those decision problems that a software engineer has to deal with."

Le gap entre "génération de code" et "génie logiciel" est précisément là où l'outillage de validation devrait vivre. L'IA automatise la génération. Les problèmes de décision — "est-ce correct ? est-ce sûr ? est-ce fiable ?" — restent entièrement humains.

### La distinction jetable/durable — même coupe que Fowler sur le vibe coding

> "As long as I am choosing to build software that endures, meaning that I'm not going to build it and throw it away. If you're going to throw it away, do what you want."

L'IA convient au travail jetable. Le software d'entreprise, par définition, est du software qui doit *durer*. C'est exactement la condition dans laquelle l'absence d'outillage de validation devient le blocage.

### Ce qui complique la thèse

Booch est beaucoup plus optimiste. Il traite le manque de validation comme un *écart temporaire dans un long pattern d'écarts* — pas une crise structurelle. Chaque âge d'or précédent avait un décalage similaire.

Il ne traite pas du tout la lenteur d'adoption en entreprise. Son cadre est historique et centré sur l'identité professionnelle, pas sur l'adoption organisationnelle.

---

## Verdict pour le chapitre

**Ces vidéos enrichissent la thèse, avec une correction.**

**Ce qu'elles confirment :**
- Les gains de productivité sont réels.
- L'outillage de validation existant (TDD, code review, CI) a été conçu pour des systèmes déterministes — il ne transfère pas proprement.
- Aucun équivalent n'a émergé.

**Ce qu'elles ajoutent :**
- Les LLMs ne se contentent pas de manquer d'outillage : ils *dégradent activement les pratiques existantes* en hallusinant la réussite des tests. Plus fort que "l'outillage n'a pas suivi" — "l'outil sabote le filet."
- Booch apporte le cadrage historique : chaque âge d'or du software engineering a généré une crise de vérification. Ça rend la thèse moins alarmiste et plus solidement ancrée.

**La correction :**
Fowler nuance la causalité. Les entreprises sont lentes en partie à cause du manque d'outillage, mais aussi à cause d'une tolérance au risque structurelle. Agile a 25 ans et Fowler dit encore que c'est "a pale shadow of what we wanted" en entreprise. Éviter "la vraie raison" — préférer "le verrou le plus concret" ou "le premier verrou à faire sauter".
