<script lang="ts">
	import type { Component } from 'svelte';
	import { formatDate } from '$lib/utils/format';
	import { appHref } from '$lib/utils/href';
	import { previewHref } from '$lib/utils/preview';
	import SEO from '$lib/components/SEO.svelte';
	import DraftBanner from '$lib/components/DraftBanner.svelte';
	import PreviewGate from '$lib/components/PreviewGate.svelte';
	import PreviewBanner from '$lib/components/PreviewBanner.svelte';
	import Icon from '@iconify/svelte';

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

<article class="series-chapter">
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

	<div class="glass-card">
		<header class="chapter-header" class:has-hero={chapter.heroUrl || chapter.image}>
		{#if chapter.heroUrl || chapter.image}
			<div class="hero-background">
				<img
					src={chapter.heroUrl || chapter.coverUrl || chapter.image}
					srcset={chapter.heroSrcset || undefined}
					sizes={chapter.heroSrcset ? '(max-width: 800px) 100vw, 800px' : undefined}
					alt=""
					class="hero-bg-image"
					style="object-position: {chapter.imageFocus || 'center'}"
				/>
				<div class="hero-gradient"></div>
			</div>
		{/if}

		<div class="header-content">

			<h1 class="chapter-title">{chapter.title}</h1>

			<p class="chapter-excerpt">{chapter.excerpt}</p>

			<div class="chapter-meta">
				<time datetime={chapter.date}>{formatDate(chapter.date)}</time>
				{#if chapter.readingTime}
					<span class="separator">•</span>
					<span class="reading-time">
						<Icon icon="teenyicons:clock-outline" width="14" height="14" />
						{chapter.readingTime} min de lecture
					</span>
				{/if}
				{#if chapter.tags.length > 0}
					<span class="separator">•</span>
					<div class="tags">
						{#each chapter.tags as tag}
							<span class="tag">{tag}</span>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</header>

	<div class="chapter-content">
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
	</div>
</article>

</PreviewGate>

<style>
	@reference "tailwindcss";
	@plugin "daisyui";

	.series-chapter {
		@apply max-w-4xl mx-auto pt-8;
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

	.chapter-header {
		@apply mb-12 border-b border-base-300 relative overflow-hidden flex flex-col;
	}

	.chapter-header.has-hero {
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

	.has-hero .chapter-title {
		color: #f5f5f5;
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.7);
	}

	.has-hero .chapter-excerpt {
		color: #d4d4d4;
		text-shadow: 0 1px 6px rgba(0, 0, 0, 0.6);
	}

	.has-hero .chapter-meta {
		color: #a3a3a3;
	}

	.has-hero .tag {
		background: rgba(255, 255, 255, 0.15);
		color: #d4d4d4;
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

	.chapter-title {
		@apply text-4xl font-bold text-base-content mb-4 leading-tight;
	}

	.chapter-excerpt {
		@apply text-xl text-base-content/80 mb-4 leading-relaxed;
	}

	.chapter-meta {
		@apply flex items-center gap-2 text-sm text-base-content/60 flex-wrap;
	}

	.separator {
		@apply text-base-content/40;
	}

	.reading-time {
		@apply flex items-center gap-1;
	}

	.tags {
		@apply flex flex-wrap gap-2;
	}

	.tag {
		@apply bg-base-200 text-base-content/70 px-2 py-0.5 rounded-full text-xs;
	}

	.chapter-content {
		@apply max-w-none text-base-content mb-12 text-lg leading-relaxed;
	}

	/* Markdown content styling - same as essays */
	.chapter-content :global(h1),
	.chapter-content :global(h2),
	.chapter-content :global(h3),
	.chapter-content :global(h4) {
		@apply text-base-content font-bold mt-8 mb-4;
	}

	.chapter-content :global(h2) {
		@apply text-2xl border-b border-base-300 pb-2;
	}

	.chapter-content :global(h3) {
		@apply text-xl;
	}

	.chapter-content :global(p) {
		@apply text-base-content/80 mb-4 leading-relaxed;
	}

	.chapter-content :global(a) {
		@apply text-primary hover:text-blue-600 underline;
	}

	.chapter-content :global(ul),
	.chapter-content :global(ol) {
		@apply text-base-content/80 mb-4 pl-6;
	}

	.chapter-content :global(li) {
		@apply mb-2;
	}

	.chapter-content :global(blockquote) {
		@apply border-l-4 border-primary bg-base-200 p-4 mb-4 italic;
	}

	.chapter-content :global(code) {
		@apply bg-base-200 text-base-content px-2 py-1 rounded text-sm font-mono;
	}

	.chapter-content :global(pre) {
		@apply bg-base-200 text-base-content p-4 rounded-lg overflow-x-auto mb-4;
	}

	.chapter-content :global(img) {
		@apply max-w-full h-auto rounded-lg shadow-md my-6 mx-auto;
	}

	.chapter-content :global(hr) {
		@apply border-base-300 my-8;
	}

	.chapter-content :global(em) {
		@apply italic text-base-content/70;
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
