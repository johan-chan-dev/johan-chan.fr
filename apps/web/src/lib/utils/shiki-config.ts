/** Shiki themes used across both rendering pipelines */
export const SHIKI_THEMES = ['github-dark', 'github-light'] as const;

/** Default theme for code rendering */
export const SHIKI_DEFAULT_THEME = 'github-dark';

/** Languages supported by syntax highlighting */
export const SHIKI_LANGS = [
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
] as const;

/** Common language aliases */
export const SHIKI_LANG_ALIASES: Record<string, string> = {
	js: 'javascript',
	ts: 'typescript',
	sh: 'bash',
	yml: 'yaml',
	md: 'markdown'
};

/** Shared transformers for consistent <pre>/<code> output */
export const SHIKI_TRANSFORMERS = [
	{
		pre(node: any) {
			node.properties.class = 'shiki-pre overflow-x-auto rounded-lg p-4 my-4';
		},
		code(node: any) {
			node.properties.class = 'shiki-code';
		}
	}
];
