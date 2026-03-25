<template>
  <input
    type="date"
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
    class="m-1 rounded border bg-white p-1 text-sm"
    v-tooltip="'Kies de toernooidatum'" />
</template>

<script setup>
const today = new Date().toISOString().split("T")[0];

defineProps({
  modelValue: {
    type: String,
    default: () => new Date().toISOString().split("T")[0],
  },
});

defineEmits(["update:modelValue"]);
</script>
