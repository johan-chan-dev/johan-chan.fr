# Astro Socle (`apps/site`) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a pure-Astro, locale-aware, locally-runnable foundation app `apps/site` alongside the existing SvelteKit `apps/web`, proving the content pipeline (Astro + MDX + Tailwind/DaisyUI + native i18n) end-to-end.

**Architecture:** New workspace package `@johan-chan/site`. Pure Astro components for chrome, vanilla `<script>` for the theme toggle (no UI framework — see vanilla-first principle in the spec). Native `astro:i18n` routing (FR at `/`, EN at `/en/`) + a typed `ui.ts` dictionary with a `useTranslations` helper. MDX wired with a static `.astro` component to prove content-with-component rendering. Local only — no Vercel, no adapter.

**Tech Stack:** astro 6.4.2 · @astrojs/mdx 6.0.1 · @astrojs/check 0.9.9 · tailwindcss + @tailwindcss/vite 4.3.0 · daisyui 5.5.20 · vitest 4.1.8 · @playwright/test 1.60.0 · Node 22.12.0.

**Spec:** `docs/superpowers/specs/2026-06-02-astro-socle-design.md`

---

## Pre-flight (read before Task 1)

- **Branch first.** Work on a feature branch (e.g. `feat/astro-socle`); `main` stays deployable. The socle is purely additive — it never touches `apps/web`.
- **pnpm-lock.yaml caveat.** Project memory marks `pnpm-lock.yaml`, `turbo.json`, `apps/web/package.json`, `apps/web/vite.config.ts` as local-only (dev-proxy). Installing `apps/site` deps **will** modify `pnpm-lock.yaml`, mixing socle changes with the pre-existing local dev-proxy diff. Before starting, decide with the user how to handle the lockfile boundary (commit socle lock changes only, or resolve the dev-proxy diff first). **Do not blind-commit `pnpm-lock.yaml`.**
- **No `turbo.json` change needed.** Turbo applies its generic `dev`/`build`/`check` pipelines to any workspace package exposing those scripts; `apps/*` is already globbed in `pnpm-workspace.yaml`.
- Commit steps below stage **explicit `apps/site/...` paths only**.

---

## File Structure

- Create: `apps/site/package.json` — workspace package manifest
- Create: `apps/site/astro.config.mjs` — integrations, i18n, vite/tailwind
- Create: `apps/site/tsconfig.json` — extends astro strict
- Create: `apps/site/.gitignore` — dist/.astro
- Create: `apps/site/src/styles/global.css` — tailwind + daisyui themes
- Create: `apps/site/src/i18n/ui.ts` — dictionary + types
- Create: `apps/site/src/i18n/utils.ts` — `getLangFromUrl`, `useTranslations`
- Create: `apps/site/src/layouts/Base.astro` — html shell, lang, theme init
- Create: `apps/site/src/components/ThemeToggle.astro` — vanilla toggle
- Create: `apps/site/src/components/Callout.astro` — static MDX component
- Create: `apps/site/src/pages/index.astro` — FR home (`/`)
- Create: `apps/site/src/pages/en/index.astro` — EN home (`/en/`)
- Create: `apps/site/src/pages/demo.mdx` — MDX + Callout proof
- Create: `apps/site/vitest.config.ts` — node env
- Create: `apps/site/tests/i18n.test.ts` — unit tests for i18n utils
- Create: `apps/site/playwright.config.ts` — webServer = astro dev
- Create: `apps/site/tests/smoke.spec.ts` — render + theme toggle smoke

---

## Task 1: Scaffold the Astro project

**Files:**
- Create: `apps/site/package.json`
- Create: `apps/site/astro.config.mjs`
- Create: `apps/site/tsconfig.json`
- Create: `apps/site/.gitignore`
- Create: `apps/site/src/pages/index.astro`

- [ ] **Step 1: Create `apps/site/package.json`**

