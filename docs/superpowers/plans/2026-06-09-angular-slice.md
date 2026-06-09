# Angular Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bump the repo to Node 24 LTS, then add **Angular 21** as a 4th live framework in the `<FrameworkShowcase>` — an Astro island via `@analogjs/astro-angular` (SSR + hydration), consistent with Svelte/Vue/React, with **no TypeScript change**.

**Architecture:** Phase 0 bumps Node pins repo-wide and verifies both apps. Phase 1 adds the Analog Astro-Angular integration + Angular 21 deps (via the dev-proxy lockfile dance), a standalone Angular counter colocated in the demo article, and a 4th `<Demo>`. Angular type/template errors are caught at build by `ngtsc` (run by the Analog Vite plugin).

**Tech Stack:** Node 24.16.0, Astro 6.4, `@analogjs/astro-angular@2.6.0`, Angular `^21`, zone.js, TypeScript 5.9.3 (unchanged), Vitest/Playwright.

**Spec:** `docs/superpowers/specs/2026-06-09-angular-slice-design.md`

---

## Conventions (read once)

- Commands: `pnpm --filter @johan-chan/site <script>` and `pnpm --filter @johan-chan/web <script>`.
- **NEVER** `git add -A`/`git add .`. Local-only never-commit files: `apps/web/package.json`, `apps/web/vite.config.ts`, `pnpm-lock.yaml`, `turbo.json` (the dev-proxy link). Add only exact paths. **Exception:** Task 2 commits a regenerated *clean* `pnpm-lock.yaml` (no dev-proxy) via the dance — follow its steps exactly.
- Commit trailer on every commit:
  ```
  Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
  ```
- French prose (the demo article) uses typographic `’` (U+2019); the article already exists and is correct — don't disturb its apostrophes.
- The site uses `ClientRouter`; nothing new here needs island re-init beyond what exists.

## File Structure

```
.nvmrc                                  (MODIFY) 22.12.0 → 24.16.0
.github/workflows/ci.yml                (MODIFY) node-version '22' → '24'
.github/workflows/deploy.yml            (MODIFY) node-version '22' → '24'
apps/site/
├── astro.config.mjs                    (MODIFY) + angular() integration
├── tsconfig.app.json                   (CREATE) Angular compiler config
├── package.json                        (MODIFY) + @analogjs/astro-angular + @angular/* deps
├── src/components/content/Demo.astro   (MODIFY) + 'angular' framework
├── src/components/content/FrameworkShowcase.astro (MODIFY) + 'angular' in NAMES
└── src/content/articles/reactivite-trois-frameworks/
    ├── counter.angular.ts              (CREATE) standalone Angular counter
    └── index.mdx                       (MODIFY) + 4th <Demo>
apps/site/tests/smoke.spec.ts           (MODIFY) showcase test covers Angular tab
```

---

## Task 1: Bump Node → 24.16.0 (Phase 0, standalone)

**Files:** `.nvmrc`, `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`

> No dependency/lockfile change here — Node pins don't touch deps. This must verify **both apps** on Node 24 before Phase 1.

- [ ] **Step 1: Install Node 24 on the devbox**

```bash
nvm install 24.16.0 && nvm use 24.16.0 && node -v   # expect v24.16.0
```
(If `nvm` isn't present, install Node 24.16.0 by the devbox's usual mechanism. Report if unavailable.)

- [ ] **Step 2: Update the pins**

- `.nvmrc`: replace `22.12.0` with `24.16.0`.
- `.github/workflows/ci.yml` (line ~26): `node-version: '22'` → `node-version: '24'`.
- `.github/workflows/deploy.yml` (line ~29): `node-version: '22'` → `node-version: '24'`.

- [ ] **Step 3: Reinstall + rebuild native modules for Node 24**

```bash
pnpm install   # rebuilds native deps (e.g. sharp in apps/web) against Node 24 ABI
```

- [ ] **Step 4: Verify BOTH apps on Node 24**

```bash
pnpm --filter @johan-chan/web build
pnpm --filter @johan-chan/web test:unit
pnpm --filter @johan-chan/site check
pnpm --filter @johan-chan/site build
pnpm --filter @johan-chan/site test:e2e
```
All must pass. If `apps/web` fails to build/test on Node 24 (e.g. `sharp` ABI), STOP and report — that's a separate investigation, do not force past it.

- [ ] **Step 5: Confirm the lockfile didn't change**

