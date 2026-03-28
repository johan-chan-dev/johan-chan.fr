# Rendering Pipeline

The dual rendering pipeline for content items — why it exists, what it does, and how it works.

## Why

Most content is plain markdown. A simple pipeline — parse markdown, render HTML, inject it — works well and is easy to reason about.

Some content needs Svelte components: callout boxes, interactive demos, tabbed examples. Rather than force everything through mdsvex (which adds build-time complexity to all content), a second path activates only when a content item explicitly needs it.

The result: two rendering paths that coexist. Plain markdown stays simple. Rich content gets components.

## What

Each content folder contains either `content.md` or `content.svx` — never both.

| File | Toolchain | Syntax highlighting | Rendered as |
|------|-----------|---------------------|-------------|
| `content.md` | `marked` + shiki at runtime | Request/build time | HTML string → `{@html}` |
| `content.svx` | mdsvex at build time | Build time | Svelte component → `<Component />` |

`renderMode` on the loaded content item indicates which path applies: `'html'` (default) or `'svx'`.

## How

### `.md` pipeline (default)

1. `content.ts` reads the raw markdown string — filesystem in dev, `import.meta.glob('?raw')` in prod.
2. `+page.server.ts` renders it with `marked` + shiki → returns an HTML string as `htmlContent`.
3. `+page.svelte` injects it: `{@html htmlContent}`.

Image URLs are transformed by `transformImageUrls()` at load time to resolve against the content image serving path.

### `.svx` pipeline

1. `content.ts` detects `content.svx` in the folder, sets `renderMode: 'svx'` on the loaded item.
2. `+page.server.ts` detects `renderMode === 'svx'`, skips `marked`, passes `renderMode` through to the client.
3. `+page.ts` (universal load function) dynamically imports the `.svx` file via `import.meta.glob` — Vite compiles it through the mdsvex preprocessor at build time, producing a Svelte component.
4. `+page.svelte` renders with `<svelte:component this={component} />` (Svelte 5 dynamic component syntax).

**Why `+page.ts` for the import:**
Svelte components are not JSON-serializable. `+page.server.ts` can only return data that crosses the server/client boundary as JSON. The component must be imported in a universal load function (`+page.ts`) which runs on both server and client and can return non-serializable values.

### Syntax highlighting

Both paths use shiki, but at different stages:

- `.md`: shiki runs via a custom `marked` renderer in `$lib/utils/syntax-highlighting.ts`, invoked during `+page.server.ts` rendering.
- `.svx`: shiki runs at build time via the `highlight` option in the mdsvex config in `svelte.config.js`, using `escapeSvelte` to prevent Svelte from interpreting highlighted output as template syntax.

## Custom components in `.svx`

Each `.svx` file must explicitly import the components it uses:

```svelte
<script>
import Callout from '$lib/components/content/Callout.svelte';
</script>

<Callout type="tip" title="Example">
Content here
</Callout>
```

### Available components

| Component | Props | Description |
|-----------|-------|-------------|
| `Callout` | `type`: `info` / `warning` / `tip` / `note`, `title`: string | Styled aside box |

### Adding a new custom component

1. Create the component in `$lib/components/content/`.
2. Document its props and usage in the table above.
3. `.svx` files import it explicitly — no global registration needed.

## Image handling

- `.md`: image URLs are transformed by `transformImageUrls()` at load time, resolving paths against the content image serving endpoint.
- `.svx`: images use standard markdown syntax; the `content-images` Vite plugin (`apps/web/vite-plugins/content-images.ts`) handles dev serving and build-time optimization (responsive sizes, content hashes, manifest).

## `DEV_CONTENT_DIR`

When `DEV_CONTENT_DIR` is set to a path outside the project root (e.g. a local content workspace), Vite's dev server file serving restrictions would block `.svx` imports. `vite.config.ts` adds `DEV_CONTENT_DIR` to `server.fs.allow` so Vite can serve those files.
