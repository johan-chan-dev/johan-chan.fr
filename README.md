# johan-chan.fr

A space for thinking out loud about software craft in the age of AI — articles, series, and devlogs, in French and English.

> _Ce que je pense. Ce que j'apprends._

- **Live:** https://www.johan-chan.fr
- **Deployment:** GitHub Actions → GitHub Pages (static, fully pre-rendered)

## Stack

- **SvelteKit 5** with `adapter-static` + **Svelte 5** runes
- **Vite 7** (Node `^20.19.0` or `>=22.12.0` — see `.nvmrc`)
- **Tailwind CSS 4** + **DaisyUI 5** (themes: `autumn` / `abyss`)
- **Paraglide JS** for i18n — currently FR only (EN `/en/` planned)
- **mdsvex** for `.svx` content with embedded Svelte components
- **marked** + **shiki** for plain `.md` content rendering
- **Zod 4** for content schema validation
- **Turbo** + **pnpm** workspaces

## Monorepo Layout

```
├── apps/web/          # SvelteKit app (@johan-chan/web)
├── packages/content/  # Content + schema (@johan-chan/content)
├── turbo.json
└── pnpm-workspace.yaml
```

## Getting Started

```bash
pnpm install
pnpm dev                # start all apps via Turbo
# or
pnpm dev:web            # start only the web app
```

## Commands

All commands run from the repo root.

```bash
# Dev / build
pnpm dev                # turbo: dev
pnpm build              # turbo: build
pnpm dev:web            # apps/web only
pnpm build:web          # apps/web only

# Quality
pnpm check:web          # svelte-check
pnpm lint               # prettier + eslint (via turbo)
pnpm format             # prettier --write (apps/web)

# Tests
pnpm test:unit          # vitest (apps/web)
pnpm test:e2e           # playwright (apps/web)
```

## Content

Content types live under `packages/content/`:

| Type     | Folder      | Notes                              |
| -------- | ----------- | ---------------------------------- |
| `article`| `articles/` | Long-form articles                 |
| `série`  | `series/`   | Multi-part series (parent + chapters) |
| `devlog` | `devlogs/`  | Development logs                   |
| `post`   | `posts/`    | Short-form posts                   |

Each item is a folder containing `meta.json`, a content file, and optional `images/`. `type` and `slug` are **inferred from the folder path** — they are not stored in `meta.json`.

### Rendering Pipeline

Two rendering paths, selected per item by which content file exists:

- **`content.md`** — plain markdown, rendered at runtime by `marked` + `shiki`. Default.
- **`content.svx`** — markdown with Svelte components, compiled by mdsvex at build time. Used when interactive elements are needed. Components are auto-injected under the `C` namespace (e.g. `<C.Callout>`).

Full details: [`apps/web/docs/rendering-pipeline.md`](apps/web/docs/rendering-pipeline.md).

### Publishing States

| `published` | `preview` | Behavior                                            |
| ----------- | --------- | --------------------------------------------------- |
| `true`      | _absent_  | Public                                              |
| `true`      | `true`    | Pre-rendered, hidden from feed, accessible via `?preview=<key>` |
| `false`     | _absent_  | Not pre-rendered → 404                              |

Preview access is controlled by the `PUBLIC_PREVIEW_KEY` env var.

## Routes

```
/                           Homepage (Activity Feed)
/articles                   Articles list
/articles/[slug]            Article detail
/series                     Series grouped view
/series/[series]            Series detail
/series/[series]/[chapter]  Chapter detail
/devlogs                    Devlogs grouped view
/devlogs/[slug]             Devlog detail
/about                      About page
/call                       Unlisted booking page (Cal.com embed, not in nav)
/sitemap.xml                Dynamic sitemap
```

FR is served at `/` via Paraglide URL rewriting in `hooks.ts`. EN (`/en/`) is planned but not yet configured — only the `fr` locale exists.

## Image Pipeline

A custom Vite plugin (`apps/web/vite-plugins/content-images.ts`) handles content images:

- **Dev:** serves directly from content folders at `/@content-images/{typeDir}/{slug}/{filename}`
- **Prod:** generates responsive sizes (`xs`/`sm`/`md`/`lg`) with `sharp`, emits to `static/images/` with content hashes, writes `.image-manifest.json`

## Deployment

Push to `main` triggers [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml):

1. `pnpm install` + `turbo build` with cache
2. Static output from `apps/web/build` uploaded to GitHub Pages

Manual build:

```bash
pnpm turbo run build --filter=@johan-chan/web
# → apps/web/build/
```

## Philosophy

Aligned with **Le Foyer du Craft** — my ongoing practice around software craft:

- **Simplicity** — minimal complexity, necessary dependencies only
- **Coherence** — consistent patterns, semantic HTML
- **Durability** — technologies that age well, accessible by default
