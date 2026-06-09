# Contenu EN + routes i18n (`apps/site`) — design

> Tranche i18n reportée du socle modèle de contenu. Réactive le **contenu anglais** et les **routes
> de contenu EN** (`/en/journal*`, `/en/projets*`) retirées sous « FR d'abord ». Approche retenue :
> **fichiers de locale frères** (`index.en.mdx` à côté de `index.mdx`), slugs stables.

## Principe

- Le corps EN d'une entrée est un **fichier frère** dans le même dossier : `articles/<slug>/index.en.mdx`
  à côté de `articles/<slug>/index.mdx`. Les deux langues **partagent les fichiers de démo colocalisés**
  (`./counter.svelte`, etc.) — seule la prose diffère.
- **Slugs stables** entre locales : FR et EN partagent le slug de queue. Le sélecteur de langue est donc
  un simple basculement de préfixe `/en` (`getSiblingLocalePath` existant fonctionne tel quel). Le
  dossier partagé **est** le lien de traduction → le champ `translationId` reste inutilisé.
- `lang` est **dérivé de l'id d'entrée** (pas de champ `lang` au schéma) : id terminant par `/en` = EN.

## Périmètre

**Dans la tranche :**
- `content.config.ts` : élargir le glob + `generateId` pour capter `index.en.{md,mdx}` (articles + projets).
- Couche requête `content.ts` rendue **locale-aware** (paramètre `lang`).
- **Réactiver les 4 routes de contenu EN** (`pages/en/journal/{index,[slug]}.astro`,
  `pages/en/projets/{index,[slug]}.astro`).
- Mettre à jour les routes **FR** pour passer `'fr'` à la couche requête.
- **Restaurer la nav locale-aware** dans `Header.astro` + `MobileNav.astro` (les liens Journal/Projets
  redeviennent `${base}/journal`, `${base}/projets`).
- **Contenu EN** : un `index.en.mdx` pour les 6 articles + 1 projet (traductions).
- Tests smoke : couverture des routes EN + bascule de langue depuis un article.

**Hors périmètre :**
- Gestion gracieuse d'un article **sans** traduction EN (le sélecteur de langue pointerait vers un 404).
  Hors périmètre car on traduit **tout** le contenu actuel ; voir §Risques.
- 2ᵉ projet, vrais visuels/images, métriques showcase.

## Schéma + chargement (fichiers frères)

`apps/site/src/content.config.ts` — pour **articles** et **projects**, remplacer :
```ts
loader: glob({
  pattern: '*/index*.{md,mdx}',                 // capte index.mdx ET index.en.mdx
  base: './src/content/<articles|projects>',
  generateId: ({ entry }) =>
    entry.replace(/\/index\.en\.mdx?$/, '/en').replace(/\/index\.mdx?$/, ''),
}),
```
- `slug/index.mdx` → id `slug` (FR) ; `slug/index.en.mdx` → id `slug/en` (EN). Ids distincts, slug de
  queue identique.
- Schéma inchangé (titre/registre/date/tags/readingTime/live/series/order/repo/translationId). Chaque
  `index.en.mdx` porte son propre frontmatter (titre/tags EN, mêmes date/registre/readingTime/series).

## Couche requête (locale-aware)

`apps/site/src/lib/content-utils.ts` — ajouter deux helpers purs (testables) :
```ts
export type Lang = 'fr' | 'en';                 // déjà importé de i18n/ui ailleurs
export const localeOf = (id: string): 'fr' | 'en' => (id.endsWith('/en') ? 'en' : 'fr');
export const slugOf = (id: string): string => id.replace(/\/en$/, '');
```
Les fonctions pures existantes (`byDateDesc`, `allTags`, `relatedArticles`, `articlesBySlugs`)
restent inchangées — elles opèrent sur le tableau déjà filtré par locale.

`apps/site/src/lib/content.ts` — rendre les wrappers locale-aware :
- `getArticles(lang)` : `getCollection('articles')` → filtrer `localeOf(id) === lang` → `toArticle`
  (slug = `slugOf(entry.id)`) → `byDateDesc`.
- `getArticleEntry(slug, lang)` : `getEntry('articles', lang === 'en' ? \`${slug}/en\` : slug)` →
  `render` + `toArticle`.
- `getProjects(lang)` / `getProjectEntry(slug, lang)` : idem.
- `getSeries(id, lang?)` : les séries restent simples (data file) ; si besoin, suffixer l'id EN —
  mais pour cette tranche les séries restent **mono-langue** (titre court réutilisé), donc `getSeries`
  inchangé. Le « fil » EN affiche le même titre de série (acceptable ; localiser la série est hors
  périmètre).
