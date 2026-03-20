<script lang="ts">
	import { formatDate } from '$lib/utils/format';
	import { appHref } from '$lib/utils/href';
	import SEO from '$lib/components/SEO.svelte';
	import Icon from '@iconify/svelte';

	const { data } = $props();
	const series = $derived(data.series);
	const chapters = $derived(data.chapters);
</script>

<SEO
	title="{series.title}"
	description={series.description}
	type="article"
	image={series.coverUrl || undefined}
/>

<article class="series-overview">
	<div class="chapter-topbar">
		<nav class="breadcrumb">
			<a href={appHref('/series')}>← Retour aux séries</a>
		</nav>
	</div>

	<div class="glass-card">
		<header class="series-header" class:has-cover={series.coverUrl}>
			{#if series.coverUrl}
				<div class="hero-background">
					<img
						src={series.coverUrl}
						alt=""
						class="hero-bg-image"
					/>
					<div class="hero-gradient"></div>
				</div>
			{/if}

			<div class="header-content">
				<h1 class="series-title">{series.title}</h1>
				<p class="series-description">{series.description}</p>
				<div class="series-meta">
					<span class="badge badge-secondary gap-1">
						<Icon icon="teenyicons:book-outline" width="14" height="14" />
						{chapters.length} chapitres
					</span>
				</div>
			</div>
		</header>

		<div class="chapters-list">
			<h2 class="chapters-heading">Chapitres</h2>
			<ol class="chapters">
				{#each chapters as chapter, i}
					<li>
						<a
							href={appHref(`/series/${series.slug}/${chapter.slug}`)}
							class="chapter-card"
						>
							{#if chapter.coverUrl}
								<div class="chapter-cover">
									<img src={chapter.coverUrl} alt="" />
								</div>
							{/if}
							<div class="chapter-info">
								<span class="chapter-number">Chapitre {i + 1}</span>
								<h3 class="chapter-title">{chapter.title}</h3>
								<p class="chapter-excerpt">{chapter.excerpt}</p>
								<div class="chapter-meta">
									<time class="chapter-date" datetime={chapter.date}>
										{formatDate(chapter.date)}
									</time>
									{#if chapter.readingTime}
										<span class="chapter-reading-time">
											<Icon icon="teenyicons:clock-outline" width="12" height="12" />
											{chapter.readingTime} min
										</span>
									{/if}
								</div>
							</div>
						</a>
					</li>
				{/each}
			</ol>
		</div>
	</div>
</article>

<style>
	@reference "tailwindcss";
	@plugin "daisyui";

	.series-overview {
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

	.chapter-topbar {
		@apply mb-6;
	}

	.breadcrumb a {
		@apply text-base-content/60 hover:text-primary transition-colors duration-200 no-underline;
	}

	.series-header {
		@apply mb-12 border-b border-base-300 relative overflow-hidden flex flex-col pb-8;
	}

	.series-header.has-cover {
		@apply -mx-4 -mt-8 px-4 rounded-t-2xl justify-end;
		min-height: 360px;
	}

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

	.header-content {
		@apply relative z-10;
	}

	.has-cover .header-content {
		@apply pt-8;
		color: #e5e5e5;
		text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
	}

	.series-title {
		@apply text-4xl font-bold mb-4 leading-tight;
	}

	.has-cover .series-title {
		color: #f5f5f5;
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.7);
	}

	.series-description {
		@apply text-xl mb-4 leading-relaxed;
	}

	.has-cover .series-description {
		color: #d4d4d4;
		text-shadow: 0 1px 6px rgba(0, 0, 0, 0.6);
	}

	.series-meta {
		@apply flex items-center gap-2;
	}

	.chapters-heading {
		@apply text-2xl font-bold text-base-content mb-6;
	}

	.chapters {
		@apply list-none p-0 m-0 space-y-4;
	}

	.chapters li {
		@apply m-0;
	}

	.chapter-card {
		@apply flex gap-4 p-4 rounded-lg transition-all no-underline;
		background: color-mix(in oklch, var(--color-base-100) 30%, transparent);
		border: 1px solid color-mix(in oklch, var(--color-base-300) 20%, transparent);
	}

	.chapter-card:hover {
		background: color-mix(in oklch, var(--color-base-100) 50%, transparent);
		border-color: color-mix(in oklch, var(--color-primary) 40%, transparent);
		@apply scale-[1.01] shadow-lg;
	}

	.chapter-cover {
		@apply w-20 h-20 rounded-lg overflow-hidden bg-base-300 shrink-0;
	}

	.chapter-cover img {
		@apply w-full h-full object-cover;
	}

	.chapter-info {
		@apply flex-1 min-w-0;
	}

	.chapter-number {
		@apply text-sm text-base-content/50 font-medium uppercase tracking-wider;
	}

	.chapter-title {
		@apply text-lg font-bold text-base-content mt-1 mb-1;
	}

	.chapter-excerpt {
		@apply text-base-content/70 text-sm line-clamp-2 mb-1;
	}

	.chapter-meta {
		@apply flex items-center gap-3;
	}

	.chapter-date {
		@apply text-xs text-base-content/50;
	}

	.chapter-reading-time {
		@apply text-xs text-base-content/50 flex items-center gap-1;
	}
</style>
