# Content-Model Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hardcoded `src/data/atelier.ts` fixture with real Astro **content collections**, so `apps/site` pages build dynamically from typed content with the data fully separated from the views.

**Architecture:** Three layers — Zod schemas (`src/content.config.ts`) define structure; MDX folders in `src/content/` hold content; `.astro` views render it. A query seam (`src/lib/content.ts` + pure `src/lib/content-utils.ts`) maps collection entries to typed view-models so views never import `astro:content` directly. UI strings live in a separate dictionary (`src/lib/copy.ts`). FR-only content; EN content routes removed; EN chrome pages kept.

**Tech Stack:** Astro 6.4 content layer (`glob`/`file` loaders, `render()`), Zod, MDX, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-06-09-content-model-foundation-design.md`

---

## Conventions (read once)

- Run commands via `pnpm --filter @johan-chan/site <script>`: `check`, `test:unit`, `test:e2e`, `build`.
- **NEVER** `git add -A`/`git add .` — the working tree has local-only `apps/web/*`, `pnpm-lock.yaml`, `turbo.json` that must NOT be committed. Always `git add` exact paths under `apps/site/` or `docs/`.
- Every commit message ends with:
  ```
  Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
  ```
- **Typographic apostrophes**: French prose uses `’` (U+2019), never ASCII `'`. Single-quote JS delimiters are fine since `’ ≠ '`. Do not "escape" or flatten them.
- The plan keeps the build green after every task: new modules are added first (unused), consumers are flipped, the old fixture is deleted last.
- Astro inline `<script>` is type-checked unless `is:inline`; that constraint is unchanged from the current code and not touched here.

## File Structure

```
apps/site/src/
├── content.config.ts                 (CREATE) collections + Zod schemas
├── content/
│   ├── articles/<slug>/index.{md,mdx} (CREATE ×5)
│   ├── projects/atelier-wasm/index.mdx(CREATE)
│   └── series.json                    (CREATE)
├── lib/
│   ├── content-utils.ts               (CREATE) types + PURE helpers (vitest-testable)
│   ├── content.ts                     (CREATE) async getCollection wrappers → view-models
│   └── copy.ts                        (CREATE) UI dictionary: copy, kindLabel, kindClass, fmtDate
├── components/{Header,Footer,MobileNav,Proof,JournalFilters,PieceRow,ProjectCard}.astro (MODIFY)
├── pages/{index,about}.astro, pages/journal/*, pages/projets/* (MODIFY)
├── pages/en/{index,about}.astro       (MODIFY)
├── pages/en/journal/**, pages/en/projets/**  (DELETE)
└── data/atelier.ts                    (DELETE, last)
tests/
├── content-utils.test.ts              (CREATE)
├── copy.test.ts                       (CREATE)
├── atelier-data.test.ts               (DELETE, with atelier.ts)
└── smoke.spec.ts                      (MODIFY)
```

---

## Task 1: UI dictionary `copy.ts`

**Files:**
- Create: `apps/site/src/lib/copy.ts`
- Create: `apps/site/tests/copy.test.ts`

Extract the UI strings + presentational helpers out of `atelier.ts` into a dedicated dictionary. (`atelier.ts` is left intact this task — temporary duplication, build stays green.)

- [ ] **Step 1: Write the failing test** — `apps/site/tests/copy.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import { fmtDate, kindLabel, kindClass } from '../src/lib/copy';

describe('fmtDate', () => {
  it('FR day-first', () => expect(fmtDate('2026-05-28', 'fr')).toBe('28 mai 2026'));
  it('EN month-first', () => expect(fmtDate('2026-05-28', 'en')).toBe('May 28, 2026'));
});
describe('kind maps', () => {
  it('labels FR', () => expect(kindLabel.fr.impl).toBe('Implémentation'));
  it('classes', () => expect(kindClass.design).toBe('kind-design'));
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm --filter @johan-chan/site test:unit`
Expected: FAIL — cannot resolve `../src/lib/copy`.

- [ ] **Step 3: Create `apps/site/src/lib/copy.ts`**

Copy the `Copy` interface, the `copy` object (both `fr` and `en` — EN chrome stays), `kindLabel`, `kindClass`, `CONTACT_EMAIL`, the `MONTHS` const, and `fmtDate` **verbatim** from the current `apps/site/src/data/atelier.ts` (lines covering `MONTHS`, `fmtDate`, `kindLabel`, `kindClass`, `Copy`, `copy`, `CONTACT_EMAIL`). Change only the `Kind` type import: at the top add

```ts
import type { Lang } from '../i18n/ui';
import type { Registre } from './content-utils';
```

and replace every `Kind` with `Registre` in this file's `kindLabel`/`kindClass`/`Copy` types. Do **not** copy `pieces`, `projects`, or the data helpers (`allTags`, `relatedPieces`, `piecesByDate`) — those belong to the content layer. Keep `fmtDate(iso: string, lang: Lang)` exactly as in the fixture.

> `Registre` is created in Task 3 (`content-utils.ts`). Because this is a **type-only** import it does not break Vitest or the build before Task 3 lands — but to keep Task 1 independently green, inline the type here for now and switch to the import in Task 3:
> ```ts
> export type Registre = 'refl' | 'design' | 'impl';
> ```
> Task 3 will re-export `Registre` from `content-utils.ts` and Task 3's step will update `copy.ts` to import it. (Single source by end of Task 3.)

So Task 1 `copy.ts` defines `export type Registre = 'refl' | 'design' | 'impl';` locally and uses it.

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @johan-chan/site test:unit`
Expected: PASS (copy + existing atelier-data + i18n).

- [ ] **Step 5: Type-check**

Run: `pnpm --filter @johan-chan/site check`
Expected: 0 errors.

- [ ] **Step 6: Commit**

```bash
git add apps/site/src/lib/copy.ts apps/site/tests/copy.test.ts
git commit -m "feat(site): extract UI copy dictionary into lib/copy.ts

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Content collections + entries

**Files:**
- Create: `apps/site/src/content.config.ts`
- Create: `apps/site/src/content/series.json`
- Create: `apps/site/src/content/projects/atelier-wasm/index.mdx`
- Create: `apps/site/src/content/articles/<slug>/index.{md,mdx}` (×5)

- [ ] **Step 1: Create `apps/site/src/content.config.ts`**

```ts
import { defineCollection, reference, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

const registre = z.enum(['refl', 'design', 'impl']);

const articles = defineCollection({
  loader: glob({
    pattern: '*/index.{md,mdx}',
    base: './src/content/articles',
    generateId: ({ entry }) => entry.replace(/\/index\.mdx?$/, ''),
  }),
  schema: z.object({
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
  }),
});

