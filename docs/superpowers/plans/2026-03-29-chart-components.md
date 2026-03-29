# Chart Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a reusable `<C.ScatterChart>` component powered by LayerCake for data visualization in `.svx` content, starting with a language positioning scatter plot for the "Boring languages win" article.

**Architecture:** LayerCake provides the responsive chart container and scale math. We build thin Svelte wrapper components on top: `ScatterChart.svelte` (public API, props match what content authors write), composed of internal sub-components for points, labels, quadrants, and axes. All rendered as SVG with SSR support. Dark mode via CSS custom properties inheriting from DaisyUI theme.

**Tech Stack:** LayerCake 10.x, Svelte 5, SVG, DaisyUI theme tokens

**Prerequisites:** The shiki config unification (separate plan) should ideally be done first, but is not blocking.

---

## File Structure

```
apps/web/
├── src/lib/components/content/
│   ├── index.ts                          # MODIFY: export ScatterChart
│   ├── ScatterChart.svelte               # CREATE: public component (props → LayerCake)
│   ├── CLAUDE.md                         # MODIFY: document ScatterChart
│   └── chart/
│       ├── ScatterPoints.svelte          # CREATE: SVG circles for data points
│       ├── ScatterLabels.svelte          # CREATE: HTML labels positioned next to points
│       ├── QuadrantBackground.svelte     # CREATE: SVG rects + labels for 4 quadrants
│       ├── AxisLabels.svelte             # CREATE: axis title labels (xLabel, yLabel)
│       └── Crosshair.svelte             # CREATE: SVG center lines dividing quadrants
```

---

## Task 1: Install LayerCake

**Files:**
- Modify: `apps/web/package.json` (via pnpm add)

- [ ] **Step 1: Install layercake**

```bash
pnpm turbo run add -- --filter=@johan-chan/web layercake
```

If that doesn't work:

```bash
cd apps/web && pnpm add layercake
```

- [ ] **Step 2: Verify installation**

```bash
cd apps/web && node -e "import('layercake').then(m => console.log('OK', Object.keys(m)))"
```

Expected: `OK [ 'LayerCake', 'Svg', 'Html', 'Canvas', 'WebGL', ... ]`

- [ ] **Step 3: Verify type check still passes**

```bash
pnpm turbo run check --filter=@johan-chan/web
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/package.json pnpm-lock.yaml
git commit -m "chore: add layercake dependency for chart components"
```

---

## Task 2: Create internal chart sub-components

**Files:**
- Create: `apps/web/src/lib/components/content/chart/QuadrantBackground.svelte`
- Create: `apps/web/src/lib/components/content/chart/Crosshair.svelte`
- Create: `apps/web/src/lib/components/content/chart/ScatterPoints.svelte`
- Create: `apps/web/src/lib/components/content/chart/ScatterLabels.svelte`
- Create: `apps/web/src/lib/components/content/chart/AxisLabels.svelte`

These are internal LayerCake layer components that use `getContext('LayerCake')` to access scales and data. They are NOT exported from the barrel — only `ScatterChart` is public.

- [ ] **Step 1: Create QuadrantBackground.svelte**

Renders 4 colored SVG rectangles behind the data points, with optional text labels in each quadrant. Uses LayerCake's xScale and yScale to find the center point (50 in data coordinates).

