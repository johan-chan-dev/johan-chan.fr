import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import svelte from '@astrojs/svelte';
import vue from '@astrojs/vue';
import react from '@astrojs/react';
import angular from '@analogjs/astro-angular';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://www.johan-chan.fr',
  integrations: [mdx(), svelte(), vue(), react(), angular({ vite: { disableTypeChecking: false } })],
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
