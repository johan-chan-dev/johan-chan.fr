<script lang="ts">
	import { getContext } from 'svelte';
	import type { Readable } from 'svelte/store';

	const { xScale, yScale, width, height } = getContext<{
		xScale: Readable<(v: number) => number>;
		yScale: Readable<(v: number) => number>;
		width: Readable<number>;
		height: Readable<number>;
	}>('LayerCake');

	interface Props {
		labels?: [string, string, string, string];
	}

	const { labels }: Props = $props();

	let cx = $derived($xScale(50));
	let cy = $derived($yScale(50));

	const fills = [
		'var(--chart-q1, rgba(34, 197, 94, 0.08))',
		'var(--chart-q2, rgba(234, 179, 8, 0.08))',
		'var(--chart-q3, rgba(239, 68, 68, 0.08))',
		'var(--chart-q4, rgba(234, 179, 8, 0.08))'
	];
</script>

<rect x="0" y="0" width={cx} height={cy} fill={fills[0]} />
<rect x={cx} y="0" width={$width - cx} height={cy} fill={fills[1]} />
<rect x={cx} y={cy} width={$width - cx} height={$height - cy} fill={fills[2]} />
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
