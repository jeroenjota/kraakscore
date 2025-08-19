<template>
  <div class="p-4">
    <h1 class="text-xl font-bold">Tafel invoer</h1>
    <p>Je bekijkt de invoerpagina voor tafel: {{ tableId }}</p>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
const tableId = route.params.id
</script>

