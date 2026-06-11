# Navigable journal — Slice 2: the lens switcher — design

> Slice 2 of the navigable journal (parent design: `2026-06-11-navigable-journal-design.md`).
> Replaces the wireframe-era `JournalFilters` on `/journal` with a **lens switcher** — the control
> through which the visitor chooses a navigation strategy — and lands the Temps **series collapsing**
> + **year headers** deferred from Slice 1. Client-side, instant, URL-synced; crawlers only see Temps.

## Decisions to confirm (recommendations baked in)

These refine the parent design where Slice-2 specifics were open. Flagged ⚑ — tell me if you want any flipped before I plan.

- ⚑ **Search box deferred to Slice 3.** The parent design shows search "alongside" the lenses, but
  search has no engine until Slice 3 (Pagefind). Building a dead input now is misleading. Slice 2 ships
  the lens switcher without a search field; the field arrives wired in Slice 3.
- ⚑ **"Série" is a link to `/series`, not a client lens.** `/series` already does the job better
  (dedicated, ordered, crawlable). A Série lens would duplicate it. So the switcher is **Temps ·
  Registre · Thème**, with a **"Séries →"** link to the existing index. (Supersedes "Série" as a 4th lens.)
- ⚑ **One lens at a time — no register∩tag intersection.** The current `JournalFilters` lets you
  combine a register *and* tags simultaneously. The approved control (mockup A) is "one lens active at
  a time." So Registre and Thème are mutually exclusive: picking a register clears any tag, and vice
  versa. (Simplifies current behavior; loses combined filtering, judged not worth keeping at this scale.)
- ⚑ **Thème = one active tag** (not the current multi-select). One tag per lens state → a clean,
  shareable `?tag=craft` URL and a simpler control. (Simplifies current multi-tag picker.)

## Lens model

The switcher row on `/journal`: **`Parcourir : Temps · Registre · Thème`** + a right-aligned
**`Séries →`** link. Exactly one lens is active; Temps is the default.

- **Temps** (default, canonical): reverse-chronological feed with **year headers**. Series are
  **collapsed** to a single entry (a `SeriesRow`) positioned at the series' most-recent chapter date;
  individual chapter rows are hidden. Standalone articles show as normal rows.
- **Registre**: pick `refl` / `design` / `impl`. Flat list (no year headers, no series collapsing) of
  **all** pieces of that register, chapters included, date-desc.
- **Thème**: pick one tag (chips). Flat list of all pieces carrying that tag, chapters included.

## DOM + mechanics (client-side, no reload)

The page renders **one** date-desc list of every piece as a `PieceRow` (chapters included), with
year-header elements interleaved, **plus** one `SeriesRow` per series injected immediately before that
series' most-recent chapter row. Each row carries data attributes: `data-kind` (register),
`data-tags`, and — on chapter rows — `data-chapter` + `data-series`; `SeriesRow` carries `data-series-row`.

A small client module (`lib/journal-lens.ts`, imported by an inline `astro:page-load` hook) toggles
visibility:

- **Temps:** show `SeriesRow`s + standalone rows + year headers; hide chapter rows. Empty year headers
  (no visible row until the next header) are hidden.
- **Registre `r`:** hide `SeriesRow`s + year headers; show rows where `data-kind === r`.
- **Thème `t`:** hide `SeriesRow`s + year headers; show rows whose `data-tags` includes `t`.

State is mutually exclusive and lives in the **URL** via the History API:

- Temps → `/journal` (no params) — the canonical, indexed form.
- Registre → `/journal?reg=<refl|design|impl>`.
- Thème → `/journal?tag=<tag>`.
- On load and on `popstate`, the module reads the params and applies the lens (so a shared link / reload
  / back-forward restores the view). Switching lenses calls `history.pushState`.
