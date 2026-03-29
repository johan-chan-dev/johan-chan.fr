import type { Component } from 'svelte';

/**
 * Resolve and dynamically import a .svx component from a glob result.
 * Returns the Svelte component or undefined if not found.
 */
export async function loadSvxComponent(
	slug: string,
	modules: Record<string, () => Promise<unknown>>
): Promise<Component | undefined> {
	const modulePath = Object.keys(modules).find((p) => p.includes(`/${slug}/content.svx`));
	if (!modulePath) return undefined;
	const mod = (await modules[modulePath]()) as { default: Component };
	return mod.default;
}
