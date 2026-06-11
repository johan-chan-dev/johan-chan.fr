# Navigable Journal — Slice 1: Series First-Class — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Promote series to first-class content: add `/series` (index) and `/series/<slug>` (detail, ordered chapters) pages in both locales, and surface series edges on article pages (linked breadcrumb + prev/next chapter).

**Architecture:** Two pure helpers in `content-utils.ts` (`seriesChapters`, `seriesIndex`) do all grouping/ordering and are unit-tested. Two thin async wrappers in `content.ts` (`getSeriesList`, `getSeriesEntry`) join those with the `series` collection metadata; they're verified via page build + e2e. New Astro routes mirror the existing journal pages and reuse `PageLayout`. The Temps feed is left untouched — feed collapsing belongs to Slice 2 (lens switcher), where the feed logic is reworked.

**Tech Stack:** Astro 6 content collections, `PageLayout.astro`, Vitest (pure helpers), Playwright (smoke). No new dependencies. No sitemap exists in `apps/site` yet, so sitemap wiring is out of scope here.

**Out of scope (later slices):** Temps feed collapsing, the lens switcher, tag/register lens routes, search, localizing series titles. EN series pages reuse the FR series title/description (the `series` collection is single-language) — accepted.

**Working directory:** all paths are under `apps/site/`. Branch: `feat/navigable-journal` (already created; the spec lives there).

---

## File structure

- `src/lib/content-utils.ts` — **modify**: add `SeriesIndexEntry` type + `seriesChapters()` + `seriesIndex()` (pure).
- `tests/content-utils.test.ts` — **modify**: unit tests for the two helpers.
- `src/lib/content.ts` — **modify**: add `SeriesCard` type + `getSeriesList()` + `getSeriesEntry()`.
- `src/lib/copy.ts` — **modify**: add `seriesIndex` label group to the `Copy` interface + `fr` + `en`.
- `src/pages/series/index.astro` — **create** (FR series index).
- `src/pages/en/series/index.astro` — **create** (EN series index).
- `src/pages/series/[slug].astro` — **create** (FR series detail).
- `src/pages/en/series/[slug].astro` — **create** (EN series detail).
- `src/pages/journal/[slug].astro` — **modify**: linked series breadcrumb + prev/next chapter.
- `src/pages/en/journal/[slug].astro` — **modify**: same, EN paths.
- `tests/smoke.spec.ts` — **modify**: e2e for the new pages + article edges.

---

### Task 1: Pure helpers — `seriesChapters` + `seriesIndex`

**Files:**
- Modify: `src/lib/content-utils.ts`
- Test: `tests/content-utils.test.ts`

- [ ] **Step 1: Write the failing tests**

Append to `tests/content-utils.test.ts` (and add `seriesChapters, seriesIndex` to the existing import from `../src/lib/content-utils`):

```ts
describe('seriesChapters', () => {
  it('returns only the series members, ordered by order asc', () => {
    const all = [
      A({ slug: 'b', series: { id: 's', title: 'S' }, order: 2 }),
      A({ slug: 'a', series: { id: 's', title: 'S' }, order: 1 }),
      A({ slug: 'x' }),
      A({ slug: 'c', series: { id: 's', title: 'S' }, order: 3 }),
    ];
    expect(seriesChapters('s', all).map((c) => c.slug)).toEqual(['a', 'b', 'c']);
  });
});

describe('seriesIndex', () => {
  it('groups by series with count + date range, latest series first', () => {
    const all = [
      A({ slug: 'a', series: { id: 's1', title: 'One' }, order: 1, date: '2026-01-01' }),
      A({ slug: 'b', series: { id: 's1', title: 'One' }, order: 2, date: '2026-03-01' }),
      A({ slug: 'c', series: { id: 's2', title: 'Two' }, order: 1, date: '2026-02-01' }),
      A({ slug: 'd' }), // standalone, ignored
    ];
    const idx = seriesIndex(all);
    expect(idx.map((e) => e.id)).toEqual(['s1', 's2']); // s1 latest 2026-03-01 > s2 2026-02-01
    expect(idx[0]).toMatchObject({ id: 's1', title: 'One', count: 2, first: '2026-01-01', latest: '2026-03-01' });
  });
});
```

- [ ] **Step 2: Run the tests, verify they fail**

Run: `pnpm --filter @johan-chan/site test:unit`
Expected: FAIL — `seriesChapters is not a function` / `seriesIndex is not a function`.

