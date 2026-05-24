<script lang="ts">
	import { onMount } from 'svelte';
	import { m } from '$lib/paraglide/messages';
	import { theme } from '$lib/components/Theme.svelte';
	import { mountCalInline, updateCalTheme } from './cal-embed';

	const NAMESPACE = '30min';
	// Map the site's daisyUI theme to Cal's theme; reactive to live toggles.
	const calTheme = $derived(theme.current === 'abyss' ? 'dark' : 'light');
	let mounted = false;

	onMount(() => {
		mountCalInline({
			origin: 'https://cal.lagraineducraft.fr',
			calLink: 'johan.chan/30min',
			namespace: NAMESPACE,
			selector: '#cal-inline',
			theme: calTheme
		});
		mounted = true;
	});

	// Keep the embed's theme in sync when the visitor toggles the site theme.
	$effect(() => {
		const next = calTheme;
		if (mounted) updateCalTheme(NAMESPACE, next);
	});
</script>

<div class="max-w-3xl md:max-w-4xl xl:max-w-6xl 2xl:max-w-7xl mx-auto py-8">
	<header class="mb-8 text-center md:text-left">
		<h1 class="text-2xl md:text-3xl font-bold mb-2">{m['call.heading']()}</h1>
		<p class="text-base-content/80 leading-relaxed">{m['call.intro']()}</p>
	</header>

	<div id="cal-inline" class="w-full min-h-[600px] overflow-hidden rounded-lg"></div>
</div>
