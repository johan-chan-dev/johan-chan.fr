# EN Content + i18n Routes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-enable English content + EN content routes on `apps/site` using **sibling `index.en.mdx` files** (stable slugs), making the content layer locale-aware.

**Architecture:** EN bodies live next to FR ones in the same article/project folder, sharing colocated demo files. The `glob`/`generateId` derives a `lang` from the entry id (id ending `/en` = EN), the query layer filters by `lang`, EN routes mirror the FR ones, and nav becomes locale-aware again. No new dependencies.

**Tech Stack:** Astro 6.4 content collections, MDX, Vitest, Playwright. (No dep changes → no lockfile dance.)

**Spec:** `docs/superpowers/specs/2026-06-09-en-i18n-content-design.md`

---

## Conventions (read once)

- Commands: `pnpm --filter @johan-chan/site <script>` (`check`, `test:unit`, `test:e2e`, `build`). Node is 24 (fnm auto-selects from `.nvmrc`; confirm `node -v` is v24.x).
- **NEVER** `git add -A`/`git add .` — local-only `apps/web/*`, `pnpm-lock.yaml`, `turbo.json` must NOT be committed. Add only exact paths.
- Commit trailer:
  ```
  Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
  ```
- **Typographic apostrophes** `’` (U+2019) in ALL prose, FR and EN (English too: `it's` → `it’s`, `framework's` → `framework’s`). Verify after writing: `grep -rnE "[A-Za-z][']\b|[A-Za-z]'[A-Za-z]" <file>` should find no ASCII `'` inside words (ASCII `'` is allowed only in code/frontmatter delimiters).
- This slice adds no deps — `apps/site/package.json` and the lockfile are untouched.

## File Structure

```
apps/site/src/content.config.ts                         (MODIFY) glob + generateId ×2
apps/site/src/lib/content-utils.ts                      (MODIFY) + localeOf/slugOf
apps/site/src/lib/content.ts                            (MODIFY) lang-aware wrappers
apps/site/src/pages/{index,journal/index,journal/[slug],projets/index,projets/[slug]}.astro (MODIFY) pass 'fr'
apps/site/src/pages/en/index.astro                      (MODIFY) getArticles('en')
apps/site/src/pages/en/journal/index.astro              (CREATE)
apps/site/src/pages/en/journal/[slug].astro             (CREATE)
apps/site/src/pages/en/projets/index.astro              (CREATE)
apps/site/src/pages/en/projets/[slug].astro             (CREATE)
apps/site/src/components/{Header,MobileNav}.astro       (MODIFY) locale-aware nav
apps/site/src/content/articles/<slug>/index.en.{md,mdx} (CREATE ×6)
apps/site/src/content/projects/atelier-wasm/index.en.mdx(CREATE)
apps/site/tests/content-utils.test.ts                   (MODIFY) localeOf/slugOf tests
apps/site/tests/smoke.spec.ts                           (MODIFY) EN coverage
```

---

## Task 1: Collection config — capture `index.en.*`

**Files:** `apps/site/src/content.config.ts`

- [ ] **Step 1: Widen glob + generateId for both `articles` and `projects`**

In each `defineCollection` loader, replace:
```ts
    pattern: '*/index.{md,mdx}',
    base: './src/content/articles',   // (or projects)
    generateId: ({ entry }) => entry.replace(/\/index\.mdx?$/, ''),
```
with:
```ts
    pattern: '*/index*.{md,mdx}',
    base: './src/content/articles',   // (or projects)
    generateId: ({ entry }) =>
      entry.replace(/\/index\.en\.mdx?$/, '/en').replace(/\/index\.mdx?$/, ''),
```
This makes `<slug>/index.mdx → <slug>` (FR) and `<slug>/index.en.mdx → <slug>/en` (EN). No EN files exist yet, so nothing changes functionally this task.

- [ ] **Step 2: Build**

Run: `pnpm --filter @johan-chan/site build`
Expected: still **14 pages**, 0 errors (glob now also *would* match `index.en.*`, but none exist yet).

- [ ] **Step 3: Commit**

