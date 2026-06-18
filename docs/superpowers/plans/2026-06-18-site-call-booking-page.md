# Astro `/call` Booking Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the unlisted Cal.com booking page to `apps/site` (Astro) as `/call` (FR) and `/en/call` (EN), rebuilt in the Atelier design language and theme-synced.

**Architecture:** A reusable `CalEmbed.astro` component owns the embed: a bundled `<script>` reads `document.documentElement.dataset.theme`, mounts the self-hosted Cal inline embed, re-themes live via a `MutationObserver`, and is idempotent across view transitions (mirrors `ThemeToggle.astro` / the `__atlThemeHook` pattern in `Base.astro`). Two thin page files supply copy and wrap the component in `PageLayout`. A new `noindex` prop threaded `PageLayout`→`Base` emits the robots meta.

**Tech Stack:** Astro 6, Tailwind (Atelier tokens), TypeScript, Cal.com self-hosted embed (`cal.lagraineducraft.fr`), Vitest (unit), Playwright (e2e against a built preview on :4399).

**Spec:** `docs/superpowers/specs/2026-06-18-astro-call-booking-page-design.md`

**Conventions for every task:**
- All commands run from `apps/site/` unless noted. Use `pnpm` only.
- Do **not** stage the dev-proxy local-only files (`apps/web/package.json`, `apps/web/vite.config.ts`, `pnpm-lock.yaml`, `turbo.json`) — `git add` only the exact paths listed.
- French copy uses typographic apostrophes `’` (U+2019), authored directly here (never via a subagent).

---

### Task 1: Add `call` copy (FR + EN)

**Files:**
- Modify: `apps/site/src/lib/copy.ts`
- Test: `apps/site/tests/copy.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `apps/site/tests/copy.test.ts`:

```ts
import { copy } from '../src/lib/copy';