- [ ] **Step 3: Implement the helpers**

Append to `src/lib/content-utils.ts`:

```ts
export interface SeriesIndexEntry {
  id: string;
  title: string;
  count: number;
  first: string; // earliest chapter date (YYYY-MM-DD)
  latest: string; // most recent chapter date
}

export function seriesChapters(seriesId: string, articles: Article[]): Article[] {
  return articles
    .filter((a) => a.series?.id === seriesId)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function seriesIndex(articles: Article[]): SeriesIndexEntry[] {
  const map = new Map<string, SeriesIndexEntry>();
  for (const a of articles) {
    if (!a.series) continue;
    const e = map.get(a.series.id);
    if (!e) {
      map.set(a.series.id, { id: a.series.id, title: a.series.title, count: 1, first: a.date, latest: a.date });
    } else {
      e.count++;
      if (a.date < e.first) e.first = a.date;
      if (a.date > e.latest) e.latest = a.date;
    }
  }
  return [...map.values()].sort((x, y) => (x.latest < y.latest ? 1 : x.latest > y.latest ? -1 : 0));
}
```

- [ ] **Step 4: Run the tests, verify they pass**

Run: `pnpm --filter @johan-chan/site test:unit`
Expected: PASS (all existing tests + the two new describes).

- [ ] **Step 5: Commit**

```bash
git add apps/site/src/lib/content-utils.ts apps/site/tests/content-utils.test.ts
git commit -m "feat(site): seriesChapters + seriesIndex helpers"
```

---

### Task 2: Query wrappers — `getSeriesList` + `getSeriesEntry`

**Files:**
- Modify: `src/lib/content.ts`

These are thin wrappers over `astro:content` (not unit-testable without the content runtime); they're exercised by the page builds and e2e in later tasks.

- [ ] **Step 1: Extend the imports**

In `src/lib/content.ts`, change the `content-utils` import line:

```ts
import { byDateDesc, localeOf, slugOf, seriesChapters, seriesIndex } from './content-utils';
import type { Lang } from '../i18n/ui';
import type { SeriesIndexEntry } from './content-utils';
```

(Keep the existing `export type { Article, Project, Series } from './content-utils';` line.)

- [ ] **Step 2: Add the wrappers**

Append to `src/lib/content.ts` (after `getSeries`):

```ts
export interface SeriesCard extends SeriesIndexEntry {
  description: string;
}

export async function getSeriesList(lang: Lang): Promise<SeriesCard[]> {
  const articles = await getArticles(lang);
  const entries = seriesIndex(articles);
  return Promise.all(
    entries.map(async (e) => {
      const meta = await getSeries(e.id);
      return { ...e, description: meta?.description ?? '' };
    }),
  );
}

export async function getSeriesEntry(slug: string, lang: Lang) {
  const meta = await getSeries(slug);
  const chapters = seriesChapters(slug, await getArticles(lang));
  if (!meta || chapters.length === 0) throw new Error(`Series not found: ${slug} (${lang})`);
  return { series: meta, chapters };
}
```

- [ ] **Step 3: Type-check**

Run: `pnpm --filter @johan-chan/site exec astro check`
Expected: 0 errors (nothing consumes the wrappers yet; this just confirms they compile).

- [ ] **Step 4: Commit**

```bash
git add apps/site/src/lib/content.ts
git commit -m "feat(site): getSeriesList + getSeriesEntry query wrappers"
```

---

### Task 3: Copy labels for the series pages

**Files:**
- Modify: `src/lib/copy.ts`
- Test: `tests/copy.test.ts` (existing — must still pass)

- [ ] **Step 1: Add the field to the `Copy` interface**

In `src/lib/copy.ts`, find the line `  series: string; chapter: string;` and add immediately after it:

```ts
  seriesIndex: { title: string; sub: string; back: string; chapters: string };
```

- [ ] **Step 2: Add the FR values**

In the `fr` object, find `    series: 'fil', chapter: 'chap.',` and add immediately after it:

```ts
    seriesIndex: { title: 'Séries', sub: 'Des fils à suivre dans l’ordre, du premier au dernier chapitre.', back: '← les séries', chapters: 'chapitres' },
```

- [ ] **Step 3: Add the EN values**

In the `en` object, find the line `    series: 'series', chapter: 'ch.',` and add immediately after it:

```ts
    seriesIndex: { title: 'Series', sub: 'Threads to follow in order, first chapter to last.', back: '← the series', chapters: 'chapters' },
```

