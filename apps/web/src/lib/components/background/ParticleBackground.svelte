<script lang="ts">
	import { browser } from '$app/environment';
	import { theme } from '$lib/components/Theme.svelte';
	import { ParticleSystem } from './particle-system';
	import { getConfig } from './particle-config';

	let canvas: HTMLCanvasElement | undefined = $state();
	let system: ParticleSystem | undefined = $state();
	let prefersReducedMotion = $state(false);

	// Check for reduced motion preference
	$effect(() => {
		if (!browser) return;

		const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		prefersReducedMotion = mediaQuery.matches;

		const handler = (e: MediaQueryListEvent) => {
			prefersReducedMotion = e.matches;
		};

		mediaQuery.addEventListener('change', handler);
		return () => mediaQuery.removeEventListener('change', handler);
	});

	// Initialize and cleanup particle system
	$effect(() => {
		if (!browser || !canvas || prefersReducedMotion) return;

		const config = getConfig(theme.current);
		system = new ParticleSystem(canvas, config);

		return () => {
			system?.destroy();
			system = undefined;
		};
	});

	// Update config on theme change (without recreating system)
	$effect(() => {
		if (!system || !theme.current) return;
		system.updateConfig(getConfig(theme.current));
	});

	function handleMouseMove(event: MouseEvent) {
		if (!system) return;
		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
		system.setMousePosition(event.clientX - rect.left, event.clientY - rect.top);
	}

	function handleMouseLeave() {
		system?.clearMousePosition();
	}
</script>

{#if !prefersReducedMotion}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="particle-container"
		onmousemove={handleMouseMove}
		onmouseleave={handleMouseLeave}
	>
		<canvas bind:this={canvas}></canvas>
	</div>
{/if}

<style>
	.particle-container {
		position: fixed;
		inset: 0;
		z-index: -1;
		pointer-events: none;
	}

	/* Enable mouse tracking only on devices with hover capability */
	@media (hover: hover) {
		.particle-container {
			pointer-events: auto;
		}
	}

	canvas {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
