import { MetaJsonSchema, dirToType } from '@johan-chan/content/schema';
import { dev, building } from '$app/environment';
import fs from 'fs';
import path from 'path';
import { transformImageUrls } from '../../../../vite-plugins/content-images';
import { contentModules, metaModules, svxModules, CONTENT_DIR } from './sources';
import type { LoadedContentItem } from './types';

// ============================================================================
// File-based Loading (for detail pages)
// ============================================================================

/**
 * Check if a directory is folder-based content (has meta.json).
 */
function isFolderContent(dirPath: string): boolean {
	return fs.existsSync(path.join(dirPath, 'meta.json'));
}

/**
 * Read folder-based content (meta.json + content.md).
 * For nested series: path is series/{seriesSlug}/{chapterSlug}/.
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

		let content = fs.existsSync(contentPath) ? fs.readFileSync(contentPath, 'utf-8').trim() : '';

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
 * Read content from disk (dev mode).
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

		// Try 2: Nested content (series/devlog chapters)
		const entries = fs.readdirSync(typePath, { withFileTypes: true });
		for (const entry of entries) {
			if (!entry.isDirectory()) continue;

			const subDir = path.join(typePath, entry.name);

			// Nested folder-based
			const nestedFolder = path.join(subDir, slug);
			if (fs.existsSync(nestedFolder) && isFolderContent(nestedFolder)) {
				return readFolderContent(nestedFolder);
			}
		}
	}

	return undefined;
}

/**
 * Read content from build-time imports (production).
 * Supports both folder-based and legacy formats.
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

	return undefined;
}

/**
 * Get a single content item by slug.
 * Dev: reads from disk for instant updates (includes drafts for preview).
 * Prod: uses build-time imported modules (filters out unpublished).
 */
export function getContentBySlug(slug: string): LoadedContentItem | undefined {
	// Use building flag since dev is incorrectly true during build
	const isDevMode = dev && !building;

	const item = isDevMode ? readContentFromDisk(slug) : readContentFromModules(slug);

	// Filter out unpublished content in production
	if (!isDevMode && item?.published === false) {
		return undefined;
	}

	return item;
}