```json
{
  "name": "@johan-chan/site",
  "type": "module",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test:unit": "vitest run",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "astro": "6.4.2",
    "@astrojs/mdx": "6.0.1"
  },
  "devDependencies": {
    "@astrojs/check": "0.9.9",
    "@tailwindcss/vite": "4.3.0",
    "tailwindcss": "4.3.0",
    "daisyui": "5.5.20",
    "typescript": "5.9.3",
    "vitest": "4.1.8",
    "@playwright/test": "1.60.0",
    "@types/node": "25.0.10"
  }
}
```

- [ ] **Step 2: Create `apps/site/astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://www.johan-chan.fr',
  integrations: [mdx()],
  i18n: {
    locales: ['fr', 'en'],
    defaultLocale: 'fr',
    routing: { prefixDefaultLocale: false },
  },
  vite: { plugins: [tailwindcss()] },
});
```

- [ ] **Step 3: Create `apps/site/tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 4: Create `apps/site/.gitignore`**

```
dist/
.astro/
```

- [ ] **Step 5: Create `apps/site/src/pages/index.astro` (minimal placeholder)**

```astro
---
---
<html lang="fr">
  <head><meta charset="utf-8" /><title>johan-chan</title></head>
  <body><h1>socle ok</h1></body>
</html>
```

- [ ] **Step 6: Install dependencies**

Run: `pnpm install`
Expected: resolves and links `@johan-chan/site`; no errors. (See pre-flight re: `pnpm-lock.yaml`.)

- [ ] **Step 7: Verify build passes**

Run: `pnpm --filter @johan-chan/site build`
Expected: build completes, emits `apps/site/dist/index.html` containing `socle ok`.

- [ ] **Step 8: Commit**

```bash
git add apps/site/package.json apps/site/astro.config.mjs apps/site/tsconfig.json apps/site/.gitignore apps/site/src/pages/index.astro
git commit -m "feat(site): scaffold pure Astro app (local)"
```

---

## Task 2: Wire Tailwind 4 + DaisyUI 5

**Files:**
- Create: `apps/site/src/styles/global.css`
- Modify: `apps/site/src/pages/index.astro`

- [ ] **Step 1: Create `apps/site/src/styles/global.css`**

```css
@import "tailwindcss";
@plugin "daisyui" {
  themes: autumn --default, abyss --prefersdark;
}
```

- [ ] **Step 2: Import the stylesheet and use a DaisyUI class in `index.astro`**

```astro
---
import '../styles/global.css';
---
<html lang="fr" data-theme="autumn">
  <head><meta charset="utf-8" /><title>johan-chan</title></head>
  <body class="bg-base-100 text-base-content">
    <h1 class="text-primary text-3xl font-bold" data-testid="heading">socle ok</h1>
  </body>
</html>
```

- [ ] **Step 3: Verify build still passes and emits CSS**

Run: `pnpm --filter @johan-chan/site build`
Expected: build completes; `apps/site/dist/` contains a hashed CSS asset (Tailwind/DaisyUI compiled). The page references it.

- [ ] **Step 4: Commit**

```bash
git add apps/site/src/styles/global.css apps/site/src/pages/index.astro
git commit -m "feat(site): wire Tailwind 4 + DaisyUI 5 (autumn/abyss)"
```

---

## Task 3: i18n dictionary + helpers (TDD)

**Files:**
- Create: `apps/site/src/i18n/ui.ts`
- Create: `apps/site/src/i18n/utils.ts`
- Create: `apps/site/vitest.config.ts`
- Test: `apps/site/tests/i18n.test.ts`

- [ ] **Step 1: Create `apps/site/vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
});
```

- [ ] **Step 2: Create `apps/site/src/i18n/ui.ts`**

```ts
export const languages = { fr: 'Français', en: 'English' } as const;
export const defaultLang = 'fr';

