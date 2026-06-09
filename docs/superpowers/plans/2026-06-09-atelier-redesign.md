# L'Atelier Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the hifi "L'Atelier" design handoff to `apps/site` — 4 screens + article reader + case study + an interactive "two sides" proof — as a bilingual (FR/ER), two-theme, mobile-first Astro site.

**Architecture:** Astro pur / vanilla-first (no UI framework). React state from the prototypes maps to Astro idioms: `lang` → routing (FR `/`, EN `/en/`), `theme` → `data-theme` + `localStorage`, overlays → real routes. Bespoke palette as CSS custom properties under `[data-theme]`, exposed to Tailwind 4 via `@theme`; DaisyUI removed. Type scale centralized as semantic CSS classes responsive at one ~768px breakpoint.

**Tech Stack:** Astro 6, Tailwind 4 (`@tailwindcss/vite`), TypeScript strict, Vitest, Playwright. Google Fonts: Bricolage Grotesque / Hanken Grotesk / Geist Mono.

**Spec:** `docs/superpowers/specs/2026-06-09-atelier-redesign-design.md`
**Design source (read-only reference):** `.claude/design_handoff_atelier/prototypes/*.jsx` + `README.md`

---

## Conventions (read once, apply to every task)

**JSX → Astro translation rules** (the prototypes are the pixel-exact reference):
- Component `function X({a,b})` → `.astro` with frontmatter `const { a, b } = Astro.props;` and a typed `interface Props`.
- `{cond && <X/>}` → `{cond && <X/>}` (same). `arr.map(x => <Y/>)` → `{arr.map((x) => <Y/>)}` (same).
- `className` → `class`. `style={{ camelCase }}` → either a utility class (preferred, see table) or `style="kebab-case: value"` for exact one-off metrics.
- React hooks / interactivity → a vanilla `<script>` in the `.astro` file (runs client-side). No React.
- Bilingual content comes from `src/data/atelier.ts` (`copy[lang]`, `pieces`, `projects`) — never hardcode copy in components.

**Inline-style → Tailwind utility mapping** (colors/fonts re-resolve per theme via `@theme`):

| Prototype inline | Utility |
|---|---|
| `color: t.ink / t.ink2 / t.faint / t.accent / t.live` | `text-ink` / `text-ink2` / `text-faint` / `text-accent` / `text-live` |
| `background: t.bg / t.bg2 / t.surf / t.accent` | `bg-bg` / `bg-bg2` / `bg-surf` / `bg-accent` |
| `color: t.accentInk` | `text-accent-ink` |
| `border: 1px solid t.line / t.hair` | `border border-line` / `border border-hair` |
| `fontFamily: DISPLAY / TEXT / MONO` | `font-display` / `font-text` / `font-mono` |
| register hue `hueOf(kind)` | class `kind-impl` / `kind-design` / `kind-refl` (sets `color`) |

**Exact typographic metrics** (hero h1 60/36px, page title 46/31px, etc.) come from the semantic classes defined in Task 1 (`.atl-h1`, `.atl-page-title`, `.atl-h2`, `.atl-piece-title`, `.atl-kicker`, `.atl-meta`, `.atl-body`, `.atl-lede`) — use those, not arbitrary values. One-off spacing uses normal Tailwind utilities.

**Responsive:** single breakpoint. Desktop padding 56px / mobile 22px → use `.atl-container` (Task 1). Grid/layout switches use Tailwind `md:` (≥768px) — `md:` = desktop, base = mobile.

**Commits:** one per task, end every message with the Co-Authored-By trailer:
```
Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
```
**Never** `git add -A` / `git add .` — the working tree has local-only `apps/web` dev-proxy files (`apps/web/package.json`, `apps/web/vite.config.ts`, `pnpm-lock.yaml`, `turbo.json`) that must NOT be committed. Always `git add` exact paths under `apps/site/` (or `docs/`).

**Run commands from `apps/site/`.** Type-check: `pnpm --filter @johan-chan/site check`. Unit: `pnpm --filter @johan-chan/site test:unit`. E2E: `pnpm --filter @johan-chan/site test:e2e`.

---

## File Structure

```
apps/site/src/
├── styles/global.css            (MODIFY) tokens, @theme map, type-scale classes, keyframes
├── layouts/Base.astro           (MODIFY) fonts, theme values
├── data/atelier.ts              (CREATE) types, pieces, projects, copy, helpers
├── i18n/utils.ts                (MODIFY) + getSiblingLocalePath()
├── components/
│   ├── ThemeToggle.astro        (MODIFY) new theme values + ◐ look
│   ├── LangSwitch.astro         (CREATE)
│   ├── Header.astro             (CREATE)
│   ├── MobileNav.astro          (CREATE)
│   ├── Footer.astro             (CREATE)
│   ├── Proof.astro              (CREATE) interactive two-sides demo
│   ├── PieceRow.astro           (CREATE)
│   ├── ProjectCard.astro        (CREATE)
│   └── Ph.astro                 (CREATE) striped text placeholder
└── pages/
    ├── index.astro              (MODIFY)  +  en/index.astro (MODIFY)
    ├── about.astro              (CREATE)  +  en/about.astro
    ├── journal/index.astro      (CREATE)  +  en/journal/index.astro
    ├── journal/[slug].astro     (CREATE)  +  en/journal/[slug].astro
    ├── projets/index.astro      (CREATE)  +  en/projets/index.astro
    └── projets/[slug].astro     (CREATE)  +  en/projets/[slug].astro
tests/
├── i18n.test.ts                 (MODIFY) + getSiblingLocalePath cases
└── smoke.spec.ts                (MODIFY) rewrite for new structure
```

Shared page layout (header + main container + footer + mobile nav) is composed per-page from the chrome components rather than a new layout wrapper, to keep `Base.astro` minimal and the per-page `lang`/`current` explicit.

---

## Task 1: Tokens, type scale, fonts

**Files:**
- Modify: `apps/site/src/styles/global.css`
- Modify: `apps/site/src/layouts/Base.astro`

- [ ] **Step 1: Replace `global.css` with the Atelier token system**

```css
@import "tailwindcss";

/* ---- Atelier palette (handoff §Design tokens) ---- */
[data-theme="atelier-light"] {
  --bg: #f4f1ea; --bg2: #eae5d9; --surf: #fbf9f4;
  --ink: #1b1a17; --ink2: #56524a; --faint: #8a8478;
  --line: rgba(27,26,23,.14); --hair: rgba(27,26,23,.07);
  --accent: #c8521b; --accent-ink: #fbf9f4; --live: #2f7d54;
}
[data-theme="atelier-dark"] {
  --bg: #15170f; --bg2: #1c1f15; --surf: #1f2218;
  --ink: #eef0e6; --ink2: #a7ab98; --faint: #787c6b;
  --line: rgba(238,240,230,.15); --hair: rgba(238,240,230,.07);
  --accent: #ed7d3a; --accent-ink: #15170f; --live: #5bbd84;
}
:root {
  --font-display: "Bricolage Grotesque", "Hanken Grotesk", sans-serif;
  --font-text: "Hanken Grotesk", system-ui, sans-serif;
  --font-mono: "Geist Mono", ui-monospace, monospace;
}

/* ---- expose palette + fonts to Tailwind utilities ---- */
@theme {
  --color-bg: var(--bg);
  --color-bg2: var(--bg2);
  --color-surf: var(--surf);
  --color-ink: var(--ink);
  --color-ink2: var(--ink2);
  --color-faint: var(--faint);
  --color-line: var(--line);
  --color-hair: var(--hair);
  --color-accent: var(--accent);
  --color-accent-ink: var(--accent-ink);
  --color-live: var(--live);
  --font-display: var(--font-display);
  --font-text: var(--font-text);
  --font-mono: var(--font-mono);
}

html { background: var(--bg); color: var(--ink); font-family: var(--font-text); }
* { box-sizing: border-box; }

/* ---- register hues ---- */
.kind-impl { color: var(--accent); }
.kind-design { color: var(--live); }
.kind-refl { color: var(--ink2); }

/* ---- layout primitive: 1080 max, 56/22 padding ---- */
.atl-container { max-width: 1080px; margin-inline: auto; padding-inline: 22px; }
@media (min-width: 768px) { .atl-container { padding-inline: 56px; } }

/* ---- type scale (handoff §Typographie) : mobile base, desktop ≥768 ---- */
.atl-h1 { font-family: var(--font-display); font-weight: 700; font-size: 36px; line-height: 1.02; letter-spacing: -.035em; text-wrap: balance; }
.atl-page-title { font-family: var(--font-display); font-weight: 700; font-size: 31px; line-height: 1.04; letter-spacing: -.03em; }
.atl-lede { font-family: var(--font-display); font-weight: 700; font-size: 29px; line-height: 1.06; letter-spacing: -.03em; text-wrap: balance; }
.atl-h2 { font-family: var(--font-display); font-weight: 600; font-size: 22px; line-height: 1.08; letter-spacing: -.02em; }
.atl-piece-title { font-family: var(--font-display); font-weight: 500; font-size: 21px; line-height: 1.12; letter-spacing: -.02em; text-wrap: pretty; }
.atl-kicker { font-family: var(--font-mono); font-size: 11px; letter-spacing: .12em; text-transform: uppercase; }
.atl-meta { font-family: var(--font-mono); font-size: 11px; }
.atl-body { font-family: var(--font-text); font-size: 15.5px; line-height: 1.55; }
@media (min-width: 768px) {
  .atl-h1 { font-size: 60px; }
  .atl-page-title { font-size: 46px; }
  .atl-lede { font-size: 44px; }
  .atl-h2 { font-size: 28px; }
  .atl-piece-title { font-size: 27px; }
  .atl-body { font-size: 16px; }
}

/* ---- motion ---- */
@keyframes atl-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.45;transform:scale(.82)} }
.atl-livedot { animation: atl-pulse 2s ease-in-out infinite; }
@keyframes atl-rise { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }
.atl-rise { animation: atl-rise .45s cubic-bezier(.2,.8,.3,1) both; }
@keyframes atl-sheetup { from{transform:translateY(100%)} to{transform:none} }
.atl-sheet { animation: atl-sheetup .28s cubic-bezier(.2,.8,.3,1) both; }
.atl-row { transition: transform .16s ease; }
.atl-row:hover { transform: translateX(4px); }
@media (prefers-reduced-motion: reduce) {
  .atl-livedot, .atl-rise, .atl-sheet, .atl-row { animation: none; transition: none; }
}
```

- [ ] **Step 2: Update `Base.astro` for fonts + new theme values**

```astro
---
import '../styles/global.css';
import type { Lang } from '../i18n/ui';
interface Props { lang?: Lang; title?: string }
const { lang = 'fr', title = 'Johan Chan' } = Astro.props;
---
<html lang={lang}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700&family=Hanken+Grotesk:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap"
      rel="stylesheet"
    />
    <script is:inline>
      const saved = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.dataset.theme = saved ?? (prefersDark ? 'atelier-dark' : 'atelier-light');
    </script>
  </head>
  <body class="min-h-screen bg-bg text-ink">
    <slot />
  </body>
</html>
```

- [ ] **Step 3: Verify build/type-check passes**

