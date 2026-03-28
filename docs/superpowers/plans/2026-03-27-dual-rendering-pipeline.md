# Dual Rendering Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Support both plain markdown (`content.md`) and mdsvex (`content.svx`) content files, so studio can write Svelte components inside markdown when needed while keeping the simple marked pipeline for everything else.

**Architecture:** Content folders can contain either `content.md` (rendered at runtime via `marked` + shiki, as today) or `content.svx` (compiled at build time by mdsvex into a Svelte component with interactive capabilities). The `+page.svelte` files detect which format was loaded and render accordingly — `{@html}` for HTML strings, `<svelte:component>` for compiled components. A shared mdsvex layout provides custom components (e.g. `<Callout>`) to all `.svx` content without per-file imports.

**Tech Stack:** mdsvex 0.12.7, Svelte 5, shiki (build-time via mdsvex highlight option), `escapeSvelte` from mdsvex, `import.meta.glob` for `.svx` component imports.

---

## Why / What / How

### Why

Most content is plain markdown — articles, devlog entries, series chapters. The `marked` + shiki pipeline is fast, simple, and works well for this. But some content needs interactive elements: collapsible sections, tabbed code examples, embedded demos, styled callouts. Raw HTML in markdown is fragile and can't leverage Svelte's reactivity or component system.

Rather than migrate everything to mdsvex (which would complicate the simple case and change the dev-mode filesystem-read workflow), we add a **second rendering path** that activates only when content uses it.

### What

- **`content.md`** — plain markdown, rendered by `marked` + shiki at runtime (existing pipeline, unchanged)
- **`content.svx`** — markdown with Svelte component syntax, compiled by mdsvex at build time into a Svelte component

Studio decides per content item which format to use. The web app detects which file exists and picks the right renderer. Both formats coexist — a content folder has one or the other, never both.

### How

1. Configure mdsvex in `svelte.config.js` with shiki highlighting and a default layout
2. Add `import.meta.glob` for `.svx` files (without `?raw` — these compile to components)
3. In `content.ts`, detect whether a content item has `.svx` or `.md` and return the appropriate data shape
4. In `+page.svelte` files, branch rendering: `{@html}` for HTML strings, dynamic component for `.svx`
5. Create a mdsvex layout that exports shared custom components

---

## File Structure

```
apps/web/
├── svelte.config.js                           # MODIFY: mdsvex config (shiki, layout, extensions)
├── playwright.config.ts                       # MODIFY: add visual regression project
├── vite.config.ts                             # MODIFY: server.fs.allow for DEV_CONTENT_DIR
├── tests/e2e/
│   └── visual-regression.spec.ts              # CREATE: screenshot tests for all content pages
├── src/lib/
│   ├── layouts/
│   │   └── content.svelte                     # CREATE: mdsvex layout (provides custom components)
│   ├── components/content/
│   │   └── Callout.svelte                     # CREATE: first custom component (proof of concept)
│   ├── utils/
│   │   ├── content.ts                         # MODIFY: detect .svx, return component or HTML
│   │   └── syntax-highlighting.ts             # NO CHANGE (still used by marked pipeline)
│   └── types/
│       └── content-render.ts                  # CREATE: discriminated union type for render data
├── src/routes/
│   ├── articles/[slug]/
│   │   ├── +page.server.ts                    # MODIFY: pass component or HTML
│   │   └── +page.svelte                       # MODIFY: dual rendering
│   ├── devlogs/[slug]/
│   │   ├── +page.server.ts                    # MODIFY: pass component or HTML
│   │   └── +page.svelte                       # MODIFY: dual rendering
│   └── series/[series]/[chapter]/
│       ├── +page.server.ts                    # MODIFY: pass component or HTML
│       └── +page.svelte                       # MODIFY: dual rendering
└── docs/
    └── rendering-pipeline.md                  # CREATE: pipeline documentation
```

---

## Task 0: Visual regression tests — baseline before pipeline changes

**Files:**
- Modify: `apps/web/playwright.config.ts`
- Create: `apps/web/tests/e2e/visual-regression.spec.ts`

Visual regression tests screenshot the content body of every published content page (articles + series chapters). They run automatically — the LLM just runs `pnpm test:e2e` and either it passes or it doesn't.

Baselines are generated before any pipeline changes. After the dual pipeline is implemented (all existing content still uses `content.md`), the same tests must pass with zero visual diff.

- [ ] **Step 1: Add a visual regression project to playwright config**