```svelte
<!-- apps/web/src/lib/components/content/chart/QuadrantBackground.svelte -->
<script lang="ts">
	import { getContext } from 'svelte';

	const { xScale, yScale, width, height } = getContext('LayerCake');

	interface Props {
		labels?: [string, string, string, string];
	}

	const { labels }: Props = $props();

	// Center lines at 50 (data midpoint)
	let cx = $derived($xScale(50));
	let cy = $derived($yScale(50));

	// Quadrant colors — subtle, works in both light and dark
	const fills = [
		'var(--chart-q1, rgba(34, 197, 94, 0.08))',
		'var(--chart-q2, rgba(234, 179, 8, 0.08))',
		'var(--chart-q3, rgba(239, 68, 68, 0.08))',
		'var(--chart-q4, rgba(234, 179, 8, 0.08))'
	];
</script>

<!-- Q1: top-left (boring + strict = sweet spot) -->
<rect x="0" y="0" width={cx} height={cy} fill={fills[0]} />
<!-- Q2: top-right (expressive + strict) -->
<rect x={cx} y="0" width={$width - cx} height={cy} fill={fills[1]} />
<!-- Q3: bottom-right (expressive + permissive = worst) -->
<rect x={cx} y={cy} width={$width - cx} height={$height - cy} fill={fills[2]} />
<!-- Q4: bottom-left (boring + permissive) -->
<rect x="0" y={cy} width={cx} height={$height - cy} fill={fills[3]} />

{#if labels}
	<text x={cx / 2} y={cy / 2} text-anchor="middle" dominant-baseline="middle" class="quadrant-label">{labels[0]}</text>
	<text x={cx + ($width - cx) / 2} y={cy / 2} text-anchor="middle" dominant-baseline="middle" class="quadrant-label">{labels[1]}</text>
	<text x={cx + ($width - cx) / 2} y={cy + ($height - cy) / 2} text-anchor="middle" dominant-baseline="middle" class="quadrant-label">{labels[2]}</text>
	<text x={cx / 2} y={cy + ($height - cy) / 2} text-anchor="middle" dominant-baseline="middle" class="quadrant-label">{labels[3]}</text>
{/if}

<style>
	.quadrant-label {
		font-size: 11px;
		fill: var(--color-base-content, #888);
		opacity: 0.4;
		pointer-events: none;
		font-style: italic;
	}
</style>
```

- [ ] **Step 2: Create Crosshair.svelte**

Renders dashed SVG lines at the center (50, 50 in data coordinates) to visually divide the 4 quadrants.

```svelte
<!-- apps/web/src/lib/components/content/chart/Crosshair.svelte -->
<script lang="ts">
	import { getContext } from 'svelte';

	const { xScale, yScale, width, height } = getContext('LayerCake');

	let cx = $derived($xScale(50));
	let cy = $derived($yScale(50));
</script>

<line x1={cx} y1="0" x2={cx} y2={$height} class="crosshair" />
<line x1="0" y1={cy} x2={$width} y2={cy} class="crosshair" />

<style>
	.crosshair {
		stroke: var(--color-base-content, #888);
		stroke-width: 1;
		stroke-dasharray: 4 4;
		opacity: 0.2;
	}
</style>
```

- [ ] **Step 3: Create ScatterPoints.svelte**

Renders SVG circles for each data point. Supports optional per-point color.

```svelte
<!-- apps/web/src/lib/components/content/chart/ScatterPoints.svelte -->
<script lang="ts">
	import { getContext } from 'svelte';

	const { data, xGet, yGet } = getContext('LayerCake');

	interface Props {
		r?: number;
		fill?: string;
	}

	const { r = 6, fill = 'var(--color-primary, #6366f1)' }: Props = $props();
</script>

{#each $data as d}
	<circle
		cx={$xGet(d)}
		cy={$yGet(d)}
		r={r}
		fill={d.color || fill}
		stroke="var(--color-base-100, #fff)"
		stroke-width="2"
	/>
{/each}
```

- [ ] **Step 4: Create ScatterLabels.svelte**

HTML layer that positions text labels next to each point. Uses percentage-based positioning from LayerCake.

```svelte
<!-- apps/web/src/lib/components/content/chart/ScatterLabels.svelte -->
<script lang="ts">
	import { getContext } from 'svelte';

	const { data, xGet, yGet } = getContext('LayerCake');
</script>

<div class="labels">
	{#each $data as d}
		<div
			class="label"
			style="left: {$xGet(d)}%; top: {$yGet(d)}%;"
		>
			{d.label}
		</div>
	{/each}
</div>

<style>
	.labels {
		width: 100%;
		height: 100%;
		position: relative;
	}
	.label {
		position: absolute;
		transform: translate(10px, -50%);
		font-size: 12px;
		font-weight: 500;
		color: var(--color-base-content, #333);
		white-space: nowrap;
		pointer-events: none;
	}
</style>
```

