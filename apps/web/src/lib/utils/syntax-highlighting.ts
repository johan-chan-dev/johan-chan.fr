import { createHighlighter } from 'shiki';
import type { Highlighter } from 'shiki';

let highlighter: Highlighter | null = null;

// Initialize Shiki highlighter with VS Code themes
export async function initHighlighter(): Promise<Highlighter> {
	if (highlighter) {
		return highlighter;
	}

	highlighter = await createHighlighter({
		themes: ['github-dark', 'github-light'],
		langs: [
			'javascript',
			'typescript',
			'svelte',
			'html',
			'css',
			'json',
			'bash',
			'shell',
			'yaml',
			'markdown',
			'jsx',
			'tsx',
			'toml',
			'dockerfile',
			'python',
			'java',
			'go',
			'rust',
			'c',
			'cpp',
			'sql'
		]
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

			// Map common language aliases
			const languageMap: Record<string, any> = {
				js: 'javascript',
				ts: 'typescript',
				sh: 'bash',
				yml: 'yaml',
				md: 'markdown'
			};

			const language = languageMap[lang] || lang;

			try {
				return shiki.codeToHtml(code, {
					lang: language,
					theme: 'github-dark',
					transformers: [
						{
							// Add custom CSS classes for better styling integration
							code(node) {
								node.properties.class = 'shiki-code';
							},
							pre(node) {
								node.properties.class = 'shiki-pre overflow-x-auto rounded-lg p-4 my-4';
							}
						}
					]
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
