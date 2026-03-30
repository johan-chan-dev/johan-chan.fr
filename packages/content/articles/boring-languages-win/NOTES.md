# Notes — Boring languages win

## Composants chart — besoin et pistes

### Contexte

L'article utilise un diagramme 2D pour positionner des langages sur deux axes (boring/expressif × strict/permissif). Le positionnement est qualitatif, pas mesuré. Un scatter plot classique donne une fausse impression de précision. Il faut explorer d'autres formes visuelles.

### Feedback review

- Un scatter avec coordonnées précises habille du qualitatif en quantitatif → contradictoire avec la rigueur méthodologique de l'article
- TypeScript devrait être une zone ou une flèche (JS → TS), pas un point fixe
- Le quadrant "Strict mais complexe" devrait s'appeler "Strict mais coûteux" (cohérent avec "friction de base")
- Des zones floues seraient plus honnêtes et paradoxalement plus convaincantes

### Valeurs implémentées (content.svx)

```svelte
<C.ScatterChart
  xLabel="Boring → Expressif"
  yLabel="Permissif → Strict"
  quadrants={["Fiable pour l'IA", "Strict mais complexe", "Imprévisible pour l'IA", "Simple mais risqué"]}
  points={[
    { label: "Go", x: 10, y: 85 },
    { label: "Java", x: 25, y: 80 },
    { label: "C", x: 15, y: 25 },
    { label: "TypeScript", x: 40, y: 78 },
    { label: "Rust", x: 70, y: 95 },
    { label: "C#", x: 58, y: 68 },
    { label: "Python", x: 78, y: 24 },
    { label: "JavaScript", x: 68, y: 15 },
    { label: "Ruby", x: 90, y: 15 }
  ]}
/>
```

### Trois composants à évaluer

On crée les trois, on compare le rendu, on choisit celui qui convient le mieux à l'article.

#### 1. `C.ScatterChart` (déjà spécifié, implémenté)

Points précis sur deux axes. Le plus classique.

**Props :**
- `xLabel`, `yLabel` — labels des axes
- `points` — tableau `{ label, x, y, color? }` avec coordonnées 0-100
- `quadrants?` — labels des 4 quadrants
- Responsive, dark mode

**Problème :** donne une fausse impression de précision quantitative. Adapté quand les données sont mesurées, pas quand elles sont qualitatives.

#### 2. `C.BubbleChart` (à créer)

Comme le scatter, mais avec des cercles de taille et opacité variables au lieu de points. Rend le flou visible.

**Props :**
- `xLabel`, `yLabel` — labels des axes
- `bubbles` — tableau `{ label, x, y, size?, opacity? }` avec coordonnées 0-100
- `quadrants?` — labels des 4 quadrants
- `arrows?` — tableau `{ from, to }` pour montrer des mouvements (ex: JS → TS)
- Responsive, dark mode

**Exemple d'usage :**
```svelte
<C.BubbleChart
  xLabel="Boring → Expressif"
  yLabel="Permissif → Strict"
  quadrants={["Fiable pour l'IA", "Strict mais coûteux", "Imprévisible pour l'IA", "Simple mais risqué"]}
  bubbles={[
    { label: "Go", x: 10, y: 85, size: 1 },
    { label: "Java", x: 25, y: 80, size: 1 },
    { label: "C", x: 15, y: 25, size: 0.8 },
    { label: "TypeScript", x: 40, y: 78, size: 1.2 },
    { label: "Rust", x: 70, y: 95, size: 1 },
    { label: "C#", x: 58, y: 68, size: 0.8 },
    { label: "Python", x: 78, y: 24, size: 1.2 },
    { label: "JavaScript", x: 68, y: 15, size: 1 },
    { label: "Ruby", x: 90, y: 15, size: 0.7 }
  ]}
  arrows={[
    { from: "JavaScript", to: "TypeScript" }
  ]}
/>
```

**Avantage :** le cercle + opacité dit "zone approximative", pas "point exact". La flèche JS → TS montre le mouvement en temps réel.

#### 3. `C.QuadrantChart` (à créer)

Pas de coordonnées du tout. Juste 4 zones avec des labels positionnés dedans. Le plus honnête visuellement pour du qualitatif.

**Props :**
- `xLabel`, `yLabel` — labels des axes
- `quadrants` — tableau de 4 objets `{ title, items: string[] }`
- Responsive, dark mode

**Exemple d'usage :**
```svelte
<C.QuadrantChart
  xLabel="Boring → Expressif"
  yLabel="Permissif → Strict"
  quadrants={[
    { title: "Fiable pour l'IA", items: ["Go", "Java"] },
    { title: "Strict mais coûteux", items: ["Rust", "C#", "TypeScript"] },
    { title: "Simple mais risqué", items: ["C"] },
    { title: "Imprévisible pour l'IA", items: ["Python", "JavaScript", "Ruby"] }
  ]}
/>
```

**Avantage :** zéro fausse précision. Le lecteur voit des groupes, pas des positions. Adapté quand le message c'est "ces langages sont dans ce quadrant", pas "ce langage est à 70% sur l'axe X".

