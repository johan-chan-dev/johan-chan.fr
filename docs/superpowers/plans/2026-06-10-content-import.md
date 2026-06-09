# Old-Content Import (FR) + Hero Images + OG — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Import the real French content from `packages/content` (3 standalone articles + the 12-chapter *Le monde du dev sous choc* series) into `apps/site` as the source of truth, with optimized hero images + OG meta, a missing-translation guard on the language switch, and wireframe content removed.

**Architecture:** Articles gain native Astro image (`image()` + `<Image>`), an `excerpt`, and `imageFocus`. The 15 old pieces are transformed in place (read old `meta.json`+`content.md` → new `index.md` + copied `hero.webp`), all `registre: refl`. The language switch hides when no translated sibling exists. No new dependencies.

**Tech Stack:** Astro 6.4 content collections + `astro:assets`, MDX/MD, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-06-09-content-import-design.md`
**Source (read-only):** `packages/content/articles/*`, `packages/content/series/le-monde-du-dev-sous-choc/*`

---

## Conventions (read once)
- Node 24 (`node -v` → v24.x). Commands via `pnpm --filter @johan-chan/site <script>`.
- **NEVER** `git add -A`/`git add .` — local-only `apps/web/*`, `pnpm-lock.yaml`, `turbo.json` must NOT be committed. Add only exact paths. **No deps added this slice** → `pnpm-lock.yaml` must never appear staged.
- Commit trailer:
  ```
  Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
  ```
- **Typographic apostrophes `’` (U+2019)** in all prose; the old content uses ASCII `'` — normalize in-word ASCII → `’` during import. Verify: `grep -rnE "[A-Za-zÀ-ÿ]'[A-Za-zÀ-ÿ]" <files>` finds nothing.

## File Structure
```
apps/site/src/content.config.ts                 (MODIFY) articles schema → image()/imageFocus/excerpt
apps/site/src/lib/content-utils.ts              (MODIFY) Article + image/imageFocus/excerpt
apps/site/src/lib/content.ts                    (MODIFY) toArticle maps new fields; + hasTranslation()
apps/site/src/layouts/Base.astro                (MODIFY) OG/SEO head (description, ogImage props)
apps/site/src/components/LangSwitch.astro       (MODIFY) hasTranslation prop
apps/site/src/components/Header.astro           (MODIFY) thread hasTranslation
apps/site/src/pages/journal/[slug].astro        (MODIFY) hero <Image> + OG props + hasTranslation
apps/site/src/pages/en/journal/[slug].astro     (MODIFY) same
apps/site/src/pages/projets/[slug].astro        (MODIFY) hasTranslation (+ en/)
apps/site/src/content/articles/<15 slugs>/index.md + images/hero.webp  (CREATE, import)
apps/site/src/content/series.json               (MODIFY) + le-monde-du-dev-sous-choc, − atelier-wasm
apps/site/src/content/articles/{5 wireframe}, projects/atelier-wasm     (DELETE)
apps/site/tests/smoke.spec.ts                   (MODIFY)
```

---

## Task 1: Schema + view-model for image/excerpt

**Files:** `content.config.ts`, `content-utils.ts`, `content.ts`

- [ ] **Step 1: `content.config.ts` — articles schema to the `image()` form**

Change the `articles` `defineCollection` `schema` from `z.object({...})` to the function form and add the three fields:
```ts
  schema: ({ image }) => z.object({
    title: z.string().min(1),
    registre,
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    tags: z.array(z.string()).default([]),
    readingTime: z.number().int().positive(),
    live: z.boolean().default(false),
    series: reference('series').optional(),
    order: z.number().int().positive().optional(),
    repo: z.string().optional(),
    translationId: z.string().optional(),
    image: image().optional(),
    imageFocus: z.enum(['center', 'top', 'bottom']).default('center'),
    excerpt: z.string().optional(),
  }),
```
(Leave the `articles` loader as-is, and `projects`/`series` collections unchanged.)

- [ ] **Step 2: `content-utils.ts` — extend `Article`**

Add a type-only import and three fields (keeps the file pure / vitest-safe):
```ts
import type { ImageMetadata } from 'astro';
// in interface Article:
  image?: ImageMetadata;
  imageFocus?: 'center' | 'top' | 'bottom';
  excerpt?: string;
```

- [ ] **Step 3: `content.ts` — map new fields + add `hasTranslation`**

In `toArticle`, add to the returned object: `image: entry.data.image, imageFocus: entry.data.imageFocus, excerpt: entry.data.excerpt`. Append:
```ts
import { getEntry } from 'astro:content'; // (already imported)
export async function hasTranslation(slug: string, lang: Lang, collection: 'articles' | 'projects'): Promise<boolean> {
  const otherId = lang === 'fr' ? `${slug}/en` : slug;
  return Boolean(await getEntry(collection, otherId));
}
```

- [ ] **Step 4: Type-check + build**

`pnpm --filter @johan-chan/site check && pnpm --filter @johan-chan/site build`
Expected: 0 errors; **14 pages** (existing articles have no `image` → optional, valid).

- [ ] **Step 5: Commit**
```bash
git add apps/site/src/content.config.ts apps/site/src/lib/content-utils.ts apps/site/src/lib/content.ts
git commit -m "feat(site): article schema gains hero image + excerpt; hasTranslation helper

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Hero image rendering + OG/SEO head

**Files:** `Base.astro`, `journal/[slug].astro`, `en/journal/[slug].astro`

- [ ] **Step 1: `Base.astro` — accept + emit OG/SEO**

Add to `Props`: `description?: string; ogImage?: string`. In `<head>` after `<title>`, add:
```astro
{description && <meta name="description" content={description} />}
<meta property="og:title" content={title} />
{description && <meta property="og:description" content={description} />}
<meta property="og:type" content="website" />
{ogImage && <meta property="og:image" content={ogImage} />}
<meta name="twitter:card" content={ogImage ? 'summary_large_image' : 'summary'} />
```
Destructure the new props: `const { lang = 'fr', title = 'Johan Chan', description, ogImage } = Astro.props;`

- [ ] **Step 2: `journal/[slug].astro` — hero block + OG props**

Add `import { Image, getImage } from 'astro:assets';`. After resolving `article`, compute the OG image (absolute):
```ts
const ogImage = article.image
  ? new URL((await getImage({ src: article.image, format: 'webp', width: 1200 })).src, Astro.site).href
  : undefined;
```
Pass to `<Base lang={lang} title={…} description={article.excerpt} ogImage={ogImage}>`.
Render a hero just below the meta row, before `<Content />`:
```astro
{article.image && (
  <figure class="mb-7 overflow-hidden rounded-[14px] border border-line">
    <Image src={article.image} alt={article.title} widths={[480, 800, 1200]}
      sizes="(min-width: 768px) 880px, 100vw"
      class="h-auto w-full" style={`object-position: ${article.imageFocus ?? 'center'}`} />
  </figure>
)}
```

- [ ] **Step 3: `en/journal/[slug].astro`** — apply the identical hero + OG additions (same code; import depth already `../../../`).

- [ ] **Step 4: Type-check + build**

`pnpm --filter @johan-chan/site check && pnpm --filter @johan-chan/site build`
Expected: 0 errors; **14 pages** (no article has an image yet → hero block + ogImage are skipped; OG title/type still emitted). Confirms the rendering path compiles.

- [ ] **Step 5: Commit**
```bash
git add apps/site/src/layouts/Base.astro "apps/site/src/pages/journal/[slug].astro" "apps/site/src/pages/en/journal/[slug].astro"
git commit -m "feat(site): article hero <Image> + OG/SEO head

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Missing-translation guard on the language switch

**Files:** `LangSwitch.astro`, `Header.astro`, the 4 detail routes

- [ ] **Step 1: `LangSwitch.astro` — `hasTranslation` prop**

```astro
---
import type { Lang } from '../i18n/ui';
import { getSiblingLocalePath } from '../i18n/utils';
interface Props { lang: Lang; hasTranslation?: boolean }
const { lang, hasTranslation = true } = Astro.props;
const other: Lang = lang === 'fr' ? 'en' : 'fr';
const href = getSiblingLocalePath(Astro.url, other);
---
{hasTranslation && (
  <a href={href} hreflang={other} data-testid="lang-switch"
    class="atl-meta inline-flex items-center gap-1.5 rounded-full border border-line bg-surf px-[11px] py-[5px] uppercase tracking-[.05em] text-ink"
    aria-label={lang === 'fr' ? 'Switch to English' : 'Passer en français'}>
    {lang}
  </a>
)}
```

- [ ] **Step 2: `Header.astro` — thread it**

Add to `Props`: `hasTranslation?: boolean`. Destructure with default `true`. Pass to `<LangSwitch lang={lang} hasTranslation={hasTranslation} />`.

- [ ] **Step 3: Detail routes compute it**

In `journal/[slug].astro`: `import { hasTranslation } from '../../lib/content';` then `const translated = await hasTranslation(slug!, 'fr', 'articles');` and `<Header lang={lang} current="journal" hasTranslation={translated} />`.
In `en/journal/[slug].astro`: `const translated = await hasTranslation(slug!, 'en', 'articles');` (import depth `../../../`).
In `projets/[slug].astro` + `en/projets/[slug].astro`: same with `'projects'`.
(List/home/about pages don't pass it → default `true`, chrome stays bilingual.)

- [ ] **Step 4: Type-check + build**

Expected: 0 errors; **14 pages**. All current articles are bilingual → `hasTranslation` true → switch still shows everywhere (verify a FR article still shows the switch now).

- [ ] **Step 5: Commit**
```bash
git add apps/site/src/components/LangSwitch.astro apps/site/src/components/Header.astro "apps/site/src/pages/journal/[slug].astro" "apps/site/src/pages/en/journal/[slug].astro" "apps/site/src/pages/projets/[slug].astro" "apps/site/src/pages/en/projets/[slug].astro"
git commit -m "feat(site): hide language switch when no translated sibling exists

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Import the 15 FR articles + series

**Files:** create `apps/site/src/content/articles/<slug>/index.md` + `images/hero.webp` (×15); modify `series.json`

> Transform the in-repo source — do NOT invent content. For EACH source piece, READ its
> `packages/content/.../meta.json` + `content.md`, then write the new entry per the rules.

**Source pieces (slug = source folder name):**
- Standalone (`packages/content/articles/<slug>/`): `10x-plus-productif-ne-veut-pas-dire-ce-que-vous-croyez`, `boring-languages-win`, `ce-que-augmente-veut-dire`.
- Series chapters (`packages/content/series/le-monde-du-dev-sous-choc/<slug>/`): all 12 subfolders (each `meta.json` has `order` 1–12).

- [ ] **Step 1: Transform rules — for each source piece**

Create `apps/site/src/content/articles/<slug>/index.md`:
```md
---
title: <meta.title>
registre: refl
date: "<meta.date>"
tags: <meta.tags>
excerpt: <meta.excerpt>
readingTime: <computed>           # max(1, round(words_in_content.md / 250))
image: ./images/hero.webp
imageFocus: <meta.imageFocus or center>
# chapters only:
series: le-monde-du-dev-sous-choc
order: <meta.order>
---
<content.md body, verbatim, ASCII apostrophes normalized to ’>
```
Then copy the source `images/hero.webp` → `apps/site/src/content/articles/<slug>/images/hero.webp`.
Notes: omit `series`/`order` for the 3 standalone articles. `readingTime`: count words in the body, divide by 250, round, min 1. `tags`: keep as-is from source. Normalize in-word ASCII apostrophes to `’` in title/excerpt/body (NOT in frontmatter keys/structure).

- [ ] **Step 2: Add the series to `series.json`**

Append (read the série's `packages/content/series/le-monde-du-dev-sous-choc/meta.json` for the exact description):
```json
{ "id": "le-monde-du-dev-sous-choc", "title": "Le monde du dev sous choc", "description": "<série meta.description, apostrophes normalized>" }
```
(Leave the existing entries for now — `atelier-wasm` is removed in Task 5.)

- [ ] **Step 3: Verify apostrophes + build**
```bash
grep -rnE "[A-Za-zÀ-ÿ]'[A-Za-zÀ-ÿ]" apps/site/src/content/articles/*/index.md apps/site/src/content/series.json || echo "apostrophes clean"
pnpm --filter @johan-chan/site build
```
Expected: apostrophe check clean; build succeeds — **15 new FR article pages** render with optimized heroes (15 wireframe/showcase + EN still present too). Each chapter shows the "fil · Le monde du dev sous choc, chap. N" line; the language switch is **absent** on these FR-only imports (Task 3 guard). Confirm a hero emitted: `find apps/site/dist/_astro -name '*.webp' | head` is non-empty and `grep -c '<img' apps/site/dist/journal/boring-languages-win/index.html` ≥1.

- [ ] **Step 4: Commit**
```bash
git add apps/site/src/content/articles apps/site/src/content/series.json
git commit -m "feat(site): import 15 real FR articles + Le monde du dev sous choc series

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Remove wireframe content

