import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import svelte from '@astrojs/svelte';
import vue from '@astrojs/vue';
import react from '@astrojs/react';
import angular from '@analogjs/astro-angular';
import tailwindcss from '@tailwindcss/vite';

// @analogjs/astro-angular hardcodes `esbuild: { jsxDev: true }` and injects it via
// updateConfig during astro:config:setup. That flag forces our React .tsx islands onto
// the dev JSX runtime (jsxDEV). In a production build, react/jsx-dev-runtime resolves to
// its prod variant which has NO jsxDEV export, so SSR prerendering crashes with
// "jsxDEV is not a function" (only on Vercel/NODE_ENV=production; the devbox hides it
// because the dev runtime stays loaded). jsxDev only affects JSX, never Angular's .ts,
// so restoring the production transform for builds is safe. This integration must run
// AFTER angular() so its updateConfig wins the merge; dev keeps jsxDev for React DX.
function reactJsxProdTransform() {
  return {
    name: 'react-jsx-prod-transform',
    hooks: {
      'astro:config:setup': ({ command, updateConfig }) => {
        if (command !== 'dev') {
          updateConfig({ vite: { esbuild: { jsxDev: false } } });
        }
      },
    },
  };
}

export default defineConfig({
  site: 'https://www.johan-chan.fr',
  integrations: [
    mdx(),
    svelte(),
    vue(),
    react(),
    angular({ vite: { disableTypeChecking: false } }),
    reactJsxProdTransform(),
  ],
  i18n: {
    locales: ['fr', 'en'],
    defaultLocale: 'fr',
    routing: { prefixDefaultLocale: false },
  },
  vite: {
    plugins: [tailwindcss()],
    server: { allowedHosts: ['.dev.box'] },
  },
});
