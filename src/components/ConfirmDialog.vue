<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white rounded-2xl p-6 w-80 shadow-lg text-center">
        <h2 class="text-2xl font-bold text-gray-800 mb-2">{{ title }}</h2>
      <div class="flex justify-between items-start">
          <p class="text-gray-600 mb-6 text-left">{{ message }}</p>
        <div v-if="icon" class="text-4xl mb-4">
          {{ iconHtml }}
        </div>
      </div>
      <div class="flex justify-end gap-3">
        <button
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          @click="cancel">
          {{ cancelButtonText }}
        </button>
        <button
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          @click="confirmAction">
          {{ confirmButtonText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const visible = ref(false);
const title = ref("");
const message = ref("");
const confirmButtonText = ref("OK");
const cancelButtonText = ref("Annuleren");
const icon = ref(null); // type of icon, bv 'warning', 'info', 'success', 'error'

let resolver = null;

function open(options) {
  title.value = options.title || "Bevestigen";
  message.value = options.message || "";
  confirmButtonText.value = options.confirmButtonText || "OK";
  cancelButtonText.value = options.cancelButtonText || "Annuleren";
  icon.value = options.icon || null;
  visible.value = true;

  return new Promise((resolve) => {
    resolver = resolve;
  });
}

function confirmAction() {
  visible.value = false;
  if (resolver) resolver(true);
  resolver = null;
}

function cancel() {
  visible.value = false;
  if (resolver) resolver(false);
  resolver = null;
}

// Kies HTML voor het icon (je kan hier ook SVG gebruiken)
const iconHtml = computed(() => {
  switch (icon.value) {
    case "warning":
      return "⚠️";
    case "info":
      return "ℹ️";
    case "success":
      return "✅";
    case "error":
      return "❌";
    case "question":
      return "❓";
    default:
      return "";
  }
});

defineExpose({ open });
</script>

<style>
/* Subtiele fade-in animatie voor de modal */
@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
.animate-fadeIn {
  animation: fadeIn 0.2s ease-out forwards;
}
</style>
