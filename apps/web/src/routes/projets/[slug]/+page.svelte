<script lang="ts">
	import { appHref } from '$lib/utils/href';
	import Icon from '@iconify/svelte';
	import SEO from '$lib/components/SEO.svelte';

	const { data } = $props();
	const projet = $derived(data.projet);
</script>

<SEO title={projet.title} description={projet.seoDescription} type="article" />

<article class="max-w-3xl mx-auto py-8">
	<a
		href={appHref('/projets')}
		class="inline-flex items-center gap-1 text-sm text-base-content/60 hover:text-primary transition mb-6"
	>
		<Icon icon="mdi:arrow-left" width="16" height="16" />
		Réalisations
	</a>

	<header class="mb-8">
		<h1 class="text-2xl md:text-3xl font-bold mb-3">{projet.title}</h1>
		<p class="text-base-content/80 leading-relaxed">{projet.summary}</p>

		<div class="flex flex-wrap items-center gap-3 mt-5">
			<a
				href={projet.externalUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="btn btn-primary btn-sm gap-2"
			>
				Voir le site
				<Icon icon="mdi:open-in-new" width="16" height="16" />
			</a>
			<span class="text-sm text-base-content/50">{projet.status}</span>
		</div>
	</header>

	<div class="flex flex-col gap-4">
		{#each projet.sections as section (section.heading)}
			<section class="p-5 bg-base-200 rounded-lg">
				<h2 class="font-semibold mb-2">{section.heading}</h2>
				<p class="text-base-content/80 leading-relaxed">{section.body}</p>
			</section>
		{/each}
	</div>

	<section class="mt-6">
		<h2 class="text-sm uppercase tracking-wider text-base-content/50 font-medium mb-3">Stack</h2>
		<div class="flex flex-wrap gap-2">
			{#each projet.stack as tech (tech)}
				<span class="badge badge-ghost">{tech}</span>
			{/each}
		</div>
	</section>

	<aside
		class="mt-10 p-5 bg-base-200 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
	>
		<p class="text-base-content/80">Une idée à mener jusqu'en production ?</p>
		<a href={appHref('/call')} class="btn btn-primary btn-sm gap-2 shrink-0">
			Réserver un appel
			<Icon icon="mdi:calendar-clock" width="16" height="16" />
		</a>
	</aside>
</article>

<style>
	@reference "tailwindcss";
</style>