Visual regression tests should run on a single browser (Chromium desktop) with a fixed viewport to avoid cross-browser font/rendering noise. Add a dedicated project to `apps/web/playwright.config.ts`:

```ts
{
	name: 'visual-regression',
	use: {
		...devices['Desktop Chrome'],
		viewport: { width: 1280, height: 720 }
	},
	testMatch: 'visual-regression.spec.ts'
}
```

Also exclude `visual-regression.spec.ts` from the existing browser projects so it doesn't run 5x. Add `testIgnore: 'visual-regression.spec.ts'` to each existing project.

Update the webServer command from `npm run dev` to `pnpm dev` (consistent with monorepo conventions).

- [ ] **Step 2: Write the visual regression test**

Create `apps/web/tests/e2e/visual-regression.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

// All published content pages to screenshot.
// The test captures the content body area (not header/nav) for stable comparisons.
const contentPages = [
	// Articles
	{ path: '/articles/10x-plus-productif-ne-veut-pas-dire-ce-que-vous-croyez', name: 'article-10x' },
	{ path: '/articles/ce-que-augmente-veut-dire', name: 'article-augmente' },
	// Series chapters
	{ path: '/series/le-monde-du-dev-sous-choc/le-jour-ou-jai-cesse-davoir-peur-de-lia', name: 'series-ch01' },
	{ path: '/series/le-monde-du-dev-sous-choc/le-marche-se-restructure', name: 'series-ch02' },
	{ path: '/series/le-monde-du-dev-sous-choc/et-si-le-marche-ne-suivait-plus', name: 'series-ch03' },
	{ path: '/series/le-monde-du-dev-sous-choc/ce-qui-casse-ce-qui-se-copie', name: 'series-ch04' },
	{ path: '/series/le-monde-du-dev-sous-choc/le-piege-de-la-qualite-suffisante', name: 'series-ch05' },
	{ path: '/series/le-monde-du-dev-sous-choc/quand-tout-le-monde-genere-qui-relit', name: 'series-ch06' },
	{ path: '/series/le-monde-du-dev-sous-choc/lia-est-faillible-et-ton-code', name: 'series-ch07' },
	{ path: '/series/le-monde-du-dev-sous-choc/le-code-propre-n-est-pas-le-craft', name: 'series-ch08' },
	{ path: '/series/le-monde-du-dev-sous-choc/la-discipline-se-deplace', name: 'series-ch09' },
	{ path: '/series/le-monde-du-dev-sous-choc/dou-viendront-les-devs-de-demain', name: 'series-ch10' },
	{ path: '/series/le-monde-du-dev-sous-choc/ou-on-va', name: 'series-ch11' },
	{ path: '/series/le-monde-du-dev-sous-choc/la-fin', name: 'series-ch12' },
];

for (const { path: pagePath, name } of contentPages) {
	test(`visual: ${name}`, async ({ page }) => {
		await page.goto(pagePath);

		// Wait for content to fully render (shiki highlighting is async)
		await page.waitForLoadState('networkidle');

		// Screenshot the content body area
		const contentBody = page.locator('.article-content, .post-content, .chapter-content');
		await expect(contentBody).toBeVisible();

		await expect(contentBody).toHaveScreenshot(`${name}.png`, {
			maxDiffPixelRatio: 0.01,
		});
	});
}
```

Key design decisions:
- **Screenshots the content body only** (`.article-content`, `.post-content`, `.chapter-content`), not the full page — avoids noise from headers, nav, hero images that aren't part of the rendering pipeline
- **`maxDiffPixelRatio: 0.01`** — allows 1% pixel difference for minor antialiasing/font rendering variations
- **`networkidle`** — waits for shiki highlighting and any lazy-loaded images
- **Hardcoded page list** — explicit, no runtime content scanning. When new content is published, the test file doesn't need updating (new content won't have a baseline, so it's ignored). Only tracked pages are regression-tested.

- [ ] **Step 3: Generate baselines**

```bash
cd apps/web && pnpm exec playwright test --project=visual-regression --update-snapshots
```

Expected: all tests pass, baseline PNGs are generated in `tests/e2e/visual-regression.spec.ts-snapshots/`.

- [ ] **Step 4: Verify baselines were created**

```bash
ls apps/web/tests/e2e/visual-regression.spec.ts-snapshots/
```

Expected: 14 PNG files (`article-10x.png`, `article-augmente.png`, `series-ch01.png` ... `series-ch12.png`).

- [ ] **Step 5: Run the tests without `--update-snapshots` to confirm they pass**

