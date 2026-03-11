<script lang="ts">
	import type { ContentType } from '@johan-chan/content/schema';
	import type { IndexEntryWithCover } from '$lib/utils/content';
	import { appHref } from '$lib/utils/href';
	import { previewHref } from '$lib/utils/preview';
	import Icon from '@iconify/svelte';

	interface Props {
		item: IndexEntryWithCover;
	}

	const { item }: Props = $props();

	// Badge colors and icons per content type
	const typeConfig: Record<ContentType, { color: string; icon: string; label: string }> = {
		article: { color: 'badge-primary', icon: 'teenyicons:text-document-outline', label: 'article' },
		série: { color: 'badge-secondary', icon: 'teenyicons:book-outline', label: 'série' },
		devlog: { color: 'badge-accent', icon: 'teenyicons:terminal-outline', label: 'devlog' },
		post: { color: 'badge-neutral', icon: 'teenyicons:message-outline', label: 'post' }
	};

	const config = $derived(typeConfig[item.type]);
	const isExternal = $derived(!!item.external_url);
	const isDraft = $derived(item.published === false);
	const isPreview = $derived(item.preview === true);

	// Map content types to URL paths (série -> series without accent)
	const typeToPath: Record<ContentType, string> = {
		article: 'articles',
		série: 'series',
		devlog: 'devlogs',
		post: 'posts'
	};

	// For series chapters with parentSlug, use nested URL: /series/{parentSlug}/{slug}
	const href = $derived.by(() => {
		if (item.external_url) return item.external_url;
		if (!item.slug) return '#';
		const path = item.type === 'série' && item.parentSlug
			? `/series/${item.parentSlug}/${item.slug}`
			: `/${typeToPath[item.type]}/${item.slug}`;
		return previewHref(appHref(path));
	});
</script>

<a
	{href}
	class="block group"
	target={isExternal ? '_blank' : undefined}
	rel={isExternal ? 'noopener noreferrer' : undefined}
>
	<article class="card bg-base-100/30 backdrop-blur-md border border-base-300/20 hover:bg-base-100/50 hover:border-primary/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/5">
		<div class="card-body p-4 sm:p-6">
			<div class="flex items-start gap-3">
				<!-- Type badge -->
				<span class="badge {config.color} gap-1 shrink-0">
					<Icon icon={config.icon} width="12" height="12" />
					{config.label}
				</span>

				<!-- Draft badge -->
				{#if isDraft}
					<span class="badge badge-warning gap-1 shrink-0">
						<Icon icon="teenyicons:edit-outline" width="12" height="12" />
						brouillon
					</span>
				{/if}

				<!-- Preview badge -->
				{#if isPreview}
					<span class="badge badge-info gap-1 shrink-0">
						<Icon icon="teenyicons:eye-outline" width="12" height="12" />
						preview
					</span>
				{/if}

				<!-- Series/project parent indicator -->
				{#if item.parent}
					<span class="text-base-content/50 text-sm hidden sm:inline">
						{item.parent}
						{#if item.order}
							<span class="text-base-content/40">· ch.{item.order}</span>
						{/if}
					</span>
				{/if}

				<!-- External link indicator -->
				{#if isExternal}
					<Icon icon="mdi:open-in-new" width="16" height="16" class="text-base-content/40 ml-auto shrink-0" />
				{/if}
			</div>

			<div class="flex gap-3 mt-2">
				{#if item.coverUrl}
					<div class="w-16 h-16 rounded-lg overflow-hidden bg-base-300 shrink-0">
						<img src={item.coverUrl} alt="" class="w-full h-full object-cover" />
					</div>
				{/if}
				<div class="flex-1 min-w-0">
					<h3 class="card-title text-lg sm:text-xl group-hover:text-primary transition-colors">
						{item.title}
					</h3>
					<p class="text-base-content/70 text-sm sm:text-base line-clamp-2">
						{item.excerpt}
					</p>
				</div>
			</div>

			<div class="flex items-center gap-3 mt-2">
				{#if item.readingTime}
					<span class="text-base-content/50 text-xs flex items-center gap-1">
						<Icon icon="teenyicons:clock-outline" width="12" height="12" />
						{item.readingTime} min
					</span>
				{/if}

				<!-- Tags (optional, shown on larger screens) -->
				{#if item.tags && item.tags.length > 0}
					<div class="flex flex-wrap gap-1 hidden sm:flex">
						{#each item.tags.slice(0, 3) as tag}
							<span class="badge badge-ghost badge-sm">{tag}</span>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</article>
</a>

<style>
	@reference "tailwindcss";
</style>
