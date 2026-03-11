<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import ContentFeed from '$lib/components/ContentFeed.svelte';
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();
</script>

<div class="max-w-3xl md:max-w-4xl xl:max-w-6xl 2xl:max-w-7xl mx-auto">
	<!-- Hero section -->
	<header class="text-center py-12 md:py-20 mb-12">
		<h1 class="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-4">
			<span class="inline-block">Software</span>{' '}
			<span class="relative inline-block"
				><span
					class="hero-shimmer text-[0.4em] font-bold absolute -top-[0.8em] right-0 inline-block rotate-3 pb-1 whitespace-nowrap"
					>{m['homepage.hero_augmented']()}<span class="sparkle ml-1">✦</span></span
				>Crafter</span
			>
		</h1>
		<p class="text-xl md:text-2xl font-medium tracking-wide">
			<span class="tagline-ai">Make it work.</span>{' '}
			<span class="text-base-content">Make it right.</span>{' '}
			<span class="tagline-blend">Make it fast.</span>
		</p>

			</header>

	<!-- Activity Feed -->
	<section>
		<ContentFeed items={data.content} emptyMessage={m['homepage.empty_feed']()} />
	</section>
</div>

<style>
	@reference "tailwindcss";

	.hero-shimmer {
		/* Shimmer: warning base with bright highlight sweeping through */
		background: linear-gradient(
			90deg,
			var(--color-warning) 0%,
			var(--color-warning) 45%,
			color-mix(in oklch, var(--color-warning), white 40%) 50%,
			var(--color-warning) 55%,
			var(--color-warning) 100%
		);
		background-size: 300% 100%;
		background-clip: text;
		-webkit-background-clip: text;
		color: transparent;
		background-position: 0% 0;
		animation: shimmer-reverse 1.5s ease-in-out 2 forwards;
	}

	@keyframes shimmer-reverse {
		0% {
			background-position: 100% 0;
		}
		100% {
			background-position: 0% 0;
		}
	}

	.sparkle {
		display: inline-block;
		color: var(--color-warning);
		animation: sparkle-pulse 4s ease-in-out infinite;
	}

	@keyframes sparkle-pulse {
		0%,
		100% {
			opacity: 0.7;
			transform: scale(1);
		}
		50% {
			opacity: 1;
			transform: scale(1.15);
		}
	}

	.tagline-ai {
		color: var(--color-warning);
	}

	.tagline-blend {
		/* base-content → warning - adapts to theme automatically */
		background: linear-gradient(90deg, var(--color-base-content) 40%, var(--color-warning) 60%);
		background-clip: text;
		-webkit-background-clip: text;
		color: transparent;
	}
</style>
