import {
	MetaJsonSchema,
	type ContentType,
	type IndexEntry,
	dirToType
} from '@johan-chan/content/schema';
import { base } from '$app/paths';
import { dev, building } from '$app/environment';
import fs from 'fs';
import path from 'path';
import { estimateReadingTime } from '../reading-time';
import { contentModules, metaModules, CONTENT_DIR, TYPE_DIRS } from './sources';
import { loadImageManifest } from './images';
import type { IndexEntryWithCover } from './types';

// ============================================================================
// Folder-based Content Scanning (no index.json needed)
// ============================================================================

// Cache for scanned content (populated once per build/request)
let cachedItems: IndexEntry[] | null = null;

/**
 * Scan folders to build content list.
 * Dev: reads from disk for instant updates.
 * Prod: uses build-time imported meta.json modules.
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
				if (
					typeDir === 'series' &&
					!fs.existsSync(path.join(folderPath, 'content.md')) &&
					!fs.existsSync(path.join(folderPath, 'content.svx'))
				) {
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
								console.error(
									`Validation error in ${chapterMetaPath}:`,
									chapterMetaResult.error.format()
								);
								continue;
							}

							const imageFilename = chapterMetaResult.data.image?.replace(/^\.\/images\//, '');
							const coverUrl = imageFilename
								? `/@content-images/${typeDir}/${seriesSlug}/${chapterEntry.name}/${imageFilename}`
								: undefined;

							// Read content for reading time (try .svx first, then .md)
							const svxContentPath = path.join(chapterPath, 'content.svx');
							const mdContentPath = path.join(chapterPath, 'content.md');
							const readingContentPath = fs.existsSync(svxContentPath)
								? svxContentPath
								: mdContentPath;
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
	const filteredItems = isDevMode ? items : items.filter((item) => item.published !== false);

	// Cache for production
	if (!dev) {
		cachedItems = filteredItems;
	}

	return filteredItems;
}

/**
 * Load all content entries by scanning folders.
 * Folder structure is the source of truth.
 * Excludes preview items from public-facing results (dev mode shows all).
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
 * Load content entries filtered by type.
 */
export function loadContentByType(type: ContentType): IndexEntryWithCover[] {
	return loadAllContent().filter((item) => item.type === type);
}

/**
 * Load content entries filtered by type, including preview items (for prerendering).
 */
export function loadContentByTypeForPrerender(type: ContentType): IndexEntryWithCover[] {
	return loadAllContentForPrerender().filter((item) => item.type === type);
}
