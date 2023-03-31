<script setup lang="ts">
defineProps<{
  src: string;
}>();
</script>
<template>
  <img
    class="h-32 w-32 rounded-full border-4 object-cover object-center sm:h-48 sm:w-48"
    :src="src"
  />
</template>