export const ui = {
  fr: {
    'nav.about': 'À propos',
    'site.tagline': 'Ce que je pense. Ce que j’apprends.',
  },
  en: {
    'nav.about': 'About',
  },
} as const;

export type Lang = keyof typeof ui;
export type UIKey = keyof (typeof ui)[typeof defaultLang];
```

- [ ] **Step 3: Write the failing test `apps/site/tests/i18n.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { getLangFromUrl, useTranslations } from '../src/i18n/utils';

describe('useTranslations', () => {
  it('returns the FR string for a known key', () => {
    expect(useTranslations('fr')('nav.about')).toBe('À propos');
  });
  it('falls back to the default lang (FR) when a key is missing in EN', () => {
    expect(useTranslations('en')('site.tagline')).toBe('Ce que je pense. Ce que j’apprends.');
  });
});

describe('getLangFromUrl', () => {
  it('detects "en" from an /en/ path', () => {
    expect(getLangFromUrl(new URL('http://x/en/about'))).toBe('en');
  });
  it('defaults to "fr" for an unprefixed path', () => {
    expect(getLangFromUrl(new URL('http://x/about'))).toBe('fr');
  });
});
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `pnpm --filter @johan-chan/site test:unit`
Expected: FAIL — `utils.ts` does not exist / `getLangFromUrl` is not defined.

- [ ] **Step 5: Implement `apps/site/src/i18n/utils.ts`**

```ts
import { ui, defaultLang, type Lang, type UIKey } from './ui';

export function getLangFromUrl(url: URL): Lang {
  const [, seg] = url.pathname.split('/');
  if (seg in ui) return seg as Lang;
  return defaultLang;
}

export function useTranslations(lang: Lang) {
  return function t(key: UIKey): string {
    return (ui[lang] as Record<string, string>)[key] ?? ui[defaultLang][key];
  };
}
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `pnpm --filter @johan-chan/site test:unit`
Expected: PASS — 4 tests green.

- [ ] **Step 7: Commit**

```bash
git add apps/site/vitest.config.ts apps/site/src/i18n/ui.ts apps/site/src/i18n/utils.ts apps/site/tests/i18n.test.ts
git commit -m "feat(site): native i18n dictionary + useTranslations (TDD)"
```

---

## Task 4: Base layout + vanilla theme toggle

**Files:**
- Create: `apps/site/src/components/ThemeToggle.astro`
- Create: `apps/site/src/layouts/Base.astro`

- [ ] **Step 1: Create `apps/site/src/components/ThemeToggle.astro`**

```astro
<button type="button" class="btn btn-sm btn-ghost" data-testid="theme-toggle" aria-label="Basculer le thème">
  🌓
</button>
<script>
  const LIGHT = 'autumn';
  const DARK = 'abyss';
  const btn = document.querySelector('[data-testid="theme-toggle"]');
  btn?.addEventListener('click', () => {
    const root = document.documentElement;
    const next = root.dataset.theme === DARK ? LIGHT : DARK;
    root.dataset.theme = next;
    localStorage.setItem('theme', next);
  });
</script>
```

- [ ] **Step 2: Create `apps/site/src/layouts/Base.astro`**

```astro
---
import '../styles/global.css';
interface Props { lang?: 'fr' | 'en'; title?: string }
const { lang = 'fr', title = 'johan-chan' } = Astro.props;
---
<html lang={lang}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <script is:inline>
      // Set theme before paint to avoid FOUC.
      const saved = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.dataset.theme = saved ?? (prefersDark ? 'abyss' : 'autumn');
    </script>
  </head>
  <body class="bg-base-100 text-base-content min-h-screen">
    <slot />
  </body>
</html>
```

- [ ] **Step 3: Verify build passes**

Run: `pnpm --filter @johan-chan/site build`
Expected: build completes with no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/site/src/components/ThemeToggle.astro apps/site/src/layouts/Base.astro
git commit -m "feat(site): Base layout + vanilla theme toggle (no framework)"
```

