# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Product Context

**Johan Chan's personal website** — a bilingual Activity Feed / Personal Changelog.

- **Tagline:** "Ce que je pense. Ce que j'apprends."
- **Live site:** https://www.johan-chan.fr
- **Deployment:** GitHub Actions → GitHub Pages (static, pre-built)

Product documentation lives at `.le-foyer-product/` (symlinked to Le Foyer du Craft system, not committed).

## Monorepo Structure

**Turbo + pnpm workspaces** monorepo with two workspace packages:

```
├── apps/web/               # SvelteKit app (@johan-chan/web)
├── packages/content/       # Content + schema (@johan-chan/content)
├── turbo.json
└── pnpm-workspace.yaml
```

## Commands

```bash
# Root (Turbo)
pnpm dev                # Start all apps in dev mode
pnpm build              # Build all packages and apps
pnpm dev:web            # Start only web app
pnpm build:web          # Build only web app
pnpm check:web          # Type check web app
pnpm format             # Auto-format web app

# Web App
pnpm --filter @johan-chan/web lint          # ESLint + Prettier check
pnpm --filter @johan-chan/web test:unit     # Vitest (no tests yet)
pnpm --filter @johan-chan/web test:e2e      # Playwright E2E
pnpm --filter @johan-chan/web check         # svelte-check type checking
```

## Tech Stack

- **SvelteKit 5** with `adapter-static` (fully pre-rendered)
- **Svelte 5** with runes (`$state`, `$derived`, `$props`)
- **Vite 7** — requires Node ^20.19.0 or >=22.12.0 (see `.nvmrc`: 22.12.0)
- **Tailwind CSS 4** + **DaisyUI 5** (themes: `autumn` light, `abyss` dark)
- **Paraglide JS** — i18n (FR primary, EN secondary); FR at `/`, EN at `/en/`
- **mdsvex** — Markdown in Svelte (`.svx` extension supported)
- **Zod 4** — content schema validation
- **vite-plugin-kit-routes** — type-safe routes (`$lib/ROUTES`)

## Content Mirror

`packages/content/` is a **read-only mirror** managed by le-cockpit's studio. Do not edit content files directly in this repo — changes will be overwritten on next publish from the studio.

## Content Architecture

Content lives in `packages/content/`, consumed by `apps/web` via `@johan-chan/content` workspace dependency.

### Content Types
- `article` → `articles/` — Long-form articles
- `série` → `series/` — Multi-part series (parent + chapter folders)
- `devlog` → `devlogs/` — Development logs
- `post` → `posts/` — Short-form posts

### Folder Structure
```
packages/content/
├── schema/              # Zod schemas, TS types, path utilities
│   ├── schema.ts        # MetaJsonSchema, ContentItemSchema, SeriesMetaJsonSchema
│   ├── types.ts         # Inferred types (ContentItem, IndexEntry, etc.)
│   └── paths.ts         # Path resolution helpers (typeToDir, parseContentPath, etc.)
├── articles/{slug}/
│   ├── meta.json        # Metadata (title, date, excerpt, tags, published, image...)
│   ├── content.md       # Markdown body
│   └── images/          # Colocated images (hero, inline)
└── series/{series-slug}/
    ├── meta.json        # Series-level metadata (SeriesMetaJsonSchema)
    └── {chapter-slug}/  # Each chapter is a subfolder
        ├── meta.json
        ├── content.md
        └── images/
```

**Key:** `type` and `slug` are inferred from the folder path — they are NOT in `meta.json`.

### Content Loading (`apps/web/src/lib/utils/content.ts`)
- **Dev:** reads filesystem directly for instant updates
- **Prod:** uses Vite's `import.meta.glob` to import all `.md` and `meta.json` at build time
- Caches scanned items in production
- Validates all meta.json against `MetaJsonSchema`
- Imports schemas from `@johan-chan/content/schema`

