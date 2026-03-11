<!-- DRAFT — a retravailler -->
<!-- Statut : structure posee, sources collectees, pas encore ecrit dans le ton editorial -->

## La these

La productivite devrait etre la consequence d'une maitrise, pas une multiplication mecanique.

"10x plus productif" suppose que l'humain peut absorber 10x plus de debit. Que la bande passante cognitive est elastique. Qu'on peut passer de 50 a 500 sans que rien ne casse dans la tete.

Mais la bande passante humaine est un invariant biologique. 4-7 elements en simultane, que tu codes en VBA ou avec Claude Opus.

La vitesse qui vient de la maitrise est durable. Tu vas vite parce que tu comprends le terrain, tu anticipes les virages, tu sais quoi ne pas faire. La vitesse qui vient de l'automatisation est fragile. Tu vas vite parce que la machine va vite. Au premier imprevu, t'as rien.

La difference entre un pilote qui va vite parce qu'il connait le circuit et un passager dans une voiture autonome qui va vite parce que le volant tourne tout seul. Les deux vont a 200. Un seul sait pourquoi.

---

## Structure prevue

### 1. La voiture de sport

T'as toujours conduit a 50. Du jour au lendemain on te file une voiture qui fait 500. Tu fais pas 10x mieux la route. Tu fais 10x plus de degats au premier virage que tu comprends pas.

L'IA comme accelerateur : tu vas plus vite, tu comprends pas mieux la route. Le premier mur arrive plus vite aussi.

<!-- Illustrer avec METR : les devs PENSENT aller 20% plus vite, ils sont 19% plus lents. L'ecart de 39 points c'est exactement l'illusion du volant. -->


### 2. Les donnees disent le contraire

Ce qu'on croit savoir vs ce que les donnees montrent.

<!-- Sources a integrer :
- METR (2025) : RCT, 16 devs seniors, 246 taches. 19% plus lents avec IA. Pensent etre 20% plus rapides. https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/
- DORA 2024 (Google) : +25% adoption IA = -1.5% throughput, -7.2% stabilite. "Vacuum Hypothesis". https://dora.dev/research/2024/dora-report/
- Fortune/Solow (fev 2026) : 90% des CEOs disent aucun impact IA. Paradoxe de Solow 2.0. https://fortune.com/2026/02/17/ai-productivity-paradox-ceo-study-robert-solow-information-technology-age/
- CMR Berkeley (2025) : "No robust relationship between AI adoption and aggregate productivity gains." https://cmr.berkeley.edu/2025/10/seven-myths-about-ai-and-productivity-what-the-evidence-really-says/
-->


### 3. Le mecanisme : le goulot se deplace

L'IA ne supprime pas le goulot d'etranglement. Elle le deplace de la production vers la comprehension.

Le debit augmente. La bande passante humaine reste la meme. Le tuyau se remplit plus vite, le cerveau ne s'elargit pas.

<!-- Sources a integrer :
- Bainbridge (1983) : "By taking away the easy parts, automation makes the difficult parts more difficult." https://ckrybus.com/static/papers/Bainbridge_1983_Automatica.pdf
- Faros AI : +98% PR, +91% temps de review, +154% taille PR. Le bottleneck se deplace vers la review humaine. https://www.faros.ai/blog/ai-software-engineering
- GitClear : code churn x2, refactoring de 25% a <10%, copier-coller explose. Correlation Copilot : 0.98. https://www.gitclear.com/coding_on_copilot_data_shows_ais_downward_pressure_on_code_quality
- Dan North : "Mesurer la contribution individuelle d'un dev c'est comme mesurer la contribution d'un piston dans un moteur." https://dannorth.net/blog/mckinsey-review/
-->


### 4. On ne se pose pas les bonnes questions

Trois questions. Une seule est posee.

**La question qu'on pose :** "L'IA me rend combien de fois plus productif ?" Fausse question. Assume que le goulot c'est la production.

**La question qu'on devrait poser :** "Qu'est-ce que je fais de l'espace cognitif que l'IA libere ?" Le vrai levier.

**La question qu'on evite :** "Est-ce que je suis capable d'utiliser cet espace, ou est-ce que je le remplis de bruit ?" Ca depend de toi, pas de l'outil.

<!-- Goodhart's Law : "Quand une mesure devient un objectif, elle cesse d'etre une bonne mesure."
- SPACE Framework (Forsgren, Storey) : "Productivity cannot be reduced to a single dimension." https://queue.acm.org/detail.cfm?id=3454124
- Kent Beck / Gergely Orosz vs McKinsey : "What they published damages people I care about." https://newsletter.pragmaticengineer.com/p/measuring-developer-productivity
-->


### 5. Le vrai gain : 10x plus toi-meme

L'IA ne te rend pas 10x plus productif. Elle te rend 10x plus toi-meme.

Si t'es curieux, elle amplifie ta curiosite. Si t'es paresseux, elle amplifie ta paresse. Si tu cherches a comprendre, elle t'aide a comprendre plus profond. Si tu cherches juste a shipper, tu shippes plus de trucs que personne ne comprend.

C'est pas une equation. C'est un revelateur.

**Les formes du "penser mieux" :**

