<script lang="ts">
	import { getContext } from 'svelte';
	import type { Readable } from 'svelte/store';

	const { data, xGet, yGet } = getContext<{
		data: Readable<Array<Record<string, unknown>>>;
		xGet: Readable<(d: Record<string, unknown>) => number>;
		yGet: Readable<(d: Record<string, unknown>) => number>;
	}>('LayerCake');

	interface Arrow {
		from: string;
		to: string;
	}

	interface Props {
		arrows: Arrow[];
	}

	const { arrows }: Props = $props();

	function findPoint(label: string): Record<string, unknown> | undefined {
		return $data.find((d) => (d.label as string) === label);
	}
</script>

<defs>
	<marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
		<polygon points="0 0, 8 3, 0 6" fill="var(--color-base-content, #888)" opacity="0.5" />
	</marker>
</defs>

{#each arrows as arrow}
	{@const from = findPoint(arrow.from)}
	{@const to = findPoint(arrow.to)}
	{#if from && to}
		<line
			x1={$xGet(from)}
			y1={$yGet(from)}
			x2={$xGet(to)}
			y2={$yGet(to)}
			stroke="var(--color-base-content, #888)"
			stroke-width="1.5"
			stroke-dasharray="4 3"
			opacity="0.4"
			marker-end="url(#arrowhead)"
		/>
	{/if}
{/each}
