import { dev } from '$app/environment';
import path from 'path';

// For production: import all content files at build time.
// This includes both legacy .md files and new folder-based content.md files.
export const contentModules = import.meta.glob('$content/**/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
});

// Also import meta.json files for folder-based content
export const metaModules = import.meta.glob('$content/**/meta.json', {
	import: 'default',
	eager: true
});

// For production: import .svx files as compiled Svelte components (mdsvex pipeline)
export const svxModules = import.meta.glob('$content/**/*.svx', {
	eager: true
});

// Content directory path (for dev mode file reads).
// In dev, DEV_CONTENT_DIR can point to le-cockpit's content (source of truth).
export const CONTENT_DIR =
	dev && process.env.DEV_CONTENT_DIR
		? path.resolve(process.env.DEV_CONTENT_DIR)
		: path.resolve(process.cwd(), '../../packages/content');

// Type directories to scan
export const TYPE_DIRS = ['articles', 'series', 'devlogs', 'posts'] as const;
