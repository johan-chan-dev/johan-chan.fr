import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  use: { baseURL: 'http://localhost:4399' },
  webServer: {
    command: 'node_modules/.bin/astro build && node_modules/.bin/pagefind --site dist && node_modules/.bin/astro preview --port 4399',
    url: 'http://localhost:4399',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