- [ ] **Step 4: Run unit tests + type-check**

Run: `pnpm --filter @johan-chan/site test:unit && pnpm --filter @johan-chan/site exec astro check`
Expected: PASS / 0 errors. `copy.test.ts` (fr/en key parity) stays green because the field was added to both locales.

- [ ] **Step 5: Commit**

```bash
git add apps/site/src/lib/copy.ts
git commit -m "feat(site): copy labels for series pages"
```

---

### Task 4: Series index pages (`/series`, `/en/series`)

**Files:**
- Create: `src/pages/series/index.astro`
- Create: `src/pages/en/series/index.astro`

- [ ] **Step 1: Create the FR index** — `src/pages/series/index.astro`

```astro
---
import PageLayout from '../../layouts/PageLayout.astro';
import { copy, fmtDate } from '../../lib/copy';
import { getSeriesList } from '../../lib/content';
import type { Lang } from '../../i18n/ui';
const lang: Lang = 'fr';
const C = copy[lang];
const series = await getSeriesList(lang);
---
<PageLayout lang={lang} current="journal" title={`${C.seriesIndex.title} — ${C.name}`} description={C.seriesIndex.sub}>
  <section class="pt-9 md:pt-14">
    <h1 class="atl-page-title m-0 text-ink">{C.seriesIndex.title}</h1>
    <p class="atl-body mt-3.5 max-w-[620px] text-ink2 md:text-[16.5px]">{C.seriesIndex.sub}</p>
    <div class="mt-7 grid grid-cols-1 gap-4 md:grid-cols-2">
      {series.map((s) => (
        <a href={`/series/${s.id}`} data-testid="series-card" class="atl-row block rounded-[14px] border border-line bg-surf p-5">
          <div class="atl-meta uppercase text-accent" style="font-size:10.5px;letter-spacing:.1em">{s.count} {C.seriesIndex.chapters}</div>
          <h2 class="mt-2 font-display text-[20px] font-semibold leading-[1.12] text-ink md:text-[22px]">{s.title}</h2>
          <p class="atl-body mt-2 text-ink2" style="font-size:14.5px;line-height:1.55">{s.description}</p>
          <div class="atl-meta mt-3 text-faint" style="font-size:11px">{fmtDate(s.first, lang)} → {fmtDate(s.latest, lang)}</div>
        </a>
      ))}
    </div>
  </section>
</PageLayout>
```

- [ ] **Step 2: Create the EN index** — `src/pages/en/series/index.astro`

Identical except the import depth (`../../../`), `lang = 'en'`, and the card link (`/en/series/${s.id}`):

```astro
---
import PageLayout from '../../../layouts/PageLayout.astro';
import { copy, fmtDate } from '../../../lib/copy';
import { getSeriesList } from '../../../lib/content';
import type { Lang } from '../../../i18n/ui';
const lang: Lang = 'en';
const C = copy[lang];
const series = await getSeriesList(lang);
---
<PageLayout lang={lang} current="journal" title={`${C.seriesIndex.title} — ${C.name}`} description={C.seriesIndex.sub}>
  <section class="pt-9 md:pt-14">
    <h1 class="atl-page-title m-0 text-ink">{C.seriesIndex.title}</h1>
    <p class="atl-body mt-3.5 max-w-[620px] text-ink2 md:text-[16.5px]">{C.seriesIndex.sub}</p>
    <div class="mt-7 grid grid-cols-1 gap-4 md:grid-cols-2">
      {series.map((s) => (
        <a href={`/en/series/${s.id}`} data-testid="series-card" class="atl-row block rounded-[14px] border border-line bg-surf p-5">
          <div class="atl-meta uppercase text-accent" style="font-size:10.5px;letter-spacing:.1em">{s.count} {C.seriesIndex.chapters}</div>
          <h2 class="mt-2 font-display text-[20px] font-semibold leading-[1.12] text-ink md:text-[22px]">{s.title}</h2>
          <p class="atl-body mt-2 text-ink2" style="font-size:14.5px;line-height:1.55">{s.description}</p>
          <div class="atl-meta mt-3 text-faint" style="font-size:11px">{fmtDate(s.first, lang)} → {fmtDate(s.latest, lang)}</div>
        </a>
      ))}
    </div>
  </section>
</PageLayout>
```

- [ ] **Step 3: Type-check + build**

