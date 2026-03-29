<script lang="ts">
	import { getContext } from 'svelte';
	import type { Readable } from 'svelte/store';

	const { xScale, yScale, width, height } = getContext<{
		xScale: Readable<(v: number) => number>;
		yScale: Readable<(v: number) => number>;
		width: Readable<number>;
		height: Readable<number>;
	}>('LayerCake');

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
