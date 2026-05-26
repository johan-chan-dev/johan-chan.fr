<script lang="ts">
	import type { IndexEntryWithCover } from '$lib/utils/content';
	import ContentItemCard from './ContentItem.svelte';
	import { formatMonthYear } from '$lib/utils/format';

	interface Props {
		items: IndexEntryWithCover[];
		emptyMessage?: string;
	}

	const { items, emptyMessage = 'Aucun contenu pour le moment.' }: Props = $props();

	// Group items by month/year, preserving the (date-sorted) input order.
	const groupedItems = $derived.by(() => {
		const locale = 'fr-FR';
		const groups: Record<string, IndexEntryWithCover[]> = {};

		for (const item of items) {
			const monthYear = formatMonthYear(item.date, locale);
			(groups[monthYear] ??= []).push(item);
		}

		return Object.entries(groups);
	});
</script>

<div class="space-y-8">
	{#if items.length === 0}
		<div class="text-center py-12 text-base-content/60">
			<p>{emptyMessage}</p>
		</div>
	{:else}
		{#each groupedItems as [monthYear, monthItems] (monthYear)}
			<section>
				<!-- Month/Year header -->
				<h2
					class="text-sm uppercase tracking-wider text-base-content/50 font-medium mb-4 border-b border-base-300 pb-2"
				>
					{monthYear}
				</h2>

				<!-- Items for this month - grid layout -->
				<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
					{#each monthItems as item (`${item.type}-${item.slug}`)}
						<ContentItemCard {item} />
					{/each}
				</div>
			</section>
		{/each}
	{/if}
</div>

<style>
	@reference "tailwindcss";
</style>
