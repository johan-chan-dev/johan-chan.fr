<script setup lang="ts">
import { ref } from 'vue';
const count = ref(0);
</script>
<template>
  <button @click="count--" aria-label="moins">−</button>
  <output>{{ count }}</output>
  <button @click="count++" aria-label="plus">+</button>
</template>
