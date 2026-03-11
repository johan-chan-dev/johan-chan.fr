<script lang="ts">
	import { dev } from '$app/environment';
	import { isPreviewMode } from '$lib/utils/preview';
	import type { Snippet } from 'svelte';

	interface Props {
		preview: boolean;
		children: Snippet;
	}

	const { preview, children }: Props = $props();

	const allowed = $derived(!preview || dev || isPreviewMode());
</script>

<svelte:head>
	{#if preview}
		<meta name="robots" content="noindex, nofollow" />
	{/if}
</svelte:head>

{#if allowed}
	{@render children()}
{:else}
	<div class="max-w-4xl mx-auto px-4 py-24 text-center">
		<h1 class="text-6xl font-bold text-base-content/30 mb-4">404</h1>
		<p class="text-base-content/60">Page non trouvée.</p>
	</div>
{/if}

<style>
	@reference "tailwindcss";
</style>
