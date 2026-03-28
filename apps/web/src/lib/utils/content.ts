import {
	ContentItemSchema,
	MetaJsonSchema,
	SeriesMetaJsonSchema,
	type ContentItem,
	type ContentType,
	type IndexEntry,
	type SeriesMeta,
	typeToDir,
	dirToType
} from '@johan-chan/content/schema';
import matter from 'gray-matter';
import { base } from '$app/paths';
import { dev, building } from '$app/environment';
import fs from 'fs';
import path from 'path';
import { transformImageUrls } from '../../../vite-plugins/content-images';

// For production: import all content files at build time
// This includes both legacy .md files and new folder-based content.md files
const contentModules = import.meta.glob('$content/**/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
});

// Also import meta.json files for folder-based content
const metaModules = import.meta.glob('$content/**/meta.json', {
	import: 'default',
	eager: true
});

// For production: import .svx files as compiled Svelte components (mdsvex pipeline)
const svxModules = import.meta.glob('$content/**/*.svx', {
	eager: true
});

// Content directory path (for dev mode file reads)
// In dev, DEV_CONTENT_DIR can point to le-cockpit's content (source of truth)
const CONTENT_DIR = dev && process.env.DEV_CONTENT_DIR
	? path.resolve(process.env.DEV_CONTENT_DIR)
	: path.resolve(process.cwd(), '../../packages/content');

// Type directories to scan
const TYPE_DIRS = ['articles', 'series', 'devlogs', 'posts'] as const;

interface LoadedContentItem extends ContentItem {
	content: string;
	filePath: string;
	renderMode: 'md' | 'svx';
}


// ============================================================================
// Folder-based Content Scanning (no index.json needed)
// ============================================================================

// Cache for scanned content (populated once per build/request)
let cachedItems: IndexEntry[] | null = null;

// Extended IndexEntry with computed coverUrl and optional parentSlug for nested series
export interface IndexEntryWithCover extends IndexEntry {
	coverUrl?: string;
	parentSlug?: string;
	readingTime?: number;
}

/**
 * Estimate reading time in minutes from markdown text (~250 words/min for French)
 */
function estimateReadingTime(text: string): number {
	const words = text.trim().split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.ceil(words / 250));
}

/**
 * Scan folders to build content list
 * Dev: reads from disk for instant updates
 * Prod: uses build-time imported meta.json modules
 */
