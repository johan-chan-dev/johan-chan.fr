# Content layout — Slice 3: projects detail — design

> Final slice of the canonical content layout (parent: `2026-06-12-content-layout-design.md`). Brings
> **projects detail** (`/projets/<slug>`) onto the same `ContentHero` + reading-rail + breakout +
> full-width nav template the article and series pages now use, and gives projects a real **cover**
> (folder-based `image()`), replacing today's striped placeholder.
>
> **Forward-looking:** `/projets` has **no content** right now (the only project was removed), so this
> slice produces no rendered detail pages and can't be exercised by the normal e2e. It readies the
> template + schema for when a project lands. See **Testing** for how it's validated.

## Today

`projets/[slug].astro` (FR + EN) is a bespoke case-study layout at `width="reading"` (680): back-link +
`PROJET` badge, name, oneliner, a bordered rôle/année/stack strip, a **striped placeholder** box ("visuel
du projet" — projects have no image field), the MDX `<Content/>`, and a related-articles block ("ce qui a
aidé"). `getStaticPaths` maps `getProjects(lang)` → empty, so zero pages build.

## Schema — give projects a cover

The `projects` collection uses the **folder-based glob loader**, so the `image()` schema helper works
exactly as it does for articles. Switch the schema to the function form and add:
```ts
schema: ({ image }) => z.object({
  // …existing: name, year, role, oneliner, stack, demo, relatedArticles, translationId…
  image: image().optional(),
  imageFocus: z.enum(['center', 'top', 'bottom']).default('center'),
}),
```
A project cover lives in its folder (`src/content/projects/<slug>/images/cover.webp`, referenced as
`image: ./images/cover.webp` in `meta`/frontmatter). `Project` (content-utils) gains `image?:
ImageMetadata` + `imageFocus?`; `toProject` (content.ts) maps them.

## Page composition (FR + EN) — the canonical template

Mirror the article reader. `PageLayout` at **default (wide)** width; `<article class="atl-rise …">`:

1. **back-link** (`← les projets`) on the rail (`mx-auto max-w-[680px]`).
2. **`<ContentHero image={project.image} imageFocus={…} title={project.name} excerpt={project.oneliner}>`**
   with:
   - `kicker` slot: the `PROJET` badge label (`C.projects.badge`).
   - `meta` slot: `{project.year} · {project.role}` followed by the stack as tags
     (`{project.stack.map(s => <span>{s}</span>)}`) — same shape as article meta (date · reading · tags).
   - No image → `ContentHero`'s no-image header (badge, name, oneliner, meta) — replaces the striped
     placeholder.
3. **reading body** — `.atl-prose` (full-width grid → breakout works) wrapping `<Content/>`, so a case
   study can `class="bleed"` a demo/chart just like an article.
4. **related articles** ("ce qui a aidé") at **full content width** (~968px), matching the article
   related block. `whatHelped` + `whatHelpedSub` copy retained.

The bordered rôle/année/stack strip and the striped placeholder are removed (their data moves into the
hero kicker/meta). `data-pagefind-body` wraps the hero + prose (consistent with articles), so project
case studies become searchable when they exist.

## Scope

In: `projets/[slug].astro` + `en/projets/[slug].astro` refactor; projects schema `image`/`imageFocus`;
`Project` type + `toProject` mapping. Out: the `/projets` index (its empty-state is unchanged); a
projects bottom-nav beyond related; demo-embed wiring (a project's MDX uses the same bleed components as
articles — no new work).

## Testing

- **No e2e in this slice** — with no project content, `getStaticPaths` yields nothing, so there's no
  page to load. The existing `/projets` empty-state test stays green; the existing 28 tests are
  unaffected (no article/series change).
- **Build + check** must stay green: the refactored page module type-checks, the schema change compiles,
  and the build still produces the `/projets` index with **0 detail pages** (45 total pages unchanged).
- **Validation by throwaway sample** (during implementation, not committed): create a minimal
  `src/content/projects/_sample/index.mdx` + a `cover.webp`, build + screenshot `/projets/_sample` to
  confirm the cover hero, breakout, and related render, then **delete the sample** before committing.
  This validates the template without committing fake content. When a real project lands later, add its
  e2e then.

## Risks / attention

- **Untestable in CI** — the slice ships without an e2e for the page itself; the throwaway-sample check
  is the only visual validation. Flag in the PR that it's forward-looking.
- **Schema function form** — switching `projects` to `({ image }) => …` must keep every existing field
  (name/year/role/oneliner/stack/demo/relatedArticles/translationId) intact; a dropped field would only
  surface when a project exists. Diff carefully.
- **`relatedArticles` references** — a future project's `relatedArticles` must point at real article
  slugs (validated by the collection at build); none exist to break now.
- **Stack length in the hero meta** — a long stack could crowd the meta line; acceptable, and tunable
  when real content shows the real lengths.

## Out of scope (later)

- A real project (content) — separate, content-authoring work.
- Projects index cards using the cover; project↔project nav.