- [ ] **Step 5: Create AxisLabels.svelte**

Renders axis title labels at the bottom (x) and left (y) of the chart. This is NOT tick marks — just the axis names like "Boring → Expressif".

```svelte
<!-- apps/web/src/lib/components/content/chart/AxisLabels.svelte -->
<script lang="ts">
	interface Props {
		xLabel?: string;
		yLabel?: string;
	}

	const { xLabel, yLabel }: Props = $props();
</script>

<div class="axis-labels">
	{#if xLabel}
		<div class="x-label">{xLabel}</div>
	{/if}
	{#if yLabel}
		<div class="y-label">{yLabel}</div>
	{/if}
</div>

<style>
	.axis-labels {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}
	.x-label {
		position: absolute;
		bottom: -24px;
		left: 50%;
		transform: translateX(-50%);
		font-size: 12px;
		color: var(--color-base-content, #666);
		opacity: 0.6;
	}
	.y-label {
		position: absolute;
		left: -24px;
		top: 50%;
		transform: translateY(-50%) rotate(-90deg);
		font-size: 12px;
		color: var(--color-base-content, #666);
		opacity: 0.6;
		white-space: nowrap;
	}
</style>
```

- [ ] **Step 6: Verify type check**

```bash
pnpm turbo run check --filter=@johan-chan/web
```

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/lib/components/content/chart/
git commit -m "feat: add internal chart sub-components for LayerCake scatter"
```

---

## Task 3: Create ScatterChart public component

**Files:**
- Create: `apps/web/src/lib/components/content/ScatterChart.svelte`
- Modify: `apps/web/src/lib/components/content/index.ts`

- [ ] **Step 1: Create ScatterChart.svelte**

This is the public component that content authors use as `<C.ScatterChart>`. It accepts the props from NOTES.md and composes the LayerCake chart with internal sub-components.

```svelte
<!-- apps/web/src/lib/components/content/ScatterChart.svelte -->
<script lang="ts">
	import { LayerCake, Svg, Html } from 'layercake';
	import QuadrantBackground from './chart/QuadrantBackground.svelte';
	import Crosshair from './chart/Crosshair.svelte';
	import ScatterPoints from './chart/ScatterPoints.svelte';
	import ScatterLabels from './chart/ScatterLabels.svelte';
	import AxisLabels from './chart/AxisLabels.svelte';

	interface Point {
		label: string;
		x: number;
		y: number;
		color?: string;
	}

	interface Props {
		xLabel?: string;
		yLabel?: string;
		points: Point[];
		quadrants?: [string, string, string, string];
	}

	const { xLabel, yLabel, points, quadrants }: Props = $props();
</script>

<div class="scatter-chart-wrapper">
	<div class="chart-container">
		<LayerCake
			x="x"
			y="y"
			xDomain={[0, 100]}
			yDomain={[0, 100]}
			yReverse={true}
			padding={{ top: 20, right: 20, bottom: 20, left: 20 }}
			data={points}
			ssr={true}
		>
			<Svg>
				<QuadrantBackground labels={quadrants} />
				<Crosshair />
				<ScatterPoints />
			</Svg>

			<Html>
				<ScatterLabels />
				<AxisLabels {xLabel} {yLabel} />
			</Html>
		</LayerCake>
	</div>
</div>

<style>
	.scatter-chart-wrapper {
		margin: 2rem 0;
	}
	.chart-container {
		width: 100%;
		height: 400px;
		position: relative;
	}
	@media (max-width: 640px) {
		.chart-container {
			height: 300px;
		}
	}
