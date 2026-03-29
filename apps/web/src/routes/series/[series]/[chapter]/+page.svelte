<script lang="ts">
	import type { Component } from 'svelte';
	import { appHref } from '$lib/utils/href';
	import { previewHref } from '$lib/utils/preview';
	import SEO from '$lib/components/SEO.svelte';
	import DraftBanner from '$lib/components/DraftBanner.svelte';
	import PreviewGate from '$lib/components/PreviewGate.svelte';
	import PreviewBanner from '$lib/components/PreviewBanner.svelte';
	import ContentDetailHeader from '$lib/components/ContentDetailHeader.svelte';
	import '$lib/styles/prose-content.css';

	const { data } = $props();
	const chapter = $derived(data.chapter);
	const seriesInfo = $derived(data.seriesInfo);
	const prevChapter = $derived(data.prevChapter);
	const nextChapter = $derived(data.nextChapter);
	const ChapterComponent = $derived((data.chapter as unknown as { component?: Component }).component);

	const isDraft = $derived(chapter.published === false);
	const isPreview = $derived(chapter.preview === true);
</script>

<SEO
	title="{chapter.title} | {seriesInfo.title}"
	description={chapter.excerpt}
	type="article"
	image={chapter.ogUrl || chapter.heroUrl || chapter.coverUrl || chapter.image}
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
	<div class="chapter-topbar">
		<nav class="breadcrumb">
			<a href={previewHref(appHref(`/series/${seriesInfo.slug}`))}>← {seriesInfo.title}</a>
		</nav>

		<div class="series-badge">
			<a href={previewHref(appHref(`/series/${seriesInfo.slug}`))} class="series-name">{seriesInfo.title}</a>
			<span class="chapter-progress">
				Chapitre {seriesInfo.currentIndex}
			</span>
		</div>
	</div>

	<ContentDetailHeader
		title={chapter.title}
		excerpt={chapter.excerpt}
		date={chapter.date}
		readingTime={chapter.readingTime}
		tags={chapter.tags}
		heroUrl={chapter.heroUrl}
		heroSrcset={chapter.heroSrcset}
		coverUrl={chapter.coverUrl}
		image={chapter.image}
		imageFocus={chapter.imageFocus}
	>
		<div class="prose-content">
			{#if ChapterComponent}
				<ChapterComponent />
			{:else}
				{@html chapter.htmlContent}
			{/if}
		</div>

		<!-- Chapter Navigation -->
		<nav class="chapter-navigation">
			{#if prevChapter}
				<a href={previewHref(appHref(`/series/${seriesInfo.slug}/${prevChapter.slug}`))} class="nav-link prev">
					<span class="nav-direction">← Chapitre précédent</span>
					<span class="nav-title">{prevChapter.title}</span>
				</a>
			{:else}
				<div class="nav-placeholder"></div>
			{/if}

			{#if nextChapter}
				<a href={previewHref(appHref(`/series/${seriesInfo.slug}/${nextChapter.slug}`))} class="nav-link next">
					<span class="nav-direction">Chapitre suivant →</span>
					<span class="nav-title">{nextChapter.title}</span>
				</a>
			{:else}
				<div class="nav-placeholder"></div>
			{/if}
		</nav>

		<!-- Series Overview -->
		{#if seriesInfo.chapters.length > 1}
			<aside class="series-overview">
				<h3>Tous les chapitres</h3>
				<ol class="chapters-list">
					{#each seriesInfo.chapters as ch, i}
						<li class:current={ch.slug === chapter.slug}>
							{#if ch.slug === chapter.slug}
								<span class="chapter-link current">
									<span class="chapter-number">{i + 1}.</span>
									{ch.title}
								</span>
							{:else}
								<a href={previewHref(appHref(`/series/${seriesInfo.slug}/${ch.slug}`))} class="chapter-link">
									<span class="chapter-number">{i + 1}.</span>
									{ch.title}
								</a>
							{/if}
						</li>
					{/each}
				</ol>
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

	.chapter-topbar {
		@apply mb-6;
	}

	.breadcrumb {
		@apply mb-3;
	}

	.breadcrumb a {
		@apply text-base-content/60 hover:text-primary transition-colors duration-200 no-underline;
	}

	.series-badge {
		@apply flex items-center gap-3;
	}

	.series-name {
		@apply bg-secondary text-secondary-content px-3 py-1 rounded-full text-sm font-medium no-underline hover:opacity-80 transition-opacity;
	}

	.chapter-progress {
		@apply text-sm text-base-content/60;
	}

	/* Chapter navigation */
	.chapter-navigation {
		@apply flex justify-between gap-4 py-8 border-t border-b border-base-300 mb-8;
	}

	.nav-link {
		@apply flex flex-col gap-1 p-4 rounded-lg transition-all no-underline max-w-[45%];
		background: color-mix(in oklch, var(--color-base-100) 30%, transparent);
		border: 1px solid color-mix(in oklch, var(--color-base-300) 20%, transparent);
	}

	@media (hover: hover) {
		.nav-link {
			backdrop-filter: blur(12px);
		}
	}

	.nav-link:hover {
		background: color-mix(in oklch, var(--color-base-100) 50%, transparent);
		border-color: color-mix(in oklch, var(--color-primary) 40%, transparent);
	}

	.nav-link.prev {
		@apply items-start;
	}

	.nav-link.next {
		@apply items-end text-right;
	}

	.nav-direction {
		@apply text-sm text-base-content/60;
	}

	.nav-title {
		@apply font-medium text-base-content;
	}

	.nav-placeholder {
		@apply flex-1;
	}

	/* Series overview */
	.series-overview {
		@apply rounded-lg p-6;
		background: color-mix(in oklch, var(--color-base-100) 30%, transparent);
		border: 1px solid color-mix(in oklch, var(--color-base-300) 20%, transparent);
	}

	@media (hover: hover) {
		.series-overview {
			backdrop-filter: blur(12px);
		}
	}

	.series-overview h3 {
		@apply text-xl font-bold text-base-content mb-4;
	}

	.chapters-list {
		@apply list-none p-0 m-0 space-y-2;
	}

	.chapters-list li {
		@apply m-0;
	}

	.chapter-link {
		@apply flex items-center gap-2 py-2 px-3 rounded transition-colors no-underline;
	}

	.chapter-link:not(.current) {
		@apply text-base-content/80 hover:bg-base-300;
	}

	.chapter-link.current {
		@apply bg-primary text-primary-content font-medium;
	}

	.chapter-number {
		@apply text-sm opacity-70;
	}
</style>