const projects = defineCollection({
  loader: glob({
    pattern: '*/index.{md,mdx}',
    base: './src/content/projects',
    generateId: ({ entry }) => entry.replace(/\/index\.mdx?$/, ''),
  }),
  schema: z.object({
    name: z.string().min(1),
    year: z.string(),
    role: z.string(),
    oneliner: z.string(),
    stack: z.array(z.string()).default([]),
    demo: z.boolean().default(false),
    relatedArticles: z.array(reference('articles')).default([]),
    translationId: z.string().optional(),
  }),
});

const series = defineCollection({
  loader: file('./src/content/series.json'),
  schema: z.object({ id: z.string(), title: z.string(), description: z.string() }),
});

export const collections = { articles, projects, series };
```

- [ ] **Step 2: Create `apps/site/src/content/series.json`**

```json
[
  { "id": "atelier-wasm", "title": "Atelier WASM", "description": "La construction d’un éditeur de code zéro-dépendance, chapitre par chapitre." }
]
```

- [ ] **Step 3: Create the 5 article entries** (frontmatter exact; bodies are short real French prose, not placeholders)

`apps/site/src/content/articles/editeur-code-navigateur-zero-dependance/index.mdx`:
```mdx
---
title: Un éditeur de code dans le navigateur, zéro dépendance
registre: impl
date: 2026-05-28
tags: [WebAssembly, Perf, Éditeur]
readingTime: 14
live: true
series: atelier-wasm
order: 2
repo: wasm-workshop
---
import Proof from '../../../components/Proof.astro';

Le quoi, le pourquoi, puis le comment, jusqu’au code. On veut un éditeur qui
tourne entièrement dans le navigateur, sans serveur pour compiler ni colorer.

<figure class="my-7 overflow-hidden rounded-[14px] border border-line bg-surf">
  <figcaption class="atl-meta flex items-center gap-2 border-b border-line px-3.5 py-2.5 text-ink2" style="font-size:11px">
    <span class="h-[7px] w-[7px] rounded-full bg-accent" style="box-shadow:0 0 7px var(--accent)"></span>démo live, dans l’article
  </figcaption>
  <div class="p-4"><Proof lang="fr" /></div>
</figure>

On manipule, on comprend, on continue. C’est le moteur qui tourne aussi dans le
produit livré.
```

`apps/site/src/content/articles/invalider-cache-par-evenements/index.md`:
```md
---
title: Invalider un cache par événements, pas par TTL
registre: design
date: 2026-05-12
tags: [Systèmes, Cache]
readingTime: 9
---
Un TTL, c’est espérer que le temps fasse le travail. Mieux vaut invalider quand
l’événement qui rend la donnée obsolète se produit — la cohérence devient une
conséquence du système, pas un pari.
```

`apps/site/src/content/articles/animations-60fps-timeline/index.md`:
```md
---
title: Des animations 60 fps pilotées par une timeline
registre: impl
date: 2026-04-30
tags: [Animation, Canvas]
readingTime: 11
live: true
---
Une timeline déclarative sépare le « quoi » du « quand ». On décrit l’état à
chaque instant, le moteur s’occupe de tenir le budget de 16 ms par image.
```

`apps/site/src/content/articles/versionner-ses-decisions/index.md`:
```md
---
title: Versionner ses décisions, pas seulement son code
registre: refl
date: 2026-05-20
tags: [Pratique, ADR]
readingTime: 6
---
Le code dit ce qu’on fait ; il ne dit pas pourquoi. Garder une trace des
décisions — et de ce qu’on a écarté — vaut souvent plus que le diff lui-même.
```

`apps/site/src/content/articles/artisanat-ere-autocompletion/index.md`:
```md
---
title: L’artisanat à l’ère de l’autocomplétion
registre: refl
date: 2026-05-03
tags: [Métier, IA]
readingTime: 8
---
La machine propose, accélère, explore. Le métier n’a pas disparu : il s’est
déplacé vers le jugement — savoir quel code est bon, et pourquoi.
```

- [ ] **Step 4: Create `apps/site/src/content/projects/atelier-wasm/index.mdx`** (body = the existing 4-paragraph récit)

```mdx
---
name: Atelier WASM
year: '2026'
role: Conception et développement, de bout en bout
oneliner: Un éditeur de code qui tourne entièrement dans le navigateur, sans serveur ni dépendance lourde.
stack: [Rust, WebAssembly, TypeScript]
demo: true
relatedArticles:
  - editeur-code-navigateur-zero-dependance
  - invalider-cache-par-evenements
  - versionner-ses-decisions
---
Au départ, c’était une frustration toute bête : je voulais un petit éditeur où essayer du code, et tout ce que je trouvais réclamait un serveur derrière pour compiler et colorer. Lourd, lent au premier chargement, et un coût qui grimpe avec chaque visiteur.

Je me suis demandé jusqu’où on pouvait aller sans serveur du tout. J’ai sorti un noyau en Rust, compilé en WebAssembly, qui fait l’analyse directement dans le navigateur. Pas d’aller-retour réseau. L’interface est restée volontairement fine ; c’est le système qui porte le poids, là où il est.

En route, j’ai dû repenser deux ou trois choses que je croyais acquises — notamment comment garder l’affichage rapide pendant qu’on tape. J’ai écrit dessus au fil du chantier, c’est plus honnête que de prétendre que c’était limpide.