</style>
```

**Key design decisions:**
- `xDomain` and `yDomain` are fixed at `[0, 100]` — points use percentage coordinates as specified in NOTES.md
- `yReverse: true` — SVG y-axis goes top-down, but we want high values (strict) at the top
- `ssr: true` — for prerendering support
- `padding` gives room for labels at edges
- Height: 400px desktop, 300px mobile

- [ ] **Step 2: Export from barrel file**

Modify `apps/web/src/lib/components/content/index.ts`:

```ts
export { default as Callout } from './Callout.svelte';
export { default as ScatterChart } from './ScatterChart.svelte';
```

- [ ] **Step 3: Verify type check**

```bash
pnpm turbo run check --filter=@johan-chan/web
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/lib/components/content/ScatterChart.svelte \
        apps/web/src/lib/components/content/index.ts
git commit -m "feat: add ScatterChart component with LayerCake"
```

---

## Task 4: Visual test with the article's actual data

**Files:**
- Modify: `le-cockpit: packages/content/articles/boring-languages-win/content.svx` (temporary test, then revert)

- [ ] **Step 1: Add the scatter chart to the article**

In `content.svx`, find a suitable location (after the "sweet spot" discussion) and add:

```svelte
<C.ScatterChart
  xLabel="Boring → Expressif"
  yLabel="Permissif → Strict"
  quadrants={["Sweet spot LLM", "Strict mais complexe", "Le pire combo", "Boring mais dangereux"]}
  points={[
    { label: "Go", x: 10, y: 85 },
    { label: "Java", x: 25, y: 80 },
    { label: "C", x: 15, y: 25 },
    { label: "TypeScript", x: 45, y: 75 },
    { label: "Rust", x: 70, y: 95 },
    { label: "C#", x: 55, y: 75 },
    { label: "Python", x: 75, y: 20 },
    { label: "JavaScript", x: 72, y: 18 },
    { label: "Ruby", x: 90, y: 15 }
  ]}
/>
```

- [ ] **Step 2: Start dev server and verify**

```bash
pnpm dev
```

Open the article page in the browser. Verify:
- Chart renders with 9 labeled points
- 4 quadrant backgrounds are visible with labels
- Dashed crosshair lines divide the chart
- Axis labels show at bottom (x) and left (y)
- Responsive: resize browser to mobile width, chart shrinks
- Dark mode: toggle theme, chart adapts

- [ ] **Step 3: Take screenshots for comparison**

```bash
cd apps/web && pnpm exec playwright screenshot --viewport-size="375,812" --full-page http://localhost:5173/articles/boring-languages-win /tmp/scatter-mobile.png
pnpm exec playwright screenshot --viewport-size="1280,720" http://localhost:5173/articles/boring-languages-win /tmp/scatter-desktop.png
```

Review the screenshots for:
- Points don't overlap excessively
- Labels are readable
- No horizontal overflow
- Quadrant labels are legible

- [ ] **Step 4: Iterate on visual issues**

Common issues to fix:
- Labels overlapping points → adjust `transform` offset in ScatterLabels
- Points too close to edges → adjust `padding` in ScatterChart
- Quadrant labels hard to read → adjust opacity/font-size in QuadrantBackground
- Mobile too cramped → adjust mobile height or hide some labels

Do NOT commit to the content repo — the chart position in the article is the author's decision.

- [ ] **Step 5: Commit chart component fixes (if any)**

```bash
git add apps/web/src/lib/components/content/
git commit -m "fix: adjust scatter chart layout from visual testing"
```

---

## Task 5: Update component documentation

**Files:**
- Modify: `apps/web/src/lib/components/content/CLAUDE.md`

- [ ] **Step 1: Add ScatterChart documentation**

Add after the Callout section:

```markdown
#### `C.ScatterChart`

Scatter plot with labeled quadrants. Powered by LayerCake.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `xLabel` | `string` | — | Label for the x-axis |
| `yLabel` | `string` | — | Label for the y-axis |
| `points` | `Array<{ label, x, y, color? }>` | required | Data points with 0-100 coordinates |
| `quadrants` | `[string, string, string, string]` | — | Labels for [top-left, top-right, bottom-right, bottom-left] quadrants |

