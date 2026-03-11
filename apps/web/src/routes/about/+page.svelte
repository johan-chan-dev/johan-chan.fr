<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { base } from '$app/paths';
	import { appHref } from '$lib/utils/href';
	import Icon from '@iconify/svelte';
	import DevOnly from '$lib/components/DevOnly.svelte';
</script>

<svelte:head>
	<title>{m['about.page_title']()}</title>
	<meta name="description" content={m['about.page_description']()} />
</svelte:head>

<div class="max-w-2xl xl:max-w-3xl 2xl:max-w-4xl mx-auto py-8">
	<!-- Profile section -->
	<div class="flex flex-col md:flex-row items-center md:items-start gap-6 mb-12">
		<!-- Photo -->
		<div class="shrink-0">
			<img
				src="{base}/images/johan.webp"
				alt="Johan Chan"
				width="128"
				height="128"
				class="w-32 h-32 rounded-full object-cover shadow-lg shadow-base-content/20"
			/>
		</div>

		<!-- Bio -->
		<div class="text-center md:text-left">
			<h1 class="text-2xl md:text-3xl font-bold mb-2">Johan Chan</h1>
			<div class="flex flex-wrap gap-2 mb-4 justify-center md:justify-start">
				<span class="text-sm text-base-content/50">{m['about.bio_tag_crafter']()}</span>
				<span class="text-sm text-base-content/30">·</span>
				<span class="text-sm text-base-content/50">{m['about.bio_tag_dad']()}</span>
			</div>
			<p class="text-base-content/80 leading-relaxed">{m['about.bio_text']()}</p>
		</div>
	</div>

	<!-- Philosophy pillars -->
	<section class="mb-12">
		<h2 class="text-sm uppercase tracking-wider text-base-content/50 font-medium mb-6">
			{m['about.philosophy_heading']()}
		</h2>
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
			<div class="p-4 bg-base-200 rounded-lg flex flex-col">
				<h3 class="font-semibold mb-2">{m['about.pillar_simplicity']()}</h3>
				<p class="text-sm text-base-content/70 leading-relaxed flex-1">{m['about.pillar_simplicity_desc']()}</p>
			</div>
			<div class="p-4 bg-base-200 rounded-lg flex flex-col">
				<h3 class="font-semibold mb-2">{m['about.pillar_coherence']()}</h3>
				<p class="text-sm text-base-content/70 leading-relaxed flex-1">{m['about.pillar_coherence_desc']()}</p>
			</div>
			<div class="p-4 bg-base-200 rounded-lg flex flex-col">
				<h3 class="font-semibold mb-2">{m['about.pillar_durability']()}</h3>
				<p class="text-sm text-base-content/70 leading-relaxed flex-1">{m['about.pillar_durability_desc']()}</p>
			</div>
		</div>
	</section>

	<!-- Craft definition -->
	<section class="mb-12">
		<h2 class="text-sm uppercase tracking-wider text-base-content/50 font-medium mb-4">
			{m['about.craft_heading']()}
		</h2>
		<div class="p-4 bg-base-200 rounded-lg">
			<p class="text-base-content/80 leading-relaxed">
				{m['about.craft_text']()}
			</p>
		</div>
	</section>

	<!-- Augmented definition -->
	<section class="mb-12">
		<h2 class="text-sm uppercase tracking-wider text-base-content/50 font-medium mb-4">
			{m['about.augmented_heading']()}
		</h2>
		<div class="p-4 bg-base-200 rounded-lg">
			<p class="text-base-content/80 leading-relaxed mb-3">
				{m['about.augmented_text']()}
			</p>
			<a href={appHref('/articles/ce-que-augmente-veut-dire')} class="text-sm text-primary hover:underline">
				{m['about.augmented_link']()}
			</a>
		</div>
	</section>

	<!-- Business section (hidden in prod) -->
	<DevOnly label="Section pas encore pertinente">
		<section>
			<h2 class="text-sm uppercase tracking-wider text-base-content/50 font-medium mb-4">
				{m['about.business_heading']()}
			</h2>
			<div class="p-4 bg-base-200 rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-6">
				<p class="text-base-content/80">{m['about.business_text']()}</p>
				<div class="flex flex-wrap gap-3 shrink-0">
					<a
						href="https://lagraineducraft.fr"
						target="_blank"
						rel="noopener noreferrer"
						class="btn btn-primary gap-2"
					>
						{m['about.business_cta']()}
						<Icon icon="mdi:open-in-new" width="16" height="16" />
					</a>
					<a
						href="https://www.linkedin.com/in/johan-chan/"
						target="_blank"
						rel="noopener noreferrer"
						class="btn btn-ghost gap-2"
					>
						<Icon icon="teenyicons:linkedin-outline" width="16" height="16" />
						LinkedIn
					</a>
					<a
						href="https://github.com/johan-chan-dev"
						target="_blank"
						rel="noopener noreferrer"
						class="btn btn-ghost gap-2"
					>
						<Icon icon="teenyicons:github-outline" width="16" height="16" />
						GitHub
					</a>
				</div>
			</div>
		</section>
	</DevOnly>
</div>

<style>
	@reference "tailwindcss";
</style>
