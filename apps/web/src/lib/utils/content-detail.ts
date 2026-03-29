import { Marked } from 'marked';
import { createShikiRenderer } from './syntax-highlighting';
import { getCoverImageUrl, getHeroImageUrl, getOGImageUrl } from './content';
import type { ContentType } from '@johan-chan/content/schema';

/**
 * Estimate reading time in minutes from text (~250 words/min for French).
 */
export function estimateReadingTime(text: string): number {
	const words = text.trim().split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.ceil(words / 250));
}

/**
 * Shared preparation for content detail pages.
 * Handles markdown rendering, image URL resolution, and reading time.
 */
export async function prepareContentDetail(
	item: { content: string; renderMode: 'md' | 'svx'; type: ContentType; image?: string },
	slug: string,
	parentSlug?: string
) {
	let htmlContent: string | null = null;
	if (item.renderMode === 'md') {
		const renderer = await createShikiRenderer();
		const instance = new Marked();
		instance.use({ renderer });
		htmlContent = await instance.parse(item.content);
	}

	const hero = getHeroImageUrl(item.type, slug, item.image, parentSlug);

	return {
		htmlContent,
		coverUrl: getCoverImageUrl(item.type, slug, item.image, parentSlug),
		heroUrl: hero?.url ?? null,
		heroSrcset: hero?.srcset ?? null,
		ogUrl: getOGImageUrl(item.type, slug, item.image, parentSlug),
		readingTime: estimateReadingTime(item.content)
	};
}