Run: `pnpm --filter @johan-chan/site check`
Expected: PASS (0 errors). (Existing pages still reference `text-primary`/DaisyUI classes — that's fine; `text-primary` simply renders unstyled until Task 7 replaces those pages. `check` validates types, not CSS classes.)

- [ ] **Step 4: Commit**

```bash
git add apps/site/src/styles/global.css apps/site/src/layouts/Base.astro
git commit -m "feat(site): Atelier token system, type scale, fonts (drop DaisyUI)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Data module (typed port of `atelier-data.js`)

**Files:**
- Create: `apps/site/src/data/atelier.ts`
- Test: `apps/site/tests/atelier-data.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// apps/site/tests/atelier-data.test.ts
import { describe, it, expect } from 'vitest';
import { pieces, projects, fmtDate, allTags, relatedPieces } from '../src/data/atelier';

describe('atelier data', () => {
  it('every piece has a unique slug', () => {
    const slugs = pieces.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs.every((s) => /^[a-z0-9-]+$/.test(s))).toBe(true);
  });
  it('every project relatedId resolves to a known piece', () => {
    const ids = new Set(pieces.map((p) => p.id));
    projects.forEach((pr) => pr.relatedIds.forEach((id) => expect(ids.has(id)).toBe(true)));
  });
});

describe('fmtDate', () => {
  it('formats FR day-first', () => { expect(fmtDate('2026-05-28', 'fr')).toBe('28 mai 2026'); });
  it('formats EN month-first', () => { expect(fmtDate('2026-05-28', 'en')).toBe('May 28, 2026'); });
});

describe('allTags', () => {
  it('returns sorted unique tags for a lang', () => {
    const tags = allTags('en');
    expect(tags).toEqual([...tags].sort((a, b) => a.localeCompare(b)));
    expect(new Set(tags).size).toBe(tags.length);
  });
});