Coordinates are percentages: `x: 0` = left edge, `x: 100` = right edge, `y: 0` = bottom, `y: 100` = top.

```svelte
<C.ScatterChart
  xLabel="Boring → Expressif"
  yLabel="Permissif → Strict"
  quadrants={["Sweet spot", "Complexe", "Pire combo", "Dangereux"]}
  points={[
    { label: "Go", x: 10, y: 85 },
    { label: "Python", x: 75, y: 20 },
    { label: "Rust", x: 70, y: 95, color: "#f59e0b" }
  ]}
/>
```
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/lib/components/content/CLAUDE.md
git commit -m "docs: add ScatterChart to content component reference"
```

---

## Task 6: Unify shiki configuration between pipelines

**Files:**
- Create: `apps/web/src/lib/utils/shiki-config.ts`
- Modify: `apps/web/src/lib/utils/syntax-highlighting.ts`
- Modify: `apps/web/svelte.config.js`

This task fixes the tech debt where shiki is configured in two places with slightly different behavior. Both pipelines should produce identical code block output.

- [ ] **Step 1: Create shared shiki config**

```ts
// apps/web/src/lib/utils/shiki-config.ts

/** Shiki themes used across both rendering pipelines */
export const SHIKI_THEMES = ['github-dark', 'github-light'] as const;

/** Default theme for code rendering */
export const SHIKI_DEFAULT_THEME = 'github-dark';

/** Languages supported by syntax highlighting */
export const SHIKI_LANGS = [
	'javascript', 'typescript', 'svelte', 'html', 'css',
	'json', 'bash', 'shell', 'yaml', 'markdown',
	'jsx', 'tsx', 'toml', 'dockerfile',
	'python', 'java', 'go', 'rust', 'c', 'cpp', 'sql'
] as const;

/** Common language aliases */
export const SHIKI_LANG_ALIASES: Record<string, string> = {
	js: 'javascript',
	ts: 'typescript',
	sh: 'bash',
	yml: 'yaml',
	md: 'markdown'
};

/** Shared transformers for consistent <pre>/<code> output */
export const SHIKI_TRANSFORMERS = [
	{
		pre(node: any) {
			node.properties.class = 'shiki-pre overflow-x-auto rounded-lg p-4 my-4';
		},
		code(node: any) {
			node.properties.class = 'shiki-code';
		}
	}
];
```

- [ ] **Step 2: Update syntax-highlighting.ts to use shared config**

Replace the hardcoded config in `apps/web/src/lib/utils/syntax-highlighting.ts`:

```ts
import { createHighlighter } from 'shiki';
import type { Highlighter } from 'shiki';
import {
	SHIKI_THEMES,
	SHIKI_LANGS,
	SHIKI_DEFAULT_THEME,
	SHIKI_LANG_ALIASES,
	SHIKI_TRANSFORMERS
} from './shiki-config';

let highlighter: Highlighter | null = null;

export async function initHighlighter(): Promise<Highlighter> {
	if (highlighter) {
		return highlighter;
	}

	highlighter = await createHighlighter({
		themes: [...SHIKI_THEMES],
		langs: [...SHIKI_LANGS]
	});

	return highlighter;
}

export async function createShikiRenderer() {
	const shiki = await initHighlighter();

	return {
		code(token: any): string {
			const code = token.text;
			const lang = token.lang;

			if (!lang) {
				return `<pre class="shiki-pre overflow-x-auto rounded-lg p-4 my-4 bg-gray-100 dark:bg-gray-800"><code class="shiki-code">${escapeHtml(code)}</code></pre>`;
			}

			const language = SHIKI_LANG_ALIASES[lang] || lang;

			try {
				return shiki.codeToHtml(code, {
					lang: language,
					theme: SHIKI_DEFAULT_THEME,
					transformers: SHIKI_TRANSFORMERS
				});
			} catch (error) {
				console.warn(`Failed to highlight code for language: ${lang}`, error);
				return `<pre class="shiki-pre overflow-x-auto rounded-lg p-4 my-4 bg-gray-100 dark:bg-gray-800"><code class="shiki-code">${escapeHtml(code)}</code></pre>`;
			}
		}
	};
}

