import { z } from 'zod';
import {
	ContentTypeSchema,
	ContentItemSchema,
	SeriesMetadataSchema,
	DevlogProjectSchema,
	IndexEntrySchema,
	MetaJsonSchema,
	SeriesMetaJsonSchema
} from './schema';

// Infer TypeScript types from Zod schemas
export type ContentType = z.infer<typeof ContentTypeSchema>;
export type ContentItem = z.infer<typeof ContentItemSchema>;
export type SeriesMetadata = z.infer<typeof SeriesMetadataSchema>;
export type DevlogProject = z.infer<typeof DevlogProjectSchema>;
export type IndexEntry = z.infer<typeof IndexEntrySchema>;
export type SeriesMeta = z.infer<typeof SeriesMetaJsonSchema>;

// Folder-based content structure
export type MetaJson = z.infer<typeof MetaJsonSchema>;

/**
 * Full content item with type and slug inferred from path
 */
export interface FolderContentItem extends MetaJson {
	type: ContentType;
	slug: string;
}

// Extended types for loaded content (with rendered markdown)
export interface LoadedContentItem extends ContentItem {
	content: string; // Rendered HTML content
	readingTime?: number;
}

// Grouped content for series/devlog views
export interface GroupedSeries extends SeriesMetadata {
	items: ContentItem[];
}

export interface GroupedDevlog extends DevlogProject {
	posts: ContentItem[];
}