Run: `pnpm --filter @johan-chan/site exec astro check && pnpm --filter @johan-chan/site build`
Expected: 0 errors; build now includes `/series` and `/en/series` (page count rises by 2 vs. the 41-page baseline → 43).

- [ ] **Step 4: Commit**

```bash
git add apps/site/src/pages/series/index.astro apps/site/src/pages/en/series/index.astro
git commit -m "feat(site): series index pages (FR + EN)"
```

---

### Task 5: Series detail pages (`/series/[slug]`, `/en/series/[slug]`)

**Files:**
- Create: `src/pages/series/[slug].astro`
- Create: `src/pages/en/series/[slug].astro`

- [ ] **Step 1: Create the FR detail** — `src/pages/series/[slug].astro`

```astro
---
import PageLayout from '../../layouts/PageLayout.astro';
import { copy, fmtDate } from '../../lib/copy';
import { getSeriesList, getSeriesEntry } from '../../lib/content';
import type { Lang } from '../../i18n/ui';
export async function getStaticPaths() {
  const list = await getSeriesList('fr');
  return list.map((s) => ({ params: { slug: s.id } }));
}
const lang: Lang = 'fr';
const { slug } = Astro.params;
const { series, chapters } = await getSeriesEntry(slug!, lang);
const C = copy[lang];
const dates = chapters.map((c) => c.date).sort();
const first = dates[0];
const last = dates[dates.length - 1];
---
<PageLayout lang={lang} current="journal" title={`${series.title} — ${C.name}`} description={series.description} width="reading">
  <a href="/series" class="atl-meta inline-flex items-center gap-2 text-ink2" style="font-size:12px">{C.seriesIndex.back}</a>
  <div class="atl-meta mt-5 uppercase text-accent" style="font-size:10.5px;letter-spacing:.1em">{C.series}</div>
  <h1 class="mt-1 font-display text-[30px] font-bold leading-[1.04] tracking-[-.03em] text-ink md:text-[42px]" style="text-wrap:balance">{series.title}</h1>
  <p class="atl-body mt-4 text-ink2 md:text-[17.5px]" style="line-height:1.6">{series.description}</p>
  <div class="atl-meta mt-3 text-faint" style="font-size:11.5px">{chapters.length} {C.seriesIndex.chapters} · {fmtDate(first, lang)} → {fmtDate(last, lang)}</div>
  <ol class="mt-7 list-none p-0">
    {chapters.map((c, i) => (
      <li>
        <a href={`/journal/${c.slug}`} data-testid="chapter-link" class="atl-row flex items-baseline gap-4 border-t border-line py-4">
          <span class="atl-meta text-accent" style="font-size:12px;min-width:24px">{String(c.order ?? i + 1).padStart(2, '0')}</span>
          <span class="min-w-0 flex-1 font-display text-[17px] font-medium leading-[1.16] text-ink">{c.title}</span>
          <span class="atl-meta whitespace-nowrap text-faint" style="font-size:11px">{c.readingTime} {C.read}</span>
        </a>
      </li>
    ))}
    <li class="border-t border-line"></li>
  </ol>
</PageLayout>
```

- [ ] **Step 2: Create the EN detail** — `src/pages/en/series/[slug].astro`

Identical except import depth (`../../../`), `getSeriesList('en')`, `lang = 'en'`, back link `/en/series`, and chapter links `/en/journal/${c.slug}`:

