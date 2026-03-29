<script lang="ts">
	import { getContext } from 'svelte';
	import type { Readable } from 'svelte/store';

	const { data, xGet, yGet } = getContext<{
		data: Readable<Array<Record<string, unknown>>>;
		xGet: Readable<(d: Record<string, unknown>) => number>;
		yGet: Readable<(d: Record<string, unknown>) => number>;
	}>('LayerCake');

	function labelTransform(xPct: number, yPct: number): string {
		// Flip label to the left when point is in the right 30% of the chart
		const dx = xPct > 70 ? 'calc(-100% - 10px)' : '10px';
		// Shift label down when near top, up when near bottom
		const dy = yPct < 15 ? '2px' : yPct > 85 ? 'calc(-100% - 2px)' : '-50%';
		return `translate(${dx}, ${dy})`;
	}
</script>

<div class="labels">
	{#each $data as d}
		{@const xPct = $xGet(d)}
		{@const yPct = $yGet(d)}
		<div
			class="label"
			style="left: {xPct}%; top: {yPct}%; transform: {labelTransform(xPct, yPct)};"
		>
			{d.label as string}
		</div>
	{/each}
</div>

<style>
	.labels {
		width: 100%;
		height: 100%;
		position: relative;
		overflow: hidden;
	}
	.label {
		position: absolute;
		font-size: 11px;
		font-weight: 600;
		color: var(--color-base-content, #333);
		white-space: nowrap;
		pointer-events: none;
	}
</style>
