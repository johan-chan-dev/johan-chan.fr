# Content Layout — Slice 2: ContentHero + Series Detail — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generalise `ArticleHero` into a reusable `ContentHero` (cover + overlaid title/excerpt on the rail, with a no-image fallback), repoint the article readers onto it, and give series detail the same cover hero — including importing the series cover image.

**Architecture:** `ContentHero` takes `image?/imageFocus?/title/excerpt?` plus `kicker` + `meta` **slots** the page fills; it renders the full-bleed banner (image) or a narrow header (no image). The series cover (absent from `apps/site`) is imported to `src/assets/series/<id>.webp` and resolved by an `import.meta.glob` in `content.ts`, returned from `getSeriesEntry`.

**Tech Stack:** Astro 6, `astro:assets`, Playwright (smoke, built preview). No new deps.

**Spec:** `docs/superpowers/specs/2026-06-12-content-hero-series-design.md`. **Branch:** `feat/content-hero-series` (spec committed there). Slice 3 (projects) is a separate plan.

---

## File structure

- `src/components/ArticleHero.astro` → **rename** to `src/components/ContentHero.astro` and generalise.
- `src/pages/journal/[slug].astro` + `src/pages/en/journal/[slug].astro` — **modify**: use `ContentHero` + slots; drop the inline no-image branch + unused `hue`.
- `src/assets/series/le-monde-du-dev-sous-choc.webp` — **create** (import the cover).
- `src/lib/content.ts` — **modify**: glob the series covers; `getSeriesEntry` returns `cover?`.
- `src/pages/series/[slug].astro` + `src/pages/en/series/[slug].astro` — **modify**: wide layout + `ContentHero` + chapter list on the rail.
- `tests/smoke.spec.ts` — **modify**: e2e for the series cover hero.

---

### Task 1: `ContentHero.astro` (generalise `ArticleHero`)

**Files:** rename `src/components/ArticleHero.astro` → `src/components/ContentHero.astro`, then rewrite.

- [ ] **Step 1: Rename**

```bash
git mv apps/site/src/components/ArticleHero.astro apps/site/src/components/ContentHero.astro
```

- [ ] **Step 2: Replace the whole file** `apps/site/src/components/ContentHero.astro` with:

```astro
---
import { Image } from 'astro:assets';
import type { ImageMetadata } from 'astro';
interface Props {
  image?: ImageMetadata;
  imageFocus?: 'center' | 'top' | 'bottom';
  title: string;
  excerpt?: string;
}
const { image, imageFocus = 'center', title, excerpt } = Astro.props;
---
{image ? (
  <figure
    class="relative -mx-[22px] mb-10 flex min-h-[480px] flex-col justify-end overflow-hidden rounded-[16px] md:-mx-[56px]"
  >
    <Image src={image} alt={title} widths={[640, 960, 1280, 1600]} sizes="(min-width: 1136px) 1080px, 100vw"
      class="absolute inset-0 h-full w-full object-cover" style={`object-position: ${imageFocus}`} />
    <div class="absolute inset-0"
      style="background: linear-gradient(to bottom, transparent 0%, transparent 28%, rgba(0,0,0,.5) 62%, rgba(0,0,0,.86) 100%)"></div>
    <div class="relative z-10 mx-auto w-full max-w-[680px] px-[22px] pb-9 pt-12 md:px-0"
      style="color:#ededed;text-shadow:0 1px 6px rgba(0,0,0,.5)">
      <div class="atl-meta mb-3 uppercase" style="font-size:11px;letter-spacing:.12em;color:rgba(255,255,255,.82)"><slot name="kicker" /></div>
      <h1 class="font-display text-[31px] font-bold leading-[1.05] tracking-[-.03em] md:text-[46px]" style="text-wrap:balance">{title}</h1>
      {excerpt && (
        <p class="mt-4 max-w-[600px] font-text text-[16px] leading-[1.5] md:text-[18px]" style="color:rgba(255,255,255,.9)">{excerpt}</p>
      )}
      <div class="atl-meta mt-5 flex flex-wrap items-center gap-3" style="font-size:11.5px;color:rgba(255,255,255,.72)"><slot name="meta" /></div>
    </div>
  </figure>
) : (
  <div class="mx-auto max-w-[680px]">
    <div class="atl-meta mb-3.5 uppercase text-accent" style="font-size:11px;letter-spacing:.08em"><slot name="kicker" /></div>
    <h1 class="font-display text-[31px] font-bold leading-[1.04] tracking-[-.03em] text-ink md:text-[44px]" style="text-wrap:balance">{title}</h1>
    {excerpt && <p class="mt-4 max-w-[600px] font-text text-[17px] leading-[1.5] text-ink2">{excerpt}</p>}
    <div class="atl-meta mt-5 flex flex-wrap items-center gap-3.5 text-faint" style="font-size:11.5px"><slot name="meta" /></div>
  </div>
)}
```

