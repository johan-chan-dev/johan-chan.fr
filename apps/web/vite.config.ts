import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { imagetools } from 'vite-imagetools';
import type { KIT_ROUTES } from '$lib/ROUTES';
import { kitRoutes } from 'vite-plugin-kit-routes';
import tailwindcss from '@tailwindcss/vite';
import { contentImages } from './vite-plugins/content-images';

// In dev, DEV_CONTENT_DIR can point to le-cockpit's content (source of truth)
const devContentDir = process.env.DEV_CONTENT_DIR;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const plugins: any[] = [
	contentImages({ contentDir: devContentDir ?? '../../packages/content', outputDir: 'images' }),
	tailwindcss(),
	sveltekit(),
	kitRoutes<KIT_ROUTES>({}),
	imagetools(),
	paraglideVitePlugin({
		project: './project.inlang',
		outdir: './src/lib/paraglide',
		strategy: ['url', 'cookie', 'baseLocale']
	})
];

export default defineConfig({
	plugins,
	server: {
		host: true,
		allowedHosts: ['.dev.box', 'devbox'],
		fs: {
			allow: [
				// Allow Vite to access content outside project root (DEV_CONTENT_DIR for mdsvex compilation)
				...(devContentDir ? [devContentDir] : [])
			]
		}
	},
	test: { include: ['src/**/*.{test,spec}.{js,ts}'] }
});
