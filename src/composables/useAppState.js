import { ref } from 'vue'

/**
 * Central application state composable.
 * Provides shared reactive state for tournament management, rankings, and UI control.
 */
export function useAppState() {
  // Ranking & scoring
  const scoresEntered = ref(false) // true when scores have been entered in the current tournament
  const showRanking = ref(false) // toggles the ranking view (hides team setup when true)
  const rankingData = ref([]) // raw player ranking data fetched from the server
  const filteredRanking = ref([]) // rankings filtered by the vanaf/tot date range

  // Server & tournament status
  const serverAvailable = ref(false) // whether the backend API is reachable
  const toernooiSaved = ref(false) // true after the current tournament is saved to the database
  const groepsToernooi = ref(false) // group-based tournament mode (affects scheduling)

  // Tournament identification
  const thisToernooiID = ref(null) // database ID of the active tournament
  const thisToernooiDatum = ref(new Date()) // date of the current tournament
  const currentSemester = ref('') // semester string, e.g. "2026-1"

  // Tournament & player data
  const toernooien = ref([]) // all tournaments from the database
  const spelers = ref([]) // all available player names
  const filteredToernooien = ref([]) // tournaments filtered by current semester
  const selectToernooi = ref('Toernooien') // currently selected tournament in the dropdown

  // Team management
  const newTeam = ref('') // input value for adding a new team
  const toernooiTeams = ref([]) // teams in the current tournament (max 8)
  const savedTeams = ref([]) // previously used team names (persisted in localStorage)

  // UI & flow control
  const editMode = ref(false) // true when editing an existing tournament
  const tournamentStarted = ref(false) // true once the tournament is in progress (locks team changes)
  const repeatRounds = ref(1) // number of scheduling rounds to repeat

  // PDF & date filters
  const pdfUrl = ref(null) // generated PDF filename for tournament results
  const vanaf = ref(new Date().toISOString().split('T')[0]) // start date for ranking/tournament filter
  const tot = ref(new Date().toISOString().split('T')[0]) // end date for ranking/tournament filter

  return {
    scoresEntered,
    showRanking,
    rankingData,
    filteredRanking,
    serverAvailable,
    toernooiSaved,
    groepsToernooi,
    thisToernooiID,
    thisToernooiDatum,
    currentSemester,
    toernooien,
    spelers,
    filteredToernooien,
    selectToernooi,
    newTeam,
    toernooiTeams,
    savedTeams,
    editMode,
    tournamentStarted,
    repeatRounds,
    pdfUrl,
    vanaf,
    tot,
  }
}