```astro
---
import PageLayout from '../../../layouts/PageLayout.astro';
import { copy, fmtDate } from '../../../lib/copy';
import { getSeriesList, getSeriesEntry } from '../../../lib/content';
import type { Lang } from '../../../i18n/ui';
export async function getStaticPaths() {
  const list = await getSeriesList('en');
  return list.map((s) => ({ params: { slug: s.id } }));
}
const lang: Lang = 'en';
const { slug } = Astro.params;
const { series, chapters } = await getSeriesEntry(slug!, lang);
const C = copy[lang];
const dates = chapters.map((c) => c.date).sort();
const first = dates[0];
const last = dates[dates.length - 1];
---
<PageLayout lang={lang} current="journal" title={`${series.title} — ${C.name}`} description={series.description} width="reading">
  <a href="/en/series" class="atl-meta inline-flex items-center gap-2 text-ink2" style="font-size:12px">{C.seriesIndex.back}</a>
  <div class="atl-meta mt-5 uppercase text-accent" style="font-size:10.5px;letter-spacing:.1em">{C.series}</div>
  <h1 class="mt-1 font-display text-[30px] font-bold leading-[1.04] tracking-[-.03em] text-ink md:text-[42px]" style="text-wrap:balance">{series.title}</h1>
  <p class="atl-body mt-4 text-ink2 md:text-[17.5px]" style="line-height:1.6">{series.description}</p>
  <div class="atl-meta mt-3 text-faint" style="font-size:11.5px">{chapters.length} {C.seriesIndex.chapters} · {fmtDate(first, lang)} → {fmtDate(last, lang)}</div>
  <ol class="mt-7 list-none p-0">
    {chapters.map((c, i) => (
      <li>
        <a href={`/en/journal/${c.slug}`} data-testid="chapter-link" class="atl-row flex items-baseline gap-4 border-t border-line py-4">
          <span class="atl-meta text-accent" style="font-size:12px;min-width:24px">{String(c.order ?? i + 1).padStart(2, '0')}</span>
          <span class="min-w-0 flex-1 font-display text-[17px] font-medium leading-[1.16] text-ink">{c.title}</span>
          <span class="atl-meta whitespace-nowrap text-faint" style="font-size:11px">{c.readingTime} {C.read}</span>
        </a>
      </li>
    ))}
    <li class="border-t border-line"></li>
  </ol>
</PageLayout>
```

- [ ] **Step 3: Type-check + build**

Run: `pnpm --filter @johan-chan/site exec astro check && pnpm --filter @johan-chan/site build`
Expected: 0 errors; build adds `/series/le-monde-du-dev-sous-choc` + `/en/series/le-monde-du-dev-sous-choc` (→ 45 pages).

- [ ] **Step 4: Commit**

```bash
git add "apps/site/src/pages/series/[slug].astro" "apps/site/src/pages/en/series/[slug].astro"
git commit -m "feat(site): series detail pages with ordered chapter list (FR + EN)"
```

---

### Task 6: Article edge affordances — linked series breadcrumb + prev/next

**Files:**
- Modify: `src/pages/journal/[slug].astro`
- Modify: `src/pages/en/journal/[slug].astro`

- [ ] **Step 1: FR — extend imports + compute prev/next**

In `src/pages/journal/[slug].astro`, change the `content-utils` import to add `seriesChapters`:

```ts
import { relatedArticles, seriesChapters } from '../../lib/content-utils';
```

Then, immediately after the `const related = relatedArticles(article, all);` line, add:

```ts
let prevCh, nextCh;
if (article.series) {
  const chapters = seriesChapters(article.series.id, all);
  const i = chapters.findIndex((c) => c.slug === article.slug);
  prevCh = chapters[i - 1];
  nextCh = chapters[i + 1];
}
```

- [ ] **Step 2: FR — make the series line a link**

Replace the existing series block:

```astro
  {article.series && (
    <div class={`atl-meta mb-3.5 uppercase ${hue}`} style="font-size:11px;letter-spacing:.08em">{C.series} · {article.series.title}, {C.chapter} {article.order}</div>
  )}
```

with:

```astro
  {article.series && (
    <a href={`/series/${article.series.id}`} class={`atl-meta mb-3.5 inline-block uppercase ${hue}`} style="font-size:11px;letter-spacing:.08em">{C.series} · {article.series.title}, {C.chapter} {article.order}</a>
  )}
```

- [ ] **Step 3: FR — add prev/next nav**

Immediately before the `{related.length > 0 && (` block, insert:

```astro
  {article.series && (prevCh || nextCh) && (
    <div class="mt-9 grid grid-cols-2 gap-3">
      {prevCh ? (
        <a href={`/journal/${prevCh.slug}`} data-testid="chapter-prev" class="atl-row rounded-[11px] border border-line bg-surf px-4 py-3">
          <span class="atl-meta block uppercase text-faint" style="font-size:10px;letter-spacing:.08em">← {C.chapter} {prevCh.order}</span>
          <span class="mt-1 block font-display text-[15px] font-medium leading-[1.16] text-ink">{prevCh.title}</span>
        </a>
      ) : <span></span>}
      {nextCh && (
        <a href={`/journal/${nextCh.slug}`} data-testid="chapter-next" class="atl-row rounded-[11px] border border-line bg-surf px-4 py-3 text-right">
          <span class="atl-meta block uppercase text-faint" style="font-size:10px;letter-spacing:.08em">{C.chapter} {nextCh.order} →</span>
          <span class="mt-1 block font-display text-[15px] font-medium leading-[1.16] text-ink">{nextCh.title}</span>
        </a>
      )}
    </div>
  )}
```

