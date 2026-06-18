# Astro `/call` Booking Page — Design

**Date:** 2026-06-18
**Status:** Approved (approach), pending spec review

## Goal

Port the unlisted booking page from the legacy SvelteKit app (`apps/web`) to the
new Astro app (`apps/site`), rebuilt in the Atelier design language, in both
French (`/call`) and English (`/en/call`). The page embeds the self-hosted
Cal.com inline scheduler, theme-synced to the site.

## Context

- **Old page:** `apps/web/src/routes/call/+page.svelte` + `cal-embed.ts`. Mounts
  a self-hosted Cal.com inline embed in `onMount`; maps the daisyUI theme
  (`abyss`/`autumn`) to Cal `dark`/`light` and re-themes on toggle. FR-only,
  `noindex, nofollow`, not in nav.
- **Cal instance (unchanged):** origin `https://cal.lagraineducraft.fr`,
  calLink `johan.chan/30min`, namespace `30min`, layout `week_view`,
  `useSlotsViewOnSmallScreen: false`. Verified reachable (embed.js → 200,
  event link → 200).
- **apps/site conventions:**
  - Pages use `PageLayout` (props: `lang`, `current`, `title`, `description`,
    `ogImage`, `width`, `hasTranslation`, `canonical`) → `Base.astro`.
  - i18n: `copy[lang]` typed object in `src/lib/copy.ts`; FR at root, EN mirrored
    under `src/pages/en/`.
  - Theme: `document.documentElement.dataset.theme` is `atelier-dark` |
    `atelier-light`, persisted to `localStorage`. `Base.astro` applies it inline
    pre-paint and re-applies on `astro:after-swap`. `ThemeToggle.astro` flips it
    on click.
  - View transitions: `ClientRouter` is active, so client scripts run on
    `astro:page-load` and must be idempotent across SPA navigations (pattern set
    by `ThemeToggle.astro`).
  - No sitemap integration and no `robots.txt` exist in `apps/site`, so the
    `noindex` meta tag is the only exclusion mechanism needed.
  - `Base.astro` currently emits **no** `robots` meta.

## Approach (selected: A)

A reusable `CalEmbed.astro` component that contains the embed container and a
bundled Astro `<script>`. The script runs the Cal.com loader, reads the current
theme from `dataset.theme`, mounts the inline embed, re-themes live on toggle,
and is idempotent across view transitions. No framework runtime; consistent with
the static-first Atelier ethos and the existing `ThemeToggle.astro` pattern.

Rejected: a Svelte/React island (ships a framework runtime for one widget,
hydration complexity) and a raw inline snippet (no theme sync, duplicated per
page, fragile with view transitions).

## File structure

### `apps/site/src/components/CalEmbed.astro` (new)

- **Responsibility:** own the Cal.com inline embed lifecycle and theme sync.
- **Props:** `calLink: string`, `origin: string`, `namespace?: string`
  (default `'30min'`).
- **Markup:** `<div id="cal-inline" class="<Atelier surface classes>"
  data-cal-origin={origin} data-cal-link={calLink} data-cal-namespace={namespace}></div>`.
  Passing config via `data-*` keeps the bundled module script free of
  per-page interpolation.
- **Script (bundled Astro `<script>`):**
  - `mapTheme()`: `documentElement.dataset.theme === 'atelier-dark' ? 'dark' : 'light'`.
  - Vendor Cal loader IIFE (structurally verbatim from the old `cal-embed.ts`),
    creating `window.Cal` as a replaying queue and injecting
    `${origin}/embed/embed.js`.
  - `mount()`: read `data-*` from `#cal-inline`; if no `#cal-inline` present or
    it is already initialized (guard flag on the element, e.g.
    `el.dataset.calMounted`), return. Otherwise call
    `Cal('init', namespace, { origin })`,
    `Cal.ns[namespace]('inline', { elementOrSelector: '#cal-inline', config: { layout: 'week_view', useSlotsViewOnSmallScreen: false, theme }, calLink })`,
    `Cal.ns[namespace]('ui', { theme, hideEventTypeDetails: false, layout: 'week_view' })`,
    then set the guard flag.
  - `retheme()`: if initialized, call
    `Cal.ns[namespace]('ui', { theme, hideEventTypeDetails: false, layout: 'week_view' })`.
  - Wire-up: run `mount()` on `astro:page-load`; observe theme changes with a
    `MutationObserver` on `document.documentElement` (`attributeFilter:
    ['data-theme']`) calling `retheme()`. Register the observer once
    (guard on `window`), mirroring the `__atlThemeHook` pattern in `Base.astro`.