Au final ça démarre instantanément, ça ne coûte rien par session, et la base a tenu sans que je doive la réécrire. Le même moteur sert ce qu’on voit et ce qui calcule. C’est le genre de résultat qui me plaît : discret, mais solide.
```

- [ ] **Step 5: Validate schema via build**

Run: `pnpm --filter @johan-chan/site build`
Expected: success. Astro validates all frontmatter against the schemas and resolves the `series`/`relatedArticles` references; a bad slug or field fails the build. (Pages still render from `atelier.ts` — collections are defined but unused yet.)

- [ ] **Step 6: Commit**

```bash
git add apps/site/src/content.config.ts apps/site/src/content/
git commit -m "feat(site): content collections (articles, projects, series) + entries

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Query layer — `content-utils.ts` (pure) + `content.ts` (async)

**Files:**
- Create: `apps/site/src/lib/content-utils.ts`
- Create: `apps/site/src/lib/content.ts`
- Create: `apps/site/tests/content-utils.test.ts`
- Modify: `apps/site/src/lib/copy.ts` (import `Registre` from content-utils)

- [ ] **Step 1: Write the failing test** — `apps/site/tests/content-utils.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import { byDateDesc, allTags, relatedArticles, articlesBySlugs, type Article } from '../src/lib/content-utils';

const A = (over: Partial<Article>): Article => ({
  slug: 'x', title: 't', registre: 'refl', date: '2026-01-01', tags: [], readingTime: 5, live: false, ...over,
});

describe('byDateDesc', () => {
  it('sorts newest first', () => {
    const r = byDateDesc([A({ slug: 'a', date: '2026-01-01' }), A({ slug: 'b', date: '2026-05-01' })]);
    expect(r.map((x) => x.slug)).toEqual(['b', 'a']);
  });
});
describe('allTags', () => {
  it('unique + sorted', () => {
    const r = allTags([A({ tags: ['Z', 'a'] }), A({ tags: ['a', 'M'] })]);
    expect(r).toEqual(['a', 'M', 'Z'].sort((x, y) => x.localeCompare(y)));
    expect(new Set(r).size).toBe(r.length);
  });
});
describe('relatedArticles', () => {
  it('≤2, excludes source, prefers shared tag', () => {
    const src = A({ slug: 's', tags: ['Cache'] });
    const all = [src, A({ slug: 'm', tags: ['Cache'] }), A({ slug: 'n', tags: ['Other'] }), A({ slug: 'o', tags: ['Other'] })];
    const r = relatedArticles(src, all);
    expect(r.length).toBe(2);
    expect(r.some((x) => x.slug === 's')).toBe(false);
    expect(r[0].slug).toBe('m');
  });
});
describe('articlesBySlugs', () => {
  it('resolves in given order, skips missing', () => {
    const all = [A({ slug: 'a' }), A({ slug: 'b' })];
    expect(articlesBySlugs(['b', 'zzz', 'a'], all).map((x) => x.slug)).toEqual(['b', 'a']);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm --filter @johan-chan/site test:unit`
Expected: FAIL — cannot resolve `../src/lib/content-utils`.

- [ ] **Step 3: Create `apps/site/src/lib/content-utils.ts`** (pure; no `astro:content` import)

```ts
export type Registre = 'refl' | 'design' | 'impl';

export interface Article {
  slug: string;
  title: string;
  registre: Registre;
  date: string; // YYYY-MM-DD
  tags: string[];
  readingTime: number;
  live: boolean;
  series?: { id: string; title: string };
  order?: number;
  repo?: string;
}
export interface Project {
  slug: string;
  name: string;
  year: string;
  role: string;
  oneliner: string;
  stack: string[];
  demo: boolean;
  relatedArticles: string[]; // article slugs
}
export interface Series { id: string; title: string; description: string }

export function byDateDesc(articles: Article[]): Article[] {
  return articles.slice().sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function allTags(articles: Article[]): string[] {
  const s = new Set<string>();
  articles.forEach((a) => a.tags.forEach((t) => s.add(t)));
  return [...s].sort((a, b) => a.localeCompare(b));
}

export function relatedArticles(src: Article, all: Article[]): Article[] {
  let related = all.filter((a) => a.slug !== src.slug && (
    (src.series && a.series && a.series.id === src.series.id) ||
    a.tags.some((t) => src.tags.includes(t))
  ));
  if (related.length < 2) {
    const extra = all
      .filter((a) => a.slug !== src.slug && !related.includes(a))
      .sort((a) => (a.registre === src.registre ? -1 : 1));
    related = related.concat(extra);
  }
  return related.slice(0, 2);
}

export function articlesBySlugs(slugs: string[], all: Article[]): Article[] {
  return slugs.map((s) => all.find((a) => a.slug === s)).filter((a): a is Article => Boolean(a));
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @johan-chan/site test:unit`
Expected: PASS.

- [ ] **Step 5: Create `apps/site/src/lib/content.ts`** (async wrappers → view-models)

