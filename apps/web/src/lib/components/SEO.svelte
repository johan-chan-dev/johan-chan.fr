<script lang="ts">
	import { page } from '$app/stores';

	interface SEOProps {
		title: string;
		description: string;
		keywords?: string;
		image?: string;
		type?: 'website' | 'article' | 'profile';
		canonical?: string;
		noindex?: boolean;
		author?: string;
	}

	const {
		title,
		description,
		keywords,
		image = '/images/johan.webp',
		type = 'website',
		canonical,
		noindex = false,
		author = 'Johan Chan'
	}: SEOProps = $props();

	const siteUrl = 'https://www.johan-chan.fr';
	const fullImage = $derived(image.startsWith('http') ? image : `${siteUrl}${image}`);
	const fullCanonical = $derived(canonical || `${siteUrl}${$page.url.pathname}`);
</script>

<svelte:head>
	<!-- Basic Meta Tags -->
	<title>{title}</title>
	<meta name="description" content={description} />
	{#if keywords}<meta name="keywords" content={keywords} />{/if}
	<meta name="author" content={author} />
	<link rel="canonical" href={fullCanonical} />

	<!-- Robots -->
	{#if noindex}
		<meta name="robots" content="noindex, nofollow" />
	{:else}
		<meta name="robots" content="index, follow" />
	{/if}

	<!-- Open Graph -->
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content={type} />
	<meta property="og:url" content={fullCanonical} />
	<meta property="og:image" content={fullImage} />
	<meta property="og:image:alt" content={title} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:type" content="image/webp" />
	<meta property="og:site_name" content="Johan Chan - Développeur d'Applications" />
	<meta property="og:locale" content="fr_FR" />
	<meta property="article:author" content="Johan Chan" />

	<!-- Facebook specific -->
	<meta property="fb:app_id" content="" />

	<!-- Twitter Cards -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content="@johanchan" />
	<meta name="twitter:creator" content="@johanchan" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={fullImage} />
	<meta name="twitter:image:alt" content={title} />

	<!-- LinkedIn specific -->
	<meta property="og:image:secure_url" content={fullImage} />

	<!-- Additional SEO -->
	<meta name="language" content="French" />
	<meta name="geo.region" content="FR" />
	<meta name="geo.placename" content="France" />
</svelte:head>