```bash
cd apps/web && pnpm exec playwright test --project=visual-regression
```

Expected: all 14 tests pass (comparing against freshly created baselines).

- [ ] **Step 6: Commit baselines and test file**

```bash
git add apps/web/playwright.config.ts \
        apps/web/tests/e2e/visual-regression.spec.ts \
        apps/web/tests/e2e/visual-regression.spec.ts-snapshots/
git commit -m "test: add visual regression tests for content rendering pipeline"
```

The snapshots directory is committed to the repo so CI can compare against them.

---

## Task 1: Update mdsvex and configure build-time shiki highlighting

**Files:**
- Modify: `apps/web/svelte.config.js`
- Modify: `apps/web/package.json` (via pnpm update)

- [ ] **Step 1: Update mdsvex to 0.12.7**

```bash
pnpm --filter @johan-chan/web update mdsvex
```

- [ ] **Step 2: Configure mdsvex with shiki highlighting**

Replace the current minimal mdsvex config in `apps/web/svelte.config.js` with a full config that includes build-time shiki syntax highlighting:

```js
import { mdsvex, escapeSvelte } from 'mdsvex';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { createHighlighter } from 'shiki';

const shikiHighlighter = await createHighlighter({
	themes: ['github-dark', 'github-light'],
	langs: [
		'javascript', 'typescript', 'svelte', 'html', 'css',
		'json', 'bash', 'shell', 'yaml', 'markdown',
		'jsx', 'tsx', 'toml', 'dockerfile'
	]
});

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [
		vitePreprocess(),
		mdsvex({
			extensions: ['.svx'],
			layout: './src/lib/layouts/content.svelte',
			highlight: {
				highlighter: async (code, lang) => {
					const html = shikiHighlighter.codeToHtml(code, {
						lang: lang || 'text',
						theme: 'github-dark'
					});
					return `{@html \`${escapeSvelte(html)}\`}`;
				}
			}
		})
	],

	kit: {
		paths: {
			base: process.env.BASE_PATH ?? ''
		},
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: '404.html',
			precompress: true,
			strict: false
		}),
		prerender: {
			crawl: true,
			entries: ['*'],
			handleUnseenRoutes: 'ignore'
		}
	},

	extensions: ['.svelte', '.svx']
};

export default config;
```

Key changes from current config:
- Top-level `await createHighlighter()` (ESM supports this)
- `escapeSvelte` import for safe code block rendering
- `layout` pointing to the content layout (created in Task 3)
- Same shiki language list as `syntax-highlighting.ts` for consistency
- `.svx` stays in extensions (NOT `.md` — plain markdown keeps the marked pipeline)

- [ ] **Step 3: Verify the config loads**

```bash
cd apps/web && pnpm check
```

Expected: type checking passes (layout file doesn't exist yet, but svelte-check won't fail on config alone).

- [ ] **Step 4: Commit**

```bash
git add apps/web/svelte.config.js apps/web/package.json pnpm-lock.yaml
git commit -m "feat: configure mdsvex with build-time shiki highlighting"
```

---

## Task 2: Create render types and update content loading

**Files:**
- Create: `apps/web/src/lib/types/content-render.ts`
- Modify: `apps/web/src/lib/utils/content.ts`

- [ ] **Step 1: Create the discriminated union type for render data**

Create `apps/web/src/lib/types/content-render.ts`:

```ts
import type { Component } from 'svelte';

/**
 * Discriminated union for content rendering.
 * - 'html': plain markdown rendered by marked (content.md)
 * - 'component': mdsvex-compiled Svelte component (content.svx)
 */
export type RenderedContent =
	| { kind: 'html'; html: string }
	| { kind: 'component'; component: Component };
```

- [ ] **Step 2: Add `.svx` glob imports to content.ts**

Add a second `import.meta.glob` for `.svx` files — these import as Svelte components (no `?raw`):

```ts
// For production: import .svx files as compiled Svelte components (mdsvex pipeline)
const svxModules = import.meta.glob('../../../../../packages/content/**/*.svx', {
	eager: true
});
```

This sits alongside the existing raw `.md` glob.

- [ ] **Step 3: Add `.svx` detection to dev-mode content reading**

In `readContentFromDisk()`, after checking for `content.md`, also check for `content.svx`. The function already returns a `LoadedContentItem` with a `content` string field. For `.svx` files in dev, we can't read them as raw strings — they need Vite's pipeline. Instead, flag the item so the page server knows to use dynamic import.

Add a new field to `LoadedContentItem`:

```ts
interface LoadedContentItem extends ContentItem {
	content: string;
	filePath: string;
	renderMode: 'md' | 'svx';
}
```

In `readFolderContent()`, detect which file exists:

```ts
// Detect content format
const svxPath = path.join(folderPath, 'content.svx');
const mdPath = path.join(folderPath, 'content.md');
const hasSvx = fs.existsSync(svxPath);
const contentPath = hasSvx ? svxPath : mdPath;
const renderMode = hasSvx ? 'svx' : 'md';