```bash
git status --short pnpm-lock.yaml
```
If `pnpm-lock.yaml` shows modified beyond the pre-existing dev-proxy delta, inspect why; do NOT commit it (it's a never-commit file). Node pins alone should not change it.

- [ ] **Step 6: Commit (pins only)**

```bash
git add .nvmrc .github/workflows/ci.yml .github/workflows/deploy.yml
git commit -m "build: bump Node to 24.16.0 LTS

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Angular 21 deps + integration (Phase 1 — lockfile dance)

**Files:** `apps/web/package.json` (temp), `apps/site/package.json`, `apps/site/astro.config.mjs`, `apps/site/tsconfig.app.json`, `pnpm-lock.yaml`

- [ ] **Step 1: Note + remove the dev-proxy link**

`git diff apps/web/package.json` → confirm the only change is the `optionalDependencies.vite-plugin-dev-proxy` `link:` block. Note it verbatim (you re-add it in Step 7). Then edit `apps/web/package.json` to delete that `optionalDependencies` block (returns it to HEAD-clean).

- [ ] **Step 2: Add Angular 21 deps to apps/site (regenerates clean lockfile)**

```bash
pnpm --filter @johan-chan/site add \
  @analogjs/astro-angular \
  @angular/core@^21 @angular/common@^21 @angular/compiler@^21 @angular/compiler-cli@^21 \
  @angular/platform-browser@^21 @angular/platform-server@^21 @angular/animations@^21 @angular/build@^21 \
  rxjs zone.js tslib
```
TypeScript is untouched (stays 5.9.3 — Angular 21 accepts ≥5.9). If pnpm reports a peer conflict, read it and adjust the `@angular/*` range minimally, keeping major 21.

- [ ] **Step 3: Wire the integration**

`apps/site/astro.config.mjs` — add the import and integration:
```ts
import angular from '@analogjs/astro-angular';
// integrations: [mdx(), svelte(), vue(), react(), angular()],
```

Create `apps/site/tsconfig.app.json` (Angular compiler config):
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "moduleResolution": "bundler",
    "target": "es2022",
    "module": "es2022"
  },
  "include": ["src/content/**/*.angular.ts"]
}
```
> If `astro build` later complains the Angular component isn't found by a tsconfig, or the decorator/compilation errors, iterate this file's `compilerOptions`/`include` until the build is green — the spike confirmed an `tsconfig.app.json` of roughly this shape works. Don't change the root `tsconfig.json` (it serves the other frameworks).

- [ ] **Step 4: Verify build + frozen-lockfile (clean state)**

```bash
pnpm install
pnpm --filter @johan-chan/site build           # integrations load; 14 pages (no Angular component used yet)
pnpm install --frozen-lockfile                  # MUST pass — simulates apps/web CI on the clean lockfile
grep -c dev-proxy pnpm-lock.yaml                # expect 0 (clean)
```

- [ ] **Step 5: Commit clean lockfile + config (NOT apps/web)**

```bash
git add apps/site/package.json apps/site/astro.config.mjs apps/site/tsconfig.app.json pnpm-lock.yaml
git commit -m "build(site): add @analogjs/astro-angular + Angular 21

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

- [ ] **Step 6: Restore the dev-proxy delta**

Re-add the exact `optionalDependencies` dev-proxy block (from Step 1) to `apps/web/package.json`, then:
```bash
pnpm install
```

- [ ] **Step 7: Confirm end state**

```bash
git status --short
```
Expected: `apps/web/package.json`, `apps/web/vite.config.ts`, `pnpm-lock.yaml`, `turbo.json`, `.claude/` modified-unstaged again; nothing of ours staged; committed HEAD lockfile has 0 dev-proxy refs.

---

## Task 3: Angular counter + wire it into the showcase

**Files:** `apps/site/src/content/articles/reactivite-trois-frameworks/counter.angular.ts` (create), `apps/site/src/components/content/Demo.astro` (modify), `apps/site/src/components/content/FrameworkShowcase.astro` (modify), `apps/site/src/content/articles/reactivite-trois-frameworks/index.mdx` (modify)

- [ ] **Step 1: Create the standalone Angular counter**

`apps/site/src/content/articles/reactivite-trois-frameworks/counter.angular.ts`:
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-ng-counter',
  standalone: true,
  template: `
    <button (click)="count = count - 1" aria-label="moins">−</button>
    <output>{{ count }}</output>
    <button (click)="count = count + 1" aria-label="plus">+</button>
  `,
})
export class NgCounter {
  count = 0;
}
```

- [ ] **Step 2: Extend `Demo.astro` for `'angular'`**

In `apps/site/src/components/content/Demo.astro` frontmatter, change the `framework` union and the derived values:
- `interface Props { framework: 'svelte' | 'vue' | 'react' | 'angular'; source: string; label?: string }`
- `const lang = (framework === 'react' ? 'tsx' : framework === 'angular' ? 'ts' : framework) as 'svelte' | 'vue' | 'tsx' | 'ts';`
- `const ext = framework === 'react' ? 'tsx' : framework === 'angular' ? 'angular.ts' : framework;`
- `const name = { svelte: 'Svelte', vue: 'Vue', react: 'React', angular: 'Angular' }[framework];`

(Markup unchanged — it already renders `name`, `file`, the `<Code lang={lang}>` panel, and the `<slot/>`.)

- [ ] **Step 3: Add Angular to `FrameworkShowcase.astro` tab names**

In the `<script>`, change:
```ts
const NAMES: Record<string, string> = { svelte: 'Svelte', vue: 'Vue', react: 'React' };
```
to:
```ts
const NAMES: Record<string, string> = { svelte: 'Svelte', vue: 'Vue', react: 'React', angular: 'Angular' };
```
(Everything else is data-driven from the rendered `<Demo>`s — no other change.)

- [ ] **Step 4: Add the 4th `<Demo>` to the demo article**

In `apps/site/src/content/articles/reactivite-trois-frameworks/index.mdx`, add to the imports:
```mdx
import { NgCounter } from './counter.angular';  import ngSrc from './counter.angular.ts?raw';
```
and add a 4th `<Demo>` inside `<FrameworkShowcase>` (after the React one):
```mdx
  <Demo framework="angular" source={ngSrc}><NgCounter client:load /></Demo>
