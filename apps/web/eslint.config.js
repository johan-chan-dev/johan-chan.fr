import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs['flat/recommended'],
	prettier,
	...svelte.configs['flat/prettier'],
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	},
	{
		// Include .svelte.ts/.svelte.js rune modules so the svelte parser gets its
		// TypeScript sub-parser (otherwise type annotations fail to parse).
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				parser: ts.parser,
				tsconfigRootDir: __dirname
			}
		}
	},
	{
		files: ['**/*.ts'],
		languageOptions: {
			parserOptions: {
				// Config files aren't in any tsconfig include; let the project
				// service fall back to an inferred default project for them.
				projectService: {
					allowDefaultProject: ['vitest.config.ts', 'playwright.config.ts']
				},
				tsconfigRootDir: __dirname
			}
		}
	},
	{
		files: ['**/*.svelte'],
		rules: {
			// Internal links go through the appHref() helper (src/lib/utils/href.ts),
			// which centralizes locale + base-path resolution via $app/paths `resolve()`.
			// This rule is a per-call-site syntactic check and can't see through the
			// helper, so it's disabled in favour of the single resolution point.
			'svelte/no-navigation-without-resolve': 'off',
			// Every {@html} in this app renders trusted build-time markdown (marked
			// output from the read-only content mirror); no user input is rendered.
			'svelte/no-at-html-tags': 'off'
		}
	},
	{
		// Generated code — not hand-maintained, don't lint.
		ignores: ['build/', '.svelte-kit/', 'dist/', 'src/lib/paraglide/', 'src/lib/ROUTES.ts']
	}
];