```bash
git add apps/site/src/content.config.ts
git commit -m "feat(site): content glob captures sibling index.en.* locale files

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Locale-aware query layer + FR route updates

**Files:** `apps/site/src/lib/content-utils.ts`, `apps/site/src/lib/content.ts`, `apps/site/tests/content-utils.test.ts`, the 5 FR page files + `en/index.astro`

- [ ] **Step 1: Add failing tests for the id helpers** — append to `apps/site/tests/content-utils.test.ts`

```ts
import { localeOf, slugOf } from '../src/lib/content-utils';

describe('localeOf / slugOf', () => {
  it('FR id → fr + same slug', () => {
    expect(localeOf('editeur-wasm')).toBe('fr');
    expect(slugOf('editeur-wasm')).toBe('editeur-wasm');
  });
  it('EN id → en + stripped slug', () => {
    expect(localeOf('editeur-wasm/en')).toBe('en');
    expect(slugOf('editeur-wasm/en')).toBe('editeur-wasm');
  });
});
```

- [ ] **Step 2: Run → FAIL** (`localeOf`/`slugOf` not exported). `pnpm --filter @johan-chan/site test:unit`

- [ ] **Step 3: Add the helpers to `content-utils.ts`** (append)

```ts
export const localeOf = (id: string): 'fr' | 'en' => (id.endsWith('/en') ? 'en' : 'fr');
export const slugOf = (id: string): string => id.replace(/\/en$/, '');
```

- [ ] **Step 4: Run → PASS.** `pnpm --filter @johan-chan/site test:unit`

- [ ] **Step 5: Make `content.ts` wrappers lang-aware**

Edit `apps/site/src/lib/content.ts`:
- Add `import type { Lang } from '../i18n/ui';` and `import { byDateDesc, localeOf, slugOf } from './content-utils';`
- In `toArticle`, set `slug: slugOf(entry.id)` (instead of `entry.id`).
- In `toProject`, set `slug: slugOf(entry.id)`.
- Rewrite the signatures:
```ts
export async function getArticles(lang: Lang): Promise<Article[]> {
  const entries = (await getCollection('articles')).filter((e) => localeOf(e.id) === lang);
  return byDateDesc(await Promise.all(entries.map(toArticle)));
}
export async function getArticleEntry(slug: string, lang: Lang) {
  const entry = await getEntry('articles', lang === 'en' ? `${slug}/en` : slug);
  if (!entry) throw new Error(`Article not found: ${slug} (${lang})`);
  const [article, rendered] = await Promise.all([toArticle(entry), render(entry)]);
  return { article, Content: rendered.Content };
}
export async function getProjects(lang: Lang): Promise<Project[]> {
  return (await getCollection('projects')).filter((e) => localeOf(e.id) === lang).map(toProject);
}
export async function getProjectEntry(slug: string, lang: Lang) {
  const entry = await getEntry('projects', lang === 'en' ? `${slug}/en` : slug);
  if (!entry) throw new Error(`Project not found: ${slug} (${lang})`);
  const { Content } = await render(entry);
  return { project: toProject(entry), Content };
}
```
(`getSeries(id)` unchanged — series stay mono-language.)

- [ ] **Step 6: Update FR routes to pass `'fr'` (and EN home to `'en'`)**

- `src/pages/index.astro`: `piecesByDate`/`getArticles()` → `await getArticles('fr')`.
- `src/pages/journal/index.astro`: `await getArticles('fr')`.
- `src/pages/journal/[slug].astro`: `getStaticPaths` → `(await getArticles('fr')).map((a) => ({ params: { slug: a.slug } }))`; `getArticleEntry(slug!, 'fr')`; the "read next" `await getArticles('fr')`.
- `src/pages/projets/index.astro`: `await getProjects('fr')`.
- `src/pages/projets/[slug].astro`: `getStaticPaths` → `(await getProjects('fr')).map(...)`; `getProjectEntry(slug!, 'fr')`; `articlesBySlugs(project.relatedArticles, await getArticles('fr'))`.
- `src/pages/en/index.astro`: its preview → `await getArticles('en')`.

- [ ] **Step 7: Type-check + build**

Run: `pnpm --filter @johan-chan/site check && pnpm --filter @johan-chan/site build`
Expected: 0 errors; **14 pages** (FR unchanged; EN home preview now empty until Task 3 adds EN content — that's expected and fine).

- [ ] **Step 8: Commit**

```bash
git add apps/site/src/lib/content-utils.ts apps/site/src/lib/content.ts apps/site/tests/content-utils.test.ts apps/site/src/pages/index.astro apps/site/src/pages/journal/index.astro "apps/site/src/pages/journal/[slug].astro" apps/site/src/pages/projets/index.astro "apps/site/src/pages/projets/[slug].astro" apps/site/src/pages/en/index.astro
git commit -m "feat(site): locale-aware content query (lang param + id-derived locale)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: English content (sibling `index.en.*`)