- **Explorer les angles** : tester 5 approches avant de choisir, pas partir sur la premiere idee
- **Confronter ses biais** : un regard exterieur permanent, un rubber duck qui repond
- **Comprendre un domaine etranger** : construire un modele mental en une conversation
- **Raisonner sur la complexite** : externaliser la memoire de travail
- **Iterer sur la pensee, pas le code** : verifier l'idee avant de la coder
- **Creativite** : combiner des choses existantes d'une maniere que personne n'avait vue

La productivite est mecanique — tu branches, ca produit, tout le monde obtient le meme effet. La maturite intellectuelle est personnelle — ca depend de ta curiosite, de ton honnetete, de ta capacite a poser les bonnes questions.

C'est pour ca qu'on vend la productivite : c'est le seul gain qui ne depend pas de qui tu es.

<!-- Sources a integrer :
- Kent Beck : "You make more consequential decisions per hour while handling fewer routine tasks." https://tidyfirst.substack.com/p/augmented-coding-beyond-the-vibes
- Simon Willison : "An over-confident pair programming assistant. Use them to augment your abilities." https://simonwillison.net/2025/Mar/11/using-llms-for-code/
- Maggie Appleton : "epistemic rubber ducks" — LLM qui aident a penser, pas a produire. https://maggieappleton.com/lm-sketchbook
- Addy Osmani : "What would become possible if implementation complexity approached zero?" https://addyo.substack.com/p/the-ai-native-software-engineer
- Thorsten Ball : "The slot machine becomes translucent and you can see its wiring." https://registerspill.thorstenball.com/p/theres-beauty-in-ai
- Appleton — Lodestone (GitHub Next) : LLM pour "think more critically, not by writing for them."
-->


### 6. Chute

<!-- A trouver. Court. Pas de lecon. Pas de conseil. Juste la question qui reste. -->

<details>
<summary>Sources</summary>

**L'illusion de vitesse**
- [METR — essai contrôlé randomisé (2025)](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/) — 16 devs seniors, -19% avec IA
- [DORA Report 2024 (Google)](https://dora.dev/research/2024/dora-report/) — +25% adoption IA, -7,2% stabilité
- [Fortune — "AI Productivity Paradox" (2026)](https://fortune.com/2026/02/17/ai-productivity-paradox-ceo-study-robert-solow-information-technology-age/) — 90% des entreprises sans impact
- [CMR Berkeley (2025)](https://cmr.berkeley.edu/2025/10/seven-myths-about-ai-and-productivity-what-the-evidence-really-says/) — aucune corrélation robuste adoption IA / productivité

**Le mécanisme de la dette**
- [Bainbridge — "Ironies of Automation" (1983)](https://ckrybus.com/static/papers/Bainbridge_1983_Automatica.pdf) — l'automation rend les parties difficiles plus difficiles
- [GitClear (2024-2025)](https://www.gitclear.com/coding_on_copilot_data_shows_ais_downward_pressure_on_code_quality) — code churn x2, refactoring en chute
- [Faros AI (2025)](https://www.faros.ai/blog/ai-software-engineering) — +98% PRs, +91% review, 0 gain organisationnel
- [SonarSource (2025)](https://www.sonarsource.com/blog/the-inevitable-rise-of-poor-code-quality-in-ai-accelerated-codebases/) — montée inévitable de la dette dans les codebases IA
- [Stack Overflow (2026)](https://stackoverflow.blog/2026/01/23/ai-can-10x-developers-in-creating-tech-debt) — 10x... en dette technique
- [Martin Fowler (2025)](https://martinfowler.com/articles/202508-ai-thoughts.html) — réflexions sur l'IA et l'abstraction
- [Addy Osmani — "The 80% Problem"](https://addyo.substack.com/p/the-80-problem-in-agentic-coding) — le dernier 20% coûte tout

**La productivité est le mauvais cadre**
- [Dan North vs McKinsey](https://dannorth.net/blog/mckinsey-review/) — mesurer un piston dans un moteur
- [Kent Beck + Gergely Orosz vs McKinsey (2023)](https://newsletter.pragmaticengineer.com/p/measuring-developer-productivity) — la mesure individuelle détruit la collaboration
- [SPACE Framework (Forsgren, Storey)](https://queue.acm.org/detail.cfm?id=3454124) — la productivité ne se réduit pas à une dimension
- [Goodhart / Hillel Wayne](https://buttondown.com/hillelwayne/archive/goodharts-law-in-software-engineering/) — Goodhart's Law appliquée au dev

**L'IA comme outil de pensée**
- [Kent Beck — "Augmented Coding"](https://tidyfirst.substack.com/p/augmented-coding-beyond-the-vibes) — plus de décisions conséquentes par heure
- [Simon Willison (2025)](https://simonwillison.net/2025/Mar/11/using-llms-for-code/) — assistant de pair-programming surconfiant
- [Maggie Appleton — "LM Sketchbook"](https://maggieappleton.com/lm-sketchbook) — LLM pour penser, pas pour produire
- [Addy Osmani — "AI-Native Engineer"](https://addyo.substack.com/p/the-ai-native-software-engineer) — et si la complexité d'implémentation tendait vers zéro ?
- [Thorsten Ball](https://registerspill.thorstenball.com/p/theres-beauty-in-ai) — la beauté dans l'IA
- [HappiHacking — "AI Rubber Ducking"](https://www.happihacking.com/blog/posts/2025/ai_duck/) — le rubber duck qui répond

</details>
