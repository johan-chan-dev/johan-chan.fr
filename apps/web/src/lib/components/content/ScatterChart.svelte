<script lang="ts">
	import { LayerCake, Svg, Html } from 'layercake';
	import QuadrantBackground from './chart/QuadrantBackground.svelte';
	import Crosshair from './chart/Crosshair.svelte';
	import ScatterPoints from './chart/ScatterPoints.svelte';
	import ScatterLabels from './chart/ScatterLabels.svelte';
	import AxisLabels from './chart/AxisLabels.svelte';

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

<div class="scatter-chart-wrapper">
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
				<AxisLabels {xLabel} {yLabel} />
			</Html>
		</LayerCake>
	</div>
</div>

<style>
	.scatter-chart-wrapper {
		margin: 2rem 0;
	}
	.chart-container {
		width: 100%;
		height: 400px;
		position: relative;
	}
	@media (max-width: 640px) {
		.chart-container {
			height: 300px;
		}
	}
</style>