**Files:** 6 `index.en.{md,mdx}` + 1 project `index.en.mdx` (create); FR reactivity prose fix.

> Typographic `’` in all prose. The two island articles' EN bodies import the **same** colocated demo files (same relative paths) — only prose + the `<Proof lang>`/figcaption text change.

- [ ] **Step 1: `articles/editeur-code-navigateur-zero-dependance/index.en.mdx`**

```mdx
---
title: A code editor in the browser, zero dependencies
registre: impl
date: "2026-05-28"
tags: [WebAssembly, Perf, Editor]
readingTime: 14
live: true
series: atelier-wasm
order: 2
repo: wasm-workshop
---
import Proof from '../../../components/Proof.astro';

The what, the why, then the how, down to the code. We want an editor that runs
entirely in the browser, with no server to compile or highlight.

<figure class="my-7 overflow-hidden rounded-[14px] border border-line bg-surf">
  <figcaption class="atl-meta flex items-center gap-2 border-b border-line px-3.5 py-2.5 text-ink2" style="font-size:11px">
    <span class="h-[7px] w-[7px] rounded-full bg-accent" style="box-shadow:0 0 7px var(--accent)"></span>live demo, inline
  </figcaption>
  <div class="p-4"><Proof lang="en" /></div>
</figure>

You handle it, you get it, you move on. It’s the same engine that ships in the product.
```

- [ ] **Step 2: `articles/invalider-cache-par-evenements/index.en.md`**

```md
---
title: Invalidating a cache by events, not TTL
registre: design
date: "2026-05-12"
tags: [Systems, Cache]
readingTime: 9
---
A TTL is hoping that time does the work. Better to invalidate when the event that
makes the data stale actually happens — consistency becomes a consequence of the
system, not a bet.
```

- [ ] **Step 3: `articles/animations-60fps-timeline/index.en.md`**

```md
---
title: 60 fps animations driven by a timeline
registre: impl
date: "2026-04-30"
tags: [Animation, Canvas]
readingTime: 11
live: true
---
A declarative timeline separates the what from the when. You describe the state at
each instant; the engine keeps the 16 ms-per-frame budget.
```

- [ ] **Step 4: `articles/versionner-ses-decisions/index.en.md`**

```md
---
title: Version your decisions, not just your code
registre: refl
date: "2026-05-20"
tags: [Practice, ADR]
readingTime: 6
---
Code says what you do; it doesn’t say why. Keeping a record of decisions — and of
what you ruled out — is often worth more than the diff itself.
```

- [ ] **Step 5: `articles/artisanat-ere-autocompletion/index.en.md`**

```md
---
title: Craft in the age of autocompletion
registre: refl
date: "2026-05-03"
tags: [Craft, AI]
readingTime: 8
---
The machine proposes, accelerates, explores. The craft hasn’t disappeared: it’s
shifted toward judgment — knowing which code is good, and why.
```

- [ ] **Step 6: `articles/reactivite-trois-frameworks/index.en.mdx`**

```mdx
---
title: Reactivity, from one framework to another
registre: design
date: "2026-06-09"
tags: [Reactivity, Frameworks]
readingTime: 7
---
import FrameworkShowcase from '../../../components/content/FrameworkShowcase.astro';
import Demo from '../../../components/content/Demo.astro';
import Svelte from './counter.svelte';  import svelteSrc from './counter.svelte?raw';
import Vue from './counter.vue';        import vueSrc from './counter.vue?raw';
import React from './counter.tsx';      import reactSrc from './counter.tsx?raw';
import { NgCounter } from './counter.angular';  import ngSrc from './counter.angular.ts?raw';

A counter is trivial — but how you get there says a lot about each framework’s philosophy. The same pattern, four times:

<FrameworkShowcase>
  <Demo framework="svelte" source={svelteSrc}><Svelte client:visible /></Demo>
  <Demo framework="vue" source={vueSrc}><Vue client:visible /></Demo>
  <Demo framework="react" source={reactSrc}><React client:visible /></Demo>
  <Demo framework="angular" source={ngSrc}><NgCounter client:load /></Demo>
</FrameworkShowcase>

In Svelte, reactivity is implicit: you declare `count`, you use it, and the view follows. In Vue it goes through a `ref` and a `.value` the template hides. In React, state is explicit and the render re-runs on every `setCount` — more ceremony, more control. In Angular, change detection tracks it through the component. Four answers to the same question.
```

