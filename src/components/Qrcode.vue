<template>
  <div>
    <!-- Deel-knop -->
    <button
      @click="open = true"
      class="bg-gray-200   text-white px-4 py-2 rounded hover:bg-blue-600 btn" v-tooltip="'QR-code voor de link naar de PDF'"
    >
      <Squares2X2Icon class="w-6 h-6 text-black" />
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
        class="bg-white p-4 rounded-lg shadow-md w-[280px] relative border border-gray-300"
      >
        <button
          class="absolute top-1 right-1 text-gray-400 hover:text-black"
          @click="open = false"
        >
          ✕
        </button>

        <h2 class="text-sm font-semibold mb-2">Deel deze QR-code</h2>
        <qrcode-vue :value="pdfUrl" :size="140" class="mx-auto" />

        <p class="text-xs mt-3 break-words text-center text-gray-600">
          {{ pdfUrl }}
        </p>

        <button
          @click="copyLink"
          class="mt-4 text-sm underline text-gray-600"
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