describe('call (booking) copy', () => {
  it('FR booking copy', () => {
    expect(copy.fr.call.kicker).toBe('Réserver un appel');
    expect(copy.fr.call.lede).toBe('Réservons un moment.');
    expect(copy.fr.call.intro).toBe(
      'Choisissez le créneau qui vous convient pour notre échange de 30 minutes.'
    );
  });
  it('EN booking copy keeps a typographic apostrophe', () => {
    expect(copy.en.call.kicker).toBe('Book a call');
    expect(copy.en.call.lede).toBe('Let’s find a moment.');
    expect(copy.en.call.lede).toContain('’'); // U+2019, not a straight quote
    expect(copy.en.call.intro).toBe(
      'Pick the slot that works for you for our 30-minute conversation.'
    );
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run tests/copy.test.ts`
Expected: FAIL — TypeScript/`call` is undefined (`Property 'call' does not exist on type 'Copy'` and/or `Cannot read properties of undefined`).

- [ ] **Step 3: Add `call` to the `Copy` interface**

In `apps/site/src/lib/copy.ts`, inside the `export interface Copy { … }` block, add the field immediately after the `about: { … };` member:

```ts
  call: { kicker: string; lede: string; intro: string };
```

- [ ] **Step 4: Add the FR `call` entry**

In `copy.fr` (the `fr:` object of `export const copy`), add immediately after the `about: { … },` block:

```ts
    call: {
      kicker: 'Réserver un appel',
      lede: 'Réservons un moment.',
      intro: 'Choisissez le créneau qui vous convient pour notre échange de 30 minutes.',
    },
```

- [ ] **Step 5: Add the EN `call` entry**

In `copy.en` (the `en:` object), add immediately after its `about: { … },` block:

```ts
    call: {
      kicker: 'Book a call',
      lede: 'Let’s find a moment.',
      intro: 'Pick the slot that works for you for our 30-minute conversation.',
    },
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `pnpm exec vitest run tests/copy.test.ts`
Expected: PASS (both new `it` blocks green).

- [ ] **Step 7: Verify the apostrophe is the real codepoint**

Run: `node -e "const {copy}=require('./src/lib/copy.ts')" 2>/dev/null; grep -n "Let’s find a moment" src/lib/copy.ts`
Expected: the grep prints the line — confirms `’` (U+2019) is present verbatim, not flattened to `'`.

- [ ] **Step 8: Commit**

```bash
git add apps/site/src/lib/copy.ts apps/site/tests/copy.test.ts
git commit -m "feat(site): add FR/EN booking-page copy"
```

---

### Task 2: Create the `CalEmbed.astro` component

**Files:**
- Create: `apps/site/src/components/CalEmbed.astro`

(Runtime behavior is verified end-to-end by Task 3's e2e — this task creates the unit and type-checks it.)

- [ ] **Step 1: Create the component**

Create `apps/site/src/components/CalEmbed.astro`:

```astro
---
interface Props {
  /** Cal event link, e.g. "johan.chan/30min" */
  calLink: string;
  /** Self-hosted Cal origin, e.g. "https://cal.lagraineducraft.fr" */
  origin: string;
  /** Embed namespace (one per event type) */
  namespace?: string;
}
const { calLink, origin, namespace = '30min' } = Astro.props;
---

<div
  id="cal-inline"
  data-testid="cal-inline"
  data-cal-link={calLink}
  data-cal-origin={origin}
  data-cal-namespace={namespace}
  class="min-h-[600px] w-full overflow-hidden rounded-[14px] border border-line bg-surf"
>
</div>

<script>
  // Map the Atelier theme to Cal's light/dark.
  function calTheme(): 'dark' | 'light' {
    return document.documentElement.dataset.theme === 'atelier-dark' ? 'dark' : 'light';
  }

  // Cal.com official loader (structurally verbatim): creates window.Cal as a
  // replaying queue and injects embed.js, so calls made before it loads are replayed.
  function loadCal(origin: string) {
    /* eslint-disable */
    (function (C: any, A: string, L: string) {
      const p = (a: any, ar: any) => { a.q.push(ar); };
      const d = C.document;
      C.Cal = C.Cal || function () {
        const cal = C.Cal; const ar = arguments;
        if (!cal.loaded) {
          cal.ns = {}; cal.q = cal.q || [];
          d.head.appendChild(d.createElement('script')).src = A;
          cal.loaded = true;
        }
        if (ar[0] === L) {
          const api: any = function () { p(api, arguments); };
          const ns = ar[1];
          api.q = api.q || [];
          if (typeof ns === 'string') {
            cal.ns[ns] = cal.ns[ns] || api;
            p(cal.ns[ns], ar);
            p(cal, ['initNamespace', ns]);
          } else { p(cal, ar); }
          return;
        }
        p(cal, ar);
      };
    })(window, `${origin}/embed/embed.js`, 'init');
    /* eslint-enable */
  }

  function mountCal() {
    const el = document.getElementById('cal-inline');
    if (!el || el.dataset.calMounted === 'true') return; // idempotent per DOM instance
    const origin = el.dataset.calOrigin!;
    const calLink = el.dataset.calLink!;
    const namespace = el.dataset.calNamespace || '30min';
    const theme = calTheme();
    el.dataset.calTheme = theme; // deterministic record of the theme handed to Cal

    loadCal(origin);
    const Cal = (window as any).Cal;
    Cal('init', namespace, { origin });
    Cal.ns[namespace]('inline', {
      elementOrSelector: '#cal-inline',
      config: { layout: 'week_view', useSlotsViewOnSmallScreen: false, theme },
      calLink,
    });
    Cal.ns[namespace]('ui', { theme, hideEventTypeDetails: false, layout: 'week_view' });
    el.dataset.calMounted = 'true';
  }

  function rethemeCal() {
    const el = document.getElementById('cal-inline');
    const Cal = (window as any).Cal;
    if (!el || el.dataset.calMounted !== 'true' || !Cal) return;
    const namespace = el.dataset.calNamespace || '30min';
    const theme = calTheme();
    el.dataset.calTheme = theme;
    Cal.ns[namespace]?.('ui', { theme, hideEventTypeDetails: false, layout: 'week_view' });
  }

  // Runs on initial load and after every view-transition swap.
  document.addEventListener('astro:page-load', mountCal);

  // Re-theme the embed live when the visitor toggles the site theme. Register once.
  if (!(window as any).__calThemeHook) {
    (window as any).__calThemeHook = true;
    new MutationObserver(rethemeCal).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
  }
</script>
```

- [ ] **Step 2: Type-check the component**

Run: `pnpm exec astro check`
Expected: PASS — `0 errors` (warnings about other files unrelated to this change are acceptable; there must be no error referencing `CalEmbed.astro`).

- [ ] **Step 3: Commit**

```bash
git add apps/site/src/components/CalEmbed.astro
git commit -m "feat(site): add CalEmbed component (themed, view-transition safe)"
```

---

### Task 3: `noindex` plumbing + FR `/call` page (with e2e)

**Files:**
- Modify: `apps/site/src/layouts/Base.astro`
- Modify: `apps/site/src/layouts/PageLayout.astro`
- Create: `apps/site/src/pages/call.astro`
- Test: `apps/site/tests/call.spec.ts`

- [ ] **Step 1: Write the failing e2e test**

Create `apps/site/tests/call.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('FR /call renders heading + embed container and is noindex', async ({ page }) => {
  await page.goto('/call');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Réservons un moment');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  await expect(page.getByTestId('cal-inline')).toBeVisible();
});

test('FR /call initializes the Cal embed and reflects + re-themes', async ({ page }) => {
  await page.goto('/call');
  const el = page.getByTestId('cal-inline');
  // loader + init run synchronously on astro:page-load — no external dependency
  await expect(el).toHaveAttribute('data-cal-mounted', 'true');
  await expect.poll(() => page.evaluate(() => typeof (window as any).Cal)).toBe('function');
  const before = await el.getAttribute('data-cal-theme');
  expect(['dark', 'light']).toContain(before);
  await page.getByTestId('theme-toggle').click();
  const after = await el.getAttribute('data-cal-theme');
  expect(after).not.toBe(before);
});

test('FR /call mounts the Cal iframe (needs cal.lagraineducraft.fr reachable)', async ({ page }) => {
  await page.goto('/call');
  await expect(page.locator('[data-testid="cal-inline"] iframe')).toBeVisible({ timeout: 20_000 });
});

test('FR /call language switch points to /en/call', async ({ page }) => {
  await page.goto('/call');
  await expect(page.getByTestId('lang-switch')).toHaveAttribute('href', /\/en\/call\/?$/);
});

test('FR /call survives a view transition without duplicating', async ({ page }) => {
  await page.goto('/call');
  await expect(page.getByTestId('cal-inline')).toHaveAttribute('data-cal-mounted', 'true');
  await page.getByTestId('logo').click(); // client-side swap to home
  await expect(page).toHaveURL(/\/$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/call\/?$/);
  await expect(page.getByTestId('cal-inline')).toHaveCount(1);
  await expect(page.getByTestId('cal-inline')).toHaveAttribute('data-cal-mounted', 'true');
});
```

- [ ] **Step 2: Run the e2e to verify it fails**

Run: `pnpm exec playwright test tests/call.spec.ts`
Expected: FAIL — `/call` 404s (no heading / no `cal-inline`). (The webServer builds the site first; this takes ~30–60s.)

- [ ] **Step 3: Add the `noindex` prop to `Base.astro`**

In `apps/site/src/layouts/Base.astro`, change the `Props` interface and destructure to add `noindex`:

```astro
interface Props { lang?: Lang; title?: string; description?: string; ogImage?: string; canonical?: string; noindex?: boolean }
const { lang = 'fr', title = 'Johan Chan', description, ogImage, canonical, noindex = false } = Astro.props;
```

Then add this line in `<head>`, immediately after the `<title>{title}</title>` line:

```astro
    {noindex && <meta name="robots" content="noindex, nofollow" />}
```

- [ ] **Step 4: Thread `noindex` through `PageLayout.astro`**

In `apps/site/src/layouts/PageLayout.astro`, add `noindex` to `Props` and destructure, then pass it to `<Base>`:

```astro
interface Props {
  lang: Lang;
  current: 'home' | 'work' | 'journal' | 'about';
  title?: string;
  description?: string;
  ogImage?: string;
  width?: 'wide' | 'reading';
  hasTranslation?: boolean;
  canonical?: string;
  noindex?: boolean;
}
const { lang, current, title, description, ogImage, width = 'wide', hasTranslation = true, canonical, noindex = false } = Astro.props;
```

And update the `<Base …>` opening tag to forward it:

```astro
<Base lang={lang} title={title} description={description} ogImage={ogImage} canonical={canonical} noindex={noindex}>
```

- [ ] **Step 5: Create the FR page**

Create `apps/site/src/pages/call.astro`:

```astro
---
import PageLayout from '../layouts/PageLayout.astro';
import CalEmbed from '../components/CalEmbed.astro';
import { copy } from '../lib/copy';
import type { Lang } from '../i18n/ui';
const lang: Lang = 'fr';
const C = copy[lang]; const K = C.call;
---
<PageLayout lang={lang} current="home" title={`${K.kicker} — ${C.name}`} noindex hasTranslation>
  <section class="pt-10 md:pt-[60px]">
    <h1 class="atl-lede m-0 max-w-[820px] text-ink">{K.lede}</h1>
    <p class="atl-body mt-4 max-w-[820px] text-ink2 md:mt-[22px] md:text-[18px]" style="line-height:1.6">{K.intro}</p>
  </section>
  <section class="mt-8 md:mt-10">
    <CalEmbed calLink="johan.chan/30min" origin="https://cal.lagraineducraft.fr" />
  </section>
</PageLayout>
```

(`current="home"` is a valid union value that is not in the header nav list, so no nav item is highlighted — correct for an unlisted page, and avoids widening the `current` type.)

- [ ] **Step 6: Run the e2e to verify it passes**

Run: `pnpm exec playwright test tests/call.spec.ts`
Expected: PASS — all five FR tests green. (The iframe test requires `cal.lagraineducraft.fr` reachable; verified up.)

- [ ] **Step 7: Commit**

```bash
git add apps/site/src/layouts/Base.astro apps/site/src/layouts/PageLayout.astro apps/site/src/pages/call.astro apps/site/tests/call.spec.ts
git commit -m "feat(site): FR /call booking page + noindex layout prop"
```

---

### Task 4: EN `/en/call` page (with e2e)

**Files:**
- Create: `apps/site/src/pages/en/call.astro`
- Test: `apps/site/tests/call.spec.ts` (append)

- [ ] **Step 1: Write the failing e2e test**

Append to `apps/site/tests/call.spec.ts`:

```ts
test('EN /en/call renders English heading, embed, and is noindex', async ({ page }) => {
  await page.goto('/en/call');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('find a moment');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  await expect(page.getByTestId('cal-inline')).toHaveAttribute('data-cal-mounted', 'true');
});

test('EN /en/call language switch points back to /call', async ({ page }) => {
  await page.goto('/en/call');
  await expect(page.getByTestId('lang-switch')).toHaveAttribute('href', /^\/call\/?$/);
});
```

- [ ] **Step 2: Run the e2e to verify the new tests fail**

Run: `pnpm exec playwright test tests/call.spec.ts -g "EN /en/call"`
Expected: FAIL — `/en/call` 404s (no heading / no `cal-inline`).

- [ ] **Step 3: Create the EN page**

Create `apps/site/src/pages/en/call.astro`:

```astro
---
import PageLayout from '../../layouts/PageLayout.astro';
import CalEmbed from '../../components/CalEmbed.astro';
import { copy } from '../../lib/copy';
import type { Lang } from '../../i18n/ui';
const lang: Lang = 'en';
const C = copy[lang]; const K = C.call;
---
<PageLayout lang={lang} current="home" title={`${K.kicker} — ${C.name}`} noindex hasTranslation>
  <section class="pt-10 md:pt-[60px]">
    <h1 class="atl-lede m-0 max-w-[820px] text-ink">{K.lede}</h1>
    <p class="atl-body mt-4 max-w-[820px] text-ink2 md:mt-[22px] md:text-[18px]" style="line-height:1.6">{K.intro}</p>
  </section>
  <section class="mt-8 md:mt-10">
    <CalEmbed calLink="johan.chan/30min" origin="https://cal.lagraineducraft.fr" />
  </section>
</PageLayout>
```

- [ ] **Step 4: Run the full call e2e to verify it passes**

Run: `pnpm exec playwright test tests/call.spec.ts`
Expected: PASS — all seven tests (five FR + two EN) green.

- [ ] **Step 5: Commit**

```bash
git add apps/site/src/pages/en/call.astro apps/site/tests/call.spec.ts
git commit -m "feat(site): EN /en/call booking page"
```

---

### Task 5: Full-suite regression + type check

**Files:** none (verification only)

- [ ] **Step 1: Type-check the whole site**

Run: `pnpm --filter @johan-chan/site check`
Expected: PASS (no new errors from the call page, component, copy, or layout changes).

- [ ] **Step 2: Run the full e2e suite (no regressions)**

Run: `pnpm --filter @johan-chan/site test:e2e`
Expected: PASS — the new call tests plus the existing `smoke.spec.ts` suite all green.

- [ ] **Step 3: Run the unit suite**

Run: `pnpm --filter @johan-chan/site test:unit`
Expected: PASS — including the new `call` copy assertions.

---

## Self-Review

**Spec coverage:**
- `CalEmbed.astro` component (Approach A) → Task 2. ✓
- FR `/call` + EN `/en/call` pages → Tasks 3, 4. ✓
- `call` copy in `Copy` type + FR/EN → Task 1. ✓
- `noindex` prop `PageLayout`→`Base` emitting robots meta → Task 3 (steps 3–4). ✓
- Theme map `atelier-dark`→`dark`/`atelier-light`→`light` + live re-theme → Task 2 (`calTheme`/`rethemeCal`), asserted in Task 3 (step 1, `data-cal-theme`). ✓
- View-transition idempotency → Task 2 (guard + `astro:page-load`), asserted in Task 3 (step 1, view-transition test). ✓
- Cal instance values unchanged (`cal.lagraineducraft.fr`, `johan.chan/30min`, week view) → Tasks 3, 4. ✓
- Bilingual lang switch → Tasks 3, 4 (lang-switch tests; `getSiblingLocalePath` handles `/call`↔`/en/call` with no extra code). ✓
- Verification: build, browser embed mount, theme re-theme, noindex present → Tasks 3–5. ✓
- Out of scope (Vercel cutover, sitemap) → untouched. ✓

**Placeholder scan:** none — every code/command step is concrete.

**Type/name consistency:** `Copy.call.{kicker,lede,intro}` defined in Task 1 and consumed identically in Tasks 3/4. `data-cal-*` attribute names (`calLink`/`calOrigin`/`calNamespace`/`calMounted`/`calTheme`) are consistent between the component (Task 2) and the tests (Tasks 3/4). `noindex` prop name consistent across Base/PageLayout/pages. `current="home"` used in both pages.

**Plan-time refinement vs spec:** the spec tentatively used `current="about"`; the plan uses `current="home"` so no nav item is highlighted on the unlisted page (cleaner, no type change). The spec's "exclude from sitemap" step is dropped — `apps/site` has no sitemap.