- [ ] **Step 7: `projects/atelier-wasm/index.en.mdx`**

```mdx
---
name: WASM Workshop
year: "2026"
role: Design and build, end to end
oneliner: A code editor that runs entirely in the browser, no server, no heavy dependencies.
stack: [Rust, WebAssembly, TypeScript]
demo: true
relatedArticles:
  - editeur-code-navigateur-zero-dependance
  - invalider-cache-par-evenements
  - versionner-ses-decisions
---
It started as a small frustration: I wanted a little editor to try out code, and everything I found needed a server behind it to compile and highlight. Heavy, slow on first load, and a cost that climbs with every visitor.

I wondered how far you could go with no server at all. I pulled out a Rust kernel, compiled to WebAssembly, that does the analysis right in the browser. No network round-trip. The interface stayed deliberately thin; the system carries the weight, where it belongs.

Along the way I had to rethink a couple of things I thought were settled — mainly how to keep the display fast while you type. I wrote about it as the work happened, which is more honest than pretending it was obvious.

In the end it starts instantly, costs nothing per session, and the base held without a rewrite. One engine serves both what you see and what computes. That’s the kind of result I like: quiet, but solid.
```

- [ ] **Step 8: Fix the stale FR reactivity prose (count is now four frameworks)**

In `articles/reactivite-trois-frameworks/index.mdx`, update the two "trois" mentions: `Le même pattern, trois fois :` → `Le même pattern, quatre fois :`, and append an Angular clause to the closing sentence + change `Trois réponses` → `Quatre réponses`:
```
Côté Svelte, la réactivité est implicite : on déclare `count`, on l’utilise, et l’affichage suit. Côté Vue, elle passe par une `ref` et un `.value` masqué par le template. Côté React, l’état est explicite et le rendu se relance à chaque `setCount` — plus de cérémonie, plus de contrôle. Côté Angular, la détection de changements la suit à travers le composant. Quatre réponses à la même question.
```

- [ ] **Step 9: Verify apostrophes + build**

