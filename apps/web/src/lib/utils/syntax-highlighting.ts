import { createHighlighter } from 'shiki';
import type { Highlighter } from 'shiki';
import {
	SHIKI_THEMES,
	SHIKI_LANGS,
	SHIKI_DEFAULT_THEME,
	SHIKI_LANG_ALIASES,
	SHIKI_TRANSFORMERS
} from './shiki-config';

let highlighter: Highlighter | null = null;

// Initialize Shiki highlighter with VS Code themes
export async function initHighlighter(): Promise<Highlighter> {
	if (highlighter) {
		return highlighter;
	}

	highlighter = await createHighlighter({
		themes: [...SHIKI_THEMES],
		langs: [...SHIKI_LANGS]
	});

	return highlighter;
}

// Custom marked renderer with Shiki highlighting
export async function createShikiRenderer() {
	const shiki = await initHighlighter();

	return {
		code(token: any): string {
			const code = token.text;
			const lang = token.lang;

			if (!lang) {
				return `<pre class="shiki-pre overflow-x-auto rounded-lg p-4 my-4 bg-gray-100 dark:bg-gray-800"><code class="shiki-code">${escapeHtml(code)}</code></pre>`;
			}

			const language = SHIKI_LANG_ALIASES[lang] || lang;

			try {
				return shiki.codeToHtml(code, {
					lang: language,
					theme: SHIKI_DEFAULT_THEME,
					transformers: SHIKI_TRANSFORMERS
				});
			} catch (error) {
				console.warn(`Failed to highlight code for language: ${lang}`, error);
				// Fallback to plain code block
				return `<pre class="shiki-pre overflow-x-auto rounded-lg p-4 my-4 bg-gray-100 dark:bg-gray-800"><code class="shiki-code">${escapeHtml(code)}</code></pre>`;
			}
		}
	};
}

// Utility function to escape HTML
function escapeHtml(text: string): string {
	const map: Record<string, string> = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;'
	};
	return text.replace(/[&<>"']/g, (m) => map[m]);
}
