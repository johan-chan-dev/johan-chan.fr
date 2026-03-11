<script lang="ts">
	import { page } from '$app/state';
	import { deLocalizeUrl } from '$lib/paraglide/runtime';
	import { appHref } from '$lib/utils/href';
	import { previewHref } from '$lib/utils/preview';
	import type { KIT_ROUTES } from '$lib/ROUTES';
	import type { Snippet } from 'svelte';

	type Routes = keyof KIT_ROUTES['PAGES'];

	interface Props {
		href: Routes;
		preload?: 'hover' | 'tap' | 'off';
		children: Snippet;
	}

	const { href, preload = $bindable('hover'), children }: Props = $props();

	let currentPath = $derived(deLocalizeUrl(page.url).pathname);
	let targetHref = $derived(() => {
		page.url;
		return previewHref(appHref(href));
	});
</script>

<a
	data-sveltekit-preload-data={preload}
	class="menu menu-horizontal transition flex py-2 px-4 rounded-md
		{(href === '/' && href === currentPath) || (href !== '/' && currentPath.startsWith(href))
			? 'nav-link-active'
			: 'nav-link'}"
	href={targetHref()}
>
	{@render children()}
</a>

<style>
	.nav-link:hover {
		color: var(--color-primary);
		background: color-mix(in oklch, var(--color-primary) 10%, transparent);
	}

	.nav-link-active {
		color: var(--color-primary);
		background: color-mix(in oklch, var(--color-primary) 15%, transparent);
	}
</style>