function escapeHtml(text: string): string {
	const map: Record<string, string> = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;'
	};
	return text.replace(/[&<>"']/g, (m) => map[m]);
}
```

- [ ] **Step 3: Update svelte.config.js to use shared config**

Replace the hardcoded shiki setup in `apps/web/svelte.config.js`. Since `svelte.config.js` is JS (not TS), import the values:

```js
import { mdsvex, escapeSvelte } from 'mdsvex';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { createHighlighter } from 'shiki';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { contentComponents } from './src/lib/preprocessors/content-components.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Shared shiki config — keep in sync with src/lib/utils/shiki-config.ts
// Cannot import .ts directly in svelte.config.js, so values are duplicated here.
// If you add a language or change themes, update both files.
const SHIKI_THEMES = ['github-dark', 'github-light'];
const SHIKI_DEFAULT_THEME = 'github-dark';
const SHIKI_LANGS = [
	'javascript', 'typescript', 'svelte', 'html', 'css',
	'json', 'bash', 'shell', 'yaml', 'markdown',
	'jsx', 'tsx', 'toml', 'dockerfile',
	'python', 'java', 'go', 'rust', 'c', 'cpp', 'sql'
];
const SHIKI_TRANSFORMERS = [
	{
		pre(node) {
			node.properties.class = 'shiki-pre overflow-x-auto rounded-lg p-4 my-4';
		},
		code(node) {
			node.properties.class = 'shiki-code';
		}
	}
];

const shikiHighlighter = await createHighlighter({
	themes: SHIKI_THEMES,
	langs: SHIKI_LANGS
});

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [
		contentComponents(),
		vitePreprocess(),
		mdsvex({
			extensions: ['.svx'],
			layout: resolve(__dirname, './src/lib/layouts/content.svelte'),
			highlight: {
				highlighter: async (code, lang) => {
					const html = shikiHighlighter.codeToHtml(code, {
						lang: lang || 'text',
						theme: SHIKI_DEFAULT_THEME,
						transformers: SHIKI_TRANSFORMERS
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

**Note:** `svelte.config.js` cannot import `.ts` files directly. The config values are duplicated with a comment pointing to the canonical source. Both pipelines now use the exact same themes, languages, transformers, and default theme.

- [ ] **Step 4: Run visual regression tests**

```bash
cd apps/web && pnpm exec playwright test --project=visual-regression
```

All 14 tests must pass — code block rendering should be identical.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/utils/shiki-config.ts \
        apps/web/src/lib/utils/syntax-highlighting.ts \
        apps/web/svelte.config.js
git commit -m "refactor: unify shiki config between md and svx pipelines"
```

---

## Self-Review

**Spec coverage:**
- ScatterChart with xLabel, yLabel, points, quadrants props ✅
- Responsive + mobile ✅
- Dark mode via CSS vars ✅
- Generic/reusable (not hardcoded to one article) ✅
- Exported from barrel as `C.ScatterChart` ✅
- Documentation updated ✅
- Shiki unification ✅

**Placeholder scan:** All tasks have complete code. No TBDs.

**Type consistency:** `Point` interface used consistently (`{ label, x, y, color? }`). Props match NOTES.md spec. Quadrants is always `[string, string, string, string]` (tuple of 4).

**Note on testing:** LayerCake chart components are visual — unit testing SVG output has low value. The visual test in Task 4 (screenshot comparison) is the primary validation. The visual regression tests in Task 6 validate that existing `.md` content isn't affected by the shiki refactor.
