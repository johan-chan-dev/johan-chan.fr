# Navigable Journal — Slice 2: Lens Switcher — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `JournalFilters` on `/journal` with a **Temps · Registre · Thème** lens switcher (+ `Séries →` link), land Temps **series collapsing** + **year headers**, and sync the active lens to the **URL** (History API) with a static canonical link.

**Architecture:** Pure, unit-tested helpers in `content-utils.ts` build the Temps render-list (`journalFeed`), the year grouping (`groupByYear`), and the URL round-trip (`parseLens`/`lensToParams`). A client module `lib/journal-lens.ts` (imported by the switcher's processed `<script>`, wired on `astro:page-load`) toggles row visibility per lens and pushes/pops URL state. The journal pages render one date-desc DOM of every piece (`PieceRow`) with year headers + one `SeriesRow` per series; the module shows/hides. Mutually exclusive lenses: Temps (default/canonical) | one register | one tag.

**Tech Stack:** Astro 6, Vitest, Playwright. No new dependencies.

**Decisions (from the spec, confirmed):** search field deferred to Slice 3; "Série" is a link to `/series` (not a lens); one lens at a time (no register∩tag); Thème = one active tag. These intentionally simplify today's `JournalFilters`.

**Working dir:** all paths under `apps/site/`. Branch: `feat/journal-lens-switcher` (spec already committed there).

---

## File structure

- `src/lib/content-utils.ts` — **modify**: `FeedItem`/`FeedRow` types, `journalFeed()`, `groupByYear()`, `LensState` type, `parseLens()`, `lensToParams()` (all pure).
- `tests/content-utils.test.ts` — **modify**: unit tests for the four helpers.
- `src/lib/copy.ts` — **modify**: `lens` label group (FR + EN).
- `src/components/Base.astro` — **modify**: optional `canonical?` prop → `<link rel="canonical">`.
- `src/layouts/PageLayout.astro` — **modify**: thread `canonical?` to `Base`.
- `src/components/PieceRow.astro` — **modify**: add `data-chapter` + `data-series` on chapter rows.
- `src/components/SeriesRow.astro` — **create**: collapsed series entry for the Temps feed.
- `src/lib/journal-lens.ts` — **create**: client lens controller.
- `src/components/LensSwitcher.astro` — **create**: the control (replaces `JournalFilters`).
- `src/components/JournalFilters.astro` — **delete**.
- `src/pages/journal/index.astro` + `src/pages/en/journal/index.astro` — **modify**: render the feed (PieceRow + SeriesRow + year headers) via `journalFeed`/`groupByYear`; use `LensSwitcher`; pass `canonical`. EN page moves onto `PageLayout`.
- `tests/smoke.spec.ts` — **modify**: e2e for the lens switcher; fix any test assuming the old flat journal.

---

### Task 1: Feed helpers — `journalFeed` + `groupByYear`

**Files:** modify `src/lib/content-utils.ts`; test `tests/content-utils.test.ts`.

- [ ] **Step 1: Write failing tests**

Add `journalFeed, groupByYear` to the existing import in `tests/content-utils.test.ts`, then append:

```ts
describe('journalFeed', () => {
  it('injects a series item right before the series most-recent chapter, keeps standalones', () => {
    // byDateDesc order assumed (newest first)
    const all = [
      A({ slug: 'standalone-new', date: '2026-05-01' }),
      A({ slug: 'ch2', series: { id: 's', title: 'S' }, order: 2, date: '2026-04-01' }),
      A({ slug: 'ch1', series: { id: 's', title: 'S' }, order: 1, date: '2026-02-01' }),
      A({ slug: 'standalone-old', date: '2026-01-01' }),
    ];
    const items = journalFeed(all);
    // series item appears once, immediately before ch2 (the most-recent chapter)
    const kinds = items.map((i) => (i.kind === 'series' ? `series:${i.series.id}` : `art:${i.article.slug}`));
    expect(kinds).toEqual(['art:standalone-new', 'series:s', 'art:ch2', 'art:ch1', 'art:standalone-old']);
    const s = items.find((i) => i.kind === 'series');
    expect(s && s.kind === 'series' && s.series.latest).toBe('2026-04-01');
  });
});

describe('groupByYear', () => {
  it('flags the first item of each year', () => {
    const all = [
      A({ slug: 'a', date: '2026-05-01' }),
      A({ slug: 'b', date: '2026-02-01' }),
      A({ slug: 'c', date: '2025-11-01' }),
    ];
    const rows = groupByYear(journalFeed(all));
    expect(rows.map((r) => [r.year, r.firstOfYear])).toEqual([[2026, true], [2026, false], [2025, true]]);
  });
});
```

- [ ] **Step 2: Run, verify FAIL**

Run: `pnpm --filter @johan-chan/site test:unit`
Expected: FAIL — `journalFeed`/`groupByYear` not defined.

- [ ] **Step 3: Implement**

Append to `src/lib/content-utils.ts`:

```ts
export type FeedItem =
  | { kind: 'article'; date: string; article: Article }
  | { kind: 'series'; date: string; series: SeriesIndexEntry };

export interface FeedRow {
  item: FeedItem;
  year: number;
  firstOfYear: boolean;
}

// Temps render-list: every article (date-desc, as given) plus one series item
// injected immediately before that series' most-recent chapter.
export function journalFeed(articles: Article[]): FeedItem[] {
  const byId = new Map(seriesIndex(articles).map((e) => [e.id, e]));
  const seen = new Set<string>();
  const items: FeedItem[] = [];
  for (const a of articles) {
    if (a.series) {
      const entry = byId.get(a.series.id);
      if (entry && !seen.has(a.series.id)) {
        items.push({ kind: 'series', date: entry.latest, series: entry });
        seen.add(a.series.id);
      }
    }
    items.push({ kind: 'article', date: a.date, article: a });
  }
  return items;
}

export function groupByYear(items: FeedItem[]): FeedRow[] {
  let last: number | null = null;
  return items.map((item) => {
    const year = Number(item.date.slice(0, 4));
    const firstOfYear = year !== last;
    last = year;
    return { item, year, firstOfYear };
  });
}
```

- [ ] **Step 4: Run, verify PASS**

Run: `pnpm --filter @johan-chan/site test:unit`
Expected: PASS.

- [ ] **Step 5: Commit** (exact paths only; NEVER `git add -A` — dev-proxy files must stay uncommitted)

```bash
git add apps/site/src/lib/content-utils.ts apps/site/tests/content-utils.test.ts
git commit -m "feat(site): journalFeed + groupByYear helpers"
```

---

### Task 2: URL lens helpers — `parseLens` + `lensToParams`

**Files:** modify `src/lib/content-utils.ts`; test `tests/content-utils.test.ts`.

- [ ] **Step 1: Write failing tests**

Add `parseLens, lensToParams` to the import, then append:

```ts
describe('parseLens / lensToParams', () => {
  it('defaults to temps when no params', () => {
    expect(parseLens(new URLSearchParams(''))).toEqual({ lens: 'temps' });
    expect(lensToParams({ lens: 'temps' })).toBe('');
  });
  it('reads/writes a register', () => {
    expect(parseLens(new URLSearchParams('reg=refl'))).toEqual({ lens: 'reg', value: 'refl' });
    expect(lensToParams({ lens: 'reg', value: 'design' })).toBe('?reg=design');
  });
  it('reads/writes a tag (url-encoded)', () => {
    expect(parseLens(new URLSearchParams('tag=craft'))).toEqual({ lens: 'tag', value: 'craft' });
    expect(lensToParams({ lens: 'tag', value: 'craft' })).toBe('?tag=craft');
  });
  it('ignores an invalid register', () => {
    expect(parseLens(new URLSearchParams('reg=bogus'))).toEqual({ lens: 'temps' });
  });
});
```

- [ ] **Step 2: Run, verify FAIL**

Run: `pnpm --filter @johan-chan/site test:unit` → FAIL (not defined).

- [ ] **Step 3: Implement**

Append to `src/lib/content-utils.ts`:

```ts
export type LensState =
  | { lens: 'temps' }
  | { lens: 'reg'; value: Registre }
  | { lens: 'tag'; value: string };

export function parseLens(params: URLSearchParams): LensState {
  const reg = params.get('reg');
  if (reg === 'refl' || reg === 'design' || reg === 'impl') return { lens: 'reg', value: reg };
  const tag = params.get('tag');
  if (tag) return { lens: 'tag', value: tag };
  return { lens: 'temps' };
}

export function lensToParams(state: LensState): string {
  if (state.lens === 'reg') return `?reg=${state.value}`;
  if (state.lens === 'tag') return `?tag=${encodeURIComponent(state.value)}`;
  return '';
}
```

- [ ] **Step 4: Run, verify PASS** — `pnpm --filter @johan-chan/site test:unit`

- [ ] **Step 5: Commit**

```bash
git add apps/site/src/lib/content-utils.ts apps/site/tests/content-utils.test.ts
git commit -m "feat(site): parseLens + lensToParams URL helpers"
```

---

### Task 3: Copy labels for the lens control

**Files:** modify `src/lib/copy.ts` (`copy.test.ts` must stay green — add to both locales).

- [ ] **Step 1: Add to the `Copy` interface** — after the `seriesIndex: { ... };` line, add:

```ts
  lens: { browse: string; temps: string; theme: string; seriesLink: string };
```

- [ ] **Step 2: FR values** — after the `seriesIndex: { ... },` line in the `fr` object, add:

```ts
    lens: { browse: 'Parcourir', temps: 'Temps', theme: 'Thème', seriesLink: 'Séries →' },
```

- [ ] **Step 3: EN values** — after the `seriesIndex: { ... },` line in the `en` object, add:

```ts
    lens: { browse: 'Browse', temps: 'Time', theme: 'Theme', seriesLink: 'Series →' },
```

(Register labels reuse the existing `C.kind.refl|design|impl`.)

- [ ] **Step 4: Verify** — `pnpm --filter @johan-chan/site test:unit && pnpm --filter @johan-chan/site exec astro check` → green / 0 errors.

- [ ] **Step 5: Commit**

```bash
git add apps/site/src/lib/copy.ts
git commit -m "feat(site): copy labels for the lens switcher"
```

---

### Task 4: `canonical` prop on `Base` + `PageLayout`

**Files:** modify `src/components/Base.astro`, `src/layouts/PageLayout.astro`.

- [ ] **Step 1: `Base.astro`** — add `canonical?: string` to its `Props` interface and destructure it (default `undefined`). In `<head>`, after the existing `<title>`/meta block, add:

```astro
    {canonical && <link rel="canonical" href={new URL(canonical, Astro.site).href} />}
```

- [ ] **Step 2: `PageLayout.astro`** — add `canonical?: string` to its `Props` interface, destructure it, and pass it through to `<Base ... canonical={canonical}>`.

- [ ] **Step 3: Verify** — `pnpm --filter @johan-chan/site exec astro check` → 0 errors (no consumer yet).

- [ ] **Step 4: Commit**

```bash
git add apps/site/src/components/Base.astro apps/site/src/layouts/PageLayout.astro
git commit -m "feat(site): optional canonical link via Base/PageLayout"
```

---

### Task 5: `PieceRow` chapter data attributes

**Files:** modify `src/components/PieceRow.astro`.

- [ ] **Step 1:** On the root `<a data-testid="piece-row" ...>`, add two attributes so the lens JS can identify chapters. Change the opening tag's attribute list to include:

```astro
  data-chapter={article.series ? '' : undefined}
  data-series={article.series ? article.series.id : undefined}
```

(Astro omits attributes whose value is `undefined`, so non-chapter rows get neither attribute; chapter rows get `data-chapter=""` + `data-series="<id>"`.)

- [ ] **Step 2: Verify** — `pnpm --filter @johan-chan/site exec astro check && pnpm --filter @johan-chan/site build` → 0 errors; 45 pages (attributes only).

- [ ] **Step 3: Commit**

```bash
git add apps/site/src/components/PieceRow.astro
git commit -m "feat(site): mark chapter rows with data-chapter/data-series"
```

---

### Task 6: `SeriesRow` component (collapsed Temps entry)

**Files:** create `src/components/SeriesRow.astro`.

- [ ] **Step 1: Create** `src/components/SeriesRow.astro`:

```astro
---
import type { Lang } from '../i18n/ui';
import type { SeriesIndexEntry } from '../lib/content-utils';
import { copy, fmtDate } from '../lib/copy';
interface Props { series: SeriesIndexEntry; lang: Lang }
const { series, lang } = Astro.props;
const C = copy[lang];
const href = `${lang === 'fr' ? '' : '/en'}/series/${series.id}`;
---
<a href={href} data-series-row data-date={series.latest}
  class="atl-row grid grid-cols-1 items-baseline gap-2 border-t border-l-[3px] border-line border-l-accent bg-surf px-4 py-5 md:grid-cols-[128px_1fr_auto] md:gap-6 md:py-[26px]">
  <div class="flex flex-col gap-[7px]">
    <span class="atl-meta inline-flex items-center gap-[7px] text-accent" style="letter-spacing:.04em">{C.series}</span>
    <span class="atl-meta text-faint">{series.count} {C.seriesIndex.chapters}</span>
  </div>
  <div class="min-w-0">
    <h3 class="atl-piece-title m-0 text-ink">{series.title}</h3>
    <div class="atl-meta mt-2.5 text-faint">{fmtDate(series.first, lang)} → {fmtDate(series.latest, lang)}</div>
  </div>
  <span class="hidden self-center font-mono text-[18px] text-accent md:block">→</span>
</a>
```

- [ ] **Step 2: Verify** — `pnpm --filter @johan-chan/site exec astro check` → 0 errors (unused so far, just compiles).

- [ ] **Step 3: Commit**

```bash
git add apps/site/src/components/SeriesRow.astro
git commit -m "feat(site): SeriesRow collapsed-series component"
```

---

### Task 7: `journal-lens.ts` client controller

**Files:** create `src/lib/journal-lens.ts`.

- [ ] **Step 1: Create** `src/lib/journal-lens.ts`:

```ts
import { parseLens, lensToParams, type LensState } from './content-utils';

// Idempotent across the ClientRouter: register the page-load listener once.
export function initJournalLens(): void {
  const w = window as unknown as { __journalLens?: boolean };
  if (w.__journalLens) return;
  w.__journalLens = true;
  document.addEventListener('astro:page-load', setup);
}

function setup(): void {
  const root = document.querySelector<HTMLElement>('[data-lens]');
  const feed = document.querySelector<HTMLElement>('[data-feed]');
  if (!root || !feed) return;

  const countEl = root.querySelector<HTMLElement>('[data-count]');
  const total = Number(countEl?.getAttribute('data-total') ?? '0');
  const lang = document.documentElement.lang === 'en' ? 'en' : 'fr';
  const word = (n: number) =>
    lang === 'fr' ? (n > 1 ? 'articles' : 'article') : 'articles';

  const children = () => [...feed.children] as HTMLElement[];

  const apply = (state: LensState) => {
    let visible = 0;
    for (const el of children()) {
      if (el.hasAttribute('data-year')) continue;
      const isSeries = el.hasAttribute('data-series-row');
      const isChapter = el.hasAttribute('data-chapter');
      let show = false;
      if (state.lens === 'temps') show = isSeries || !isChapter;
      else if (state.lens === 'reg') show = !isSeries && el.getAttribute('data-kind') === state.value;
      else if (state.lens === 'tag') show = !isSeries && (el.getAttribute('data-tags') || '').split('|').includes(state.value);
      el.style.display = show ? '' : 'none';
      if (show && !isSeries) visible++;
    }
    // year headers: Temps only; hide a header with no visible row before the next header
    const kids = children();
    kids.forEach((el, i) => {
      if (!el.hasAttribute('data-year')) return;
      if (state.lens !== 'temps') { el.style.display = 'none'; return; }
      let any = false;
      for (let j = i + 1; j < kids.length && !kids[j].hasAttribute('data-year'); j++) {
        if (kids[j].style.display !== 'none') { any = true; break; }
      }
      el.style.display = any ? '' : 'none';
    });
    const n = state.lens === 'temps' ? total : visible;
    if (countEl) countEl.textContent = `${n} ${word(n)}`;
    // active styling
    root.querySelectorAll<HTMLElement>('[data-lens-btn]').forEach((b) => {
      const t = b.getAttribute('data-lens-btn');
      const v = b.getAttribute('data-lens-val');
      const on =
        (state.lens === 'temps' && t === 'temps') ||
        (state.lens === 'reg' && t === 'reg' && v === state.value) ||
        (state.lens === 'tag' && t === 'tag' && v === state.value);
      b.setAttribute('aria-pressed', String(on));
      b.style.background = on ? 'var(--ink)' : 'transparent';
      b.style.color = on ? 'var(--bg)' : 'var(--ink2)';
      b.style.borderColor = on ? 'var(--ink)' : 'var(--line)';
    });
    // 'Thème' summary button reflects the active tag
    const themeBtn = root.querySelector<HTMLElement>('[data-theme-toggle]');
    if (themeBtn) themeBtn.setAttribute('aria-pressed', String(state.lens === 'tag'));
  };

  const go = (state: LensState) => {
    history.pushState({}, '', location.pathname + lensToParams(state));
    apply(state);
  };

  root.querySelectorAll<HTMLElement>('[data-lens-btn]').forEach((b) => {
    b.addEventListener('click', () => {
      const t = b.getAttribute('data-lens-btn');
      const v = b.getAttribute('data-lens-val') ?? undefined;
      const cur = parseLens(new URLSearchParams(location.search));
      let next: LensState;
      if (t === 'reg' && (v === 'refl' || v === 'design' || v === 'impl')) {
        next = cur.lens === 'reg' && cur.value === v ? { lens: 'temps' } : { lens: 'reg', value: v };
      } else if (t === 'tag' && v) {
        next = cur.lens === 'tag' && cur.value === v ? { lens: 'temps' } : { lens: 'tag', value: v };
      } else {
        next = { lens: 'temps' };
      }
      go(next);
    });
  });

  // Thème disclosure: toggle the tag tray
  const tray = root.querySelector<HTMLElement>('[data-tag-tray]');
  root.querySelector<HTMLElement>('[data-theme-toggle]')?.addEventListener('click', () => {
    tray?.toggleAttribute('hidden');
  });

  window.addEventListener('popstate', () => apply(parseLens(new URLSearchParams(location.search))));
  apply(parseLens(new URLSearchParams(location.search)));
}
```

- [ ] **Step 2: Verify it type-checks** — it's imported nowhere yet, but confirm no syntax/type error by running `pnpm --filter @johan-chan/site exec tsc --noEmit -p tsconfig.json 2>/dev/null || pnpm --filter @johan-chan/site exec astro check`. Expected: 0 errors. (If `astro check` doesn't cover `lib/*.ts`, it'll be checked at build in Task 8.)

- [ ] **Step 3: Commit**

```bash
git add apps/site/src/lib/journal-lens.ts
git commit -m "feat(site): journal-lens client controller"
```

---

### Task 8: `LensSwitcher` + journal pages (the switchover)

**Files:** create `src/components/LensSwitcher.astro`; modify `src/pages/journal/index.astro` + `src/pages/en/journal/index.astro`; delete `src/components/JournalFilters.astro`.

- [ ] **Step 1: Create** `src/components/LensSwitcher.astro`:

```astro
---
import type { Lang } from '../i18n/ui';
import { copy, kindClass, type Registre } from '../lib/copy';
interface Props { lang: Lang; total: number; tags: string[] }
const { lang, total, tags } = Astro.props;
const C = copy[lang];
const L = C.lens;
const regs: Registre[] = ['refl', 'design', 'impl'];
const seriesHref = lang === 'fr' ? '/series' : '/en/series';
---
<div data-lens class="mt-6 md:mt-8">
  <div class="flex flex-wrap items-center gap-x-[22px] gap-y-3">
    <div class="flex flex-wrap items-center gap-2">
      <span class="atl-meta text-faint" style="font-size:11.5px">{L.browse} :</span>
      <button type="button" data-lens-btn="temps" aria-pressed="true"
        class="atl-meta rounded-full border border-line px-3 py-1.5 text-[12px] text-ink2">{L.temps}</button>
      {regs.map((r) => (
        <button type="button" data-lens-btn="reg" data-lens-val={r} aria-pressed="false"
          class="atl-meta inline-flex items-center gap-[7px] rounded-full border border-line px-3 py-1.5 text-[12px] text-ink2">
          <span class={`h-[7px] w-[7px] rounded-full ${kindClass[r]}`} style="background: currentColor"></span>{C.kind[r]}
        </button>
      ))}
      <button type="button" data-theme-toggle aria-pressed="false"
        class="atl-meta inline-flex items-center gap-[7px] rounded-full border border-dashed border-line bg-surf px-3 py-1.5 text-[12px] text-ink2">
        <span style="font-size:13px;line-height:1">＋</span>{L.theme}
      </button>
    </div>
    <a href={seriesHref} class="atl-meta inline-flex items-center gap-1.5 text-ink2 md:ml-auto" style="font-size:12px">{L.seriesLink}</a>
  </div>
  <div data-tag-tray hidden class="mt-3 flex flex-wrap items-center gap-2">
    {tags.map((tg) => (
      <button type="button" data-lens-btn="tag" data-lens-val={tg} aria-pressed="false"
        class="atl-meta rounded-full border border-line px-3 py-1.5 text-[12px] text-ink2">#{tg.toLowerCase()}</button>
    ))}
  </div>
  <div class="mt-3"><span data-count data-total={total} class="atl-meta text-faint" style="font-size:11.5px">{total} {lang === 'fr' ? 'articles' : 'articles'}</span></div>
</div>
<script>
  import { initJournalLens } from '../lib/journal-lens';
  initJournalLens();
</script>
```

- [ ] **Step 2: Rewrite** `src/pages/journal/index.astro`:

```astro
---
import PageLayout from '../../layouts/PageLayout.astro';
import PieceRow from '../../components/PieceRow.astro';
import SeriesRow from '../../components/SeriesRow.astro';
import LensSwitcher from '../../components/LensSwitcher.astro';
import { copy } from '../../lib/copy';
import { getArticles } from '../../lib/content';
import { allTags, journalFeed, groupByYear } from '../../lib/content-utils';
import type { Lang } from '../../i18n/ui';
const lang: Lang = 'fr';
const C = copy[lang];
const list = await getArticles('fr');
const tags = allTags(list);
const rows = groupByYear(journalFeed(list));
---
<PageLayout lang={lang} current="journal" title={`${C.journal.title} — ${C.name}`} canonical="/journal">
  <section class="pt-9 md:pt-14">
    <h1 class="atl-page-title m-0 text-ink">{C.journal.title}</h1>
    <p class="atl-body mt-3.5 max-w-[620px] text-ink2 md:text-[16.5px]">{C.journal.sub}</p>
    <LensSwitcher lang={lang} total={list.length} tags={tags} />
    <div data-feed class="mt-2.5 md:mt-3.5">
      {rows.map((row) => (
        <Fragment>
          {row.firstOfYear && (
            <div data-year={row.year} class="atl-meta mt-7 text-faint" style="font-size:11px;letter-spacing:.1em">{row.year}</div>
          )}
          {row.item.kind === 'series'
            ? <SeriesRow series={row.item.series} lang={lang} />
            : <PieceRow article={row.item.article} lang={lang} />}
        </Fragment>
      ))}
      <div class="border-t border-line"></div>
    </div>
  </section>
</PageLayout>
```

- [ ] **Step 3: Rewrite** `src/pages/en/journal/index.astro` (move onto `PageLayout`, EN paths):

```astro
---
import PageLayout from '../../../layouts/PageLayout.astro';
import PieceRow from '../../../components/PieceRow.astro';
import SeriesRow from '../../../components/SeriesRow.astro';
import LensSwitcher from '../../../components/LensSwitcher.astro';
import { copy } from '../../../lib/copy';
import { getArticles } from '../../../lib/content';
import { allTags, journalFeed, groupByYear } from '../../../lib/content-utils';
import type { Lang } from '../../../i18n/ui';
const lang: Lang = 'en';
const C = copy[lang];
const list = await getArticles('en');
const tags = allTags(list);
const rows = groupByYear(journalFeed(list));
---
<PageLayout lang={lang} current="journal" title={`${C.journal.title} — ${C.name}`} canonical="/en/journal">
  <section class="pt-9 md:pt-14">
    <h1 class="atl-page-title m-0 text-ink">{C.journal.title}</h1>
    <p class="atl-body mt-3.5 max-w-[620px] text-ink2 md:text-[16.5px]">{C.journal.sub}</p>
    <LensSwitcher lang={lang} total={list.length} tags={tags} />
    <div data-feed class="mt-2.5 md:mt-3.5">
      {rows.map((row) => (
        <Fragment>
          {row.firstOfYear && (
            <div data-year={row.year} class="atl-meta mt-7 text-faint" style="font-size:11px;letter-spacing:.1em">{row.year}</div>
          )}
          {row.item.kind === 'series'
            ? <SeriesRow series={row.item.series} lang={lang} />
            : <PieceRow article={row.item.article} lang={lang} />}
        </Fragment>
      ))}
      <div class="border-t border-line"></div>
    </div>
  </section>
</PageLayout>
```

- [ ] **Step 4: Delete the old filter**

```bash
git rm apps/site/src/components/JournalFilters.astro
```

- [ ] **Step 5: Verify** — `pnpm --filter @johan-chan/site exec astro check && pnpm --filter @johan-chan/site build`
Expected: 0 errors; build 45 pages. Then manually (or in Task 9 e2e) confirm: default `/journal` shows the collapsed `SeriesRow` and hides chapter rows; clicking a register filters and updates the URL.

- [ ] **Step 6: Commit**

```bash
git add apps/site/src/components/LensSwitcher.astro "apps/site/src/pages/journal/index.astro" "apps/site/src/pages/en/journal/index.astro" apps/site/src/components/JournalFilters.astro
git commit -m "feat(site): lens switcher + collapsed-series Temps feed (replaces JournalFilters)"
```

---

### Task 9: e2e + final verification

**Files:** modify `tests/smoke.spec.ts`.

- [ ] **Step 1: Reconcile existing tests.** The journal list test asserted `>= 15` flat `piece-row`s. With Temps collapsing, the *visible* default rows are standalones + one `SeriesRow` (chapters hidden via inline style, but still present in the DOM and matched by `getByTestId` unless filtered by visibility). Update the existing `journal list renders all pieces and filters by register` test to drive the new control:

Replace that test's body with:

```ts
test('journal list: lens switcher filters by register and collapses series', async ({ page }) => {
  await page.goto('/journal');
  // Temps (default): the collapsed series row is visible, chapter rows are hidden
  await expect(page.locator('[data-series-row]').first()).toBeVisible();
  await expect(page.locator('[data-testid="piece-row"][data-chapter]').first()).toBeHidden();
  // switch to the refl register lens
  await page.locator('[data-lens-btn="reg"][data-lens-val="refl"]').click();
  await expect(page).toHaveURL(/\?reg=refl$/);
  await expect(page.locator('[data-series-row]').first()).toBeHidden();
  const visible = await page.locator('[data-testid="piece-row"]:visible').count();
  expect(visible).toBeGreaterThan(0);
});
```

- [ ] **Step 2: Add new e2e tests** — append:

```ts
test('theme lens filters by tag and syncs the URL', async ({ page }) => {
  await page.goto('/journal');
  await page.locator('[data-theme-toggle]').click();
  await page.locator('[data-lens-btn="tag"][data-lens-val="craft"]').first().click();
  await expect(page).toHaveURL(/\?tag=craft$/);
  // reload restores the filtered state from the URL
  await page.goto('/journal?tag=craft');
  await expect(page.locator('[data-series-row]').first()).toBeHidden();
  const visible = await page.locator('[data-testid="piece-row"]:visible').count();
  expect(visible).toBeGreaterThan(0);
});

test('Séries link points to the series index', async ({ page }) => {
  await page.goto('/journal');
  await expect(page.locator('[data-lens] a[href="/series"]')).toBeVisible();
});

test('journal has a canonical link to /journal', async ({ page }) => {
  await page.goto('/journal');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/journal$/);
});
```

> If `craft` is not a tag in the content, pick a real tag: run `grep -rh '^tags:' apps/site/src/content/articles/*/index.md* | head` and use one that appears (lowercased as rendered — tags render via `#{tg.toLowerCase()}` but `data-lens-val` is the raw tag; use the raw tag value, e.g. `ia`). Adjust both the click selector and the URL assertion to the chosen tag.

- [ ] **Step 3: Run e2e** — `pnpm --filter @johan-chan/site test:e2e`
Expected: all green (existing updated + 3 new). Investigate any failure; if the visibility assertions are flaky because the inline `display` toggles after `astro:page-load`, add `await page.waitForLoadState('networkidle')` before the first assertion.

- [ ] **Step 4: Full verification** — `pnpm --filter @johan-chan/site check && pnpm --filter @johan-chan/site build`
Expected: `check` 0 errors; build 45 pages.

- [ ] **Step 5: Commit**

```bash
git add apps/site/tests/smoke.spec.ts
git commit -m "test(site): e2e for the journal lens switcher"
```

---

## Verification checklist (end of slice)

- [ ] `pnpm --filter @johan-chan/site test:unit` — green (journalFeed, groupByYear, parseLens/lensToParams).
- [ ] `pnpm --filter @johan-chan/site check` — 0 errors.
- [ ] `pnpm --filter @johan-chan/site test:e2e` — green.
- [ ] `pnpm --filter @johan-chan/site build` — 45 pages.
- [ ] Manual: Temps default shows collapsed series + year headers; Registre/Thème filter + update URL; reload of a `?reg=`/`?tag=` URL restores the view; back/forward works; `Séries →` → `/series`; canonical present. Same under `/en/journal`.
- [ ] `git diff --name-only main..HEAD` — only `apps/site/**` + `docs/**`; the 4 dev-proxy files remain uncommitted; no new dependency.
```
