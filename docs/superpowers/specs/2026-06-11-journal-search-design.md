# Navigable journal — Slice 3: search (Pagefind) — design

> Final slice of the navigable journal (parent: `2026-06-11-navigable-journal-design.md`). Adds a
> **client-side search** to the journal — the one navigation tool that keeps working as the journal
> grows fast — powered by **Pagefind**: a build-time static index that lazy-loads only when someone
> searches. Search supersedes the active lens; clearing it returns to the lens.

## Why Pagefind

It indexes the **built HTML** after the build, ships a chunked index + small WASM runtime that loads
**only on first keystroke**, auto-creates a **per-language** index (FR/EN from `<html lang>`), and adds
~nothing to page weight until used. Right fit for a static, bilingual, fast-growing journal.

## Decisions to confirm (⚑ — recommendations baked in)

- ⚑ **Custom UI via the Pagefind JS API**, not the bundled `pagefind-ui` widget. The default widget
  ships its own look; a small custom input + results panel matches the atelier design. (More control,
  a little more code.)
- ⚑ **Index articles only.** Mark the article body with `data-pagefind-body`; since *any*
  `data-pagefind-body` on the site makes Pagefind skip pages without it, the journal list / home /
  about / series pages are auto-excluded (no thin/duplicate index entries). Series chapters are
  articles, so they're searchable individually.
- ⚑ **e2e runs against a built preview.** Search only exists after `pagefind` runs on `dist/`, so the
  Playwright `webServer` switches from `astro dev` to **build + pagefind + `astro preview`**. This makes
  the whole suite production-faithful; cost is one build (~30–40s) per local run start
  (`reuseExistingServer` avoids rebuilds on reuse). (Alternative: keep dev + verify search manually —
  not recommended, leaves search untested.)

## Build pipeline

`apps/site` `build` script becomes:
```json
"build": "astro build && pagefind --site dist"
```
Pagefind scans `dist/`, emits `dist/pagefind/` (index chunks + `pagefind.js` + WASM). The deploy
(`turbo run build --filter=@johan-chan/site`) picks this up unchanged — the post-build step is inside
the package's own `build`. **New dependency:** `pagefind` (devDependency) → requires the lockfile dance
(commit a clean lockfile with **0** dev-proxy `link:` refs, exactly as the `sharp` addition did).

## Indexing

In `journal/[slug].astro` + `en/journal/[slug].astro`, wrap the **title-through-prose** region in
`data-pagefind-body` so Pagefind indexes the article title + body but **not** the back-link, prev/next,
or "related" cruft. Pagefind uses the first `<h1>` in the body as the result title; the article `<h1>`
already sits in that region. (No `pagefind-ui`, so no meta tagging needed beyond the title for v1.)

## Search UI (in `LensSwitcher`)

A search input added to the lens row (left of / alongside `Parcourir`). Behavior, in a new client
module `lib/journal-search.ts` (loaded by the switcher's `<script>`, idempotent on `astro:page-load`):

- On input (debounced ~200 ms): **empty** → hide the results panel, show `[data-feed]` + the active
  lens. **Non-empty** → lazy `import()` the Pagefind runtime **once**, run `search(term)`, render
  results into a results panel, and hide the feed.
- **Results panel:** a list under the switcher — each result a link to the article (`result.url`) with
  its **title** + a Pagefind-generated **excerpt** (match highlighted). "No results" message when empty.
- Search **supersedes** the lens: while a query is present the lens buttons are inert/visually muted;
  clearing the input restores the previous lens view. The lens module and search module coordinate via
  the shared `[data-feed]` visibility (search hides it; lens shows it).
- **Index path respects the base:** import from `` `${import.meta.env.BASE_URL}pagefind/pagefind.js` ``
  so it resolves under a GitHub-Pages base path as well as the custom-domain root.
- **Graceful degrade in dev:** `astro dev` has no `dist/pagefind/`, so the dynamic import 404s — wrap it
  in try/catch; on failure the input shows a quiet "search needs a build" state and does nothing. (e2e
  runs against the built preview, so it exercises the real index.)

## Copy

Add `copy[lang].search = { placeholder, noResults }` (FR: `Rechercher…`, `Aucun résultat`; EN:
`Search…`, `No results`).

## Testing

- **e2e (smoke, against the built preview):**
  - typing a known term (e.g. `Python`, which appears in `boring-languages-win`) shows a results panel
    containing that article's title; the feed is hidden.
  - clicking a result navigates to the article.
  - clearing the input restores the feed (a `[data-series-row]` visible again under Temps).
  - `/pagefind/pagefind.js` is served (200) on the preview build.
  - the existing 22 tests stay green under the preview server.
- **No new unit tests** — the search module is thin glue over Pagefind (an external lib), verified via
  e2e per the project's integration-first testing convention.
- `check` 0 errors; build emits `dist/pagefind/`; lockfile clean of dev-proxy refs.

## Out of scope (later)

- Faceted search (filter results by register/tag); search analytics; a dedicated `/search` page;
  indexing series-index/project pages; keyboard-shortcut launcher.

## Risks / attention

- **New dependency → lockfile dance.** Same discipline as `sharp`: stash the 4 dev-proxy files, install
  `pagefind`, commit a lockfile with 0 dev-proxy refs, restore the dev-proxy files.
- **Base path & result URLs.** Pagefind records `result.url` relative to the indexed `dist/`. Under a
  base-path deploy the links may need the base prepended; verify against a `BASE_PATH`-built preview and,
  if needed, prefix `result.url` with `import.meta.env.BASE_URL`. (Root/custom-domain deploy is fine.)
- **e2e wall-clock.** Switching the webServer to a build+preview adds a one-time build per run; confirm
  the existing 22 tests still pass against the static preview (they're behavioral, so they should).
- **Pagefind CLI in CI.** The `pagefind` npm package fetches a platform binary on install; the Ubuntu CI
  runner gets the linux build. The deploy's `turbo build` runs the package `build` (now incl. pagefind)
  — confirm the GitHub Pages artifact contains `pagefind/`.
- **Pagefind API version.** Confirm the v1 API at implementation (`import('/pagefind/pagefind.js')` →
  `await pf.search(q)` → `result.data()` → `{ url, excerpt, meta }`); pin a known-good `pagefind` version.
