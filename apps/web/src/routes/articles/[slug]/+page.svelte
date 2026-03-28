<script lang="ts">
	import type { Component } from 'svelte';
	import { formatDate } from '$lib/utils/format';
	import { appHref } from '$lib/utils/href';
	import { previewHref } from '$lib/utils/preview';
	import SEO from '$lib/components/SEO.svelte';
	import DraftBanner from '$lib/components/DraftBanner.svelte';
	import PreviewGate from '$lib/components/PreviewGate.svelte';
	import PreviewBanner from '$lib/components/PreviewBanner.svelte';
	import ContentItem from '$lib/components/ContentItem.svelte';
	import Icon from '@iconify/svelte';

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

<article class="article-page">
	<nav class="breadcrumb">
		<a href={previewHref(appHref('/articles'))}>← Retour aux articles</a>
	</nav>

	<div class="glass-card">
		<header class="article-header" class:has-hero={article.heroUrl || article.image}>
			{#if article.heroUrl || article.image}
				<div class="hero-background">
					<img
						src={article.heroUrl || article.coverUrl || article.image}
						srcset={article.heroSrcset || undefined}
						sizes={article.heroSrcset ? '(max-width: 800px) 100vw, 800px' : undefined}
						alt=""
						class="hero-bg-image"
						style="object-position: {article.imageFocus || 'center'}"
					/>
					<div class="hero-gradient"></div>
				</div>
			{/if}

			<div class="header-content">
				<h1 class="article-title">{article.title}</h1>

				<p class="article-excerpt">{article.excerpt}</p>

				<div class="article-meta">
					<time datetime={article.date}>{formatDate(article.date)}</time>
					{#if article.readingTime}
						<span class="meta-separator">·</span>
						<span class="reading-time">
							<Icon icon="teenyicons:clock-outline" width="14" height="14" />
							{article.readingTime} min de lecture
						</span>
					{/if}
					{#if article.updatedAt && article.updatedAt.slice(0, 10) !== article.date}
						<span class="meta-separator">·</span>
						<span class="updated-at">Mis à jour le <time datetime={article.updatedAt}>{formatDate(article.updatedAt)}</time></span>
					{/if}
					{#if article.tags.length > 0}
						<span class="meta-separator">·</span>
						<div class="tags">
							{#each article.tags as tag}
								<span class="tag">{tag}</span>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</header>

	<hr class="content-separator" />

	<div class="article-content">
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
	</div>
</article>

</PreviewGate>

<style>
	@reference "tailwindcss";
	@plugin "daisyui";

	.article-page {
		@apply max-w-4xl mx-auto pt-8;
	}

	.breadcrumb {
		@apply mb-6 px-4;
	}

	.breadcrumb a {
		@apply text-base-content/60 hover:text-primary transition-colors duration-200 no-underline;
	}

	.glass-card {
		@apply px-4 py-8;
		background: color-mix(in oklch, var(--color-base-100) 30%, transparent);
		border: 1px solid color-mix(in oklch, var(--color-base-300) 20%, transparent);
		border-radius: 1rem;
	}

	@media (hover: hover) {
		.glass-card {
			backdrop-filter: blur(12px);
		}
	}

	.article-header {
		@apply mb-12 border-b border-base-300 relative overflow-hidden flex flex-col;
	}

	.article-header.has-hero {
		@apply -mx-4 -mt-8 px-4 rounded-t-2xl justify-end;
		min-height: 480px;
	}

	/* Hero background image */
	.hero-background {
		@apply absolute inset-0;
	}

	.hero-bg-image {
		@apply w-full h-full object-cover;
	}

	.hero-gradient {
		@apply absolute inset-0;
		background: linear-gradient(
			to bottom,
			transparent 0%,
			transparent 30%,
			rgba(0, 0, 0, 0.5) 60%,
			rgba(0, 0, 0, 0.85) 100%
		);
	}

	/* Header content sits above the background */
	.header-content {
		@apply relative z-10 pb-8;
	}

	.has-hero .header-content {
		@apply pt-8;
		color: #e5e5e5;
		text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
	}

	.has-hero .article-title {
		color: #f5f5f5;
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.7);
	}

	.has-hero .article-excerpt {
		color: #d4d4d4;
		text-shadow: 0 1px 6px rgba(0, 0, 0, 0.6);
	}

	.has-hero .article-meta {
		color: #a3a3a3;
	}

	.has-hero .tag {
		background: rgba(255, 255, 255, 0.15);
		color: #d4d4d4;
	}

	.article-title {
		@apply text-4xl font-bold text-base-content mb-4 leading-tight;
	}

	.article-excerpt {
		@apply text-xl text-base-content/80 mb-4 leading-relaxed;
	}

	.article-meta {
		@apply flex items-center gap-2 text-sm text-base-content/60 flex-wrap;
	}

	.meta-separator {
		@apply text-base-content/40;
	}

	.updated-at {
		@apply text-base-content/50 italic;
	}

	.reading-time {
		@apply flex items-center gap-1 text-base-content/50;
	}

	.tags {
		@apply flex flex-wrap gap-2;
	}

	.tag {
		@apply bg-base-200 text-base-content/70 px-2 py-0.5 rounded-full text-xs;
	}

	.content-separator {
		@apply border-base-300 my-8;
	}

	.article-content {
		@apply max-w-none text-base-content mb-12 text-lg leading-relaxed;
	}

	/* Markdown content styling */
	.article-content :global(h1),
	.article-content :global(h2),
	.article-content :global(h3),
	.article-content :global(h4),
	.article-content :global(h5),
	.article-content :global(h6) {
		@apply text-base-content font-bold mt-8 mb-4;
	}

	.article-content :global(h2) {
		@apply text-2xl border-b border-base-300 pb-2;
	}

	.article-content :global(h3) {
		@apply text-xl;
	}

	.article-content :global(p) {
		@apply text-base-content/80 mb-4 leading-relaxed;
	}

	.article-content :global(a) {
		@apply text-primary hover:text-blue-600 underline;
	}

	.article-content :global(ul),
	.article-content :global(ol) {
		@apply text-base-content/80 mb-4 pl-6;
	}

	.article-content :global(li) {
		@apply mb-2;
	}

	.article-content :global(blockquote) {
		@apply border-l-4 border-primary bg-base-200 p-4 mb-4 italic;
	}

	.article-content :global(code) {
		@apply bg-base-200 text-base-content px-2 py-1 rounded text-sm font-mono;
	}

	.article-content :global(pre) {
		@apply bg-base-200 text-base-content p-4 rounded-lg overflow-x-auto mb-4 w-0 min-w-full;
	}

	.article-content :global(pre code) {
		@apply bg-transparent p-0;
	}

	.article-content :global(img) {
		@apply max-w-full h-auto rounded-lg shadow-md my-6 mx-auto;
	}

	.article-content :global(hr) {
		@apply border-base-300 my-8;
	}

	.article-content :global(strong) {
		@apply font-bold text-base-content;
	}

	/* Related essays */
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
