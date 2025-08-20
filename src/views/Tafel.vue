<template>
  <div class="p-2 max-w-md mx-auto bg-white shadow rounded">
    <!-- Header: Ronde en Tafel -->
    <div class="flex justify-between items-center mb-2">
      <h2 class="text-lg font-bold">Ronde: {{ ronde }}</h2>
      <h2 class="text-lg font-bold">Tafel: {{ tafel }}</h2>
    </div>

    <!-- Teams header -->
    <div class="grid grid-cols-2 gap-2 font-semibold text-center border-b border-gray-300 pb-1">
      <div>{{ team1 }}</div>
      <div>{{ team2 }}</div>
    </div>

    <table class="w-full table-auto text-sm">
      <thead class="bg-gray-200 sticky top-0">
        <tr>
          <th class="px-0">#</th>
          <th class="px-0">S?</th>
          <th class="px-0">Score</th>
          <th class="px-0">Roem</th>
          <th class="px-0">S?</th>
          <th class="px-0">Score</th>
          <th class="px-0">Roem</th>
          <th class="px-0"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(partij, index) in partijen" :key="index">
          <td class="px-0">{{ index + 1 }}</td>

          <!-- Team 1 -->
          <td class="px-0">
            <input type="checkbox"
              class="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded" />
          </td>
          <td class="px-0">
            <input type="number" v-model.number="partij.score1" min="0"
              class="w-12 border rounded px-1 py-0.5 text-sm" />
          </td>
          <td class="px-0">
            <input type="text" placeholder="roem"
              class="w-12 border rounded px-1 py-0.5 text-sm" />
          </td>

          <!-- Team 2 -->
          <td class="px-0">
            <input type="checkbox"
              class="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded" />
          </td>
          <td class="px-0">
            <input type="number" v-model.number="partij.score2" min="0"
              class="w-12 border rounded px-1 py-0.5 text-sm" />
          </td>
          <td class="px-0">
            <input type="text" placeholder="roem"
              class="w-12 border rounded px-1 py-0.5 text-sm" />
          </td>

          <td class="px-0">
            <button @click="submitScore(index)" class="bg-blue-500 text-white px-0 rounded"
              :disabled="matchKlaar">✔</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Scrollable partijen -->
    <div class="overflow-y-auto max-h-64 mt-2">
      <div v-for="(partij, index) in partijen" :key="index"
        class="grid grid-cols-2 gap-2 items-center mb-1 p-1 border-b border-gray-200">
        <!-- Klaar knop -->
        <button @click="partijKlaar(index)"
          class="col-span-2 mt-1 bg-blue-500 text-white text-xs rounded px-0 py-1 hover:bg-blue-600">
          Klaar
        </button>
      </div>
    </div>

    <!-- Totaalstand -->
    <div class="mt-2 flex justify-between font-bold text-sm border-t border-gray-300 pt-2">
      <div>Totaal: {{ totaal1 }}</div>
      <div>Totaal: {{ totaal2 }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import axios from 'axios'

// Props voor ronde, tafel, teams en maxScore
const props = defineProps({
  ronde: { name: Number, default: 1 },
  tafel: { name: Number, default: 1 },
  team1: { name: String, default: 'Carla/Theo' },
  team2: { name: String, default: 'Ron/Jeroen' },
  maxScore: { name: Number, default: 2000 }
})

const partijen = ref([])

// Dynamisch toevoegen van partijen als nodig
function addPartij() {
  partijen.value.push({
    troef1: 'H', score1: 0, roem1: 0,
    troef2: 'S', score2: 0, roem2: 0
  })
}

// Voeg de eerste partij automatisch toe
addPartij()

// Totaalberekening
const totaal1 = computed(() => partijen.value.reduce((sum, p) => sum + p.score1, 0))
const totaal2 = computed(() => partijen.value.reduce((sum, p) => sum + p.score2, 0))

// Klaar-knop handler
function partijKlaar(index) {
  const p = partijen.value[index]

  // Verstuur alleen score naar server
  axios.post(`/api/tafel/${props.ronde}/${props.tafel}/score`, {
    partij: index + 1,
    score1: p.score1,
    score2: p.score2
  }).then(() => {
    console.log('Score opgeslagen', p.score1, p.score2)
  }).catch(err => console.error(err))

  // Controle of maxScore is bereikt
  if (totaal1.value >= props.maxScore || totaal2.value >= props.maxScore) {
    alert('Match klaar!')
  } else {
    // Voeg volgende partij toe
    addPartij()
  }
}
</script>

<style scoped>
/* Scrollable tabel mobielvriendelijk maken */
table {
  border-collapse: collapse;
  width: 100%;
}
th, td {
  border: 1px solid #ccc;
}
thead th {
  position: sticky;
  top: 0;
  background: #f3f4f6;
  z-index: 10;
}
</style>