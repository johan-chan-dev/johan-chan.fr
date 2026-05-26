import { resolve } from '$app/paths';
import type { Pathname } from '$app/types';
import { localizeHref } from '$lib/paraglide/runtime';

/**
 * Build an app-internal href: localize the route, then resolve it against the
 * base path. `resolve()` replaces the deprecated `base` and prefixes the base
 * path itself, so this is the single point where internal links are resolved.
 * Usage: appHref('/articles') → "/johan-chan.fr/articles" (on GitHub Pages)
 *                              → "/articles" (on custom domain)
 */
export function appHref(path: string): string {
	return resolve(localizeHref(path) as Pathname);
}