describe('relatedPieces', () => {
  it('returns up to 2 pieces, excluding the source', () => {
    const src = pieces[0];
    const rel = relatedPieces(src, 'fr');
    expect(rel.length).toBeLessThanOrEqual(2);
    expect(rel.some((p) => p.id === src.id)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @johan-chan/site test:unit`
Expected: FAIL — cannot resolve `../src/data/atelier`.

- [ ] **Step 3: Write the data module**

```ts
// apps/site/src/data/atelier.ts
import type { Lang } from '../i18n/ui';

export type Kind = 'impl' | 'design' | 'refl';

export interface PieceContent { title: string; tags: string[] }
export interface Piece {
  id: string;
  slug: string;
  kind: Kind;
  date: string; // YYYY-MM-DD
  read: number;
  live?: boolean;
  fil?: Record<Lang, string>;
  filPart?: number;
  fr: PieceContent;
  en: PieceContent;
}
export interface ProjectContent { name: string; role: string; oneliner: string; story: string[]; tags: string[] }
export interface Project {
  id: string;
  slug: string;
  year: string;
  live?: boolean;
  demo?: boolean;
  relatedIds: string[];
  stack: string[];
  fr: ProjectContent;
  en: ProjectContent;
}

export const pieces: Piece[] = [
  { id: 'p1', slug: 'editeur-code-navigateur-zero-dependance', kind: 'impl', date: '2026-05-28', read: 14, live: true,
    fil: { fr: 'Atelier WASM', en: 'WASM Workshop' }, filPart: 2,
    fr: { title: 'Un éditeur de code dans le navigateur, zéro dépendance', tags: ['WebAssembly', 'Perf', 'Éditeur'] },
    en: { title: 'A code editor in the browser, zero dependencies', tags: ['WebAssembly', 'Perf', 'Editor'] } },
  { id: 'p2', slug: 'invalider-cache-par-evenements', kind: 'design', date: '2026-05-12', read: 9,
    fr: { title: 'Invalider un cache par événements, pas par TTL', tags: ['Systèmes', 'Cache'] },
    en: { title: 'Invalidating a cache by events, not TTL', tags: ['Systems', 'Cache'] } },
  { id: 'p3', slug: 'animations-60fps-timeline', kind: 'impl', date: '2026-04-30', read: 11, live: true,
    fr: { title: 'Des animations 60 fps pilotées par une timeline', tags: ['Animation', 'Canvas'] },
    en: { title: '60 fps animations driven by a timeline', tags: ['Animation', 'Canvas'] } },
  { id: 'p4', slug: 'versionner-ses-decisions', kind: 'refl', date: '2026-05-20', read: 6,
    fr: { title: 'Versionner ses décisions, pas seulement son code', tags: ['Pratique', 'ADR'] },
    en: { title: 'Version your decisions, not just your code', tags: ['Practice', 'ADR'] } },
  { id: 'p5', slug: 'artisanat-ere-autocompletion', kind: 'refl', date: '2026-05-03', read: 8,
    fr: { title: "L'artisanat à l'ère de l'autocomplétion", tags: ['Métier', 'IA'] },
    en: { title: 'Craft in the age of autocompletion', tags: ['Craft', 'AI'] } },
];

export const projects: Project[] = [
  { id: 'proj-wasm', slug: 'atelier-wasm', year: '2026', live: true, demo: true,
    relatedIds: ['p1', 'p2', 'p4'], stack: ['Rust', 'WebAssembly', 'TypeScript'],
    fr: {
      name: 'Atelier WASM', role: 'Conception et développement, de bout en bout',
      oneliner: 'Un éditeur de code qui tourne entièrement dans le navigateur, sans serveur ni dépendance lourde.',
      story: [
        'Au départ, c’était une frustration toute bête : je voulais un petit éditeur où essayer du code, et tout ce que je trouvais réclamait un serveur derrière pour compiler et colorer. Lourd, lent au premier chargement, et un coût qui grimpe avec chaque visiteur.',
        'Je me suis demandé jusqu’où on pouvait aller sans serveur du tout. J’ai sorti un noyau en Rust, compilé en WebAssembly, qui fait l’analyse directement dans le navigateur. Pas d’aller-retour réseau. L’interface est restée volontairement fine ; c’est le système qui porte le poids, là où il est.',
        'En route, j’ai dû repenser deux ou trois choses que je croyais acquises — notamment comment garder l’affichage rapide pendant qu’on tape. J’ai écrit dessus au fil du chantier, c’est plus honnête que de prétendre que c’était limpide.',
        'Au final ça démarre instantanément, ça ne coûte rien par session, et la base a tenu sans que je doive la réécrire. Le même moteur sert ce qu’on voit et ce qui calcule. C’est le genre de résultat qui me plaît : discret, mais solide.',
      ],
      tags: ['WebAssembly', 'Perf', 'Éditeur'],
    },
    en: {
      name: 'WASM Workshop', role: 'Design and build, end to end',
      oneliner: 'A code editor that runs entirely in the browser, no server, no heavy dependencies.',
      story: [
        'It started as a small frustration: I wanted a little editor to try out code, and everything I found needed a server behind it to compile and highlight. Heavy, slow on first load, and a cost that climbs with every visitor.',
        'I wondered how far you could go with no server at all. I pulled out a Rust kernel, compiled to WebAssembly, that does the analysis right in the browser. No network round-trip. The interface stayed deliberately thin; the system carries the weight, where it belongs.',
        'Along the way I had to rethink a couple of things I thought were settled — mainly how to keep the display fast while you type. I wrote about it as the work happened, which is more honest than pretending it was obvious.',
        'In the end it starts instantly, costs nothing per session, and the base held without a rewrite. One engine serves both what you see and what computes. That’s the kind of result I like: quiet, but solid.',
      ],
      tags: ['WebAssembly', 'Perf', 'Editor'],
    },
  },
];

const MONTHS: Record<Lang, string[]> = {
  fr: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

export function fmtDate(iso: string, lang: Lang): string {
  const [y, m, d] = iso.split('-').map(Number);
  const mo = MONTHS[lang][m - 1];
  return lang === 'fr' ? `${d} ${mo} ${y}` : `${mo} ${d}, ${y}`;
}

export function allTags(lang: Lang): string[] {
  const s = new Set<string>();
  pieces.forEach((p) => p[lang].tags.forEach((tg) => s.add(tg)));
  return [...s].sort((a, b) => a.localeCompare(b));
}

export function piecesByDate(): Piece[] {
  return pieces.slice().sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function relatedPieces(piece: Piece, lang: Lang): Piece[] {
  const c = piece[lang];
  let related = pieces.filter((p) => p.id !== piece.id && (
    (piece.fil && p.fil && p.fil.en === piece.fil.en) ||
    p[lang].tags.some((tg) => c.tags.includes(tg))
  ));
  if (related.length < 2) {
    const extra = pieces
      .filter((p) => p.id !== piece.id && !related.includes(p))
      .sort((a) => (a.kind === piece.kind ? -1 : 1));
    related = related.concat(extra);
  }
  return related.slice(0, 2);
}

export const kindLabel: Record<Lang, Record<Kind, string>> = {
  fr: { impl: 'Implémentation', design: 'Design', refl: 'Réflexion' },
  en: { impl: 'Implementation', design: 'Design', refl: 'Reflection' },
};
export const kindClass: Record<Kind, string> = { impl: 'kind-impl', design: 'kind-design', refl: 'kind-refl' };

export interface Copy {
  name: string;
  nav: { work: string; journal: string; about: string };
  read: string; live: string;
  kind: Record<Kind, string>;
  now: { status: string; line: string; meta: string };
  hero: { kicker: string; line: string; sub: string };
  proof: { eyebrow: string; title: string; sub: string; hint: string;
    bothSides: string; whatYouTouch: string; whatHolds: string; served: string;
    autoOn: string; autoOff: string; clickHint: string;
    samples: string[]; stages: string[] };
  journal: { title: string; sub: string; seeAll: string };
  projects: { title: string; sub: string; badge: string; viewCase: string; none: string };
  reader: { back: string; readNext: string; demoInline: string; source: string };
  caseStudy: { back: string; demo: string; whatHelped: string; whatHelpedSub: string };
  about: {
    kicker: string; lede: string; intro: string; portrait: string;
    defTitle: string; def: [string, string, string, string][];
    aiTitle: string; ai: string; openTitle: string; open: string; readMore: string;
  };
  footer: { kicker: string; line: string; sub: string };
  series: string; chapter: string;
}

export const copy: Record<Lang, Copy> = {
  fr: {
    name: 'Johan Chan',
    nav: { work: 'Projets', journal: 'Journal', about: 'À propos' },
    read: 'min', live: 'démo live',
    kind: kindLabel.fr,
    now: { status: 'En ce moment', line: 'Je construis un éditeur de code WebAssembly, zéro dépendance.', meta: 'mis à jour il y a 2 jours' },
    hero: { kicker: 'Product Engineer',
      line: 'Je conçois des produits du début à la fin. L’interface que les gens utilisent, et le système qui encaisse derrière.',
      sub: 'Du code testé, qui tient en production, et qui ne vous bloque pas dans un coin. Je travaille à découvert.' },
    proof: { eyebrow: '01 · preuve', title: 'Les deux faces',
      sub: 'Ce qu’on voit à l’écran, et ce qui tourne dessous. La même chose, prise en charge de bout en bout.',
      hint: '← cliquez un bouton. l’action traverse le système, en direct.',
      bothSides: 'la même pièce, deux faces', whatYouTouch: 'ce qu’on touche', whatHolds: 'ce qui tient dessous',
      served: 'servis', autoOn: '⏸ flux auto', autoOff: '▶ flux auto',
      clickHint: '↑ cliquez. l’action part dans le système →',
      samples: ['ajouter au panier', 'valider l’e-mail', 'publier l’article', 'régler la facture'],
      stages: ['reçu', 'validé', 'écrit', 'diffusé'] },
    journal: { title: 'Le journal', sub: 'Tout ce que j’écris : réflexion, design, implémentation.', seeAll: 'Voir tout le journal' },
    projects: { title: 'Projets', sub: 'Des choses que j’ai construites, racontées. Chacune renvoie aux notes écrites en chemin.',
      badge: 'projet', viewCase: 'voir l’étude de cas', none: 'Rien ici pour l’instant.' },
    reader: { back: '← le journal', readNext: 'à lire ensuite', demoInline: 'démo live, dans l’article', source: 'source' },
    caseStudy: { back: '← les projets', demo: 'démo live, l’idée en action', whatHelped: 'ce qui a aidé',
      whatHelpedSub: 'Les notes et articles écrits au fil de ce projet.' },
    about: {
      kicker: 'À propos',
      lede: 'Je prends en charge le produit complet, de l’interface jusqu’au système.',
      intro: 'L’interface que les gens utilisent et le système qui tient la charge : front, back, design, infra. Une seule personne pour la cohérence de l’ensemble, là où il faut souvent une équipe. Certains appellent ça un Product Engineer.',
      portrait: 'portrait',
      defTitle: 'Concrètement',
      def: [
        ['Je tiens toute la chaîne', 'De ce que voit l’utilisateur jusqu’au système qui encaisse derrière. Garder les deux cohérents, c’est là que ça se joue.', 'editeur-code-navigateur-zero-dependance', 'Voir : l’éditeur WASM'],
        ['Je creuse les sujets qui le méritent', 'Systèmes résilients, performance, architecture. Quand un problème le demande, je vais au fond.', 'animations-60fps-timeline', 'Voir : les animations 60 fps'],
        ['J’écris du code qui dure', 'Éprouvé par les tests, qui tient en production, qui ne vous enferme pas.', 'invalider-cache-par-evenements', 'Voir : invalider un cache par événements'],
      ],
      aiTitle: 'Comment je travaille avec l’IA',
      ai: 'Je ne confie pas mon jugement à l’IA, je m’en sers pour aller plus loin. Elle explore, elle propose, elle accélère l’écriture du code. Les choix d’architecture et les arbitrages restent les miens, et je vérifie ce qui sort. Mon métier n’est pas de produire du code, c’est de savoir lequel est bon.',
      openTitle: 'À découvert',
      open: 'Je n’ai pas fini d’apprendre, et je le montre. Ce journal suit le travail au fur et à mesure, avec ses décisions, ses ratés et ses corrections. Un atelier ouvert, pas une vitrine.',
      readMore: 'Lire le journal',
    },
    footer: { kicker: 'Travaillons ensemble', line: 'Un projet à construire ? Écrivez-moi.', sub: 'Dites-moi ce que vous voulez construire ; on cadre le reste ensemble.' },
    series: 'fil', chapter: 'chap.',
  },
  en: {
    name: 'Johan Chan',
    nav: { work: 'Projects', journal: 'Journal', about: 'About' },
    read: 'min', live: 'live demo',
    kind: kindLabel.en,
    now: { status: 'Right now', line: 'Building a zero-dependency WebAssembly code editor.', meta: 'updated 2 days ago' },
    hero: { kicker: 'Product Engineer',
      line: 'I build products end to end. The interface people use, and the system that takes the load behind it.',
      sub: 'Code that’s tested, holds in production, and doesn’t box you into a corner. I work in the open.' },
    proof: { eyebrow: '01 · proof', title: 'Both sides',
      sub: 'What you see on screen, and what runs underneath. The same thing, owned end to end.',
      hint: '← click a button. the action flows through the system, live.',
      bothSides: 'one piece, two sides', whatYouTouch: 'what you touch', whatHolds: 'what holds underneath',
      served: 'served', autoOn: '⏸ auto flow', autoOff: '▶ auto flow',
      clickHint: '↑ click. the action flows into the system →',
      samples: ['add to cart', 'verify email', 'publish post', 'settle invoice'],
      stages: ['received', 'validated', 'written', 'fanned-out'] },
    journal: { title: 'Journal', sub: 'Everything I write: reflection, design, implementation.', seeAll: 'See the whole journal' },
    projects: { title: 'Projects', sub: 'Things I’ve built, told as stories. Each links to the notes written along the way.',
      badge: 'project', viewCase: 'view the case study', none: 'Nothing here yet.' },
    reader: { back: '← the journal', readNext: 'read next', demoInline: 'live demo, inline', source: 'source' },
    caseStudy: { back: '← projects', demo: 'live demo, the idea in action', whatHelped: 'what helped',
      whatHelpedSub: 'The notes and articles written along this project.' },
    about: {
      kicker: 'About',
      lede: 'I take on the whole product, from the interface down to the system.',
      intro: 'The interface people use and the system that holds the load: front, back, design, infra. One person for the coherence of the whole, where it usually takes a team. Some call it a Product Engineer.',
      portrait: 'portrait',
      defTitle: 'Concretely',
      def: [
        ['I hold the full chain', 'From what the user sees down to the system that takes the load behind it. Keeping both coherent is where it’s won or lost.', 'editeur-code-navigateur-zero-dependance', 'See: the WASM editor'],
        ['I dig into the subjects that deserve it', 'Resilient systems, performance, architecture. When a problem calls for it, I go deep.', 'animations-60fps-timeline', 'See: the 60 fps animations'],
        ['I write code that lasts', 'Test-proven, holds in production, doesn’t lock you in.', 'invalider-cache-par-evenements', 'See: invalidating a cache by events'],
      ],
      aiTitle: 'How I work with AI',
      ai: 'I don’t hand my judgment to AI, I use it to go further. It explores, it proposes, it speeds up writing code. The architecture choices and the trade-offs stay mine, and I check what comes out. My job isn’t to produce code, it’s to know which code is good.',
      openTitle: 'In the open',
      open: 'I’m not done learning, and I show it. This journal follows the work as it goes, with its decisions, its misses and its fixes. An open workshop, not a showcase.',
      readMore: 'Read the journal',
    },
    footer: { kicker: 'Let’s work together', line: 'Got something to build? Write me.', sub: 'Tell me what you want to build; we’ll shape the rest together.' },
    series: 'series', chapter: 'ch.',
  },
};

export const CONTACT_EMAIL = 'johan@chan.dev';
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @johan-chan/site test:unit`
Expected: PASS (all `atelier-data` + existing `i18n` tests green).

- [ ] **Step 5: Commit**

```bash
git add apps/site/src/data/atelier.ts apps/site/tests/atelier-data.test.ts
git commit -m "feat(site): typed Atelier data module + copy + helpers (TDD)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Sibling-locale URL helper

**Files:**
- Modify: `apps/site/src/i18n/utils.ts`
- Test: `apps/site/tests/i18n.test.ts`

- [ ] **Step 1: Add failing test cases to `tests/i18n.test.ts`**

Append:
```ts
import { getSiblingLocalePath } from '../src/i18n/utils';

describe('getSiblingLocalePath', () => {
  it('FR root → EN root', () => { expect(getSiblingLocalePath(new URL('http://x/'), 'en')).toBe('/en/'); });
  it('EN root → FR root', () => { expect(getSiblingLocalePath(new URL('http://x/en/'), 'fr')).toBe('/'); });
  it('FR subpath → EN subpath', () => { expect(getSiblingLocalePath(new URL('http://x/journal'), 'en')).toBe('/en/journal'); });
  it('EN subpath → FR subpath', () => { expect(getSiblingLocalePath(new URL('http://x/en/journal'), 'fr')).toBe('/journal'); });
  it('FR → FR is identity', () => { expect(getSiblingLocalePath(new URL('http://x/about'), 'fr')).toBe('/about'); });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @johan-chan/site test:unit`
Expected: FAIL — `getSiblingLocalePath` is not exported.

- [ ] **Step 3: Implement the helper in `i18n/utils.ts`**

Append to the file:
```ts
/** Map the current URL's pathname to its equivalent under another locale (segments not localized). */
export function getSiblingLocalePath(url: URL, target: Lang): string {
  // strip a leading "/en" to get the canonical FR path
  const frPath = url.pathname.replace(/^\/en(?=\/|$)/, '') || '/';
  if (target === 'fr') return frPath;
  return frPath === '/' ? '/en/' : `/en${frPath}`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @johan-chan/site test:unit`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/site/src/i18n/utils.ts apps/site/tests/i18n.test.ts
git commit -m "feat(site): getSiblingLocalePath for language switch links (TDD)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Shared chrome (ThemeToggle, LangSwitch, Header, MobileNav, Footer)

**Files:**
- Modify: `apps/site/src/components/ThemeToggle.astro`
- Create: `apps/site/src/components/LangSwitch.astro`, `Header.astro`, `MobileNav.astro`, `Footer.astro`

- [ ] **Step 1: Rewrite `ThemeToggle.astro` (new values + ◐ look)**

```astro
<button type="button" class="grid h-[30px] w-[30px] place-items-center rounded-full border border-line bg-surf"
  data-testid="theme-toggle" aria-label="Basculer le thème">
  <span class="h-[13px] w-[13px] rounded-full border-[1.5px] border-ink2"
    style="background: linear-gradient(90deg, var(--ink2) 0 50%, transparent 50%)"></span>
</button>
<script>
  const LIGHT = 'atelier-light';
  const DARK = 'atelier-dark';
  document.querySelector('[data-testid="theme-toggle"]')?.addEventListener('click', () => {
    const root = document.documentElement;
    const next = root.dataset.theme === DARK ? LIGHT : DARK;
    root.dataset.theme = next;
    localStorage.setItem('theme', next);
  });
</script>
```

- [ ] **Step 2: Create `LangSwitch.astro`**

Renders links to the sibling locale (no dropdown state needed — two locales).
```astro
---
import type { Lang } from '../i18n/ui';
import { getSiblingLocalePath } from '../i18n/utils';
interface Props { lang: Lang }
const { lang } = Astro.props;
const other: Lang = lang === 'fr' ? 'en' : 'fr';
const href = getSiblingLocalePath(Astro.url, other);
---
<a href={href} hreflang={other} data-testid="lang-switch"
  class="atl-meta inline-flex items-center gap-1.5 rounded-full border border-line bg-surf px-[11px] py-[5px] uppercase tracking-[.05em] text-ink"
  aria-label={lang === 'fr' ? 'Switch to English' : 'Passer en français'}>
  {other}
</a>
```

- [ ] **Step 3: Create `MobileNav.astro`** (overlay rendered after the button, at flow level — not inside any blurred ancestor's stacking trap; the panel is `fixed` to the viewport)

```astro
---
import type { Lang } from '../i18n/ui';
import { copy } from '../data/atelier';
interface Props { lang: Lang; current: 'home' | 'work' | 'journal' | 'about' }
const { lang, current } = Astro.props;
const c = copy[lang];
const base = lang === 'fr' ? '' : '/en';
const items: { key: Props['current']; href: string; label: string }[] = [
  { key: 'work', href: `${base}/projets`, label: c.nav.work },
  { key: 'journal', href: `${base}/journal`, label: c.nav.journal },
  { key: 'about', href: `${base}/about`, label: c.nav.about },
];
---
<div class="md:hidden">
  <button type="button" data-mnav-toggle aria-expanded="false" aria-label="menu"
    class="relative z-[60] flex h-[34px] w-[34px] flex-col items-center justify-center gap-1 rounded-full border border-line bg-surf">
    <span data-bar class="h-[1.6px] w-[15px] rounded bg-ink transition-transform"></span>
    <span data-bar class="h-[1.6px] w-[15px] rounded bg-ink transition-transform"></span>
  </button>
  <div data-mnav-backdrop hidden
    class="fixed inset-0 top-[var(--hdr-h,56px)] z-40 bg-black/50 backdrop-blur-[4px]"></div>
  <nav data-mnav-panel hidden aria-label="menu"
    class="fixed inset-x-0 top-[var(--hdr-h,56px)] z-45 border-b border-line bg-bg shadow-[0_28px_56px_-20px_#000d]">
    {items.map((it, i) => (
      <a href={it.key === current ? undefined : it.href}
        class={`flex items-center gap-3.5 px-[22px] py-[17px] ${i < items.length - 1 ? 'border-b border-line' : ''}`}>
        <span class="atl-meta w-[22px] text-faint">{String(i).padStart(2, '0')}</span>
        <span class={`atl-h2 ${it.key === current ? 'text-accent' : 'text-ink'}`} style="font-size:22px">{it.label}</span>
        {it.key === current && <span class="ml-auto h-[7px] w-[7px] rounded-full bg-accent"></span>}
      </a>
    ))}
  </nav>
</div>
<script>
  const toggle = document.querySelector('[data-mnav-toggle]');
  const panel = document.querySelector('[data-mnav-panel]');
  const backdrop = document.querySelector('[data-mnav-backdrop]');
  const bars = document.querySelectorAll('[data-mnav-toggle] [data-bar]');
  const setOpen = (open) => {
    panel?.toggleAttribute('hidden', !open);
    backdrop?.toggleAttribute('hidden', !open);
    toggle?.setAttribute('aria-expanded', String(open));
    if (bars[0]) bars[0].style.transform = open ? 'translateY(2.8px) rotate(45deg)' : '';
    if (bars[1]) bars[1].style.transform = open ? 'translateY(-2.8px) rotate(-45deg)' : '';
  };
  toggle?.addEventListener('click', () => setOpen(panel?.hasAttribute('hidden') ?? true));
  backdrop?.addEventListener('click', () => setOpen(false));
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
</script>
```

- [ ] **Step 4: Create `Header.astro`**

```astro
---
import type { Lang } from '../i18n/ui';
import { copy } from '../data/atelier';
import ThemeToggle from './ThemeToggle.astro';
import LangSwitch from './LangSwitch.astro';
import MobileNav from './MobileNav.astro';
interface Props { lang: Lang; current: 'home' | 'work' | 'journal' | 'about' }
const { lang, current } = Astro.props;
const c = copy[lang];
const base = lang === 'fr' ? '' : '/en';
const links: { key: Props['current']; href: string; label: string }[] = [
  { key: 'work', href: `${base}/projets`, label: c.nav.work },
  { key: 'journal', href: `${base}/journal`, label: c.nav.journal },
  { key: 'about', href: `${base}/about`, label: c.nav.about },
];
---
<header class="sticky top-0 z-20 border-b border-line backdrop-blur-[10px]"
  style="background: color-mix(in srgb, var(--bg) 84%, transparent)">
  <div class="atl-container flex items-center justify-between gap-4 py-[13px] md:py-[15px]">
    <a href={`${base}/`} data-testid="logo" class="font-display text-[17px] font-bold tracking-[-.02em] text-ink md:text-[19px]">
      {c.name}<span class="text-accent">.</span>
    </a>
    <nav class="hidden gap-6 font-mono text-[13px] md:flex" data-testid="nav-desktop">
      {links.map((l) => (
        <a href={l.href} class={l.key === current
          ? 'whitespace-nowrap border-b border-accent pb-px text-ink'
          : 'whitespace-nowrap text-ink2'}>{l.label}</a>
      ))}
    </nav>
    <div class="flex items-center gap-3.5">
      <LangSwitch lang={lang} />
      <ThemeToggle />
      <MobileNav lang={lang} current={current} />
    </div>
  </div>
</header>
```

- [ ] **Step 5: Create `Footer.astro`**

```astro
---
import type { Lang } from '../i18n/ui';
import { copy, CONTACT_EMAIL } from '../data/atelier';
interface Props { lang: Lang }
const { lang } = Astro.props;
const c = copy[lang].footer;
const year = new Date().getFullYear();
---
<footer class="mt-16 border-t border-line bg-bg2 md:mt-24">
  <div class="atl-container py-11 md:py-16">
    <div class="flex flex-wrap items-center justify-between gap-6 rounded-[18px] border border-line bg-surf p-[28px] md:p-[40px]">
      <div class="min-w-0 max-w-[560px]">
        <span class="atl-kicker text-accent" style="letter-spacing:.14em">{c.kicker}</span>
        <p class="atl-h2 mt-3 mb-2.5 text-ink" style="font-weight:600;letter-spacing:-.025em;line-height:1.05">{c.line}</p>
        <p class="atl-body text-ink2">{c.sub}</p>
      </div>
      <a href={`mailto:${CONTACT_EMAIL}`} class="atl-meta whitespace-nowrap rounded-full bg-accent px-[22px] py-[13px] text-[13px] text-accent-ink">{CONTACT_EMAIL} →</a>
    </div>
    <div class="mt-7 flex flex-wrap items-center justify-between gap-4 md:mt-10">
      <span class="font-display text-[16px] font-bold tracking-[-.02em] text-ink">{copy[lang].name}<span class="text-accent">.</span></span>
      <span class="atl-meta text-faint">© {year}</span>
    </div>
  </div>
</footer>
```

- [ ] **Step 6: Set `--hdr-h` for the mobile nav offset**

Add to `global.css` (mobile header ≈ 56px; the panel/backdrop start below it):
```css
:root { --hdr-h: 56px; }
```

- [ ] **Step 7: Type-check**

Run: `pnpm --filter @johan-chan/site check`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add apps/site/src/components/ThemeToggle.astro apps/site/src/components/LangSwitch.astro apps/site/src/components/Header.astro apps/site/src/components/MobileNav.astro apps/site/src/components/Footer.astro apps/site/src/styles/global.css
git commit -m "feat(site): Atelier shared chrome — header, footer, lang switch, mobile nav

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Interactive proof component (`Proof.astro`)

Port `atelier-proof.jsx`. Server-render the static markup; a scoped vanilla `<script>` runs the rAF pipeline. Reduced-motion → filled static state.

**Files:**
- Create: `apps/site/src/components/Proof.astro`

- [ ] **Step 1: Create `Proof.astro`**

```astro
---
import type { Lang } from '../i18n/ui';
import { copy } from '../data/atelier';
interface Props { lang: Lang }
const { lang } = Astro.props;
const p = copy[lang].proof;
const uid = 'proof-' + Math.random().toString(36).slice(2, 8);
---
<div class="overflow-hidden rounded-[12px] border border-line" data-proof id={uid} data-lang={lang}>
  <div class="flex items-center justify-between border-b border-line bg-bg2 px-3.5 py-2.5">
    <span class="atl-meta uppercase text-faint" style="font-size:10.5px;letter-spacing:.12em">{p.bothSides}</span>
    <button type="button" data-auto aria-pressed="true"
      class="atl-meta rounded-md border border-line px-2.5 py-1 text-ink2" style="font-size:10.5px">{p.autoOn}</button>
  </div>
  <div class="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
    <!-- FACE A -->
    <div class="min-w-0 border-r border-line bg-surf p-4">
      <span class="atl-meta uppercase text-accent" style="font-size:10px;letter-spacing:.1em">{p.whatYouTouch}</span>
      <div class="mt-3 overflow-hidden rounded-[9px] border border-line bg-bg">
        <div class="flex gap-1.5 border-b border-hair px-2.5 py-2">
          <span class="h-2 w-2 rounded-full opacity-70" style="background:#e06a4a"></span>
          <span class="h-2 w-2 rounded-full opacity-70" style="background:#dbb54a"></span>
          <span class="h-2 w-2 rounded-full opacity-70" style="background:#5aa86a"></span>
        </div>
        <div class="flex flex-col gap-2.5 p-3.5">
          <div class="h-2 w-[60%] rounded bg-hair"></div>
          <div class="h-2 w-[85%] rounded bg-hair"></div>
          {p.samples.slice(0, 2).map((label, i) => (
            <button type="button" data-fire={i}
              class={`mt-0.5 rounded-lg px-3 py-2.5 text-left font-text text-[13px] font-semibold ${i === 0 ? 'bg-accent text-accent-ink' : 'bg-bg2 text-ink'}`}>{label} →</button>
          ))}
        </div>
      </div>
      <p class="atl-meta mt-3 text-faint" style="font-size:10.5px;line-height:1.5">{p.clickHint}</p>
    </div>
    <!-- FACE B -->
    <div class="relative min-w-0 bg-bg p-4">
      <div class="flex items-center justify-between">
        <span class="atl-meta uppercase text-live" style="font-size:10px;letter-spacing:.1em">{p.whatHolds}</span>
        <span class="atl-meta text-faint" style="font-size:10.5px"><span data-count>18 432</span> {p.served}</span>
      </div>
      <div class="mt-3.5 flex flex-col gap-[7px]">
        {p.stages.map((sn, si) => (
          <div class="grid grid-cols-[74px_1fr] items-center gap-2">
            <span class="atl-meta text-right text-faint" style="font-size:10px">{sn}</span>
            <div class="relative h-[22px] overflow-hidden rounded-md border border-hair bg-bg2" data-lane={si}></div>
          </div>
        ))}
      </div>
      <div class="mt-3.5 flex items-center gap-2">
        <span class="atl-meta text-faint" style="font-size:10px">scale</span>
        <div class="flex flex-1 gap-0.5">
          {Array.from({ length: 24 }).map((_, i) => (
            <span class="h-3.5 flex-1 rounded-sm" style={`background: ${i < 21 ? 'var(--live)' : 'var(--hair)'}; opacity:${i < 21 ? 0.4 + (i / 24) * 0.6 : 1}`}></span>
          ))}
        </div>
        <span class="atl-meta text-live" style="font-size:10px">99.9%</span>
      </div>
    </div>
  </div>
</div>
<script>
  const SAMPLES = {
    fr: ['ajouter au panier', 'valider l’e-mail', 'publier l’article', 'régler la facture'],
    en: ['add to cart', 'verify email', 'publish post', 'settle invoice'],
  };
  document.querySelectorAll('[data-proof]').forEach((root) => {
    const lang = root.getAttribute('data-lang') === 'en' ? 'en' : 'fr';
    const samples = SAMPLES[lang];
    const lanes = [...root.querySelectorAll('[data-lane]')];
    const countEl = root.querySelector('[data-count]');
    const autoBtn = root.querySelector('[data-auto]');
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let events = []; let count = 18432; let auto = true; let _id = 0;
    const nf = new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'en-US');

    const render = () => {
      lanes.forEach((lane, si) => {
        lane.innerHTML = '';
        events.filter((e) => e.stage === si).forEach((e) => {
          const chip = document.createElement('span');
          chip.textContent = e.label;
          chip.style.cssText = 'position:absolute;top:3px;left:5px;height:16px;padding:0 7px;display:inline-flex;align-items:center;border-radius:4px;font-family:var(--font-mono);font-size:9.5px;white-space:nowrap;max-width:calc(100% - 10px);overflow:hidden;text-overflow:ellipsis;color:var(--accent-ink);background:' + (si >= 3 ? 'var(--live)' : 'var(--accent)');
          lane.appendChild(chip);
        });
      });
      if (countEl) countEl.textContent = nf.format(count);
    };
    const fire = (idx) => {
      const id = ++_id;
      const label = samples[idx != null ? idx : id % samples.length];
      events = [...events.slice(-4), { id, label, stage: 0, born: performance.now() }];
      count += 1; render();
    };
    root.querySelectorAll('[data-fire]').forEach((b) =>
      b.addEventListener('click', () => fire(Number(b.getAttribute('data-fire')))));

    if (reduce) {
      events = [{ id: 1, label: samples[0], stage: 1, born: 0 }, { id: 2, label: samples[1], stage: 3, born: 0 }];
      render();
      if (autoBtn) autoBtn.style.display = 'none';
      return;
    }
    autoBtn?.addEventListener('click', () => {
      auto = !auto;
      autoBtn.setAttribute('aria-pressed', String(auto));
      autoBtn.textContent = auto ? (lang === 'fr' ? '⏸ flux auto' : '⏸ auto flow') : (lang === 'fr' ? '▶ flux auto' : '▶ auto flow');
    });
    let last = performance.now(); let acc = 0; let emitAcc = 0;
    const loop = (now) => {
      const dt = now - last; last = now; acc += dt; emitAcc += dt;
      if (acc > 360) { acc = 0; events = events.map((e) => ({ ...e, stage: Math.min(4, e.stage + 1) })).filter((e) => e.stage < 4 || now - e.born < 2600); render(); }
      if (auto && emitAcc > 1500) { emitAcc = 0; fire(); }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  });
</script>
```

- [ ] **Step 2: Type-check**

Run: `pnpm --filter @johan-chan/site check`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/site/src/components/Proof.astro
git commit -m "feat(site): interactive 'two sides' proof component (vanilla rAF)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Content rows (`PieceRow`, `ProjectCard`, `Ph`)

**Files:**
- Create: `apps/site/src/components/PieceRow.astro`, `ProjectCard.astro`, `Ph.astro`

- [ ] **Step 1: Create `PieceRow.astro`**

```astro
---
import type { Lang } from '../i18n/ui';
import type { Piece } from '../data/atelier';
import { copy, fmtDate, kindClass } from '../data/atelier';
interface Props { piece: Piece; lang: Lang }
const { piece, lang } = Astro.props;
const c = piece[lang]; const C = copy[lang];
const base = lang === 'fr' ? '' : '/en';
const href = `${base}/journal/${piece.slug}`;
const hue = kindClass[piece.kind];
const dotShape = piece.kind === 'impl' ? 'rounded-sm' : 'rounded-full';
const dotRotate = piece.kind === 'design' ? 'rotate-45' : '';
---
<a href={href} data-testid="piece-row" data-kind={piece.kind} data-tags={c.tags.join('|')}
  class="atl-row grid grid-cols-1 items-baseline gap-2 border-t border-line py-5 md:grid-cols-[128px_1fr_auto] md:gap-6 md:py-[26px]">
  <div class="flex flex-col gap-[7px]">
    <span class={`atl-meta inline-flex items-center gap-[7px] ${hue}`} style="letter-spacing:.04em">
      <span class={`h-[7px] w-[7px] ${dotShape} ${dotRotate}`} style="background: currentColor"></span>
      {C.kind[piece.kind]}
    </span>
    <span class="atl-meta text-faint">{fmtDate(piece.date, lang)}</span>
  </div>
  <div class="min-w-0">
    {piece.fil && (
      <span class={`atl-meta mb-2 block uppercase ${hue}`} style="font-size:10.5px;letter-spacing:.08em">{C.series} · {piece.fil[lang]}, {C.chapter} {piece.filPart}</span>
    )}
    <h3 class="atl-piece-title m-0 text-ink">{c.title}</h3>
    <div class="mt-2.5 flex flex-wrap items-center gap-2">
      {c.tags.map((tg) => <span class="atl-meta text-ink2">#{tg.toLowerCase()}</span>)}
      <span class="atl-meta whitespace-nowrap text-faint">· {piece.read} {C.read}</span>
      {piece.live && (
        <span class="atl-meta inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-accent px-2 text-accent" style="font-size:10.5px">
          <span class="atl-livedot h-[5px] w-[5px] shrink-0 rounded-full bg-accent"></span>{C.live}
        </span>
      )}
    </div>
  </div>
  <span class={`hidden self-center font-mono text-[18px] md:block ${hue}`}>→</span>
</a>
```

- [ ] **Step 2: Create `ProjectCard.astro`**

```astro
---
import type { Lang } from '../i18n/ui';
import type { Project } from '../data/atelier';
import { copy } from '../data/atelier';
interface Props { project: Project; lang: Lang }
const { project, lang } = Astro.props;
const c = project[lang]; const C = copy[lang];
const base = lang === 'fr' ? '' : '/en';
const href = `${base}/projets/${project.slug}`;
---
<a href={href} data-testid="project-card"
  class="atl-row mb-4 block rounded-[14px] border border-line bg-surf p-5 md:p-[26px]">
  <div class="mb-3.5 flex items-center justify-between gap-3">
    <span class="atl-meta rounded-full border border-accent px-2.5 uppercase text-accent" style="font-size:10.5px;letter-spacing:.1em">{C.projects.badge}</span>
    <span class="atl-meta text-faint">{project.year}</span>
  </div>
  <h3 class="font-display text-[23px] font-bold leading-[1.06] tracking-[-.025em] text-ink md:text-[30px]">{c.name}</h3>
  <p class="atl-body mt-2.5 max-w-[620px] text-ink2">{c.oneliner}</p>
  <div class="mt-4 flex flex-wrap items-center gap-2">
    {project.stack.map((s) => <span class="atl-meta rounded-full border border-line px-2.5 text-ink2">{s}</span>)}
    <span class="atl-meta ml-auto text-accent">{C.projects.viewCase} →</span>
  </div>
</a>
```

- [ ] **Step 3: Create `Ph.astro`** (striped text placeholder)

```astro
---
interface Props { n: number; w?: string }
const { n, w = '62%' } = Astro.props;
---
<div class="my-4 flex flex-col gap-[11px]">
  {Array.from({ length: n }).map((_, i) => (
    <span class="h-2.5 rounded bg-hair" style={`width:${i === n - 1 ? w : '100%'}`}></span>
  ))}
</div>
```

- [ ] **Step 4: Type-check**

Run: `pnpm --filter @johan-chan/site check`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/site/src/components/PieceRow.astro apps/site/src/components/ProjectCard.astro apps/site/src/components/Ph.astro
git commit -m "feat(site): PieceRow, ProjectCard, Ph placeholder components

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: Home page (FR + EN)

Port `atelier.jsx`: hero (kicker + h1 + sub + status card), proof section, journal preview (3 pieces) + "see all" link.

**Files:**
- Modify: `apps/site/src/pages/index.astro`
- Modify: `apps/site/src/pages/en/index.astro`

- [ ] **Step 1: Write `pages/index.astro`**

```astro
---
import Base from '../layouts/Base.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import Proof from '../components/Proof.astro';
import PieceRow from '../components/PieceRow.astro';
import { copy, piecesByDate } from '../data/atelier';
import type { Lang } from '../i18n/ui';
const lang: Lang = 'fr';
const C = copy[lang];
const N = C.now;
const preview = piecesByDate().slice(0, 3);
const base = lang === 'fr' ? '' : '/en';
---
<Base lang={lang} title={`${C.name} — ${C.hero.kicker}`}>
  <Header lang={lang} current="home" />
  <main class="atl-container pb-16 md:pb-24">
    <!-- HERO -->
    <section class="pt-10 md:pt-[60px]">
      <div class="atl-kicker mb-[18px] inline-flex items-center gap-2.5 text-ink2 md:mb-[26px]" style="letter-spacing:.1em">
        <span class="h-[7px] w-[7px] rounded-full bg-accent"></span>{C.hero.kicker}
      </div>
      <h1 class="atl-h1 m-0 max-w-[880px] text-ink" data-testid="hero">{C.hero.line}</h1>
      <p class="atl-body mt-4 max-w-[600px] text-ink2 md:mt-[22px] md:text-[18px]">{C.hero.sub}</p>
      <div class="mt-5 flex max-w-[720px] items-start gap-3.5 rounded-[12px] border border-line bg-surf p-4 md:mt-8 md:px-[22px] md:py-[18px]">
        <span class="atl-meta whitespace-nowrap pt-[3px] uppercase text-faint" style="font-size:10.5px;letter-spacing:.1em">{N.status}</span>
        <div class="flex min-w-0 flex-col gap-1.5">
          <p class="m-0 font-text text-[15px] font-medium leading-[1.4] text-ink md:text-[17px]">{N.line}</p>
          <span class="atl-meta text-faint">{N.meta}</span>
        </div>
      </div>
    </section>

    <!-- PROOF -->
    <section class="pt-12 md:pt-16">
      <div class="grid grid-cols-1 items-center gap-6 md:grid-cols-[0.8fr_1.2fr] md:gap-11">
        <div class="min-w-0">
          <span class="atl-meta uppercase text-accent" style="letter-spacing:.16em">{C.proof.eyebrow}</span>
          <h2 class="atl-h2 mb-3 mt-3.5 max-w-none text-ink md:text-[34px]">{C.proof.title}</h2>
          <p class="atl-body m-0 max-w-[380px] text-ink2">{C.proof.sub}</p>
          <p class="atl-meta mt-4 text-faint" style="font-size:12px;line-height:1.6">{C.proof.hint}</p>
        </div>
        <div class="min-w-0"><Proof lang={lang} /></div>
      </div>
    </section>

    <!-- JOURNAL preview -->
    <section class="pt-[52px] md:pt-[74px]">
      <div class="mb-3 flex items-baseline justify-between md:mb-4">
        <h2 class="atl-h2 m-0 text-ink">
          <span class="atl-meta mr-2.5 align-middle text-accent" style="font-size:12px">02</span>{C.journal.title}
        </h2>
      </div>
      {preview.map((p) => <PieceRow piece={p} lang={lang} />)}
      <div class="border-t border-line"></div>
      <a href={`${base}/journal`} class="atl-meta mt-5 inline-flex items-center gap-2 border-b border-accent pb-0.5 text-[13px] text-accent">{C.journal.seeAll} →</a>
    </section>
  </main>
  <Footer lang={lang} />
</Base>
```

- [ ] **Step 2: Write `pages/en/index.astro`**

Identical to Step 1 but: import paths go up one more level (`../../`), and `const lang: Lang = 'en';`. Full file:
```astro
---
import Base from '../../layouts/Base.astro';
import Header from '../../components/Header.astro';
import Footer from '../../components/Footer.astro';
import Proof from '../../components/Proof.astro';
import PieceRow from '../../components/PieceRow.astro';
import { copy, piecesByDate } from '../../data/atelier';
import type { Lang } from '../../i18n/ui';
const lang: Lang = 'en';
const C = copy[lang];
const N = C.now;
const preview = piecesByDate().slice(0, 3);
const base = lang === 'fr' ? '' : '/en';
---
<Base lang={lang} title={`${C.name} — ${C.hero.kicker}`}>
  <Header lang={lang} current="home" />
  <main class="atl-container pb-16 md:pb-24">
    <section class="pt-10 md:pt-[60px]">
      <div class="atl-kicker mb-[18px] inline-flex items-center gap-2.5 text-ink2 md:mb-[26px]" style="letter-spacing:.1em">
        <span class="h-[7px] w-[7px] rounded-full bg-accent"></span>{C.hero.kicker}
      </div>
      <h1 class="atl-h1 m-0 max-w-[880px] text-ink" data-testid="hero">{C.hero.line}</h1>
      <p class="atl-body mt-4 max-w-[600px] text-ink2 md:mt-[22px] md:text-[18px]">{C.hero.sub}</p>
      <div class="mt-5 flex max-w-[720px] items-start gap-3.5 rounded-[12px] border border-line bg-surf p-4 md:mt-8 md:px-[22px] md:py-[18px]">
        <span class="atl-meta whitespace-nowrap pt-[3px] uppercase text-faint" style="font-size:10.5px;letter-spacing:.1em">{N.status}</span>
        <div class="flex min-w-0 flex-col gap-1.5">
          <p class="m-0 font-text text-[15px] font-medium leading-[1.4] text-ink md:text-[17px]">{N.line}</p>
          <span class="atl-meta text-faint">{N.meta}</span>
        </div>
      </div>
    </section>
    <section class="pt-12 md:pt-16">
      <div class="grid grid-cols-1 items-center gap-6 md:grid-cols-[0.8fr_1.2fr] md:gap-11">
        <div class="min-w-0">
          <span class="atl-meta uppercase text-accent" style="letter-spacing:.16em">{C.proof.eyebrow}</span>
          <h2 class="atl-h2 mb-3 mt-3.5 max-w-none text-ink md:text-[34px]">{C.proof.title}</h2>
          <p class="atl-body m-0 max-w-[380px] text-ink2">{C.proof.sub}</p>
          <p class="atl-meta mt-4 text-faint" style="font-size:12px;line-height:1.6">{C.proof.hint}</p>
        </div>
        <div class="min-w-0"><Proof lang={lang} /></div>
      </div>
    </section>
    <section class="pt-[52px] md:pt-[74px]">
      <div class="mb-3 flex items-baseline justify-between md:mb-4">
        <h2 class="atl-h2 m-0 text-ink">
          <span class="atl-meta mr-2.5 align-middle text-accent" style="font-size:12px">02</span>{C.journal.title}
        </h2>
      </div>
      {preview.map((p) => <PieceRow piece={p} lang={lang} />)}
      <div class="border-t border-line"></div>
      <a href={`${base}/journal`} class="atl-meta mt-5 inline-flex items-center gap-2 border-b border-accent pb-0.5 text-[13px] text-accent">{C.journal.seeAll} →</a>
    </section>
  </main>
  <Footer lang={lang} />
</Base>
```

- [ ] **Step 3: Dev-render check**

Run: `pnpm --filter @johan-chan/site check` (PASS) then start dev (`pnpm --filter @johan-chan/site dev`) and confirm `/` and `/en/` render the hero, an interactive proof (buttons fire chips), and 3 journal rows with no horizontal scroll at 360px. Stop dev when done.

- [ ] **Step 4: Commit**

```bash
git add apps/site/src/pages/index.astro apps/site/src/pages/en/index.astro
git commit -m "feat(site): Atelier home page (FR + EN)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: Journal list + filters (FR + EN)

Port the Journal tab of `atelier-journal.jsx`: page title/sub, register toggles + tag picker, server-rendered list, client-side filtering (union OR on tags × intersection register), live count.

**Files:**
- Create: `apps/site/src/components/JournalFilters.astro`
- Create: `apps/site/src/pages/journal/index.astro`, `apps/site/src/pages/en/journal/index.astro`

- [ ] **Step 1: Create `JournalFilters.astro`** (register pills + tag picker; emits `atl:filter` is unnecessary — it filters the list directly by DOM)

```astro
---
import type { Lang } from '../i18n/ui';
import { copy, allTags, kindClass, type Kind } from '../data/atelier';
interface Props { lang: Lang; total: number }
const { lang, total } = Astro.props;
const C = copy[lang];
const tags = allTags(lang);
const regs: Kind[] = ['refl', 'design', 'impl'];
---
<div data-filters class="mt-6 flex flex-wrap items-center gap-x-[22px] gap-y-3 md:mt-8">
  <div class="flex flex-wrap items-center gap-2">
    {regs.map((r) => (
      <button type="button" data-reg={r} aria-pressed="false"
        class="atl-meta inline-flex items-center gap-[7px] rounded-full border border-line px-3 py-1.5 text-[12px] text-ink2">
        <span class={`h-[7px] w-[7px] rounded-full ${kindClass[r]}`} style="background: currentColor"></span>{C.kind[r]}
      </button>
    ))}
    <span data-tagsep hidden class="mx-1 h-5 w-px bg-line"></span>
    <span data-activetags class="contents"></span>
    <button type="button" data-tagopen
      class="atl-meta inline-flex items-center gap-[7px] whitespace-nowrap rounded-full border border-dashed border-line bg-surf px-3 py-1.5 text-[12px] text-ink2">
      <span style="font-size:13px;line-height:1">＋</span><span data-tagopenlabel>{lang === 'fr' ? 'Sélectionner des tags' : 'Select tags'}</span>
    </button>
  </div>
  <span data-count class="atl-meta text-faint md:ml-auto" style="font-size:11.5px">{total} {lang === 'fr' ? 'articles' : 'articles'}</span>
</div>

<!-- tag picker (popover desktop / sheet mobile) -->
<div data-picker hidden class="fixed inset-0 z-[70] bg-black/45 md:bg-transparent">
  <div data-pickerbox class="atl-sheet absolute inset-x-0 bottom-0 flex max-h-[82%] flex-col rounded-t-[20px] border-t border-line bg-bg
    md:inset-auto md:left-[56px] md:top-[200px] md:max-h-[420px] md:w-[320px] md:rounded-[14px] md:border md:shadow-[0_24px_60px_-20px_#000c]">
    <div class="flex items-center justify-between border-b border-line px-4 py-3.5">
      <span class="atl-meta uppercase text-ink2" style="letter-spacing:.12em">tags</span>
      <button type="button" data-pickerdone class="atl-meta rounded-full bg-accent px-4 py-1.5 text-accent-ink">{lang === 'fr' ? 'Terminé' : 'Done'}</button>
    </div>
    <div class="flex flex-wrap content-start gap-2 overflow-y-auto p-4">
      {tags.map((tg) => (
        <button type="button" data-tag={tg} aria-pressed="false"
          class="atl-meta inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[12px] text-ink2">#{tg.toLowerCase()}</button>
      ))}
    </div>
  </div>
</div>
<script is:inline define:vars={{ lang }}>
  const root = document.querySelector('[data-filters]');
  if (root) {
    const rows = [...document.querySelectorAll('[data-testid="piece-row"]')];
    const countEl = root.querySelector('[data-count]');
    const picker = document.querySelector('[data-picker]');
    const sel = new Set();
    let reg = null;
    const word = (n) => lang === 'fr' ? (n > 1 ? 'articles' : 'article') : (n === 1 ? 'article' : 'articles');

    const apply = () => {
      let n = 0;
      rows.forEach((row) => {
        const k = row.getAttribute('data-kind');
        const tgs = (row.getAttribute('data-tags') || '').split('|');
        const okReg = !reg || k === reg;
        const okTag = sel.size === 0 || tgs.some((t) => sel.has(t));
        const show = okReg && okTag;
        row.style.display = show ? '' : 'none';
        if (show) n++;
      });
      if (countEl) countEl.textContent = `${n} ${word(n)}`;
      root.querySelectorAll('[data-reg]').forEach((b) => {
        const on = b.getAttribute('data-reg') === reg;
        b.setAttribute('aria-pressed', String(on));
        b.style.opacity = reg && !on ? '.5' : '1';
        b.style.background = on ? 'var(--ink)' : 'transparent';
        b.style.color = on ? 'var(--bg)' : 'var(--ink2)';
        b.style.borderColor = on ? 'var(--ink)' : 'var(--line)';
      });
    };
    root.querySelectorAll('[data-reg]').forEach((b) =>
      b.addEventListener('click', () => { const r = b.getAttribute('data-reg'); reg = reg === r ? null : r; apply(); }));

    const sep = root.querySelector('[data-tagsep]');
    const active = root.querySelector('[data-activetags]');
    const renderActive = () => {
      active.innerHTML = '';
      sep.toggleAttribute('hidden', sel.size === 0);
      sel.forEach((tg) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'atl-meta inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1.5 text-[12px] text-accent-ink';
        b.innerHTML = `#${tg.toLowerCase()} <span style="opacity:.7">✕</span>`;
        b.addEventListener('click', () => { sel.delete(tg); syncPicker(); renderActive(); apply(); });
        active.appendChild(b);
      });
    };
    const syncPicker = () => picker?.querySelectorAll('[data-tag]').forEach((b) =>
      b.setAttribute('aria-pressed', String(sel.has(b.getAttribute('data-tag')))));
    picker?.querySelectorAll('[data-tag]').forEach((b) =>
      b.addEventListener('click', () => {
        const tg = b.getAttribute('data-tag');
        sel.has(tg) ? sel.delete(tg) : sel.add(tg);
        b.setAttribute('aria-pressed', String(sel.has(tg)));
        b.style.background = sel.has(tg) ? 'var(--ink)' : 'transparent';
        b.style.color = sel.has(tg) ? 'var(--accent-ink)' : 'var(--ink2)';
        renderActive(); apply();
      }));
    const open = (o) => picker?.toggleAttribute('hidden', !o);
    root.querySelector('[data-tagopen]')?.addEventListener('click', () => open(true));
    picker?.querySelector('[data-pickerdone]')?.addEventListener('click', () => open(false));
    picker?.addEventListener('click', (e) => { if (e.target === picker) open(false); });
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') open(false); });
    apply();
  }
</script>
```

- [ ] **Step 2: Create `pages/journal/index.astro`**

```astro
---
import Base from '../../layouts/Base.astro';
import Header from '../../components/Header.astro';
import Footer from '../../components/Footer.astro';
import PieceRow from '../../components/PieceRow.astro';
import JournalFilters from '../../components/JournalFilters.astro';
import { copy, piecesByDate } from '../../data/atelier';
import type { Lang } from '../../i18n/ui';
const lang: Lang = 'fr';
const C = copy[lang];
const list = piecesByDate();
---
<Base lang={lang} title={`${C.journal.title} — ${C.name}`}>
  <Header lang={lang} current="journal" />
  <main class="atl-container pb-16 md:pb-24">
    <section class="pt-9 md:pt-14">
      <h1 class="atl-page-title m-0 text-ink">{C.journal.title}</h1>
      <p class="atl-body mt-3.5 max-w-[620px] text-ink2 md:text-[16.5px]">{C.journal.sub}</p>
      <JournalFilters lang={lang} total={list.length} />
      <div class="mt-2.5 md:mt-3.5">
        {list.map((p) => <PieceRow piece={p} lang={lang} />)}
        <div class="border-t border-line"></div>
      </div>
    </section>
  </main>
  <Footer lang={lang} />
</Base>
```

- [ ] **Step 3: Create `pages/en/journal/index.astro`** — identical but `const lang: Lang = 'en';` (import paths already at `../../`).

```astro
---
import Base from '../../../layouts/Base.astro';
import Header from '../../../components/Header.astro';
import Footer from '../../../components/Footer.astro';
import PieceRow from '../../../components/PieceRow.astro';
import JournalFilters from '../../../components/JournalFilters.astro';
import { copy, piecesByDate } from '../../../data/atelier';
import type { Lang } from '../../../i18n/ui';
const lang: Lang = 'en';
const C = copy[lang];
const list = piecesByDate();
---
<Base lang={lang} title={`${C.journal.title} — ${C.name}`}>
  <Header lang={lang} current="journal" />
  <main class="atl-container pb-16 md:pb-24">
    <section class="pt-9 md:pt-14">
      <h1 class="atl-page-title m-0 text-ink">{C.journal.title}</h1>
      <p class="atl-body mt-3.5 max-w-[620px] text-ink2 md:text-[16.5px]">{C.journal.sub}</p>
      <JournalFilters lang={lang} total={list.length} />
      <div class="mt-2.5 md:mt-3.5">
        {list.map((p) => <PieceRow piece={p} lang={lang} />)}
        <div class="border-t border-line"></div>
      </div>
    </section>
  </main>
  <Footer lang={lang} />
</Base>
```

- [ ] **Step 4: Dev-render check** — `/journal` and `/en/journal`: register pills filter, tag picker opens (sheet on mobile / popover on desktop), count updates, no horizontal scroll at 360px.

- [ ] **Step 5: Commit**

```bash
git add apps/site/src/components/JournalFilters.astro apps/site/src/pages/journal/index.astro apps/site/src/pages/en/journal/index.astro
git commit -m "feat(site): journal list with client-side register/tag filters (FR + EN)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: Projets list (FR + EN)

**Files:**
- Create: `apps/site/src/pages/projets/index.astro`, `apps/site/src/pages/en/projets/index.astro`

- [ ] **Step 1: Create `pages/projets/index.astro`**

```astro
---
import Base from '../../layouts/Base.astro';
import Header from '../../components/Header.astro';
import Footer from '../../components/Footer.astro';
import ProjectCard from '../../components/ProjectCard.astro';
import { copy, projects } from '../../data/atelier';
import type { Lang } from '../../i18n/ui';
const lang: Lang = 'fr';
const C = copy[lang];
const n = projects.length;
const word = lang === 'fr' ? (n > 1 ? 'projets' : 'projet') : (n > 1 ? 'projects' : 'project');
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

- [ ] **Step 2: Create `pages/en/projets/index.astro`** — same with `../../../` paths and `const lang: Lang = 'en';`.

```astro
---
import Base from '../../../layouts/Base.astro';
import Header from '../../../components/Header.astro';
import Footer from '../../../components/Footer.astro';
import ProjectCard from '../../../components/ProjectCard.astro';
import { copy, projects } from '../../../data/atelier';
import type { Lang } from '../../../i18n/ui';
const lang: Lang = 'en';
const C = copy[lang];
const n = projects.length;
const word = lang === 'fr' ? (n > 1 ? 'projets' : 'projet') : (n > 1 ? 'projects' : 'project');
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

- [ ] **Step 3: Commit**

```bash
git add apps/site/src/pages/projets/index.astro apps/site/src/pages/en/projets/index.astro
git commit -m "feat(site): projects list (FR + EN)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 10: Article detail route (FR + EN)

Port `atelier-reader.jsx` as a real page. `getStaticPaths` over `pieces` by slug.

**Files:**
- Create: `apps/site/src/pages/journal/[slug].astro`, `apps/site/src/pages/en/journal/[slug].astro`

- [ ] **Step 1: Create `pages/journal/[slug].astro`**

```astro
---
import Base from '../../layouts/Base.astro';
import Header from '../../components/Header.astro';
import Footer from '../../components/Footer.astro';
import Proof from '../../components/Proof.astro';
import Ph from '../../components/Ph.astro';
import { pieces, copy, fmtDate, relatedPieces, kindClass } from '../../data/atelier';
import type { Lang } from '../../i18n/ui';

export function getStaticPaths() {
  return pieces.map((p) => ({ params: { slug: p.slug }, props: { id: p.id } }));
}
const lang: Lang = 'fr';
const { id } = Astro.props;
const piece = pieces.find((p) => p.id === id)!;
const c = piece[lang]; const C = copy[lang];
const hue = kindClass[piece.kind];
const isImpl = piece.kind === 'impl';
const related = relatedPieces(piece, lang);
const base = lang === 'fr' ? '' : '/en';
const lede = lang === 'fr'
  ? 'Le quoi, le pourquoi, puis le comment, jusqu’au code. Pour les implémentations, une démo qu’on manipule sans quitter la lecture.'
  : 'The what, the why, then the how, down to the code. For implementations, a demo you can play with without leaving the page.';
const para2 = lang === 'fr'
  ? 'On manipule, on comprend, on continue. C’est le moteur qui tourne aussi dans le produit livré.'
  : 'You handle it, you get it, you move on. It’s the same engine that ships in the product.';
const repo = piece.fil ? piece.fil.en.toLowerCase().replace(/\s+/g, '-') : 'project';
---
<Base lang={lang} title={`${c.title} — ${C.name}`}>
  <Header lang={lang} current="journal" />
  <main class="atl-container atl-rise pb-16 md:pb-24">
    <article class="mx-auto max-w-[880px] pt-8 md:pt-10">
      <div class="mb-6 flex items-center justify-between">
        <a href={`${base}/journal`} class="atl-meta inline-flex items-center gap-2 text-ink2" style="font-size:12px">{C.reader.back}</a>
        <span class={`atl-meta inline-flex items-center gap-2 uppercase ${hue}`} style="font-size:11px;letter-spacing:.1em">
          <span class="h-[7px] w-[7px] rounded-full" style="background: currentColor"></span>{C.kind[piece.kind]}
        </span>
      </div>
      {piece.fil && (
        <div class={`atl-meta mb-3.5 uppercase ${hue}`} style="font-size:11px;letter-spacing:.08em">{C.series} · {piece.fil[lang]}, {C.chapter} {piece.filPart}</div>
      )}
      <h1 class="font-display text-[30px] font-bold leading-[1.04] tracking-[-.03em] text-ink md:text-[42px]" style="text-wrap:balance">{c.title}</h1>
      <div class="atl-meta my-5 flex flex-wrap items-center gap-3.5 text-faint" style="font-size:11.5px">
        <span>{fmtDate(piece.date, lang)}</span><span>·</span><span>{piece.read} {C.read}</span><span>·</span>
        <span class="flex gap-2">{c.tags.map((tg) => <span class="text-ink2">#{tg.toLowerCase()}</span>)}</span>
      </div>
      <p class="m-0 mb-1.5 font-text text-[17px] font-medium leading-[1.55] text-ink md:text-[19px]">{lede}</p>
      <Ph n={3} />
      {isImpl && (
        <figure class="my-7 overflow-hidden rounded-[14px] border border-line bg-surf">
          <figcaption class="atl-meta flex items-center gap-2 border-b border-line px-3.5 py-2.5 text-ink2" style="font-size:11px">
            <span class="h-[7px] w-[7px] rounded-full bg-accent" style="box-shadow:0 0 7px var(--accent)"></span>{C.reader.demoInline}
          </figcaption>
          <div class="p-4"><Proof lang={lang} /></div>
        </figure>
      )}
      <p class="mt-1 font-text text-[15.5px] leading-[1.7] text-ink2 md:text-[16.5px]">{para2}</p>
      <Ph n={2} w="48%" />
      {isImpl && (
        <div class="mt-7 flex items-center justify-between gap-3 rounded-[12px] border border-line bg-surf px-4 py-4">
          <span class="flex min-w-0 items-center gap-3">
            <span class="font-mono text-[17px] text-ink2">{'{ }'}</span>
            <span class="min-w-0">
              <span class="atl-meta block uppercase text-faint" style="font-size:10.5px;letter-spacing:.1em">{C.reader.source}</span>
              <span class="mt-0.5 block font-mono text-[13.5px] text-ink">github.com/johanchan/{repo}</span>
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
              <a href={`${base}/journal/${rp.slug}`} class="atl-row block rounded-[11px] border border-line bg-surf px-3.5 py-3.5">
                <span class={`atl-meta inline-flex items-center gap-[7px] uppercase ${kindClass[rp.kind]}`} style="font-size:10px;letter-spacing:.08em">
                  <span class="h-1.5 w-1.5 rounded-full" style="background: currentColor"></span>{C.kind[rp.kind]}
                </span>
                <span class="mt-2 block font-display text-[17px] font-medium leading-[1.16] text-ink" style="text-wrap:pretty">{rp[lang].title}</span>
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

- [ ] **Step 2: Create `pages/en/journal/[slug].astro`** — same file with `../../../` import paths and `const lang: Lang = 'en';`. (Copy Step 1, change the four import path prefixes from `../../` to `../../../` and set `lang = 'en'`.)

- [ ] **Step 3: Type-check + dev-render**

Run: `pnpm --filter @johan-chan/site check` (PASS). Dev: visit `/journal/editeur-code-navigateur-zero-dependance` (impl → has inline proof + source block + read-next) and `/journal/versionner-ses-decisions` (refl → no proof). Confirm EN equivalents at `/en/journal/...`.

- [ ] **Step 4: Commit**

```bash
git add apps/site/src/pages/journal/\[slug\].astro apps/site/src/pages/en/journal/\[slug\].astro
git commit -m "feat(site): article detail route /journal/[slug] (FR + EN)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 11: Case study detail route (FR + EN)

Port `atelier-case.jsx` as a real page.

**Files:**
- Create: `apps/site/src/pages/projets/[slug].astro`, `apps/site/src/pages/en/projets/[slug].astro`

- [ ] **Step 1: Create `pages/projets/[slug].astro`**

```astro
---
import Base from '../../layouts/Base.astro';
import Header from '../../components/Header.astro';
import Footer from '../../components/Footer.astro';
import Proof from '../../components/Proof.astro';
import { projects, pieces, copy, kindClass } from '../../data/atelier';
import type { Lang } from '../../i18n/ui';

export function getStaticPaths() {
  return projects.map((pr) => ({ params: { slug: pr.slug }, props: { id: pr.id } }));
}
const lang: Lang = 'fr';
const { id } = Astro.props;
const project = projects.find((p) => p.id === id)!;
const c = project[lang]; const C = copy[lang];
const base = lang === 'fr' ? '' : '/en';
const related = project.relatedIds.map((rid) => pieces.find((p) => p.id === rid)!).filter(Boolean);
---
<Base lang={lang} title={`${c.name} — ${C.name}`}>
  <Header lang={lang} current="work" />
  <main class="atl-container atl-rise pb-16 md:pb-24">
    <article class="mx-auto max-w-[880px] pt-8 md:pt-10">
      <div class="mb-6 flex items-center justify-between">
        <a href={`${base}/projets`} class="atl-meta inline-flex items-center gap-2 text-ink2" style="font-size:12px">{C.caseStudy.back}</a>
        <span class="atl-meta rounded-full border border-accent px-2.5 uppercase text-accent" style="font-size:10.5px;letter-spacing:.12em">{C.projects.badge}</span>
      </div>
      <h1 class="font-display text-[32px] font-bold leading-[1.02] tracking-[-.03em] text-ink md:text-[46px]">{c.name}</h1>
      <p class="atl-body mt-3.5 mb-6 max-w-[620px] text-ink2 md:text-[19px]" style="line-height:1.5">{c.oneliner}</p>
      <div class="flex flex-wrap gap-x-10 gap-y-4 border-y border-line py-4">
        <div>
          <div class="atl-meta mb-1.5 uppercase text-faint" style="font-size:10px;letter-spacing:.12em">{lang === 'fr' ? 'rôle' : 'role'}</div>
          <div class="atl-meta text-ink" style="font-size:12.5px">{c.role}</div>
        </div>
        <div>
          <div class="atl-meta mb-1.5 uppercase text-faint" style="font-size:10px;letter-spacing:.12em">{lang === 'fr' ? 'année' : 'year'}</div>
          <div class="atl-meta text-ink" style="font-size:12.5px">{project.year}</div>
        </div>
        <div>
          <div class="atl-meta mb-1.5 uppercase text-faint" style="font-size:10px;letter-spacing:.12em">stack</div>
          <div class="atl-meta text-ink" style="font-size:12.5px">{project.stack.join(' · ')}</div>
        </div>
      </div>
      <div class="mt-6 flex h-[180px] items-end rounded-[12px] border border-line bg-bg2 p-3 md:h-[300px]"
        style="background-image: repeating-linear-gradient(135deg, var(--hair) 0 1px, transparent 1px 9px)">
        <span class="atl-meta uppercase text-faint" style="font-size:10.5px;letter-spacing:.1em">{lang === 'fr' ? 'visuel du projet' : 'project visual'}</span>
      </div>
      <div class="mt-7">
        {c.story.map((para, i) => (
          <p class={`mb-4 max-w-[660px] font-text text-[16.5px] leading-[1.7] md:text-[18px] ${i === 0 ? 'font-medium text-ink' : 'text-ink2'}`}>{para}</p>
        ))}
      </div>
      {project.demo && (
        <figure class="mt-7 overflow-hidden rounded-[14px] border border-line bg-surf">
          <figcaption class="atl-meta flex items-center gap-2 border-b border-line px-3.5 py-2.5 text-ink2" style="font-size:11px">
            <span class="h-[7px] w-[7px] rounded-full bg-accent" style="box-shadow:0 0 7px var(--accent)"></span>{C.caseStudy.demo}
          </figcaption>
          <div class="p-4"><Proof lang={lang} /></div>
        </figure>
      )}
      {related.length > 0 && (
        <div class="mt-9 border-t border-line pt-5">
          <div class="atl-meta mb-1.5 uppercase text-ink2" style="font-size:11px;letter-spacing:.12em">{C.caseStudy.whatHelped}</div>
          <p class="font-text text-[14px] text-faint" style="margin:0 0 16px">{C.caseStudy.whatHelpedSub}</p>
          <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
            {related.map((rp) => (
              <a href={`${base}/journal/${rp.slug}`} class="atl-row block rounded-[11px] border border-line bg-surf px-3.5 py-3.5">
                <span class={`atl-meta inline-flex items-center gap-[7px] uppercase ${kindClass[rp.kind]}`} style="font-size:10px;letter-spacing:.08em">
                  <span class="h-1.5 w-1.5 rounded-full" style="background: currentColor"></span>{C.kind[rp.kind]}
                </span>
                <span class="mt-2 block font-display text-[17px] font-medium leading-[1.16] text-ink" style="text-wrap:pretty">{rp[lang].title}</span>
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

- [ ] **Step 2: Create `pages/en/projets/[slug].astro`** — copy Step 1, change import prefixes `../../` → `../../../`, set `lang = 'en'`.

- [ ] **Step 3: Type-check + dev-render**

Run: `pnpm --filter @johan-chan/site check` (PASS). Dev: `/projets/atelier-wasm` shows meta, striped visual, 4-paragraph story, live demo, "ce qui a aidé" links; EN at `/en/projets/atelier-wasm`.

- [ ] **Step 4: Commit**

```bash
git add apps/site/src/pages/projets/\[slug\].astro apps/site/src/pages/en/projets/\[slug\].astro
git commit -m "feat(site): case study route /projets/[slug] (FR + EN)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 12: About page (FR + EN)

Port `atelier-about.jsx`.

**Files:**
- Create: `apps/site/src/pages/about.astro`, `apps/site/src/pages/en/about.astro`

- [ ] **Step 1: Create `pages/about.astro`**

```astro
---
import Base from '../layouts/Base.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import { copy } from '../data/atelier';
import type { Lang } from '../i18n/ui';
const lang: Lang = 'fr';
const C = copy[lang]; const A = C.about;
const base = lang === 'fr' ? '' : '/en';
---
<Base lang={lang} title={`${A.kicker} — ${C.name}`}>
  <Header lang={lang} current="about" />
  <main class="atl-container pb-16 md:pb-24">
    <section class="pt-10 md:pt-[60px]">
      <h1 class="atl-lede m-0 max-w-[820px] text-ink">{A.lede}</h1>
      <p class="atl-body mt-4 max-w-[820px] text-ink2 md:mt-[22px] md:text-[18px]" style="line-height:1.6">{A.intro}</p>
      <div class="mt-6 flex h-[160px] items-end rounded-[14px] border border-line bg-bg2 p-3 md:mt-8 md:h-[220px]"
        style="background-image: repeating-linear-gradient(135deg, var(--hair) 0 1px, transparent 1px 9px)">
        <span class="atl-meta uppercase text-faint" style="font-size:10.5px;letter-spacing:.1em">{A.portrait}</span>
      </div>
    </section>

    <section class="mt-10 border-t border-line pt-10 md:mt-14 md:pt-14">
      <h2 class="atl-h2 mb-4.5 text-ink" style="margin-bottom:18px">{A.defTitle}</h2>
      <div class="flex flex-col gap-[22px]">
        {A.def.map(([h, b, slug, linkLabel], i) => (
          <div class="grid grid-cols-1 gap-1.5 md:grid-cols-[20px_1fr] md:gap-4.5">
            <span class="atl-meta pt-1 text-accent" style="font-size:12px">0{i + 1}</span>
            <div>
              <h3 class="m-0 mb-1.5 font-display text-[17px] font-semibold text-ink md:text-[19px]">{h}</h3>
              <p class="atl-body m-0 max-w-[820px] text-ink2" style="line-height:1.6">{b}</p>
              <a href={`${base}/journal/${slug}`} class="atl-meta mt-2.5 inline-block border-b border-accent pb-px text-accent" style="font-size:12px">{linkLabel} →</a>
            </div>
          </div>
        ))}
      </div>
    </section>

    <section class="mt-10 border-t border-line pt-10 md:mt-14 md:pt-14">
      <h2 class="atl-h2 mb-4 text-ink">{A.aiTitle}</h2>
      <p class="m-0 max-w-[820px] font-text text-[16px] font-medium leading-[1.65] text-ink md:text-[18px]">{A.ai}</p>
    </section>

    <section class="mt-10 border-t border-line pt-10 md:mt-14 md:pt-14">
      <h2 class="atl-h2 mb-4 text-ink">{A.openTitle}</h2>
      <p class="m-0 max-w-[820px] font-text text-[15.5px] leading-[1.65] text-ink2 md:text-[17px]">{A.open}</p>
      <a href={`${base}/journal`} class="atl-meta mt-3.5 inline-block border-b border-accent pb-px text-accent" style="font-size:12px">{A.readMore} →</a>
    </section>
  </main>
  <Footer lang={lang} />
</Base>
```

- [ ] **Step 2: Create `pages/en/about.astro`** — copy Step 1, change import prefixes `../` → `../../`, set `lang = 'en'`.

- [ ] **Step 3: Type-check + dev-render**

Run: `pnpm --filter @johan-chan/site check` (PASS). Dev: `/about` and `/en/about` — lede, portrait placeholder, 3 numbered points each linking to an article, AI + open sections.

- [ ] **Step 4: Commit**

```bash
git add apps/site/src/pages/about.astro apps/site/src/pages/en/about.astro
git commit -m "feat(site): about page (FR + EN)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 13: Update tests + full verification

**Files:**
- Modify: `apps/site/tests/smoke.spec.ts`

- [ ] **Step 1: Rewrite `tests/smoke.spec.ts`**

```ts
import { test, expect } from '@playwright/test';

test('FR home renders hero + desktop nav + lang=fr', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.getByTestId('hero')).toContainText('end to end' === '' ? '' : 'bout en bout');
  await expect(page.getByTestId('nav-desktop')).toContainText('Journal');
});

test('EN home renders at /en/ with lang=en', async ({ page }) => {
  await page.goto('/en/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByTestId('nav-desktop')).toContainText('About');
});

test('language switch links FR home to EN home', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('lang-switch')).toHaveAttribute('href', '/en/');
});

test('theme toggle switches and persists across reload', async ({ page }) => {
  await page.goto('/');
  const html = page.locator('html');
  const before = await html.getAttribute('data-theme');
  await page.getByTestId('theme-toggle').click();
  const after = await html.getAttribute('data-theme');
  expect(after).not.toBe(before);
  expect(after, 'theme-toggle must set a data-theme value').toBeTruthy();
  expect(['atelier-light', 'atelier-dark']).toContain(after);
  await page.reload();
  await expect(html).toHaveAttribute('data-theme', after!);
});

test('journal list renders all pieces and filters by register', async ({ page }) => {
  await page.goto('/journal');
  const rows = page.getByTestId('piece-row');
  await expect(rows.first()).toBeVisible();
  const total = await rows.count();
  expect(total).toBeGreaterThanOrEqual(5);
  // click the "Design" register pill → fewer visible rows
  await page.locator('[data-reg="design"]').click();
  const visible = await page.locator('[data-testid="piece-row"]:visible').count();
  expect(visible).toBeLessThan(total);
});

test('article detail page renders title and back link', async ({ page }) => {
  await page.goto('/journal/editeur-code-navigateur-zero-dependance');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('éditeur');
  await expect(page.locator('article')).toContainText('le journal');
});

test('case study page renders story and demo', async ({ page }) => {
  await page.goto('/projets/atelier-wasm');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Atelier WASM');
  await expect(page.locator('[data-proof]')).toBeVisible();
});

test('demo MDX page still renders the Callout component', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByRole('heading', { name: 'Démo MDX', level: 1 })).toBeVisible();
  await expect(page.getByTestId('callout')).toBeVisible();
});
```

> Note: the FR hero assertion checks for `'bout en bout'` (in `C.hero.line`). Keep it as `await expect(page.getByTestId('hero')).toContainText('bout en bout');` — the ternary above is a transcription guard; replace that line with the plain assertion.

Replace the first test's hero line with exactly:
```ts
  await expect(page.getByTestId('hero')).toContainText('bout en bout');
```

- [ ] **Step 2: Run unit tests**

Run: `pnpm --filter @johan-chan/site test:unit`
Expected: PASS (i18n + atelier-data).

- [ ] **Step 3: Run E2E**

Run: `pnpm --filter @johan-chan/site test:e2e`
Expected: PASS (all 8 specs). If Playwright browsers aren't installed: `pnpm --filter @johan-chan/site exec playwright install chromium` first.

- [ ] **Step 4: Type-check + production build**

Run: `pnpm --filter @johan-chan/site check && pnpm --filter @johan-chan/site build`
Expected: both PASS; build emits `/`, `/en/`, `/journal`, `/en/journal`, `/journal/<5 slugs>` (+ en), `/projets`, `/projets/atelier-wasm` (+ en), `/about` (+ en).

- [ ] **Step 5: Commit**

```bash
git add apps/site/tests/smoke.spec.ts
git commit -m "test(site): rewrite smoke suite for Atelier structure

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Self-Review (completed during plan authoring)

**Spec coverage:** tokens/fonts (T1) · data module + copy (T2) · lang switch (T3) · header/footer/mobile-nav/lang/theme (T4) · interactive proof (T5) · rows/cards/placeholder (T6) · home (T7) · journal list + filters (T8) · projets list (T9) · article route (T10) · case route (T11) · about (T12) · tests/build (T13). All spec sections map to a task.

**Placeholder scan:** no TBD/TODO; the one transcription-guard ternary in T13 Step 1 is explicitly corrected in the same step.

**Type consistency:** `Piece`/`Project`/`Kind`/`Copy` defined in T2 and consumed verbatim in T6–T12; helpers `piecesByDate`/`relatedPieces`/`allTags`/`fmtDate`/`kindClass`/`kindLabel`/`copy`/`CONTACT_EMAIL` defined in T2 and referenced by exact name later; `getSiblingLocalePath` defined T3, used T4 (`LangSwitch`); `data-testid` names (`hero`, `nav-desktop`, `lang-switch`, `theme-toggle`, `piece-row`, `project-card`, `logo`) consistent between components and T13 tests; `data-theme` values `atelier-light`/`atelier-dark` consistent across Base/ThemeToggle/tests.

**Known follow-ups (out of scope, per spec):** real article bodies/images, MDX migration, self-hosted fonts, per-page SEO/OG, A11y hardening, second project.
