# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Product Context

This is **Johan Chan's personal website platform** (V2.0.0) - a bilingual Activity Feed / Personal Changelog website.

**Tagline:** "Ce que je pense. Ce que j'apprends."

**Key principle:** This repository manages the TECHNICAL PLATFORM (how to publish), not content (what to publish). Product documentation lives at `.le-foyer-product/` (symlinked to Le Foyer du Craft system).

**Live site:** https://www.johan-chan.fr
**Repository:** https://github.com/johan-chan-dev/johan-chan.fr (private)
**Deployment:** GitHub Actions → Vercel (pre-built)

## Monorepo Structure

This is a **Turbo + pnpm workspaces** monorepo:

```
johan-chan.fr/
├── apps/
│   └── web/                    # Public Activity Feed (SvelteKit app)
│       ├── src/
│       ├── static/
│       ├── messages/           # i18n translations
│       ├── tests/              # Unit, integration, e2e tests
│       └── package.json
├── packages/
│   ├── content-schema/         # Shared Zod schemas, TypeScript types
│   │   ├── src/
│   │   └── package.json
│   └── cv-generator/           # CV HTML/PDF generator (Handlebars + Playwright)
│       ├── src/
│       ├── templates/
│       └── package.json
├── data/
│   └── cv-generator/           # CV data, config, photo, generated output
│       ├── johan-chan.json      # CV content (edit this to update CV)
│       └── output/             # Generated HTML + PDF
├── package.json                # Root workspace config
├── pnpm-workspace.yaml
├── turbo.json
└── .nvmrc                      # Node 22.12.0 required
```

## Essential Commands

### Root (Turbo)
```bash
pnpm dev              # Start all apps in dev mode
pnpm build            # Build all packages and apps
pnpm dev:web          # Start only web app (--host, sans dev-proxy)
pnpm build:web        # Build only web app
pnpm check:web        # Type check web app
```

### Web App (apps/web)
```bash
pnpm --filter @johan-chan/web dev        # Start dev server
pnpm --filter @johan-chan/web build      # Production build
pnpm --filter @johan-chan/web check      # Type checking
pnpm --filter @johan-chan/web lint       # ESLint + Prettier
pnpm --filter @johan-chan/web format     # Auto-format
```

### Testing
```bash
pnpm --filter @johan-chan/web test:unit        # Vitest unit tests
pnpm --filter @johan-chan/web test:integration # Integration tests (requires Mailpit)
pnpm --filter @johan-chan/web test:e2e         # Playwright E2E
pnpm --filter @johan-chan/web test:all         # All tests
```

### Content Schema Package
```bash
pnpm --filter @johan-chan/content-schema build  # Build TypeScript
pnpm --filter @johan-chan/content-schema dev    # Watch mode
```

### CV Generator ([README](packages/cv-generator/README.md))
```bash
pnpm --filter @johan-chan/cv-generator build      # Build TypeScript
pnpm --filter @johan-chan/cv-generator generate   # Generate HTML + PDF from data/cv-generator/
```
Pour modifier le CV : éditer `data/cv-generator/johan-chan.json` puis relancer `generate`.

## Architecture Overview

### Tech Stack
- **Turbo** - Monorepo build orchestration
- **pnpm workspaces** - Package management
- **SvelteKit 5** with `@sveltejs/adapter-vercel` (SSR + static)
- **Svelte 5.34** with runes ($state, $derived, $props)
- **Vite 7** build tool
- **Tailwind CSS 4** + DaisyUI 5
- **TypeScript 5.8** (strict mode)
- **Paraglide JS** for bilingual i18n (FR primary, EN secondary)
- **Zod** - Runtime validation in shared package

### Shared Package: @johan-chan/content-schema

Content types for the Activity Feed:
- `article` - Long-form articles/essays
- `série` - Multi-part series (chapters)
- `devlog` - Development logs for projects
- `post` - Short-form posts (can link to external)

Schema location: `packages/content-schema/src/schema.ts`

### Web App Routes (apps/web)

```
src/routes/
├── +layout.svelte                # Root layout (navbar, footer, SEO)
├── +page.svelte                  # Homepage (Activity Feed)
├── articles/+page.svelte         # Articles filter view
├── series/+page.svelte           # Series grouped view
├── devlogs/+page.svelte          # Devlogs grouped view
├── about/+page.svelte            # Minimal about page
├── contact/+page.svelte          # Contact form
├── blogs/                        # Legacy blog routes (to be migrated)
└── sitemap.xml/+server.ts        # Dynamic sitemap
```

### Navigation Structure
```
Johan Chan    Tout | Articles | Séries | Devlogs    À propos
```

### i18n Routing
- **French (primary):** Base URL `/`
- **English:** Prefix `/en/`
- Messages in `apps/web/messages/fr.json` and `apps/web/messages/en.json`
- Usage: `import * as m from '$lib/paraglide/messages'`

## Content Item Schema

```yaml
---
type: article | série | devlog | post    # required
title: string                           # required
date: YYYY-MM-DD                        # required
excerpt: string                         # required (for feed display)
slug: string                            # for on-site content
external_url: string                    # for external links
parent: string                          # for series/devlog grouping
order: number                           # position in series
tags: string[]                          # optional categorization
published: boolean                      # false = not prerendered, absent from feed
preview: boolean                        # true = prerendered but hidden from public feed
---
```

