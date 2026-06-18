<template>
  <div id="tournament">
    <div v-if="showOnlineScoreSection">
      <TournamentSettings
        v-if="showOnlineScoreControls"
        v-model:scoreTarget="scoreTarget"
        v-model:winnerKruis="winnerKruis"
        v-model:onlineScoreEnabled="onlineScoreEnabled"
        class="ml-1 mr-1" />

      <ScoreFormsPanel
        v-if="showOnlineScoreControls && onlineScoreEnabled"
        :submitMode="remoteScoreVisibilityMode"
        :tournamentId="tournamentId"
        :tournamentDate="tournamentDate"
        :scoreTarget="scoreTarget"
        :winnerKruis="winnerKruis"
        :groups="groups"
        :matches="matches"
        :groupMatches="groupMatches"
        :finalMatches="finalMatches"
        @update:submitMode="(value) => (remoteScoreVisibilityMode = value)"
        class="m-1" />
    </div>

    <div v-if="groups.length === 2">
      <div class="schema">
        <div v-for="(ronde, index) in groupMatches[0]" :key="index">
          <div v-if="index < 1">
            <h2 class="text-blue text-xl font-bold">Groep A</h2>
          </div>
          <div v-else>
            <h3>Ronde: {{ index + 1 }}</h3>
          </div>
          <MatchTable
            :matches="groupMatches[0][index]"
            :teams="groups[0]"
            :tournamentId="tournamentId"
            :tournamentDate="tournamentDate"
            :round="index + 1"
            group="A"
            :oldToernooi="toernooiPlayed"
            :edit-mode="!standOnly && editMode"
            @update-result="
              (i, a, b) => updateGroupResult(0, index, i, a, b)
            " />
        </div>
      </div>
      <div class="schema">
        <div v-for="(ronde, index) in groupMatches[1]" :key="index">
          <div v-if="index < 1">
            <h2 class="text-blue text-xl font-bold">Groep B</h2>
          </div>
          <div v-else>
            <h3>Ronde: {{ index + 1 }}</h3>
          </div>
          <!-- {{ groupMatches[1] }} -->
          <MatchTable
            :matches="groupMatches[1][index]"
            :teams="groups[1]"
            :tournamentId="tournamentId"
            :tournamentDate="tournamentDate"
            :round="index + 1"
            group="B"
            :oldToernooi="toernooiPlayed"
            :edit-mode="!standOnly && editMode"
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
      <div class="finale" v-if="finalMatches.length >= 2">
        <h3 class="text-xl font-semibold">Finales</h3>
        <!-- <p>Match: {{ finalMatches[1] }}</p> -->
        <div v-for="(match, index) in finalMatches" :key="index">
          <MatchTable
            :matchType="matchTypes[index]"
            :matches="[match]"
            :teams="[match.teamL, match.teamR]"
            :tournamentId="tournamentId"
            :tournamentDate="tournamentDate"
            :round="'finales'"
            group="finales"
            :oldToernooi="toernooiPlayed"
            :edit-mode="!standOnly && editMode"
            @update-result="(i, a, b) => updateFinalResult(index, a, b)" />
        </div>
      </div>
    </div>
    <!--  geen groepen -->
    <div v-else class="schema">
      <div class="mb-0 flex items-center justify-between">
        <h2 class="text-xl font-bold" @click.ctrl="showOnlineScoreSection = !showOnlineScoreSection">Schema
        </h2>
        <div
          class="mb-0 flex justify-end px-2 py-1"
          v-if="!standOnly && editMode">
          <button
            class="mr-2 rounded bg-sky-600 px-3 py-1 text-sm text-white disabled:cursor-not-allowed disabled:bg-sky-200"
            :disabled="!canRedoScore"
            @click="redoLastScoreChange"
            v-tooltip="'Herstel de laatst ongedaan gemaakte scorewijziging'">
            Redo score
          </button>
          <button
            class="rounded bg-orange-500 px-3 py-1 text-sm text-white disabled:cursor-not-allowed disabled:bg-orange-200"
            :disabled="!canUndoScore"
            @click="undoLastScoreChange"
            v-tooltip="'Maak de laatste scorewijziging ongedaan'">
            Undo score
          </button>
        </div>
      </div>
      <div v-for="(ronde, index) in matches" :key="index">
        <h3>Ronde: {{ index + 1 }}</h3>
        <MatchTable
          :matches="matches[index]"
          :teams="toernooiTeams"
          :tournamentId="tournamentId"
          :tournamentDate="tournamentDate"
          :round="index + 1"
          group="single"
          :oldToernooi="toernooiPlayed"
          :edit-mode="!standOnly && editMode"
          @update-result="(i, a, b) => updateSingleResult(index, i, a, b)" />
      </div>
      <div class="stand">
        <h2 class="text-left text-xl font-bold">Stand</h2>
        <GroupStandings group="" :teams="toernooiTeams" :matches="matches" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import MatchTable from "./MatchTable.vue";
