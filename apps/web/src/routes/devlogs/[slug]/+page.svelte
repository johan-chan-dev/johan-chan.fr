<script lang="ts">
	import type { Component } from 'svelte';
	import { formatDate } from '$lib/utils/format';
	import { appHref } from '$lib/utils/href';
	import { previewHref } from '$lib/utils/preview';
	import SEO from '$lib/components/SEO.svelte';
	import DraftBanner from '$lib/components/DraftBanner.svelte';
	import PreviewGate from '$lib/components/PreviewGate.svelte';
	import PreviewBanner from '$lib/components/PreviewBanner.svelte';
	import ContentDetailHeader from '$lib/components/ContentDetailHeader.svelte';
	import '$lib/styles/prose-content.css';

	const { data } = $props();
	const post = $derived(data.post);
	const projectInfo = $derived(data.projectInfo);
	const newerPost = $derived(data.newerPost);
	const olderPost = $derived(data.olderPost);
	const PostComponent = $derived((data.post as unknown as { component?: Component }).component);

	const isDraft = $derived(post.published === false);
	const isPreview = $derived(post.preview === true);
</script>

<SEO
	title="{post.title} | {projectInfo.name} Devlog"
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

<article class="detail-page">
	<div class="post-topbar">
		<nav class="breadcrumb">
			<a href={previewHref(appHref('/devlogs'))}>← Retour aux devlogs</a>
		</nav>

		<div class="project-badge">
			<span class="project-name">{projectInfo.name}</span>
			<span class="post-count">{projectInfo.totalPosts} entrée{projectInfo.totalPosts > 1 ? 's' : ''}</span>
		</div>
	</div>

	<ContentDetailHeader
		title={post.title}
		excerpt={post.excerpt}
		date={post.date}
		readingTime={post.readingTime}
		tags={post.tags}
		heroUrl={post.heroUrl}
		heroSrcset={post.heroSrcset}
		coverUrl={post.coverUrl}
		image={post.image}
		imageFocus={post.imageFocus}
	>
		<div class="prose-content">
			{#if PostComponent}
				<PostComponent />
			{:else}
				{@html post.htmlContent}
			{/if}
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
	</ContentDetailHeader>
</article>

</PreviewGate>

<style>
	@reference "tailwindcss";
	@plugin "daisyui";

	.detail-page {
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
