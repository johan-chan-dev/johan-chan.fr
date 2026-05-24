<script lang="ts">
	import { onMount } from 'svelte';
	import { m } from '$lib/paraglide/messages';
	import { theme } from '$lib/components/Theme.svelte';
	import { mountCalInline } from './cal-embed';

	onMount(() => {
		mountCalInline({
			origin: 'https://cal.lagraineducraft.fr',
			calLink: 'johan.chan/30min',
			namespace: '30min',
			selector: '#cal-inline',
			theme: theme.current === 'abyss' ? 'dark' : 'light'
		});
	});
</script>

<div class="max-w-2xl xl:max-w-3xl 2xl:max-w-4xl mx-auto py-8">
	<header class="mb-8 text-center md:text-left">
		<h1 class="text-2xl md:text-3xl font-bold mb-2">{m['call.heading']()}</h1>
		<p class="text-base-content/80 leading-relaxed">{m['call.intro']()}</p>
	</header>

	<div id="cal-inline" class="w-full min-h-[600px] overflow-hidden rounded-lg"></div>
</div>
