/**
 * Svelte preprocessor that auto-injects content component imports into .svx files.
 *
 * Adds `import * as C from '$lib/components/content'` to every .svx file,
 * so content authors write <C.Callout> without manual imports.
 */
export function contentComponents() {
	const IMPORT_LINE = "import * as C from '$lib/components/content';";

	return {
		name: 'content-components',
		markup(/** @type {{ content: string, filename?: string }} */ { content, filename }) {
			if (!filename?.endsWith('.svx')) return;

			// Already has the import (e.g. manually added)
			if (content.includes(IMPORT_LINE)) return;

			const scriptMatch = content.match(/<script(?![^>]*module)[^>]*>/);
			if (scriptMatch && scriptMatch.index !== undefined) {
				// Inject after existing <script> tag
				const idx = scriptMatch.index + scriptMatch[0].length;
				return {
					code: content.slice(0, idx) + '\n' + IMPORT_LINE + content.slice(idx)
				};
			}

			// No <script> block — prepend one
			return {
				code: '<script>\n' + IMPORT_LINE + '\n</script>\n\n' + content
			};
		}
	};
}
