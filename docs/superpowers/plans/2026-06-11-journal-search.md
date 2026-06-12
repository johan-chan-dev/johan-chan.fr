# Navigable Journal — Slice 3: Search (Pagefind) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add client-side search to the journal via **Pagefind** — a build-time static index that lazy-loads on first keystroke. A search input in `LensSwitcher` shows a results panel (hiding the feed); clearing it restores the lens view.

**Architecture:** `apps/site` `build` gains a post-build `pagefind --site dist` step that writes `dist/pagefind/`. A client module `lib/journal-search.ts` (loaded by the switcher, idempotent on `astro:page-load`) lazy-imports the Pagefind runtime, debounces queries, and renders results; it coordinates with the lens module through `[data-feed]` visibility. Article reader pages mark their title-through-prose region with `data-pagefind-body` so only articles are indexed. Search is verified against a built preview (the index only exists post-build), so the Playwright `webServer` switches to build + pagefind + `astro preview`.

**Tech Stack:** Astro 6, **Pagefind v1** (new devDependency), Vitest, Playwright. Pagefind JS API: `const pf = await import('/pagefind/pagefind.js'); const s = await pf.search(q); const d = await s.results[0].data()` → `{ url, excerpt, meta: { title } }`. CLI: `pagefind --site dist`.

**Decisions (confirmed):** custom UI via the JS API (no `pagefind-ui` widget); index articles only; e2e against a built preview.

**Working dir:** all paths under `apps/site/`. Branch: `feat/journal-search` (spec already committed there).

---

## File structure

- `apps/site/package.json` — **modify**: add `pagefind` devDependency; `build` → `astro build && pagefind --site dist`.
- `pnpm-lock.yaml` — **modify** (via the lockfile dance; must stay free of dev-proxy `link:` refs).
- `src/lib/copy.ts` — **modify**: `search` label group (FR + EN).
- `src/pages/journal/[slug].astro` + `src/pages/en/journal/[slug].astro` — **modify**: wrap title→prose in `data-pagefind-body`.
- `src/lib/journal-search.ts` — **create**: client search controller.
- `src/components/LensSwitcher.astro` — **modify**: search input + results panel + wire `initJournalSearch`.
- `playwright.config.ts` — **modify**: `webServer` → build + pagefind + preview.
- `tests/smoke.spec.ts` — **modify**: e2e search tests.

---

### Task 1 — `pagefind` dependency + build script (CONTROLLER-EXECUTED: lockfile dance)

> Execute this task as the controller, NOT via a subagent — it manipulates `pnpm-lock.yaml` and the 4 dev-proxy working-tree files (`apps/web/package.json`, `apps/web/vite.config.ts`, `turbo.json`, `pnpm-lock.yaml`), which must never be committed. A botched dance leaks `link:` refs into the committed lockfile and breaks CI `--frozen-lockfile`.

**Files:** `apps/site/package.json`, `pnpm-lock.yaml`.

- [ ] **Step 1: add the dependency + build step to `apps/site/package.json`**
  - In `devDependencies`, add `"pagefind": "^1.3.0"` (keep alphabetical).
  - Change `"build": "astro build"` → `"build": "astro build && pagefind --site dist"`.

- [ ] **Step 2: the lockfile dance** (mirrors the `sharp` addition)

```bash
cd /home/jconan/workspaces/johan-chan.fr
# stash the 4 dev-proxy files so the lockfile regenerates clean (apps/site/package.json is NOT stashed)
git stash push -- apps/web/package.json apps/web/vite.config.ts turbo.json pnpm-lock.yaml
pnpm install                       # adds pagefind to apps/site; lockfile has 0 dev-proxy refs
grep -c devrig pnpm-lock.yaml      # must print 0
```

- [ ] **Step 3: verify the build produces the index**

```bash
pnpm --filter @johan-chan/site build 2>&1 | tail -5
ls apps/site/dist/pagefind/pagefind.js   # must exist
```
Expected: build succeeds (45 pages) and `dist/pagefind/` is generated.

- [ ] **Step 4: commit the clean lockfile + package.json**

```bash
git add apps/site/package.json pnpm-lock.yaml
git show :pnpm-lock.yaml | grep -c devrig   # must print 0 before committing
git commit -m "build(site): add pagefind + post-build index step"
```