```ts
import { getCollection, getEntry, render } from 'astro:content';
import type { Article, Project, Series } from './content-utils';
import { byDateDesc } from './content-utils';
export type { Article, Project, Series } from './content-utils';

async function toArticle(entry: Awaited<ReturnType<typeof getCollection<'articles'>>>[number]): Promise<Article> {
  const d = entry.data;
  let series: Article['series'];
  if (d.series) {
    const s = await getEntry(d.series);
    if (s) series = { id: s.data.id, title: s.data.title };
  }
  return {
    slug: entry.id, title: d.title, registre: d.registre, date: d.date,
    tags: d.tags, readingTime: d.readingTime, live: d.live,
    series, order: d.order, repo: d.repo,
  };
}

function toProject(entry: Awaited<ReturnType<typeof getCollection<'projects'>>>[number]): Project {
  const d = entry.data;
  return {
    slug: entry.id, name: d.name, year: d.year, role: d.role, oneliner: d.oneliner,
    stack: d.stack, demo: d.demo, relatedArticles: d.relatedArticles.map((r) => r.id),
  };
}

export async function getArticles(): Promise<Article[]> {
  const entries = await getCollection('articles');
  return byDateDesc(await Promise.all(entries.map(toArticle)));
}

export async function getArticleEntry(slug: string) {
  const entry = await getEntry('articles', slug);
  if (!entry) throw new Error(`Article not found: ${slug}`);
  const [article, rendered] = await Promise.all([toArticle(entry), render(entry)]);
  return { article, Content: rendered.Content };
}

export async function getProjects(): Promise<Project[]> {
  return (await getCollection('projects')).map(toProject);
}

export async function getProjectEntry(slug: string) {
  const entry = await getEntry('projects', slug);
  if (!entry) throw new Error(`Project not found: ${slug}`);
  const { Content } = await render(entry);
  return { project: toProject(entry), Content };
}

export async function getSeries(id: string): Promise<Series | undefined> {
  const entry = await getEntry('series', id);
  return entry?.data;
}
```

- [ ] **Step 6: Update `apps/site/src/lib/copy.ts`** — replace the local `export type Registre = ...` line with a re-export from content-utils so there is a single source:

Remove `export type Registre = 'refl' | 'design' | 'impl';` and add at the top:
```ts
import type { Registre } from './content-utils';
```
(Keep `kindLabel`/`kindClass`/`Copy` referencing `Registre` unchanged.)

- [ ] **Step 7: Type-check + unit**

Run: `pnpm --filter @johan-chan/site check && pnpm --filter @johan-chan/site test:unit`
Expected: 0 errors; all unit tests pass.

- [ ] **Step 8: Commit**

```bash
git add apps/site/src/lib/content-utils.ts apps/site/src/lib/content.ts apps/site/tests/content-utils.test.ts apps/site/src/lib/copy.ts
git commit -m "feat(site): content query layer (pure utils + async wrappers, TDD)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Remove EN content routes; rewire EN chrome + chrome components to copy.ts

**Files:**
- Delete: `apps/site/src/pages/en/journal/index.astro`, `apps/site/src/pages/en/journal/[slug].astro`, `apps/site/src/pages/en/projets/index.astro`, `apps/site/src/pages/en/projets/[slug].astro` (and the now-empty `en/journal/`, `en/projets/` dirs)
- Modify: `apps/site/src/components/Header.astro`, `MobileNav.astro`, `Footer.astro`, `Proof.astro`
- Modify: `apps/site/src/pages/en/index.astro`, `apps/site/src/pages/en/about.astro`

- [ ] **Step 1: Delete the EN content routes**

```bash
git rm apps/site/src/pages/en/journal/index.astro \
       "apps/site/src/pages/en/journal/[slug].astro" \
       apps/site/src/pages/en/projets/index.astro \
       "apps/site/src/pages/en/projets/[slug].astro"