let content = fs.existsSync(contentPath)
	? fs.readFileSync(contentPath, 'utf-8').trim()
	: '';

// Only transform image URLs for .md (mdsvex handles its own images via layout)
if (renderMode === 'md') {
	content = transformImageUrls(content, imageTypeDir, slug, dev && !building);
}

return {
	...metaResult.data,
	type,
	slug,
	content,
	filePath: folderPath,
	renderMode
};
```

- [ ] **Step 4: Add `.svx` detection to production content reading**

In `readContentFromModules()`, after looking up `content.md` in `contentModules`, also check `svxModules`:

```ts
// Try .svx first (compiled component), then .md (raw string)
const svxPath = metaPath.replace('meta.json', 'content.svx');
const mdPath = metaPath.replace('meta.json', 'content.md');

if (svxModules[svxPath]) {
	const mod = svxModules[svxPath] as { default: Component; metadata?: Record<string, unknown> };
	return {
		...metaResult.data,
		type,
		slug: folderSlug,
		content: '', // not used for svx
		filePath: metaPath,
		renderMode: 'svx' as const,
		component: mod.default
	};
}

// Fallback to .md
let content = (contentModules[mdPath] as string) || '';
content = transformImageUrls(content, imageTypeDir, folderSlug, dev && !building);

return {
	...metaResult.data,
	type,
	slug: folderSlug,
	content,
	filePath: metaPath,
	renderMode: 'md' as const
};
```

Add `component` as an optional field on `LoadedContentItem`:

```ts
interface LoadedContentItem extends ContentItem {
	content: string;
	filePath: string;
	renderMode: 'md' | 'svx';
	component?: Component;
}
```

- [ ] **Step 5: Update reading time calculation for `.svx`**

For `.svx` files in dev mode, still read the raw file for word count (strip Svelte component tags):

```ts
// Read raw content for reading time estimation (strip component tags for .svx)
const rawText = fs.existsSync(contentPath)
	? fs.readFileSync(contentPath, 'utf-8')
	: '';
const plainText = rawText.replace(/<[^>]+>/g, ' ');
const readingTime = estimateReadingTime(plainText);
```

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/lib/types/content-render.ts apps/web/src/lib/utils/content.ts
git commit -m "feat: detect content.svx and add renderMode to content loading"
```

---

## Task 3: Create mdsvex layout and first custom component

**Files:**
- Create: `apps/web/src/lib/layouts/content.svelte`
- Create: `apps/web/src/lib/components/content/Callout.svelte`

- [ ] **Step 1: Create the Callout component**

Create `apps/web/src/lib/components/content/Callout.svelte`:

```svelte
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		type?: 'info' | 'warning' | 'tip' | 'note';
		title?: string;
		children: Snippet;
	}

	const { type = 'info', title, children }: Props = $props();

	const icons: Record<string, string> = {
		info: 'i',
		warning: '!',
		tip: '~',
		note: '#'
	};

	const styles: Record<string, string> = {
		info: 'border-info bg-info/10 text-info',
		warning: 'border-warning bg-warning/10 text-warning',
		tip: 'border-success bg-success/10 text-success',
		note: 'border-neutral bg-neutral/10 text-neutral-content'
	};
</script>

<aside class="callout border-l-4 rounded-lg p-4 my-6 {styles[type]}">
	{#if title}
		<p class="font-bold mb-2">
			<span class="inline-block w-6 h-6 rounded-full bg-current/20 text-center mr-2">{icons[type]}</span>
			{title}
		</p>
	{/if}
	<div class="text-base-content/80">
		{@render children()}
	</div>
</aside>
```

- [ ] **Step 2: Create the mdsvex layout**

Create `apps/web/src/lib/layouts/content.svelte`:

```svelte
<script module>
	// Custom components available in all .svx content
	// Studio writes <Callout type="tip"> in markdown — mdsvex resolves it here
	export { default as Callout } from '$lib/components/content/Callout.svelte';
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	// mdsvex passes frontmatter as props + children for the rendered content
	interface Props {
		children: Snippet;
		[key: string]: unknown;
	}

	const { children }: Props = $props();
</script>

{@render children()}
```

