import type { ContentItem, IndexEntry } from '@johan-chan/content/schema';

// Extended IndexEntry with computed coverUrl and optional parentSlug for nested series
export interface IndexEntryWithCover extends IndexEntry {
	coverUrl?: string;
	parentSlug?: string;
	readingTime?: number;
}

// Series group info returned by loadSeriesGrouped
export interface SeriesGroupInfo {
	items: IndexEntryWithCover[];
	title: string;
	description: string;
	coverUrl?: string;
	slug: string;
}

export interface LoadedContentItem extends ContentItem {
	content: string;
	filePath: string;
	renderMode: 'md' | 'svx';
}
