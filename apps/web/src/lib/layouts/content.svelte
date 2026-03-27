<script module>
	export { default as Callout } from '$lib/components/content/Callout.svelte';
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		[key: string]: unknown;
	}

	const { children }: Props = $props();
</script>

{@render children()}
