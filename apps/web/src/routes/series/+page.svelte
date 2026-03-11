<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { appHref } from '$lib/utils/href';
	import Icon from '@iconify/svelte';
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{m['series.page_title']()}</title>
	<meta name="description" content={m['series.page_description']()} />
</svelte:head>

<div class="max-w-3xl md:max-w-4xl xl:max-w-6xl 2xl:max-w-7xl mx-auto">
	<header class="mb-8">
		<h1 class="text-3xl md:text-4xl font-bold mb-3">{m['series.heading']()}</h1>
		<p class="text-lg text-base-content/60">{m['series.lead_text']()}</p>
	</header>

	{#if data.series.length === 0}
		<div class="text-center py-12 text-base-content/60">
			<p>{m['series.empty']()}</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
			{#each data.series as series}
				<article class="series-card">
					{#if series.coverUrl}
						<a href={appHref(`/series/${series.slug}`)} class="series-cover-link">
							<img src={series.coverUrl} alt="" class="series-cover" />
						</a>
					{/if}

					<div class="card-body">
						<div class="flex items-start justify-between gap-4">
							<div>
								<a href={appHref(`/series/${series.slug}`)} class="series-title-link">
									<h2 class="card-title text-xl uppercase tracking-wider">{series.title}</h2>
								</a>
								<p class="text-base-content/70 mt-1">{series.description}</p>
							</div>
							<span class="badge badge-secondary shrink-0">
								{series.items.length} {m['series.chapters']()}
							</span>
						</div>

						<!-- Chapter progress -->
						<div class="flex flex-wrap gap-2 mt-4">
							{#each series.items as item, index}
								<a
									href={appHref(`/series/${series.slug}/${item.slug}`)}
									class="btn btn-sm btn-outline gap-1"
									class:btn-primary={item.slug}
								>
									<Icon icon="teenyicons:book-outline" width="12" height="12" />
									Ch.{index + 1}
								</a>
							{/each}
						</div>
					</div>
				</article>
			{/each}
		</div>
	{/if}
</div>

<style>
	@reference "tailwindcss";
	@plugin "daisyui";

	.series-card {
		@apply card bg-base-100 border border-base-300 h-fit overflow-hidden;
	}

	.series-cover-link {
		@apply block overflow-hidden;
	}

	.series-cover {
		@apply w-full h-48 object-cover transition-transform duration-300;
	}

	.series-cover-link:hover .series-cover {
		@apply scale-105;
	}

	.series-title-link {
		@apply no-underline hover:text-primary transition-colors;
	}
</style>
