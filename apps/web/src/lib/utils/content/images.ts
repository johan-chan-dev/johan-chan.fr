import { typeToDir, type ContentType } from '@johan-chan/content/schema';
import { base } from '$app/paths';
import { dev, building } from '$app/environment';
import fs from 'fs';
import path from 'path';
import { CONTENT_DIR } from './sources';

// Cached manifest for production
let cachedImageManifest: Record<
	string,
	{ cover?: string; optimized?: string; srcset?: string; og?: string }
> | null = null;

/**
 * Load image manifest from file (production only).
 * Shared by the scanner, series grouping, and the image-URL helpers.
 */
export function loadImageManifest(): Record<
	string,
	{ cover?: string; optimized?: string; srcset?: string; og?: string }
> {
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
 * Resolve image path and manifest entry for a content item.
 * Shared logic for cover, hero, and OG image URL functions.
 */
function resolveImageEntry(
	type: ContentType,
	slug: string,
	image: string | undefined,
	parentSlug?: string
): {
	devUrl: string;
	entry: { cover?: string; optimized?: string; srcset?: string; og?: string } | undefined;
} | null {
	if (!image) return null;

	const filename = image.replace(/^\.\/images\//, '');
	const typeDir = typeToDir(type);
	const contentPath = parentSlug ? `${typeDir}/${parentSlug}/${slug}` : `${typeDir}/${slug}`;

	const devUrl = `/@content-images/${contentPath}/${filename}`;

	if (dev && !building) {
		return { devUrl, entry: undefined };
	}

	const manifest = loadImageManifest();
	const entry = manifest[`${contentPath}/${filename}`];
	return { devUrl, entry };
}

/** Cover image URL (thumbnail for feeds). */
export function getCoverImageUrl(
	type: ContentType,
	slug: string,
	image: string | undefined,
	parentSlug?: string
): string | null {
	const resolved = resolveImageEntry(type, slug, image, parentSlug);
	if (!resolved) return null;
	if (!resolved.entry) return resolved.devUrl;
	return resolved.entry.cover ? `${base}${resolved.entry.cover}` : null;
}

/** Hero image URL + srcset (full-size for detail pages). */
export function getHeroImageUrl(
	type: ContentType,
	slug: string,
	image: string | undefined,
	parentSlug?: string
): { url: string; srcset: string } | null {
	const resolved = resolveImageEntry(type, slug, image, parentSlug);
	if (!resolved) return null;
	if (!resolved.entry) return { url: resolved.devUrl, srcset: '' };
	if (!resolved.entry.optimized) return null;
	return {
		url: `${base}${resolved.entry.optimized}`,
		srcset: resolved.entry.srcset
			? resolved.entry.srcset.replace(/(\/images\/)/g, `${base}/images/`)
			: ''
	};
}

/** OG image URL (social sharing). No base path — used in absolute URLs. */
export function getOGImageUrl(
	type: ContentType,
	slug: string,
	image: string | undefined,
	parentSlug?: string
): string | null {
	const resolved = resolveImageEntry(type, slug, image, parentSlug);
	if (!resolved) return null;
	if (!resolved.entry) return resolved.devUrl;
	return resolved.entry.og || resolved.entry.optimized || null;
}
