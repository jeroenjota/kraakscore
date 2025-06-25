<template>

  <table class="w-full rondes table">
    <tbody>
      <tr v-for="(match, index) in matches" :key="index">
        <td style="width:5%; text-align: center;" class="border px-2">T{{ match.tafel }}</td>
        <td style="width:25%; text-align: left;" class="border px-2">{{ match.teamL }}</td>
        <td style="width:5%; text-align: center;" class="border px-2">vs</td>
        <td style="width:25%; text-align: left;" class="border px-2">{{ match.teamR }}</td>
        <td style="width:15%; text-align: left;" class="border px-2">
          <input style="width:100%; margin:0" type="number" v-model.number="scores[index].scoreL"
            @change="update(index)" @keypress="blokkeerLetters" />
        </td>
        <td style="width:3%; text-align: center;" class="border px-2">-</td>
        <td style="width:15%; text-align: left;" class="border px-2">
          <input style="width:100%; margin:0" type="number" v-model.number="scores[index].scoreR"
            @change="update(index)" @keypress="blokkeerLetters" />
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
import { ref, watchEffect } from 'vue'
import { useInputFilters } from '../composables/useInputFilters';

const { blokkeerLetters } = useInputFilters();

const props = defineProps({
  matches: Array,
  teams: Array
})

const emit = defineEmits(['update-result'])

const scores = ref([])

watchEffect(() => {
  scores.value = props.matches.map(match => ({
    tafel: match.tafel - 1,
    scoreL: match.scoreL ?? '',
    scoreR: match.scoreR ?? ''
  }))
  // console.log("Scores:", scores.value)
})

function update(index) {
  const { scoreL, scoreR } = scores.value[index]
  if (scoreL !== '' && scoreR !== '') {
    // console.log('update-result', index, Number(scoreL), Number(scoreR))
    emit('update-result', index, Number(scoreL), Number(scoreR))
  }
}
</script>