- [ ] **Step 4: EN — mirror all three edits in `src/pages/en/journal/[slug].astro`**

Same edits, with EN paths:
- import: `import { relatedArticles, seriesChapters } from '../../../lib/content-utils';`
- the `prevCh`/`nextCh` computation block is identical (insert after `const related = ...`).
- series line link href: `/en/series/${article.series.id}` (keep the rest identical).
- prev/next links: `/en/journal/${prevCh.slug}` and `/en/journal/${nextCh.slug}` (otherwise identical to Step 3).

- [ ] **Step 5: Type-check + build**

Run: `pnpm --filter @johan-chan/site exec astro check && pnpm --filter @johan-chan/site build`
Expected: 0 errors; still 45 pages (no new routes, only edits).

- [ ] **Step 6: Commit**

```bash
git add "apps/site/src/pages/journal/[slug].astro" "apps/site/src/pages/en/journal/[slug].astro"
git commit -m "feat(site): linked series breadcrumb + prev/next chapter on articles"
```

---

### Task 7: e2e smoke coverage + final verification

**Files:**
- Modify: `tests/smoke.spec.ts`

- [ ] **Step 1: Add the e2e tests**

Append to `tests/smoke.spec.ts`:

```ts
test('series index lists the series', async ({ page }) => {
  await page.goto('/series');
  const cards = page.getByTestId('series-card');
  await expect(cards.first()).toBeVisible();
  await expect(page.locator('body')).toContainText('Le monde du dev sous choc');
});

test('series detail lists chapters in order', async ({ page }) => {
  await page.goto('/series/le-monde-du-dev-sous-choc');
  const chapters = page.getByTestId('chapter-link');
  expect(await chapters.count()).toBeGreaterThanOrEqual(12);
  await expect(chapters.first()).toContainText('Le jour où j’ai cessé d’avoir peur de l’IA');
});

test('article links to its series and shows prev/next', async ({ page }) => {
  // order 2 in the series → has both a prev and a next
  await page.goto('/journal/le-code-propre-n-est-pas-le-craft');
  await expect(page.locator('a[href="/series/le-monde-du-dev-sous-choc"]')).toBeVisible();
  await expect(page.getByTestId('chapter-prev')).toBeVisible();
  await expect(page.getByTestId('chapter-next')).toBeVisible();
});

test('EN series detail renders chapters', async ({ page }) => {
  await page.goto('/en/series/le-monde-du-dev-sous-choc');
  const chapters = page.getByTestId('chapter-link');
  expect(await chapters.count()).toBeGreaterThanOrEqual(12);
  await expect(chapters.first()).toContainText('The Day I Stopped Being Afraid of AI');
});
```

- [ ] **Step 2: Run the full e2e suite**

Run: `pnpm --filter @johan-chan/site test:e2e`
Expected: all tests pass (the 15 existing + 4 new). The Playwright config starts its own `astro dev` on port 4399.

> Note: the EN chapter-1 title assertion uses the translation authored earlier ("The Day I Stopped Being Afraid of AI"). If the EN title differs, read `src/content/articles/le-jour-ou-jai-cesse-davoir-peur-de-lia/index.en.md` frontmatter and use its exact `title`.

- [ ] **Step 3: Full verification**

Run: `pnpm --filter @johan-chan/site check && pnpm --filter @johan-chan/site build`
Expected: `check` 0 errors; build **45 pages**.

- [ ] **Step 4: Commit**

```bash
git add apps/site/tests/smoke.spec.ts
git commit -m "test(site): e2e for series index/detail + article series edges"
```

---

## Verification checklist (end of slice)

- [ ] `pnpm --filter @johan-chan/site test:unit` — green (seriesChapters/seriesIndex covered).
- [ ] `pnpm --filter @johan-chan/site check` — 0 errors.
- [ ] `pnpm --filter @johan-chan/site test:e2e` — 19 tests green.
- [ ] `pnpm --filter @johan-chan/site build` — 45 pages.
- [ ] `git status` — only `apps/site/**` + this is on `feat/navigable-journal`; the 4 dev-proxy files (`apps/web/package.json`, `apps/web/vite.config.ts`, `turbo.json`, `pnpm-lock.yaml`) remain uncommitted/local-only; no new dependency was added.
- [ ] Manual: `/series` → card → `/series/<slug>` → chapter → article → series breadcrumb round-trips; prev/next walks the series; same under `/en/`.
```