```

- [ ] **Step 2: Point chrome nav content links at the FR routes** (content is FR-only; Journal/Projets always go to `/journal`,`/projets`; About + logo stay locale-aware)

In `apps/site/src/components/Header.astro`, replace the `links` array construction:
```astro
const base = lang === 'fr' ? '' : '/en';
const links: { key: Props['current']; href: string; label: string }[] = [
  { key: 'work', href: `${base}/projets`, label: c.nav.work },
  { key: 'journal', href: `${base}/journal`, label: c.nav.journal },
  { key: 'about', href: `${base}/about`, label: c.nav.about },
];
```
with:
```astro
const base = lang === 'fr' ? '' : '/en';
const links: { key: Props['current']; href: string; label: string }[] = [
  { key: 'work', href: '/projets', label: c.nav.work },
  { key: 'journal', href: '/journal', label: c.nav.journal },
  { key: 'about', href: `${base}/about`, label: c.nav.about },
];
```
Apply the **identical** change to the `items` array in `apps/site/src/components/MobileNav.astro` (work → `/projets`, journal → `/journal`, about → `${base}/about`).

- [ ] **Step 3: Swap chrome imports from `data/atelier` → `lib/copy`**

In each of `Header.astro`, `MobileNav.astro`, `Footer.astro`, `Proof.astro`, change the import:
```astro
import { copy } from '../data/atelier';
```
→
```astro
import { copy } from '../lib/copy';
```
And in `Footer.astro` change `import { copy, CONTACT_EMAIL } from '../data/atelier';` → `from '../lib/copy';`. No other lines change (the `copy` shape is identical).

> **Do NOT touch `en/index.astro` or `en/about.astro` in this task.** `en/index.astro` uses `PieceRow` (whose prop changes in Task 5) and `en/about.astro` only needs an import swap (Task 8). Both stay importing `../../data/atelier` for now — still valid, build stays green. `en/index.astro` is rewired in Task 5 Step 5; `en/about.astro` in Task 8 Step 1.

- [ ] **Step 4: Type-check + build**

Run: `pnpm --filter @johan-chan/site check && pnpm --filter @johan-chan/site build`
Expected: 0 errors; build succeeds. EN content routes gone (`/en/journal*`, `/en/projets*` no longer emitted). `en/index.astro`/`en/about.astro` still import from `data/atelier` (unchanged, still valid). Chrome components now read from `lib/copy`.

- [ ] **Step 5: Commit**

```bash
git add apps/site/src/components/Header.astro apps/site/src/components/MobileNav.astro apps/site/src/components/Footer.astro apps/site/src/components/Proof.astro
git commit -m "feat(site): remove EN content routes; chrome reads lib/copy; FR-only content nav

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```
(The `git rm` from Step 1 is included in this commit.)

---

## Task 5: View-models for rows + list pages

**Files:**
- Modify: `apps/site/src/components/PieceRow.astro`, `ProjectCard.astro`, `JournalFilters.astro`
- Modify: `apps/site/src/pages/index.astro`, `apps/site/src/pages/en/index.astro`, `apps/site/src/pages/journal/index.astro`, `apps/site/src/pages/projets/index.astro`

- [ ] **Step 1: Rewrite `PieceRow.astro`** to take an `Article` view-model

```astro
---
import type { Lang } from '../i18n/ui';
import type { Article } from '../lib/content-utils';
import { copy, fmtDate, kindClass } from '../lib/copy';
interface Props { article: Article; lang: Lang }
const { article, lang } = Astro.props;
const C = copy[lang];
const href = `/journal/${article.slug}`;
const hue = kindClass[article.registre];
const dotShape = article.registre === 'impl' ? 'rounded-sm' : 'rounded-full';
const dotRotate = article.registre === 'design' ? 'rotate-45' : '';
---
<a href={href} data-testid="piece-row" data-kind={article.registre} data-tags={article.tags.join('|')}
  class="atl-row grid grid-cols-1 items-baseline gap-2 border-t border-line py-5 md:grid-cols-[128px_1fr_auto] md:gap-6 md:py-[26px]">
  <div class="flex flex-col gap-[7px]">
    <span class={`atl-meta inline-flex items-center gap-[7px] ${hue}`} style="letter-spacing:.04em">
      <span class={`h-[7px] w-[7px] ${dotShape} ${dotRotate}`} style="background: currentColor"></span>
      {C.kind[article.registre]}
    </span>
    <span class="atl-meta text-faint">{fmtDate(article.date, lang)}</span>
  </div>
  <div class="min-w-0">
    {article.series && (
      <span class={`atl-meta mb-2 block uppercase ${hue}`} style="font-size:10.5px;letter-spacing:.08em">{C.series} · {article.series.title}, {C.chapter} {article.order}</span>
    )}
    <h3 class="atl-piece-title m-0 text-ink">{article.title}</h3>
    <div class="mt-2.5 flex flex-wrap items-center gap-2">
      {article.tags.map((tg) => <span class="atl-meta text-ink2">#{tg.toLowerCase()}</span>)}
      <span class="atl-meta whitespace-nowrap text-faint">· {article.readingTime} {C.read}</span>
      {article.live && (
        <span class="atl-meta inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-accent px-2 text-accent" style="font-size:10.5px">
          <span class="atl-livedot h-[5px] w-[5px] shrink-0 rounded-full bg-accent"></span>{C.live}
        </span>
      )}
    </div>
  </div>
  <span class={`hidden self-center font-mono text-[18px] md:block ${hue}`}>→</span>
</a>
```

- [ ] **Step 2: Rewrite `ProjectCard.astro`** to take a `Project` view-model

```astro
---
import type { Lang } from '../i18n/ui';
import type { Project } from '../lib/content-utils';
import { copy } from '../lib/copy';
interface Props { project: Project; lang: Lang }
const { project, lang } = Astro.props;
const C = copy[lang];
const href = `/projets/${project.slug}`;
---
<a href={href} data-testid="project-card"
  class="atl-row mb-4 block rounded-[14px] border border-line bg-surf p-5 md:p-[26px]">
  <div class="mb-3.5 flex items-center justify-between gap-3">
    <span class="atl-meta rounded-full border border-accent px-2.5 uppercase text-accent" style="font-size:10.5px;letter-spacing:.1em">{C.projects.badge}</span>
    <span class="atl-meta text-faint">{project.year}</span>
  </div>
  <h3 class="font-display text-[23px] font-bold leading-[1.06] tracking-[-.025em] text-ink md:text-[30px]">{project.name}</h3>
  <p class="atl-body mt-2.5 max-w-[620px] text-ink2">{project.oneliner}</p>
  <div class="mt-4 flex flex-wrap items-center gap-2">
    {project.stack.map((s) => <span class="atl-meta rounded-full border border-line px-2.5 text-ink2">{s}</span>)}
    <span class="atl-meta ml-auto text-accent">{C.projects.viewCase} →</span>
  </div>
</a>
```

- [ ] **Step 3: Make `JournalFilters.astro` take `tags` as a prop** (instead of importing `allTags` from the fixture)

Change its frontmatter:
```astro
---
import type { Lang } from '../i18n/ui';
import { copy, kindClass, type Registre } from '../lib/copy';
interface Props { lang: Lang; total: number; tags: string[] }
const { lang, total, tags } = Astro.props;
const C = copy[lang];
const regs: Registre[] = ['refl', 'design', 'impl'];
---
```
Remove the old `import { copy, allTags, kindClass, type Kind } from '../data/atelier';` and the `const tags = allTags(lang);` line. Everything else in the component (markup + `is:inline` script) stays unchanged. (`Registre` is exported from `copy.ts` via its re-export.)

> Note: `copy.ts` must `export type { Registre }` for this import to work. In Task 3 Step 6 `copy.ts` does `import type { Registre } from './content-utils'`; add `export type { Registre } from './content-utils';` to `copy.ts` as well so consumers can import it from `copy`.

- [ ] **Step 4: Rewire FR `index.astro`** — replace data import + preview source

Change:
```astro
import { copy, piecesByDate } from '../data/atelier';
```
→
```astro
import { copy } from '../lib/copy';
import { getArticles } from '../lib/content';
```
Replace `const preview = piecesByDate().slice(0, 3);` → `const preview = (await getArticles()).slice(0, 3);`
Replace the preview loop `{preview.map((p) => <PieceRow piece={p} lang={lang} />)}` → `{preview.map((a) => <PieceRow article={a} lang={lang} />)}`

- [ ] **Step 5: Rewire EN `index.astro`** — identical change to Step 4 but paths are `../../lib/copy`, `../../lib/content`. (This is the EN chrome home; it shows FR articles in its preview — the known FR-first transitional artifact.)

- [ ] **Step 6: Rewire `journal/index.astro`**

Change:
```astro
import { copy, piecesByDate } from '../../data/atelier';
```
→
```astro
import { copy } from '../../lib/copy';
import { getArticles, allTags } from '../../lib/content';
```
Wait — `allTags` is a **pure** util in `content-utils`, not in `content.ts`. Import it from content-utils:
```astro
import { copy } from '../../lib/copy';
import { getArticles } from '../../lib/content';
import { allTags } from '../../lib/content-utils';
```
Replace `const list = piecesByDate();` →
```astro
const list = await getArticles();
const tags = allTags(list);
```
Pass tags to the filter component: change `<JournalFilters lang={lang} total={list.length} />` → `<JournalFilters lang={lang} total={list.length} tags={tags} />`
Change the list loop `{list.map((p) => <PieceRow piece={p} lang={lang} />)}` → `{list.map((a) => <PieceRow article={a} lang={lang} />)}`

- [ ] **Step 7: Rewire `projets/index.astro`**

Change:
```astro
import { copy, projects } from '../../data/atelier';
```
→
```astro
import { copy } from '../../lib/copy';
import { getProjects } from '../../lib/content';
```
Replace `const n = projects.length;` with:
```astro
const projects = await getProjects();
const n = projects.length;
```
The loop `{projects.map((pr) => <ProjectCard project={pr} lang={lang} />)}` stays (now iterates the view-models).

- [ ] **Step 8: Type-check + build + e2e**

Run: `pnpm --filter @johan-chan/site check && pnpm --filter @johan-chan/site build && pnpm --filter @johan-chan/site test:e2e`
Expected: 0 errors; build OK; e2e green (home hero + 3 rows, journal list + register filter, etc.). Detail pages still render from `atelier.ts` (Tasks 6–7 flip them).

- [ ] **Step 9: Commit**

```bash
git add apps/site/src/components/PieceRow.astro apps/site/src/components/ProjectCard.astro apps/site/src/components/JournalFilters.astro apps/site/src/lib/copy.ts apps/site/src/pages/index.astro apps/site/src/pages/en/index.astro apps/site/src/pages/journal/index.astro apps/site/src/pages/projets/index.astro
git commit -m "feat(site): list pages + rows consume content view-models

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Article detail route from collections

**Files:**
- Modify: `apps/site/src/pages/journal/[slug].astro`

- [ ] **Step 1: Rewrite `apps/site/src/pages/journal/[slug].astro`**

```astro
---
import Base from '../../layouts/Base.astro';
import Header from '../../components/Header.astro';
import Footer from '../../components/Footer.astro';
import { copy, fmtDate, kindClass } from '../../lib/copy';
import { getArticles, getArticleEntry } from '../../lib/content';
import { relatedArticles } from '../../lib/content-utils';
import type { Lang } from '../../i18n/ui';

export async function getStaticPaths() {
  const articles = await getArticles();
  return articles.map((a) => ({ params: { slug: a.slug } }));
}
const lang: Lang = 'fr';
const { slug } = Astro.params;
const { article, Content } = await getArticleEntry(slug!);
const C = copy[lang];
const hue = kindClass[article.registre];
const all = await getArticles();
const related = relatedArticles(article, all);
---
<Base lang={lang} title={`${article.title} — ${C.name}`}>
  <Header lang={lang} current="journal" />
  <main class="atl-container atl-rise pb-16 md:pb-24">
    <article class="mx-auto max-w-[880px] pt-8 md:pt-10">
      <div class="mb-6 flex items-center justify-between">
        <a href="/journal" class="atl-meta inline-flex items-center gap-2 text-ink2" style="font-size:12px">{C.reader.back}</a>
        <span class={`atl-meta inline-flex items-center gap-2 uppercase ${hue}`} style="font-size:11px;letter-spacing:.1em">
          <span class="h-[7px] w-[7px] rounded-full" style="background: currentColor"></span>{C.kind[article.registre]}
        </span>
      </div>
      {article.series && (
        <div class={`atl-meta mb-3.5 uppercase ${hue}`} style="font-size:11px;letter-spacing:.08em">{C.series} · {article.series.title}, {C.chapter} {article.order}</div>
      )}
      <h1 class="font-display text-[30px] font-bold leading-[1.04] tracking-[-.03em] text-ink md:text-[42px]" style="text-wrap:balance">{article.title}</h1>
      <div class="atl-meta my-5 flex flex-wrap items-center gap-3.5 text-faint" style="font-size:11.5px">
        <span>{fmtDate(article.date, lang)}</span><span>·</span><span>{article.readingTime} {C.read}</span><span>·</span>
        <span class="flex gap-2">{article.tags.map((tg) => <span class="text-ink2">#{tg.toLowerCase()}</span>)}</span>
      </div>
      <div class="atl-prose font-text text-[16.5px] leading-[1.7] text-ink2 md:text-[17.5px]">
        <Content />
      </div>
      {article.repo && (
        <div class="mt-7 flex items-center justify-between gap-3 rounded-[12px] border border-line bg-surf px-4 py-4">
          <span class="flex min-w-0 items-center gap-3">
            <span class="font-mono text-[17px] text-ink2">{'{ }'}</span>
            <span class="min-w-0">
              <span class="atl-meta block uppercase text-faint" style="font-size:10.5px;letter-spacing:.1em">{C.reader.source}</span>
              <span class="mt-0.5 block font-mono text-[13.5px] text-ink">github.com/johanchan/{article.repo}</span>
            </span>
          </span>
          <span class="atl-meta whitespace-nowrap text-accent" style="font-size:12px">git clone →</span>
        </div>
      )}
      {related.length > 0 && (
        <div class="mt-9 border-t border-line pt-5">
          <div class="atl-meta mb-3.5 uppercase text-ink2" style="font-size:11px;letter-spacing:.12em">{C.reader.readNext}</div>
          <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
            {related.map((rp) => (
              <a href={`/journal/${rp.slug}`} class="atl-row block rounded-[11px] border border-line bg-surf px-3.5 py-3.5">
                <span class={`atl-meta inline-flex items-center gap-[7px] uppercase ${kindClass[rp.registre]}`} style="font-size:10px;letter-spacing:.08em">
                  <span class="h-1.5 w-1.5 rounded-full" style="background: currentColor"></span>{C.kind[rp.registre]}
                </span>
                <span class="mt-2 block font-display text-[17px] font-medium leading-[1.16] text-ink" style="text-wrap:pretty">{rp.title}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </article>
  </main>
  <Footer lang={lang} />
</Base>
```

Notes: the inline `<Proof />` is **no longer auto-injected** — it lives in the impl article's MDX body (rendered by `<Content />`). The `<Ph>` placeholder import and `lede`/`para2` consts are gone. Add a minimal `.atl-prose` rule so MDX paragraphs get spacing — append to `apps/site/src/styles/global.css`:
```css
.atl-prose > p { margin: 0 0 18px; max-width: 660px; }
.atl-prose > p:first-child { font-weight: 500; color: var(--ink); }
```

- [ ] **Step 2: Type-check + build**

Run: `pnpm --filter @johan-chan/site check && pnpm --filter @johan-chan/site build`
Expected: 0 errors; build emits `/journal/<5 slugs>/`. The impl article's MDX (`<Proof />`) compiles and renders inside `<Content />` — this validates the "MDX imports a component island" pipeline.

- [ ] **Step 3: Commit**

```bash
git add "apps/site/src/pages/journal/[slug].astro" apps/site/src/styles/global.css
git commit -m "feat(site): article detail renders from collection (Content + Proof in MDX)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: Case-study detail route from collections

**Files:**
- Modify: `apps/site/src/pages/projets/[slug].astro`

- [ ] **Step 1: Rewrite `apps/site/src/pages/projets/[slug].astro`**

```astro
---
import Base from '../../layouts/Base.astro';
import Header from '../../components/Header.astro';
import Footer from '../../components/Footer.astro';
import { copy, kindClass } from '../../lib/copy';
import { getProjects, getProjectEntry, getArticles } from '../../lib/content';
import { articlesBySlugs } from '../../lib/content-utils';
import type { Lang } from '../../i18n/ui';

export async function getStaticPaths() {
  const projects = await getProjects();
  return projects.map((p) => ({ params: { slug: p.slug } }));
}
const lang: Lang = 'fr';
const { slug } = Astro.params;
const { project, Content } = await getProjectEntry(slug!);
const C = copy[lang];
const related = articlesBySlugs(project.relatedArticles, await getArticles());
---
<Base lang={lang} title={`${project.name} — ${C.name}`}>
  <Header lang={lang} current="work" />
  <main class="atl-container atl-rise pb-16 md:pb-24">
    <article class="mx-auto max-w-[880px] pt-8 md:pt-10">
      <div class="mb-6 flex items-center justify-between">
        <a href="/projets" class="atl-meta inline-flex items-center gap-2 text-ink2" style="font-size:12px">{C.caseStudy.back}</a>
        <span class="atl-meta rounded-full border border-accent px-2.5 uppercase text-accent" style="font-size:10.5px;letter-spacing:.12em">{C.projects.badge}</span>
      </div>
      <h1 class="font-display text-[32px] font-bold leading-[1.02] tracking-[-.03em] text-ink md:text-[46px]">{project.name}</h1>
      <p class="atl-body mt-3.5 mb-6 max-w-[620px] text-ink2 md:text-[19px]" style="line-height:1.5">{project.oneliner}</p>
      <div class="flex flex-wrap gap-x-10 gap-y-4 border-y border-line py-4">
        <div>
          <div class="atl-meta mb-1.5 uppercase text-faint" style="font-size:10px;letter-spacing:.12em">rôle</div>
          <div class="atl-meta text-ink" style="font-size:12.5px">{project.role}</div>
        </div>
        <div>
          <div class="atl-meta mb-1.5 uppercase text-faint" style="font-size:10px;letter-spacing:.12em">année</div>
          <div class="atl-meta text-ink" style="font-size:12.5px">{project.year}</div>
        </div>
        <div>
          <div class="atl-meta mb-1.5 uppercase text-faint" style="font-size:10px;letter-spacing:.12em">stack</div>
          <div class="atl-meta text-ink" style="font-size:12.5px">{project.stack.join(' · ')}</div>
        </div>
      </div>
      <div class="mt-6 flex h-[180px] items-end rounded-[12px] border border-line bg-bg2 p-3 md:h-[300px]"
        style="background-image: repeating-linear-gradient(135deg, var(--hair) 0 1px, transparent 1px 9px)">
        <span class="atl-meta uppercase text-faint" style="font-size:10.5px;letter-spacing:.1em">visuel du projet</span>
      </div>
      <div class="atl-prose mt-7 font-text text-[16.5px] leading-[1.7] text-ink2 md:text-[18px]">
        <Content />
      </div>
      {related.length > 0 && (
        <div class="mt-9 border-t border-line pt-5">
          <div class="atl-meta mb-1.5 uppercase text-ink2" style="font-size:11px;letter-spacing:.12em">{C.caseStudy.whatHelped}</div>
          <p class="font-text text-[14px] text-faint" style="margin:0 0 16px">{C.caseStudy.whatHelpedSub}</p>
          <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
            {related.map((rp) => (
              <a href={`/journal/${rp.slug}`} class="atl-row block rounded-[11px] border border-line bg-surf px-3.5 py-3.5">
                <span class={`atl-meta inline-flex items-center gap-[7px] uppercase ${kindClass[rp.registre]}`} style="font-size:10px;letter-spacing:.08em">
                  <span class="h-1.5 w-1.5 rounded-full" style="background: currentColor"></span>{C.kind[rp.registre]}
                </span>
                <span class="mt-2 block font-display text-[17px] font-medium leading-[1.16] text-ink" style="text-wrap:pretty">{rp.title}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </article>
  </main>
  <Footer lang={lang} />
</Base>
```

Note: the optional `demo` "live" figure block is dropped from the template — if a project wants a demo, it goes in its MDX body (consistent with articles, sets up sub-project #2). The récit renders via `<Content />`.

- [ ] **Step 2: Type-check + build**

Run: `pnpm --filter @johan-chan/site check && pnpm --filter @johan-chan/site build`
Expected: 0 errors; emits `/projets/atelier-wasm/`.

- [ ] **Step 3: Commit**

```bash
git add "apps/site/src/pages/projets/[slug].astro"
git commit -m "feat(site): case study detail renders récit from collection

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: Rewire `about.astro`, delete the fixture

**Files:**
- Modify: `apps/site/src/pages/about.astro`, `apps/site/src/pages/en/about.astro`
- Delete: `apps/site/src/data/atelier.ts`, `apps/site/tests/atelier-data.test.ts`

- [ ] **Step 1: Rewire both About pages' imports**

In `apps/site/src/pages/about.astro` change `import { copy } from '../data/atelier';` → `import { copy } from '../lib/copy';`
In `apps/site/src/pages/en/about.astro` change `import { copy } from '../../data/atelier';` → `import { copy } from '../../lib/copy';`
(No other changes — About uses only `copy`.)

- [ ] **Step 2: Confirm nothing else imports the fixture**

Run: `grep -rn "data/atelier" apps/site/src apps/site/tests || echo "CLEAN"`
Expected: `CLEAN`. If anything prints, rewire it to `lib/copy` (UI strings) or `lib/content` (data) before continuing.

- [ ] **Step 3: Delete the fixture and its test**

```bash
git rm apps/site/src/data/atelier.ts apps/site/tests/atelier-data.test.ts
```

- [ ] **Step 4: Type-check + unit + build**

Run: `pnpm --filter @johan-chan/site check && pnpm --filter @johan-chan/site test:unit && pnpm --filter @johan-chan/site build`
Expected: 0 errors; unit green (copy + content-utils + i18n); build OK.

- [ ] **Step 5: Commit**

```bash
git add apps/site/src/pages/about.astro apps/site/src/pages/en/about.astro
git commit -m "feat(site): about reads lib/copy; delete atelier.ts fixture

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```
(The `git rm` from Step 3 is part of this commit.)

---

## Task 9: Update smoke tests + full verification

**Files:**
- Modify: `apps/site/tests/smoke.spec.ts`

- [ ] **Step 1: Update `apps/site/tests/smoke.spec.ts`** — add a real-body assertion and an impl-article-Proof assertion; the EN content-route checks were never present, so nothing to remove, but verify.

Replace the `article detail page renders title and back link` test with:
```ts
test('article detail renders title, rendered body, and back link', async ({ page }) => {
  await page.goto('/journal/editeur-code-navigateur-zero-dependance');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('éditeur');
  await expect(page.locator('article')).toContainText('le journal');
  // body rendered from MDX (not a placeholder), incl. the inline Proof island
  await expect(page.locator('.atl-prose')).toContainText('navigateur');
  await expect(page.locator('[data-proof]')).toBeVisible();
});
```
Replace the `case study page renders story and demo` test with:
```ts
test('case study renders récit from MDX', async ({ page }) => {
  await page.goto('/projets/atelier-wasm');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Atelier WASM');
  await expect(page.locator('.atl-prose')).toContainText('frustration');
});
```
Leave the other tests (FR/EN home, lang switch, theme, journal filter, demo MDX, view-transitions) unchanged.

- [ ] **Step 2: Full verification sweep**

Run, in order:
```bash
pnpm --filter @johan-chan/site test:unit
pnpm --filter @johan-chan/site check
pnpm --filter @johan-chan/site build
pnpm --filter @johan-chan/site test:e2e
```
Expected: unit PASS (copy, content-utils, i18n); check 0 errors; build emits **13 pages** (`/`, `/journal`, 5 `/journal/[slug]`, `/projets`, `/projets/atelier-wasm`, `/about`, `/en/`, `/en/about`, `/demo`); e2e all green.

- [ ] **Step 3: Confirm the dev-proxy files are untouched**

Run: `git status --short`
Expected: only `apps/web/*`, `pnpm-lock.yaml`, `turbo.json`, `.claude/` show as modified/untracked — none staged.

- [ ] **Step 4: Commit**

```bash
git add apps/site/tests/smoke.spec.ts
git commit -m "test(site): smoke covers rendered MDX bodies + inline Proof

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Self-Review (completed during authoring)

**Spec coverage:** collections + schema (T2) · query/adapter seam, pure + async split (T3) · UI dictionary split (T1) · migrate fixture → MDX, project récit as body, `<Proof/>` into impl MDX, `repo` field (T2, T6) · rewire all FR views + rows + filters (T4–T8) · delete `atelier.ts` (T8) · remove EN content routes, keep EN chrome (T4) · FR-first/`translationId` reserved (T2 schema) · tests + verification, 13-page build (T9). All spec sections map to a task.

**Placeholder scan:** none. Task 4 Step 4 is explicitly *deferred* (with reason) and the EN home/about rewires are relocated to Task 5/Task 8 — not a TODO, an ordering decision stated inline.

**Type consistency:** `Registre`/`Article`/`Project`/`Series` defined in `content-utils.ts` (T3) and consumed by exact name in `copy.ts` (T1→T3), `content.ts` (T3), `PieceRow`/`ProjectCard`/`JournalFilters` (T5), detail routes (T6–T7). `getArticles`/`getArticleEntry`/`getProjects`/`getProjectEntry`/`getSeries` defined in `content.ts` (T3) and called by exact name later. Pure helpers `byDateDesc`/`allTags`/`relatedArticles`/`articlesBySlugs` defined in `content-utils.ts` (T3), used in T5–T7. `data-testid` (`piece-row`, `project-card`, `hero`, `theme-toggle`, `lang-switch`, `nav-desktop`) unchanged from current views, matching T9 tests. Article view-model field rename `kind→registre`, `read→readingTime`, `fil→series{id,title}` applied consistently across rows, filters (`data-kind` still the attribute name, value = registre), and detail routes.

**Known follow-ups (out of scope):** multi-framework showcase + per-framework CI checkers (sub-project #2); EN content + EN content routes (i18n sub-project); auto-derived reading time; real images. EN home preview shows FR article titles — documented FR-first transitional artifact.
