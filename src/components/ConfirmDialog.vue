<!--
  ConfirmDialog.vue – Promise-based modal confirmation dialog.
  Call the exposed open({ title, message, icon, ... }) method to show the dialog;
  it returns a Promise<boolean> that resolves when the user clicks confirm or cancel.
  Supports icon types: warning, info, success, error, question.
-->
<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div
      class="animate-fadeIn w-80 rounded-2xl bg-white p-6 text-center shadow-lg">
      <h2 class="mb-2 text-2xl font-bold text-gray-800">{{ title }}</h2>
      <div class="flex items-start justify-between">
        <div
          class="mb-6 max-w-none text-left text-gray-600"
          v-html="renderedMessage"></div>
        <div v-if="icon" class="mb-4 text-4xl">
          {{ iconHtml }}
        </div>
      </div>
      <div class="flex justify-end gap-3">
        <button
          class="rounded-lg bg-gray-200 px-4 py-2 text-gray-700 transition hover:bg-gray-300"
          @click="cancel">
          {{ cancelButtonText }}
        </button>
        <button
          class="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
          @click="confirmAction">
          {{ confirmButtonText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { marked } from "marked";
import DOMPurify from "dompurify";

marked.setOptions({
  breaks: true,
});

const visible = ref(false);
const title = ref("");
const message = ref("");
const confirmButtonText = ref("OK");
const cancelButtonText = ref("Annuleren");
const icon = ref(null); // type of icon, bv 'warning', 'info', 'success', 'error'

let resolver = null;

const renderedMessage = computed(() => {
  const raw = marked.parse(message.value || "", { breaks: true })
  return DOMPurify.sanitize(raw);
});

/**
 * Show the dialog and return a promise.
 * @param {object} options - { title, message, confirmButtonText, cancelButtonText, icon }
 * @returns {Promise<boolean>}
 */
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
