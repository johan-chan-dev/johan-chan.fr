# Content Layout — Slice 1: Reading Rail + Breakout — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the article prose a reading-rail grid where text stays at ~680px and any block opting into `class="bleed"` spans the full content width (~968px); wire the framework showcase + language chart to bleed.

**Architecture:** `.atl-prose` becomes a CSS grid (`1fr min(680px,100%) 1fr`) at the **full content width** — the rail is the centre track, `.bleed` children span all three. The prose body's `max-w-[680px]` wrapper is removed so the grid can exceed the rail. Content components forward a `class` prop to their root so authors can mark a block `bleed`. No behaviour is automatic — the two existing wide usages get `class="bleed"` explicitly.

**Tech Stack:** Astro 6, Tailwind 4 `@theme`, Playwright (smoke, run against a built preview). No new deps.

**Spec:** `docs/superpowers/specs/2026-06-12-content-layout-design.md`. **Branch:** `feat/content-layout` (spec already committed there). Slices 2 (ContentHero + series) and 3 (projects) are separate plans.

---

## File structure

- `src/styles/global.css` — **modify**: make `.atl-prose` the reading-rail grid + `.bleed` + `<pre>` overflow guard.
- `src/components/content/FrameworkShowcase.astro` — **modify**: accept + forward `class`.
- `src/components/content/BubbleChart.astro` — **modify**: accept + forward `class`.
- `src/components/Callout.astro` — **modify**: accept + forward `class`.
- `src/pages/journal/[slug].astro` + `src/pages/en/journal/[slug].astro` — **modify**: drop the prose `max-w-[680px]` wrapper (the grid now provides the rail).
- `src/content/articles/reactivite-trois-frameworks/index.mdx` + `index.en.mdx` — **modify**: `<FrameworkShowcase class="bleed">`.
- `src/content/articles/boring-languages-win/index.mdx` + `index.en.mdx` — **modify**: `<BubbleChart class="bleed" …>`.
- `tests/smoke.spec.ts` — **modify**: e2e proving a bleed block exceeds the rail while body text stays narrow.

---

### Task 1: The reading-rail grid + `.bleed` (CSS)

**Files:** Modify `src/styles/global.css`.

CSS layout isn't unit-testable; it's verified by the build here and the e2e in Task 5.

- [ ] **Step 1: Add the grid rules**

In `src/styles/global.css`, find:
```css
.atl-prose > p { margin: 0 0 18px; }
.atl-prose > p:first-child { font-weight: 500; color: var(--ink); }
```
and insert ABOVE that block:
```css
.atl-prose { display: grid; grid-template-columns: 1fr min(680px, 100%) 1fr; }
.atl-prose > * { grid-column: 2; min-width: 0; }
.atl-prose > .bleed { grid-column: 1 / -1; }
.atl-prose > pre { overflow-x: auto; }
```
(Keep the two existing `.atl-prose > p` rules as-is, after these.)

- [ ] **Step 2: Build to confirm no breakage**

Run: `pnpm --filter @johan-chan/site build`
Expected: build succeeds, 45 pages. (Visually unchanged yet — the prose is still inside a `max-w-[680px]` wrapper, so the side tracks are ~0 and all text sits at the rail. The wrapper is removed in Task 3.)

- [ ] **Step 3: Commit** (exact path; NEVER `git add -A` — dev-proxy files stay uncommitted)

```bash
git add apps/site/src/styles/global.css
git commit -m "feat(site): reading-rail grid + .bleed on .atl-prose"
```

---

### Task 2: `class` forwarding on the content components

**Files:** Modify `src/components/content/FrameworkShowcase.astro`, `src/components/content/BubbleChart.astro`, `src/components/Callout.astro`.

Astro reserves `class`; destructure it as `className` and merge with `class:list` (which drops `undefined`).

- [ ] **Step 1: `FrameworkShowcase.astro`** — replace the frontmatter + root `<div>`:

Current frontmatter is just a comment; replace the whole top through the opening `<div>`:
```astro
---
// Wraps N <Demo> children. data-mode drives focus(tabs)/compare(grid) via CSS.
// The controls bar (tabs + Comparer) is built client-side from the rendered demos.
interface Props { class?: string }
const { class: className } = Astro.props;
---
<div class:list={["atl-showcase my-7", className]} data-showcase data-mode="focus">
```
(Leave the rest of the file — the inner divs, `<noscript>`, `<script>` — unchanged.)

