<template>
  <!-- rounded border border-blue-200 bg-white/90 p-3 -->
  <div class="flex flex-wrap items-center gap-2 rounded-lg border border-blue-200 bg-white/90 p-3 text-sm">
    <span class="text-xs font-semibold text-blue-800 sm:text-sm">Instellingen:</span>
    <label class="flex items-center gap-1 text-gray-700">
      Partij tot
      <input
        type="number"
        min="1200"
        max="2500"
        step="100"
        :value="scoreTarget"
        @change="$emit('update:scoreTarget', Number($event.target.value))"
        class="w-18 rounded border border-blue-200 bg-white px-2 py-0.5 text-right font-mono text-xs sm:w-20 sm:text-sm" />
    </label>
    <label class="flex items-center gap-2 text-gray-700">
      Kruisen
      <input
        type="number"
        min="0"
        max="9"
        step="1"
        :value="winnerKruis"
        @change="$emit('update:winnerKruis', Number($event.target.value))"
        class="w-12 rounded border border-blue-200 bg-white px-2 py-0.5 text-right font-mono" />
    </label>
    <button
      type="button"
      role="switch"
      :aria-checked="onlineScoreEnabled"
      class="inline-flex items-center gap-2 rounded-full border border-blue-300 px-2 py-1 text-sm text-xs transition sm:text-sm"
      :class="onlineScoreEnabled ? 'bg-sky-100 text-sky-900' : 'bg-gray-100 text-gray-700'"
      @click="$emit('update:onlineScoreEnabled', !onlineScoreEnabled)"
    >
      <span
        class="relative inline-flex h-5 w-9 items-center rounded-full transition"
        :class="onlineScoreEnabled ? 'bg-sky-600' : 'bg-gray-400'"
      >
        <span
          class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition"
          :class="onlineScoreEnabled ? 'translate-x-4' : 'translate-x-0.5'"
        />
      </span>
      <span>Online score</span>
    </button>
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
  onlineScoreEnabled: {
    type: Boolean,
    default: true,
  },
});

defineEmits(["update:scoreTarget", "update:winnerKruis", "update:onlineScoreEnabled"]);
</script>
