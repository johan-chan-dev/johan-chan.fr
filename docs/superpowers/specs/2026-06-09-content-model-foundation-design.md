# Socle modèle de contenu (`apps/site`) — design

> Sous-projet n°1 de la refonte « données séparées de la vue ».
> Objectif : remplacer le **fixture** `src/data/atelier.ts` (données codées en dur, calquées sur
> le prototype) par un vrai **modèle de contenu** — collections Astro typées (Zod) — pour que les
> pages se construisent **dynamiquement** à partir d'instances de contenu. Décorrélé de
> `packages/content` / le-cockpit : on repart de zéro, modèle natif Atelier.
>
> Sous-projet n°2 (séparé, plus tard) : la **vitrine multi-framework** (`FrameworkShowcase`,
> îlots, code `?raw`, type-checkers CI). Hors de ce spec.

## Principe : trois couches strictement séparées

| Couche | Où | Rôle |
|---|---|---|
| **Structure** (le « concept de donnée ») | schémas Zod dans `src/content.config.ts` | métadonnées typées : registre, date, tags, série, stack… Pilote feed / cartes / filtres / routage. |
| **Contenu** | MDX dans `src/content/`, un dossier par entrée | le corps rédactionnel. Peut importer un composant îlot + sa source `?raw`. N'apparaît jamais dans la structure ni la vue. |
| **Vue** | composants/layouts `.astro` | présentation pure. Rend la structure pour les listes, rend le corps (`<Content />`) pour le détail. Ne contient aucun contenu. |

**Couture clé : une couche requête/adaptateur** (`src/lib/content.ts`). Les vues n'importent
**jamais** `astro:content` directement ; elles consomment des fonctions typées (`getArticles()`,
`getArticle(slug)`, `getProjects()`…) qui renvoient des **view-models** normalisés (`Article`,
`Project`, `Series`). La source peut donc évoluer (collections locales aujourd'hui, loader distant
demain) sans toucher une seule vue.

## Périmètre

**Dans le sous-projet n°1 :**
- Collections `articles`, `projects`, `series` + schémas Zod (`src/content.config.ts`).
- Migration du fixture (`atelier.ts`) → entrées de contenu réelles (FR) : 5 articles, 1 projet,
  1 série. Les corps placeholder rayés (`<Ph>`) sont remplacés par de vrais corps MDX.
- Couche requête/adaptateur `src/lib/content.ts` (helpers purs + wrappers `getCollection`).
- Extraction des **chaînes d'UI** (nav, hero, footer, À propos, libellés) dans un dictionnaire
  `src/lib/copy.ts` — ce n'est **pas** du contenu. `fmtDate`, `kindLabel`, `kindClass` y vont aussi.
- Recâblage de **toutes les pages/vues FR** vers la couche requête ; rendu de `<Content />` pour
  les corps ; suppression du scaffolding placeholder (`lede`/`para2`/`<Ph>`).
- Le seul îlot existant (`<Proof />`) **migre dans le corps MDX** de l'article `impl` qui le
  montrait (preuve de bout en bout du pipeline « MDX importe un composant », sans le généraliser).
- Bloc « source » (git clone) piloté par un champ frontmatter optionnel `repo`.
- Suppression de `src/data/atelier.ts`.
- Mise à jour des tests (unitaires sur helpers purs ; e2e reste le filet de rendu).

**Hors périmètre (→ sous-projets ultérieurs) :**
- Multi-framework : intégrations React/Vue/Svelte, `Demo`/`FrameworkShowcase`, code `?raw`,
  type-checkers par framework en CI (**sous-projet n°2**).