**Files:** delete 5 wireframe article folders + their EN siblings, the `atelier-wasm` project, and the `atelier-wasm` `series.json` entry.

- [ ] **Step 1: Delete the placeholder articles + the wireframe project**
```bash
git rm -r apps/site/src/content/articles/editeur-code-navigateur-zero-dependance \
          apps/site/src/content/articles/invalider-cache-par-evenements \
          apps/site/src/content/articles/animations-60fps-timeline \
          apps/site/src/content/articles/versionner-ses-decisions \
          apps/site/src/content/articles/artisanat-ere-autocompletion \
          apps/site/src/content/projects/atelier-wasm
```
(These folders include both `index.md`/`index.mdx` and `index.en.*` — `git rm -r` removes all. `reactivite-trois-frameworks` is KEPT.)

- [ ] **Step 2: Remove the `atelier-wasm` entry from `series.json`**

Edit `apps/site/src/content/series.json` to drop the `atelier-wasm` object, leaving only `le-monde-du-dev-sous-choc`.

> Note: `reactivite-trois-frameworks` has no `series`, so removing `atelier-wasm` leaves no dangling reference. `Proof.astro` stays (home hero uses it).

- [ ] **Step 3: Type-check + build**

`pnpm --filter @johan-chan/site check && pnpm --filter @johan-chan/site build`
Expected: 0 errors. Journal now = **15 imported + `reactivite-trois-frameworks`** = 16 FR articles; `/projets` + `/en/projets` are **empty** ("Rien ici pour l'instant", `n === 0`). EN journal = just the showcase (1 EN article). No broken `series`/`reference` (build validates).