- `toArticle` met `slug = slugOf(entry.id)` (sans le suffixe `/en`).

## Routes

- **Réactiver** (mirror des routes FR, `lang='en'`, `getStaticPaths` sur les entrées EN) :
  - `pages/en/journal/index.astro` — `getArticles('en')`.
  - `pages/en/journal/[slug].astro` — `getStaticPaths` = `(await getArticles('en')).map(a => ({ params:{ slug: a.slug } }))` ; `getArticleEntry(slug, 'en')`.
  - `pages/en/projets/index.astro` — `getProjects('en')`.
  - `pages/en/projets/[slug].astro` — idem projets.
- **Mettre à jour les routes FR** (`index.astro`, `journal/index.astro`, `journal/[slug].astro`,
  `projets/index.astro`, `projets/[slug].astro`, `about.astro`) pour passer `'fr'` aux nouveaux
  appels (`getArticles('fr')`, `getArticleEntry(slug, 'fr')`, etc.). EN home (`en/index.astro`) :
  `getArticles('en')` pour l'aperçu.

## Nav locale-aware (restauration)

Dans `Header.astro` et `MobileNav.astro`, les liens `work`/`journal` redeviennent locale-aware :
```ts
{ key: 'work', href: `${base}/projets`, label: c.nav.work },
{ key: 'journal', href: `${base}/journal`, label: c.nav.journal },
{ key: 'about', href: `${base}/about`, label: c.nav.about },
```
(annule le « FR-only content nav » transitoire du socle). Le logo + `LangSwitch` restent inchangés ;
la bascule de langue fonctionne via les slugs stables.

## Contenu EN (traductions)

Créer `index.en.mdx` pour chaque entrée (mêmes dossiers) :
- **Articles** (6) : `editeur-code-navigateur-zero-dependance`, `invalider-cache-par-evenements`,
  `animations-60fps-timeline`, `versionner-ses-decisions`, `artisanat-ere-autocompletion`,
  `reactivite-trois-frameworks`. Frontmatter EN (titre + tags EN), mêmes date/registre/readingTime/
  series/order/repo/live. Corps = traduction de la prose FR.
- **Projet** (1) : `atelier-wasm` — récit EN (les 4 paragraphes EN existent dans le wireframe
  d'origine ; les réutiliser).
- Les deux articles à îlots (`editeur-…` avec `<Proof/>`, `reactivite-…` avec les 4 démos) :
  l'`index.en.mdx` **importe les mêmes fichiers de démo colocalisés** (`./counter.svelte`,
  `<Proof lang="en" />`, etc.) ; seule la prose change. `<Proof>` et `<FrameworkShowcase>` sont déjà
  bilingues (prop `lang` / `data-lang`).
- Apostrophes : prose FR en `’` (U+2019) ; prose EN en `’` aussi (anglais typographique :
  `that's` → `that’s`).

## Tests

`apps/site/tests/smoke.spec.ts` — ajouter :
- `/en/journal` liste les articles EN (≥5 lignes, libellés EN).
- `/en/journal/<slug>` (p. ex. `editeur-code-navigateur-zero-dependance`) rend un titre EN + corps EN.
- Depuis un article FR, le `lang-switch` mène à `/en/journal/<même-slug>` et la page EN rend.
- La suite FR existante reste verte.
Build attendu : **~23 pages** (14 actuelles + 9 routes de contenu EN : `/en/journal`, 6 ×
`/en/journal/[slug]`, `/en/projets`, 1 × `/en/projets/[slug]`).

## Risques / points d'attention

- **Traduction manquante = sélecteur de langue cassé** : avec slugs stables, `getSiblingLocalePath`
  pointe toujours vers `/en/...` ; si un futur article n'a pas d'`index.en.mdx`, le lien 404. Cette
  tranche traduit tout → pas de cas manquant. **Convention** : tout nouvel article doit livrer son
  `index.en.mdx`, sinon ajouter plus tard un garde « masquer la bascule si pas de traduction ».
- **glob `*/index*.{md,mdx}`** : vérifier qu'il ne capte rien d'indésirable (seuls `index.mdx` et
  `index.en.mdx` existent par dossier). `generateId` doit produire des ids distincts (vérifié au build :
  collisions d'id échouent).
- **Îlots partagés** : l'`index.en.mdx` des articles à démo importe les mêmes fichiers ; vérifier que
  le build compile les deux entrées sans dupliquer/casser les îlots.
- **`series` mono-langue** : le fil EN affiche le titre de série FR (« Atelier WASM ») — acceptable
  cette tranche ; localiser la série est hors périmètre.
- **Fichiers dev-proxy** : aucune nouvelle dépendance → pas de dance lockfile ; ne toucher que
  `apps/site` + `docs/`.
