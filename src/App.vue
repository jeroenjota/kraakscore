<template>
  <ConfirmDialog ref="dialog" />
  <div
    class="maindiv app-scaled mx-auto max-w-4xl space-y-4 rounded"
    :style="zoomStyle"
    data-testid="app-root">
    <AppHeader
      :serverAvailable="serverAvailable"
      :thisToernooiID="thisToernooiID"
      :tournamentStarted="tournamentStarted"
      :showRanking="showRanking"
      :editMode="editMode"
      :selectToernooi="selectToernooi"
      :currentSemester="currentSemester"
      :filteredToernooien="filteredToernooien"
      :getSemesters="getSemesters"
      :thisToernooiDatum="thisToernooiDatum"
      :sluitKnop="sluitKnop"
      :scoresEntered="scoresEntered"
      :pdfUrl="pdfUrl"
      @toggleZoom="toggleZoom"
      @toggleRanking="toggleShowRanking"
      @setPeriode="setPeriode"
      @handleSelectTournament="handleSelectTournament"
      @toggleEditMode="toggleEditMode"
      @saveTournamentChanges="saveTournamentChanges"
      @removeTournament="removeTournament"
      @closeTournament="sluitToernooi"
      @makePdf="maakPdf" />

    <div class="toprow" v-if="!tournamentStarted" data-testid="toprow">
      <div v-if="showRanking" class="ranking" data-testid="ranking-section">
        <Ranking
          :ranking="filteredRanking"
          :toernooien="filteredToernooien"
          :vanaf="vanaf"
          :tot="tot" />
      </div>

      <TeamSetup
        v-if="!showRanking"
        :spelers="spelers"
        :toernooiTeams="toernooiTeams"
        :repeatRounds="repeatRounds"
        :showRanking="showRanking"
        @addTeam="addTeam"
        @editTeam="editTeam"
        @removeTeam="removeTeam"
        @removeTeamsFromToernooi="removeTeamsFromToernooi" />

      <SavedTeamsList
        :savedTeams="savedTeams"
        :availableTeams="availableTeams"
        :toernooiTeams="toernooiTeams"
        :tournamentStarted="tournamentStarted"
        :showRanking="showRanking"
        :teamSelected="teamSelected"
        @addAll="addAll"
        @removeAllStandardTeams="removeAllStandardTeams"
        @getTeam="getTeam"
        @removeStandardTeam="removeStandardTeam"
        @cleanDatabase="cleanDatabase"
        @startTournament="startTournament" />
    </div>

    <Tournament
      v-if="tournamentStarted"
      data-testid="tournament-component"
      :initialTeams="filteredTeams"
      :repeatRounds="repeatRounds"
      :edit-mode="editMode"
      :groepsToernooi="groepsToernooi"
      :toernooiPlayed="thisToernooiID !== null"
      @saveToernooi="saveTournament" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import Ranking from './components/Ranking.vue'
import Tournament from './components/Tournament.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'
import AppHeader from './components/AppHeader.vue'
import TeamSetup from './components/TeamSetup.vue'
import SavedTeamsList from './components/SavedTeamsList.vue'

import { useToastMessage } from './composables/useToastMessage'
import { registerConfirmDialog } from './composables/useConfirm'

import { useAppState } from './composables/useAppState'
import { useZoom } from './composables/useZoom'
import { useUiState } from './composables/useUiState'
import { useRanking } from './composables/useRanking'
import { useSemester } from './composables/useSemester'
import { useTeams } from './composables/useTeams'
import { useSavedTeams } from './composables/useSavedTeams'
import { useDatabase } from './composables/useDatabase'
import { usePdf } from './composables/usePdf'
import { useTournamentData } from './composables/useTournamentData'
import { useTournamentFlow } from './composables/useTournamentFlow'

const { toastHTML } = useToastMessage()
const dialog = ref(null)

async function bevestig(kop, vraag, type) {
  await nextTick()
  if (!dialog.value) {
    console.error('ConfirmDialog component is not available.')
    return false
  }
  return await dialog.value.open({
    title: kop,
    message: vraag,
    confirmButtonText: 'Ja',
    cancelButtonText: 'Nee',
    icon: type || null,
  })
}

const state = useAppState()
const {
  scoresEntered, showRanking, filteredRanking, serverAvailable,
  groepsToernooi, thisToernooiID, thisToernooiDatum, currentSemester,
  spelers, filteredToernooien, selectToernooi, toernooiTeams,
  savedTeams, editMode, tournamentStarted, repeatRounds, pdfUrl,
  vanaf, tot,
} = state

const { zoomStyle, updateScale, toggleZoom } = useZoom()
const { sluitKnop, toggleShowRanking, toggleEditMode } = useUiState(state)
const { getRanking, filterRankingByPeriod } = useRanking(state)
const { filterToernooien, setPeriode, getSemesters, setActiveSemester } = useSemester(state, { filterRankingByPeriod })
const { filteredTeams, availableTeams, teamSelected, addTeam, editTeam, removeTeam, removeTeamsFromToernooi, getTeam } = useTeams(state)
const { getSavedTeamsFromApi, addTeamsToList, removeStandardTeam } = useSavedTeams(state, { bevestig })
const { isServerActive, getSavedToernooien, getAllSpelers, cleanDatabase: cleanDatabaseFn } = useDatabase(state, { getSavedTeamsFromApi })
const { maakPdf } = usePdf(state, { bevestig, filterToernooien, filterRankingByPeriod })

const flowDeps = {
  bevestig, filteredTeams, addTeamsToList, getSavedTeamsFromApi,
  getSavedToernooien, getRanking, filterRankingByPeriod,
  setActiveSemester, maakPdf,
  saveTournament: null,
  saveTournamentChanges: null,
  selectTournament: null,
}

const { resetApp, resetLocalStorage, scoresAreEntered, startTournament, sluitToernooi } = useTournamentFlow(state, flowDeps)

const { handleSelectTournament, saveTournamentChanges, saveTournament, removeTournament, selectTournament } = useTournamentData(state, {
  bevestig, getRanking, filterRankingByPeriod, resetApp,
  setActiveSemester, setPeriode,
})

flowDeps.saveTournament = saveTournament
flowDeps.saveTournamentChanges = saveTournamentChanges
flowDeps.selectTournament = selectTournament

function addAll() {}
function removeAllStandardTeams() {}

function cleanDatabase() {
  cleanDatabaseFn(bevestig)
}

watch(filteredTeams, (newTeams) => {
  localStorage.setItem('tournamentTeams', JSON.stringify(newTeams))
})

onMounted(async () => {
  updateScale()
  window.addEventListener('resize', updateScale)
  registerConfirmDialog(dialog.value)
  await isServerActive()
  setActiveSemester()
  window.addEventListener('storage', scoresAreEntered)
  if (serverAvailable.value) {
    toastHTML('info', '<strong>KRAKEN</strong><p><strong>Welkom bij Jota\'s Kraak Score</strong></p><p>Gegevens zijn opgehaald van de server</p>', { position: 'top-center', timeout: 3000 })
    state.toernooiSaved.value = false
    resetLocalStorage()
    await getSavedTeamsFromApi()
    await getSavedToernooien()
    await getAllSpelers()
    await getRanking()
    filterToernooien()
    filterRankingByPeriod()
  } else {
    const saved = localStorage.getItem('savedTeams')
    if (saved) {
      savedTeams.value = JSON.parse(saved)
    }
  }
})
</script>

<script>
import longpress from './directives/longpress.js'
export default {
  directives: {
    longpress,
  },
}
</script>

<style scoped></style>
