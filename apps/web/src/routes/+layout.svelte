<script lang="ts">
	import '../app.css';
	import '$lib/icons/setup'; // Preload icons from local bundles (prevents CLS)
	import Link from '$lib/components/Link.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import SEO from '$lib/components/SEO.svelte';
	import ParticleBackground from '$lib/components/background/ParticleBackground.svelte';
	import { getSEOData } from '$lib/data/seo-data';
	import { page } from '$app/state';
	import { m } from '$lib/paraglide/messages';

	const { children, data } = $props();

	// Get SEO data for current page
	const seoData = $derived(getSEOData(page.url.pathname));
</script>


{#if data.env === 'production'}
	<script defer src="https://cloud.umami.is/script.js" data-website-id="e9a3f679-3cfb-4606-9bdf-ad7f68c177e4"></script>
{/if}

<!-- SEO Component (fallback for all pages — dynamic pages override via their own <svelte:head>) -->
<SEO {...seoData} />

<!-- load user theme before rendering -->
<svelte:head>
	<script>
		dataTheme = localStorage.getItem('theme');
		if (dataTheme) document.documentElement.setAttribute('data-theme', dataTheme);
	</script>
</svelte:head>

<ParticleBackground />

<div class="min-h-screen flex flex-col">
	<Navbar>
		<Link href="/">{m['navigation.all']()}</Link>
		{#if data.contentCounts.articles > 0}
			<Link href="/articles">{m['navigation.articles']()}</Link>
		{/if}
		{#if data.contentCounts.series > 0}
			<Link href="/series">{m['navigation.series']()}</Link>
		{/if}
		{#if data.contentCounts.devlogs > 0}
			<Link href="/devlogs">{m['navigation.devlogs']()}</Link>
		{/if}
		<Link href="/about">{m['navigation.about']()}</Link>
	</Navbar>

	<main class="content-grid p-4 flex-1">
		{@render children()}
	</main>

	<Footer />
</div>

<style>
	@reference "tailwindcss";
	:root {
		--page-breakout: 0.5rem;
		--page-margin: 0.5rem;
		font-size: 14px;
	}

	@media (min-width: 640px) {
		:root {
			--page-breakout: 1.5rem;
			--page-margin: 0.5rem;
			font-size: 14px;
		}
	}

	@media (min-width: 960px) {
		:root {
			--page-breakout: 2rem;
			--page-margin: 1rem;
			font-size: 16px;
		}
	}

	main {
		@apply w-full relative;
	}
</style>