- [ ] **Step 3: Type-check**

Run: `pnpm --filter @johan-chan/site exec astro check`
Expected: errors only about `ArticleHero` no longer existing (the journal readers still import it) — that's fixed in Task 2. (If you want a clean check now, do Tasks 1 and 2 before checking.)

- [ ] **Step 4: Commit** (NEVER `git add -A`)

```bash
git add apps/site/src/components/ArticleHero.astro apps/site/src/components/ContentHero.astro
git commit -m "feat(site): generalise ArticleHero into ContentHero (kicker/meta slots)"
```

---

### Task 2: Repoint the article readers onto `ContentHero`

**Files:** `src/pages/journal/[slug].astro`, `src/pages/en/journal/[slug].astro`.

- [ ] **Step 1 (FR): import** — change `import ArticleHero from '../../components/ArticleHero.astro';` to:
```astro
import ContentHero from '../../components/ContentHero.astro';
```

- [ ] **Step 2 (FR): replace the hero block** — replace this entire block:
```astro
      {article.image ? (
        <ArticleHero image={article.image} imageFocus={article.imageFocus}
          title={article.title} excerpt={article.excerpt} date={article.date}
          readingTime={article.readingTime} tags={article.tags} registre={article.registre}
          series={article.series} order={article.order} lang={lang} />
      ) : (
        <div class="mx-auto max-w-[680px]">
          {article.series ? (
            <a href={`/series/${article.series.id}`} class={`atl-meta mb-3.5 inline-block uppercase ${hue}`} style="font-size:11px;letter-spacing:.08em">{C.series} · {article.series.title}, {C.chapter} {article.order}</a>
          ) : (
            <span class={`atl-meta mb-3.5 inline-flex items-center gap-2 uppercase ${hue}`} style="font-size:11px;letter-spacing:.1em">
              <span class="h-[7px] w-[7px] rounded-full" style="background: currentColor"></span>{C.kind[article.registre]}
            </span>
          )}
          <h1 class="font-display text-[31px] font-bold leading-[1.04] tracking-[-.03em] text-ink md:text-[44px]" style="text-wrap:balance">{article.title}</h1>
          {article.excerpt && <p class="mt-4 max-w-[600px] font-text text-[17px] leading-[1.5] text-ink2">{article.excerpt}</p>}
          <div class="atl-meta mt-5 flex flex-wrap items-center gap-3.5 text-faint" style="font-size:11.5px">
            <span>{fmtDate(article.date, lang)}</span><span>·</span><span>{article.readingTime} {C.read}</span><span>·</span>
            <span class="flex gap-2">{article.tags.map((tg) => <span class="text-ink2">#{tg.toLowerCase()}</span>)}</span>
          </div>
        </div>
      )}
```
with:
```astro
      <ContentHero image={article.image} imageFocus={article.imageFocus} title={article.title} excerpt={article.excerpt}>
        <Fragment slot="kicker">
          {article.series ? (
            <a href={`/series/${article.series.id}`} style="color:inherit">{C.series} · {article.series.title}, {C.chapter} {article.order}</a>
          ) : (
            <span class="inline-flex items-center gap-2"><span class="h-[7px] w-[7px] rounded-full" style="background: currentColor"></span>{C.kind[article.registre]}</span>
          )}
        </Fragment>
        <Fragment slot="meta">
          <span>{fmtDate(article.date, lang)}</span><span>·</span><span>{article.readingTime} {C.read}</span>
          {article.tags.length > 0 && <span>·</span>}
          <span class="flex flex-wrap gap-2">{article.tags.map((tg) => <span>#{tg.toLowerCase()}</span>)}</span>
        </Fragment>
      </ContentHero>
```

- [ ] **Step 3 (FR): drop the now-unused `hue`** — `const hue = kindClass[article.registre];` is no longer referenced (the related-cards block uses `kindClass[rp.registre]` directly). Delete that one line. Keep the `kindClass` import (still used by related cards).

- [ ] **Step 4 (EN):** apply Steps 1–3 to `src/pages/en/journal/[slug].astro` — same edits, but the import path is `'../../../components/ContentHero.astro'` and the series breadcrumb href is `/en/series/${article.series.id}` (keep the rest identical).

- [ ] **Step 5: Type-check + build**

Run: `pnpm --filter @johan-chan/site exec astro check && pnpm --filter @johan-chan/site build`
Expected: 0 errors; 45 pages. The article hero renders identically to before (image cover + overlay, or the no-image header) — now via `ContentHero`.