- **Contenu EN + routes de contenu EN** (sous-projet i18n). Voir §i18n.
- Temps de lecture auto-dérivé du corps (reste un champ frontmatter explicite ici).
- Images héro réelles / pipeline `astro:assets` (placeholders ou rien pour l'instant).

## i18n : FR d'abord, EN plus tard

Décision produit : **FR d'abord, EN plus tard.** Conséquences pour ce socle :
- Le contenu est **FR uniquement** ; aucun champ `lang` par entrée.
- Les **routes de contenu** n'existent qu'en FR : `/journal`, `/journal/[slug]`, `/projets`,
  `/projets/[slug]`.
- Les **routes de chrome EN** restent (`/en/`, `/en/about`) — ce sont des pages d'interface
  alimentées par `copy` (le dictionnaire), sans contenu rédactionnel.
- Les routes de **contenu** EN actuelles (`/en/journal`, `/en/journal/[slug]`, `/en/projets`,
  `/en/projets/[slug]`) sont **supprimées** dans ce sous-projet et réintroduites quand le contenu
  EN existera (sous-projet i18n).
- **Voie d'évolution documentée (non implémentée)** : contenu EN via dossiers par locale liés par
  un champ optionnel `translationId` ; le schéma le prévoit comme champ optionnel dès maintenant
  pour éviter une migration douloureuse.

> ⚠️ **Point à valider** : la suppression des routes de **contenu** EN (pages générées au sprint
> précédent) est volontaire et cohérente avec « FR d'abord ». Si tu préfères les conserver en
> miroir du contenu FR (chrome EN autour d'articles FR), dis-le — c'est une bascule de ce choix.

## Modèle de données (collections)

`src/content.config.ts` :

```ts
import { defineCollection, reference, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

const registre = z.enum(['refl', 'design', 'impl']);

const articles = defineCollection({
  // dossier par entrée : src/content/articles/<slug>/index.mdx
  loader: glob({ pattern: '*/index.{md,mdx}', base: './src/content/articles' }),
  schema: z.object({
    title: z.string().min(1),
    registre,
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    tags: z.array(z.string()).default([]),
    readingTime: z.number().int().positive(),       // min ; auto-dérivé plus tard
    live: z.boolean().default(false),                // badge « démo live » + corps contient un îlot
    series: reference('series').optional(),          // appartenance à un fil
    order: z.number().int().positive().optional(),   // chapitre dans le fil
    repo: z.string().optional(),                     // affiche le bloc source « git clone »
    translationId: z.string().optional(),            // réservé i18n (non utilisé en FR-only)
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '*/index.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    name: z.string().min(1),
    year: z.string(),
    role: z.string(),
    oneliner: z.string(),
    stack: z.array(z.string()).default([]),
    demo: z.boolean().default(false),
    relatedArticles: z.array(reference('articles')).default([]),
    translationId: z.string().optional(),
  }),
});

const series = defineCollection({
  // données légères, pas de corps → un seul fichier
  loader: file('./src/content/series.json'),
  schema: z.object({ id: z.string(), title: z.string(), description: z.string() }),
});

export const collections = { articles, projects, series };
```

- L'**id** d'entrée = le slug (nom de dossier), via le pattern `*/index.{md,mdx}` ; le routage
  utilise `entry.id` comme slug. (Le helper de requête normalise `id` → `slug`.)
- `registre` (impl/design/refl) remplace le `kind` du fixture ; `series` + `order` remplacent
  `fil`/`filPart` ; `relatedArticles` remplace `relatedIds` (références typées, validées au build).
- La **validation Zod tourne au build** : un frontmatter invalide casse `astro build`. C'est une
  partie du « le build attrape les erreurs » offerte gratuitement.

## Structure de fichiers

```
apps/site/src/
├── content.config.ts                      (CREATE) collections + schémas
├── content/
│   ├── articles/
│   │   ├── editeur-code-navigateur-zero-dependance/index.mdx   (impl, live, série atelier-wasm #2 ; corps importe <Proof/>)
│   │   ├── invalider-cache-par-evenements/index.md             (design)
│   │   ├── animations-60fps-timeline/index.md                  (impl, live)
│   │   ├── versionner-ses-decisions/index.md                   (refl)
│   │   └── artisanat-ere-autocompletion/index.md               (refl)
│   ├── projects/
│   │   └── atelier-wasm/index.mdx                              (corps = les 4 paragraphes du récit existant)
│   └── series.json                                            ([{ id: 'atelier-wasm', title, description }])
├── lib/
│   ├── content.ts                          (CREATE) couche requête/adaptateur + view-models
│   └── copy.ts                             (CREATE) dictionnaire UI (copy, kindLabel, kindClass, fmtDate)
└── data/atelier.ts                         (DELETE)
```

## Couche requête / adaptateur (`src/lib/content.ts`)

Deux strates pour préserver la testabilité (helpers purs unitaires ; wrappers `getCollection`
couverts par build + e2e — intégration d'abord, les fonctions pures restent isolées) :

```ts
// view-models exposés aux vues (jamais CollectionEntry brut)
export interface Article {
  slug: string; title: string; registre: 'refl'|'design'|'impl';
  date: string; tags: string[]; readingTime: number; live: boolean;
  series?: string; order?: number; repo?: string;
}
export interface Project {
  slug: string; name: string; year: string; role: string; oneliner: string;
  stack: string[]; demo: boolean; relatedArticles: string[];
}
export interface Series { id: string; title: string; description: string }

// --- helpers PURS (testables en vitest, reçoivent des tableaux) ---
export function byDateDesc(a: Article[]): Article[];
export function allTags(a: Article[]): string[];                       // triés, uniques
export function relatedArticles(src: Article, all: Article[]): Article[]; // même série ou tag partagé, complété même registre, max 2

// --- wrappers async (appellent getCollection ; couverts par build/e2e) ---
export async function getArticles(): Promise<Article[]>;       // triés date desc
export async function getArticle(slug: string): Promise<{ article: Article; Content: AstroComponent }>;
export async function getProjects(): Promise<Project[]>;
export async function getProject(slug: string): Promise<{ project: Project; Content: AstroComponent }>;
export async function getSeries(id: string): Promise<Series | undefined>;
```

`getArticle`/`getProject` renvoient le **view-model** + le composant `<Content />` rendu (via
`render(entry)` d'`astro:content`). Les vues détail rendent `<Content />` à la place du
scaffolding `<Ph>`.

## Migration des données (fixture → contenu)

- Les **5 articles** : `title`, `registre` (impl/design/refl ← `kind`), `date`, `tags` (FR),
  `readingTime` (← `read`), `live`, et pour l'article WASM `series: atelier-wasm` + `order: 2`.
  Corps MDX : prose FR courte mais réelle (le plan fournira le texte exact ; pas de placeholder
  rayé). L'article `impl` `editeur-code-navigateur-zero-dependance` importe et place `<Proof />`
  dans son corps + définit `repo: 'wasm-workshop'` (bloc source).
- Le **projet** `atelier-wasm` : `name/year/role/oneliner/stack/demo`, `relatedArticles`
  (← `relatedIds` p1/p2/p4 → slugs), corps MDX = les **4 paragraphes du récit** déjà présents
  dans le fixture (contenu réel, repris tel quel).
- La **série** `atelier-wasm` : `series.json` `[{ id:'atelier-wasm', title:'Atelier WASM',
  description }]`.
- Les chaînes d'UI (`copy`, `now`, hero, footer, À propos, labels preuve) → `src/lib/copy.ts`
  **inchangées** (toujours FR+EN car le chrome EN reste). `fmtDate`/`kindLabel`/`kindClass` y vont.

## Recâblage des vues

- `pages/index.astro` : aperçu journal ← `(await getArticles()).slice(0,3)`.
- `pages/journal/index.astro` + `JournalFilters` : liste ← `getArticles()` ; tags ←
  `allTags(articles)`. Filtres client inchangés (toujours par `data-kind`/`data-tags`).
- `pages/projets/index.astro` : ← `getProjects()`.
- `pages/journal/[slug].astro` : `getStaticPaths` ← `getArticles()` ; rend `<Content />` ; « fil »
  ← `getSeries(article.series)` + `order` ; « à lire ensuite » ← `relatedArticles(...)` ; bloc
  source si `repo` ; badge live si `live`. **Plus de `<Proof/>` auto-injecté** (il vit désormais
  dans le corps de l'article concerné).
- `pages/projets/[slug].astro` : `getStaticPaths` ← `getProjects()` ; rend `<Content />` (récit) ;
  « ce qui a aidé » ← `relatedArticles` résolus depuis `project.relatedArticles`.
- `pages/about.astro` : liens « Voir : … » pointent toujours vers les slugs d'articles (inchangé).
- Chrome (`Header`/`Footer`/`MobileNav`/`Proof`/`JournalFilters`) : importe `copy`/helpers depuis
  `src/lib/copy.ts` au lieu de `data/atelier.ts`.
- **Suppression** des routes de contenu EN (`pages/en/journal/**`, `pages/en/projets/**`).
  Conservation de `pages/en/index.astro` et `pages/en/about.astro` (chrome).

## Tests & vérification

- **Unitaires (vitest)** — `tests/content.test.ts` : `byDateDesc`, `allTags` (tri/unicité),
  `relatedArticles` (≤2, exclut la source, préfère même série/tag) sur des tableaux d'`Article`
  fabriqués. Les wrappers `getCollection` ne sont pas unit-testés (runtime Astro) → couverts par
  build + e2e.
- **Schéma au build** — `astro build` valide tout frontmatter contre Zod ; une référence
  `relatedArticles`/`series` cassée échoue le build.
- **`astro check`** — types OK (les vues consomment les view-models).
- **e2e (Playwright)** — la suite smoke reste le filet de rendu : home (hero + 3 lignes), liste
  journal + filtre registre, page article (titre + corps rendu), page projet (récit + démo). À
  ajuster : retirer toute assertion sur les routes de contenu EN supprimées ; vérifier qu'un corps
  d'article réel s'affiche (plus de placeholder).
- **Build** — 21 → **13 pages** : FR `/` · `/journal` · 5 `/journal/[slug]` · `/projets` ·
  1 `/projets/[slug]` · `/about` (= 10) + chrome EN `/en/` · `/en/about` (= 2) + `/demo` (= 1).
  Les 8 routes de contenu EN (`/en/journal`×1, `/en/journal/[slug]`×5, `/en/projets`×1,
  `/en/projets/[slug]`×1) sont retirées.

## Risques / points d'attention

- **Décompte de pages EN** : la suppression des routes de contenu EN change le build ; à acter
  (cf. point à valider §i18n).
- **`reference()` + slugs** : les `relatedArticles`/`series` doivent référencer des ids existants ;
  Zod le valide au build (bon), mais la migration doit utiliser les **slugs exacts**.
- **`<Proof/>` dans le MDX** : confirme que le pipeline « MDX importe un composant `.astro`/îlot »
  fonctionne en collection (il fonctionne déjà en page) — c'est le galop d'essai du sous-projet n°2.
- **Fichiers dev-proxy** (`apps/web`, lockfile, turbo) : ne **jamais** committer ; ce sous-projet
  ne touche qu'`apps/site` + `docs/`.
