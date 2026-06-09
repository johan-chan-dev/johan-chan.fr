# Multi-framework `<FrameworkShowcase>` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let an `apps/site` article show one pattern implemented live in Svelte, Vue, and React side-by-side, with the source code shown next to each running island — the comparison is the content.

**Architecture:** Add the three native Astro framework integrations. A `<Demo>` content component pairs a Shiki code panel (Astro's built-in `<Code>`) with a `<slot>` for a live island; a `<FrameworkShowcase>` wraps N `<Demo>`s and provides focus(tabs)/compare(grid) view modes via a vanilla island. Each demo file is single-sourced (`?raw` shows the same module the build compiles). Correctness gate = `astro build` (compile) + per-framework type-checkers (`svelte-check`/`vue-tsc`/`tsc`).

**Tech Stack:** Astro 6.4, `@astrojs/svelte` + `@astrojs/vue` + `@astrojs/react`, Svelte 5, Vue 3, React, Shiki (`<Code>`), Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-06-09-framework-showcase-design.md`

---

## Conventions (read once)

- Commands via `pnpm --filter @johan-chan/site <script>`: `check`, `test:e2e`, `build`.
- **NEVER** `git add -A`/`git add .`. The working tree has local-only `apps/web/package.json`, `apps/web/vite.config.ts`, `pnpm-lock.yaml`, `turbo.json` (the dev-proxy link). Add only the exact paths each task lists. **Exception:** Task 1 deliberately commits a regenerated *clean* `pnpm-lock.yaml` (no dev-proxy) — see its steps precisely.
- Commit trailer on every commit:
  ```
  Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
  ```
- **Typographic apostrophes** `’` (U+2019) in all French prose (the demo article). Never flatten to ASCII `'`. Verify after writing with `grep -nE "[A-Za-zÀ-ÿ]'[A-Za-zÀ-ÿ]" <file>` → must be empty.
- The site uses Astro `ClientRouter` (view transitions): any island chrome script MUST (re)initialise on `astro:page-load`, not just on load. (Lesson already applied to Proof/MobileNav/JournalFilters.)
- Astro inline `<script>` (non-`is:inline`) is type-checked; type DOM lookups (`querySelectorAll<HTMLElement>`, `as HTMLElement`) so `astro check` passes.

## File Structure

```
apps/site/
├── astro.config.mjs                 (MODIFY) + svelte()/vue()/react() integrations
├── tsconfig.json                    (MODIFY) React jsx settings
├── tsconfig.demos.json              (CREATE) scoped tsc for .tsx demos
├── svelte.config.js                 (CREATE) minimal, for svelte-check
├── package.json                     (MODIFY) deps + composite check script
├── src/components/content/
│   ├── Demo.astro                   (CREATE)
│   └── FrameworkShowcase.astro      (CREATE)
├── src/styles/global.css            (MODIFY) .atl-showcase / .atl-demo styles
└── src/content/articles/reactivite-trois-frameworks/
    ├── index.mdx                    (CREATE)
    ├── counter.svelte               (CREATE)
    ├── counter.vue                  (CREATE)
    └── counter.tsx                  (CREATE)
tests/smoke.spec.ts                  (MODIFY) + showcase e2e
```

---

## Task 1: Integrations, deps, checkers — with the lockfile dance

**Files:**
- Modify: `apps/site/astro.config.mjs`, `apps/site/tsconfig.json`, `apps/site/package.json`
- Create: `apps/site/tsconfig.demos.json`, `apps/site/svelte.config.js`
- Touch (temporarily): `apps/web/package.json` (dev-proxy link), `pnpm-lock.yaml`

> This is the highest-risk task: it adds real deps and must produce a **committable clean lockfile** (no dev-proxy) while restoring your local dev-proxy deltas afterward. Follow the steps exactly.

- [ ] **Step 1: Record the current dev-proxy delta so you can restore it**

```bash
git stash list >/dev/null  # noop, just orient
# Confirm the dev-proxy link is the only thing special in apps/web/package.json:
git diff apps/web/package.json
```
Expected diff: an added `optionalDependencies.vite-plugin-dev-proxy: "link:/home/jconan/.devrig/packages/vite-plugin-dev-proxy"`. Note it — you will re-add this exact block in Step 7.

- [ ] **Step 2: Temporarily remove the dev-proxy link from `apps/web/package.json`**

Edit `apps/web/package.json` and delete the `optionalDependencies` block containing `vite-plugin-dev-proxy` (so the workspace resolves with no local link).

- [ ] **Step 3: Add the framework deps to `apps/site` (regenerates a clean lockfile)**

```bash
pnpm --filter @johan-chan/site add @astrojs/svelte @astrojs/vue @astrojs/react svelte vue react react-dom
pnpm --filter @johan-chan/site add -D svelte-check vue-tsc @types/react @types/react-dom
```
pnpm resolves Astro-6-compatible versions. This rewrites `pnpm-lock.yaml` **without** the dev-proxy link (it's gone from apps/web now) and **with** the new apps/site deps.

- [ ] **Step 4: Wire integrations + TS config**

`apps/site/astro.config.mjs` — add imports and integrations (keep `mdx()` first, keep existing `i18n`, `vite`):
```ts
import svelte from '@astrojs/svelte';
import vue from '@astrojs/vue';
import react from '@astrojs/react';
// in defineConfig: integrations: [mdx(), svelte(), vue(), react()],
```

`apps/site/tsconfig.json` — add to `compilerOptions` (for editor + Astro React JSX):
```json
"jsx": "react-jsx",
"jsxImportSource": "react"
```

Create `apps/site/svelte.config.js` (so `svelte-check` has a config):
```js
import { vitePreprocess } from '@astrojs/svelte';
export default { preprocess: vitePreprocess() };
```

Create `apps/site/tsconfig.demos.json` (isolated React `.tsx` type-check):
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": { "noEmit": true, "jsx": "react-jsx", "jsxImportSource": "react" },
  "include": ["src/content/**/*.tsx"]
}
```

- [ ] **Step 5: Composite `check` script**

In `apps/site/package.json` `scripts`, replace `"check": "astro check"` with:
```json
"check": "astro check && svelte-check && vue-tsc --noEmit -p tsconfig.demos.json && tsc -p tsconfig.demos.json"
```
> If `vue-tsc -p tsconfig.demos.json` errors because the demos tsconfig has no `.vue` files yet, or chokes on `.astro`, adjust: scope `vue-tsc` with a dedicated include or run it project-wide — iterate until `check` is green on the current (no-component-yet) tree. The principle: each framework's checker runs over its files. If a checker can't be cleanly scoped this task, leave it out of `check` and add it in Task 4 once real demo files exist, noting coverage. Do not leave `check` red.

- [ ] **Step 6: Verify build + check + frozen-lockfile (clean state)**

```bash
pnpm install                                   # ensure node_modules match clean lockfile
pnpm --filter @johan-chan/site check           # 0 errors
pnpm --filter @johan-chan/site build           # 13 pages, integrations load
pnpm install --frozen-lockfile                 # MUST pass — simulates apps/web CI on the clean lockfile
```
All must pass. If `--frozen-lockfile` fails, the lockfile and package.jsons are out of sync — fix before committing.

- [ ] **Step 7: Commit the clean lockfile + config (NOT apps/web), then restore the dev-proxy delta**

```bash
git add apps/site/package.json apps/site/astro.config.mjs apps/site/tsconfig.json apps/site/tsconfig.demos.json apps/site/svelte.config.js pnpm-lock.yaml
git commit -m "build(site): add Svelte/Vue/React integrations + per-framework checkers

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```
Now restore the local dev-proxy delta (re-add the exact `optionalDependencies` block from Step 1 to `apps/web/package.json`) and reinstall so the working tree returns to its prior local state:
```bash
# re-add the dev-proxy optionalDependencies block to apps/web/package.json (from Step 1)
pnpm install
```

- [ ] **Step 8: Confirm end state**

```bash
git status --short
```
Expected: `apps/web/package.json`, `apps/web/vite.config.ts`, `pnpm-lock.yaml`, `turbo.json` show as **modified-unstaged** again (the dev-proxy deltas restored, exactly as before this task); nothing of ours staged. The committed lockfile (HEAD) is clean + has the new deps.

---

## Task 2: `Demo.astro`

**Files:**
- Create: `apps/site/src/components/content/Demo.astro`

- [ ] **Step 1: Create the component**

```astro
---
import { Code } from 'astro:components';
interface Props { framework: 'svelte' | 'vue' | 'react'; source: string; label?: string }
const { framework, source, label } = Astro.props;
const lang = (framework === 'react' ? 'tsx' : framework) as 'svelte' | 'vue' | 'tsx';
const ext = framework === 'react' ? 'tsx' : framework;
const file = label ?? `counter.${ext}`;
const name = { svelte: 'Svelte', vue: 'Vue', react: 'React' }[framework];
---
<div data-demo data-framework={framework} class="atl-demo overflow-hidden rounded-[12px] border border-line">
  <div class="atl-meta flex items-center justify-between border-b border-line bg-bg2 px-3.5 py-2 text-faint" style="font-size:10.5px">
    <span class="uppercase" style="letter-spacing:.1em">{name}</span>
    <span>{file}</span>
  </div>
  <div class="atl-demo-code overflow-x-auto text-[12.5px] [&_pre]:m-0 [&_pre]:p-3.5">
    <Code code={source} lang={lang} theme="vitesse-dark" />
  </div>
  <div class="atl-demo-live flex items-center gap-3 border-t border-line bg-surf px-3.5 py-3">
    <span class="atl-meta uppercase text-faint" style="font-size:10px;letter-spacing:.1em">live</span>
    <div class="atl-demo-island flex items-center gap-2"><slot /></div>
  </div>
</div>
```
Notes: `<Code>` is Astro's built-in Shiki component (no new dep). `lang` values `svelte`/`vue`/`tsx` are Shiki built-in grammars. `theme="vitesse-dark"` is a reasonable dark code theme; adjust later if you want palette alignment (out of scope). The `[&_pre]` arbitrary variants strip Shiki's default margin/padding.

- [ ] **Step 2: Type-check**

Run: `pnpm --filter @johan-chan/site check`
Expected: 0 errors. (Component compiles; not yet used.)

- [ ] **Step 3: Commit**

```bash
git add apps/site/src/components/content/Demo.astro
git commit -m "feat(site): Demo content component (Shiki code panel + island slot)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: `FrameworkShowcase.astro` + view-mode styles

**Files:**
- Create: `apps/site/src/components/content/FrameworkShowcase.astro`
- Modify: `apps/site/src/styles/global.css`

- [ ] **Step 1: Create `FrameworkShowcase.astro`**

```astro
---
// Wraps N <Demo> children. Renders a controls bar (built client-side from the
// rendered demos) + the demos. data-mode drives focus(tabs)/compare(grid) via CSS.
---
<div class="atl-showcase my-7" data-showcase data-mode="focus">
  <div class="atl-showcase-controls flex flex-wrap items-center gap-2" data-controls></div>
  <div class="atl-showcase-demos mt-3 flex flex-col gap-4"><slot /></div>
</div>
<noscript><style>{`.atl-showcase[data-mode="focus"] [data-demo]{display:block!important}`}</style></noscript>
<script>
  type Mode = 'focus' | 'compare';
  const NAMES: Record<string, string> = { svelte: 'Svelte', vue: 'Vue', react: 'React' };
  function initShowcases() {
    document.querySelectorAll<HTMLElement>('[data-showcase]').forEach((root) => {
      const controls = root.querySelector<HTMLElement>('[data-controls]');
      const demos = [...root.querySelectorAll<HTMLElement>('[data-demo]')];
      if (!controls || !demos.length || controls.childElementCount) return; // already built / empty
      const frameworks = demos.map((d) => d.dataset.framework || '');
      let active = frameworks[0];
      let mode: Mode = 'focus';

      const tabs: Record<string, HTMLButtonElement> = {};
      frameworks.forEach((fw) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = NAMES[fw] || fw;
        b.className = 'atl-showcase-tab atl-meta rounded-full border border-line px-3 py-1 text-[12px] text-ink2';
        b.addEventListener('click', () => { active = fw; mode = 'focus'; render(); });
        tabs[fw] = b; controls.appendChild(b);
      });
      const cmp = document.createElement('button');
      cmp.type = 'button';
      cmp.className = 'atl-showcase-compare atl-meta ml-auto rounded-full border border-dashed border-line px-3 py-1 text-[12px] text-ink2';
      cmp.addEventListener('click', () => { mode = mode === 'compare' ? 'focus' : 'compare'; render(); });
      controls.appendChild(cmp);

      const render = () => {
        root.dataset.mode = mode;
        cmp.textContent = mode === 'compare' ? 'Focus' : 'Comparer';
        cmp.setAttribute('aria-pressed', String(mode === 'compare'));
        demos.forEach((d) => { d.style.display = mode === 'compare' || d.dataset.framework === active ? '' : 'none'; });
        frameworks.forEach((fw) => {
          const on = mode === 'focus' && fw === active;
          tabs[fw].setAttribute('aria-pressed', String(on));
          tabs[fw].classList.toggle('is-active', on);
        });
      };
      render();
    });
  }
  document.addEventListener('astro:page-load', initShowcases);
</script>
```
Notes: all `<Demo>`s are server-rendered; pre-JS CSS (next step) shows only the first (focus). The script builds the tab bar + compare button from the rendered demos and drives visibility via inline `style.display` (overrides the CSS default). Re-inits on `astro:page-load` (ClientRouter). The `controls.childElementCount` guard avoids double-building.

- [ ] **Step 2: Append showcase styles to `apps/site/src/styles/global.css`**

```css
/* ---- framework showcase ---- */
.atl-showcase[data-mode="focus"] .atl-showcase-demos > [data-demo]:not(:first-child) { display: none; }
.atl-showcase-tab.is-active { color: var(--ink); border-color: var(--ink); }
.atl-showcase[data-mode="compare"] .atl-showcase-demos { display: grid; gap: 16px; }
@media (min-width: 768px) {
  .atl-showcase[data-mode="compare"] { position: relative; left: 50%; transform: translateX(-50%); width: min(94vw, 1200px); }
  .atl-showcase[data-mode="compare"] .atl-showcase-demos { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
```
Pre-JS / no-JS: focus shows the first demo only (the `<noscript>` reveals all if JS is off). Compare: stacked on mobile, 3 columns on desktop, the block breaking wider than the 880 reading column.

- [ ] **Step 3: Type-check**

Run: `pnpm --filter @johan-chan/site check`
Expected: 0 errors (the `<script>` is typed: `querySelectorAll<HTMLElement>`, typed maps).

- [ ] **Step 4: Commit**

```bash
git add apps/site/src/components/content/FrameworkShowcase.astro apps/site/src/styles/global.css
git commit -m "feat(site): FrameworkShowcase — focus tabs + compare grid (vanilla island)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: The demo article (exercises the whole pipeline)

**Files:**
- Create: `apps/site/src/content/articles/reactivite-trois-frameworks/counter.svelte`, `counter.vue`, `counter.tsx`, `index.mdx`

- [ ] **Step 1: Create the three demo components**

`counter.svelte` (Svelte 5 runes):
```svelte
<script lang="ts">
  let count = $state(0);
</script>
<button onclick={() => (count -= 1)} aria-label="moins">−</button>
<output>{count}</output>
<button onclick={() => (count += 1)} aria-label="plus">+</button>
```

`counter.vue`:
```vue
<script setup lang="ts">
import { ref } from 'vue';
const count = ref(0);
</script>
<template>
  <button @click="count--" aria-label="moins">−</button>
  <output>{{ count }}</output>
  <button @click="count++" aria-label="plus">+</button>
</template>
```

`counter.tsx` (React):
```tsx
import { useState } from 'react';
export default function Counter() {
  const [count, setCount] = useState(0);
  return (
    <>
      <button onClick={() => setCount((c) => c - 1)} aria-label="moins">−</button>
      <output>{count}</output>
      <button onClick={() => setCount((c) => c + 1)} aria-label="plus">+</button>
    </>
  );
}
```

- [ ] **Step 2: Create `index.mdx`** (typographic apostrophes `’`)

```mdx
---
title: La réactivité, d’un framework à l’autre
registre: design
date: 2026-06-09
tags: [Réactivité, Frameworks]
readingTime: 7
---
import FrameworkShowcase from '../../../components/content/FrameworkShowcase.astro';
import Demo from '../../../components/content/Demo.astro';
import Svelte from './counter.svelte';  import svelteSrc from './counter.svelte?raw';
import Vue from './counter.vue';        import vueSrc from './counter.vue?raw';
import React from './counter.tsx';      import reactSrc from './counter.tsx?raw';

Un compteur, c’est trivial — mais la façon d’y arriver dit beaucoup de la philosophie de chaque framework. Le même pattern, trois fois :

<FrameworkShowcase>
  <Demo framework="svelte" source={svelteSrc}><Svelte client:visible /></Demo>
  <Demo framework="vue" source={vueSrc}><Vue client:visible /></Demo>
  <Demo framework="react" source={reactSrc}><React client:visible /></Demo>
</FrameworkShowcase>

Côté Svelte, la réactivité est implicite : on déclare `count`, on l’utilise, et l’affichage suit. Côté Vue, elle passe par une `ref` et un `.value` masqué par le template. Côté React, l’état est explicite et le rendu se relance à chaque `setCount` — plus de cérémonie, plus de contrôle. Trois réponses à la même question.
```

- [ ] **Step 3: Verify apostrophes, then check + build**

```bash
grep -nE "[A-Za-zÀ-ÿ]'[A-Za-zÀ-ÿ]" apps/site/src/content/articles/reactivite-trois-frameworks/index.mdx || echo "apostrophes clean"
pnpm --filter @johan-chan/site check
pnpm --filter @johan-chan/site build
```
Expected: apostrophes clean; `check` 0 errors (now the per-framework checkers actually type-check the three counters); build emits `/journal/reactivite-trois-frameworks/` with all three islands compiled. A type error in any counter MUST fail `check` — that's the gate working. If `check`'s checkers needed adjustment (Task 1 Step 5 note), finalize them now so they cover these real files and pass.

- [ ] **Step 4: Commit**

```bash
git add apps/site/src/content/articles/reactivite-trois-frameworks/
git commit -m "feat(site): demo article — reactivity across Svelte/Vue/React

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: e2e + full verification

**Files:**
- Modify: `apps/site/tests/smoke.spec.ts`

- [ ] **Step 1: Append a showcase e2e test**

Add at the end of `apps/site/tests/smoke.spec.ts`:
```ts
test('framework showcase: code panel, live island, compare mode', async ({ page }) => {
  await page.goto('/journal/reactivite-trois-frameworks');
  const showcase = page.locator('[data-showcase]');
  await expect(showcase).toBeVisible();
  // Shiki-rendered source visible (Svelte uses $state)
  await expect(showcase).toContainText('$state');
  // focus mode: the Svelte demo is shown and interactive
  const svelteDemo = page.locator('[data-demo][data-framework="svelte"]');
  await expect(svelteDemo).toBeVisible();
  await svelteDemo.getByRole('button', { name: 'plus' }).click();
  await expect(svelteDemo.locator('output')).toHaveText('1');
  // in focus, the other frameworks' demos are hidden
  await expect(page.locator('[data-demo][data-framework="react"]')).toBeHidden();
  // compare toggle reveals all three
  await page.getByRole('button', { name: 'Comparer' }).click();
  await expect(showcase).toHaveAttribute('data-mode', 'compare');
  await expect(page.locator('[data-demo][data-framework="vue"]')).toBeVisible();
  await expect(page.locator('[data-demo][data-framework="react"]')).toBeVisible();
});
```

- [ ] **Step 2: Full verification sweep**

```bash
pnpm --filter @johan-chan/site test:unit
pnpm --filter @johan-chan/site check
pnpm --filter @johan-chan/site build
pnpm --filter @johan-chan/site test:e2e
```
Expected: unit green; check 0 errors (all four checkers); build emits **14 pages** (the 13 from sub-project #1 + the new demo article); e2e all green including the new showcase test. If the React demo isn't visible in compare or the island isn't interactive, that's a real integration bug — report it, don't weaken the test.

- [ ] **Step 3: Confirm dev-proxy files still only-local**

Run: `git status --short`
Expected: only `apps/web/*`, `pnpm-lock.yaml`, `turbo.json`, `.claude/` unstaged; nothing of ours staged. (The committed lockfile from Task 1 is clean; the working delta is the restored dev-proxy state.)

- [ ] **Step 4: Commit**

```bash
git add apps/site/tests/smoke.spec.ts
git commit -m "test(site): e2e for framework showcase (code, island, compare)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Self-Review (completed during authoring)

**Spec coverage:** integrations Svelte/Vue/React (T1) · per-framework checkers wired into `check` (T1, finalized T4) · `Demo.astro` Shiki panel + slot (T2) · `FrameworkShowcase` focus/compare + vanilla island + breakout CSS (T3) · `?raw` single-source + slot-based `client:visible` (T4 mdx) · demo article with colocated counters (T4) · build+checker correctness gate (T1/T4) · lockfile dance + frozen-lockfile check (T1) · e2e for code/island/compare + 360 no-overflow implied via compare visibility (T5). All spec sections map to a task.

**Placeholder scan:** none. Task 1 Step 5 gives explicit iteration latitude for checker scoping (a known version-sensitive area) with a hard "don't leave check red" rule and a fallback (finalize in T4) — not a vague TODO.

**Type consistency:** `framework: 'svelte'|'vue'|'react'` consistent across `Demo` props (T2), the showcase `NAMES`/`data-framework` (T3), and the MDX usage (T4). `data-showcase`/`data-mode`/`data-demo`/`data-framework`/`data-controls` attribute names consistent between T3 component and T5 test. The demo article slug `reactivite-trois-frameworks` consistent between T4 and T5. `<Code lang>` values (`svelte`/`vue`/`tsx`) consistent with the counters' file types.

**Known follow-ups (out of scope):** Angular/exotic via custom element/iframe; bundle-size/LOC metrics; showcase reuse on project pages; `@components` import alias; code-theme palette alignment; removing the dead `daisyui` dep.
```
