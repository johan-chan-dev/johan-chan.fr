<script lang="ts">
	import SEO from '$lib/components/SEO.svelte';
	import { getSEOData } from '$lib/data/seo-data';
	import { page } from '$app/state';
	import * as m from '$lib/paraglide/messages';
	import { appHref } from '$lib/utils/href';

	const { error } = $props();

	// Get SEO data for 404 page
	const seoData = getSEOData('/404');

	// Check if it's a 404 error
	const is404 = $derived(page.status === 404);
</script>

<!-- SEO for 404 page -->
{#if is404 && seoData}
	<SEO {...seoData} noindex={true} />
{/if}

<div class="error-container">
	{#if is404}
		<!-- 404 Error Page -->
		<div class="error-content">
			<div class="error-icon">
				<svg
					class="w-24 h-24 text-error"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-3-3v3m0 0v3m-3-3h6m-3 0h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					></path>
				</svg>
			</div>

			<div class="error-text">
				<h1 class="error-title">{m['error.404.title']()}</h1>
				<p class="error-subtitle">{m['error.404.subtitle']()}</p>
				<p class="error-message">{m['error.404.message']()}</p>
				<p class="error-suggestion">{m['error.404.suggestion']()}</p>
			</div>

			<div class="error-actions">
				<a href={appHref('/')} class="btn btn-primary">
					{m['error.404.homeButton']()}
				</a>
				<a href={appHref('/about')} class="btn btn-secondary">
					{m['error.404.aboutButton']()}
				</a>
			</div>
		</div>
	{:else}
		<!-- Generic Error Page -->
		<div class="error-content">
			<div class="error-icon">
				<svg
					class="w-24 h-24 text-error"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
					></path>
				</svg>
			</div>

			<div class="error-text">
				<h1 class="error-title">Erreur {error?.status || 'Inconnue'}</h1>
				<p class="error-message">
					{error?.message || "Une erreur inattendue s'est produite."}
				</p>
				<p class="error-suggestion">Veuillez réessayer ou retourner à l'accueil.</p>
			</div>

			<div class="error-actions">
				<a href={appHref('/')} class="btn btn-primary">Retour à l'accueil</a>
				<button class="btn btn-secondary" onclick={() => window.location.reload()}>
					Recharger la page
				</button>
			</div>
		</div>
	{/if}
</div>

<style>
	@reference "tailwindcss";
	@plugin "daisyui";

	.error-container {
		@apply h-full flex items-center justify-center p-4;
		@apply bg-error/5;
	}

	.error-content {
		@apply max-w-2xl mx-auto text-center;
		@apply bg-base-100;
		@apply rounded-2xl shadow-xl;
		@apply border border-error/20;
		@apply p-8 md:p-12;
	}

	.error-icon {
		@apply flex justify-center mb-8;
	}

	.error-text {
		@apply mb-8;
	}

	.error-title {
		@apply text-4xl md:text-5xl font-bold mb-4;
		@apply text-error;
	}

	.error-subtitle {
		@apply text-xl md:text-2xl font-semibold mb-4;
		@apply text-error/80;
	}

	.error-message {
		@apply text-lg mb-4;
		@apply text-error-content/70;
	}

	.error-suggestion {
		@apply text-base;
		@apply text-error-content/50;
	}

	.error-actions {
		@apply flex flex-col sm:flex-row gap-4 justify-center items-center;
	}

	.btn {
		@apply min-w-[160px];
	}

	/* Responsive adjustments */
	@media (max-width: 640px) {
		.error-content {
			@apply p-6;
		}

		.error-title {
			@apply text-3xl;
		}

		.error-subtitle {
			@apply text-lg;
		}

		.error-message {
			@apply text-base;
		}

		.error-actions {
			@apply flex-col;
		}
	}
</style>
