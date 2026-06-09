# Import du contenu existant (FR) + images héro + OG — design

> Récupère le **vrai contenu** de l'ancienne version (`packages/content`) dans `apps/site`, qui
> devient la **source de vérité** (import ponctuel, snapshot — pas de sync ultérieure). FR seulement
> (les traductions EN suivront dans une tranche dédiée). Ajoute les **images héro** (optimisées par
> Astro), un **head OG** minimal, et une **garde « pas de traduction »** sur le sélecteur de langue.

## Décisions actées
- `registre: refl` pour tout le contenu importé (essais réflexifs IA/craft).
- `apps/site` = source de vérité ; import **ponctuel** depuis `packages/content` ; aucune
  re-synchronisation (divergence assumée).
- Images **incluses** maintenant (optimisation native Astro `astro:assets`, pas de pipeline custom).
- EN **différé** : import FR-only + garde « masquer le sélecteur de langue si pas de sibling EN ».
  Les traductions sont la **tranche suivante** (je les rédige, relecture voix par l'auteur).

## Inventaire à importer (FR)
- **3 articles autonomes** : `10x-plus-productif-ne-veut-pas-dire-ce-que-vous-croyez`,
  `boring-languages-win`, `ce-que-augmente-veut-dire`.
- **Série `le-monde-du-dev-sous-choc`** + **12 chapitres** (orders 1–12).
- Chaque pièce a un `hero.webp` (dans son `images/`). La série a un `cover.webp` (non utilisé — pas
  de page détail série).
- Total : **15 articles + 1 entrée série**. Bodies = `content.md` (markdown réel, sans îlots).

## Schéma (`content.config.ts`)
Passer la collection `articles` à la forme fonction pour le helper `image()` :
```ts
articles = defineCollection({
  loader: glob({ pattern: '*/index*.{md,mdx}', base: './src/content/articles', generateId: … }),
  schema: ({ image }) => z.object({
    title: z.string().min(1),
    registre,
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    tags: z.array(z.string()).default([]),
    readingTime: z.number().int().positive(),
    live: z.boolean().default(false),
    series: reference('series').optional(),
    order: z.number().int().positive().optional(),
    repo: z.string().optional(),
    translationId: z.string().optional(),
    image: image().optional(),                                   // héro (ImageMetadata)
    imageFocus: z.enum(['center', 'top', 'bottom']).default('center'),
    excerpt: z.string().optional(),                              // pour OG / meta description
  }),
});
```
`series` (data file) inchangé. Les champs existants (registre, etc.) ne bougent pas — seuls
`image`/`imageFocus`/`excerpt` sont ajoutés (optionnels → les entrées sans héro restent valides).

## Import (règles de transformation)
Pour chaque pièce ancienne → `src/content/articles/<slug>/index.md` (slug = nom de dossier d'origine) :
- `title`, `date`, `tags` ← meta.json (verbatim) ; `excerpt` ← meta.json.
- `registre: refl` (constant).
- `readingTime` ← **calculé** depuis `content.md` (≈ mots / 250, min 1), écrit en dur dans le frontmatter.
- chapitres : `series: le-monde-du-dev-sous-choc` + `order` ← meta.json.
- `image: ./images/hero.webp` + `imageFocus` ← meta.json ; **copier** le `hero.webp` dans
  `src/content/articles/<slug>/images/`.
- corps = `content.md` **verbatim** (apostrophes typographiques préservées).
- Entrée série dans `series.json` : `{ id: 'le-monde-du-dev-sous-choc', title: 'Le monde du dev sous
  choc', description: <série meta.description> }`.
- Apostrophes : le contenu ancien utilise des apostrophes ASCII par endroits — **normaliser en `’`**
  (U+2019) dans les corps + frontmatter au passage (cohérence éditoriale).

## Images héro + OG
- **Article reader** (`journal/[slug].astro` + son miroir `en/`) : si `article.image`, rendre un
  bloc héro `<Image src={article.image} … />` (d'`astro:assets`), `object-position` piloté par
  `imageFocus`, dans le conteneur héro 16:9 du design. Astro optimise au build (resize, webp/avif,
  hash, srcset).
- **OG / SEO** : ajouter un head minimal dans `Base.astro` (ou un partiel `Seo.astro`) — props
  `description` + `ogImage`. Émet `og:title`, `og:description` (excerpt), `og:image` (URL **absolue**
  = `site` + src optimisé via `getImage()`), `og:type=article`, `twitter:card=summary_large_image`.
  Les pages détail passent excerpt + héro ; les autres pages un défaut.
- Le feed/les cartes restent **sans vignette** (design text-forward inchangé) — l'image vit sur le
  détail + l'OG.

## Garde « pas de traduction »
- `LangSwitch.astro` reçoit `hasTranslation: boolean` (défaut `true`). Si `false`, ne rend rien.
- Les pages **détail** (`journal/[slug]`, `projets/[slug]`, FR + EN) calculent l'existence du sibling
  EN/FR et passent le booléen via `Header` → `LangSwitch`. Helper : `hasTranslation(slug, lang, 'articles')`
  dans `content.ts` (existe-t-il `<slug>/en` resp. `<slug>` ?).
- Pages chrome (home/about/listes) : `hasTranslation` reste `true` (chrome bilingue).
- Conséquence : sur les 15 articles importés (FR-only), le sélecteur est masqué ; sur le showcase
  bilingue conservé, il s'affiche.

## Couche requête / view-model
- `Article` (content-utils) gagne `image?: ImageMetadata` (import **type-only** d'`astro`) + `excerpt?: string` + `imageFocus`.
- `toArticle` mappe `entry.data.image`/`imageFocus`/`excerpt`.
- Nouveau `hasTranslation(slug, lang, collection)` dans `content.ts` (async, `getEntry`).

## Nettoyage wireframe
- **Supprimer** : `articles/{editeur-code-navigateur-zero-dependance, invalider-cache-par-evenements,
  animations-60fps-timeline, versionner-ses-decisions, artisanat-ere-autocompletion}` (FR **et**
  `index.en.*`), le projet `projects/atelier-wasm` (+ `index.en.mdx`), et l'entrée `atelier-wasm` de
  `series.json`.
- **Conserver** : `articles/reactivite-trois-frameworks` (showcase multi-framework réel, bilingue) +
  ses fichiers de démo. `Proof.astro` reste (utilisé par le hero home).
- `/projets` (+ `/en/projets`) devient **vide** → « Rien ici pour l'instant » (aucun projet réel ;
  le design gère `n === 0`).

## Tests
- Build : **~16–17 pages FR** journal (15 importés + showcase) + détails + chrome ; nombre exact
  documenté au plan. Les 15 héros optimisés émis (formats/hash).
- e2e (smoke) : la liste journal affiche ≥15 articles ; un article importé (`boring-languages-win`)
  rend titre + corps + **héro `<img>`** ; le **sélecteur de langue est absent** sur un article
  FR-only ; il reste présent sur le showcase bilingue ; un chapitre de série affiche la ligne
  « fil · Le monde du dev sous choc, chap. N ».
- `check` 0 erreur ; `--frozen-lockfile` (aucune dépendance ajoutée — `image()`/`<Image>` sont
  natifs Astro).

## Risques / points d'attention
- **OG image absolue** : `getImage()` donne un chemin build ; préfixer par `site` pour une URL
  absolue valable en partage social. À vérifier au build (head correct).
- **Volume d'images** : 15 héros optimisés → temps de build accru (sharp). Acceptable.
- **Bodies réels longs** : markdown réel (shiki pour les blocs code) — vérifier le rendu (titres,
  listes, code) via la page article.
- **Apostrophes** : normaliser ASCII → `’` à l'import ; vérifier (le piège récurrent).
- **EN désynchronisé** : 15 articles FR-only → sélecteur masqué (garde) ; corrigé par la tranche
  traductions suivante.
- **/projets vide** : assumé (pas de projet réel) ; pas une régression.
- **Snapshot** : copies divergeront de le-cockpit (assumé — `apps/site` est la source de vérité).
- **Fichiers dev-proxy** : aucune dépendance ajoutée → pas de dance lockfile ; ne toucher
  qu'`apps/site` + `docs/`.

## Hors périmètre (tranches suivantes)
- **Traductions EN** des 15 articles (tranche immédiatement suivante ; je les rédige, relecture voix).
- Page détail de série ; vignettes héro dans le feed ; 2ᵉ projet ; métriques showcase.
