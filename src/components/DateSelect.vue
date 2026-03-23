<!--
  DateSelect.vue – Tournament date picker.
  Displays the current tournament date and lets the user change it via
  a native date input. Defaults to today; emits the selected date on change.
-->
<template>
  <div class="flex items-center gap-2 rounded bg-sky-200 p-2">
    <label for="tournamentDate" class="text-sm text-blue-900">
      Toernooidatum:
    </label>
    <input
      id="tournamentDate"
      type="date"
      :value="formattedDate"
      @input="onDateChange"
      class="rounded border border-blue-300 bg-white px-2 py-1 text-sm text-black"
      data-testid="date-select" />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  /** The current tournament date (Date object or ISO string) */
  modelValue: {
    type: [Date, String],
    default: () => new Date(),
  },
})

const emit = defineEmits(['update:modelValue'])

/** Format the date prop as YYYY-MM-DD for the native input */
const formattedDate = computed(() => {
  const d = new Date(props.modelValue)
  if (isNaN(d.getTime())) return ''
  return d.toISOString().split('T')[0]
})

function onDateChange(event) {
  emit('update:modelValue', event.target.value)
}
</script>