<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import Icon from '@iconify/svelte';
</script>

<footer class="bg-base-200 py-12 mt-auto">
	<div class="container mx-auto px-4 max-w-3xl md:max-w-4xl xl:max-w-6xl 2xl:max-w-7xl">
		<div class="flex flex-col md:flex-row justify-between items-center gap-6">
			<div class="text-center md:text-left">
				<p class="text-lg font-medium">{m['navigation.brand']()}</p>
				<p class="text-base-content/70">{m['footer.tagline']()}</p>
			</div>

			<div class="flex flex-col items-center md:items-end gap-2">
				<p class="text-base-content/70">{m['footer.location']()}</p>
				<a
					href="mailto:{m['footer.email']()}"
					class="link link-hover link-accent"
				>
					{m['footer.email']()}
				</a>
			</div>
		</div>

		<div class="divider my-6"></div>

		<div class="flex flex-col md:flex-row justify-between items-center gap-4">
			<div class="flex gap-4">
				<a
					href="https://www.linkedin.com/in/johan-chan/"
					target="_blank"
					rel="noopener noreferrer"
					class="btn btn-ghost btn-circle btn-sm"
					aria-label={m['homepage.linkedin_aria_label']()}
				>
					<Icon icon="teenyicons:linkedin-outline" width="1.25rem" height="1.25rem" />
				</a>
				<a
					href="https://github.com/johan-chan-dev"
					target="_blank"
					rel="noopener noreferrer"
					class="btn btn-ghost btn-circle btn-sm"
					aria-label="GitHub"
				>
					<Icon icon="teenyicons:github-outline" width="1.25rem" height="1.25rem" />
				</a>
			</div>

			<p class="text-base-content/50 text-sm">
				&copy; {new Date().getFullYear()} Johan Chan
			</p>
		</div>
	</div>
</footer>

<style>
	@reference "tailwindcss";
</style>
