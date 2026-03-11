<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from '@iconify/svelte';
	import HamburgerButton from './HamburgerButton.svelte';
	import ThemeButton from './ThemeButton.svelte';
	import { page } from '$app/state';
	import { appHref } from '$lib/utils/href';

	interface Props {
		brand?: Snippet;
		children: Snippet;
	}
	const { brand, children }: Props = $props();
	let pathname = $derived(page.url.pathname);
	let isContentPage = $derived(pathname.split('/').filter(Boolean).length >= 2);
</script>

<header class="sticky top-0 z-50 bg-base-100/90 shadow-xs backdrop-blur-lg">
	<nav
		class="navbar max-w-3xl md:max-w-4xl xl:max-w-6xl 2xl:max-w-7xl mx-auto py-2 px-4"
	>
		<div class="navbar-start">
			<div class="dropdown">
				<HamburgerButton />

				<div
					class="menu dropdown-content menu-md z-1 mt-3 w-52 gap-2 rounded-box bg-base-100 p-2 shadow-sm"
				>
					{@render children()}
				</div>
			</div>

			{#if brand}
				{@render brand()}
			{/if}
		</div>

		<div class="navbar-center">
			{#if isContentPage}
				<a href={appHref('/')} class="btn btn-ghost btn-sm lg:hidden" aria-label="Accueil">
					<Icon icon="teenyicons:home-outline" width="18" height="18" />
				</a>
			{/if}
			<div class="hidden lg:flex">
				{@render children()}
			</div>
		</div>

		<div class="navbar-end">
			<ThemeButton />
		</div>
	</nav>
</header>

<style>
	@reference "tailwindcss";
</style>
