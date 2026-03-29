<script lang="ts">
	import { formatDate } from '$lib/utils/format';
	import Icon from '@iconify/svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		excerpt: string;
		date: string;
		readingTime?: number;
		tags?: string[];
		heroUrl?: string | null;
		heroSrcset?: string | null;
		coverUrl?: string | null;
		image?: string;
		imageFocus?: string;
		updatedAt?: string;
		extraMeta?: Snippet;
		children: Snippet;
	}

	const {
		title,
		excerpt,
		date,
		readingTime,
		tags = [],
		heroUrl,
		heroSrcset,
		coverUrl,
		image,
		imageFocus,
		updatedAt,
		extraMeta,
		children
	}: Props = $props();

	const hasHero = $derived(!!heroUrl || !!image);
</script>

<div class="glass-card">
	<header class="detail-header" class:has-hero={hasHero}>
		{#if hasHero}
			<div class="hero-background">
				<img
					src={heroUrl || coverUrl || image}
					srcset={heroSrcset || undefined}
					sizes={heroSrcset ? '(max-width: 800px) 100vw, 800px' : undefined}
					alt=""
					class="hero-bg-image"
					style="object-position: {imageFocus || 'center'}"
				/>
				<div class="hero-gradient"></div>
			</div>
		{/if}

		<div class="header-content">
			<h1 class="detail-title">{title}</h1>
			<p class="detail-excerpt">{excerpt}</p>

			<div class="detail-meta">
				<time datetime={date}>{formatDate(date)}</time>
				{#if readingTime}
					<span class="separator">·</span>
					<span class="reading-time">
						<Icon icon="teenyicons:clock-outline" width="14" height="14" />
						{readingTime} min de lecture
					</span>
				{/if}
				{#if updatedAt && updatedAt.slice(0, 10) !== date}
					<span class="separator">·</span>
					<span class="updated-at">Mis à jour le <time datetime={updatedAt}>{formatDate(updatedAt)}</time></span>
				{/if}
				{#if extraMeta}
					{@render extraMeta()}
				{/if}
				{#if tags.length > 0}
					<span class="separator">·</span>
					<div class="tags">
						{#each tags as tag}
							<span class="tag">{tag}</span>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</header>

	<hr class="content-separator" />

	{@render children()}
</div>

<style>
	@reference "tailwindcss";
	@plugin "daisyui";

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

	.detail-header {
		@apply mb-12 border-b border-base-300 relative overflow-hidden flex flex-col;
	}

	.detail-header.has-hero {
		@apply -mx-4 -mt-8 px-4 rounded-t-2xl justify-end;
		min-height: 480px;
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
		@apply relative z-10 pb-8;
	}

	.has-hero .header-content {
		@apply pt-8;
		color: #e5e5e5;
		text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
	}

	.has-hero .detail-title {
		color: #f5f5f5;
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.7);
	}

	.has-hero .detail-excerpt {
		color: #d4d4d4;
		text-shadow: 0 1px 6px rgba(0, 0, 0, 0.6);
	}

	.has-hero .detail-meta {
		color: #a3a3a3;
	}

	.has-hero .tag {
		background: rgba(255, 255, 255, 0.15);
		color: #d4d4d4;
	}

	.detail-title {
		@apply text-4xl font-bold text-base-content mb-4 leading-tight;
	}

	.detail-excerpt {
		@apply text-xl text-base-content/80 mb-4 leading-relaxed;
	}

	.detail-meta {
		@apply flex items-center gap-2 text-sm text-base-content/60 flex-wrap;
	}

	.separator {
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
</style>