This layout is intentionally minimal — it provides custom components via module exports and renders children. No wrapper markup, because the page layout is handled by the `+page.svelte` files.

- [ ] **Step 3: Verify build**

```bash
pnpm --filter @johan-chan/web check
```

Expected: passes (no `.svx` content yet, but the layout and component should type-check).

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/lib/layouts/content.svelte apps/web/src/lib/components/content/Callout.svelte
git commit -m "feat: add mdsvex layout with Callout component"
```

---

## Task 4: Update page servers to support dual rendering

**Files:**
- Modify: `apps/web/src/routes/articles/[slug]/+page.server.ts`
- Modify: `apps/web/src/routes/devlogs/[slug]/+page.server.ts`
- Modify: `apps/web/src/routes/series/[series]/[chapter]/+page.server.ts`

The pattern is the same for all three. Only render with `marked` when `renderMode === 'md'`. For `svx`, the component is already compiled — pass it through.

- [ ] **Step 1: Update articles page server**

In `apps/web/src/routes/articles/[slug]/+page.server.ts`, change the rendering section:

```ts
import { error } from '@sveltejs/kit';
import { getContentBySlug, loadContentByType, loadContentByTypeForPrerender, getCoverImageUrl, getHeroImageUrl, getOGImageUrl } from '$lib/utils/content';
import { marked } from 'marked';
import { createShikiRenderer } from '$lib/utils/syntax-highlighting';
import type { PageServerLoad, EntryGenerator } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () => {
	const articles = loadContentByTypeForPrerender('article');
	return articles.map((e) => ({ slug: e.slug }));
};

export const load: PageServerLoad = async ({ params }) => {
	const { slug } = params;

	const item = getContentBySlug(slug);

	if (!item || item.type !== 'article') {
		throw error(404, {
			message: 'Article non trouvé'
		});
	}

	// Render markdown content (only for .md — .svx is pre-compiled by mdsvex)
	let htmlContent: string | null = null;
	if (item.renderMode === 'md') {
		const renderer = await createShikiRenderer();
		marked.use({ renderer });
		htmlContent = await marked(item.content);
	}

	// Compute cover thumbnail URL, hero image URL, and OG image URL
	const coverUrl = getCoverImageUrl(item.type, slug, item.image);
	const hero = getHeroImageUrl(item.type, slug, item.image);
	const ogImage = getOGImageUrl(item.type, slug, item.image);

	// Get related articles (same tags)
	const allArticles = loadContentByType('article').filter(
		(e) => e.slug !== slug && e.published !== false
	);
	const relatedArticles = allArticles
		.map((article) => {
			const commonTags = article.tags.filter((tag) => item.tags.includes(tag));
			return { ...article, score: commonTags.length };
		})
		.filter((e) => e.score > 0)
		.sort((a, b) => b.score - a.score)
		.slice(0, 3);

	// Estimate reading time from raw markdown content
	const wordCount = item.content.trim().split(/\s+/).filter(Boolean).length;
	const readingTime = Math.max(1, Math.ceil(wordCount / 250));

	return {
		article: {
			...item,
			htmlContent,
			renderMode: item.renderMode,
			coverUrl,
			heroUrl: hero?.url ?? null,
			heroSrcset: hero?.srcset ?? null,
			ogUrl: ogImage,
			readingTime
		},
		relatedArticles
	};
};
```

Note: `item.component` (Svelte component) **cannot be serialized** through `+page.server.ts` data. This is a fundamental constraint — SvelteKit page server data must be serializable. For `.svx` content, we need a different approach. See Task 5 for the solution.

- [ ] **Step 2: Pause — reassess the data flow for `.svx` content**

The server load function cannot pass a Svelte component in its return data. The component must be imported client-side (in `+page.svelte` or `+page.ts`). Two options:

**Option A: Use `+page.ts` (universal load) for `.svx` content.**
The `+page.ts` load function runs in both SSR and client. It can dynamically import the `.svx` file and return the component. The `+page.server.ts` tells it which slug/format to load.

**Option B: Dynamic import in `+page.svelte` directly.**
The page component receives the slug and renderMode from the server, then does a dynamic `import()` if it's `.svx`.

**We go with Option A** because it keeps rendering logic in load functions and the page component stays simple.

- [ ] **Step 3: Create `+page.ts` for articles**

Create `apps/web/src/routes/articles/[slug]/+page.ts`:

```ts
import type { PageLoad } from './$types';
import type { Component } from 'svelte';