- [ ] **Step 4: Commit**
```bash
git add apps/site/src/content/articles apps/site/src/content/projects apps/site/src/content/series.json
git commit -m "chore(site): remove Atelier wireframe content (articles + project + series)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Tests + full verification

**Files:** `apps/site/tests/smoke.spec.ts`

- [ ] **Step 1: Update the smoke suite**

Replace the journal-list register-filter test's `expect(total).toBeGreaterThanOrEqual(5)` is still fine (now ≥16). Add:
```ts
test('imported article renders title, body, and optimized hero', async ({ page }) => {
  await page.goto('/journal/boring-languages-win');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Boring languages win');
  await expect(page.locator('article img')).toBeVisible();           // optimized hero
  await expect(page.locator('.atl-prose')).not.toBeEmpty();
});

test('FR-only imported article hides the language switch', async ({ page }) => {
  await page.goto('/journal/boring-languages-win');
  await expect(page.getByTestId('lang-switch')).toHaveCount(0);
});

test('bilingual showcase article still shows the language switch', async ({ page }) => {
  await page.goto('/journal/reactivite-trois-frameworks');
  await expect(page.getByTestId('lang-switch')).toBeVisible();
});

test('series chapter shows the fil line', async ({ page }) => {
  await page.goto('/journal/le-jour-ou-jai-cesse-davoir-peur-de-lia');
  await expect(page.locator('body')).toContainText('Le monde du dev sous choc');
});
```
(If the existing showcase/EN tests reference removed wireframe slugs, none do — they use `reactivite-trois-frameworks` and `editeur-…`. NOTE: the article-detail smoke test from earlier used `/journal/editeur-code-navigateur-zero-dependance` which is now DELETED — update that test to `/journal/boring-languages-win` or remove it, since editeur is gone. Also the EN article test used the same editeur slug — update those EN tests to the kept showcase `reactivite-trois-frameworks` or remove. Verify by reading the current smoke.spec.ts and fixing any reference to a deleted slug.)

- [ ] **Step 2: Full verification sweep**
```bash
pnpm --filter @johan-chan/site test:unit
pnpm --filter @johan-chan/site check
pnpm --filter @johan-chan/site build
pnpm --filter @johan-chan/site test:e2e
```
Expected: unit green; check 0 errors; build succeeds (exact page count documented in the commit — FR: home + journal + 16 articles + projets(empty) + about; EN: home + journal + reactivite + projets(empty) + about; demo); e2e all green. Any reference to a deleted slug must be fixed, not skipped.

- [ ] **Step 3: Confirm dev-proxy + no stray staged files**

`git status --short` → only `apps/web/*`, `pnpm-lock.yaml`, `turbo.json`, `.claude/` unstaged.

- [ ] **Step 4: Commit**
```bash
git add apps/site/tests/smoke.spec.ts
git commit -m "test(site): cover imported articles, hero, and translation guard

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Self-Review (completed during authoring)

**Spec coverage:** schema image()/imageFocus/excerpt + hasTranslation (T1) · hero `<Image>` + OG head (T2) · missing-translation guard wired through Header→LangSwitch + detail routes (T3) · 15-article + series import with transform rules, derived readingTime, copied heroes, apostrophe normalization (T4) · wireframe cleanup incl. empty /projets (T5) · tests + slug-reference fixes + full sweep (T6). All spec sections map to a task.

**Placeholder scan:** none. T4 transforms in-repo source files (rules + per-field mapping are complete; the "content" is the existing `content.md`, not invented). Exact page count is computed at T6, not asserted blind.

**Type consistency:** `Article` gains `image?: ImageMetadata`/`imageFocus`/`excerpt` (T1) consumed by `toArticle` (T1) and the hero render (T2); `hasTranslation(slug, lang, collection)` defined T1, called by detail routes T3; `LangSwitch` `hasTranslation` prop threaded Header→LangSwitch (T3) and exercised by T6 tests. Deleted slugs (`editeur-…` etc.) are removed in T5 and their stale test references fixed in T6 (explicit instruction to grep + fix). `series.json` gains `le-monde-du-dev-sous-choc` (T4) and loses `atelier-wasm` (T5) — no dangling `reference`.

**Known follow-ups (out of scope):** EN translations of the 15 imported articles (the immediately-following slice — I author, author reviews voice); series detail page; feed hero thumbnails; second project; showcase metrics.