### États de publication

| `published` | `preview` | Comportement |
|-------------|-----------|--------------|
| `true`      | absent    | Visible publiquement |
| `true`      | `true`    | Prérenderé, masqué du feed, accessible via `?preview=<key>` |
| `false`     | absent    | Pas prérenderé → 404 |

## Key Files

### Content Schema
- `packages/content-schema/src/schema.ts` - Zod schemas
- `packages/content-schema/src/types.ts` - TypeScript types

### Web App Components
- `apps/web/src/lib/components/ContentFeed.svelte` - Main feed component
- `apps/web/src/lib/components/ContentItem.svelte` - Individual item card
- `apps/web/src/lib/utils/content.ts` - Content loading utilities

### Configuration
- `turbo.json` - Build pipeline configuration
- `pnpm-workspace.yaml` - Workspace packages
- `apps/web/svelte.config.js` - SvelteKit config
- `apps/web/vite.config.ts` - Vite + plugins

## Philosophy Alignment

All technical decisions must align with Le Foyer du Craft philosophy:

- **Simplicity:** Minimal complexity, clear code, necessary dependencies only
- **Coherence:** Consistent patterns, semantic HTML, predictable navigation
- **Durability:** Technologies that age well, accessible by default, easy to migrate

## Development Workflow

### Before Starting
```bash
nvm use              # Use Node 22.12.0 from .nvmrc
pnpm install         # Install all dependencies
```

### Making Changes
1. Modify shared schema? Build content-schema first: `pnpm --filter @johan-chan/content-schema build`
2. Turbo handles dependency ordering automatically
3. Use `pnpm turbo run build` to build with caching

### Adding Content
1. Create markdown file in `apps/web/src/content/{type}/{slug}.md`
2. Include all required frontmatter fields (see Content Item Schema)
3. Build validates schema - fix any errors shown
4. Content appears in feed if `published: true`

## Deployment Workflow

Builds happen in **GitHub Actions**, not on Vercel. This avoids turbo timeout issues on Vercel's build environment.

### How It Works
1. Push to `main` triggers `.github/workflows/vercel-merge.yml`
2. GitHub Actions:
   - Installs dependencies with pnpm
   - Builds with turbo (cached via GitHub Actions cache)
   - Copies output from `apps/web/.vercel/output` → `.vercel/output`
   - Deploys pre-built output to Vercel with `--prebuilt --archive=tgz`

### Turbo Caching
- Cache stored in GitHub Actions (`.turbo` directory)
- Key based on `pnpm-lock.yaml` + commit SHA
- Subsequent builds reuse cached artifacts

### Vercel Project Settings
Keep settings clean (no overrides):
- **Root Directory:** empty
- **Build Command:** Override OFF (uses SvelteKit default)
- **Install Command:** Override OFF
- **Output Directory:** Override OFF

Settings don't matter with `--prebuilt`, but keeping them clean avoids confusion.

### Manual Deploy (if needed)
```bash
pnpm turbo run build --filter=@johan-chan/web
cp -r apps/web/.vercel/output .vercel/output
vercel deploy --prebuilt --prod --archive=tgz
```

## Cover Image Generation

Hero images use `object-fit: cover` in a container of `min-height: 480px`. Sur mobile (~360px), seuls les **40% centraux** d'une image 16:9 sont visibles.

### Hiérarchie de visibilité

1. **Safe zone (centre 40%)** — indispensable au message :
   - Textes/panneaux compacts (jamais de néon large qui déborde)
   - Silhouettes des personnages (partiellement croppées = OK)

2. **Bords (30% par côté)** — bonus desktop, sacrifiables au crop :
   - Personnages secondaires, robot assistant, ambiance

### Règles

- **Format :** 16:9 (1280×720)
- **Textes :** panneaux/plaques compacts, pas de néon large
- **Écrans :** si un dev travaille, écran allumé avec du code
- **Bonus près de leur scène :** manager côté porte, robot côté dev
- **Style :** cel-shaded anime, ambiance sombre, contrastes de couleur (bleu/orange)
- **`imageFocus`** dans meta.json : contrôle `object-position` du hero (`center`, `top`, `bottom`)
- **URLs courtes :** utiliser is.gd pour les liens HuggingFace (consultation mobile)

## Important Notes

### Node Version
**Required:** Node 22.12.0 (see `.nvmrc`)
Vite 7 requires Node ^20.19.0 or >=22.12.0

### Symlink (.le-foyer-product/)
- DO NOT commit (already in `.gitignore`)
- DO reference when making architectural decisions
- Points to: `/Volumes/workspace/jconan/@le-foyer-du-craft/domains/products/personal-website-platform/`

### Platform vs. Content Separation
- **Platform (this repo):** HOW to publish (infrastructure, build, deploy)
- **Channel (future):** WHAT to publish (content, SEO, navigation)

Never blur this boundary.

### External Links
- **Business inquiries:** La Graine du Craft (lagraineducraft.fr)
- Thought leadership here, business there. Clear separation.
