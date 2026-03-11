<script lang="ts">
	import { formatDate } from '$lib/utils/format';
	import { appHref } from '$lib/utils/href';
	import { previewHref } from '$lib/utils/preview';
	import SEO from '$lib/components/SEO.svelte';
	import DraftBanner from '$lib/components/DraftBanner.svelte';
	import PreviewGate from '$lib/components/PreviewGate.svelte';
	import PreviewBanner from '$lib/components/PreviewBanner.svelte';
	import Icon from '@iconify/svelte';

	const { data } = $props();
	const post = $derived(data.post);
	const projectInfo = $derived(data.projectInfo);
	const newerPost = $derived(data.newerPost);
	const olderPost = $derived(data.olderPost);

	const isDraft = $derived(post.published === false);
	const isPreview = $derived(post.preview === true);
</script>

<SEO
	title="{post.title} | {projectInfo.name} Devlog | Johan Chan"
	description={post.excerpt}
	type="article"
	image={post.ogUrl || post.heroUrl || post.coverUrl || post.image}
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

<article class="devlog-post">
	<div class="post-topbar">
		<nav class="breadcrumb">
			<a href={previewHref(appHref('/devlogs'))}>← Retour aux devlogs</a>
		</nav>

		<div class="project-badge">
			<span class="project-name">{projectInfo.name}</span>
			<span class="post-count">{projectInfo.totalPosts} entrée{projectInfo.totalPosts > 1 ? 's' : ''}</span>
		</div>
	</div>

	<div class="glass-card">
		<header class="post-header" class:has-hero={post.heroUrl || post.image}>
			{#if post.heroUrl || post.image}
				<div class="hero-background">
					<img
						src={post.heroUrl || post.coverUrl || post.image}
						srcset={post.heroSrcset || undefined}
						sizes={post.heroSrcset ? '(max-width: 800px) 100vw, 800px' : undefined}
						alt=""
						class="hero-bg-image"
						style="object-position: {post.imageFocus || 'center'}"
					/>
					<div class="hero-gradient"></div>
				</div>
			{/if}

			<div class="header-content">
				<h1 class="post-title">{post.title}</h1>

				<p class="post-excerpt">{post.excerpt}</p>

				<div class="post-meta">
					<time datetime={post.date}>{formatDate(post.date)}</time>
					{#if post.readingTime}
						<span class="separator">•</span>
						<span class="reading-time">
							<Icon icon="teenyicons:clock-outline" width="14" height="14" />
							{post.readingTime} min de lecture
						</span>
					{/if}
					{#if post.tags.length > 0}
						<span class="separator">•</span>
						<div class="tags">
							{#each post.tags as tag}
								<span class="tag">{tag}</span>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</header>

	<div class="post-content">
		{@html post.htmlContent}
	</div>

	<!-- Post Navigation -->
	<nav class="post-navigation">
		{#if olderPost}
			<a href={previewHref(appHref(`/devlogs/${olderPost.slug}`))} class="nav-link older">
				<span class="nav-direction">← Plus ancien</span>
				<span class="nav-title">{olderPost.title}</span>
				<time datetime={olderPost.date}>{formatDate(olderPost.date)}</time>
			</a>
		{:else}
			<div class="nav-placeholder"></div>
		{/if}

		{#if newerPost}
			<a href={previewHref(appHref(`/devlogs/${newerPost.slug}`))} class="nav-link newer">
				<span class="nav-direction">Plus récent →</span>
				<span class="nav-title">{newerPost.title}</span>
				<time datetime={newerPost.date}>{formatDate(newerPost.date)}</time>
			</a>
		{:else}
			<div class="nav-placeholder"></div>
		{/if}
	</nav>

	<!-- Project Timeline -->
	{#if projectInfo.posts.length > 1}
		<aside class="project-timeline">
			<h3>Timeline du projet</h3>
			<ul class="timeline-list">
				{#each projectInfo.posts as entry}
					<li class:current={entry.slug === post.slug}>
						{#if entry.slug === post.slug}
							<span class="timeline-entry current">
								<time datetime={entry.date}>{formatDate(entry.date)}</time>
								<span class="entry-title">{entry.title}</span>
							</span>
						{:else}
							<a href={previewHref(appHref(`/devlogs/${entry.slug}`))} class="timeline-entry">
								<time datetime={entry.date}>{formatDate(entry.date)}</time>
								<span class="entry-title">{entry.title}</span>
							</a>
						{/if}
					</li>
				{/each}
			</ul>
		</aside>
	{/if}
	</div>
</article>

</PreviewGate>

<style>
	@reference "tailwindcss";
	@plugin "daisyui";

	.devlog-post {
		@apply max-w-4xl mx-auto pt-8;
	}

	.post-topbar {
		@apply mb-6 px-4;
	}

	.breadcrumb {
		@apply mb-3;
	}

	.breadcrumb a {
		@apply text-base-content/60 hover:text-primary transition-colors duration-200 no-underline;
	}

	.project-badge {
		@apply flex items-center gap-3;
	}

	.project-name {
		@apply bg-accent text-accent-content px-3 py-1 rounded-full text-sm font-medium;
	}

	.post-count {
		@apply text-sm text-base-content/60;
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

	.post-header {
		@apply mb-12 border-b border-base-300 relative overflow-hidden flex flex-col;
	}

	.post-header.has-hero {
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

	.has-hero .post-title {
		color: #f5f5f5;
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.7);
	}

	.has-hero .post-excerpt {
		color: #d4d4d4;
		text-shadow: 0 1px 6px rgba(0, 0, 0, 0.6);
	}

	.has-hero .post-meta {
		color: #a3a3a3;
	}

	.has-hero .tag {
		background: rgba(255, 255, 255, 0.15);
		color: #d4d4d4;
	}

	.post-title {
		@apply text-4xl font-bold text-base-content mb-4 leading-tight;
	}

	.post-excerpt {
		@apply text-xl text-base-content/80 mb-4 leading-relaxed;
	}

	.post-meta {
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

	.post-content {
		@apply max-w-none text-base-content mb-12 text-lg leading-relaxed;
	}

	/* Markdown content styling */
	.post-content :global(h1),
	.post-content :global(h2),
	.post-content :global(h3),
	.post-content :global(h4) {
		@apply text-base-content font-bold mt-8 mb-4;
	}

	.post-content :global(h2) {
		@apply text-2xl border-b border-base-300 pb-2;
	}

	.post-content :global(h3) {
		@apply text-xl;
	}

	.post-content :global(p) {
		@apply text-base-content/80 mb-4 leading-relaxed;
	}

	.post-content :global(a) {
		@apply text-primary hover:text-blue-600 underline;
	}

	.post-content :global(ul),
	.post-content :global(ol) {
		@apply text-base-content/80 mb-4 pl-6;
	}

	.post-content :global(li) {
		@apply mb-2;
	}

	.post-content :global(blockquote) {
		@apply border-l-4 border-primary bg-base-200 p-4 mb-4 italic;
	}

	.post-content :global(code) {
		@apply bg-base-200 text-base-content px-2 py-1 rounded text-sm font-mono;
	}

	.post-content :global(pre) {
		@apply bg-base-200 text-base-content p-4 rounded-lg overflow-x-auto mb-4;
	}

	.post-content :global(img) {
		@apply max-w-full h-auto rounded-lg shadow-md my-6 mx-auto;
	}

	.post-content :global(hr) {
		@apply border-base-300 my-8;
	}

	.post-content :global(em) {
		@apply italic text-base-content/70;
	}

	.post-content :global(strong) {
		@apply font-bold text-base-content;
	}

	/* Post navigation */
	.post-navigation {
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

	.nav-link.older {
		@apply items-start;
	}

	.nav-link.newer {
		@apply items-end text-right;
	}

	.nav-direction {
		@apply text-sm text-base-content/60;
	}

	.nav-title {
		@apply font-medium text-base-content;
	}

	.nav-link time {
		@apply text-xs text-base-content/50;
	}

	.nav-placeholder {
		@apply flex-1;
	}

	/* Project timeline */
	.project-timeline {
		@apply rounded-lg p-6;
		background: color-mix(in oklch, var(--color-base-100) 30%, transparent);
		border: 1px solid color-mix(in oklch, var(--color-base-300) 20%, transparent);
	}

	@media (hover: hover) {
		.project-timeline {
			backdrop-filter: blur(12px);
		}
	}

	.project-timeline h3 {
		@apply text-xl font-bold text-base-content mb-4;
	}

	.timeline-list {
		@apply list-none p-0 m-0 space-y-2;
	}

	.timeline-list li {
		@apply m-0;
	}

	.timeline-entry {
		@apply flex flex-col gap-0.5 py-2 px-3 rounded transition-colors no-underline;
	}

	.timeline-entry:not(.current) {
		@apply text-base-content/80 hover:bg-base-300;
	}

	.timeline-entry.current {
		@apply bg-primary text-primary-content;
	}

	.timeline-entry time {
		@apply text-xs opacity-70;
	}

	.entry-title {
		@apply font-medium;
	}
</style>
