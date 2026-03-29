<script lang="ts">
	import { LayerCake, Svg, Html } from 'layercake';
	import QuadrantBackground from './chart/QuadrantBackground.svelte';
	import Crosshair from './chart/Crosshair.svelte';
	import ScatterPoints from './chart/ScatterPoints.svelte';
	import ScatterLabels from './chart/ScatterLabels.svelte';

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

<figure class="scatter-chart-wrapper">
	<div class="chart-row">
		{#if yLabel}
			<div class="y-label"><span>{yLabel}</span></div>
		{/if}
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
				</Html>
			</LayerCake>
		</div>
	</div>
	{#if xLabel}
		<div class="x-label">{xLabel}</div>
	{/if}
</figure>

<style>
	.scatter-chart-wrapper {
		margin: 2rem 0;
		overflow: hidden;
	}
	.chart-row {
		display: flex;
		align-items: stretch;
	}
	.chart-container {
		flex: 1;
		height: 400px;
		position: relative;
	}
	.y-label {
		display: flex;
		align-items: center;
		font-size: 12px;
		color: var(--color-base-content, #666);
		opacity: 0.6;
		white-space: nowrap;
		padding-right: 6px;
	}
	.y-label span {
		writing-mode: vertical-lr;
		transform: rotate(180deg);
	}
	.x-label {
		text-align: center;
		font-size: 12px;
		color: var(--color-base-content, #666);
		opacity: 0.6;
		padding-top: 6px;
	}
	@media (max-width: 640px) {
		.chart-container {
			height: 300px;
		}
		.y-label {
			font-size: 10px;
		}
	}
</style>