import GroupStandings from "./GroupStandings.vue";
import ScoreFormsPanel from "./ScoreFormsPanel.vue";
import TournamentSettings from "./TournamentSettings.vue";
import dbService from "../services/dbServices.js";
import { resolveApiBaseUrl } from "../services/apiConfig.js";
import { hasAnyScore, toNumericScore } from "../utils/matchState.js";

const matchTypes = ["finale", "3e plaats", "5e plaats", "7e plaats"];

const props = defineProps({
  initialTeams: {
    type: Array,
    required: true,
  },
  tournamentId: {
    type: [Number, String],
    default: null,
  },
  tournamentDate: {
    type: [Date, String],
    default: null,
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
  standOnly: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["saveToernooi"]);

const toernooiTeams = ref([...props.initialTeams]);
const matches = ref([]);
const repeatRounds = ref(props.repeatRounds);
const groups = ref([]);
const groupMatches = ref([]);
const scoreUndoStack = ref([]);
const scoreRedoStack = ref([]);
const isApplyingUndo = ref(false);
const remoteScoreVisibilityMode = ref("immediate");
const onlineScoreEnabled = ref(false);
const showOnlineScoreSection = ref(false);
const processedRemoteSubmissions = new Set();
let remoteScoreEventSource = null;
let remoteScorePollTimer = null;
let remoteScoreSyncInFlight = false;
let lastForegroundSyncAt = 0;
const REMOTE_SCORE_POLL_INTERVAL_MS = 5000;
const FOREGROUND_SYNC_THROTTLE_MS = 1500;
const scoreTarget = ref(2000);
const winnerKruis = ref(4);
const finalMatches = ref([
  { tafel: 1, teamL: null, teamR: null, scoreL: null, scoreR: null, pl: 1 }, // finale
  { tafel: 2, teamL: null, teamR: null, scoreL: null, scoreR: null, pl: 3 }, // 3e plaats
  { tafel: 3, teamL: null, teamR: null, scoreL: null, scoreR: null, pl: 5 }, // 5e plaats
  { tafel: 4, teamL: null, teamR: null, scoreL: null, scoreR: null, pl: 7 }, // 7e plaats
]);

const isPastTournament = computed(() => {
  if (!props.tournamentDate) return false;

  const date = new Date(props.tournamentDate);
  if (Number.isNaN(date.getTime())) return false;

  const tournamentDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  return tournamentDay < todayStart;
});

const showOnlineScoreControls = computed(
  () => !props.standOnly && !isPastTournament.value,
);

const shouldRunRemoteScoreSync = computed(() => Boolean(props.tournamentId));

// console.log("Edit mode in Tournament:", props.editMode);

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function splitIntoGroups(teamList) {
  // Voor meer dan 6 toernooiTeams, worden de teams verdeeld in twee groepen
  // Toernooi van 14 juli 2025
  // Chris/Ramon, Gerard/Willem, Tijmen/Karlijn, Joost/Wim
  // Carla/Theo, Jan/Angelo, Ron/Jeroen, Joren/Lize

  //   if (confirm("Wil je zelf de teams in groepen verdelen?")) {
  //     const groupA = prompt(
  //       "Voer de teams voor Groep A in, gescheiden door een komma:",
  //       teamList.slice(0, Math.ceil(teamList.length / 2)).join(","),
  //     );
  //     const groupB = prompt(
  //       "Voer de teams voor Groep B in, gescheiden door een komma:",
  //       teamList.slice(Math.ceil(teamList.length / 2)).join(","),
  //     );
  // // console.log("Group A:", groupA)
  // // console.log("Group B:", groupB)
  //     return [
  //       groupA.split(",").map((t) => t.trim()),
  //       groupB.split(",").map((t) => t.trim()),
  //     ];
  //   }
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
  const current = groupMatches.value[groupIndex][matchIndex][tableIndex];
  const oldScoreL = Number(current.scoreL ?? 0);
  const oldScoreR = Number(current.scoreR ?? 0);
  const newScoreL = Number(scoreL);
  const newScoreR = Number(scoreR);

  if (oldScoreL === newScoreL && oldScoreR === newScoreR) return;

  pushScoreUndo({
    type: "group",
    groupIndex,
    matchIndex,
    tableIndex,
    oldScoreL,
    oldScoreR,
    newScoreL,
    newScoreR,
  });

  current.scoreL = newScoreL;
  current.scoreR = newScoreR;
  // console.log("groupMatches.value:",groupMatches.value[0][0][0])
  localStorage.setItem(
    "tournamentGroupMatches",
    JSON.stringify(groupMatches.value),
  );
  // console.log("Score updated")
  window.dispatchEvent(new Event("storage"));
  // console.log("Opgeslagen: groupMatches.value", groupMatches.value)
  saveToLocalStorage();
  updateFinalists();
}

function updateSingleResult(ronde, table, scoreL, scoreR) {
  // console.log("updateSingleResult", ronde, table, scoreL, scoreR)
  const current = matches.value[ronde][table];
  const oldScoreL = Number(current.scoreL ?? 0);
  const oldScoreR = Number(current.scoreR ?? 0);
  const newScoreL = Number(scoreL);
  const newScoreR = Number(scoreR);

  if (oldScoreL === newScoreL && oldScoreR === newScoreR) return;

  pushScoreUndo({
    type: "single",
    ronde,
    table,
    oldScoreL,
    oldScoreR,
    newScoreL,
    newScoreR,
  });

  current.scoreL = newScoreL;
  current.scoreR = newScoreR;
  localStorage.setItem("tournamentMatches", JSON.stringify(matches.value));

  // console.log("Score updated")

  window.dispatchEvent(new Event("storage"));
}

function updateFinalResult(index, scoreL, scoreR) {
  const current = finalMatches.value[index];
  const oldScoreL = Number(current.scoreL ?? 0);
  const oldScoreR = Number(current.scoreR ?? 0);
  const newScoreL = Number(scoreL);
  const newScoreR = Number(scoreR);

  if (oldScoreL === newScoreL && oldScoreR === newScoreR) return;

  pushScoreUndo({
    type: "final",
    index,
    oldScoreL,
    oldScoreR,
    newScoreL,
    newScoreR,
  });

  current.scoreL = newScoreL;
  current.scoreR = newScoreR;
  // console.log("finalMatches.value:", finalMatches.value);
  saveToLocalStorage();
}

const canUndoScore = computed(() => scoreUndoStack.value.length > 0);
const canRedoScore = computed(() => scoreRedoStack.value.length > 0);

function pushScoreUndo(entry) {
  if (isApplyingUndo.value) return;
  scoreUndoStack.value.push(entry);
  scoreRedoStack.value = [];
  if (scoreUndoStack.value.length > 250) {
    scoreUndoStack.value.shift();
  }
}

function applyScoreChange(change, useOldScores) {
  const scoreL = useOldScores ? change.oldScoreL : change.newScoreL;
  const scoreR = useOldScores ? change.oldScoreR : change.newScoreR;

  if (change.type === "single") {
    matches.value[change.ronde][change.table].scoreL = scoreL;
    matches.value[change.ronde][change.table].scoreR = scoreR;
    localStorage.setItem("tournamentMatches", JSON.stringify(matches.value));
    window.dispatchEvent(new Event("storage"));
    return;
  }

  if (change.type === "group") {
    groupMatches.value[change.groupIndex][change.matchIndex][
      change.tableIndex
    ].scoreL = scoreL;
    groupMatches.value[change.groupIndex][change.matchIndex][
      change.tableIndex
    ].scoreR = scoreR;
    localStorage.setItem(
      "tournamentGroupMatches",
      JSON.stringify(groupMatches.value),
    );
    window.dispatchEvent(new Event("storage"));
    saveToLocalStorage();
    updateFinalists();
    return;
  }

  if (change.type === "final") {
    finalMatches.value[change.index].scoreL = scoreL;
    finalMatches.value[change.index].scoreR = scoreR;
    saveToLocalStorage();
  }
}

function undoLastScoreChange() {
  const lastChange = scoreUndoStack.value.pop();
  if (!lastChange) return;

  isApplyingUndo.value = true;
  applyScoreChange(lastChange, true);
  scoreRedoStack.value.push(lastChange);
  if (scoreRedoStack.value.length > 250) {
    scoreRedoStack.value.shift();
  }
  isApplyingUndo.value = false;
}

function redoLastScoreChange() {
  const lastUndoneChange = scoreRedoStack.value.pop();
  if (!lastUndoneChange) return;

  isApplyingUndo.value = true;
  applyScoreChange(lastUndoneChange, false);
  scoreUndoStack.value.push(lastUndoneChange);
  if (scoreUndoStack.value.length > 250) {
    scoreUndoStack.value.shift();
  }
  isApplyingUndo.value = false;
}

function calculateStandings(teamsList, matchesList) {
  const table = teamsList.map((name) => ({
    name,
    played: 0,
    matchPoints: 0,
  }));

  for (const round of matchesList) {
    for (const match of round) {
      if (!hasAnyScore(match)) {
        continue;
      }

      const scoreL = toNumericScore(match?.scoreL);
      const scoreR = toNumericScore(match?.scoreR);

      const teamL = table.find((t) => t.name === match.teamL);
      const teamR = table.find((t) => t.name === match.teamR);
      if (!teamL || !teamR) continue;

      teamL.matchPoints += scoreL;
      teamR.matchPoints += scoreR;
      // console.log("TeamR:", teamR)
      teamL.played += 1;
      teamR.played += 1;

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
    JSON.stringify(groupMatches.value),
  );
  localStorage.setItem("tournamentMatches", JSON.stringify(matches.value));
  localStorage.setItem("tournamentGroups", JSON.stringify(groups.value));
  // console.log("Opgeslagen: Groepen:" , groups.value)
  // console.log("Opgeslagen: groupMatches.value", groupMatches.value)
  localStorage.setItem(
    "tournamentFinalMatches",
    JSON.stringify(finalMatches.value),
  );
  // database bijwerken
  emit("saveToernooi");
}

function refreshTournamentViewState() {
  if (groups.value.length === 2) {
    groupMatches.value = groupMatches.value.map((groupRounds) =>
      groupRounds.map((roundMatches) =>
        roundMatches.map((match) => ({ ...match })),
      ),
    );
    finalMatches.value = finalMatches.value.map((match) => ({ ...match }));
    return;
  }

  matches.value = matches.value.map((roundMatches) =>
    roundMatches.map((match) => ({ ...match })),
  );
  finalMatches.value = finalMatches.value.map((match) => ({ ...match }));
}

function getRemoteSubmissionKey(entry) {
  return [
    entry.timestamp || entry.submittedAt || "",
    entry.matchType || "",
    entry.group || "",
    entry.round || "",
    entry.table || "",
    entry.matchIndex || "",
    entry.finalIndex || "",
    entry.scoreL || "",
    entry.scoreR || "",
  ].join("|");
}

function applyRemoteSubmission(entry) {
  const newScoreL = Number(entry.scoreL);
  const newScoreR = Number(entry.scoreR);
  const entryTable = Number(entry.table);
  const entryTeamL = String(entry.teamL || "").trim();
  const entryTeamR = String(entry.teamR || "").trim();

  if (!Number.isFinite(newScoreL) || !Number.isFinite(newScoreR)) {
    return false;
  }

  if (entry.matchType === "final") {
    const index = Number(entry.finalIndex ?? 0);
    const current = finalMatches.value[index];
    if (!current) return false;

    const oldScoreL = Number(current.scoreL ?? 0);
    const oldScoreR = Number(current.scoreR ?? 0);
    if (oldScoreL === newScoreL && oldScoreR === newScoreR) {
      return false;
    }

    current.scoreL = newScoreL;
    current.scoreR = newScoreR;
    current.kruisL = Number.isFinite(Number(entry.kruisL))
      ? Number(entry.kruisL)
      : null;
    current.kruisR = Number.isFinite(Number(entry.kruisR))
      ? Number(entry.kruisR)
      : null;
    current.lastTroefTeam =
      entry.lastTroefTeam || current.lastTroefTeam || null;
    return true;
  }

  if (entry.matchType === "group") {
    const groupIndex = String(entry.group || "A").toUpperCase() === "B" ? 1 : 0;
    const roundIndex = Math.max(Number(entry.round || 1) - 1, 0);
    const tableIndex = Math.max(Number(entry.matchIndex ?? 0), 0);
    const roundMatches = groupMatches.value?.[groupIndex]?.[roundIndex] || [];
    let current = roundMatches[tableIndex];

    if (!current) {
      current = roundMatches.find((match) => {
        if (!match) return false;
        const sameTable =
          Number.isFinite(entryTable) && Number(match.tafel) === entryTable;
        const sameTeams =
          entryTeamL &&
          entryTeamR &&
          String(match.teamL || "").trim() === entryTeamL &&
          String(match.teamR || "").trim() === entryTeamR;
        return sameTable || sameTeams;
      });
    }

    if (!current) return false;

    const oldScoreL = Number(current.scoreL ?? 0);
    const oldScoreR = Number(current.scoreR ?? 0);
    if (oldScoreL === newScoreL && oldScoreR === newScoreR) {
      return false;
    }

    current.scoreL = newScoreL;
    current.scoreR = newScoreR;
    current.kruisL = Number.isFinite(Number(entry.kruisL))
      ? Number(entry.kruisL)
      : null;
    current.kruisR = Number.isFinite(Number(entry.kruisR))
      ? Number(entry.kruisR)
      : null;
    current.lastTroefTeam =
      entry.lastTroefTeam || current.lastTroefTeam || null;
    updateFinalists();
    return true;
  }

  const roundIndex = Math.max(Number(entry.round || 1) - 1, 0);
  const tableIndex = Math.max(Number(entry.matchIndex ?? 0), 0);
  const roundMatches = matches.value?.[roundIndex] || [];
  let current = roundMatches[tableIndex];

  if (!current) {
    current = roundMatches.find((match) => {
      if (!match) return false;
      const sameTable =
        Number.isFinite(entryTable) && Number(match.tafel) === entryTable;
      const sameTeams =
        entryTeamL &&
        entryTeamR &&
        String(match.teamL || "").trim() === entryTeamL &&
        String(match.teamR || "").trim() === entryTeamR;
      return sameTable || sameTeams;
    });
  }

  if (!current) return false;

  const oldScoreL = Number(current.scoreL ?? 0);
  const oldScoreR = Number(current.scoreR ?? 0);
  if (oldScoreL === newScoreL && oldScoreR === newScoreR) {
    return false;
  }

  current.scoreL = newScoreL;
  current.scoreR = newScoreR;
  current.kruisL = Number.isFinite(Number(entry.kruisL))
    ? Number(entry.kruisL)
    : null;
  current.kruisR = Number.isFinite(Number(entry.kruisR))
    ? Number(entry.kruisR)
    : null;
  current.lastTroefTeam = entry.lastTroefTeam || current.lastTroefTeam || null;
  return true;
}

async function syncRemoteScoreForms(source = "auto") {
  if (!props.tournamentId) {
    return;
  }

  if (!showOnlineScoreSection.value) {
    return;
  }

  if (remoteScoreSyncInFlight) {
    return;
  }

  remoteScoreSyncInFlight = true;

  try {
    const response = await dbService.fetchScoreFormSubmissions(
      props.tournamentId,
    );
    if (!response.success) {
      return;
    }

    const submissions = Array.isArray(response.data) ? response.data : [];
    let changed = false;
    let appliedCount = 0;

    submissions.forEach((entry) => {
      const key = getRemoteSubmissionKey(entry);
      if (processedRemoteSubmissions.has(key)) {
        return;
      }

      const applied = applyRemoteSubmission(entry);
      if (!applied) {
        return;
      }

      processedRemoteSubmissions.add(key);
      changed = true;
      appliedCount += 1;
    });

    if (changed) {
      refreshTournamentViewState();
      window.dispatchEvent(new Event("storage"));
      saveToLocalStorage();
    }
  } finally {
    remoteScoreSyncInFlight = false;
  }
}

function connectRemoteScoreStream() {
  if (!props.tournamentId || typeof window === "undefined") {
    return;
  }

  const apiBaseUrl = resolveApiBaseUrl();
  const streamUrl = new URL(
    `${String(apiBaseUrl).replace(/\/$/, "")}/score-forms/stream`,
    window.location.origin,
  );
  streamUrl.searchParams.set("tournamentId", String(props.tournamentId));

  if (remoteScoreEventSource) {
    remoteScoreEventSource.close();
  }

  remoteScoreEventSource = new EventSource(streamUrl.toString());

  remoteScoreEventSource.addEventListener("score-form-submission", (event) => {
    try {
      const entry = JSON.parse(event.data);
      const key = getRemoteSubmissionKey(entry);
      if (processedRemoteSubmissions.has(key)) {
        return;
      }

      if (applyRemoteSubmission(entry)) {
        processedRemoteSubmissions.add(key);
        refreshTournamentViewState();
        window.dispatchEvent(new Event("storage"));
        saveToLocalStorage();
      }
    } catch (error) {
      console.warn(
        "Kon realtime score-update niet verwerken:",
        error?.message || error,
      );
    }
  });

  remoteScoreEventSource.addEventListener("ready", () => {
    // stream actief
  });

  remoteScoreEventSource.onerror = (error) => {
    console.warn("Realtime score stream fout:", error?.message || error);
  };
}

function disconnectRemoteScoreStream() {
  if (remoteScoreEventSource) {
    remoteScoreEventSource.close();
    remoteScoreEventSource = null;
  }
}

function startRemoteScorePolling() {
  if (
    typeof window === "undefined" ||
    remoteScorePollTimer ||
    !props.tournamentId
  ) {
    return;
  }

  const runPollLoop = async () => {
    if (!remoteScorePollTimer || !shouldRunRemoteScoreSync.value) {
      return;
    }

    try {
      await syncRemoteScoreForms("poll");
    } catch (error) {
      console.warn(
        "Periodieke score form sync mislukt:",
        error?.message || error,
      );
    }

    if (!remoteScorePollTimer || !shouldRunRemoteScoreSync.value) {
      return;
    }

    remoteScorePollTimer = window.setTimeout(
      runPollLoop,
      REMOTE_SCORE_POLL_INTERVAL_MS,
    );
  };

  remoteScorePollTimer = window.setTimeout(
    runPollLoop,
    REMOTE_SCORE_POLL_INTERVAL_MS,
  );
}

function stopRemoteScorePolling() {
  if (typeof window === "undefined" || !remoteScorePollTimer) {
    return;
  }

  window.clearTimeout(remoteScorePollTimer);
  remoteScorePollTimer = null;
}

function startRemoteScoreSync() {
  if (!shouldRunRemoteScoreSync.value) {
    return;
  }

  syncRemoteScoreForms().catch((error) => {
    console.warn("Initiële score form sync mislukt:", error?.message || error);
  });

  connectRemoteScoreStream();
  startRemoteScorePolling();
}

function stopRemoteScoreSync() {
  disconnectRemoteScoreStream();
  stopRemoteScorePolling();
}

function triggerForegroundSync() {
  if (!shouldRunRemoteScoreSync.value) {
    return;
  }

  const now = Date.now();
  if (now - lastForegroundSyncAt < FOREGROUND_SYNC_THROTTLE_MS) {
    return;
  }

  lastForegroundSyncAt = now;
  syncRemoteScoreForms().catch((error) => {
    console.warn(
      "Foreground score form sync mislukt:",
      error?.message || error,
    );
  });
}

function handleWindowFocus() {
  triggerForegroundSync();
}

function handleVisibilityChange() {
  if (
    typeof document === "undefined" ||
    document.visibilityState !== "visible"
  ) {
    return;
  }

  triggerForegroundSync();
}

function handlePageShow() {
  triggerForegroundSync();
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
    // console.log("Opgehaald: toernooiTeams:", t)
    toernooiTeams.value = JSON.parse(t);
    // console.log("Opgehaald: toernooiTeams:", toernooiTeams.value)
  }
  const g = localStorage.getItem("tournamentGroups");
  const gm = localStorage.getItem("tournamentGroupMatches");
  const m = localStorage.getItem("tournamentMatches");
  const fm = localStorage.getItem("tournamentFinalMatches");
  if (g && gm) {
    // console.log("Opgehaald: groepen JSON:", g)
    // console.log("Opgehaald: groepen:", g.length, gm.length)
    groups.value = JSON.parse(g);
    // console.log("Opgehaald: groepen parsed:", groups.value)
    // console.log("Opgehaald: gm JSON:", gm)
    groupMatches.value = JSON.parse(gm);
    // console.log("Opgehaald: groupMatches parsed:", groupMatches.value)
  } else if (m) {
    matches.value = JSON.parse(m);
    // console.log("Opgehaald: matches:", matches.value)
  }
  if (fm) {
    // console.log("Opgehaald: finalMatches:", fm.length)
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

onMounted(() => {
  const storedOnlineScoreEnabled = localStorage.getItem("onlineScoreEnabled");
  onlineScoreEnabled.value =
    storedOnlineScoreEnabled === null
      ? true
      : storedOnlineScoreEnabled === "true";

  remoteScoreVisibilityMode.value =
    localStorage.getItem("remoteScoreVisibilityMode") || "immediate";

  scoreUndoStack.value = [];
  scoreRedoStack.value = [];
  if (!props.toernooiPlayed) {
    // console.log("Nieuw toernooi, genereer schema")
    localStorage.clear();
    if (props.groepsToernooi) {
      groups.value = splitIntoGroups(toernooiTeams.value);
      // console.log("groep.value", groups.value)
      groupMatches.value = groups.value.map((group, index) =>
        generateMatches(group, index),
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
    // console.log("Laad toernooi uit localStorage")
    loadFromLocalStorage();
    // console.log("matches:" ,  matches.value)
    updateFinalists();
  }

  if (typeof window !== "undefined") {
    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("pageshow", handlePageShow);
  }

  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", handleVisibilityChange);
  }
});

onUnmounted(() => {
  stopRemoteScoreSync();

  if (typeof window !== "undefined") {
    window.removeEventListener("focus", handleWindowFocus);
    window.removeEventListener("pageshow", handlePageShow);
  }

  if (typeof document !== "undefined") {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  }
});

watch(remoteScoreVisibilityMode, (mode) => {
  localStorage.setItem(
    "remoteScoreVisibilityMode",
    mode === "final" ? "final" : "immediate",
  );
});

watch(onlineScoreEnabled, (enabled) => {
  localStorage.setItem("onlineScoreEnabled", enabled ? "true" : "false");
});

watch(
  shouldRunRemoteScoreSync,
  (enabled) => {
    stopRemoteScoreSync();

    if (!enabled) {
      return;
    }

    processedRemoteSubmissions.clear();
    startRemoteScoreSync();
  },
  { immediate: true },
);
</script>
