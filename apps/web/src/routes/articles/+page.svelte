<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import ContentFeed from '$lib/components/ContentFeed.svelte';
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{m['articles.page_title']()}</title>
	<meta name="description" content={m['articles.page_description']()} />
</svelte:head>

<div class="max-w-3xl md:max-w-4xl xl:max-w-6xl 2xl:max-w-7xl mx-auto">
	<header class="mb-8">
		<h1 class="text-3xl md:text-4xl font-bold mb-3">{m['articles.heading']()}</h1>
		<p class="text-lg text-base-content/60">{m['articles.lead_text']()}</p>
	</header>

	<ContentFeed items={data.content} emptyMessage={m['articles.empty']()} />
</div>

<style>
	@reference "tailwindcss";
</style>
