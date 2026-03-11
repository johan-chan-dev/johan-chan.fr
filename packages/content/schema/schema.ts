import { z } from 'zod';

/**
 * Content types for the Activity Feed
 * - article: Long-form articles/essays
 * - série: Multi-part series (chapters)
 * - devlog: Development logs for projects
 * - post: Short-form posts (can link to external)
 */
export const ContentTypeSchema = z.enum(['article', 'série', 'devlog', 'post']);

// ============================================================================
// Meta.json Schema (Folder-based content structure)
// ============================================================================

/**
 * Schema for meta.json files in content folders.
 * Note: type and slug are NOT included - they are inferred from the folder path.
 *
 * Folder structure:
 *   content/articles/my-slug/
 *   ├── meta.json      <- This schema
 *   ├── content.md     <- Pure markdown body
 *   ├── .session.jsonl <- Editor session (hidden)
 *   └── images/        <- Colocated images
 */
export const MetaJsonSchema = z.object({
	// Required fields
	title: z.string().min(1, 'Title is required'),
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
	excerpt: z.string().min(1, 'Excerpt is required'),

	// Publishing
	published: z.boolean().default(true),
	preview: z.boolean().default(false),

	// Publishing timestamps (ISO 8601)
	updatedAt: z.string().datetime().optional(),
	firstPublishedAt: z.string().datetime().optional(),
	lastPublishedAt: z.string().datetime().optional(),

	// Categorization
	tags: z.array(z.string()).default([]),

	// Series/devlog grouping
	parent: z.string().optional(),
	order: z.number().int().positive().optional(),

	// External links (for post type)
	external_url: z.string().url().optional(),

	// Hero image (relative to images folder)
	image: z.string().optional(),
	// Hero image focal point for object-position (e.g. "center", "top", "bottom", "left center").
	imageFocus: z.string().default('center'),
	// OG image crop position (top, center, bottom). Defaults to center.
	ogCrop: z.enum(['top', 'center', 'bottom']).default('center'),

	// i18n
	translation_id: z.string().optional()
});

/**
 * Content Item frontmatter schema
 * Validates markdown frontmatter for all content types
 */
export const ContentItemSchema = z.object({
	// Required fields
	type: ContentTypeSchema,
	title: z.string().min(1),
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
	excerpt: z.string().min(1),

	// For on-site content
	slug: z.string().optional(),

	// For external links (e.g., LinkedIn posts)
	external_url: z.string().url().optional(),

	// For series/devlog grouping
	parent: z.string().optional(),
	order: z.number().int().positive().optional(),

	// Publishing
	published: z.boolean().default(true),
	preview: z.boolean().default(false),

	// Publishing timestamps (ISO 8601)
	updatedAt: z.string().datetime().optional(),
	firstPublishedAt: z.string().datetime().optional(),
	lastPublishedAt: z.string().datetime().optional(),

	// Optional metadata
	tags: z.array(z.string()).default([]),
	image: z.string().optional(),
	imageFocus: z.string().default('center'),

	// Translation support
	translation_id: z.string().optional()
});

/**
 * Schema for series-level meta.json files.
 * Each series folder has its own meta.json with title, description, etc.
 * Chapters live in subdirectories with their own meta.json + content.md.
 */
export const SeriesMetaJsonSchema = z.object({
	title: z.string().min(1, 'Series title is required'),
	description: z.string().min(1, 'Series description is required'),
	image: z.string().optional(),
	published: z.boolean().default(true),
	tags: z.array(z.string()).default([])
});

/**
 * Series metadata schema (derived from content items)
 */
export const SeriesMetadataSchema = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string(),
	itemCount: z.number().int().positive(),
	completedCount: z.number().int().nonnegative()
});

/**
 * Devlog project metadata schema (derived from content items)
 */
export const DevlogProjectSchema = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string(),
	postCount: z.number().int().positive(),
	latestPost: z.object({
		title: z.string(),
		date: z.string()
	})
});

/**
 * Index entry schema - lightweight representation of content for listings
 * Built dynamically by scanning content folders (no index.json needed)
 */
export const IndexEntrySchema = z.object({
	slug: z.string(),
	type: ContentTypeSchema,
	title: z.string(),
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
	excerpt: z.string(),
	parent: z.string().optional(),
	order: z.number().optional(),
	published: z.boolean().default(true),
	preview: z.boolean().default(false),

	// Publishing timestamps (ISO 8601)
	updatedAt: z.string().datetime().optional(),
	firstPublishedAt: z.string().datetime().optional(),
	lastPublishedAt: z.string().datetime().optional(),

	tags: z.array(z.string()).default([]),
	external_url: z.string().url().optional(),
	image: z.string().optional(),
	imageFocus: z.string().default('center')
});
