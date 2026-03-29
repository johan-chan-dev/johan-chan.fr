<script lang="ts">
	import { getContext } from 'svelte';
	import type { Readable } from 'svelte/store';

	const { data, xGet, yGet } = getContext<{
		data: Readable<Array<Record<string, unknown>>>;
		xGet: Readable<(d: Record<string, unknown>) => number>;
		yGet: Readable<(d: Record<string, unknown>) => number>;
	}>('LayerCake');
</script>

<div class="labels">
	{#each $data as d}
		<div
			class="label"
			style="left: {$xGet(d)}%; top: {$yGet(d)}%;"
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
	}
	.label {
		position: absolute;
		transform: translate(10px, -50%);
		font-size: 12px;
		font-weight: 500;
		color: var(--color-base-content, #333);
		white-space: nowrap;
		pointer-events: none;
	}
</style>
