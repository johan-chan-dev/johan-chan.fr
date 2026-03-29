<script lang="ts">
	import { getContext } from 'svelte';
	import type { Readable } from 'svelte/store';

	const { data, xGet, yGet } = getContext<{
		data: Readable<Array<Record<string, unknown>>>;
		xGet: Readable<(d: Record<string, unknown>) => number>;
		yGet: Readable<(d: Record<string, unknown>) => number>;
	}>('LayerCake');

	interface Props {
		baseRadius?: number;
		fill?: string;
	}

	const { baseRadius = 20, fill = 'var(--color-primary, #6366f1)' }: Props = $props();
</script>

{#each $data as d}
	{@const size = (d.size as number) ?? 1}
	{@const opacity = (d.opacity as number) ?? 0.25}
	<circle
		cx={$xGet(d)}
		cy={$yGet(d)}
		r={baseRadius * size}
		fill={(d.color as string) || fill}
		fill-opacity={opacity}
		stroke={(d.color as string) || fill}
		stroke-opacity={opacity + 0.3}
		stroke-width="1.5"
	/>
{/each}