export const load: PageLoad = async ({ data }) => {
	if (data.article.renderMode !== 'svx') {
		return data;
	}

	// Dynamic import — Vite resolves .svx through mdsvex preprocessor
	const slug = data.article.slug;
	const modules = import.meta.glob('../../../../../../packages/content/articles/*/content.svx');
	const modulePath = Object.keys(modules).find((p) => p.includes(`/${slug}/content.svx`));

	if (!modulePath) {
		return data;
	}

	const mod = (await modules[modulePath]()) as { default: Component };

	return {
		...data,
		article: {
			...data.article,
			component: mod.default
		}
	};
};
```

- [ ] **Step 4: Create `+page.ts` for devlogs**

Create `apps/web/src/routes/devlogs/[slug]/+page.ts`:

```ts
import type { PageLoad } from './$types';
import type { Component } from 'svelte';

export const load: PageLoad = async ({ data }) => {
	if (data.post.renderMode !== 'svx') {
		return data;
	}

	const slug = data.post.slug;
	const parent = data.post.parent;
	const modules = import.meta.glob('../../../../../../packages/content/devlogs/**/content.svx');
	const modulePath = Object.keys(modules).find((p) => p.includes(`/${slug}/content.svx`));

	if (!modulePath) {
		return data;
	}

	const mod = (await modules[modulePath]()) as { default: Component };

	return {
		...data,
		post: {
			...data.post,
			component: mod.default
		}
	};
};
```

- [ ] **Step 5: Create `+page.ts` for series chapters**

Create `apps/web/src/routes/series/[series]/[chapter]/+page.ts`:

```ts
import type { PageLoad } from './$types';
import type { Component } from 'svelte';

export const load: PageLoad = async ({ data }) => {
	if (data.chapter.renderMode !== 'svx') {
		return data;
	}

	const slug = data.chapter.slug;
	const modules = import.meta.glob('../../../../../../../packages/content/series/**/content.svx');
	const modulePath = Object.keys(modules).find((p) => p.includes(`/${slug}/content.svx`));

	if (!modulePath) {
		return data;
	}

	const mod = (await modules[modulePath]()) as { default: Component };

	return {
		...data,
		chapter: {
			...data.chapter,
			component: mod.default
		}
	};
};
```

- [ ] **Step 6: Update all three `+page.server.ts` files**

Apply the same pattern to all three — add `renderMode` to the returned data, skip `marked` rendering when `renderMode === 'svx'`:

For **devlogs** (`apps/web/src/routes/devlogs/[slug]/+page.server.ts`):

```ts
// Render markdown content (only for .md — .svx is pre-compiled by mdsvex)
let htmlContent: string | null = null;
if (item.renderMode === 'md') {
	const renderer = await createShikiRenderer();
	marked.use({ renderer });
	htmlContent = await marked(item.content);
}

// ... rest stays the same, add renderMode to return:
return {
	post: {
		...item,
		htmlContent,
		renderMode: item.renderMode,
		// ... existing fields
	},
	// ...
};
```

For **series chapters** (`apps/web/src/routes/series/[series]/[chapter]/+page.server.ts`): same pattern, add `renderMode` to the returned `chapter` object.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/routes/articles/[slug]/+page.ts \
        apps/web/src/routes/articles/[slug]/+page.server.ts \
        apps/web/src/routes/devlogs/[slug]/+page.ts \
        apps/web/src/routes/devlogs/[slug]/+page.server.ts \
        apps/web/src/routes/series/[series]/[chapter]/+page.ts \
        apps/web/src/routes/series/[series]/[chapter]/+page.server.ts
git commit -m "feat: dual rendering data flow — marked for .md, dynamic import for .svx"
```

---

## Task 5: Update page components for dual rendering

**Files:**
- Modify: `apps/web/src/routes/articles/[slug]/+page.svelte`
- Modify: `apps/web/src/routes/devlogs/[slug]/+page.svelte`
- Modify: `apps/web/src/routes/series/[series]/[chapter]/+page.svelte`

- [ ] **Step 1: Update articles page component**

In `apps/web/src/routes/articles/[slug]/+page.svelte`, replace the `{@html}` rendering block:

```svelte
<!-- Replace this: -->
<div class="article-content">
	{@html article.htmlContent}
</div>

<!-- With this: -->
<div class="article-content">
	{#if article.component}
		<article.component />
	{:else}
		{@html article.htmlContent}
	{/if}
</div>
```

