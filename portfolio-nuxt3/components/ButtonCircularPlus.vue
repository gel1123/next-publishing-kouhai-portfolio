<script setup lang="ts">
defineProps<{
  onClick: Function;
}>();
</script>
<template>
  <button
    class="relative h-20 w-20 rounded-full bg-sub-200 shadow-md before:absolute before:top-10 before:left-6 before:w-8 before:border-2 after:absolute after:top-10 after:left-6 after:w-8 after:rotate-90 after:border-2 hover:opacity-70 dark:border-b-2 dark:border-r-2 dark:border-sub-400 dark:bg-coffee dark:text-sub-100 dark:shadow-sub-200"
    @click="onClick()"
  />
</template>
