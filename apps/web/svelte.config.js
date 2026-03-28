import { mdsvex, escapeSvelte } from 'mdsvex';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { createHighlighter } from 'shiki';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const shikiHighlighter = await createHighlighter({
	themes: ['github-dark', 'github-light'],
	langs: [
		'javascript', 'typescript', 'svelte', 'html', 'css',
		'json', 'bash', 'shell', 'yaml', 'markdown',
		'jsx', 'tsx', 'toml', 'dockerfile'
	]
});

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [
		vitePreprocess(),
		mdsvex({
			extensions: ['.svx'],
			layout: resolve(__dirname, './src/lib/layouts/content.svelte'),
			highlight: {
				highlighter: async (code, lang) => {
					const html = shikiHighlighter.codeToHtml(code, {
						lang: lang || 'text',
						theme: 'github-dark'
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
