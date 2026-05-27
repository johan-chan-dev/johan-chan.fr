import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}', 'tests/unit/**/*.{test,spec}.{js,ts}'],
		exclude: ['tests/integration/**/*', 'tests/e2e/**/*', 'tests/performance/**/*'],
		environment: 'jsdom',
		// No setupFiles or coverage thresholds yet — there are no unit tests.
		// When the first test lands, add a setup file (e.g. @testing-library/jest-dom
		// matchers + afterEach cleanup) and a realistic threshold, and install a
		// coverage provider (@vitest/coverage-v8) to use the `coverage` block below.
		coverage: {
			reporter: ['text', 'json', 'html'],
			exclude: [
				'node_modules/',
				'tests/',
				'**/*.d.ts',
				'**/*.config.*',
				'src/app.html',
				'src/lib/paraglide/**/*'
			]
		},
		globals: true,
		testTimeout: 10000
	}
});