function scanContentFolders(): IndexEntryWithCover[] {
	// Return cached items if available (for production)
	if (cachedItems && !dev) {
		return cachedItems as IndexEntryWithCover[];
	}

	const items: IndexEntryWithCover[] = [];
	const isDevMode = dev && !building;

	if (isDevMode) {
		// Dev mode: scan filesystem directly
		for (const typeDir of TYPE_DIRS) {
			const typePath = path.join(CONTENT_DIR, typeDir);
			if (!fs.existsSync(typePath)) continue;

			const entries = fs.readdirSync(typePath, { withFileTypes: true });
			for (const entry of entries) {
				if (!entry.isDirectory()) continue;

				const folderPath = path.join(typePath, entry.name);
				const metaPath = path.join(folderPath, 'meta.json');

				if (!fs.existsSync(metaPath)) continue;

				// For series: check if this is a series parent folder (has meta.json but no content.md)
				// If so, scan its subdirectories for chapters
				if (typeDir === 'series' && !fs.existsSync(path.join(folderPath, 'content.md')) && !fs.existsSync(path.join(folderPath, 'content.svx'))) {
					const seriesSlug = entry.name;
					const chapterEntries = fs.readdirSync(folderPath, { withFileTypes: true });
					for (const chapterEntry of chapterEntries) {
						if (!chapterEntry.isDirectory()) continue;

						const chapterPath = path.join(folderPath, chapterEntry.name);
						const chapterMetaPath = path.join(chapterPath, 'meta.json');

						if (!fs.existsSync(chapterMetaPath)) continue;

						try {
							const chapterMetaRaw = fs.readFileSync(chapterMetaPath, 'utf-8');
							const chapterMetaParsed = JSON.parse(chapterMetaRaw);
							const chapterMetaResult = MetaJsonSchema.safeParse(chapterMetaParsed);

							if (!chapterMetaResult.success) {
								console.error(`Validation error in ${chapterMetaPath}:`, chapterMetaResult.error.format());
								continue;
							}

							const imageFilename = chapterMetaResult.data.image?.replace(/^\.\/images\//, '');
							const coverUrl = imageFilename
								? `/@content-images/${typeDir}/${seriesSlug}/${chapterEntry.name}/${imageFilename}`
								: undefined;

							// Read content for reading time (try .svx first, then .md)
							const svxContentPath = path.join(chapterPath, 'content.svx');
							const mdContentPath = path.join(chapterPath, 'content.md');
							const readingContentPath = fs.existsSync(svxContentPath) ? svxContentPath : mdContentPath;
							const chapterContent = fs.existsSync(readingContentPath)
								? fs.readFileSync(readingContentPath, 'utf-8')
								: '';

							items.push({
								...chapterMetaResult.data,
								type: 'série',
								slug: chapterEntry.name,
								parentSlug: seriesSlug,
								coverUrl,
								readingTime: chapterContent ? estimateReadingTime(chapterContent) : undefined
							});
						} catch (error) {
							console.error(`Error reading ${chapterMetaPath}:`, error);
						}
					}
					continue;
				}

				try {
					const metaRaw = fs.readFileSync(metaPath, 'utf-8');
					const metaParsed = JSON.parse(metaRaw);
					const metaResult = MetaJsonSchema.safeParse(metaParsed);

					if (!metaResult.success) {
						console.error(`Validation error in ${metaPath}:`, metaResult.error.format());
						continue;
					}

					const type = dirToType(typeDir);
					if (!type) continue;

					// Compute cover URL for dev mode
					// meta.json.image is relative path like "./images/hero.png"
					const imageFilename = metaResult.data.image?.replace(/^\.\/images\//, '');
					const coverUrl = imageFilename
						? `/@content-images/${typeDir}/${entry.name}/${imageFilename}`
						: undefined;

					// Read content for reading time (try .svx first, then .md)
					const svxContentPath = path.join(folderPath, 'content.svx');
					const mdContentPath = path.join(folderPath, 'content.md');
					const readingContentPath = fs.existsSync(svxContentPath) ? svxContentPath : mdContentPath;
					const contentText = fs.existsSync(readingContentPath)
						? fs.readFileSync(readingContentPath, 'utf-8')
						: '';

					items.push({
						...metaResult.data,
						type,
						slug: entry.name,
						coverUrl,
						readingTime: contentText ? estimateReadingTime(contentText) : undefined
					});
				} catch (error) {
					console.error(`Error reading ${metaPath}:`, error);
				}
			}
		}
	} else {
		// Production/build: use imported meta.json modules
		const manifest = loadImageManifest();

		for (const [metaPath, metaContent] of Object.entries(metaModules)) {
			// Extract type and slug from path: ../../content/articles/my-slug/meta.json
			// For nested series: ../../content/series/series-slug/chapter-slug/meta.json
			const parts = metaPath.split('/');
			const metaIndex = parts.indexOf('meta.json');
			if (metaIndex < 2) continue;

			const slug = parts[metaIndex - 1];
			const possibleTypeDir = parts[metaIndex - 2];
			const type = dirToType(possibleTypeDir);

			// Check if this is a nested series chapter:
			// path looks like ../../content/series/{seriesSlug}/{chapterSlug}/meta.json
			if (!type && metaIndex >= 3) {
				const grandparentDir = parts[metaIndex - 3];
				const grandparentType = dirToType(grandparentDir);

				if (grandparentType === 'série') {
					const seriesSlug = possibleTypeDir;
					const chapterSlug = slug;

					// Validate as chapter meta (MetaJsonSchema), skip series-level meta
					const metaResult = MetaJsonSchema.safeParse(metaContent);
					if (!metaResult.success) {
						// Could be series-level meta.json (SeriesMetaJsonSchema) — skip it
						continue;
					}

					// Must have a date to be a chapter (series meta doesn't have date)
					if (!metaResult.data.date) continue;

					let coverUrl: string | undefined;
					if (metaResult.data.image) {
						const imageFilename = metaResult.data.image.replace(/^\.\/images\//, '');
						const key = `${grandparentDir}/${seriesSlug}/${chapterSlug}/${imageFilename}`;
						const cover = manifest[key]?.cover;
						coverUrl = cover ? `${base}${cover}` : undefined;
					}

					// Read content.md for reading time
					const chapterContentPath = metaPath.replace('meta.json', 'content.md');
					const chapterContentRaw = (contentModules[chapterContentPath] as string) || '';

					items.push({
						...metaResult.data,
						type: 'série',
						slug: chapterSlug,
						parentSlug: seriesSlug,
						coverUrl,
						readingTime: chapterContentRaw ? estimateReadingTime(chapterContentRaw) : undefined
					});
					continue;
				}
			}

			if (!type) continue;

			const metaResult = MetaJsonSchema.safeParse(metaContent);
			if (!metaResult.success) {
				// Could be a series-level meta.json — skip silently
				if (type === 'série') continue;
				console.error(`Validation error in ${metaPath}:`, metaResult.error.format());
				continue;
			}

			// Look up cover URL from manifest
			// meta.json.image is relative path like "./images/hero.png"
			let coverUrl: string | undefined;
			if (metaResult.data.image) {
				const imageFilename = metaResult.data.image.replace(/^\.\/images\//, '');
				const key = `${possibleTypeDir}/${slug}/${imageFilename}`;
				const cover = manifest[key]?.cover;
				coverUrl = cover ? `${base}${cover}` : undefined;
			}

			// Read content.md for reading time
			const contentMdPath = metaPath.replace('meta.json', 'content.md');
			const contentRaw = (contentModules[contentMdPath] as string) || '';

			items.push({
				...metaResult.data,
				type,
				slug,
				coverUrl,
				readingTime: contentRaw ? estimateReadingTime(contentRaw) : undefined
			});
		}
	}

	// Sort by date (newest first)
	items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

	// Filter out unpublished content in production
	// In dev mode, show all content (including drafts) for preview
	const filteredItems = isDevMode
		? items
		: items.filter((item) => item.published !== false);

	// Cache for production
	if (!dev) {
		cachedItems = filteredItems;
	}

	return filteredItems;
}

/**
 * Load all content entries by scanning folders
 * Folder structure is the source of truth
 * Excludes preview items from public-facing results (dev mode shows all)
 */
export function loadAllContent(): IndexEntryWithCover[] {
	const items = scanContentFolders();
	if (dev) return items;
	return items.filter((item) => item.preview !== true);
}

/**
 * Load all content including preview items (for prerendering).
 * Preview pages must be built so they can be served with the preview key.
 */
export function loadAllContentForPrerender(): IndexEntryWithCover[] {
	return scanContentFolders();
}

/**
 * Load content entries filtered by type
 */
export function loadContentByType(type: ContentType): IndexEntryWithCover[] {
	return loadAllContent().filter((item) => item.type === type);
}

/**
 * Load content entries filtered by type, including preview items (for prerendering)
 */
export function loadContentByTypeForPrerender(type: ContentType): IndexEntryWithCover[] {
	return loadAllContentForPrerender().filter((item) => item.type === type);
}

// Series group info returned by loadSeriesGrouped
export interface SeriesGroupInfo {
	items: IndexEntryWithCover[];
	title: string;
	description: string;
	coverUrl?: string;
	slug: string;
}

/**
 * Load series-level meta.json from disk (dev mode)
 */
function loadSeriesMetaDev(seriesSlug: string): SeriesMeta | undefined {
	const metaPath = path.join(CONTENT_DIR, 'series', seriesSlug, 'meta.json');
	try {
		const raw = fs.readFileSync(metaPath, 'utf-8');
		const parsed = JSON.parse(raw);
		const result = SeriesMetaJsonSchema.safeParse(parsed);
		if (result.success) return result.data;
	} catch {
		// No series meta.json
	}
	return undefined;
}

/**
 * Load series-level meta.json from build-time modules (production)
 */
function loadSeriesMetaProd(seriesSlug: string): SeriesMeta | undefined {
	// Look for ../../content/series/{seriesSlug}/meta.json
	for (const [metaPath, metaContent] of Object.entries(metaModules)) {
		const parts = metaPath.split('/');
		const metaIndex = parts.indexOf('meta.json');
		if (metaIndex < 2) continue;

		const folder = parts[metaIndex - 1];
		const parentDir = parts[metaIndex - 2];

		if (folder === seriesSlug && parentDir === 'series') {
			const result = SeriesMetaJsonSchema.safeParse(metaContent);
			if (result.success) return result.data;
		}
	}
	return undefined;
}

/**
 * Load series grouped by parent (for series view)
 * Returns enriched metadata from series-level meta.json when available
 */
export function loadSeriesGrouped(): Map<string, SeriesGroupInfo> {
	return _loadSeriesGroupedFrom(loadContentByType('série'));
}

/**
 * Load series grouped including preview items (for prerendering)
 */
export function loadSeriesGroupedForPrerender(): Map<string, SeriesGroupInfo> {
	return _loadSeriesGroupedFrom(loadContentByTypeForPrerender('série'));
}

function _loadSeriesGroupedFrom(seriesItems: IndexEntryWithCover[]): Map<string, SeriesGroupInfo> {
	const isDevMode = dev && !building;
	const grouped = new Map<string, SeriesGroupInfo>();

	for (const item of seriesItems) {
		// Use parentSlug (folder-derived) or fall back to parent field
		const seriesSlug = item.parentSlug || item.parent || 'uncategorized';

		if (!grouped.has(seriesSlug)) {
			// Try to load series-level meta.json
			const seriesMeta = isDevMode
				? loadSeriesMetaDev(seriesSlug)
				: loadSeriesMetaProd(seriesSlug);

			let coverUrl: string | undefined;
			if (seriesMeta?.image) {
				const imageFilename = seriesMeta.image.replace(/^\.\/images\//, '');
				if (isDevMode) {
					coverUrl = `/@content-images/series/${seriesSlug}/${imageFilename}`;
				} else {
					const manifest = loadImageManifest();
					const key = `series/${seriesSlug}/${imageFilename}`;
					const url = manifest[key]?.cover || manifest[key]?.optimized;
					coverUrl = url ? `${base}${url}` : undefined;
				}
			}

			grouped.set(seriesSlug, {
				items: [],
				title: seriesMeta?.title || item.parent || seriesSlug,
				description: seriesMeta?.description || '',
				coverUrl,
				slug: seriesSlug
			});
		}

		grouped.get(seriesSlug)!.items.push(item);
	}

	// Sort items within each series by order
	for (const [, series] of grouped) {
		series.items.sort((a, b) => (a.order || 0) - (b.order || 0));
		// Use first item's excerpt as series description if not set
		if (series.items.length > 0 && !series.description) {
			series.description = series.items[0].excerpt;
		}
	}

	return grouped;
}

/**
 * Load a single series by its slug.
 * Returns series meta + all chapters.
 */
export function loadSeriesBySlug(seriesSlug: string): SeriesGroupInfo | undefined {
	const grouped = loadSeriesGrouped();
	return grouped.get(seriesSlug);
}

/**
 * Load devlogs grouped by project (for devlog view)
 */
export function loadDevlogsGrouped(): Map<
	string,
	{ posts: IndexEntryWithCover[]; title: string; latestPost: { title: string; date: string } }
> {
	const devlogItems = loadContentByType('devlog');
	const grouped = new Map<
		string,
		{ posts: IndexEntryWithCover[]; title: string; latestPost: { title: string; date: string } }
	>();

	for (const item of devlogItems) {
		const projectId = item.parent || 'uncategorized';

		if (!grouped.has(projectId)) {
			grouped.set(projectId, {
				posts: [],
				title: projectId,
				latestPost: { title: '', date: '' }
			});
		}

		grouped.get(projectId)!.posts.push(item);
	}

	// Sort posts by date and set latest post
	for (const [, project] of grouped) {
		project.posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
		if (project.posts.length > 0) {
			project.latestPost = {
				title: project.posts[0].title,
				date: project.posts[0].date
			};
		}
	}

	return grouped;
}

// ============================================================================
// File-based Loading (for detail pages)
// ============================================================================

/**
 * Check if a directory is folder-based content (has meta.json)
 */
function isFolderContent(dirPath: string): boolean {
	return fs.existsSync(path.join(dirPath, 'meta.json'));
}

/**
 * Read folder-based content (meta.json + content.md)
 * For nested series: path is series/{seriesSlug}/{chapterSlug}/
 * The contentPath for images needs to include the series slug.
 */
function readFolderContent(folderPath: string): LoadedContentItem | undefined {
	try {
		// Extract type and slug from path
		const parts = folderPath.split(path.sep);
		const slug = parts.pop()!;
		const parentDir = parts.pop()!;
		let type = dirToType(parentDir);
		let imageTypeDir: string;

		if (!type) {
			// parentDir is a series slug, grandparent should be the typeDir
			const grandparentDir = parts.pop()!;
			type = dirToType(grandparentDir);

			if (!type) {
				console.error(`Unknown type directory: ${grandparentDir}`);
				return undefined;
			}

			// For nested series: typeDir includes series slug
			// transformImageUrls will build: series/{seriesSlug}/{chapterSlug}
			imageTypeDir = `${grandparentDir}/${parentDir}`;
		} else {
			imageTypeDir = parentDir;
		}

		// Read meta.json
		const metaPath = path.join(folderPath, 'meta.json');
		const metaRaw = fs.readFileSync(metaPath, 'utf-8');
		const metaParsed = JSON.parse(metaRaw);
		const metaResult = MetaJsonSchema.safeParse(metaParsed);

		if (!metaResult.success) {
			console.error(`Validation error in ${metaPath}:`, metaResult.error.format());
			return undefined;
		}

		// Detect content format: .svx (mdsvex) or .md (marked)
		const svxPath = path.join(folderPath, 'content.svx');
		const mdPath = path.join(folderPath, 'content.md');
		const hasSvx = fs.existsSync(svxPath);
		const renderMode = hasSvx ? 'svx' : 'md';
		const contentPath = hasSvx ? svxPath : mdPath;

		let content = fs.existsSync(contentPath)
			? fs.readFileSync(contentPath, 'utf-8').trim()
			: '';

		// Only transform image URLs for .md (mdsvex handles images differently via layout)
		if (renderMode === 'md') {
			content = transformImageUrls(content, imageTypeDir, slug, dev && !building);
		}

		return {
			...metaResult.data,
			type,
			slug,
			content,
			filePath: folderPath,
			renderMode
		};
	} catch (error) {
		console.error(`Error reading folder ${folderPath}:`, error);
		return undefined;
	}
}

/**
 * Parse a legacy content file (with frontmatter)
 */
function parseLegacyContentFile(filePath: string): LoadedContentItem | undefined {
	try {
		const raw = fs.readFileSync(filePath, 'utf-8');
		const { data, content } = matter(raw);

		// Infer slug from filename if not in frontmatter
		const filename = path.basename(filePath, '.md');
		if (!data.slug) {
			data.slug = filename;
		}

		const result = ContentItemSchema.safeParse(data);
		if (!result.success) {
			console.error(`Validation error in ${filePath}:`, result.error.format());
			return undefined;
		}

		return {
			...result.data,
			content,
			filePath,
			renderMode: 'md' as const
		};
	} catch (error) {
		console.error(`Error parsing ${filePath}:`, error);
		return undefined;
	}
}

/**
 * Read content from disk (dev mode)
 * Supports both folder-based and legacy formats
 */
function readContentFromDisk(slug: string): LoadedContentItem | undefined {
	const typeDirs = ['articles', 'series', 'devlogs', 'posts'];

	for (const typeDir of typeDirs) {
		const typePath = path.join(CONTENT_DIR, typeDir);
		if (!fs.existsSync(typePath)) continue;

		// Try 1: Folder-based at type/slug/
		const folderPath = path.join(typePath, slug);
		if (fs.existsSync(folderPath) && isFolderContent(folderPath)) {
			return readFolderContent(folderPath);
		}

		// Try 2: Legacy at type/slug.md
		const legacyPath = path.join(typePath, `${slug}.md`);
		if (fs.existsSync(legacyPath)) {
			return parseLegacyContentFile(legacyPath);
		}

		// Try 3: Nested content (series/devlog chapters)
		const entries = fs.readdirSync(typePath, { withFileTypes: true });
		for (const entry of entries) {
			if (!entry.isDirectory()) continue;

			const subDir = path.join(typePath, entry.name);

			// Nested folder-based
			const nestedFolder = path.join(subDir, slug);
			if (fs.existsSync(nestedFolder) && isFolderContent(nestedFolder)) {
				return readFolderContent(nestedFolder);
			}

			// Nested legacy
			const nestedLegacy = path.join(subDir, `${slug}.md`);
			if (fs.existsSync(nestedLegacy)) {
				return parseLegacyContentFile(nestedLegacy);
			}
		}
	}

	return undefined;
}

/**
 * Read content from build-time imports (production)
 * Supports both folder-based and legacy formats
 */
function readContentFromModules(slug: string): LoadedContentItem | undefined {
	// First, try folder-based content (meta.json)
	for (const [metaPath, metaContent] of Object.entries(metaModules)) {
		// Extract slug from path: ../../content/articles/my-slug/meta.json
		// Or nested: ../../content/series/series-slug/chapter-slug/meta.json
		const parts = metaPath.split('/');
		const metaIndex = parts.indexOf('meta.json');
		if (metaIndex < 1) continue;

		const folderSlug = parts[metaIndex - 1];
		if (folderSlug !== slug) continue;

		const parentDir = parts[metaIndex - 2];
		let type = dirToType(parentDir);
		let imageTypeDir: string;

		if (!type) {
			// Could be nested series: parentDir is series slug
			if (metaIndex >= 3) {
				const grandparentDir = parts[metaIndex - 3];
				type = dirToType(grandparentDir);
				if (type) {
					imageTypeDir = `${grandparentDir}/${parentDir}`;
				} else {
					continue;
				}
			} else {
				continue;
			}
		} else {
			imageTypeDir = parentDir;
		}

		// Validate meta
		const metaResult = MetaJsonSchema.safeParse(metaContent);
		if (!metaResult.success) {
			continue;
		}

		// Check for .svx content first (mdsvex pipeline), then .md (marked pipeline)
		const svxPath = metaPath.replace('meta.json', 'content.svx');
		const mdContentPath = metaPath.replace('meta.json', 'content.md');
		const hasSvx = svxPath in svxModules;
		const renderMode = hasSvx ? 'svx' : 'md';

		let content = '';
		if (renderMode === 'md') {
			content = (contentModules[mdContentPath] as string) || '';
			content = transformImageUrls(content, imageTypeDir, folderSlug, dev && !building);
		}

		return {
			...metaResult.data,
			type,
			slug: folderSlug,
			content,
			filePath: metaPath,
			renderMode
		};
	}

	// Fallback: try legacy content (frontmatter in .md)
	for (const [modulePath, rawContent] of Object.entries(contentModules)) {
		// Skip content.md files (they're folder-based, handled above)
		if (modulePath.endsWith('/content.md')) continue;

		try {
			const { data, content } = matter(rawContent as string);

			// Check if slug matches
			const filename = path.basename(modulePath, '.md');
			const contentSlug = data.slug || filename;

			if (contentSlug === slug) {
				const result = ContentItemSchema.safeParse(data);
				if (!result.success) {
					console.error(`Validation error in ${modulePath}:`, result.error.format());
					continue;
				}

				return {
					...result.data,
					content,
					filePath: modulePath,
					renderMode: 'md' as const
				};
			}
		} catch (error) {
			console.error(`Error parsing content file ${modulePath}:`, error);
		}
	}

	return undefined;
}

/**
 * Get a single content item by slug
 * Dev: reads from disk for instant updates (includes drafts for preview)
 * Prod: uses build-time imported modules (filters out unpublished)
 */
export function getContentBySlug(slug: string): LoadedContentItem | undefined {
	// Use building flag since dev is incorrectly true during build
	const isDevMode = dev && !building;

	const item = isDevMode
		? readContentFromDisk(slug)
		: readContentFromModules(slug);

	// Filter out unpublished content in production
	if (!isDevMode && item?.published === false) {
		return undefined;
	}

	return item;
}

// ============================================================================
// Cover Image URL
// ============================================================================

// Cached manifest for production
let cachedImageManifest: Record<string, { cover?: string; optimized?: string; srcset?: string; og?: string }> | null = null;

/**
 * Load image manifest from file (production only)
 */
function loadImageManifest(): Record<string, { cover?: string; optimized?: string; srcset?: string; og?: string }> {
	if (cachedImageManifest) return cachedImageManifest;

	const manifestPath = path.join(CONTENT_DIR, '.image-manifest.json');
	try {
		const content = fs.readFileSync(manifestPath, 'utf-8');
		cachedImageManifest = JSON.parse(content);
		return cachedImageManifest!;
	} catch {
		return {};
	}
}

/**
 * Get cover image URL for a content item
 * Dev: serves from Vite middleware
 * Prod: looks up optimized xs size from manifest
 * @param image - relative path like "./images/hero.png"
 * @param parentSlug - for nested series chapters, the series slug
 */
export function getCoverImageUrl(
	type: ContentType,
	slug: string,
	image: string | undefined,
	parentSlug?: string
): string | null {
	if (!image) return null;

	// Extract filename from relative path (./images/hero.png -> hero.png)
	const filename = image.replace(/^\.\/images\//, '');
	const typeDir = typeToDir(type);
	// For nested series: series/{seriesSlug}/{chapterSlug}
	const contentPath = parentSlug
		? `${typeDir}/${parentSlug}/${slug}`
		: `${typeDir}/${slug}`;
	const isDevMode = dev && !building;

	if (isDevMode) {
		return `/@content-images/${contentPath}/${filename}`;
	}

	// Production: look up manifest for optimized cover URL
	const manifest = loadImageManifest();
	const key = `${contentPath}/${filename}`;
	const entry = manifest[key];

	if (entry?.cover) {
		return `${base}${entry.cover}`;
	}

	return null;
}

/**
 * Get hero image URL with srcset for full-size display on detail pages.
 * Dev: serves original image from Vite middleware
 * Prod: looks up optimized lg size + srcset from manifest
 * @param image - relative path like "./images/hero.png"
 * @param parentSlug - for nested series chapters, the series slug
 */
export function getHeroImageUrl(
	type: ContentType,
	slug: string,
	image: string | undefined,
	parentSlug?: string
): { url: string; srcset: string } | null {
	if (!image) return null;

	const filename = image.replace(/^\.\/images\//, '');
	const typeDir = typeToDir(type);
	const contentPath = parentSlug
		? `${typeDir}/${parentSlug}/${slug}`
		: `${typeDir}/${slug}`;
	const isDevMode = dev && !building;

	if (isDevMode) {
		return {
			url: `/@content-images/${contentPath}/${filename}`,
			srcset: ''
		};
	}

	// Production: look up manifest for optimized hero URL + srcset
	const manifest = loadImageManifest();
	const key = `${contentPath}/${filename}`;
	const entry = manifest[key];

	if (entry?.optimized) {
		return {
			url: `${base}${entry.optimized}`,
			srcset: entry.srcset ? entry.srcset.replace(/(\/images\/)/g, `${base}/images/`) : ''
		};
	}

	return null;
}

/**
 * Get OG image URL (1200x630) for social sharing meta tags.
 * Dev: returns original image URL (no cropping in dev — only matters in prod OG tags)
 * Prod: looks up og variant from manifest, falls back to optimized (lg) URL
 * @param image - relative path like "./images/hero.png"
 * @param parentSlug - for nested series chapters, the series slug
 */
export function getOGImageUrl(
	type: ContentType,
	slug: string,
	image: string | undefined,
	parentSlug?: string
): string | null {
	if (!image) return null;

	const filename = image.replace(/^\.\/images\//, '');
	const typeDir = typeToDir(type);
	const contentPath = parentSlug
		? `${typeDir}/${parentSlug}/${slug}`
		: `${typeDir}/${slug}`;
	const isDevMode = dev && !building;

	if (isDevMode) {
		return `/@content-images/${contentPath}/${filename}`;
	}

	const manifest = loadImageManifest();
	const key = `${contentPath}/${filename}`;
	const entry = manifest[key];

	// OG images are used in absolute URLs (siteUrl + path) by SEO.svelte,
	// so they must NOT include the base path prefix
	return entry?.og || entry?.optimized || null;
}
