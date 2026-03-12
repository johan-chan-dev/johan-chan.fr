<script lang="ts">
	import { theme } from './Theme.svelte';
	import Icon from '@iconify/svelte';
	let icon = $state('');

	$effect(() => {
		if (theme.toggleCounter === 0)
			icon = theme.current === 'abyss' ? 'line-md:moon-filled' : 'line-md:sunny-filled';
		else
			icon =
				theme.current === 'abyss'
					? 'line-md:sunny-filled-loop-to-moon-filled-transition'
					: 'line-md:moon-filled-to-sunny-filled-transition';
	});
</script>

<button
	onclick={() => {
		theme.toggle();
	}}
	class="button is-ghost is-small navbar-item"
	aria-label="Changer de thème"
>
	{#key icon}
		<Icon {icon} height={'1.75rem'} />
	{/key}
</button>
