/**
 * Estimate reading time in minutes from text (~250 words/min for French).
 */
export function estimateReadingTime(text: string): number {
	const words = text.trim().split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.ceil(words / 250));
}
