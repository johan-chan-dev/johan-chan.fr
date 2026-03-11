import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { imagetools } from 'vite-imagetools';
import type { KIT_ROUTES } from '$lib/ROUTES';
import { kitRoutes } from 'vite-plugin-kit-routes';
import tailwindcss from '@tailwindcss/vite';
import { contentImages } from './vite-plugins/content-images';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const plugins: any[] = [
	contentImages({ contentDir: '../../packages/content', outputDir: 'images' }),
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
	server: { host: true, allowedHosts: ['devbox'] },
	test: { include: ['src/**/*.{test,spec}.{js,ts}'] }
});
