<script lang="ts">
	import { getContext } from 'svelte';
	import type { Readable } from 'svelte/store';

	const { data, xGet, yGet } = getContext<{
		data: Readable<Array<Record<string, unknown>>>;
		xGet: Readable<(d: Record<string, unknown>) => number>;
		yGet: Readable<(d: Record<string, unknown>) => number>;
	}>('LayerCake');

	let containerWidth = $state(300);
</script>

<div class="labels" bind:clientWidth={containerWidth}>
	{#each $data as d}
		{@const xPx = $xGet(d)}
		{@const yPx = $yGet(d)}
		{@const flipLeft = xPx > containerWidth * 0.6}
		<div
			class="label"
			style="left: {xPx}px; top: {yPx}px; transform: translate({flipLeft ? 'calc(-100% - 8px)' : '8px'}, -50%);"
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
