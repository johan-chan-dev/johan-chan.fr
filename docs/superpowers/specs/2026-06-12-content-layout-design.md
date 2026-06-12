# Canonical content layout (reading rail + breakout) — design

> One layout for all long-form content (articles, series detail, projects detail): a full-bleed
> **cover** with title/excerpt overlaid, an optimised **reading rail** for all text, an **explicit
> breakout** for wide visuals (demos, charts), and a full-width **bottom nav**. Generalises the article
> reader built in the hero-overlay slice into a reusable system.

## Principle (settled during brainstorming)

- **One reading rail for text.** Every piece of text — the cover's title/excerpt/meta, the body prose,
  captions, the series chapter list — sits in a centred **~680px** column. Readability is constant
  across the page and across content types.
- **Breakout is explicit, opt-in, for visuals only.** A block exceeds the rail *only* when the author
  marks it `class="bleed"`. Nothing widens automatically — including the framework showcase and the
  chart. One breakout width: the **content container (~968px)**, the same width the cover and bottom-nav
  already use. (YAGNI: no separate full-viewport bleed for now.)

## The reading-rail grid (core mechanism)

The prose body container becomes a full-bleed grid. **It must span the full content width (~968px), not
680** — the 680 rail comes from the grid's centre track, and the side tracks are what let `.bleed`
expand:

```css
.atl-prose {
  display: grid;
  grid-template-columns: 1fr min(680px, 100%) 1fr;
}
.atl-prose > *      { grid-column: 2; min-width: 0; }   /* default: on the rail */
.atl-prose > .bleed { grid-column: 1 / -1; }            /* opt-in: full content width */
```

Astro's MDX `<Content/>` renders its top-level nodes as direct children of `.atl-prose`, so paragraphs,
headings, lists, and code blocks land on the rail, while a `.bleed` child spans the container. The
existing `.atl-prose > p { margin: 0 0 18px }` keeps working (grid items still take vertical margins).

**Migration:** today the article body is wrapped in `mx-auto max-w-[680px]`. That wrapper is removed —
`.atl-prose` itself sits at the full content width and the grid provides the 680 rail. The back-link and
the hero's overlaid text stay as simple `mx-auto max-w-[680px]` blocks (they're not the prose grid).

## Author API

- A block goes wide only when marked `bleed`: `<FrameworkShowcase class="bleed" />`,
  `<BubbleChart class="bleed" />`, or `<div class="bleed">…</div>` for a raw wide image/table.
- **Content components forward `class`** onto their root element so `bleed` reaches the grid child:
  - `FrameworkShowcase` (root `.atl-showcase`), `BubbleChart` (root `.atl-bubblechart` figure),
    `Callout` (root `.atl-callout`). Each adds an optional `class` prop appended to its root class list.
  - `Demo` is internal to the showcase (always inside it) — no change.
- The two current wide usages get `class="bleed"` added — an intentional edit, not magic: the
  `<FrameworkShowcase>` in `reactivite-trois-frameworks` and the `<BubbleChart>` in
  `boring-languages-win` (FR + EN).

## Shared hero — `ContentHero.astro`

Generalise `ArticleHero` into `ContentHero` so series and projects reuse it:

- Props: `image?: ImageMetadata`, `imageFocus?`, `title`, `excerpt?`, and `kicker` + `meta` **slots**
  (content varies per type).
- **With image:** full-bleed banner (`min-height: 480px`, `object-cover` background + the dark gradient),
  with the kicker/title/excerpt/meta overlaid on the **rail** (`mx-auto max-w-[680px]`), light text +
  shadow, `justify-end`.
- **Without image:** a narrow header on the rail (kicker, title, excerpt, meta) — no banner.
- Per content type the page maps its data into the slots:
  - **Article:** kicker = series breadcrumb (link) or register label; meta = date · reading time · tags.
  - **Series:** image = the series `cover.webp`; kicker = `SÉRIE`; excerpt = `description`; meta = chapter
    count · date range.
  - **Project:** image = project cover (if present); kicker = year · role; excerpt = `oneliner`; meta =
    stack.