### Image Pipeline (`apps/web/vite-plugins/content-images.ts`)
Custom Vite plugin that:
- **Dev:** serves images from content folders via `/@content-images/{typeDir}/{slug}/{filename}`
- **Prod:** scans content, generates responsive sizes (xs/sm/md/lg) with sharp, outputs to `static/images/` with content hashes, builds `.image-manifest.json`

### Publishing States

| `published` | `preview` | Behavior |
|-------------|-----------|----------|
| `true`      | absent    | Public |
| `true`      | `true`    | Pre-rendered, hidden from feed, accessible via `?preview=<key>` |
| `false`     | absent    | Not pre-rendered → 404 |

`PUBLIC_PREVIEW_KEY` env var controls preview access.

### Rendering Pipeline

Two rendering paths, selected per content item by which file exists:

- **`content.md`** — plain markdown rendered by `marked` + shiki at runtime → `{@html}`. Default for all content.
- **`content.svx`** — markdown with Svelte components, compiled by mdsvex at build time → dynamic Svelte component. Used when content needs interactive elements.

Each `.svx` file must explicitly import its components (`import Callout from '$lib/components/content/Callout.svelte'`). Custom components live in `$lib/components/content/`.

Full documentation: `apps/web/docs/rendering-pipeline.md`

## Web App Architecture

### Routes (`apps/web/src/routes/`)
```
/                           Homepage (Activity Feed)
/articles                   Articles list
/articles/[slug]            Article detail
/series                     Series grouped view
/series/[series]            Series detail (chapter list)
/series/[series]/[chapter]  Chapter detail
/devlogs                    Devlogs grouped view
/devlogs/[slug]             Devlog detail
/about                      About page
/sitemap.xml                Dynamic sitemap
```

### Hooks
- **`hooks.server.ts`:** 301 redirects (from `$lib/redirects.ts`) + Paraglide i18n middleware
- **`hooks.ts`:** Paraglide URL rewriting (`reroute`)

### Key Modules
- `$lib/utils/content.ts` — content scanning, loading, filtering, markdown rendering (with shiki syntax highlighting)
- `$lib/components/ContentFeed.svelte` — main feed component
- `$lib/components/ContentItem.svelte` — individual item card
- `$lib/components/SEO.svelte` — SEO meta tags
- `$lib/data/seo-data.ts` — site-wide SEO config
- `$lib/redirects.ts` — 301 redirect mappings (series/chapter renames)
- `$lib/ROUTES.ts` — generated type-safe route helpers

### i18n
- Messages in `apps/web/messages/fr.json` (FR only currently)
- Usage: `import * as m from '$lib/paraglide/messages'`
- FR at `/`, EN at `/en/` prefix

## Deployment

Push to `main` triggers `.github/workflows/deploy.yml`:
1. pnpm install + turbo build with cache
2. `BASE_PATH` set to `/${{ github.event.repository.name }}` for GitHub Pages
3. Static output from `apps/web/build` uploaded and deployed to GitHub Pages

### Manual Deploy
```bash
pnpm turbo run build --filter=@johan-chan/web
# Output in apps/web/build/
```

## Philosophy

All technical decisions align with Le Foyer du Craft:
- **Simplicity:** minimal complexity, necessary dependencies only
- **Coherence:** consistent patterns, semantic HTML
- **Durability:** technologies that age well, accessible by default

## Cover Image Generation

Hero images use `object-fit: cover` in a container of `min-height: 480px`. On mobile (~360px), only the **center 40%** of a 16:9 image is visible.

- **Format:** 16:9 (1280×720)
- **Safe zone (center 40%):** essential content (text, main subject)
- **Edges (30% each side):** bonus for desktop, sacrificable
- **`imageFocus`** in meta.json controls `object-position` (`center`, `top`, `bottom`)
- **`ogCrop`** in meta.json controls OG image crop position
- **Style:** cel-shaded anime, dark ambiance, blue/orange contrasts
