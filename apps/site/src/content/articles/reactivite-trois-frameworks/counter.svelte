<script lang="ts">
  let count = $state(0);
</script>
<button onclick={() => (count -= 1)} aria-label="moins">−</button>
<output>{count}</output>
<button onclick={() => (count += 1)} aria-label="plus">+</button>
