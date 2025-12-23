<template>
  <div id="tournament">
    <div v-if="groups.length === 2">
      <div class="schema">
        <div v-for="(ronde, index) in groupMatches[0]" :key="index">
          <div v-if="index < 1">
            <h2 class="text-xl font-bold text-blue">Groep A</h2>
          </div>
          <div v-else>
            <h3>Ronde: {{ index + 1 }}</h3>
          </div>
          <MatchTable
            :matches="groupMatches[0][index]"
            :teams="groups[0]"
            :oldToernooi="toernooiPlayed"
            :edit-mode="editMode"
            @update-result="
              (i, a, b) => updateGroupResult(0, index, i, a, b)
            " />
        </div>
      </div>
      <div class="schema">
        <div v-for="(ronde, index) in groupMatches[1]" :key="index">
          <div v-if="index < 1">
            <h2 class="text-xl font-bold text-blue">Groep B</h2>
          </div>
          <div v-else>
            <h3>Ronde: {{ index + 1 }}</h3>
          </div>
          <!-- {{ groupMatches[1] }} -->
          <MatchTable
            :matches="groupMatches[1][index]"
            :teams="groups[1]"
            :oldToernooi="toernooiPlayed"
            :edit-mode="editMode"
            @update-result="
              (i, a, b) => updateGroupResult(1, index, i, a, b)
            " />
        </div>
      </div>
      <div class="stand">
        <!-- <h2 class="text-xl font-semibold">Stand</h2> -->
        <div class="flex justify-center gap-2">
          <div class="">
            <GroupStandings
              group="A"
              :teams="groups[0]"
              :matches="groupMatches[0]" />
          </div>
          <div class="">
            <GroupStandings
              group="B"
              :teams="groups[1]"
              :matches="groupMatches[1]" />
          </div>
        </div>
      </div>
      <!-- <div>{{ finalMatches }}</div> -->
      <div
        class="finale"
        v-if="
          finalMatches.length >= 2
        ">
        <h3 class="text-xl font-semibold">Finales</h3>
          <!-- <p>Match: {{ finalMatches[1] }}</p> -->
        <div v-for="match, index in finalMatches" :key="index">
          <MatchTable
            :matchType="matchTypes[index]"
            :matches="[match]"
            :teams="[match.teamL, match.teamR]"
            :oldToernooi="toernooiPlayed"
            :edit-mode="editMode"
            @update-result="(i, a, b) => updateFinalResult(index, a, b)" />
        </div>

      </div>
    </div>
    <!--  geen groepen -->
    <div v-else class="schema">
      <h2 class="text-xl font-bold">Schema</h2>
      <div v-for="(ronde, index) in matches" :key="index">
        <h3>Ronde: {{ index + 1 }}</h3>
        <MatchTable
          :matches="matches[index]"
          :teams="toernooiTeams"
          :oldToernooi="toernooiPlayed"
          :edit-mode="editMode"
          @update-result="(i, a, b) => updateSingleResult(index, i, a, b)" />
      </div>
      <div class="stand">
        <h2 class="text-xl font-bold text-left">Stand</h2>
        <GroupStandings group="" :teams="toernooiTeams" :matches="matches" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import MatchTable from "./MatchTable.vue";
import GroupStandings from "./GroupStandings.vue";

const matchTypes = ['finale', '3e plaats', '5e plaats', '7e plaats'];


const props = defineProps({
  initialTeams: {
    type: Array,
    required: true,
  },
  repeatRounds: {
    type: Number,
    default: 1,
  },
  groepsToernooi: {
    type: Boolean,
    default: false,
  },
  toernooiPlayed: {
    type: Boolean,
    default: false,
  },
  editMode: {
    type: Boolean,
  },
});

const emit = defineEmits(["saveToernooi"]);

const toernooiTeams = ref([...props.initialTeams]);
const matches = ref([]);
const repeatRounds = ref(props.repeatRounds);
const groups = ref([]);
const groupMatches = ref([]);
const finalMatches = ref([
  { tafel: 1, teamL: null, teamR: null, scoreL: null, scoreR: null, pl: 1 }, // finale
  { tafel: 2, teamL: null, teamR: null, scoreL: null, scoreR: null, pl: 3 }, // 3e plaats
  { tafel: 3, teamL: null, teamR: null, scoreL: null, scoreR: null, pl: 5 }, // 5e plaats
  { tafel: 4, teamL: null, teamR: null, scoreL: null, scoreR: null, pl: 7 }, // 7e plaats
]);

// console.log("Edit mode in Tournament:", props.editMode);

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function splitIntoGroups(teamList) {
  // Voor meer dan 6 toernooiTeams, worden de teams verdeeld in twee groepen
  // Toernooi van 14 juli 2025
  // Chris/Ramon, Gerard/Willem, Tijmen/Karlijn, Joost/Wim
  // Carla/Theo, Jan/Angelo, Ron/Jeroen, Joren/Lize

  // if (confirm("Wil je zelf de teams in groepen verdelen?")) {
  // const groupA = prompt("Voer de teams voor Groep A in, gescheiden door een komma:", teamList.slice(0, Math.ceil(teamList.length / 2)).join(","));
  // const groupB = prompt("Voer de teams voor Groep B in, gescheiden door een komma:", teamList.slice(Math.ceil(teamList.length / 2)).join(","));
  // console.log("Group A:", groupA);
  // console.log("Group B:", groupB);
  // return [groupA.split(',').map(t => t.trim()), groupB.split(',').map(t => t.trim())];

  // }
  const shuffled = shuffle([...teamList]);
  const half = Math.ceil(shuffled.length / 2);
  return [shuffled.slice(0, half), shuffled.slice(half)];
}

