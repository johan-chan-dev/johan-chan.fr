<script lang="ts">
	import { appHref } from '$lib/utils/href';
	import Icon from '@iconify/svelte';
	import { publishedProjets } from '$lib/data/projets';
</script>

<div class="max-w-4xl mx-auto py-8">
	<header class="mb-10">
		<h1 class="text-2xl md:text-3xl font-bold mb-2">Réalisations</h1>
		<p class="text-base-content/80 leading-relaxed">
			Des projets menés de l'idée à la production, d'un seul tenant.
		</p>
	</header>

	<div class="grid grid-cols-1 gap-4">
		{#each publishedProjets as projet (projet.slug)}
			<a
				href={appHref(`/projets/${projet.slug}`)}
				class="block p-5 bg-base-200 rounded-lg hover:bg-base-300 transition group"
			>
				<div class="flex items-start justify-between gap-4">
					<h2 class="text-lg font-semibold group-hover:text-primary transition">
						{projet.title}
					</h2>
					<Icon
						icon="mdi:arrow-right"
						width="20"
						height="20"
						class="shrink-0 mt-1 text-base-content/40 group-hover:text-primary transition"
					/>
				</div>
				<p class="text-sm text-base-content/70 leading-relaxed mt-2">
					{projet.summary}
				</p>
				<div class="flex flex-wrap gap-2 mt-4">
					{#each projet.tags as tag (tag)}
						<span class="badge badge-sm badge-ghost">{tag}</span>
					{/each}
				</div>
			</a>
		{:else}
			<p class="text-base-content/60">Aucune réalisation pour le moment.</p>
		{/each}
	</div>
</div>

<style>
	@reference "tailwindcss";
</style>
