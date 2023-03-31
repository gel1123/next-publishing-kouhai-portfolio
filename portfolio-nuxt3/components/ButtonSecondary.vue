<script setup lang="ts">
defineProps<{
  onClick: Function;
}>();
</script>
<template>
  <button
    class="rounded-md bg-sub-100 p-1 text-sm shadow-md hover:opacity-70 dark:bg-sub-700"
    @click="onClick()"
  >
    <slot />
  </button>
</template>