function generateMatches(tms, grp) {
  // console.log("grp:", grp)
  const inputTeams = [...tms];
  if (inputTeams.length % 2 !== 0) {
    inputTeams.push("VRIJ");
  }
  const schedule = [];
  const totalRounds = inputTeams.length - 1;
  const halfSize = inputTeams.length / 2;
  const baseRounds = [];
  // console.log(inputTeams)
  for (let round = 0; round < totalRounds; round++) {
    // console.log("Ronde: ", round)
    const matches = [];
    for (let i = 0; i < halfSize; i++) {
      let teamL = inputTeams[i];
      let teamR = inputTeams[inputTeams.length - 1 - i];
      if (teamL === "VRIJ") {
        teamL = teamR;
        teamR = "VRIJ";
      }
      let sc1 = matches.push({
        tafel: i + 1 + 2 * grp,
        teamL,
        teamR,
        scoreL: 0,
        scoreR: 0,
      });
    }
    baseRounds.push(matches);
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
  // console.log("fullSchedule:", fullSchedule)
  schedule.value = fullSchedule;

  // console.log("Schedule:", schedule.value)
  return schedule.value;
}

function updateGroupResult(groupIndex, matchIndex, tableIndex, scoreL, scoreR) {
  // console.log("index:", groupIndex, matchIndex, tableIndex, scoreL, scoreR)
  groupMatches.value[groupIndex][matchIndex][tableIndex].scoreL = scoreL;
  groupMatches.value[groupIndex][matchIndex][tableIndex].scoreR = scoreR;
  // console.log("groupMatches.value:",groupMatches.value[0][0][0])
  localStorage.setItem(
    "tournamentGroupMatches",
    JSON.stringify(groupMatches.value)
  );
  // console.log("Score updated")
  window.dispatchEvent(new Event("storage"));
  // console.log("Opgeslagen: groupMatches.value", groupMatches.value)
  saveToLocalStorage();
  updateFinalists();
}

function updateSingleResult(ronde, table, scoreL, scoreR) {
  // console.log("updateSingleResult", ronde, table, scoreL, scoreR)
  matches.value[ronde][table].scoreL = scoreL;
  matches.value[ronde][table].scoreR = scoreR;
  localStorage.setItem("tournamentMatches", JSON.stringify(matches.value));

  // console.log("Score updated")

  window.dispatchEvent(new Event("storage"));
}

function updateFinalResult(index, scoreL, scoreR) {

  finalMatches.value[index].scoreL = scoreL;
  finalMatches.value[index].scoreR = scoreR;
  // console.log("finalMatches.value:", finalMatches.value);
  saveToLocalStorage();
}

function calculateStandings(teamsList, matchesList) {
  const table = teamsList.map((name) => ({
    name,
    played: 0,
    matchPoints: 0,
  }));

  for (const round of matchesList) {
    for (const match of round) {
      if (match.scoreL === null && match.scoreR === null) {
        continue;
      }
      const teamL = table.find((t) => t.name === match.teamL);
      const teamR = table.find((t) => t.name === match.teamR);
      if (!teamL || !teamR) continue;

      teamL.matchPoints += match.scoreL;
      teamR.matchPoints += match.scoreR;
      // console.log("TeamR:", teamR)
      if (match.scoreL > 0 || match.scoreR > 0) {
        teamL.played += 1;
        teamR.played += 1;
      }

      // console.log("match:", match)
    }
  }
  table.sort((a, b) => {
    return b.matchPoints - a.matchPoints; // Sort by goals for first
  });
  // console.log(table)
  return table;
}

function updateFinalists() {
  // Alleen bij 2 groepen
  if (groups.value.length !== 2) return;
  let ttlPlayed = 0;

  const standingsA = calculateStandings(groups.value[0], groupMatches.value[0]);
  const standingsB = calculateStandings(groups.value[1], groupMatches.value[1]);
  // console.log("standingsA:", standingsA)
  // console.log("standingsB:", standingsB)
  // console.log("groupmatches",groupMatches.value[1][0])
  groupMatches.value[1].forEach((match, index) => {
    // beetsje een trucje oom het aantl gepeelde wedstrijden te tellen
    if (match[0].teamR === "VRIJ") ttlPlayed += 2;
    if (match[1].teamR === "VRIJ") ttlPlayed += 2;
    // ook de 'VRIJ" rondes moeten meetellen
  });
  standingsA.forEach((team, index) => {
    ttlPlayed += team.played;
  });
  standingsB.forEach((match, index) => {
    ttlPlayed += match.played;
  });
  // Controleer of er al uitslagen zijn (minimaal 1 wedstrijd per groep gespeeld)
  if (ttlPlayed < 24 || standingsA.length === 0 || standingsB.length === 0) {
    finalMatches.value[0].teamL = "";
    finalMatches.value[0].teamR = "";
    // console.log("Geen finale tonen")
    return; // nog geen finale omdat er geen uitslagen zijn
  }

  finalMatches.value[0].teamL = standingsA[0].name; // winnaar groep A
  finalMatches.value[0].teamR = standingsB[0].name; // winnaar groep B

  finalMatches.value[1].teamL = standingsA[1].name; // tweede groep A
  finalMatches.value[1].teamR = standingsB[1].name; // tweede groep B

  // console.log("finalMatches.value", finalMatches.value);
  finalMatches.value[2].teamL = standingsA[2].name; // 3e groep A
  finalMatches.value[2].teamR = standingsB[2].name; // 3e groep B

  finalMatches.value[3].teamL = standingsA[3].name; // 4e groep A
  finalMatches.value[3].teamR = standingsB[3].name; // 4e groep B

  saveToLocalStorage();
}

function saveToLocalStorage() {
  // console.log("Opslaan in localStorage")
  // console.log("toernooiTeams.value:", toernooiTeams.value)
  localStorage.setItem("tournamentTeams", JSON.stringify(toernooiTeams.value));
  localStorage.setItem(
    "tournamentGroupMatches",
    JSON.stringify(groupMatches.value)
  );
  localStorage.setItem("tournamentMatches", JSON.stringify(matches.value));
  localStorage.setItem(
    "tournamentGroups",
    JSON.stringify(groups.value)
  );
  // console.log("Opgeslagen: Groepen:" , groups.value)
  // console.log("Opgeslagen: groupMatches.value", groupMatches.value)
  localStorage.setItem(
    "tournamentFinalMatches",
    JSON.stringify(finalMatches.value)
  );
  // database bijwerken
  emit("saveToernooi");

}

function totalMatchesPlayed() {
  let ttlPlayed = 0;
  toernooiTeams.value.forEach((tm, index) => {
    // console.log("team:",tm)
    ttlPlayed += tm.played;
  });

  return ttlPlayed;
}

function loadFromLocalStorage() {
  const t = localStorage.getItem("tournamentTeams");
  if (t) {
    // // console.log("Opgehaald: toernooiTeams:", t)
    toernooiTeams.value = JSON.parse(t);
    // // console.log("Opgehaald: toernooiTeams:", toernooiTeams.value)
  }
  const g = localStorage.getItem("tournamentGroups");
  const gm = localStorage.getItem("tournamentGroupMatches");
  const m = localStorage.getItem("tournamentMatches");
  const fm = localStorage.getItem("tournamentFinalMatches");
  if (g && gm) {
    // // console.log("Opgehaald: groepen:", g)
    // console.log("Opgehaald: groepen:", g.length, gm.length)
    groups.value = JSON.parse(g);
    // console.log("Opgehaald: groepen:", groups.value)
    groupMatches.value = JSON.parse(gm);
    // console.log("Opgehaald: groupMatches:", groupMatches.value)
  } else if (m) {
    matches.value = JSON.parse(m);
    // console.log("Opgehaald: matches:", matches.value)
  }
  if (fm) {
    // console.log("Opgehaald: finalMatches:", fm.length);
    // finalMatches;
    finalMatches.value = JSON.parse(fm);

    if (finalMatches.value.length < 4) {
      // in geval van een oud toernooi met minder finalematches
      while (finalMatches.value.length < 4) {
        finalMatches.value.push({
          teamL: null,
          teamR: null,
          scoreL: null,
          scoreR: null,
        });
      }
    }
    finalMatches.value.forEach((match, index) => {
      match.tafel = index + 1;
      match.pl = index * 2 + 1;
    });
    // console.log("Opgehaald: finalMatches:", finalMatches.value);
  }
}

// function reset() {
// localStorage.clear();
// emit("reset");
// }

onMounted(() => {
  if (!props.toernooiPlayed) {
    localStorage.clear();
    if (props.groepsToernooi) {
      groups.value = splitIntoGroups(toernooiTeams.value);
      // console.log("groep.value", groups.value)
      groupMatches.value = groups.value.map((group, index) =>
        generateMatches(group, index)
      );
      // localStorage.setItem("tournamentGroupMatches", JSON.stringify(groupMatches.value));
      // console.log("Score updated")
      window.dispatchEvent(new Event("storage"));
      // console.log("groupMatches.value", groupMatches.value)
    } else {
      matches.value = generateMatches(toernooiTeams.value, 0);
      // console.log("matches:", matches.value)
      // localStorage.setItem("tournamentMatches", JSON.stringify(matches.value));
      window.dispatchEvent(new Event("storage"));
    }
    saveToLocalStorage();
  } else {
    // console.log("Laad toernooi uit localStorage");
    loadFromLocalStorage();
    // console.log("matches:" ,  matches.value)
    updateFinalists();
  }
});
</script>
