<template>
  <div id="tournament">
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
          <!-- {{ groupMatches[1] }} -->
          <MatchTable :matches="groupMatches[1][index]" :teams="groups[1]"
            @update-result="(i, a, b) => updateGroupResult(1, index, i, a, b)" />
        </div>
      </div>
      <div class="stand">
        <!-- <h2 class="text-xl font-semibold">Stand</h2> -->
        <div class="flex justify-center gap-2">
          <div class="">
            <GroupStandings group="A" :teams="groups[0]" :matches="groupMatches[0]" />
          </div>
          <div class="">
            <GroupStandings group="B" :teams="groups[1]" :matches="groupMatches[1]" />
          </div>
        </div>
      </div>
      <!-- <div>{{ finalMatches }}</div> -->
      <div class="schema"
        v-if="finalMatches.length === 2 && finalMatches[0].teamL && finalMatches[0].teamR && finalMatches[1].teamL && finalMatches[1].teamR">
        <div>
          <h3 class="text-xl font-semibold">Finale</h3>
          <MatchTable matchType="finale" :matches="[finalMatches[0]]"
            :teams="[finalMatches[0].teamL, finalMatches[0].teamR]"
            @update-result="(i, a, b) => updateFinalResult(i, a, b)" />
        </div>

        <div>
          <h3 class="text-lg font-semibold">Om 3e plaats</h3>
          <MatchTable matchType="3ePlaats" :matches="[finalMatches[1]]"
            :teams="[finalMatches[1].teamL, finalMatches[1].teamR]"
            @update-result="(i, a, b) => updateFinalResult(i + 1, a, b)" />
        </div>
      </div>

    </div>
    <!--  minder dan 7 teams -->
    <div v-else class="schema">
      <h2 class="text-xl font-bold">Schema</h2>
      <div v-for="(ronde, index) in matches" :key="index">
        <h3>Ronde: {{ (index + 1) }}</h3>
        <MatchTable :matches="matches[index]" :teams="teams"
          @update-result="(i, a, b) => updateSingleResult(index, i, a, b)" />
      </div>
      <div class="stand">
        <h2 class="text-xl font-bold text-left">Stand</h2>
        <GroupStandings group="" :teams="teams" :matches="matches" />
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
  },
  groepsToernooi: {
    type: Boolean,
    default: false
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

function getRandomScore(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
}


function splitIntoGroups(teamList) {
  const shuffled = shuffle([...teamList]);
  const half = Math.ceil(shuffled.length / 2);
  return [shuffled.slice(0, half), shuffled.slice(half)];
}

function generateMatches(tms, grp) {
//  // console.log("grp:", grp)
  const inputTeams = [...tms]
  if (inputTeams.length % 2 !== 0) {
    inputTeams.push('VRIJ')

  }
  const schedule = [];
  const totalRounds = inputTeams.length - 1;
  const halfSize = inputTeams.length / 2;
  const baseRounds = [];
//  //  console.log(inputTeams)
  for (let round = 0; round < totalRounds; round++) {
//    //  console.log("Ronde: ", round)
    const matches = []
    for (let i = 0; i < halfSize; i++) {
      let teamL = inputTeams[i];
      let teamR = inputTeams[inputTeams.length - 1 - i];
      if (teamL==="VRIJ") {
        teamL = teamR
        teamR = "VRIJ"
      }
      let sc1 =
        matches.push({ tafel: i + 1 + (2*grp), teamL, teamR, scoreL: null, scoreR: null });
    }
    baseRounds.push(matches)
    inputTeams.splice(1, 0, inputTeams.pop());
  }
//  //  console.log("baseRounds", baseRounds)
  const fullSchedule = [];

//  //  console.log("repeatRounds:", repeatRounds)

  for (let i = 0; i < repeatRounds.value; i++) {
    const roundCopy = JSON.parse(JSON.stringify(baseRounds));
//    //  console.log("roundCopy", roundCopy)

    fullSchedule.push(...roundCopy);
//    //  console.log("fullSchedule", fullSchedule)

  }
  schedule.value = fullSchedule
//  //  console.log("Schedule:", schedule.value)
  return schedule.value;
}

function updateGroupResult(groupIndex, matchIndex, tableIndex, scoreL, scoreR) {
//  //  console.log("index:", groupIndex, matchIndex, tableIndex, scoreL, scoreR)
  groupMatches.value[groupIndex][matchIndex][tableIndex].scoreL = scoreL;
  groupMatches.value[groupIndex][matchIndex][tableIndex].scoreR = scoreR;
//  //  console.log("groupMatches.value:",groupMatches.value[0][0][0])
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

  // veel van wat hier staat is niet nodig, maar toch maar laten staan voor het geval dat we ooit nog eens een andere manier van berekenen willen gebruiken
  const table = teamsList.map((name) => ({
    name,
    points: 0,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
  }));
  for (const round of matchesList) {
    for (const match of round) {
      if ((match.scoreL === null && match.scoreR === null)) {
        continue;
      }
      const teamL = table.find((t) => t.name === match.teamL);
      const teamR = table.find((t) => t.name === match.teamR);
      if (!teamL || !teamR) continue;

      teamL.goalsFor += match.scoreL;
      teamL.goalsAgainst += match.scoreR;
      teamR.goalsFor += match.scoreR;
      teamR.goalsAgainst += match.scoreL;
//      // console.log("TeamR:", teamR.name)
      if (match.scoreL > 0 || match.scoreR > 0) {
        teamL.played += 1
        teamR.played += 1
      }

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

//      //  console.log("match:", match)
    }

  }
  table.sort((a, b) => {
    return b.goalsFor - a.goalsFor; // Sort by goals for first
  });
//  // console.log(table)
  return table;
}

function updateFinalists() {
  // Alleen bij 2 groepen
  if (groups.value.length !== 2) return;
  let ttlPlayed = 0

  const standingsA = calculateStandings(groups.value[0], groupMatches.value[0]);
  const standingsB = calculateStandings(groups.value[1], groupMatches.value[1]);
  // console.log("standingsA:", standingsA)
  // console.log("standingsB:", standingsB)
//  // console.log("groupmatches",groupMatches.value[1][0])
  groupMatches.value[1].forEach((match, index)=>{
    // beetsje een trucje oom het aantl gepeelde wedstrijden te tellen
    if (match[0].teamR === "VRIJ") ttlPlayed +=2
    if (match[1].teamR === "VRIJ") ttlPlayed +=2
    // ook de 'VRIJ" rondes moeten meetellen
  })
  standingsA.forEach((team, index) => {
    ttlPlayed += team.played
  })
  standingsB.forEach((match, index) => {
    ttlPlayed += match.played
  })
  // Controleer of er al uitslagen zijn (minimaal 1 wedstrijd per groep gespeeld)
  if (
    ttlPlayed < 24 ||
    standingsA.length === 0 ||
    standingsB.length === 0 ||
    standingsA.every((t) => t.points === 0 && t.wins === 0 && t.draws === 0) ||
    standingsB.every((t) => t.points === 0 && t.wins === 0 && t.draws === 0)
  ) {
    finalMatches.value[0].teamL = ''
    finalMatches.value[0].teamR = ''
//    // console.log("Geen finale tonen")
    return; // nog geen finale omdat er geen uitslagen zijn
  }

  finalMatches.value[0].teamL = standingsA[0].name; // winnaar groep A
  finalMatches.value[0].teamR = standingsB[0].name; // winnaar groep B

  finalMatches.value[1].teamL = standingsA[1].name; // tweede groep A
  finalMatches.value[1].teamR = standingsB[1].name; // tweede groep B
  saveToLocalStorage()
}

function saveToLocalStorage() {
  localStorage.setItem("tournamentGroups", JSON.stringify(groups.value));
//  //  console.log("Opgeslagen: Groepen:" , groups.value)
//  //  console.log("Opgeslagen: groupMatches.value", groupMatches.value)
  localStorage.setItem("tournamentGroupMatches", JSON.stringify(groupMatches.value));
//  //  console.log("Opgeslagen: groupMatches.value", groupMatches.value)
  localStorage.setItem("tournamentMatches", JSON.stringify(matches.value));
//  //  console.log("Opgeslagen: matches.value", matches.value)
  localStorage.setItem("tournamentFinalMatches", JSON.stringify(finalMatches.value));
//  //  console.log("Opgeslagen: finalMatches.value", finalMatches.value)
//  // console.log(totalMatchesPlayed())
}

function totalMatchesPlayed() {
  let ttlPlayed = 0
  teams.value.forEach((tm, index) => {
//    //  console.log("team:",tm)
    ttlPlayed += tm.played
  })

  return ttlPlayed
}

function loadFromLocalStorage() {

  const g = localStorage.getItem("tournamentGroups");
  const gm = localStorage.getItem("tournamentGroupMatches");
  const m = localStorage.getItem("tournamentMatches");
  const fm = localStorage.getItem("tournamentFinalMatches");
  if (g && gm) {
//    // console.log("Opgehaald: groepen:", g.length, gm.length)
    groups.value = JSON.parse(g);
//    // console.log("Opgehaald: groepen:", groups.value)
    groupMatches.value = JSON.parse(gm);
//    // console.log("Opgehaald: groupMatches:", groupMatches.value)
  } else if (m) {
//    // console.log("Opgehaald: matches:", matches.value)
    matches.value = JSON.parse(m);
  }
  if (fm) {finalMatches
    finalMatches.value = JSON.parse(fm);
//    // console.log("finales:", finalMatches.value)
  }
}

// function reset() {
//   localStorage.clear();
//   emit("reset");
// }

onMounted(() => {
  if (props.groepsToernooi) {
    groups.value = splitIntoGroups(teams.value);
//    // console.log("groep.value", groups.value)
    groupMatches.value = groups.value.map((group, index) => generateMatches(group, index));
  } else{
    matches.value = generateMatches(teams.value,0);
//    //  console.log("matches:" ,  matches.value)
  }
  loadFromLocalStorage();
//  //  console.log("matches:" ,  matches.value)
  updateFinalists();
});
</script>
