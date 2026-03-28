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

### Adding New Components

New components are added in the web app at `apps/web/src/lib/components/content/` and exported from the barrel file (`index.ts`). They become available as `C.ComponentName` in all `.svx` files automatically. Update this documentation when adding new components.
