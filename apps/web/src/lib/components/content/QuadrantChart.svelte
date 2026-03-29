<script lang="ts">
	interface Quadrant {
		title: string;
		items: string[];
	}

	interface Props {
		xLabel?: string;
		yLabel?: string;
		quadrants: [Quadrant, Quadrant, Quadrant, Quadrant];
	}

	const { xLabel, yLabel, quadrants }: Props = $props();

	const fills = [
		'var(--chart-q1, rgba(34, 197, 94, 0.08))',
		'var(--chart-q2, rgba(234, 179, 8, 0.08))',
		'var(--chart-q3, rgba(239, 68, 68, 0.08))',
		'var(--chart-q4, rgba(234, 179, 8, 0.08))'
	];
</script>

<figure class="quadrant-chart-wrapper">
	<div class="chart-row">
		{#if yLabel}
			<div class="y-label"><span>{yLabel}</span></div>
		{/if}
		<div class="chart-container">
			<div class="grid">
				{#each quadrants as q, i}
					<div class="quadrant" style="background: {fills[i]}">
						<div class="quadrant-title">{q.title}</div>
						<div class="quadrant-items">
							{#each q.items as item}
								<span class="item-tag">{item}</span>
							{/each}
						</div>
					</div>
				{/each}
			</div>
			<!-- Center crosshair lines -->
			<div class="crosshair-h"></div>
			<div class="crosshair-v"></div>
		</div>
	</div>
	{#if xLabel}
		<div class="x-label">{xLabel}</div>
	{/if}
</figure>

<style>
	@reference "tailwindcss";
	@plugin "daisyui";

	.quadrant-chart-wrapper {
		margin: 2rem 0;
		overflow: hidden;
	}
	.chart-row {
		display: flex;
		align-items: stretch;
	}
	.chart-container {
		flex: 1;
		position: relative;
		border-radius: 0.5rem;
		overflow: hidden;
	}
	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: 1fr 1fr;
		min-height: 300px;
	}
	.quadrant {
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.quadrant-title {
		font-size: 10px;
		font-style: italic;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		color: var(--color-base-content, #888);
		opacity: 0.5;
	}
	.quadrant-items {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}
	.item-tag {
		@apply bg-base-content/10 text-base-content px-2 py-0.5 rounded-full text-sm font-medium;
	}

	/* Crosshair lines */
	.crosshair-h, .crosshair-v {
		position: absolute;
		pointer-events: none;
	}
	.crosshair-h {
		top: 50%;
		left: 0;
		right: 0;
		border-top: 1px dashed var(--color-base-content, #888);
		opacity: 0.15;
	}
	.crosshair-v {
		left: 50%;
		top: 0;
		bottom: 0;
		border-left: 1px dashed var(--color-base-content, #888);
		opacity: 0.15;
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
		.grid {
			min-height: 250px;
		}
		.quadrant {
			padding: 0.75rem;
		}
		.item-tag {
			font-size: 12px;
		}
		.y-label {
			font-size: 10px;
		}
	}
</style>
