<script setup lang="ts">
defineProps<{
  onClick: Function;
}>();
</script>
<template>
  <button
    class="rounded-md bg-accent-200 py-1 px-4 text-sm shadow-md hover:opacity-70 dark:border-2 dark:border-accent-300 dark:bg-coffee dark:text-accent-200"
    @click="onClick()"
  >
    <slot />
  </button>
</template>
