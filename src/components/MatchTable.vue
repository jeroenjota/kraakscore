<template>

  <table class="rondes table w-full" :id="matchType">
    <tbody>
      <tr v-for="(match, index) in matches" :key="index">
        <td style="width:9%; text-align: center;" class="border px-2"><span v-if="!matchType">T {{ match.tafel }}</span><span v-else>Pl {{ match.pl }} </span></td>
        <td style="width:23%; text-align: left;" class="border px-2 text-sm sm:text-lg">{{ match.teamL }}</td>
        <td style="width:5%; text-align: center;" class="border px-2">vs</td>
        <td style="width:23%; text-align: left;" class="border px-2 text-sm sm:text-lg">{{ match.teamR }}</td>
        <td style="width:15%; text-align: left;" class="border px-2">
          <input style="width:100%; margin:0" type="number" v-model.number="scores[index].scoreL" min="0" step="10"
            :disabled="!editMode || hasVRIJ(index)"
            @change="update(index)" @keypress="blokkeerLetters"/>

        </td>
        <td style="width:3%; text-align: center;" class="border px-2">-</td>
        <td style="width:15%; text-align: left;" class="border px-2">
          <input style="width:100%; margin:0" type="number" v-model.number="scores[index].scoreR" min="0" step="10"
            @change="update(index)" @keypress="blokkeerLetters" :disabled="!editMode || hasVRIJ(index)"/>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { useInputFilters } from '../composables/useInputFilters';
import dbService from '../services/dbServices';


const { blokkeerLetters } = useInputFilters();

const props = defineProps({
  matches: Array,
  teams: Array,
  tournamentId: {
    type: [Number, String],
    default: null,
  },
  tournamentDate: {
    type: [Date, String],
    default: null,
  },
  round: {
    type: [Number, String],
    default: null,
  },
  group: {
    type: String,
    default: null,
  },
  matchType: {
    type: String,
  },
  editMode: {
    type: Boolean
  }

})


// console.log('Edit mode in MatchTable:', editMode);

const emit = defineEmits(['update-result'])

const scores = ref([])

// console.log('Edit mode in MatchTable:', props.editMode);

watch(
  () => props.matches,
  (nextMatches) => {
    const safeMatches = Array.isArray(nextMatches) ? nextMatches : []
    scores.value = safeMatches.map((match) => ({
      tafel: (match?.tafel ?? 1) - 1,
      scoreL: match?.scoreL ?? '',
      scoreR: match?.scoreR ?? ''
    }))
  },
  { immediate: true, deep: true }
)

function hasVRIJ(match){
  let VRIJ = props.matches[match].teamL === "VRIJ" ||  props.matches[match].teamR === "VRIJ"
  return VRIJ
}

function update(index) {
  // console.log("update index:", index, "scores:", scores.value)
  const { scoreL, scoreR } = scores.value[index]
  if (scoreL !== '' && scoreR !== '') {
    const match = props.matches[index] ?? {}
    const oldScoreL = Number(match.scoreL ?? 0)
    const oldScoreR = Number(match.scoreR ?? 0)
    const newScoreL = Number(scoreL)
    const newScoreR = Number(scoreR)

    let actionType = 'unchanged'
    if (newScoreL === 0 && newScoreR === 0 && (oldScoreL !== 0 || oldScoreR !== 0)) {
      actionType = 'clear'
    } else if (oldScoreL === 0 && oldScoreR === 0 && (newScoreL !== 0 || newScoreR !== 0)) {
      actionType = 'create'
    } else if (oldScoreL !== newScoreL || oldScoreR !== newScoreR) {
      actionType = 'update'
    }

    dbService.logScoreEntry({
      tournamentId: props.tournamentId,
      tournamentDate: props.tournamentDate
        ? new Date(props.tournamentDate).toISOString()
        : null,
      round: props.round,
      group: props.group,
      matchType: props.matchType ?? 'group',
      table: match.tafel ?? null,
      place: match.pl ?? null,
      teamL: match.teamL ?? null,
      teamR: match.teamR ?? null,
      oldScoreL,
      oldScoreR,
      scoreL: newScoreL,
      scoreR: newScoreR,
      actionType,
    })
    emit('update-result', index, newScoreL, newScoreR)
  }
}
onMounted(() => {
 // console.log("MatchTable mounted with matches:", props.matches)
})
</script>
