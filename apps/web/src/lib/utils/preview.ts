import { env } from '$env/dynamic/public';
import { page } from '$app/state';
import { browser } from '$app/environment';

export function isPreviewMode(): boolean {
	if (!browser) return false;
	const previewKey = env.PUBLIC_PREVIEW_KEY?.trim();
	if (!previewKey) return false;
	return page.url.searchParams.get('preview') === previewKey;
}

export function getPreviewParam(): string {
	if (!browser) return '';
	const previewKey = env.PUBLIC_PREVIEW_KEY?.trim();
	if (!previewKey) return '';
	const key = page.url.searchParams.get('preview');
	return key === previewKey ? key : '';
}

/** Append ?preview=key to a href if currently in preview mode */
export function previewHref(href: string): string {
	const key = getPreviewParam();
	if (!key) return href;
	const sep = href.includes('?') ? '&' : '?';
	return `${href}${sep}preview=${key}`;
}