- [ ] **Step 2: `BubbleChart.astro`** — add `class?` to `Props`, destructure it, and merge on the root `<figure>`:

Change the `interface Props { … }` to include `class?: string` (add the line `  class?: string;` before the closing `}`), change the destructure to:
```ts
const { xLabel, yLabel, quadrants, bubbles, arrows = [], class: className } = Astro.props;
```
and change the root figure (currently `<figure class="atl-bubblechart my-7 overflow-hidden rounded-[14px] border border-line bg-surf p-3 md:p-5">`) to:
```astro
<figure class:list={["atl-bubblechart my-7 overflow-hidden rounded-[14px] border border-line bg-surf p-3 md:p-5", className]}>
```

- [ ] **Step 3: `Callout.astro`** — add `class?` and merge on the root `<aside>`:

Change `interface Props { title?: string; type?: 'note' | 'tip' | 'warning' }` to:
```ts
interface Props { title?: string; type?: 'note' | 'tip' | 'warning'; class?: string }
```
Change `const { title, type = 'note' } = Astro.props;` to:
```ts
const { title, type = 'note', class: className } = Astro.props;
```
Change the root `<aside class="atl-callout my-7 rounded-[12px] border border-line border-l-[3px] border-l-accent bg-surf px-4 py-3.5" data-testid="callout" data-type={type}>` to:
```astro
<aside class:list={["atl-callout my-7 rounded-[12px] border border-line border-l-[3px] border-l-accent bg-surf px-4 py-3.5", className]} data-testid="callout" data-type={type}>
```

- [ ] **Step 4: Type-check + build**

Run: `pnpm --filter @johan-chan/site exec astro check && pnpm --filter @johan-chan/site build`
Expected: 0 errors; 45 pages (no usage passes `class` yet, so nothing renders differently).

- [ ] **Step 5: Commit**

```bash
git add apps/site/src/components/content/FrameworkShowcase.astro apps/site/src/components/content/BubbleChart.astro apps/site/src/components/Callout.astro
git commit -m "feat(site): content components forward class for breakout"
```

---

### Task 3: Remove the prose `max-w-[680px]` wrapper (the migration)

**Files:** Modify `src/pages/journal/[slug].astro` and `src/pages/en/journal/[slug].astro`.

The grid only lets `.bleed` exceed 680 if `.atl-prose` is at the full content width. Today the prose sits in `mx-auto max-w-[680px]`; drop that so the grid provides the rail.

- [ ] **Step 1 (FR):** in `src/pages/journal/[slug].astro`, change:
```astro
      <div class="mx-auto mt-9 max-w-[680px]">
        <div class="atl-prose font-text text-[16.5px] leading-[1.7] text-ink2 md:text-[17.5px]">
```
to:
```astro
      <div class="mt-9">
        <div class="atl-prose font-text text-[16.5px] leading-[1.7] text-ink2 md:text-[17.5px]">
```

- [ ] **Step 2 (EN):** apply the identical change in `src/pages/en/journal/[slug].astro`.

- [ ] **Step 3: Build + spot-check the rail is preserved**

Run: `pnpm --filter @johan-chan/site build`
Expected: 45 pages. The prose now spans the content width but the grid centres text at ~680 — text should look unchanged (still a centred reading column), just produced by the grid instead of the wrapper. (Breakout becomes visible in Task 4.)

- [ ] **Step 4: Commit**

```bash
git add "apps/site/src/pages/journal/[slug].astro" "apps/site/src/pages/en/journal/[slug].astro"
git commit -m "feat(site): prose body spans full width so the rail grid can break out"
```

---

### Task 4: Mark the two wide usages `class="bleed"`

**Files:** Modify the FR + EN MDX of `reactivite-trois-frameworks` and `boring-languages-win`.

- [ ] **Step 1: framework showcase (FR + EN)** — in both
`src/content/articles/reactivite-trois-frameworks/index.mdx` and `…/index.en.mdx`,
change the line `<FrameworkShowcase>` to:
```mdx
<FrameworkShowcase class="bleed">
```
(The closing `</FrameworkShowcase>` is unchanged.)

