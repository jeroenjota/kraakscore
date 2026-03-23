<!--
  SavedTeamsList.vue – Persistent teams sidebar.
  Lists all saved teams. Click to toggle a team into the tournament;
  Ctrl+click or long-press to remove it from the standard list.
  Also shows the "Start toernooi" and "Teams opschonen" buttons.
-->
<template>
  <div
    id="savedTeams"
    class="rounded bg-sky-200 p-1 text-sm"
    v-if="!tournamentStarted && !showRanking"
    data-testid="saved-teams-section">
    <h2
      @click.exact="$emit('addAll')"
      @click.ctrl="$emit('removeAllStandardTeams')"
      class="text-center text-lg text-blue-700">
      Bestaande teams
    </h2>
    <ul
      class="dbl"
      v-tooltip="{ content: 'Selecteer een opgeslagen team', html: true }">
      <li v-for="(tm, index) in savedTeams" :key="index">
        <p
          @click.exact="$emit('getTeam', tm)"
          @click.ctrl="$emit('removeStandardTeam', tm)"
          v-longpress="() => $emit('removeStandardTeam', tm)"
          :class="{
            teamSelected: isTeamSelected(tm),
            teamDisabled: !isTeamSelected(tm) && !availableTeams.includes(tm),
          }">
          <span v-if="isTeamSelected(tm)">✔</span> {{ tm }}
        </p>
      </li>
    </ul>
    <p class="text-xs">click: Meedoen, ctrl/long+click=Wissen</p>
    <button
      v-if="toernooiTeams.length === 0"
      class="border-t-black bg-sky-300 px-1 py-1 text-blue-800"
      @click="$emit('cleanDatabase')"
      v-tooltip="{
        content:
          'Verwijder teams die geen toernooi hebben gespeeld<br/>en spelers die niet in een team zitten ',
        html: true,
      }"
      data-testid="clean-database-button">
      Teams opschonen
    </button>
    <button
      v-if="toernooiTeams.length > 3"
      @click="$emit('startTournament')"
      class="rounded bg-green-800 px-2 py-2 text-white"
      style="margin-right: 2px; width: 200px"
      :disabled="tournamentStarted"
      v-tooltip="{
        content:
          'Maak het toernooischema <br/>Bij 8 teams worden willekeurig twee groepen aangemaakt',
        html: true,
      }"
      data-testid="start-button">
      Start toernooi
    </button>
  </div>
</template>

<script setup>
import { computed } from "vue";
import longpress from "../directives/longpress.js";

const props = defineProps({
  savedTeams: Array,
  availableTeams: Array,
  toernooiTeams: Array,
  tournamentStarted: Boolean,
  showRanking: Boolean,
  teamSelected: Function,
});

const isTeamSelected = (tm) => props.toernooiTeams.includes(tm);

defineEmits([
  "addAll",
  "removeAllStandardTeams",
  "getTeam",
  "removeStandardTeam",
  "cleanDatabase",
  "startTournament",
  "teamSelected",
]);
</script>
