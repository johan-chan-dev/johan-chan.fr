# Content Package

Read-only content mirror managed by le-cockpit's studio. Do not edit content files directly — changes are overwritten on next publish.

## Content Components

When a content item needs interactive Svelte components, use `content.svx` instead of `content.md`. All components are auto-injected under the `C` namespace — no imports needed.

### Usage

```svelte
<C.Callout type="tip" title="Pro tip">
This renders as a styled callout box.
</C.Callout>

Regular **markdown** works alongside components.
```

### Available Components

#### `C.Callout`

Styled aside box for tips, warnings, notes, and info.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'info' \| 'warning' \| 'tip' \| 'note'` | `'info'` | Visual style variant |
| `title` | `string` | — | Optional heading text |

Variants:
- `info` — blue, informational
- `warning` — orange, caution
- `tip` — green, helpful advice
- `note` — neutral, supplementary

```svelte
<C.Callout type="warning" title="Breaking change">
This API was removed in v3.
</C.Callout>
```

## Three Ways to Use Components

| Need | Approach | Import |
|------|----------|--------|
| Shared component (Callout, etc.) | `<C.Callout>` | Auto-injected, no import needed |
| Inline one-off logic | `<script>` + markup in `.svx` | N/A — write directly in the file |
| Complex one-off component | Colocate `.svelte` file next to `content.svx` | `import Demo from './Demo.svelte'` |

### Shared components (`C.` namespace)

Available everywhere, no imports. See "Available Components" above.

### Inline logic

`.svx` is a Svelte file — reactive logic works directly:

```svelte
<script>
let count = $state(0);
</script>

Click the button: <button onclick={() => count++}>Clicked {count} times</button>

Regular **markdown** continues here.
```

### Colocated components

For complex one-off components, create a `.svelte` file next to `content.svx` in the same folder:

```
articles/my-article/
├── meta.json
├── content.svx
├── InteractiveDemo.svelte    ← colocated component
└── images/
```

Import with a relative path in `content.svx`:

```svelte
<script>
import InteractiveDemo from './InteractiveDemo.svelte';
</script>

## Try it out

<InteractiveDemo />
```

Colocated components are only available to the content item they live with. They support full Svelte 5 features (runes, snippets, transitions, etc.).

## Adding New Shared Components

New shared components are added in the web app at `apps/web/src/lib/components/content/` and exported from the barrel file (`index.ts`). They become available as `C.ComponentName` in all `.svx` files automatically. Update this documentation when adding new components.