**Inconvénient :** perd la nuance de position relative (Go est plus boring que Java, Rust est plus strict que C#). Tout est aplati par quadrant.

### Pistes techniques (commune aux trois)

**Option 1 : LayerCake** (recommandé pour scatter et bubble)
- Lib data viz native Svelte, composable, SSR-compatible
- Scatter et bubble existants dans les exemples : https://layercake.graphics/example/Scatter
- Avantages : responsive out of the box, theming facile

**Option 2 : SVG pur** (recommandé pour quadrant, fallback pour les autres)
- Le plus léger, zéro dépendance
- Le quadrant chart est trivial en SVG pur (4 rects + labels)
- Scatter et bubble faisables aussi mais responsive + tooltips à gérer

### Recommandation

Créer les trois composants. Commencer par SVG pur pour le QuadrantChart (le plus simple). Puis évaluer LayerCake pour le BubbleChart. Comparer les trois rendus dans l'article et choisir.

Tous vivent dans `apps/web/src/lib/components/content/` côté johan-chan.fr. À créer dans une session dédiée au projet public.

---

## Diagramme : positionnement des langages

Deux axes croisés, originaux dans le contexte LLM (personne n'a formalisé ce croisement) :

- **Axe X : boring ↔ expressif** = nombre de façons idiomatiques d'exprimer le même pattern
- **Axe Y : strict ↔ permissif** = strictness du type system + compile-time safety

### Sources qui défendent les axes

**Axe X (expressivité syntaxique) :**
- PEP 20 "There should be one obvious way to do it" vs Perl TIMTOWTDI — les deux pôles philosophiques
- Felleisen 1991, "On the Expressive Power of Programming Languages" — seule formalisation académique
- RedMonk/Berkholz 2013 — mesure empirique via LOC/commit median
- Peter Hilton — "I'd rather maintain someone else's Java than someone else's Scala"
- John D. Cook — "A team using a highly expressive language needs conventions"

**Axe Y (strictness) :**
- Quadrant classique strong/weak × static/dynamic (Thinking Elixir et al.)
- PLDI 2025 ETH Zurich (arXiv:2504.09246) — type-constraining divise erreurs compilation par 2+
- GitHub Octoverse 2025 — "94% des erreurs de compilation LLM sont des erreurs de type"
- Dan Luu (contre-signal) — pour les humains, les types statiques n'ont pas d'effet fort mesurable

### Positionnement par langage

| Langage    | X (boring ↔ expressif) | Y (strict ↔ permissif) | Justification |
|------------|----------------------|----------------------|---------------|
| Go         | Très boring          | Strict               | 1 façon de faire, `gofmt`, pas de génériques longtemps, typage statique, erreurs explicites |
| Java       | Boring               | Strict               | Verbose, déclaratif, typage statique, checked exceptions. Plus expressif que Go (génériques, streams, lambdas Java 8+) |
| C          | Boring               | Permissif            | Syntaxe pauvre (peu de mots-clés), mais undefined behavior, pas de null safety, arithmétique pointeurs |
| TypeScript | Milieu               | Strict               | Types inline, mais union types, generics, conditional types, template literals. Strict au compilateur |
| Rust       | Expressif            | Très strict          | Borrow checker, lifetimes + traits, pattern matching, macros, closures, iterators. Plein de façons idiomatiques |
| C#         | Milieu-expressif     | Strict               | LINQ, async patterns, generics, extension methods. Riche mais bien encadré |
| Python     | Expressif            | Permissif            | Duck typing, list comprehensions, decorators, metaclasses, generators. Dynamic + beaucoup de chemins |
| JavaScript | Expressif            | Permissif            | Prototype chains, coercion, closures, `this` binding. Dynamic + imprévisible |
| Ruby       | Très expressif       | Permissif            | `method_missing`, monkey-patching, DSLs, blocks. Le plus de "magie" |

### Sweet spot LLM

Le quadrant haut-gauche (strict + boring) = Go, Java. C'est là que les benchmarks montrent les meilleurs résultats.

Le quadrant bas-droite (permissif + expressif) = Python, JS, Ruby. Le pire combo pour la génération IA.

Rust est un cas à part : très strict mais trop expressif. Le borrow checker est un espace de recherche supplémentaire, pas une simplification.

### Ce que ce diagramme apporte vs le quadrant classique

Le quadrant classique (static/dynamic × strong/weak) ne capture pas la dimension "nombre de façons d'écrire". Haskell est strict ET expressif. Go est strict ET boring. Cette distinction est invisible dans le quadrant classique mais déterminante pour la fiabilité LLM.

### Lecture du diagramme : deux workflows

- **One-shot (vibe coding)** → le quadrant haut-gauche gagne (boring + strict). Le LLM choisit le bon chemin du premier coup.
- **Boucle itérative (augmented coding)** → le quadrant haut-droite reprend de la valeur (expressif mais strict). Le compilateur strict agit comme oracle de correction (ex: Rust + borrow checker). C'est le choix d'Anthropic pour leur démo compilateur.

Le diagramme répond à "quel langage pour quel workflow avec l'IA", pas juste "quel langage est le meilleur".

## Sources

### Benchmarks LLM × langages
- [An Empirical Evaluation of GitHub Copilot's Code Suggestions (IEEE/ACM MSR 2022)](https://ieeexplore.ieee.org/document/9796235) — Java 57% vs JS 27%
- [Evaluating LLM-Based Test Generation Under Software Evolution (arXiv:2603.23443, mars 2026)](https://arxiv.org/html/2603.23443) — Python 6.7x vs Java en test gen
- [Type-Constrained Code Generation with Language Models (ETH Zurich, PLDI 2025)](https://arxiv.org/abs/2504.09246) — type-constraining /2 erreurs compilation
- [Why Go Is Winning the Vibe Coding Wars (WebProNews, 2025)](https://www.webpronews.com/why-go-is-winning-the-vibe-coding-wars-and-what-that-means-for-the-future-of-ai-assisted-programming/) — Go 95% one-shot
- [AutoCodeBench (arXiv:2508.09101, août 2025)](https://arxiv.org/abs/2508.09101) — benchmark multilingue 20 langages
- [Symflower DevQualityEval v1.1 (2025)](https://symflower.com/en/company/blog/2025/dev-quality-eval-v1.1-openai-gpt-4.1-nano-is-the-best-llm-for-rust-coding/) — Rust : score moyen 69%, 20% des modèles à 90%+
- [RustAssistant (arXiv:2308.05177)](https://arxiv.org/abs/2308.05177) — boucle LLM + compilateur Rust, 74% de précision

### Expressivité (axe X)
- [Felleisen 1991 — "On the Expressive Power of Programming Languages"](https://www.sciencedirect.com/science/article/pii/016764239190036W) — formalisation académique de l'expressivité
- [RedMonk/Berkholz 2013 — LOC/commit par langage](https://redmonk.com/dberkholz/2013/03/25/programming-languages-ranked-by-expressiveness/) — mesure empirique, 7.5M project-months
- [PEP 20 — The Zen of Python](https://peps.python.org/pep-0020/) — "one obvious way to do it"
- [Peter Hilton — Language expressiveness vs maintainability](https://hilton.org.uk/blog/maintenance-expressive-languages) — "I'd rather maintain someone else's Java"
- [John D. Cook — Pros and cons of expressiveness](https://www.johndcook.com/blog/2020/07/20/expressiveness/) — "A team needs conventions to compensate"

### Strictness (axe Y)
- [Quadrant type system (Thinking Elixir)](https://thinkingelixir.com/elixir-in-the-type-system-quadrant/) — strong/weak × static/dynamic
- [GitHub Octoverse 2025](https://github.blog/news-insights/octoverse/octoverse-a-new-developer-joins-github-every-second-as-ai-leads-typescript-to-1/) — TS #1, "94% des erreurs LLM sont des erreurs de type"
- [Dan Luu — Literature review on static types](https://danluu.com/empirical-pl/) — contre-signal : effet faible pour les humains
- [RunMat — Choosing Rust for LLM-Generated Code](https://runmat.com/blog/why-rust) — compilateur strict comme boucle de convergence
- [LLMLOOP (ICSME 2025)](https://valerio-terragni.github.io/assets/pdf/ravi-icsme-2025.pdf) — framework génération → compilation → correction itérative
- [AmazingCTO — Comparing Compiler Errors](https://www.amazingcto.com/developer-productivity-compiler-errors/) — qualité des messages d'erreur par langage

### Adoption / tendances
- [Meta Python Typing Survey 2025](https://engineering.fb.com/2025/12/22/developer-tools/python-typing-survey-2025-code-quality-flexibility-typing-adoption/) — 86% type hints
- [State of JavaScript 2025 (InfoQ)](https://www.infoq.com/news/2026/03/state-of-js-survey-2025/) — 40% exclusivement TS
- [InfoQ — AI Tools Creating Convenience Loops (mars 2026)](https://www.infoq.com/news/2026/03/ai-reshapes-language-choice/) — TypeScript +66% YoY

### Références intellectuelles
- [Paul Graham — "Beating the Averages" (2001)](https://paulgraham.com/avg.html) — le Blub Paradox
- [Rob Pike — "Less is exponentially more" (2012)](http://commandcenter.blogspot.com/2012/06/less-is-exponentially-more.html) — pourquoi Go a moins de features
- [Graydon Hoare — rétrospective Rust (The New Stack, 2023)](https://thenewstack.io/graydon-hoare-remembers-the-early-days-of-rust/) — "I would have traded expressivity for simplicity"
- [Dijkstra — EWD498 (1975)](https://www.cs.virginia.edu/~evans/cs655/readings/ewd498.html) — "Simplicity is prerequisite for reliability"

### Contre-signaux
- [mgks.dev — "LLMs Don't Actually Push You Toward Boring Technology" (mars 2026)](https://mgks.dev/blog/2026-03-13-llms-don-t-actually-push-you-toward-boring-technology/) — le vrai filtre serait la qualité de documentation, pas le boring
- [Security and Quality in LLM-Generated Code (arXiv:2502.01853)](https://arxiv.org/abs/2502.01853) — Python 97% taux de compilation vs Java 88% (compiler ≠ fonctionner)
