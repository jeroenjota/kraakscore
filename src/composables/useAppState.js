import { ref } from 'vue'

export function useAppState() {
  const scoresEntered = ref(false)
  const showRanking = ref(false)
  const rankingData = ref([])
  const filteredRanking = ref([])
  const serverAvailable = ref(false)
  const toernooiSaved = ref(false)
  const groepsToernooi = ref(false)
  const thisToernooiID = ref(null)
  const thisToernooiDatum = ref(new Date())
  const currentSemester = ref('')
  const toernooien = ref([])
  const spelers = ref([])
  const filteredToernooien = ref([])
  const selectToernooi = ref('Toernooien')
  const newTeam = ref('')
  const toernooiTeams = ref([])
  const savedTeams = ref([])
  const editMode = ref(false)
  const tournamentStarted = ref(false)
  const repeatRounds = ref(1)
  const pdfUrl = ref(null)
  const vanaf = ref(new Date().toISOString().split('T')[0])
  const tot = ref(new Date().toISOString().split('T')[0])

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
