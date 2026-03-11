/**
 * Client-safe utility functions for formatting
 */

/**
 * Format date for display
 */
export function formatDate(dateStr: string, locale: string = 'fr-FR'): string {
	const date = new Date(dateStr);
	return date.toLocaleDateString(locale, {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	});
}

/**
 * Format month/year header for feed grouping
 */
export function formatMonthYear(dateStr: string, locale: string = 'fr-FR'): string {
	const date = new Date(dateStr);
	return date.toLocaleDateString(locale, {
		month: 'long',
		year: 'numeric'
	});
}
