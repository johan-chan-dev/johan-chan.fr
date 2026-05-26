<script lang="ts">
	import { dev } from '$app/environment';
	import type { Snippet } from 'svelte';

	interface Props {
		label?: string;
		children: Snippet;
	}

	let { label = 'DEV ONLY', children }: Props = $props();
</script>

{#if dev}
	<div class="relative border-2 border-dashed border-warning/50 rounded-lg p-4 pt-6">
		<span
			class="absolute -top-3 left-3 bg-warning text-warning-content text-xs font-bold px-2 py-0.5 rounded"
		>
			{label}
		</span>
		{@render children()}
	</div>
{/if}

<style>
	@reference "tailwindcss";
</style>
