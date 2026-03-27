<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		type?: 'info' | 'warning' | 'tip' | 'note';
		title?: string;
		children: Snippet;
	}

	const { type = 'info', title, children }: Props = $props();

	const icons: Record<string, string> = {
		info: 'i',
		warning: '!',
		tip: '~',
		note: '#'
	};

	const styles: Record<string, string> = {
		info: 'border-info bg-info/10 text-info',
		warning: 'border-warning bg-warning/10 text-warning',
		tip: 'border-success bg-success/10 text-success',
		note: 'border-neutral bg-neutral/10 text-neutral-content'
	};
</script>

<aside class="callout border-l-4 rounded-lg p-4 my-6 {styles[type]}">
	{#if title}
		<p class="font-bold mb-2">
			<span class="inline-block w-6 h-6 rounded-full bg-current/20 text-center mr-2">{icons[type]}</span>
			{title}
		</p>
	{/if}
	<div class="text-base-content/80">
		{@render children()}
	</div>
</aside>
