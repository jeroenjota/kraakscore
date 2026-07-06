<template>
  <div>
    <!-- Deel-knop -->
    <button
      @click="open = true"
      class="btn rounded bg-gray-200 px-4 py-2 text-white hover:bg-blue-600" v-tooltip="'QR-code voor de link naar de PDF'"
    >
      <Squares2X2Icon class="h-6 w-6 text-black" />
    </button>

    <div
      v-if="open"
      class="fixed inset-0 z-40 bg-[rgba(0,0,0,0.4)]"
      @click.self="open = false"
    ></div>

    <!-- Modal -->
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center"
      @click.self="open = false"
    >
      <div
        class="w-70 relative rounded-lg border border-gray-300 bg-white p-4 shadow-md"
      >
        <button
          class="absolute right-1 top-1 text-gray-400 hover:text-black"
          @click="open = false"
        >
          ✕
        </button>

        <h2 class="mb-2 text-sm font-semibold">Deel deze QR-code</h2>
        <qrcode-vue :value="pdfUrl" :size="140" class="mx-auto" />

        <p class="wrap-break-word mt-3 text-center text-xs text-gray-600">
          {{ pdfUrl }}
        </p>

        <button
          @click="copyLink"
          class="mt-4 text-sm text-gray-600 underline"
        >
          📋 Kopieer link
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import QrcodeVue from 'qrcode.vue'

import { Squares2X2Icon } from '@heroicons/vue/24/outline'

const props = defineProps({
  pdfUrl: {
    type: String,
    required: true
  }
})

const open = ref(false)

// console.log('Qrcode component loaded with pdfUrl:', props.pdfUrl)

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(props.pdfUrl)
    alert('Link gekopieerd naar klembord!')
  } catch (err) {
    alert('Kopiëren mislukt.')
  }
}
</script>
