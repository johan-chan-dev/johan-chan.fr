<script lang="ts">
	import Icon from '@iconify/svelte';
</script>

<div class="alert alert-warning mb-6" role="alert">
	<Icon icon="teenyicons:edit-outline" width="20" height="20" class="shrink-0" />
	<span>
		<strong>Brouillon</strong> - Cet article n'est pas encore publié. Il est visible uniquement en
		mode développement.
	</span>
</div>

<style>
	@reference "tailwindcss";
</style>
