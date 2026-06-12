# Content Layout — Slice 3: Projects Detail — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring projects detail (`/projets/<slug>`) onto the canonical `ContentHero` + reading-rail + breakout + full-width-related template, and give projects a real cover via the folder-based `image()` schema.

**Architecture:** The `projects` collection (folder-based glob loader) gains `image`/`imageFocus`; the detail pages mirror the article reader — `PageLayout` wide, `ContentHero` (cover / no-image header), `.atl-prose` grid for the body, related-articles at full width. **Forward-looking:** `/projets` has no content, so no detail pages build and there's no e2e for the page; it's validated with a throwaway sample during review and stays green on build/check.

**Tech Stack:** Astro 6 content collections, `astro:assets`, `ContentHero`. No new deps.

**Spec:** `docs/superpowers/specs/2026-06-12-content-layout-projects-design.md`. **Branch:** `feat/content-layout-projects` (spec committed there).

---

## File structure

- `src/content.config.ts` — **modify**: `projects` schema → function form + `image`/`imageFocus`.
- `src/lib/content-utils.ts` — **modify**: `Project` type gains `image?`/`imageFocus?`.
- `src/lib/content.ts` — **modify**: `toProject` maps `image`/`imageFocus`.
- `src/pages/projets/[slug].astro` + `src/pages/en/projets/[slug].astro` — **modify**: canonical layout.

---

### Task 1: Projects schema cover + `Project` type + mapping

**Files:** `src/content.config.ts`, `src/lib/content-utils.ts`, `src/lib/content.ts`.

- [ ] **Step 1: `content.config.ts`** — change the `projects` collection schema from the object form to the function form, keeping every existing field and adding the two image fields. Replace:
```ts
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
```
with:
```ts
  schema: ({ image }) => z.object({
    name: z.string().min(1),
    year: z.string(),
    role: z.string(),
    oneliner: z.string(),
    stack: z.array(z.string()).default([]),
    demo: z.boolean().default(false),
    relatedArticles: z.array(reference('articles')).default([]),
    translationId: z.string().optional(),
    image: image().optional(),
    imageFocus: z.enum(['center', 'top', 'bottom']).default('center'),
  }),
```

- [ ] **Step 2: `content-utils.ts`** — in the `Project` interface, add the two fields (after `relatedArticles`):
```ts
  image?: import('astro').ImageMetadata;
  imageFocus?: 'center' | 'top' | 'bottom';
```
(`ImageMetadata` is already imported at the top of the file for `Article`; if so, use `ImageMetadata` instead of the inline `import('astro').ImageMetadata`. Match the existing `Article.image` declaration style.)

- [ ] **Step 3: `content.ts`** — in `toProject`, add the two fields to the returned object:
```ts
    image: d.image,
    imageFocus: d.imageFocus,
```
(Insert alongside the other mapped fields, e.g. after `relatedArticles: d.relatedArticles.map((r) => r.id),`.)

- [ ] **Step 4: Type-check + build**

Run: `pnpm --filter @johan-chan/site exec astro check && pnpm --filter @johan-chan/site build`
Expected: 0 errors; 45 pages (no projects → no detail pages; the schema/type changes just compile).

- [ ] **Step 5: Commit**

```bash
git add apps/site/src/content.config.ts apps/site/src/lib/content-utils.ts apps/site/src/lib/content.ts
git commit -m "feat(site): projects gain an optional cover (image/imageFocus)"
```

---

### Task 2: Projects detail page (FR) — canonical layout

**Files:** Overwrite `src/pages/projets/[slug].astro`.

- [ ] **Step 1: Replace the whole file** with:
```astro
---
import PageLayout from '../../layouts/PageLayout.astro';
import { getImage } from 'astro:assets';
import ContentHero from '../../components/ContentHero.astro';
import { copy, kindClass } from '../../lib/copy';
import { getProjects, getProjectEntry, getArticles, hasTranslation } from '../../lib/content';
import { articlesBySlugs } from '../../lib/content-utils';
import type { Lang } from '../../i18n/ui';

export async function getStaticPaths() {
  const projects = await getProjects('fr');
  return projects.map((p) => ({ params: { slug: p.slug } }));
}
const lang: Lang = 'fr';
const { slug } = Astro.params;
const { project, Content } = await getProjectEntry(slug!, 'fr');
const translated = await hasTranslation(slug!, 'fr', 'projects');
const C = copy[lang];
const related = articlesBySlugs(project.relatedArticles, await getArticles('fr'));
const ogImage = project.image
  ? new URL((await getImage({ src: project.image, format: 'webp', width: 1200 })).src, Astro.site).href
  : undefined;
---
<PageLayout lang={lang} current="work" title={`${project.name} — ${C.name}`} description={project.oneliner} ogImage={ogImage} hasTranslation={translated}>
  <article class="atl-rise pt-8 md:pt-10">
    <div class="mx-auto max-w-[680px]">
      <a href="/projets" class="atl-meta inline-flex items-center gap-2 text-ink2" style="font-size:12px">{C.caseStudy.back}</a>
    </div>
    <div data-pagefind-body class="mt-4">
      <ContentHero image={project.image} imageFocus={project.imageFocus} title={project.name} excerpt={project.oneliner}>
        <Fragment slot="kicker">{C.projects.badge}</Fragment>
        <Fragment slot="meta">
          <span>{project.year}</span><span>·</span><span>{project.role}</span>
          {project.stack.length > 0 && <span>·</span>}
          <span class="flex flex-wrap gap-2">{project.stack.map((s) => <span>{s}</span>)}</span>
        </Fragment>
      </ContentHero>
      <div class="mt-9">
        <div class="atl-prose font-text text-[16.5px] leading-[1.7] text-ink2 md:text-[18px]">
          <Content />
        </div>
      </div>
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
</PageLayout>
```