- View transitions: the hook runs on `astro:page-load` (same pattern as today's filter) so it re-binds
  after client-side swaps.

## SEO

The pages are static and the prerendered HTML **is** the Temps/canonical form — param'd states exist
only in the browser. So no server-side `noindex` is needed. We just emit a static
`<link rel="canonical" href="<site>/journal">` (EN: `/en/journal`) on the journal page; if a crawler
ever follows a `?tag=`/`?reg=` URL, it canonicalizes back to Temps. Implemented via one optional
`canonical?: string` prop on `PageLayout` → `Base`. No new routes; no sitemap (none exists).

## Data / query layer (pure, unit-tested)

Add to `content-utils.ts`:

- `type FeedItem = { kind: 'article'; article: Article } | { kind: 'series'; series: SeriesIndexEntry }`
- `journalFeed(articles: Article[]): { items: FeedItem[]; }` — the Temps render-list: all articles
  date-desc as `article` items, with a `series` item injected immediately before each series' most-recent
  chapter. (Used to drive `SeriesRow` placement.)
- `groupByYear(items)` → returns the items annotated with a `year` and a flag marking the first item of
  each year (for header rendering). Pure; operates on the date of each item (`article.date` or the
  series' latest).
- `parseLens(params: URLSearchParams): { lens: 'temps' | 'reg' | 'tag'; value?: string }` and
  `lensToParams(state)` — the URL round-trip, pure and testable.

(`seriesIndex`/`SeriesIndexEntry` from Slice 1 are reused; series' `latest` date drives placement.)

## Components

- **`LensSwitcher.astro`** (new) — replaces `JournalFilters.astro`. Renders the `Parcourir : Temps ·
  Registre · Thème` control + register chips + tag chips + the `Séries →` link + the result count. Ships
  the inline `astro:page-load` hook that wires `journal-lens.ts`. `JournalFilters.astro` is deleted.
- **`SeriesRow.astro`** (new) — the collapsed series entry for the Temps feed (title, chapter count,
  "maj <date>", link to `/series/<id>`), carrying `data-series-row` + `data-date` for ordering/headers.
- **`journal/index.astro`** + **`en/journal/index.astro`** — render the `journalFeed`/`groupByYear`
  output (PieceRows + SeriesRows + year headers) instead of the flat `list.map`, and use `LensSwitcher`.
  (Also: align the EN page onto `PageLayout` to match FR, removing the raw `Base`+`Header`+`Footer`
  composition — small consistency fix while we're here.)
- **`PieceRow.astro`** — add `data-chapter` + `data-series` attributes when the article is a chapter
  (so the lens JS can hide chapter rows in Temps).
- **`Base.astro`** — add an optional `canonical?: string` prop emitting `<link rel="canonical">`;
  threaded through `PageLayout`. Journal pages pass `/journal` (resp. `/en/journal`).

## Copy

Add `copy[lang].lens = { browse, temps, registre, theme, seriesLink }` (FR: `Parcourir`, `Temps`,
`Registre`, `Thème`, `Séries →`; EN: `Browse`, `Time`, `Register`, `Theme`, `Series →`). Reuse existing
`C.kind[...]` for register labels.

## Testing

- **Unit (vitest):** `journalFeed` (series item injected before latest chapter; standalones untouched),
  `groupByYear` (year boundaries + first-of-year flag), `parseLens`/`lensToParams` round-trip.
- **e2e (smoke):**
  - default `/journal` shows a `SeriesRow` (collapsed) and **no** chapter rows; year header present.
  - clicking Registre `refl` hides the `SeriesRow`, shows refl chapters, updates URL to `?reg=refl`.
  - clicking a Thème tag filters + sets `?tag=<t>`; a reload of `/journal?tag=<t>` restores the filtered
    view (load-time param application).
  - `Séries →` links to `/series`.
  - `<link rel="canonical" href="/journal">` present.
  - existing suite stays green (update any test that assumed the flat 16-row journal).
- `check` 0 errors; build page count unchanged (no new routes); no dev-proxy files committed.

## Out of scope (later)

- **Search** (Slice 3, Pagefind) — including the search field in the switcher.
- Register∩tag intersection; multi-tag selection.
- Localizing series titles.

## Risks / attention

- **SeriesRow placement vs ordering:** the series collapses to its latest-chapter date; verify it sorts
  correctly among standalone rows in Temps and that hiding chapter rows doesn't leave stray year headers.
- **View transitions:** the lens hook must be idempotent across `astro:page-load` (guard like today's
  filter's `window.__atlFiltersHook`).
- **EN page refactor:** moving `en/journal/index.astro` onto `PageLayout` must preserve the existing
  look; diff the rendered header/footer.
- **Behavior change:** losing combined register+tag and multi-tag is intentional (see ⚑) — call it out
  in the PR so it's not read as a regression.