- [ ] **Step 2: language chart (FR + EN)** — in both
`src/content/articles/boring-languages-win/index.mdx` and `…/index.en.mdx`,
the chart opens with `<BubbleChart` on its own line followed by attributes. Add `class="bleed"` as the first attribute, i.e. change:
```mdx
<BubbleChart
  xLabel="Boring → Expressive"
```
to:
```mdx
<BubbleChart
  class="bleed"
  xLabel="Boring → Expressive"
```
(For the FR file the `xLabel` value is `"Boring → Expressif"` — keep whatever is there; only insert the `class="bleed"` line after `<BubbleChart`.)

- [ ] **Step 3: Build + confirm the index still has 32 pages**

Run: `pnpm --filter @johan-chan/site build`
Expected: 45 pages, Pagefind "Indexed 32 pages". The showcase + chart now render wider than the prose (verified in Task 5).

- [ ] **Step 4: Commit**

```bash
git add "apps/site/src/content/articles/reactivite-trois-frameworks/index.mdx" "apps/site/src/content/articles/reactivite-trois-frameworks/index.en.mdx" "apps/site/src/content/articles/boring-languages-win/index.mdx" "apps/site/src/content/articles/boring-languages-win/index.en.mdx"
git commit -m "content(site): bleed the framework showcase + language chart"
```

---

### Task 5: e2e + final verification

**Files:** Modify `tests/smoke.spec.ts`.

- [ ] **Step 1: Add the breakout tests** — append to `tests/smoke.spec.ts`:

```ts
test('breakout: the language chart bleeds wider than the body text', async ({ page }) => {
  await page.goto('/journal/boring-languages-win');
  await page.waitForLoadState('networkidle');
  const chart = await page.locator('.atl-bubblechart').first().boundingBox();
  const para = await page.locator('.atl-prose > p').first().boundingBox();
  expect(chart!.width).toBeGreaterThan(para!.width + 80);
  // body paragraph stays at the reading rail (not stretched to the container)
  expect(para!.width).toBeLessThan(760);
});

test('breakout: the framework showcase bleeds wider than the body text', async ({ page }) => {
  await page.goto('/journal/reactivite-trois-frameworks');
  await page.waitForLoadState('networkidle');
  const show = await page.locator('[data-showcase]').boundingBox();
  const para = await page.locator('.atl-prose > p').first().boundingBox();
  expect(show!.width).toBeGreaterThan(para!.width + 80);
});
```

- [ ] **Step 2: Run the full e2e suite**

Run: `pnpm --filter @johan-chan/site test:e2e`
Expected: all pass (the existing 25 + 2 new = 27). The webServer builds + runs pagefind + previews, so the production layout is exercised. If a width assertion fails, confirm `.bleed` reached the component root (inspect the built HTML for `class="atl-bubblechart … bleed"` / `atl-showcase … bleed`).

- [ ] **Step 3: Full verification**

Run: `pnpm --filter @johan-chan/site check && pnpm --filter @johan-chan/site build`
Expected: `check` 0 errors; build 45 pages + Pagefind 32 pages.

- [ ] **Step 4: Commit**

```bash
git add apps/site/tests/smoke.spec.ts
git commit -m "test(site): e2e for reading-rail breakout"
```

---

## Verification checklist (end of slice)

- [ ] `pnpm --filter @johan-chan/site check` — 0 errors.
- [ ] `pnpm --filter @johan-chan/site test:e2e` — 27 green (incl. existing hero/series/search).
- [ ] `pnpm --filter @johan-chan/site build` — 45 pages + 32 indexed.
- [ ] Manual (desktop + mobile, light + dark): on `boring-languages-win` the chart is wider than the paragraphs and the prose still reads at ~680; the `python` code block scrolls within the rail (no page-wide overflow); on `reactivite-trois-frameworks` the showcase is wider than the prose. Same under `/en/`.
- [ ] `git diff --name-only main..HEAD` — only `apps/site/**` + `docs/**`; the 4 dev-proxy files remain uncommitted; no new dependency.
