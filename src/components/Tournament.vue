<template>
  <div>
    <div v-if="groups.length === 2">
      <div class="schema">
        <div v-for="(ronde, index) in groupMatches[0]" :key="index">
          <div v-if="index < 1">
            <h2 class="text-xl font-bold text-blue">Groep A</h2>
          </div>
          <div v-else>
            <h3>Ronde: {{ (index + 1) }}</h3>
          </div>
          <MatchTable :matches="groupMatches[0][index]" :teams="groups[0]"
            @update-result="(i, a, b) => updateGroupResult(0, index, i, a, b)" />
        </div>
      </div>
      <div class="schema">
        <div v-for="(ronde, index) in groupMatches[1]" :key="index">
          <div v-if="index < 1">
            <h2 class="text-xl font-bold text-blue">Groep B</h2>
          </div>
          <div v-else>
            <h3>Ronde: {{ (index + 1) }}</h3>
          </div>
          <MatchTable :matches="groupMatches[1][index]" :teams="groups[1]"
            @update-result="(i, a, b) => updateGroupResult(1, index, i, a, b)" />
        </div>
      </div>
      <div class="stand">
        <h2 class="text-xl font-semibold">Stand</h2>
        <div class="flex justify-center gap-2">
          <div class="">
            <h2>Groep A</h2>
            <GroupStandings group="A" :teams="groups[0]" :matches="groupMatches[0]" />
          </div>
          <div class="">
            <h2>Groep B</h2>
            <GroupStandings group="B" :teams="groups[1]" :matches="groupMatches[1]" />
          </div>
        </div>
      </div>

      <div class="schema"
        v-if="finalMatches.length === 2 && finalMatches[0].teamL && finalMatches[0].teamR && finalMatches[1].teamL && finalMatches[1].teamR">
        <h2 class="text-2xl font-bold mb-2">Finales</h2>

        <div class="mb-4">
          <h3 class="text-lg font-semibold">Finale</h3>
          <MatchTable :matches="[finalMatches[0]]" :teams="[finalMatches[0].teamL, finalMatches[0].teamR]"
            @update-result="(i, a, b) => updateFinalResult(i, a, b)" />
        </div>

        <div>
          <h3 class="text-lg font-semibold">Wedstrijd om 3e plaats</h3>
          <MatchTable :matches="[finalMatches[1]]" :teams="[finalMatches[1].teamL, finalMatches[1].teamR]"
            @update-result="(i, a, b) => updateFinalResult(i + 1, a, b)" />
        </div>
      </div>

    </div>
    <!--  minder danm 8 teams -->
    <div v-else class="schema">
      <h2 class="text-xl font-bold">Schema</h2>
      <div v-for="(ronde, index) in matches" :key="index">
        <h3>Ronde: {{ (index + 1) }}</h3>
        <MatchTable :matches="matches[index]" :teams="teams"
          @update-result="(i, a, b) => updateSingleResult(index, i, a, b)" />
      </div>
      <div class="stand">
        <h2 class="text-xl font-bold text-left">Stand</h2>
        <GroupStandings :teams="teams" :matches="matches" />
      </div>
    </div>

  </div>

</template>

<script setup>
import { ref, onMounted } from "vue";
import MatchTable from "./MatchTable.vue";
import GroupStandings from "./GroupStandings.vue";

const props = defineProps({
  initialTeams: {
    type: Array,
    required: true,
  },
  repeatRounds: {
    type: Number,
    default: 1
  }
});

const emit = defineEmits(["reset"]);

const teams = ref([...props.initialTeams]);
const matches = ref([]);
const repeatRounds = ref(props.repeatRounds)
const groups = ref([]);
const groupMatches = ref([]);
const finalMatches = ref([
  { teamL: null, teamR: null, scoreL: null, scoreR: null }, // finale
  { teamL: null, teamR: null, scoreL: null, scoreR: null }, // 3e plaats
]);

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function splitIntoGroups(teamList) {
  const shuffled = shuffle([...teamList]);
  const half = Math.ceil(shuffled.length / 2);
  return [shuffled.slice(0, half), shuffled.slice(half)];
}

function generateMatches(tms) {
  const inputTeams = [...tms]
  if (inputTeams.length % 2 !== 0) {
    inputTeams.push('BYE')
  }
  const schedule = [];
  const totalRounds = inputTeams.length - 1;
  const halfSize = inputTeams.length / 2;
  const baseRounds = [];
  // console.log(inputTeams)
  for (let round = 0; round < totalRounds; round++) {
    // console.log("Ronde: ", round)
    const matches = []
    for (let i = 0; i < halfSize; i++) {
      const teamL = inputTeams[i];
      const teamR = inputTeams[inputTeams.length - 1 - i];
      if (teamL !== "BYE" && teamR !== "BYE") {
        matches.push({ tafel: i + 1, teamL, teamR, scoreL: null, scoreR: null });
        // console.log("Match: ", i, teamL, teamR)
      }
    }
    // console.log("Matches: ", matches)
    baseRounds.push(matches)
    inputTeams.splice(1, 0, inputTeams.pop());
  }
  // console.log("baseRounds", baseRounds)
  const fullSchedule = [];

  // console.log("repeatRounds:", repeatRounds)

  for (let i = 0; i < repeatRounds.value; i++) {
    const roundCopy = JSON.parse(JSON.stringify(baseRounds));
    // console.log("roundCopy", roundCopy)

    fullSchedule.push(...roundCopy);
    // console.log("fullSchedule", fullSchedule)

  }
  schedule.value = fullSchedule
  // console.log("Schedule:", schedule.value)
  return schedule.value;
}