---

## Task 5: Locale pages (FR `/` + EN `/en/`)

**Files:**
- Modify: `apps/site/src/pages/index.astro`
- Create: `apps/site/src/pages/en/index.astro`

- [ ] **Step 1: Rewrite `apps/site/src/pages/index.astro` to use Base + i18n**

```astro
---
import Base from '../layouts/Base.astro';
import ThemeToggle from '../components/ThemeToggle.astro';
import { getLangFromUrl, useTranslations } from '../i18n/utils';
const lang = getLangFromUrl(Astro.url);
const t = useTranslations(lang);
---
<Base lang={lang}>
  <main class="mx-auto max-w-4xl p-8">
    <nav class="flex justify-between items-center mb-8">
      <a href="/about" class="link" data-testid="nav-about">{t('nav.about')}</a>
      <ThemeToggle />
    </nav>
    <h1 class="text-primary text-4xl font-bold" data-testid="tagline">{t('site.tagline')}</h1>
  </main>
</Base>
```

- [ ] **Step 2: Create `apps/site/src/pages/en/index.astro`**

```astro
---
import Base from '../../layouts/Base.astro';
import ThemeToggle from '../../components/ThemeToggle.astro';
import { getLangFromUrl, useTranslations } from '../../i18n/utils';
const lang = getLangFromUrl(Astro.url);
const t = useTranslations(lang);
---
<Base lang={lang}>
  <main class="mx-auto max-w-4xl p-8">
    <nav class="flex justify-between items-center mb-8">
      <a href="/en/about" class="link" data-testid="nav-about">{t('nav.about')}</a>
      <ThemeToggle />
    </nav>
    <h1 class="text-primary text-4xl font-bold" data-testid="tagline">{t('site.tagline')}</h1>
  </main>
</Base>
```

- [ ] **Step 3: Verify both routes build**

Run: `pnpm --filter @johan-chan/site build`
Expected: build emits `dist/index.html` (lang="fr", "À propos") and `dist/en/index.html` (lang="en", "About"). The EN tagline falls back to FR (only key not yet translated).

- [ ] **Step 4: Commit**

```bash
git add apps/site/src/pages/index.astro apps/site/src/pages/en/index.astro
git commit -m "feat(site): FR / and EN /en/ locale pages"
```

---

## Task 6: MDX pipeline proof (Callout + demo page)

**Files:**
- Create: `apps/site/src/components/Callout.astro`
- Create: `apps/site/src/pages/demo.mdx`

- [ ] **Step 1: Create `apps/site/src/components/Callout.astro`**

```astro
---
interface Props { title?: string }
const { title } = Astro.props;
---
<aside class="alert bg-base-200 border-l-4 border-primary my-4 block" data-testid="callout">
  {title && <p class="font-bold mb-1">{title}</p>}
  <slot />
</aside>
```

- [ ] **Step 2: Create `apps/site/src/pages/demo.mdx`**

```mdx
---
---
import Base from '../layouts/Base.astro';
import Callout from '../components/Callout.astro';

<Base lang="fr" title="Démo MDX">
  <main class="mx-auto max-w-4xl p-8 prose">
    # Démo MDX

    Cette page prouve le pipeline contenu-avec-composant.

    <Callout title="Info">
      Rendu par un composant `.astro` statique dans du MDX.
    </Callout>
  </main>
</Base>
```

- [ ] **Step 3: Verify the MDX page builds**

Run: `pnpm --filter @johan-chan/site build`
Expected: build emits `dist/demo/index.html` containing the Callout markup (`data-testid="callout"`) and the heading "Démo MDX".

- [ ] **Step 4: Commit**

```bash
git add apps/site/src/components/Callout.astro apps/site/src/pages/demo.mdx
git commit -m "feat(site): prove MDX + static .astro component pipeline"
```

---

## Task 7: Playwright smoke (render + theme persistence)

