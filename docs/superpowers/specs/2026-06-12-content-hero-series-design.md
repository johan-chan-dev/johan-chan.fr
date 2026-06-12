# Content layout — Slice 2: ContentHero + series detail — design

> Slice 2 of the canonical content layout (parent: `2026-06-12-content-layout-design.md`). Generalises
> the article-only `ArticleHero` into a reusable **`ContentHero`** (cover + overlaid title/excerpt on the
> rail, no-image fallback), repoints the article readers onto it, and gives **series detail** the same
> cover + reading-rail layout — including importing the series cover image that was never brought into
> `apps/site`.

## `ContentHero.astro` (generalise `ArticleHero`)

`ArticleHero` bakes in article-specific meta (date · reading · tags) and kicker (series breadcrumb or
register). Generalise it so series (and later projects) reuse the same visual shell:

- **Props:** `image?: ImageMetadata`, `imageFocus?: 'center'|'top'|'bottom'`, `title: string`,
  `excerpt?: string`. The variable parts — the small uppercase **kicker** line and the **meta** line —
  are **slots** (`kicker`, `meta`) the page fills.
- **With image:** the existing full-bleed banner — `min-height: 480px`, `object-cover` background + dark
  gradient, breakout `-mx`, content overlaid on the rail (`mx-auto max-w-[680px]`), light text +
  shadow. Kicker + meta render in light (`rgba(255,255,255,…)`); slot content inherits via
  `color: inherit` / `currentColor`.
- **Without image:** a narrow header on the rail — kicker (accent), title (ink), excerpt (ink2), meta
  (faint). Same slots.
- `ArticleHero.astro` is renamed to `ContentHero.astro` (git mv + edit); its current article-specific
  body moves into the page-provided slots.

**Kicker colour simplification:** the kicker no longer varies by register hue. It's **light on the
cover, accent on the no-image header** — uniform. (Only one article is image-less, so the lost
per-register tint is negligible; keeps the slot API clean.) The register dot keeps `currentColor`.

## Article readers (FR + EN) — repoint onto `ContentHero`

Replace the `ArticleHero` usage **and** the inline `{article.image ? … : <fallback>}` branch with a
single `<ContentHero image={article.image} imageFocus={…} title={article.title} excerpt={article.excerpt}>`
that provides:
- **`kicker` slot:** the series breadcrumb `<a href="/series/<id>" style="color:inherit">…</a>` when the
  article is a chapter, else the register label (`<span><span dot/> {C.kind[registre]}</span>`).
- **`meta` slot:** `date · reading time · tags`.

`ContentHero` now owns the no-image fallback, so the page no longer branches on `article.image`. The
semantic `<article>`, `data-pagefind-body`, back-link, prose grid, and bottom nav are unchanged.

## Series cover asset

The cover lives at `packages/content/series/le-monde-du-dev-sous-choc/images/cover.webp` but is not in
`apps/site`, and the `series` collection (loaded from `series.json` via `file()`) has no image field.

- **Import** the cover to `apps/site/src/assets/series/<series-id>.webp` (a new `src/assets/series/`
  dir). Convention: filename = series id.
- **Resolve** it with a build-time glob in `content.ts`:
  `import.meta.glob<{ default: ImageMetadata }>('../assets/series/*.{webp,png,jpg,jpeg}', { eager: true })`,
  matched by id. `getSeriesEntry(slug, lang)` returns `{ series, chapters, cover? }` (cover =
  `ImageMetadata | undefined`). Astro optimises the asset like any imported image.
- Rationale: avoids forcing `image()` into the JSON `file()` loader (brittle); the glob is reliable and
  keeps series covers as plain optimised assets. A series with no matching file falls back to the
  no-image header (acceptable).

## Series detail pages (FR + EN) — adopt the layout

Restructure `src/pages/series/[slug].astro` + `…/en/series/[slug].astro` to match the article shell:

- `PageLayout` at **default (wide)** width (not `width="reading"`), `description={series.description}`,
  and `ogImage` from the cover (via `getImage`, absolute URL) when present.
- `<article class="atl-rise pt-8 md:pt-10">` containing:
  1. back-link (`← les séries`) on the rail (`mx-auto max-w-[680px]`).
  2. `<ContentHero image={cover} title={series.title} excerpt={series.description}>` with
     `kicker` slot = `{C.series}` (the existing thread label) and `meta` slot =
     `{chapters.length} {C.seriesIndex.chapters} · {fmtDate(first)} → {fmtDate(last)}`.
  3. the ordered **chapter list** (`<ol>` of `chapter-link`s) on the rail (`mx-auto max-w-[680px]`).
- No bottom nav for series in this slice (out of scope: related series).

## Scope

In: `ContentHero`, article readers repointed, series cover import + resolver, series detail (FR + EN).
Out: projects detail (Slice 3), series-index cards using the cover, series bottom nav, localising the
series title/description.

## Testing

- **e2e (smoke, built preview):**
  - Article pages still render the cover hero (`article figure img`), the series breadcrumb link, and
    prev/next — the existing 27 tests stay green.
  - **New:** `/series/le-monde-du-dev-sous-choc` shows a cover hero (`figure img` inside the article)
    with the series title (h1) + description, and the ordered chapter list; same on `/en/`.
- **No unit tests** (pure layout + a thin glob resolver, covered by the page build/e2e).
- **Visual:** series detail cover banner matches the article hero (desktop + mobile, both locales); the
  no-image article (`reactivite-trois-frameworks`) still renders its fallback header with the excerpt.

## Risks / attention

- **`import.meta.glob` in `content.ts`:** the path is relative to `content.ts` (`src/lib`) →
  `../assets/series/*`. Confirm the eager glob returns `{ default: ImageMetadata }` and the id match
  works; if the cover doesn't resolve, the series silently falls back to the no-image header (visible in
  e2e: no `figure img` on the series page).
- **Slot colour inheritance:** the kicker breadcrumb link and meta must use `color: inherit` so they
  read light on the cover and accent/faint on the fallback — verify on both an image article and the
  image-less showcase article.
- **`getStaticPaths` for series detail** already exists (from Slice 1 of the journal arc); the cover
  resolver only affects the page body, not the paths.
- **Series cover focus:** `cover.webp` is 16:9; the 480px banner crops it — default `center` focus is
  fine (no `imageFocus` data for series; pass `center`).
