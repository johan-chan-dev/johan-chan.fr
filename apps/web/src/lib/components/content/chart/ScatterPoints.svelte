<script lang="ts">
	import { getContext } from 'svelte';
	import type { Readable } from 'svelte/store';

	const { data, xGet, yGet } = getContext<{
		data: Readable<Array<Record<string, unknown>>>;
		xGet: Readable<(d: Record<string, unknown>) => number>;
		yGet: Readable<(d: Record<string, unknown>) => number>;
	}>('LayerCake');

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
		fill={(d.color as string | undefined) || fill}
		stroke="var(--color-base-100, #fff)"
		stroke-width="2"
	/>
{/each}
