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
  <input
    v-model="modelValue"
    type="text"
    class="w-full rounded-lg border-2 p-2 dark:bg-coffee"
  />
</template>