`ArticleHero.astro` is replaced by `ContentHero.astro`; the article readers are updated to use it.

## Page composition (per content type)

Each content page uses `PageLayout` at **default (wide)** width and lays out four zones:

1. **back-link** — `mx-auto max-w-[680px]` (on the rail).
2. **`<ContentHero …/>`** — full-bleed banner, or the no-image header.
3. **reading body** — article/project: `.atl-prose` (full-width grid) wrapping `<Content/>`; series: the
   chapter list, `mx-auto max-w-[680px]` (text → rail, no breakout needed).
4. **bottom nav** — full content width (~968px): prev/next + related for articles; none yet for
   series/projects.

The semantic `<article>` wrapper and `data-pagefind-body` (around hero + body) are preserved.

> A shared `ReadingLayout.astro` that scaffolds these four zones around slots is optional — included only
> if the duplication across the six pages (article/series/project × FR/EN) proves worth the indirection.
> Default: compose the shared primitives (`ContentHero`, the rail grid, the nav pattern) per page.

## Scope

- **Articles** — already have cover + rail + nav; add the breakout grid + `bleed` on the two demos.
- **Series detail** (`/series/<slug>`, FR + EN) — adopt `ContentHero` (cover + description); chapter list
  on the rail.
- **Projects detail** (`/projets/<slug>`, FR + EN) — adopt the layout. **Forward-looking:** `/projets`
  has no content right now (the only project was removed), so it's built for when a project exists, not
  visually testable yet.
- **About** — stays bespoke (out of scope).

## Implementation slices (for the plan)

1. **Rail grid + breakout** — the `.atl-prose` grid + `.bleed`, `class` forwarding on the three
   components, and `class="bleed"` on the two existing demo usages. Articles only. Ships green.
2. **`ContentHero` + series detail** — generalise `ArticleHero` → `ContentHero`, repoint the article
   readers, and give series detail the cover + reading-rail layout.
3. **Projects detail** — apply the layout (forward-looking).

## Testing

- **e2e (smoke):** on an article with a demo, the `.bleed` block (`[data-showcase]` / `.atl-bubblechart`)
  is **wider** than a body paragraph, while body text stays at the rail width; series detail shows its
  cover hero + chapter list; the existing 25 tests stay green (hero image, series breadcrumb/prev-next,
  search). No horizontal overflow at desktop or mobile.
- **No unit tests** — pure layout/CSS.
- **Visual:** breakout demo wider than text; text aligned across cover/body/nav; both locales; light +
  dark themes.

## Risks / attention

- **Prose grid rhythm:** confirm `.atl-prose > p` margins and inter-block spacing read correctly as grid
  items (grid rows + margins, no doubled/again gaps).
- **Code-block overflow:** a wide `<pre>` in the fixed `min(680px,100%)` track can overflow the rail.
  Add `min-width: 0` on grid children (above) and keep the existing pre mobile fix (`w-0 min-w-full` /
  `overflow-x:auto`) so long code scrolls within the rail rather than blowing out the track.
- **`bleed` needs a full-width grid parent:** if `.atl-prose` is ever nested inside a `max-w-[680px]`
  wrapper, `.bleed` can't exceed 680. The migration (remove that wrapper) is mandatory, not optional.
- **Series cover asset:** the series `cover.webp` exists in `packages/content` but may not have been
  imported into `apps/site` — confirm/import it for the series hero, else series falls back to the
  no-image header (acceptable).
- **No-image articles:** the showcase (`reactivite-trois-frameworks`) has no cover → keeps the no-image
  header; verify the excerpt still shows there.

## Out of scope (later)

- Full-viewport (edge-to-edge) breakout; a second breakout width.
- Applying the layout to About; bespoke per-page heroes.
- Series/project bottom-nav (related series, related projects).