- [ ] **Step 6: Commit**

```bash
git add "apps/site/src/pages/journal/[slug].astro" "apps/site/src/pages/en/journal/[slug].astro"
git commit -m "feat(site): article readers use ContentHero with kicker/meta slots"
```

---

### Task 3: Import the series cover + resolve it in `content.ts`

**Files:** create `src/assets/series/le-monde-du-dev-sous-choc.webp`; modify `src/lib/content.ts`.

- [ ] **Step 1: Import the cover asset**

```bash
mkdir -p apps/site/src/assets/series
cp packages/content/series/le-monde-du-dev-sous-choc/images/cover.webp apps/site/src/assets/series/le-monde-du-dev-sous-choc.webp
```

- [ ] **Step 2: Add the glob resolver to `content.ts`**

Near the top of `apps/site/src/lib/content.ts` (after the existing imports), add the `ImageMetadata` type import and the cover map:
```ts
import type { ImageMetadata } from 'astro';

const seriesCovers = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/series/*.{webp,png,jpg,jpeg}',
  { eager: true },
);
function seriesCover(id: string): ImageMetadata | undefined {
  const hit = Object.entries(seriesCovers).find(
    ([p]) => p.split('/').pop()?.replace(/\.[^.]+$/, '') === id,
  );
  return hit?.[1].default;
}
```
(If `import type { ImageMetadata } from 'astro';` already exists in the file, don't duplicate it.)

- [ ] **Step 3: Return the cover from `getSeriesEntry`**

Change the `getSeriesEntry` return from:
```ts
  return { series: meta, chapters };
```
to:
```ts
  return { series: meta, chapters, cover: seriesCover(slug) };
```

- [ ] **Step 4: Type-check + build**

Run: `pnpm --filter @johan-chan/site exec astro check && pnpm --filter @johan-chan/site build`
Expected: 0 errors; 45 pages (no consumer of `cover` yet — added in Task 4; the cover asset is imported and optimised at build).

- [ ] **Step 5: Commit**

```bash
git add apps/site/src/assets/series/le-monde-du-dev-sous-choc.webp apps/site/src/lib/content.ts
git commit -m "feat(site): import series cover + resolve it in getSeriesEntry"
```

---

### Task 4: Series detail pages adopt the layout

**Files:** `src/pages/series/[slug].astro`, `src/pages/en/series/[slug].astro`.

- [ ] **Step 1 (FR): rewrite** `apps/site/src/pages/series/[slug].astro` with:

```astro
---
import PageLayout from '../../layouts/PageLayout.astro';
import { getImage } from 'astro:assets';
import ContentHero from '../../components/ContentHero.astro';
import { copy, fmtDate } from '../../lib/copy';
import { getSeriesList, getSeriesEntry } from '../../lib/content';
import type { Lang } from '../../i18n/ui';
export async function getStaticPaths() {
  const list = await getSeriesList('fr');
  return list.map((s) => ({ params: { slug: s.id } }));
}
const lang: Lang = 'fr';
const { slug } = Astro.params;
const { series, chapters, cover } = await getSeriesEntry(slug!, lang);
const C = copy[lang];
const dates = chapters.map((c) => c.date).sort();
const first = dates[0];
const last = dates[dates.length - 1];
const ogImage = cover
  ? new URL((await getImage({ src: cover, format: 'webp', width: 1200 })).src, Astro.site).href
  : undefined;
---
<PageLayout lang={lang} current="journal" title={`${series.title} — ${C.name}`} description={series.description} ogImage={ogImage}>
  <article class="atl-rise pt-8 md:pt-10">
    <div class="mx-auto max-w-[680px]">
      <a href="/series" class="atl-meta inline-flex items-center gap-2 text-ink2" style="font-size:12px">{C.seriesIndex.back}</a>
    </div>
    <div class="mt-4">
      <ContentHero image={cover} title={series.title} excerpt={series.description}>
        <Fragment slot="kicker">{C.series}</Fragment>
        <Fragment slot="meta">
          <span>{chapters.length} {C.seriesIndex.chapters}</span><span>·</span><span>{fmtDate(first, lang)} → {fmtDate(last, lang)}</span>
        </Fragment>
      </ContentHero>
    </div>
    <div class="mx-auto mt-9 max-w-[680px]">
      <ol class="list-none p-0">
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
    </div>
  </article>
</PageLayout>
```

- [ ] **Step 2 (EN): rewrite** `apps/site/src/pages/en/series/[slug].astro` — identical except import depth `../../../`, `getSeriesList('en')`, `lang = 'en'`, back link `/en/series`, and chapter links `/en/journal/${c.slug}`:

```astro
---
import PageLayout from '../../../layouts/PageLayout.astro';
import { getImage } from 'astro:assets';
import ContentHero from '../../../components/ContentHero.astro';
import { copy, fmtDate } from '../../../lib/copy';
import { getSeriesList, getSeriesEntry } from '../../../lib/content';
import type { Lang } from '../../../i18n/ui';
export async function getStaticPaths() {
  const list = await getSeriesList('en');
  return list.map((s) => ({ params: { slug: s.id } }));
}
const lang: Lang = 'en';
const { slug } = Astro.params;
const { series, chapters, cover } = await getSeriesEntry(slug!, lang);
const C = copy[lang];
const dates = chapters.map((c) => c.date).sort();
const first = dates[0];
const last = dates[dates.length - 1];
const ogImage = cover
  ? new URL((await getImage({ src: cover, format: 'webp', width: 1200 })).src, Astro.site).href
  : undefined;
---
<PageLayout lang={lang} current="journal" title={`${series.title} — ${C.name}`} description={series.description} ogImage={ogImage}>
  <article class="atl-rise pt-8 md:pt-10">
    <div class="mx-auto max-w-[680px]">
      <a href="/en/series" class="atl-meta inline-flex items-center gap-2 text-ink2" style="font-size:12px">{C.seriesIndex.back}</a>
    </div>
    <div class="mt-4">
      <ContentHero image={cover} title={series.title} excerpt={series.description}>
        <Fragment slot="kicker">{C.series}</Fragment>
        <Fragment slot="meta">
          <span>{chapters.length} {C.seriesIndex.chapters}</span><span>·</span><span>{fmtDate(first, lang)} → {fmtDate(last, lang)}</span>
        </Fragment>
      </ContentHero>
    </div>
    <div class="mx-auto mt-9 max-w-[680px]">
      <ol class="list-none p-0">
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
    </div>
  </article>
</PageLayout>
```

- [ ] **Step 3: Type-check + build**

Run: `pnpm --filter @johan-chan/site exec astro check && pnpm --filter @johan-chan/site build`
Expected: 0 errors; 45 pages. The series detail now leads with the cover banner.

- [ ] **Step 4: Commit**

```bash
git add "apps/site/src/pages/series/[slug].astro" "apps/site/src/pages/en/series/[slug].astro"
git commit -m "feat(site): series detail adopts the cover + reading-rail layout"
```

---

### Task 5: e2e + final verification

**Files:** `tests/smoke.spec.ts`.

- [ ] **Step 1: Add the series-cover test** — append to `apps/site/tests/smoke.spec.ts`:

```ts
test('series detail leads with a cover hero', async ({ page }) => {
  await page.goto('/series/le-monde-du-dev-sous-choc');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('article figure img').first()).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Le monde du dev sous choc');
  await expect(page.locator('article')).toContainText('chapitres');
  expect(await page.getByTestId('chapter-link').count()).toBeGreaterThanOrEqual(12);
});
```

- [ ] **Step 2: Run the full e2e suite**

Run: `pnpm --filter @johan-chan/site test:e2e`
Expected: all pass (the existing 27 + 1 new = 28). The article-hero tests (`article figure img`, series breadcrumb, prev/next) still pass via `ContentHero`; the series tests (chapter list) still pass. If `article figure img` fails on the series page, the cover didn't resolve — inspect the built `/series/le-monde-du-dev-sous-choc/index.html` for an `<img>` and check the glob path/id match (status BLOCKED with details — don't weaken the test).

- [ ] **Step 3: Full verification**

Run: `pnpm --filter @johan-chan/site check && pnpm --filter @johan-chan/site build`
Expected: `check` 0 errors; build 45 pages + Pagefind "Indexed 32 pages".

- [ ] **Step 4: Commit**

```bash
git add apps/site/tests/smoke.spec.ts
git commit -m "test(site): e2e for the series cover hero"
```

---

## Verification checklist (end of slice)

- [ ] `pnpm --filter @johan-chan/site check` — 0 errors.
- [ ] `pnpm --filter @johan-chan/site test:e2e` — 28 green.
- [ ] `pnpm --filter @johan-chan/site build` — 45 pages + 32 indexed.
- [ ] Manual (desktop + mobile, both locales): `/series/le-monde-du-dev-sous-choc` leads with a cover banner (title + description overlaid, light text), then the chapter list on the rail; article pages look unchanged (cover hero via `ContentHero`); the image-less `reactivite-trois-frameworks` still shows its fallback header with the excerpt.
- [ ] `git diff --name-only main..HEAD` — only `apps/site/**` + `docs/**` (incl. the new `src/assets/series/` image); the 4 dev-proxy files remain uncommitted; no new dependency.
