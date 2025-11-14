<template>
    <h2 v-if="group">Groep {{ group }}</h2>
    <table :id="setID(group)">
      <thead>
        <tr>
          <th style="width:5%; text-align: center;" class="border px-2">pl</th>
          <th style="width:60%; text-align: left;" class="border px-2">Team</th>
          <th style="width:5%; text-align: center;" class="border px-2">#</th>
          <th style="width:25%; text-align: right;" class="border px-2">Punten</th>
          <th v-if="!group" style="width:25%; text-align: right;" class="border px-2">Rnk</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(team,i) in standings" :key="team.name">
          <td style="width:5%; text-align: center;" class="border px-2">{{ i + 1 }}</td>
          <td style="width:60%; text-align: left;" class="border px-2">{{ team.name }}</td>
          <td style="width:5%; text-align: center;"  class="border px-2 text-center">{{ team.played }}</td>
          <td style="width:15%; text-align: right;"  class="border px-2 text-center">{{ team.matchPoints }}</td>

          <td v-if="!group" style="width:25%; text-align: center;"  class="border px-2 text-center">+{{ rankings[i] }}</td>
        </tr>
      </tbody>
    </table>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  teams: Array,
  matches: Array,
  group: {
    type: String,
    default: '',
  }
})

const group = ref(props.group)

function setID(group){
    return "standTabel" + group
}

const rankings = ref([12,9,6,3,1,1,1,1])

const standings = computed(() => {
  // console.log("Computing standings:", props.teams, props.matches)
  return props.teams.map(name => {
    const stats = {
      name,
      played: 0,
      matchPoints: 0,
    }

    for (const round of props.matches) {
      //  console.log("Ronde:", round)
      for (const match of round) {
      //  console.log("tafel:", match)
        
        if (match.scoreL === 0 || match.scoreR === 0) continue

        let isTeamA = match.teamL === name
        let isTeamB = match.teamR === name
        if (!isTeamA && !isTeamB) continue
        const matchPoints = isTeamA ? match.scoreL : match.scoreR

        stats.matchPoints += matchPoints
        stats.played += 1
      }
    }

    return stats
  }).sort((a, b) => b.matchPoints - a.matchPoints)
})
</script>
