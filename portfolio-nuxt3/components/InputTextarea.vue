<script setup lang="ts">
const props = defineProps<{ modelValue: string }>();
const emits = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();
const modelValue = computed({
  get: () => props.modelValue,
  set: (value) => emits("update:modelValue", value),
});
</script>
<template>
  <textarea
    v-model="modelValue"
    class="h-32 w-full rounded-lg border-2 p-2 dark:bg-coffee"
  ></textarea>
</template>
