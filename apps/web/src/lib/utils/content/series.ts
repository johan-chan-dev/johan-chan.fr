import { SeriesMetaJsonSchema, type SeriesMeta } from '@johan-chan/content/schema';
import { base } from '$app/paths';
import { dev, building } from '$app/environment';
import fs from 'fs';
import path from 'path';
import { metaModules, CONTENT_DIR } from './sources';
import { loadImageManifest } from './images';
import { loadContentByType, loadContentByTypeForPrerender } from './scan';
import type { IndexEntryWithCover, SeriesGroupInfo } from './types';

/**
 * Load series-level meta.json from disk (dev mode).
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
 * Load series-level meta.json from build-time modules (production).
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
 * Load series grouped by parent (for series view).
 * Returns enriched metadata from series-level meta.json when available.
 */
export function loadSeriesGrouped(): Map<string, SeriesGroupInfo> {
	return _loadSeriesGroupedFrom(loadContentByType('série'));
}

/**
 * Load series grouped including preview items (for prerendering).
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
			const seriesMeta = isDevMode ? loadSeriesMetaDev(seriesSlug) : loadSeriesMetaProd(seriesSlug);

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
