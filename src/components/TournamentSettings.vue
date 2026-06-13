<template>
  <!-- rounded border border-blue-200 bg-white/90 p-3 -->
  <div class="flex flex-wrap items-center gap-4 rounded-lg border border-blue-200 bg-white/90 p-3 text-sm">
    <span class="font-semibold text-blue-800">Instellingen</span>
    <label class="flex items-center gap-2 text-gray-700">
      Score tot
      <input
        type="number"
        min="1200"
        max="2500"
        step="100"
        :value="scoreTarget"
        @change="$emit('update:scoreTarget', Number($event.target.value))"
        class="w-24 rounded border border-blue-200 bg-white px-2 py-0.5 text-right font-mono" />
    </label>
    <label class="flex items-center gap-2 text-gray-700">
      Kruisen voor winst
      <input
        type="number"
        min="0"
        max="32"
        step="1"
        :value="winnerKruis"
        @change="$emit('update:winnerKruis', Number($event.target.value))"
        class="w-16 rounded border border-blue-200 bg-white px-2 py-0.5 text-right font-mono" />
    </label>
  </div>
</template>

<script setup>
defineProps({
  scoreTarget: {
    type: Number,
    default: 2000,
  },
  winnerKruis: {
    type: Number,
    default: 4,
  },
});

defineEmits(["update:scoreTarget", "update:winnerKruis"]);
</script>
