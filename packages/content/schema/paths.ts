/**
 * Shared Path Utilities
 *
 * Centralized path resolution for content and session files.
 * Used by both studio and web apps for consistent path handling.
 *
 * Supports both legacy (single .md file) and new (folder-based) structures:
 *
 * Legacy:
 *   content/articles/my-slug.md
 *   content/articles/.my-slug.session.json
 *
 * New (folder-based):
 *   content/articles/my-slug/
 *   ├── meta.json
 *   ├── content.md
 *   ├── .session.jsonl
 *   └── images/
 */

import type { ContentType } from './types';

// ============================================================================
// Type/Directory Mapping
// ============================================================================

/**
 * Map content types to their directory names
 */
export const TYPE_DIR_MAP = {
	article: 'articles',
	série: 'series',
	devlog: 'devlogs',
	post: 'posts'
} as const;

/**
 * Map directory names back to content types
 */
export const DIR_TYPE_MAP = {
	articles: 'article',
	series: 'série',
	devlogs: 'devlog',
	posts: 'post'
} as const;

/**
 * Convert content type to directory name
 * @param type - Content type (article, série, devlog, post)
 * @returns Directory name (articles, series, devlogs, posts)
 */
export function typeToDir(type: ContentType): string {
	return TYPE_DIR_MAP[type] || type;
}

/**
 * Convert directory name to content type
 * @param dir - Directory name (articles, series, devlogs, posts)
 * @returns Content type or undefined if not found
 */
export function dirToType(dir: string): ContentType | undefined {
	return (DIR_TYPE_MAP as Record<string, ContentType>)[dir];
}

// ============================================================================
// Folder-Based Content Paths
// ============================================================================

/**
 * Get the folder path for a content item (new folder structure)
 * @example getContentFolder('/content', 'article', 'my-slug')
 *          → '/content/articles/my-slug'
 */
export function getContentFolder(
	contentDir: string,
	type: ContentType,
	slug: string
): string {
	return `${contentDir}/${typeToDir(type)}/${slug}`;
}

/**
 * Parse a content path to extract type, slug, and optional parent
 * Walks backwards through segments to find a recognized type directory.
 *
 * @example parseContentPath('articles/my-slug')
 *          → { type: 'article', slug: 'my-slug' }
 * @example parseContentPath('series/l-ia-et-le-craft/chapter-slug')
 *          → { type: 'série', slug: 'chapter-slug', parentSlug: 'l-ia-et-le-craft' }
 * @example parseContentPath('/content/articles/my-slug')
 *          → { type: 'article', slug: 'my-slug' }
 */
export function parseContentPath(
	folderPath: string
): { type: ContentType; slug: string; parentSlug?: string } | null {
	const parts = folderPath.split('/').filter(Boolean);

	if (parts.length < 2) return null;

	// Walk backwards to find a recognized type directory
	for (let i = 0; i < parts.length - 1; i++) {
		const type = dirToType(parts[i]);
		if (type) {
			const slug = parts[parts.length - 1];
			const parentSlug = parts.length - 1 > i + 1 ? parts.slice(i + 1, parts.length - 1).join('/') : undefined;
			return { type, slug, parentSlug };
		}
	}

	return null;
}

/**
 * Resolve a content folder path from contentDir and contentPath.
 * contentPath already contains all segments (e.g. "series/l-ia-et-le-craft/chapter-slug").
 *
 * @example contentPathToFolder('/content', 'articles/my-slug')
 *          → '/content/articles/my-slug'
 * @example contentPathToFolder('/content', 'series/parent/chapter')
 *          → '/content/series/parent/chapter'
 */
export function contentPathToFolder(contentDir: string, contentPath: string): string {
	return `${contentDir}/${contentPath}`;
}

/**
 * Get meta.json path within a content folder
 */
export function getMetaJsonPath(folder: string): string {
	return `${folder}/meta.json`;
}

/**
 * Get content.md path within a content folder
 */
export function getContentMdPath(folder: string): string {
	return `${folder}/content.md`;
}

/**
 * Get .session.jsonl path within a content folder (new JSONL format)
 */
export function getSessionJsonlPath(folder: string): string {
	return `${folder}/.session.jsonl`;
}

/**
 * Get images directory path within a content folder
 */
export function getImagesPath(folder: string): string {
	return `${folder}/images`;
}

// ============================================================================
// Path Resolution
// ============================================================================

/**
 * Extract slug from a content path
 * @param contentPath - Path like "articles/my-article" or "series/le-parcours/ch1"
 * @returns The slug (last segment of the path)
 */
export function slugFromPath(contentPath: string): string {
	const parts = contentPath.split('/');
	return parts[parts.length - 1];
}

/**
 * Get session file path for a content item
 *
 * Sessions are colocated with content files as hidden JSON files:
 * - Content: articles/my-article.md
 * - Session: articles/.my-article.session.json
 *
 * For nested content (series chapters):
 * - Content: series/le-parcours/ch1.md
 * - Session: series/le-parcours/.ch1.session.json
 *
 * @param contentDir - Base content directory (e.g., apps/web/src/content)
 * @param contentPath - Relative path like "articles/my-article"
 * @returns Full path to session file
 */
export function getSessionPath(contentDir: string, contentPath: string): string {
	const parts = contentPath.split('/');
	const slug = parts.pop()!;
	const parentPath = parts.join('/');

	// Session file is a hidden file next to the content
	const sessionFileName = `.${slug}.session.json`;

	if (parentPath) {
		return `${contentDir}/${parentPath}/${sessionFileName}`;
	}
	return `${contentDir}/${sessionFileName}`;
}

/**
 * Get content file path from a content path
 *
 * @param contentDir - Base content directory
 * @param contentPath - Relative path like "articles/my-article"
 * @returns Full path to content file (.md)
 */
export function getContentFilePath(contentDir: string, contentPath: string): string {
	return `${contentDir}/${contentPath}.md`;
}

/**
 * Convert a content file path to a content path (relative path without extension)
 *
 * @param contentDir - Base content directory
 * @param filePath - Full path to content file
 * @returns Content path like "articles/my-article"
 */
export function filePathToContentPath(contentDir: string, filePath: string): string {
	// Remove content dir prefix
	let relative = filePath.startsWith(contentDir)
		? filePath.slice(contentDir.length)
		: filePath;

	// Remove leading slash if present
	if (relative.startsWith('/')) {
		relative = relative.slice(1);
	}

	// Remove .md extension
	if (relative.endsWith('.md')) {
		relative = relative.slice(0, -3);
	}

	return relative;
}

/**
 * Check if a filename is a session file (supports both old .json and new .jsonl)
 *
 * @param filename - File name to check
 * @returns true if it's a session file
 */
export function isSessionFile(filename: string): boolean {
	return (
		filename.startsWith('.') &&
		(filename.endsWith('.session.json') || filename.endsWith('.session.jsonl'))
	);
}

/**
 * Check if a filename is a JSONL session file (new format)
 */
export function isSessionJsonlFile(filename: string): boolean {
	return filename === '.session.jsonl';
}

/**
 * Extract slug from session filename
 *
 * @param filename - Session filename like ".my-article.session.json" or ".session.jsonl"
 * @returns Slug like "my-article" or null for folder-based sessions
 */
export function slugFromSessionFilename(filename: string): string | null {
	// New format: .session.jsonl doesn't contain slug (it's in the folder name)
	if (filename === '.session.jsonl') {
		return null;
	}
	// Legacy format: .my-article.session.json
	if (filename.endsWith('.session.json')) {
		return filename.slice(1, -'.session.json'.length);
	}
	return null;
}