- [ ] **Step 5: restore the dev-proxy files (working-tree only) + regenerate the working lockfile**

```bash
git checkout stash@{0} -- apps/web/package.json apps/web/vite.config.ts turbo.json
git stash drop
git restore --staged apps/web/package.json apps/web/vite.config.ts turbo.json
pnpm install     # working lockfile regains the 2 dev-proxy link refs (local-only)
grep -c devrig pnpm-lock.yaml          # 2 (working tree)
git show HEAD:pnpm-lock.yaml | grep -c devrig   # 0 (committed)
```

---

### Task 2 — copy labels for search

**Files:** modify `src/lib/copy.ts` (`copy.test.ts` parity must stay green).

- [ ] **Step 1:** in the `Copy` interface, after the `lens: { ... };` line, add:
```ts
  search: { placeholder: string; noResults: string };
```

- [ ] **Step 2:** in the `fr` object, after the `lens: { ... },` line, add:
```ts
    search: { placeholder: 'Rechercher…', noResults: 'Aucun résultat' },
```

- [ ] **Step 3:** in the `en` object, after the `lens: { ... },` line, add:
```ts
    search: { placeholder: 'Search…', noResults: 'No results' },
```
(`…` is the ellipsis char U+2026. ASCII string delimiters only.)

- [ ] **Step 4: verify** — `pnpm --filter @johan-chan/site test:unit && pnpm --filter @johan-chan/site exec astro check` → green / 0 errors.

- [ ] **Step 5: commit**
```bash
git add apps/site/src/lib/copy.ts
git commit -m "feat(site): copy labels for journal search"
```

---

### Task 3 — index articles with `data-pagefind-body`

**Files:** modify `src/pages/journal/[slug].astro` and `src/pages/en/journal/[slug].astro`.

In each file, wrap the **title-through-prose** region in `<div data-pagefind-body>` so Pagefind indexes the title + body but not the back-link, series breadcrumb, repo, prev/next, or related blocks.