- [ ] **Step 2: Type-check + build**

Run: `pnpm --filter @johan-chan/site exec astro check && pnpm --filter @johan-chan/site build`
Expected: 0 errors; 45 pages (still no project detail pages — the module just compiles).

- [ ] **Step 3: Commit**

```bash
git add "apps/site/src/pages/projets/[slug].astro"
git commit -m "feat(site): projects detail adopts the ContentHero + rail layout"
```

---

### Task 3: Projects detail page (EN) — mirror

**Files:** Overwrite `src/pages/en/projets/[slug].astro`.

- [ ] **Step 1: Replace the whole file** — identical to Task 2 except import depth `../../../`, `getProjects('en')`, `lang = 'en'`, back link `/en/projets`, and related links `/en/journal/${rp.slug}`:
```astro
---
import PageLayout from '../../../layouts/PageLayout.astro';
import { getImage } from 'astro:assets';
import ContentHero from '../../../components/ContentHero.astro';
import { copy, kindClass } from '../../../lib/copy';
import { getProjects, getProjectEntry, getArticles, hasTranslation } from '../../../lib/content';
import { articlesBySlugs } from '../../../lib/content-utils';
import type { Lang } from '../../../i18n/ui';

export async function getStaticPaths() {
  const projects = await getProjects('en');
  return projects.map((p) => ({ params: { slug: p.slug } }));
}
const lang: Lang = 'en';
const { slug } = Astro.params;
const { project, Content } = await getProjectEntry(slug!, 'en');
const translated = await hasTranslation(slug!, 'en', 'projects');
const C = copy[lang];
const related = articlesBySlugs(project.relatedArticles, await getArticles('en'));
const ogImage = project.image
  ? new URL((await getImage({ src: project.image, format: 'webp', width: 1200 })).src, Astro.site).href
  : undefined;
---
<PageLayout lang={lang} current="work" title={`${project.name} — ${C.name}`} description={project.oneliner} ogImage={ogImage} hasTranslation={translated}>
  <article class="atl-rise pt-8 md:pt-10">
    <div class="mx-auto max-w-[680px]">
      <a href="/en/projets" class="atl-meta inline-flex items-center gap-2 text-ink2" style="font-size:12px">{C.caseStudy.back}</a>
    </div>
    <div data-pagefind-body class="mt-4">
      <ContentHero image={project.image} imageFocus={project.imageFocus} title={project.name} excerpt={project.oneliner}>
        <Fragment slot="kicker">{C.projects.badge}</Fragment>
        <Fragment slot="meta">
          <span>{project.year}</span><span>·</span><span>{project.role}</span>
          {project.stack.length > 0 && <span>·</span>}
          <span class="flex flex-wrap gap-2">{project.stack.map((s) => <span>{s}</span>)}</span>
        </Fragment>
      </ContentHero>
      <div class="mt-9">
        <div class="atl-prose font-text text-[16.5px] leading-[1.7] text-ink2 md:text-[18px]">
          <Content />
        </div>
      </div>
    </div>
    {related.length > 0 && (
      <div class="mt-9 border-t border-line pt-5">
        <div class="atl-meta mb-1.5 uppercase text-ink2" style="font-size:11px;letter-spacing:.12em">{C.caseStudy.whatHelped}</div>
        <p class="font-text text-[14px] text-faint" style="margin:0 0 16px">{C.caseStudy.whatHelpedSub}</p>
        <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
          {related.map((rp) => (
            <a href={`/en/journal/${rp.slug}`} class="atl-row block rounded-[11px] border border-line bg-surf px-3.5 py-3.5">
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
</PageLayout>
```

- [ ] **Step 2: Type-check + build**

Run: `pnpm --filter @johan-chan/site exec astro check && pnpm --filter @johan-chan/site build`
Expected: 0 errors; 45 pages + Pagefind "Indexed 32 pages".

- [ ] **Step 3: Commit**

```bash
git add "apps/site/src/pages/en/projets/[slug].astro"
git commit -m "feat(site): EN projects detail adopts the ContentHero + rail layout"
```

---

## Verification checklist (end of slice)

- [ ] `pnpm --filter @johan-chan/site check` — 0 errors.
- [ ] `pnpm --filter @johan-chan/site build` — 45 pages + 32 indexed; **0 project detail pages** (no content).
- [ ] `pnpm --filter @johan-chan/site test:e2e` — the existing 28 stay green (no project page exists to test; the `/projets` empty-state test is unaffected).
- [ ] **Throwaway-sample validation** (controller, NOT committed): create `src/content/projects/_sample/index.mdx` (frontmatter `name`/`year`/`role`/`oneliner`/`stack`/`image: ./images/cover.webp` + a body with a `## heading` and a paragraph) and copy any 16:9 webp to `src/content/projects/_sample/images/cover.webp`; `pnpm --filter @johan-chan/site dev` (or build+preview) and screenshot `/projets/_sample` to confirm the cover hero + rail prose + (no related) render; also drop the cover to confirm the no-image header. Then **`rm -rf src/content/projects/_sample`** and rebuild to confirm back to 0 detail pages. Nothing from the sample is committed.
- [ ] `git diff --name-only main..HEAD` — only `apps/site/**` + `docs/**`; no `src/content/projects/_sample`; the 4 dev-proxy files remain uncommitted; no new dependency.
