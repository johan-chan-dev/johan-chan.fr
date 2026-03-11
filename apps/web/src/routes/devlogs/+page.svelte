<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import Icon from '@iconify/svelte';
	import { formatDate } from '$lib/utils/format';
	import { appHref } from '$lib/utils/href';
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();
	const locale = 'fr-FR';
</script>

<svelte:head>
	<title>{m['devlogs.page_title']()}</title>
	<meta name="description" content={m['devlogs.page_description']()} />
</svelte:head>

<div class="max-w-3xl md:max-w-4xl xl:max-w-6xl 2xl:max-w-7xl mx-auto">
	<header class="mb-8">
		<h1 class="text-3xl md:text-4xl font-bold mb-3">{m['devlogs.heading']()}</h1>
		<p class="text-lg text-base-content/60">{m['devlogs.lead_text']()}</p>
	</header>

	{#if data.devlogs.length === 0}
		<div class="text-center py-12 text-base-content/60">
			<p>{m['devlogs.empty']()}</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
			{#each data.devlogs as project}
				<article class="card bg-base-100 border border-base-300 h-fit">
					<div class="card-body">
						<div class="flex items-start justify-between gap-4">
							<div class="flex-1">
								<h2 class="card-title text-xl uppercase tracking-wider">
									<Icon icon="teenyicons:terminal-outline" width="20" height="20" />
									{project.title}
								</h2>
								{#if project.latestPost.title}
									<p class="text-base-content/60 mt-2">
										{m['devlogs.latest']()}: {project.latestPost.title}
										<span class="text-base-content/40">· {formatDate(project.latestPost.date, locale)}</span>
									</p>
								{/if}
							</div>
							<span class="badge badge-accent shrink-0">
								{project.posts.length} {m['devlogs.posts']()}
							</span>
						</div>

						<!-- Recent posts -->
						{#if project.posts.length > 0}
							<div class="mt-4 space-y-2">
								{#each project.posts.slice(0, 3) as post}
									<a
										href={post.slug ? appHref(`/devlogs/${post.slug}`) : post.external_url || '#'}
										target={post.external_url ? '_blank' : undefined}
										rel={post.external_url ? 'noopener noreferrer' : undefined}
										class="block p-3 rounded-lg hover:bg-base-200 transition-colors"
									>
										<div class="flex items-center gap-2">
											<span class="text-base-content/80">{post.title}</span>
											{#if post.external_url}
												<Icon icon="mdi:open-in-new" width="12" height="12" class="text-base-content/40" />
											{/if}
										</div>
										<p class="text-sm text-base-content/50 line-clamp-1">{post.excerpt}</p>
									</a>
								{/each}
							</div>
						{/if}
					</div>
				</article>
			{/each}
		</div>
	{/if}
</div>

<style>
	@reference "tailwindcss";
</style>
