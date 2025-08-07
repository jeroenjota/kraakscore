<template>
  <div v-if="pdfUrl">
    <p>✅ Uitslag is beschikbaar:</p>
    <a :href="pdfUrl" target="_blank" class="text-blue-600 underline">Bekijk de PDF</a>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const pdfUrl = ref(null);

// Stel de URL in nadat je hebt geüpload
function handleUploadComplete(response) {
  pdfUrl.value = response.data.url; // bv. "/pdfs/uitslag-123.pdf"
}
</script>
