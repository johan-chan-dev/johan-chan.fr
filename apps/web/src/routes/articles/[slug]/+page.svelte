<script lang="ts">
	import type { Component } from 'svelte';
	import { appHref } from '$lib/utils/href';
	import { previewHref } from '$lib/utils/preview';
	import SEO from '$lib/components/SEO.svelte';
	import DraftBanner from '$lib/components/DraftBanner.svelte';
	import PreviewGate from '$lib/components/PreviewGate.svelte';
	import PreviewBanner from '$lib/components/PreviewBanner.svelte';
	import ContentDetailHeader from '$lib/components/ContentDetailHeader.svelte';
	import ContentItem from '$lib/components/ContentItem.svelte';
	import '$lib/styles/prose-content.css';

	const { data } = $props();
	const article = $derived(data.article);
	const relatedArticles = $derived(data.relatedArticles);
	const ArticleComponent = $derived((data.article as unknown as { component?: Component }).component);

	const isDraft = $derived(article.published === false);
	const isPreview = $derived(article.preview === true);
</script>

<SEO
	title="{article.title}"
	description={article.excerpt}
	type="article"
	image={article.ogUrl || article.coverUrl || article.image}
/>

<PreviewGate preview={isPreview}>

{#if isDraft}
	<div class="max-w-4xl mx-auto px-4 pt-8">
		<DraftBanner />
	</div>
{/if}

{#if isPreview}
	<div class="max-w-4xl mx-auto px-4 pt-8">
		<PreviewBanner />
	</div>
{/if}

<article class="detail-page">
	<nav class="breadcrumb">
		<a href={previewHref(appHref('/articles'))}>← Retour aux articles</a>
	</nav>

	<ContentDetailHeader
		title={article.title}
		excerpt={article.excerpt}
		date={article.date}
		readingTime={article.readingTime}
		tags={article.tags}
		heroUrl={article.heroUrl}
		heroSrcset={article.heroSrcset}
		coverUrl={article.coverUrl}
		image={article.image}
		imageFocus={article.imageFocus}
		updatedAt={article.updatedAt}
	>
		<div class="prose-content">
			{#if ArticleComponent}
				<ArticleComponent />
			{:else}
				{@html article.htmlContent}
			{/if}
		</div>

		{#if relatedArticles.length > 0}
			<aside class="related-articles">
				<h3>Articles similaires</h3>
				<div class="related-grid">
					{#each relatedArticles as related}
						<ContentItem item={related} />
					{/each}
				</div>
			</aside>
		{/if}
	</ContentDetailHeader>
</article>

</PreviewGate>

<style>
	@reference "tailwindcss";
	@plugin "daisyui";

	.detail-page {
		@apply max-w-4xl mx-auto pt-8;
	}

	.breadcrumb {
		@apply mb-6 px-4;
	}

	.breadcrumb a {
		@apply text-base-content/60 hover:text-primary transition-colors duration-200 no-underline;
	}

	.related-articles {
		@apply border-t border-base-300 pt-8;
	}

	.related-articles h3 {
		@apply text-2xl font-bold text-base-content mb-6;
	}

	.related-grid {
		@apply grid gap-4 md:grid-cols-2 lg:grid-cols-3;
	}
</style>
