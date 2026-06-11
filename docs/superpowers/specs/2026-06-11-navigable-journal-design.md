# Navigable journal (graph-informed) — design

> Turn `/journal` into a **browse hub** navigated through switchable **lenses**, and promote
> **series** to first-class **content pages**. The content is a knowledge graph; the views are its
> projections; the visitor chooses the traversal. Crawlers only ever see the chronological surface
> plus real content nodes. Purely a client-side findability concern — the static build and small
> payload are not the bottleneck; navigation is.

## Decisions locked (during brainstorming)

- **Graph-informed navigation, not a rendered graph.** No literal node-link canvas. The graph is the
  information architecture; navigation is via projections + edge-links. The appeal is the *strategy*,
  and the **visitor chooses** which lens to navigate by.
- **One browse hub** (`/journal`) with a **lens switcher**: `Temps` (default) · `Registre` · `Thème`
  · `Série`, plus search. Lens switching is **instant, client-side** (no reload).
- **Series are first-class content** with their own crawlable pages (`/series`, `/series/<slug>`).
- **Crawlers use the Temps lens only.** Filter/lens permutations have no crawl value (thin/duplicate
  subsets of the feed). Crawl surface = Temps feed + article pages + series pages.
- **`Temps` is the default** (chronological publication feed). There is **no "Tout"** lens — it
  describes nothing about *how* you navigate; Temps already is the everything-in-order view.
