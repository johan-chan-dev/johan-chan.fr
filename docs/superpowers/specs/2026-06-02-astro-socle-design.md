# Socle Astro (`apps/site`) — design

> Sous-projet n°1 de la note [2026-06-01-content-taxonomy-and-platform-revamp].
> Objectif : poser une fondation Astro **locale**, **locale-aware**, **sans framework UI**,
> sur laquelle les tranches suivantes (contenu, i18n EN, charts, nav/home) se poseront.

## Principe directeur (vaut pour toutes les tranches)

**Vanilla-first, frameworks UI opportunistes.** Le chrome du site se fait en composants
`.astro` purs ; les besoins client légers (toggle thème, menu) en `<script>` vanilla. Un
framework UI (Svelte) n'est intégré que lorsqu'un composant de **contenu** a un vrai besoin
réactif (charts layercake, démos interactives) — jamais pour envelopper du vanilla, ce qui
n'ajoute que de la complexité. Le socle n'a aucun de ces besoins → **pur Astro**.

## Périmètre

Dans le socle :
- App Astro `apps/site` dans le monorepo (Turbo + pnpm workspace), coexistant avec `apps/web`.
- Tailwind 4 + DaisyUI 5 (thèmes `autumn`/`abyss`).
- i18n **natif Astro** (routing) + dictionnaire UI (`ui.ts`) ; FR à `/`, EN à `/en/`.
- App shell locale-aware + toggle thème vanilla.
- Pipeline MDX prouvé via un composant `.astro` statique.
- Harness de test (Vitest + un smoke Playwright).
- **Local uniquement** (`pnpm dev` / `build`).

Hors socle (tranches ultérieures) : intégration Svelte/îlots (charts, démos) · schéma
`registre`/`fil` + content collections complètes · traductions EN réelles · pipeline images
`astro:assets` · nav / home H2 / SEO / sitemap / redirects · migration de contenu · Vercel.

## Versions (dernières, fact-checkées npm le 2026-06-02)

| Paquet | Version | Note |
|---|---|---|
| astro | 6.4.2 | output statique, **sans adapter** |
| @astrojs/mdx | 6.0.1 | |
| @astrojs/check + typescript | 0.9.9 | `check` |
| tailwindcss | 4.3.0 | via `@tailwindcss/vite` |
| daisyui | 5.5.20 | `@plugin` CSS |
| vitest | 4.1.8 | |
| @playwright/test | 1.60.0 | |
| Node | 22.12.0 | conforme `.nvmrc` |

Pas de `@astrojs/svelte`, pas de `@inlang/paraglide-js` dans le socle.

## Structure

```
apps/site/
├── astro.config.mjs
├── package.json            # @johan-chan/site
├── tsconfig.json
├── src/
│   ├── styles/global.css   # @import "tailwindcss"; @plugin "daisyui" { themes }
│   ├── i18n/
│   │   ├── ui.ts           # dictionnaire { fr, en } (issu de messages/fr.json)
│   │   └── utils.ts        # getLangFromUrl(url), useTranslations(lang)
│   ├── layouts/
│   │   └── Base.astro      # <html lang>, <head>, slot ; toggle thème inline
│   ├── components/
│   │   ├── ThemeToggle.astro   # <script> vanilla : localStorage + data-theme
│   │   └── Callout.astro       # composant statique, utilisé en MDX (preuve pipeline)
│   └── pages/
│       ├── index.astro     # FR, à /
│       ├── en/index.astro  # EN, à /en/
│       └── demo.mdx        # importe Callout → prouve MDX + composant
└── tests/
    ├── i18n.test.ts        # Vitest : useTranslations (clé connue + fallback défaut)
    └── smoke.spec.ts       # Playwright : /, /en/ rendent ; toggle thème persiste
```

## Détails de conception

### astro.config.mjs
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
    routing: { prefixDefaultLocale: false }, // FR à /, EN à /en/
  },
  vite: { plugins: [tailwindcss()] },
});
```

### Styles (`global.css`)
```css
@import "tailwindcss";
@plugin "daisyui" {
  themes: autumn --default, abyss --prefersdark;
}
```

### i18n (natif + dictionnaire)
- `ui.ts` : `languages`, `defaultLang = 'fr'`, `ui = { fr: {...}, en: {...} } as const`.
  Les clés FR proviennent de `apps/web/messages/fr.json` (reformatage mécanique).
- `utils.ts` : `getLangFromUrl(url)` lit le segment de locale ; `useTranslations(lang)`
  renvoie `t(key)` avec fallback sur `defaultLang`.
- Routing assuré par `astro:i18n` (pages `index.astro` + `en/index.astro`). Helpers
  `getRelativeLocaleUrl` pour les liens cross-locale.

### Toggle thème (vanilla)
`<script>` inline dans `Base.astro` : lit `localStorage.theme` (défaut via
`prefers-color-scheme`), applique `data-theme` sur `<html>`, persiste au clic. Inline pour
éviter le FOUC. Aucun framework.

### MDX
`demo.mdx` importe `Callout.astro` et l'utilise dans le corps → prouve que le pipeline
contenu-avec-composant fonctionne en statique. (L'hydratation d'îlot est différée à la
tranche qui introduira Svelte.)

## Tests (intégration-first, léger)
- **Vitest** sur les fonctions pures i18n : `useTranslations('fr')('nav.about')` rend la bonne
  valeur ; une clé absente en EN retombe sur FR (défaut).
- **Playwright** smoke : `/` répond et affiche une string FR ; `/en/` répond ; le toggle de
  thème bascule `data-theme` et persiste après reload.

## Definition of Done
- [ ] `pnpm --filter @johan-chan/site dev` et `build` passent en local.
- [ ] `/` (FR) et `/en/` rendent, `<html lang>` correct par locale.
- [ ] Une string vient de `ui.ts` via `useTranslations`.
- [ ] Toggle thème autumn↔abyss fonctionnel et persistant (vanilla).
- [ ] `demo.mdx` rend en intégrant `Callout.astro`.
- [ ] Tests Vitest + smoke Playwright verts ; `apps/web` intouchée.

## Questions ouvertes (différées)
- Rendu de code (shiki intégré Astro) : à câbler quand le contenu en aura besoin.
- Reformatage `messages/fr.json` → `ui.ts` : manuel ou petit script ? (tranche, pas socle.)
