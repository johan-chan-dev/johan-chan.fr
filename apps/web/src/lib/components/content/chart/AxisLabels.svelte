<script lang="ts">
	interface Props {
		xLabel?: string;
		yLabel?: string;
	}

	const { xLabel, yLabel }: Props = $props();
</script>

<div class="axis-labels">
	{#if xLabel}
		<div class="x-label">{xLabel}</div>
	{/if}
	{#if yLabel}
		<div class="y-label">{yLabel}</div>
	{/if}
</div>

<style>
	.axis-labels {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}
	.x-label {
		position: absolute;
		bottom: -24px;
		left: 50%;
		transform: translateX(-50%);
		font-size: 12px;
		color: var(--color-base-content, #666);
		opacity: 0.6;
	}
	.y-label {
		position: absolute;
		left: -24px;
		top: 50%;
		transform: translateY(-50%) rotate(-90deg);
		font-size: 12px;
		color: var(--color-base-content, #666);
		opacity: 0.6;
		white-space: nowrap;
	}
</style>