```bash
python3 -c "import glob,re; [print(f, re.findall(r\"[A-Za-zÀ-ÿ]'[A-Za-zÀ-ÿ]\", open(f,encoding='utf-8').read())) for f in glob.glob('apps/site/src/content/**/*.md*', recursive=True)]"
pnpm --filter @johan-chan/site build
```
Expected: the python check prints empty lists for every file (no in-word ASCII apostrophes). Build **14 pages** (EN entries validated but not yet routed; their bodies aren't rendered until Task 4 — frontmatter is validated now). If a frontmatter is invalid, the build fails here.

- [ ] **Step 10: Commit**

```bash
git add apps/site/src/content/articles apps/site/src/content/projects
git commit -m "feat(site): English translations (sibling index.en.* files)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: EN content routes + locale-aware nav

**Files:** 4 EN route files (create) + `Header.astro`, `MobileNav.astro` (modify)

- [ ] **Step 1: `apps/site/src/pages/en/journal/index.astro`**

```astro
---
import Base from '../../../layouts/Base.astro';
import Header from '../../../components/Header.astro';
import Footer from '../../../components/Footer.astro';
import PieceRow from '../../../components/PieceRow.astro';
import JournalFilters from '../../../components/JournalFilters.astro';
import { copy } from '../../../lib/copy';
import { getArticles } from '../../../lib/content';
import { allTags } from '../../../lib/content-utils';
import type { Lang } from '../../../i18n/ui';
const lang: Lang = 'en';
const C = copy[lang];
const list = await getArticles('en');
const tags = allTags(list);
---
<Base lang={lang} title={`${C.journal.title} — ${C.name}`}>
  <Header lang={lang} current="journal" />
  <main class="atl-container pb-16 md:pb-24">
    <section class="pt-9 md:pt-14">
      <h1 class="atl-page-title m-0 text-ink">{C.journal.title}</h1>
      <p class="atl-body mt-3.5 max-w-[620px] text-ink2 md:text-[16.5px]">{C.journal.sub}</p>
      <JournalFilters lang={lang} total={list.length} tags={tags} />
      <div class="mt-2.5 md:mt-3.5">
        {list.map((a) => <PieceRow article={a} lang={lang} />)}
        <div class="border-t border-line"></div>
      </div>
    </section>
  </main>
  <Footer lang={lang} />
</Base>
```

- [ ] **Step 2: `apps/site/src/pages/en/projets/index.astro`**

```astro
---
import Base from '../../../layouts/Base.astro';
import Header from '../../../components/Header.astro';
import Footer from '../../../components/Footer.astro';
import ProjectCard from '../../../components/ProjectCard.astro';
import { copy } from '../../../lib/copy';
import { getProjects } from '../../../lib/content';
import type { Lang } from '../../../i18n/ui';
const lang: Lang = 'en';
const C = copy[lang];
const projects = await getProjects('en');
const n = projects.length;
const word = n > 1 ? 'projects' : 'project';
---
<Base lang={lang} title={`${C.projects.title} — ${C.name}`}>
  <Header lang={lang} current="work" />
  <main class="atl-container pb-16 md:pb-24">
    <section class="pt-9 md:pt-14">
      <h1 class="atl-page-title m-0 text-ink">{C.projects.title}</h1>
      <p class="atl-body mt-3.5 max-w-[620px] text-ink2 md:text-[16.5px]">{C.projects.sub}</p>
      <span class="atl-meta mt-6 block text-faint md:mt-8" style="font-size:11.5px">{n} {word}</span>
      <div class="mt-3.5">
        {projects.map((pr) => <ProjectCard project={pr} lang={lang} />)}
        {n === 0 && <p class="atl-body py-9 text-ink2">{C.projects.none}</p>}
      </div>
    </section>
  </main>
  <Footer lang={lang} />
</Base>
```

- [ ] **Step 3: `apps/site/src/pages/en/journal/[slug].astro`** — mirror of `src/pages/journal/[slug].astro` with these exact differences (everything else identical, copy the FR file's markup verbatim):
  - import depth `../../../` (not `../../`) for `layouts`/`components`/`lib`/`i18n`.
  - `const lang: Lang = 'en';`
  - `export async function getStaticPaths() { const articles = await getArticles('en'); return articles.map((a) => ({ params: { slug: a.slug } })); }`
  - `const { article, Content } = await getArticleEntry(slug!, 'en');`
  - `const all = await getArticles('en'); const related = relatedArticles(article, all);`
  - the back link `href="/journal"` becomes `href="/en/journal"`; the "read next" links `href={\`/journal/${rp.slug}\`}` become `href={\`/en/journal/${rp.slug}\`}`.

- [ ] **Step 4: `apps/site/src/pages/en/projets/[slug].astro`** — mirror of `src/pages/projets/[slug].astro` with:
  - import depth `../../../`.
  - `const lang: Lang = 'en';`
  - `getStaticPaths` → `(await getProjects('en')).map((p) => ({ params: { slug: p.slug } }))`.
  - `const { project, Content } = await getProjectEntry(slug!, 'en');`
  - `const related = articlesBySlugs(project.relatedArticles, await getArticles('en'));`
  - back link `href="/projets"` → `href="/en/projets"`; related links `/journal/${rp.slug}` → `/en/journal/${rp.slug}`.

- [ ] **Step 5: Restore locale-aware nav** — in both `apps/site/src/components/Header.astro` and `MobileNav.astro`, change the `links`/`items` array:
```ts
  { key: 'work', href: '/projets', label: c.nav.work },
  { key: 'journal', href: '/journal', label: c.nav.journal },
```
back to:
```ts
  { key: 'work', href: `${base}/projets`, label: c.nav.work },
  { key: 'journal', href: `${base}/journal`, label: c.nav.journal },
```
(the `about` line already uses `${base}/about` — leave it).

- [ ] **Step 6: Type-check + build**

Run: `pnpm --filter @johan-chan/site check && pnpm --filter @johan-chan/site build`
Expected: 0 errors; **23 pages** (`/en/journal`, 6 × `/en/journal/[slug]`, `/en/projets`, 1 × `/en/projets/[slug]`, plus the existing 14). The island EN bodies (`<Proof lang="en"/>`, the showcase) compile/render here. Confirm an EN article SSR'd: `grep -c 'data-proof' apps/site/dist/en/journal/editeur-code-navigateur-zero-dependance/index.html` → ≥1.

- [ ] **Step 7: Commit**

```bash
git add apps/site/src/pages/en/journal/index.astro "apps/site/src/pages/en/journal/[slug].astro" apps/site/src/pages/en/projets/index.astro "apps/site/src/pages/en/projets/[slug].astro" apps/site/src/components/Header.astro apps/site/src/components/MobileNav.astro
git commit -m "feat(site): EN content routes + restore locale-aware nav

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Smoke tests + full verification

**Files:** `apps/site/tests/smoke.spec.ts`

- [ ] **Step 1: Add EN coverage** — append to `apps/site/tests/smoke.spec.ts`

```ts
test('EN journal lists English articles', async ({ page }) => {
  await page.goto('/en/journal');
  const rows = page.getByTestId('piece-row');
  await expect(rows.first()).toBeVisible();
  expect(await rows.count()).toBeGreaterThanOrEqual(5);
  await expect(page.locator('body')).toContainText('code editor in the browser');
});

test('EN article renders English title + body', async ({ page }) => {
  await page.goto('/en/journal/editeur-code-navigateur-zero-dependance');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('code editor in the browser');
  await expect(page.locator('.atl-prose')).toContainText('entirely in the browser');
});

test('language switch from a FR article lands on its EN translation', async ({ page }) => {
  await page.goto('/journal/editeur-code-navigateur-zero-dependance');
  await page.getByTestId('lang-switch').click();
  await expect(page).toHaveURL('/en/journal/editeur-code-navigateur-zero-dependance');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('code editor in the browser');
});
```

- [ ] **Step 2: Full verification sweep**

```bash
pnpm --filter @johan-chan/site test:unit
pnpm --filter @johan-chan/site check
pnpm --filter @johan-chan/site build
pnpm --filter @johan-chan/site test:e2e
```
Expected: unit green (incl. localeOf/slugOf); check 0 errors; build **23 pages**; e2e all green (the prior 10 + 3 EN tests = 13). If the lang switch lands on a 404 or the EN body is missing, that's a real bug — report it.

- [ ] **Step 3: Confirm dev-proxy files still only-local**

`git status --short` → only `apps/web/*`, `pnpm-lock.yaml`, `turbo.json`, `.claude/` unstaged; nothing of ours staged. (No dependency changes in this slice, so the lockfile must not appear staged.)

- [ ] **Step 4: Commit**

```bash
git add apps/site/tests/smoke.spec.ts
git commit -m "test(site): EN journal/article + language-switch coverage

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Self-Review (completed during authoring)

**Spec coverage:** glob/generateId for `index.en.*` (T1) · lang-aware query + id-derived locale + FR route updates (T2) · EN content for 6 articles + 1 project incl. shared-island bodies (T3) · 4 EN routes + nav restoration (T4) · EN smoke coverage incl. language switch (T5). All spec sections map to a task.

**Placeholder scan:** none. The two EN detail routes (T4 S3–S4) are specified as exact diffs against the existing FR route files (in-repo reference) rather than re-pasted — the changed lines are enumerated completely.

**Type consistency:** `getArticles`/`getArticleEntry`/`getProjects`/`getProjectEntry` gain a `lang: Lang` param (T2) and every caller is updated (FR routes T2 S6, EN routes T4); `localeOf`/`slugOf` defined in content-utils (T2 S3), used in content.ts (T2 S5) + tested (T2 S1). EN article ids are `<slug>/en`, slugs strip the suffix → language switch URLs match (`/en/journal/<slug>`), consistent between the route `getStaticPaths` and the T5 switch test. `relatedArticles` ids = bare slugs, resolved within the lang-filtered set by `articlesBySlugs`.

**Known follow-ups (out of scope):** graceful "hide language switch when no translation" (every article is translated now); localized series titles (EN "fil" shows the FR series title); localized URL segments (`/en/journal` stays, not `/en/blog`); second project; showcase metrics.
