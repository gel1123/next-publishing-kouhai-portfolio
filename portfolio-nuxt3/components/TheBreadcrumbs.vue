<script setup lang="ts">
// パンくずリストのために階層ごとのURLを取得
const urlList = [
  "/",
  ...useRoute()
    .path.split("/")
    .filter((path) => path)
    .map((_path, index, array) => {
      const url = "/" + array.slice(0, index + 1).join("/");
      return url;
    }),
];
</script>
<template>
  <span class="inline-flex items-center gap-4">
    <span v-for="(url, index) in urlList">
      <NuxtLink
        v-if="index < urlList.length - 1"
        :key="url"
        :href="url"
        class="inline-block h-7 w-7 rounded-full bg-accent-400 shadow-lg hover:opacity-70"
      ></NuxtLink>
      <span
        v-else
        key="current"
        class="inline-block h-7 w-7 rounded-full bg-accent-700 dark:bg-accent-200"
      ></span>
    </span>
  </span>
</template>