- **Series collapse in the Temps feed** (one entry per series, at its most-recent chapter's date).
- **Search = Pagefind**, sequenced as the **last/standalone slice**.
- **Series titles stay FR-only** in the EN views for now (localizing series is out of scope).

## IA model — projections of one graph

- **Nodes:** articles, series, tags. **Edges:** article→series (membership, ordered via `order`),
  article→tags (many-to-many), article↔article (derived "related" from shared tags + series),
  article→register.
- **Views are projections:** the feed is the time-ordered projection; a series page is the subgraph
  of one series ordered by `order`; a tag view is the subgraph of one tag; an article page is a node
  with its edges surfaced as links.

## Routes

| Route | Status | Crawl / sitemap |
|---|---|---|
| `/journal` | changed — lens control + search | ✅ Temps view is canonical |
| `/journal/[slug]` | changed — edge affordances | ✅ |
| `/series` | **new** — series index | ✅ |
| `/series/[slug]` | **new** — series detail (ordered chapters) | ✅ |
| `/en/journal`, `/en/journal/[slug]`, `/en/series`, `/en/series/[slug]` | mirrors | ✅ |
| lens/filter states (`?reg=`, `?tag=`) | client-side, history-synced | ❌ `canonical → /journal`, `noindex`, absent from sitemap |

`sitemap.xml` gains `/series` and each `/series/<slug>` (both locales). No per-tag or per-register
static pages are generated.

## The lens control (`/journal`)

A switcher row — `Parcourir : Temps · Registre · Thème · Série` — with a search affordance alongside.

- **Temps** (default): reverse-chron feed with **year headers** for orientation. Series appear
  **collapsed** (see below); standalone articles appear as rows (date · register dot · title · tags).
- **Registre**: filter to `refl` / `design` / `impl`. This is today's register filter, restyled into
  the switcher.
- **Thème**: tag chips (from `allTags`); selecting one client-filters the list and syncs the URL to
  `?tag=<tag>` (shareable). A chip can be deselected to return to all.
- **Série**: the feed grouped by series; each group links to its `/series/<slug>` page.
- **Mechanics:** the page renders **all** piece rows (chapters included) plus per-series collapse
  markers; lenses are pure client-side show/hide/group over that DOM — no network round-trip. `Temps`
  collapses each series to one entry and hides its individual chapter rows; `Registre` and `Thème`
  filter across **all** pieces (so a chapter tagged `#craft` surfaces individually under that tag);
  `Série` groups by series. Lens/tag state lives in the URL via the History API
  (`pushState`/`popstate`) so a state is shareable and survives reload, while `Temps` (no params) is
  the canonical/indexed form.
- **Mobile-first (~360px):** the switcher is a horizontal-scroll row; tag chips wrap; search expands
  from an icon. One lens active at a time (no facet intersection) keeps it legible on small screens.

## Series as first-class

- **Temps collapsing:** a series renders as a **single** entry (title + chapter count + "maj
  <date>"), positioned at its **most-recent chapter's date**, so an ongoing series resurfaces as it
  updates. Individual chapters are **not** loose rows in Temps. The per-chapter view lives on the
  series page and under the Série lens.
- **`/series` (index):** each series as a card — title, description, chapter count, date range —
  linking to its detail page.
- **`/series/[slug]` (detail):** the series description + the **ordered chapter list** (1→N) as the
  reading path; each chapter links to its article. This is the curated, indexed landing page.

## Edge affordances on an article page

Let the reader follow graph edges without returning to a list:

- The existing "fil · *series*, chap N" line becomes a **link** to `/series/<slug>`.
- **Prev / next chapter** within the series (when the article belongs to one).
- **Tag chips** linking into the Thème lens (`/journal?tag=<tag>`).
- **Related / "à lire ensuite":** a short list derived from shared tags + series via the existing
  `relatedArticles` helper.

## Search (final slice)

- **Pagefind** — indexes the built HTML at build time, ships a chunked index + WASM that
  **lazy-loads only on first search**, scales to thousands with negligible page-weight cost. Wired
  into the search affordance on `/journal`.
- Added as a build step on `apps/site` (post-build index over `dist`). It is the one piece with a new
  dependency and is fully separable, hence sequenced last.

## Data / query layer

Reuse existing pure helpers in `content-utils.ts`: `byDateDesc`, `allTags`, `relatedArticles`,
`articlesBySlugs`, `localeOf`, `slugOf`. Add (pure, unit-testable):

- `seriesWithChapters(seriesId, lang)` → `{ series, chapters: Article[] }` ordered by `order`.
- `groupBySeries(articles)` → standalone articles + one entry per series (with latest date).
- `groupByYear(articles)` → ordered year buckets for the Temps headers.
- A small **lens-state module** (`lib/lens.ts`): parse lens/tag from `URLSearchParams`, apply the
  filter to a list, and serialize back to the URL. Keeps all logic out of components and testable.

`content.ts` gains `getSeries(lang)` (index) and `getSeriesEntry(slug, lang)` (detail + chapters),
built on `getArticles`.

## SEO / i18n

- Lens/filter states: emit `<link rel="canonical" href="/journal">` + `<meta name="robots"
  content="noindex">` when any lens param is present; never listed in the sitemap.
- Sitemap += series index + each series detail, per locale.
- Series titles/descriptions stay FR in the EN views for now (`series.json` is single-language);
  localizing series is a later slice.

## Testing

- **Unit (vitest):** `seriesWithChapters`, `groupBySeries`, `groupByYear`, and the lens-state
  parse/apply/serialize round-trip.
- **e2e (smoke):**
  - lens switch reshapes the feed (Temps → Registre hides non-matching rows; Thème chip filters);
  - selecting a tag updates the URL to `?tag=…` and a reload restores the filtered state;
  - `/series` lists the series; `/series/<slug>` shows the ordered chapter list (1→N);
  - in Temps, the series shows as a single collapsed entry (not N chapter rows);
  - an article links to its series, shows prev/next, tag chips, and a related list.
  - (Search e2e ships with the search slice.)
- `check` 0 errors; no dev-proxy files committed.

## Implementation sequence (three independent slices)

1. **Series first-class** — `/series` + `/series/<slug>` (both locales), Temps collapsing,
   `seriesWithChapters`/`groupBySeries`, linked series breadcrumb + prev/next on articles. Structural,
   no new deps; biggest "navigate easily" payoff. Leaves the suite green.
2. **Lens switcher** — the `/journal` control (Temps/Registre/Thème), `groupByYear`, the lens-state
   module + URL sync, tag chips, related affordances, canonical/noindex for lens states.
3. **Search** — Pagefind index + the search UI.

Each slice ships on its own branch → PR → CI → merge.

## Risks / attention

- **History-API sync + view transitions:** lens state must re-apply on `astro:page-load` /
  `astro:after-swap` (the site uses the `ClientRouter`), like the existing journal filter. Test a
  back/forward + reload cycle.
- **Collapsed-series date:** Temps orders by each item's date; a collapsed series needs a derived
  "latest chapter date" so it sorts correctly and resurfaces on update.
- **Tag normalization:** tags are free-form strings with mixed case in `meta.json` (e.g. `ia` vs
  `IA`). The Thème lens should match case-insensitively / normalize for grouping.
- **Series in two locales:** the EN series page reuses FR series title (accepted). The chapter list on
  the EN series page links to EN chapter articles.
- **noindex correctness:** verify the canonical/noindex only fires for param'd states, never for bare
  `/journal`.

## Out of scope (later)

- Localizing series titles/descriptions.
- Facet **intersection** (register AND tag at once) — one lens at a time for now.
- A rendered/visual graph map.
- A second project; showcase metrics.