**Files:**
- Create: `apps/site/playwright.config.ts`
- Test: `apps/site/tests/smoke.spec.ts`

- [ ] **Step 1: Create `apps/site/playwright.config.ts`**

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  use: { baseURL: 'http://localhost:4321' },
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
```

- [ ] **Step 2: Write the smoke test `apps/site/tests/smoke.spec.ts`**

```ts
import { test, expect } from '@playwright/test';

test('FR home renders with French tagline and lang=fr', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.getByTestId('nav-about')).toHaveText('À propos');
});

test('EN home renders at /en/ with lang=en', async ({ page }) => {
  await page.goto('/en/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByTestId('nav-about')).toHaveText('About');
});

test('theme toggle switches and persists across reload', async ({ page }) => {
  await page.goto('/');
  const html = page.locator('html');
  const before = await html.getAttribute('data-theme');
  await page.getByTestId('theme-toggle').click();
  const after = await html.getAttribute('data-theme');
  expect(after).not.toBe(before);
  await page.reload();
  await expect(html).toHaveAttribute('data-theme', after!);
});
```

- [ ] **Step 3: Install the Playwright browser (first run only)**

Run: `pnpm --filter @johan-chan/site exec playwright install chromium`
Expected: chromium downloaded.

- [ ] **Step 4: Run the smoke suite**

Run: `pnpm --filter @johan-chan/site test:e2e`
Expected: 3 tests PASS (dev server auto-started by Playwright).

- [ ] **Step 5: Commit**

```bash
git add apps/site/playwright.config.ts apps/site/tests/smoke.spec.ts
git commit -m "test(site): Playwright smoke — render + theme persistence"
```

---

## Task 8: Final verification (Definition of Done)

**Files:** none (verification only)

- [ ] **Step 1: Type-check the app**

Run: `pnpm --filter @johan-chan/site check`
Expected: `astro check` reports 0 errors.

- [ ] **Step 2: Full build + unit + e2e**

Run: `pnpm --filter @johan-chan/site build && pnpm --filter @johan-chan/site test:unit && pnpm --filter @johan-chan/site test:e2e`
Expected: build OK; 4 unit tests pass; 3 smoke tests pass.

- [ ] **Step 3: Confirm `apps/web` is untouched**

Run: `git status --short apps/web`
Expected: only the pre-existing local dev-proxy diff (`apps/web/package.json`, `apps/web/vite.config.ts`) — nothing new from this work.

- [ ] **Step 4: DoD checklist (all must be true)**

- `pnpm --filter @johan-chan/site dev` and `build` pass locally.
- `/` (FR) and `/en/` render, `<html lang>` correct per locale.
- A string comes from `ui.ts` via `useTranslations`.
- Theme toggle autumn↔abyss works and persists (vanilla).
- `demo.mdx` renders integrating `Callout.astro`.
- Vitest (4) + Playwright (3) green; `apps/web` untouched.

---

## Self-Review (author check)

- **Spec coverage:** scaffold (T1) · Tailwind/DaisyUI (T2) · native i18n dict+helpers (T3) · vanilla theme toggle + Base shell (T4) · FR/EN routing (T5) · MDX+Callout (T6) · Vitest+Playwright (T3/T7) · local-only, no Svelte/Paraglide/Vercel (throughout). Every DoD item maps to a task. ✓
- **Vanilla-first principle:** honored — only `<script>` for the toggle; no `@astrojs/svelte`. ✓
- **Type consistency:** `Lang`, `UIKey`, `getLangFromUrl`, `useTranslations`, `ui`, `defaultLang` used identically across `ui.ts`/`utils.ts`/tests/pages. `data-testid` values (`theme-toggle`, `nav-about`, `tagline`, `callout`) consistent between components and smoke tests. ✓
- **Deferred (not in any task, by design):** content collections / registre-fil schema, EN translations, image pipeline, nav/home/SEO/sitemap, Vercel. ✓