- [ ] **Step 1 (FR `journal/[slug].astro`):** insert `<div data-pagefind-body>` immediately BEFORE the `<h1 ...>{article.title}</h1>` line (currently line 42), and insert `</div>` immediately AFTER the `.atl-prose` closing tag — i.e. after this block:
```astro
  <div class="atl-prose font-text text-[16.5px] leading-[1.7] text-ink2 md:text-[17.5px]">
    <Content />
  </div>
```
So the result is:
```astro
  <div data-pagefind-body>
  <h1 class="font-display ...">{article.title}</h1>
  ... (meta row, hero figure) ...
  <div class="atl-prose ...">
    <Content />
  </div>
  </div>
```
(The `{article.image && (...)}` figure and the meta row stay inside the wrapper — that's fine.)

- [ ] **Step 2 (EN `en/journal/[slug].astro`):** apply the identical wrap (same h1 + meta + figure + `.atl-prose` structure).

- [ ] **Step 3: verify** — `pnpm --filter @johan-chan/site exec astro check && pnpm --filter @johan-chan/site build` → 0 errors; 45 pages; `ls apps/site/dist/pagefind/` shows the index. Then confirm only articles were indexed:
```bash
cat apps/site/dist/pagefind/pagefind-entry.json 2>/dev/null | head -c 300; echo
# Spot check: a journal LIST page should NOT be indexed. Searching is verified in Task 6 e2e.
```

- [ ] **Step 4: commit**
```bash
git add "apps/site/src/pages/journal/[slug].astro" "apps/site/src/pages/en/journal/[slug].astro"
git commit -m "feat(site): mark article body for pagefind indexing"
```

---

### Task 4 — `journal-search.ts` client controller

**Files:** create `src/lib/journal-search.ts`.

- [ ] **Step 1: create** `src/lib/journal-search.ts` with EXACTLY:
```ts
// Client-side journal search over the Pagefind static index.
// The index only exists after `pagefind --site dist` (production/preview build);
// in `astro dev` the dynamic import fails and search degrades to a quiet no-op.

let pf: PagefindRuntime | null = null;
let failed = false;

interface PagefindResultData { url: string; excerpt: string; meta?: { title?: string } }
interface PagefindRuntime {
  options?: (o: Record<string, unknown>) => Promise<void>;
  search: (q: string) => Promise<{ results: { data: () => Promise<PagefindResultData> }[] }>;
}

async function getPagefind(): Promise<PagefindRuntime | null> {
  if (pf || failed) return pf;
  try {
    const base = import.meta.env.BASE_URL || '/';
    pf = (await import(/* @vite-ignore */ `${base}pagefind/pagefind.js`)) as PagefindRuntime;
    await pf.options?.({ baseUrl: base });
    return pf;
  } catch {
    failed = true;
    return null;
  }
}

export function initJournalSearch(): void {
  const w = window as unknown as { __journalSearch?: boolean };
  if (w.__journalSearch) return;
  w.__journalSearch = true;
  document.addEventListener('astro:page-load', setup);
}

function setup(): void {
  const feed = document.querySelector<HTMLElement>('[data-feed]');
  const input = document.querySelector<HTMLInputElement>('[data-search-input]');
  const panel = document.querySelector<HTMLElement>('[data-search-results]');
  if (!feed || !input || !panel) return;
  const noResults = panel.getAttribute('data-noresults') || 'No results';

  let timer: number | undefined;

  const showFeed = () => {
    feed.style.display = '';
    panel.style.display = 'none';
    panel.innerHTML = '';
  };

  const render = (items: PagefindResultData[]) => {
    feed.style.display = 'none';
    panel.style.display = '';
    panel.innerHTML = items.length
      ? items
          .map(
            (d) =>
              `<a href="${d.url}" data-search-result class="atl-row block border-t border-line py-4">` +
              `<span class="block font-display text-[17px] font-medium leading-[1.16] text-ink">${d.meta?.title ?? ''}</span>` +
              `<span class="atl-meta mt-1.5 block text-ink2" style="font-size:13px;line-height:1.5">${d.excerpt}</span>` +
              `</a>`,
          )
          .join('')
      : `<p class="atl-meta py-6 text-faint" style="font-size:12.5px">${noResults}</p>`;
  };

  const run = async (q: string) => {
    if (!q.trim()) { showFeed(); return; }
    const lib = await getPagefind();
    if (!lib) { render([]); return; }
    const search = await lib.search(q);
    const items = await Promise.all(search.results.slice(0, 8).map((r) => r.data()));
    render(items);
  };

  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = window.setTimeout(() => run(input.value), 200);
  });

  showFeed();
}
```

- [ ] **Step 2: verify** — `pnpm --filter @johan-chan/site exec astro check` → 0 errors (unused until Task 5; fully exercised at Task 6).

- [ ] **Step 3: commit**
```bash
git add apps/site/src/lib/journal-search.ts
git commit -m "feat(site): journal-search client controller (pagefind)"
```

---

### Task 5 — search input + results panel in `LensSwitcher`

**Files:** modify `src/components/LensSwitcher.astro`.

- [ ] **Step 1:** add the search input as the FIRST child inside `<div data-lens ...>` (above the `Parcourir` row). Insert immediately after the opening `<div data-lens class="mt-6 md:mt-8">`:
```astro
  <div class="mb-3">
    <input type="search" data-search-input placeholder={C.search.placeholder} autocomplete="off"
      class="atl-meta w-full max-w-[420px] rounded-[10px] border border-line bg-surf px-3.5 py-2 text-[13px] text-ink placeholder:text-faint" />
  </div>
```

- [ ] **Step 2:** add the results panel as the LAST child inside `<div data-lens ...>`, immediately before its closing `</div>` (after the `data-count` block):
```astro
  <div data-search-results data-noresults={C.search.noResults} style="display:none"></div>
```

- [ ] **Step 3:** wire the search module + style result highlights. Replace the existing `<script>` block:
```astro
<script>
  import { initJournalLens } from '../lib/journal-lens';
  initJournalLens();
</script>
```
with:
```astro
<script>
  import { initJournalLens } from '../lib/journal-lens';
  import { initJournalSearch } from '../lib/journal-search';
  initJournalLens();
  initJournalSearch();
</script>
<style is:global>
  [data-search-results] mark { background: transparent; color: var(--accent); font-weight: 600; }
</style>
```

- [ ] **Step 4: verify** — `pnpm --filter @johan-chan/site exec astro check && pnpm --filter @johan-chan/site build` → 0 errors; 45 pages; `dist/pagefind/` present.

- [ ] **Step 5: commit**
```bash
git add apps/site/src/components/LensSwitcher.astro
git commit -m "feat(site): search input + results panel in the lens switcher"
```

---

### Task 6 — Playwright preview server + e2e search

**Files:** modify `playwright.config.ts` and `tests/smoke.spec.ts`.

- [ ] **Step 1: point the e2e server at a built preview** (search needs the index). Replace the `webServer` block in `playwright.config.ts`:
```ts
  webServer: {
    command: 'node_modules/.bin/astro build && node_modules/.bin/pagefind --site dist && node_modules/.bin/astro preview --port 4399',
    url: 'http://localhost:4399',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
```

- [ ] **Step 2: run the EXISTING suite against the preview** to confirm nothing regressed on the static build:
```bash
pnpm --filter @johan-chan/site test:e2e
```
Expected: the 22 existing tests pass against the built preview. (They're behavioural; the static build serves the same DOM + client JS.) If any test depended on dev-only behaviour, STOP and report it (status BLOCKED) — do not paper over it.

- [ ] **Step 3: add the search e2e tests** — append to `tests/smoke.spec.ts`:
```ts
test('search returns a matching article and clearing restores the feed', async ({ page }) => {
  await page.goto('/journal');
  await page.waitForLoadState('networkidle');
  const input = page.locator('[data-search-input]');
  await input.fill('Python');
  await expect(page.locator('[data-search-results] [data-search-result]').first()).toBeVisible();
  await expect(page.locator('[data-search-results]')).toContainText('Boring languages win');
  await expect(page.locator('[data-feed]')).toBeHidden();
  await input.fill('');
  await expect(page.locator('[data-feed]')).toBeVisible();
});

test('clicking a search result navigates to the article', async ({ page }) => {
  await page.goto('/journal');
  await page.waitForLoadState('networkidle');
  await page.locator('[data-search-input]').fill('Python');
  await page.locator('[data-search-results] [data-search-result]').first().click();
  await expect(page).toHaveURL(/\/journal\/boring-languages-win\/?$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Boring languages win');
});

test('pagefind index is served on the build', async ({ page }) => {
  const res = await page.request.get('/pagefind/pagefind.js');
  expect(res.status()).toBe(200);
});
```

- [ ] **Step 4: run e2e** — `pnpm --filter @johan-chan/site test:e2e`
Expected: all pass (22 existing + 3 new = 25). If the search result assertion is slow, the auto-retrying `expect` covers the lazy index load + 200 ms debounce; if it genuinely fails, confirm `dist/pagefind/` exists and `Python` appears in `boring-languages-win/index.md`.

- [ ] **Step 5: full verification** — `pnpm --filter @johan-chan/site check && pnpm --filter @johan-chan/site build`
Expected: `check` 0 errors; build 45 pages + `dist/pagefind/`.

- [ ] **Step 6: commit**
```bash
git add apps/site/playwright.config.ts apps/site/tests/smoke.spec.ts
git commit -m "test(site): e2e for journal search (built-preview server)"
```

---

## Verification checklist (end of slice)

- [ ] `pnpm --filter @johan-chan/site test:unit` — green (copy parity).
- [ ] `pnpm --filter @johan-chan/site check` — 0 errors.
- [ ] `pnpm --filter @johan-chan/site test:e2e` — 25 green against the built preview.
- [ ] `pnpm --filter @johan-chan/site build` — 45 pages + `dist/pagefind/pagefind.js` present.
- [ ] **Lockfile:** `git show HEAD~…:pnpm-lock.yaml | grep -c devrig` on the Task-1 commit prints 0; working tree has the 2 dev-proxy refs (local-only).
- [ ] `git diff --name-only main..HEAD` — only `apps/site/**`, `pnpm-lock.yaml`, `docs/**`; the 4 dev-proxy files remain uncommitted.
- [ ] Manual: on `/journal`, typing shows results (hides feed), clearing restores the lens; a result links to the article; same on `/en/journal`. (Dev `astro dev` shows the input but no results — expected; use `pnpm --filter @johan-chan/site preview` after a build to see it live.)
```
