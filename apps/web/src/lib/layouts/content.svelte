<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		[key: string]: unknown;
	}

	const { children }: Props = $props();
</script>

{@render children()}
