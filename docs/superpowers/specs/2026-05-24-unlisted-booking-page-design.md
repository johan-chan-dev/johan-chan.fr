# Unlisted Booking Page (`/call`) — Design

**Date:** 2026-05-24
**Status:** Approved (pending spec review)

## Goal

An unlisted page on johan-chan.fr where a recipient can book a 30-minute call.
Johan hands out the URL directly; the page is prerendered like the rest of the
site but is not linked, not in the sitemap, and not indexed.

Scheduling (availability, slot reservation, confirmation emails) is delegated to
Johan's **self-hosted Cal instance** at `https://cal.lagraineducraft.fr`. The page
is a branded shell around the Cal inline embed.

## Constraints

- Site is fully static (`adapter-static`, `prerender = true`, GitHub Pages). No
  runtime server — all booking logic lives in the self-hosted Cal instance.
- "Minimal dependencies" is a project value: do **not** add the
  `@calcom/embed-snippet` npm package. Reuse Cal's dependency-free loader IIFE.

## Route

- New route folder: `apps/web/src/routes/call/`
  - `+page.ts` → `export const prerender = true;`
  - `+page.svelte` → page shell + Cal embed + `<SEO noindex />`
- Available at `/call` and `/en/call` automatically via Paraglide reroute. No
  extra config.

## "Unlisted" — all reuse, no new plumbing

- **noindex:** render `<SEO noindex />`. `SEO.svelte` already emits
  `<meta name="robots" content="noindex, nofollow">` when `noindex={true}`
  (same as `+error.svelte`).
- **Sitemap:** `sitemap.xml/+server.ts` uses an explicit allowlist of static
  routes plus enumerated content. `/call` is not in either list, so it is
  excluded automatically — no code change needed.
- **Unlinked:** the route is not added to nav, footer, or feed. Distribution is
  by handing out the URL.

Out of scope (deliberately): secret-key gate, per-person links, custom slot UI.

## Cal embed

Use the **inline embed** from Johan's working snippet
(`.old/inline.cal.html`), adapted to Svelte:

- **Port the loader IIFE + init calls into `onMount`.** The embed is
  client-only; prerender emits just the empty target `<div>`. `onMount` runs in
  the browser after mount, where `window` exists.
- **Do not** inject a raw `<script>` via `{@html}` — injected script tags do not
  execute reliably and conflict with prerender/SSR.
- **No npm dependency:** the IIFE appends `embed.js` from the self-hosted origin.
  Keep that mechanism.

Embed parameters (from the existing snippet):

- origin: `https://cal.lagraineducraft.fr`
- `calLink: "johan.chan/30min"`
- namespace: `30min`
- `layout: "week_view"`, `useSlotsViewOnSmallScreen: true`

**Theme change vs. snippet:** the snippet hardcodes `theme: "dark"`. Instead,
sync to the site's reactive theme store and pass the mapped value to the embed:

- Store: `theme` from `$lib/components/Theme.svelte.ts` — `theme.current` is
  `'autumn'` (light) or `'abyss'` (dark).
- Map: `abyss` → Cal `dark`; `autumn` → Cal `light`.
- Pass the mapped theme on mount. Because `theme.current` is reactive, reacting
  to a live mid-session toggle is low-cost; do it if the embed exposes a theme
  update call, otherwise set-on-mount is acceptable for v1.

## Content Security Policy

The site has **no CSP today** (nothing in `svelte.config.js` `csp`, no
`<meta http-equiv>` in `app.html`, no `_headers`). GitHub Pages cannot set
response headers, so a header-based CSP is not possible on this host anyway. The
embed therefore needs **no CSP work to ship**.

If a CSP is ever introduced (via SvelteKit's `csp` config, which injects into the
prerendered HTML), the Cal embed requires:

- `script-src https://cal.lagraineducraft.fr` — injected `embed.js`
- `frame-src https://cal.lagraineducraft.fr` — booking iframe
- `connect-src https://cal.lagraineducraft.fr wss://cal.lagraineducraft.fr` —
  availability fetch + live updates
- `style-src 'unsafe-inline'` and `img-src https://cal.lagraineducraft.fr data:`
  — Cal injects styles and avatars

## i18n

Page intro copy (heading + a short sentence about the call) needs a few new
message strings in `messages/fr.json` and the EN equivalents, consumed via
`import * as m from '$lib/paraglide/messages'`. The Cal widget itself handles its
own localization.

## Testing

- Build succeeds and `apps/web/build/call/index.html` (and `/en/call`) is emitted.
- The built page contains `<meta name="robots" content="noindex, nofollow">`.
- `/call` does not appear in the generated `sitemap.xml`.
- Manual: load the page, confirm the Cal widget mounts and shows availability,
  and that the widget theme matches the active site theme.

## Files touched

- `apps/web/src/routes/call/+page.ts` (new)
- `apps/web/src/routes/call/+page.svelte` (new)
- `apps/web/messages/fr.json` (+ EN messages source) — new strings
