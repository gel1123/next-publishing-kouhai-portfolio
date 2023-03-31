<script setup lang="ts">
defineProps<{
  onClick: Function;
}>();
</script>
<template>
  <button
    class="text-rose-900 rounded-md bg-danger-200 py-1 px-4 text-sm shadow-md hover:opacity-70 dark:border-2 dark:border-danger-300 dark:bg-coffee dark:text-danger-200"
    @click="onClick()"
  >
    <slot />
  </button>
</template>
