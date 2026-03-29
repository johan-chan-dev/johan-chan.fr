import { mdsvex, escapeSvelte } from 'mdsvex';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { createHighlighter } from 'shiki';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { contentComponents } from './src/lib/preprocessors/content-components.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Shared shiki config — canonical source: src/lib/utils/shiki-config.ts
// Cannot import .ts in svelte.config.js. Keep in sync manually.
const SHIKI_THEMES = ['github-dark', 'github-light'];
const SHIKI_DEFAULT_THEME = 'github-dark';
const SHIKI_LANGS = [
	'javascript', 'typescript', 'svelte', 'html', 'css',
	'json', 'bash', 'shell', 'yaml', 'markdown',
	'jsx', 'tsx', 'toml', 'dockerfile',
	'python', 'java', 'go', 'rust', 'c', 'cpp', 'sql'
];
const SHIKI_TRANSFORMERS = [
	{
		pre(node) {
			node.properties.class = 'shiki-pre overflow-x-auto rounded-lg p-4 my-4';
		},
		code(node) {
			node.properties.class = 'shiki-code';
		}
	}
];

const shikiHighlighter = await createHighlighter({
	themes: SHIKI_THEMES,
	langs: SHIKI_LANGS
});

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [
		contentComponents(),
		vitePreprocess(),
		mdsvex({
			extensions: ['.svx'],
			layout: resolve(__dirname, './src/lib/layouts/content.svelte'),
			highlight: {
				highlighter: async (code, lang) => {
					const html = shikiHighlighter.codeToHtml(code, {
						lang: lang || 'text',
						theme: SHIKI_DEFAULT_THEME,
						transformers: SHIKI_TRANSFORMERS
					});
					return `{@html \`${escapeSvelte(html)}\`}`;
				}
			}
		})
	],

	kit: {
		paths: {
			base: process.env.BASE_PATH ?? ''
		},
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: '404.html',
			precompress: true,
			strict: false
		}),
		prerender: {
			crawl: true,
			entries: ['*'],
			handleUnseenRoutes: 'ignore'
		}
	},

	extensions: ['.svelte', '.svx']
};

export default config;