Svelte 5 supports `<expression />` syntax for dynamic components — no need for `<svelte:component this={...}>`.

- [ ] **Step 2: Update devlogs page component**

In `apps/web/src/routes/devlogs/[slug]/+page.svelte`, same pattern:

```svelte
<!-- Replace: -->
<div class="post-content">
	{@html post.htmlContent}
</div>

<!-- With: -->
<div class="post-content">
	{#if post.component}
		<post.component />
	{:else}
		{@html post.htmlContent}
	{/if}
</div>
```

- [ ] **Step 3: Update series chapter page component**

In `apps/web/src/routes/series/[series]/[chapter]/+page.svelte`, same pattern:

```svelte
<!-- Replace: -->
<div class="chapter-content">
	{@html chapter.htmlContent}
</div>

<!-- With: -->
<div class="chapter-content">
	{#if chapter.component}
		<chapter.component />
	{:else}
		{@html chapter.htmlContent}
	{/if}
</div>
```

- [ ] **Step 4: Verify existing content still renders**

```bash
pnpm dev:web
```

Open the site — all existing articles/series/devlogs should render exactly as before (they all use `content.md`, so `renderMode === 'md'` and the `{@html}` path is taken).

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/routes/articles/[slug]/+page.svelte \
        apps/web/src/routes/devlogs/[slug]/+page.svelte \
        apps/web/src/routes/series/[series]/[chapter]/+page.svelte
git commit -m "feat: dual rendering in page components — @html or svelte:component"
```

---

## Task 6: Add `server.fs.allow` for DEV_CONTENT_DIR

**Files:**
- Modify: `apps/web/vite.config.ts`

- [ ] **Step 1: Allow Vite to access external content directory**

When `DEV_CONTENT_DIR` points outside the project root, Vite blocks filesystem access by default. Add `server.fs.allow` to the Vite config:

```ts
// In vite.config.ts, add to the default export:
export default defineConfig({
	plugins: [...],
	server: {
		allowedHosts: ['.dev.box'],
		fs: {
			allow: [
				// Allow Vite to access content outside project root (DEV_CONTENT_DIR)
				...(devContentDir ? [devContentDir] : [])
			]
		}
	}
});
```

This ensures that when mdsvex tries to compile `.svx` files from `DEV_CONTENT_DIR`, Vite doesn't reject the filesystem access.

- [ ] **Step 2: Commit**

```bash
git add apps/web/vite.config.ts
git commit -m "feat: allow Vite fs access to DEV_CONTENT_DIR for mdsvex compilation"
```

---

## Task 7: Validate pipeline with `.svx` test file + visual regression

**Files:**
- Create: test `content.svx` file in content (temporary, for validation)

This task validates two things:
1. The `.svx` pipeline works end-to-end (new capability)
2. Existing `.md` content is visually unchanged (run Task 0's regression tests)

- [ ] **Step 1: Run visual regression tests — existing content must still pass**

```bash
cd apps/web && pnpm exec playwright test --project=visual-regression
```

Expected: all 14 tests pass. The pipeline refactor changed no rendering for `.md` content.

- [ ] **Step 2: Create a test `.svx` content file**

Pick an existing article and create a `content.svx` sibling (temporarily rename `content.md` to `content.md.bak`):

```bash
cd packages/content/articles/ce-que-augmente-veut-dire
mv content.md content.md.bak
```

Create `content.svx` with a simple test:

```svelte
<Callout type="tip" title="Test">
This is a test callout rendered via mdsvex.
</Callout>

## Regular markdown still works

This is **bold** and this is `inline code`.

```typescript
const x: number = 42;
```
```

- [ ] **Step 3: Build and verify SSR**

```bash
pnpm build:web
```

Verify the build succeeds and the article page is pre-rendered with the Callout component.

- [ ] **Step 4: Restore the original file**

```bash
cd packages/content/articles/ce-que-augmente-veut-dire
rm content.svx
mv content.md.bak content.md
```

- [ ] **Step 5: Run visual regression tests again — baselines must still match**

```bash
cd apps/web && pnpm exec playwright test --project=visual-regression
```

Expected: all 14 tests pass. Restoring `content.md` returns the page to its exact baseline rendering.

- [ ] **Step 6: Commit (nothing to commit — test was temporary)**

No commit needed. The test validated both pipelines work.

---

## Task 8: Write rendering pipeline documentation

**Files:**
- Create: `apps/web/docs/rendering-pipeline.md`

- [ ] **Step 1: Write the documentation**

Create `apps/web/docs/rendering-pipeline.md`:

```markdown
# Content Rendering Pipeline