function updateGroupResult(groupIndex, matchIndex, tableIndex, scoreL, scoreR) {
  // console.log("index:", groupIndex, matchIndex, tableIndex, scoreL, scoreR)
  groupMatches.value[groupIndex][matchIndex][tableIndex].scoreL = scoreL;
  groupMatches.value[groupIndex][matchIndex][tableIndex].scoreR = scoreR;
  // console.log("groupMatches.value:",groupMatches.value[0][0][0])
  saveToLocalStorage();
  updateFinalists();
}

function updateSingleResult(index, table, scoreL, scoreR) {
  matches.value[index][table].scoreL = scoreL;
  matches.value[index][table].scoreR = scoreR;
  saveToLocalStorage();
}

function updateFinalResult(index, scoreL, scoreR) {
  finalMatches.value[index].scoreL = scoreL;
  finalMatches.value[index].scoreR = scoreR;
  saveToLocalStorage();
}

function calculateStandings(teamsList, matchesList) {
  const table = teamsList.map((name) => ({
    name,
    points: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
  }));
  for (const round of matchesList) {
    for (const match of round) {
      if (match.scoreL == null || match.scoreR == null) continue;
      const teamL = table.find((t) => t.name === match.teamL);
      const teamR = table.find((t) => t.name === match.teamR);
      if (!teamL || !teamR) continue;

      teamL.goalsFor += match.scoreL;
      teamL.goalsAgainst += match.scoreR;
      teamR.goalsFor += match.scoreR;
      teamR.goalsAgainst += match.scoreL;

      if (match.scoreL > match.scoreR) {
        teamL.points += 3;
        teamL.wins++;
        teamR.losses++;
      } else if (match.scoreL < match.scoreR) {
        teamR.points += 3;
        teamR.wins++;
        teamL.losses++;
      } else {
        teamL.points += 1;
        teamR.points += 1;
        teamL.draws++;
        teamR.draws++;
      }
      // console.log("match:", match)
    }

  }
  table.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const goalDiffA = a.goalsFor - a.goalsAgainst;
    const goalDiffB = b.goalsFor - b.goalsAgainst;
    return goalDiffB - goalDiffA;
  });

  return table;
}

function updateFinalists() {
  // Alleen bij 2 groepen
  if (groups.value.length !== 2) return;

  const standingsA = calculateStandings(groups.value[0], groupMatches.value[0]);
  const standingsB = calculateStandings(groups.value[1], groupMatches.value[1]);

  // Controleer of er al uitslagen zijn (minimaal 1 wedstrijd per groep gespeeld)
  if (
    standingsA.length === 0 ||
    standingsB.length === 0 ||
    standingsA.every((t) => t.points === 0 && t.wins === 0 && t.draws === 0) ||
    standingsB.every((t) => t.points === 0 && t.wins === 0 && t.draws === 0)
  ) {
    return; // nog geen finale omdat er geen uitslagen zijn
  }

  finalMatches.value[0].teamL = standingsA[0].name; // winnaar groep A
  finalMatches.value[0].teamR = standingsB[0].name; // winnaar groep B

  finalMatches.value[1].teamL = standingsA[1].name; // tweede groep A
  finalMatches.value[1].teamR = standingsB[1].name; // tweede groep B
}

function saveToLocalStorage() {
  localStorage.setItem("tournamentGroups", JSON.stringify(groups.value));
  // console.log("Opgeslagen: Groepen:" , groups.value)
  localStorage.setItem(
    "tournamentGroupMatches",
    JSON.stringify(groupMatches.value)
  );
  // console.log("Opgeslagen: groupMatches.value", groupMatches.value)
  localStorage.setItem("tournamentMatches", JSON.stringify(matches.value));
  // console.log("Opgeslagen: matches.value", matches.value)

  localStorage.setItem("tournamentFinalMatches", JSON.stringify(finalMatches.value));
  // console.log("Opgeslagen: finalMatches.value", finalMatches.value)

}

function loadFromLocalStorage() {
  const g = localStorage.getItem("tournamentGroups");
  const gm = localStorage.getItem("tournamentGroupMatches");
  const m = localStorage.getItem("tournamentMatches");
  const fm = localStorage.getItem("tournamentFinalMatches");
  if (g && gm) {
    groups.value = JSON.parse(g);
    // console.log("Opgehaald: groepen:", groups.value)
    groupMatches.value = JSON.parse(gm);
    // console.log("Opgehaald: groupMatches:", groupMatches.value)
  } else if (m) {
    matches.value = JSON.parse(m);
  }
  if (fm) {
    finalMatches.value = JSON.parse(fm);
  }
}

// function reset() {
//   localStorage.clear();
//   emit("reset");
// }

onMounted(() => {
  if (teams.value.length >= 8) {
    groups.value = splitIntoGroups(teams.value);
    groupMatches.value = groups.value.map((group) => generateMatches(group));
  } else {
    matches.value = generateMatches(teams.value);
    // console.log("matches:" ,  matches.value)
  }
  loadFromLocalStorage();
  // console.log("matches:" ,  matches.value)
  updateFinalists();
});
</script>
