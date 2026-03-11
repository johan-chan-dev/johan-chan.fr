import { base } from '$app/paths';
import { localizeHref } from '$lib/paraglide/runtime';

/**
 * Build an app-internal href with locale prefix + base path.
 * localizeHref works on SvelteKit routes, then base is prepended.
 * Usage: appHref('/articles') → "/johan-chan.fr/articles" (on GitHub Pages)
 *                              → "/articles" (on custom domain)
 */
export function appHref(path: string): string {
	const localized = localizeHref(path);
	return `${base}${localized}`;
}