## Why

Most content is plain markdown — no need for build-time compilation or component
overhead. But some content needs interactive Svelte components (callouts, tabbed
examples, embedded demos). Rather than force all content through one pipeline, we
support both formats and let each content item choose.

## What

Two rendering paths, selected per content item by which file exists in the content folder:

| File            | Pipeline                        | Output              | Use when                    |
|-----------------|---------------------------------|----------------------|-----------------------------|
| `content.md`    | `marked` + shiki (runtime)      | HTML string          | Plain markdown (most content) |
| `content.svx`   | mdsvex + shiki (build-time)     | Svelte component     | Markdown with Svelte components |

A content folder has one or the other, never both. When neither exists, the item
has no body content.

## How

### `content.md` pipeline (unchanged)

1. `content.ts` reads the raw markdown string (filesystem in dev, `import.meta.glob('?raw')` in prod)
2. `+page.server.ts` renders it with `marked` + shiki → HTML string
3. `+page.svelte` renders with `{@html htmlContent}`

### `content.svx` pipeline (new)

1. `content.ts` detects `content.svx` exists, sets `renderMode: 'svx'`
2. `+page.server.ts` skips `marked` rendering, passes `renderMode` to the client
3. `+page.ts` (universal load) dynamically imports the `.svx` file via `import.meta.glob`
   — Vite compiles it through the mdsvex preprocessor into a Svelte component
4. `+page.svelte` renders with `<component />` (Svelte 5 dynamic component syntax)

### Why `+page.ts` for the import?

Svelte components are not serializable. `+page.server.ts` can only return JSON-safe
data. The `.svx` component must be imported in a universal load function (`+page.ts`)
that runs in both SSR and client contexts.

### Syntax highlighting

- **`.md` content:** shiki runs at request/build time via `marked` custom renderer
  (`$lib/utils/syntax-highlighting.ts`)
- **`.svx` content:** shiki runs at build time via mdsvex's `highlight` config in
  `svelte.config.js` (using `escapeSvelte` for safe template output)

Both use the same shiki themes and language list for visual consistency.

### Custom components

`.svx` content can use custom Svelte components without importing them. The mdsvex
layout (`$lib/layouts/content.svelte`) exports components via `<script module>`:

```svelte
<script module>
  export { default as Callout } from '$lib/components/content/Callout.svelte';
</script>
```

Studio writes `<Callout type="tip">` in the markdown. mdsvex resolves the tag name
to the exported component at compile time.

#### Adding a new custom component

1. Create the component in `$lib/components/content/`
2. Export it from `$lib/layouts/content.svelte`'s module script
3. Document the component's props and usage for studio

#### Available components

| Component  | Props                          | Description          |
|------------|--------------------------------|----------------------|
| `Callout`  | `type`: info/warning/tip/note, `title`: string | Styled aside box |

### Image handling

- **`.md` content:** image URLs are transformed by `transformImageUrls()` at load time
- **`.svx` content:** images use standard markdown syntax. The content-images Vite
  plugin serves them in dev and optimizes them at build time (same as `.md`)

### DEV_CONTENT_DIR

When `DEV_CONTENT_DIR` is set, Vite needs `server.fs.allow` to access `.svx` files
outside the project root. This is configured in `vite.config.ts`.
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/docs/rendering-pipeline.md
git commit -m "docs: rendering pipeline — why, what, how for dual md/svx support"
```

---

## Task 9: Update CLAUDE.md with rendering pipeline info

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Add rendering pipeline section to CLAUDE.md**

In the `## Content Architecture` section, after the Publishing States table, add:

```markdown
### Rendering Pipeline

Two rendering paths, selected per content item by which file exists:

- **`content.md`** — plain markdown rendered by `marked` + shiki at runtime → `{@html}`. Default for all content.
- **`content.svx`** — markdown with Svelte components, compiled by mdsvex at build time → dynamic Svelte component. Used when content needs interactive elements.

Custom components (e.g. `<Callout>`) are provided by the mdsvex layout at `$lib/layouts/content.svelte`. Add new components there.

Full documentation: `apps/web/docs/rendering-pipeline.md`
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add rendering pipeline overview to CLAUDE.md"
```

---

Plan complete and saved to `docs/superpowers/plans/2026-03-27-dual-rendering-pipeline.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?