<script setup lang="ts">
defineProps<{
  darkOrEmpty: string | null;
  switchMode: () => void;
}>();
</script>
<template>
  <button
    class="inline-flex items-center justify-center rounded-full border-b-2 border-r-2 border-coffee p-1 text-xs font-bold leading-none hover:opacity-70 dark:border-main-100"
    @click="switchMode"
  >
    <span
      class="rounded-full border-[10px] border-l-coffee border-b-coffee border-r-main-100 border-t-main-100 dark:border-t-coffee dark:border-r-coffee dark:border-l-main-100 dark:border-b-main-100"
    ></span>
    <span class="ml-2 mr-1"> {{ darkOrEmpty || "light" }} mode </span>
  </button>
</template>