### `apps/site/src/pages/call.astro` (new, FR)

```astro
---
import PageLayout from '../layouts/PageLayout.astro';
import CalEmbed from '../components/CalEmbed.astro';
import { copy } from '../lib/copy';
import type { Lang } from '../i18n/ui';
const lang: Lang = 'fr';
const C = copy[lang]; const K = C.call;
---
<PageLayout lang={lang} current="about" title={`${K.kicker} — ${C.name}`} noindex hasTranslation>
  <section class="pt-10 md:pt-[60px]">
    <h1 class="atl-lede m-0 max-w-[820px] text-ink">{K.lede}</h1>
    <p class="atl-body mt-4 max-w-[820px] text-ink2 md:mt-[22px] md:text-[18px]" style="line-height:1.6">{K.intro}</p>
  </section>
  <section class="mt-8 md:mt-10">
    <CalEmbed calLink="johan.chan/30min" origin="https://cal.lagraineducraft.fr" />
  </section>
</PageLayout>
```

- `current="about"` is a neutral existing value (the page is not in nav, so the
  active-nav highlight is irrelevant; this avoids widening the `current` union).

### `apps/site/src/pages/en/call.astro` (new, EN)

Identical structure, `lang = 'en'`, importing from `../../`.

### `apps/site/src/lib/copy.ts` (modify)

- Add to the `Copy` interface: `call: { kicker: string; lede: string; intro: string };`
- Add FR and EN `call` entries. Copy is authored directly in this spec/PR (not
  via a subagent) using typographic apostrophes (U+2019 `’`):
  - **FR:** `kicker: 'Réserver un appel'`,
    `lede: 'Réservons un moment.'`,
    `intro: 'Choisissez le créneau qui vous convient pour notre échange de 30 minutes.'`
  - **EN:** `kicker: 'Book a call'`,
    `lede: 'Let’s find a moment.'`,
    `intro: 'Pick the slot that works for you for our 30-minute conversation.'`

### `apps/site/src/layouts/PageLayout.astro` (modify)

- Add optional prop `noindex?: boolean` (default `false`); pass through to `Base`.

### `apps/site/src/layouts/Base.astro` (modify)

- Add optional prop `noindex?: boolean` (default `false`).
- When true, emit `<meta name="robots" content="noindex, nofollow" />` in `<head>`.

## Behavior

- Faithful to the old page with light polish: same Cal instance/event, week
  view, theme-synced (`atelier-dark`→`dark`, `atelier-light`→`light`), re-themes
  live on toggle.
- Unlisted: `noindex, nofollow`, not added to the header nav.
- Bilingual: `/call` (FR) and `/en/call` (EN); `hasTranslation` enables the lang
  switch between them.

## Error handling / edge cases

- **Cal instance unreachable:** the embed shows Cal's own loading/empty state;
  no app-level crash. The page (heading, layout, nav) renders regardless because
  the embed is isolated in its container.
- **View transitions:** `mount()` is guarded by a per-element flag so SPA
  navigation back to `/call` does not double-initialize; the `MutationObserver`
  is registered once via a `window` guard.
- **No JS:** the embed container renders empty (graceful — same as the old
  client-mounted behavior); the rest of the page is static.

## Testing / verification

- `pnpm --filter @johan-chan/site build` succeeds; `/call` and `/en/call` are
  emitted.
- Built HTML for both pages contains `<meta name="robots" content="noindex, nofollow">`.
- Serve the build and load both pages in a browser:
  - the Cal inline embed mounts (iframe present in `#cal-inline`);
  - toggling the theme re-themes the embed without reload;
  - navigating away and back (view transition) does not duplicate the embed.
- French copy retains typographic apostrophes (`’`) in the built output.

## Out of scope

- Cutting production DNS over to Vercel (separate decision/task).
- Adding a sitemap to `apps/site`.
- Any change to the legacy `apps/web` `/call` page (handled by PR #21 fix).