```
Optionally add one sentence to the closing prose mentioning Angular's zone-based change detection (keep typographic `’`). Don't alter the existing three demos.

- [ ] **Step 5: Build (the ngtsc gate) + verify it catches errors**

```bash
pnpm --filter @johan-chan/site build
```
Expected: success; the article page renders a 4th demo; the Angular island SSRs as `<app-ng-counter ng-version="21..." ng-server-context="analog">`. Confirm with: `grep -c 'app-ng-counter' apps/site/dist/journal/reactivite-trois-frameworks/index.html` → ≥1.

Gate check: temporarily introduce a type error in `counter.angular.ts` (e.g. `count: number = 'x';`), run `pnpm --filter @johan-chan/site build`, confirm it **FAILS** (ngtsc), then revert. Report whether it caught it.

- [ ] **Step 6: Type-check**

`pnpm --filter @johan-chan/site check` → 0 errors (the composite svelte-check/vue-tsc/tsc; Angular is covered by the build's ngtsc, not these).

- [ ] **Step 7: Commit**

```bash
git add apps/site/src/content/articles/reactivite-trois-frameworks/counter.angular.ts apps/site/src/components/content/Demo.astro apps/site/src/components/content/FrameworkShowcase.astro apps/site/src/content/articles/reactivite-trois-frameworks/index.mdx
git commit -m "feat(site): add Angular 21 as a 4th framework in the showcase

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: e2e + full verification

**Files:** `apps/site/tests/smoke.spec.ts`

- [ ] **Step 1: Extend the showcase e2e test for the Angular tab**

In `apps/site/tests/smoke.spec.ts`, in the `'framework showcase: …'` test, after the existing Vue-tab assertions and before the compare-toggle section, add:
```ts
  // switching to the Angular tab shows its (hydrated) island
  await page.getByRole('button', { name: 'Angular', exact: true }).click();
  const ngDemo = page.locator('[data-demo][data-framework="angular"]');
  await expect(ngDemo).toBeVisible();
  await ngDemo.getByRole('button', { name: 'plus' }).click();
  await expect(ngDemo.locator('output')).toHaveText('1');
```
(If the exact placement is awkward, add these assertions wherever they read cleanly within the same test — the suite stays at 10 tests.)

- [ ] **Step 2: Full verification sweep**

```bash
pnpm --filter @johan-chan/site test:unit
pnpm --filter @johan-chan/site check
pnpm --filter @johan-chan/site build
pnpm --filter @johan-chan/site test:e2e
pnpm install --frozen-lockfile
```
Expected: unit green; check 0 errors; build 14 pages (article has 4 demos); e2e 10/10 incl. the Angular-tab assertions; frozen-lockfile passes. If the Angular island doesn't hydrate (counter doesn't increment) or the tab doesn't show it, that's a real bug — report specifics, don't weaken the test.

- [ ] **Step 3: Confirm dev-proxy files still only-local**

`git status --short` → only `apps/web/*`, `pnpm-lock.yaml`, `turbo.json`, `.claude/` unstaged; nothing of ours staged.

- [ ] **Step 4: Commit**

```bash
git add apps/site/tests/smoke.spec.ts
git commit -m "test(site): showcase e2e covers the Angular tab

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Self-Review (completed during authoring)

**Spec coverage:** Node 24 pins + both-apps verify (T1) · Angular 21 deps + integration + tsconfig.app.json via lockfile dance (T2) · standalone counter + Demo/FrameworkShowcase/article wiring (T3) · ngtsc build gate + injected-error check (T3 Step 5) · e2e Angular tab + full sweep + frozen-lockfile (T4). All spec sections map to a task.

**Placeholder scan:** none. The `tsconfig.app.json` iteration latitude (T2 Step 3) is a bounded "make build green" instruction for a version-sensitive config, not a TODO.

**Type consistency:** `framework: 'svelte'|'vue'|'react'|'angular'` extended consistently in `Demo.astro` (T3 S2) and matched by `FrameworkShowcase` `NAMES` (T3 S3) and the MDX `<Demo framework="angular">` (T3 S4); component named export `NgCounter` consistent between `counter.angular.ts` (T3 S1), the MDX import (T3 S4); `data-framework="angular"` consistent between the rendered Demo and the e2e locator (T4 S1). Node `24.16.0` consistent across `.nvmrc` and the two workflows.

**Known follow-ups (out of scope):** Angular Elements (B); TS 6 / Angular 22; bundle/LOC metrics; showcase reuse on project pages; dead `daisyui` dep cleanup.
