import dbService from '../services/dbServices.js'
import { useToast } from 'vue-toastification'

export function useTournamentFlow(state, deps) {
  const toast = useToast()
  const {
    scoresEntered, tournamentStarted, editMode, thisToernooiID,
    toernooiTeams, newTeam, selectToernooi, thisToernooiDatum,
    groepsToernooi, repeatRounds,
  } = state

  const {
    bevestig, filteredTeams, addTeamsToList, getSavedTeamsFromApi,
    getSavedToernooien, getRanking, filterRankingByPeriod,
    setActiveSemester, maakPdf,
  } = deps

  function allMatchesPlayed() {
    const gm = localStorage.getItem('tournamentGroupMatches')
    const m = localStorage.getItem('tournamentMatches')
    if (!m && !gm) return false
    const isScoreEntered = (score) => score !== null && score !== undefined && score !== ''
    if (gm) {
      const groupMatches = JSON.parse(gm)
      return groupMatches.every((group) =>
        group.every((match) =>
          match.every(
            (tafel) => isScoreEntered(tafel.scoreL) || isScoreEntered(tafel.scoreR),
          ),
        ),
      )
    }
    const matches = JSON.parse(m)
    return matches.every((round) =>
      round.every(
        (match) => isScoreEntered(match.scoreL) || isScoreEntered(match.scoreR),
      ),
    )
  }

  function resetLocalStorage(inclTeams = true) {
    if (inclTeams) {
      localStorage.removeItem('tournamentTeams')
      toernooiTeams.value = []
    }
    localStorage.removeItem('matches')
    localStorage.removeItem('tournamentGroups')
    localStorage.removeItem('tournamentGroupMatches')
    localStorage.removeItem('tournamentMatches')
    localStorage.removeItem('tournamentFinalMatches')
    localStorage.removeItem('repeatRounds')
    localStorage.removeItem('toernooiTeams')
  }

  function scoresAreEntered() {
    const hasScores =
      JSON.parse(localStorage.getItem('tournamentMatches')) ||
      JSON.parse(localStorage.getItem('tournamentGroupMatches'))
    scoresEntered.value = hasScores !== null
  }

  function resetApp() {
    selectToernooi.value = 'Toernooien'
    thisToernooiID.value = null
    thisToernooiDatum.value = new Date()
    tournamentStarted.value = false
    toernooiTeams.value = []
    newTeam.value = ''
    editMode.value = false
    resetLocalStorage(true)
    getSavedToernooien()
    getSavedTeamsFromApi()
    filterRankingByPeriod()
    setActiveSemester()
    getRanking()
    filterRankingByPeriod()
  }

  async function startTournament() {
    if (filteredTeams.value.length >= 4) {
      const nu = new Date(Date.now()).toISOString().split('T')[0]
      const response = await dbService.getToernooiIdByDate(nu)
      const tnID = response.data
      if (tnID) {
        const ok = await bevestig(
          'Toernooi bestaat al',
          'Een toernooi op deze datum bestaat al, wil je deze overschrijven?',
          'warning',
        )
        if (ok) {
          resetLocalStorage(false)
          await dbService.deleteToernooi(tnID)
          thisToernooiID.value = null
          selectToernooi.value = 'Toernooien'
        } else {
          const { selectTournament } = deps
          await selectTournament(tnID)
          return
        }
      }
      addTeamsToList()
      groepsToernooi.value = false
      if (filteredTeams.value.length >= 7) {
        groepsToernooi.value = await bevestig(
          'Groepstoernooi',
          'Er zijn meer dan 6 teams, wil je twee groepen aanmaken?',
          'question',
        )
      }
      if (groepsToernooi.value) repeatRounds.value = 1
      const rndTxt = repeatRounds.value > 1 ? 'rondes' : 'ronde'
      let msg = `Het schema wordt gemaakt voor ${repeatRounds.value} ${rndTxt} \nmet ${filteredTeams.value.length} teams`
      if (groepsToernooi.value) msg += ', verdeeld over twee groepen'
      msg += '\n\nIs dit de bedoeling?'
      const ok = await bevestig('Toernooi starten', msg, 'question')
      if (!ok) return
      thisToernooiDatum.value = null
      tournamentStarted.value = true
      editMode.value = true
      localStorage.setItem('tournamentTeams', JSON.stringify(toernooiTeams.value))
      toast.info('Toernooi is begonnen, je kunt hier de scores invoeren.', {
        position: 'top-center',
        timeout: 8000,
      })
    } else {
      alert('Voer minimaal 4 teams in voor een toernooi.')
    }
  }

  async function sluitToernooi() {
    if (tournamentStarted.value && scoresEntered.value && editMode.value) {
      if (!thisToernooiID.value) {
        if (scoresEntered.value && !allMatchesPlayed()) {
          const ok = await bevestig(
            'Niet alle wedstrijden gespeeld',
            'Niet alle wedstrijden zijn gespeeld. Weet je zeker dat je het toernooi wilt opslaan?',
            'warning',
          )
          if (!ok) return
        }
        await deps.saveTournament()
        await getSavedToernooien()
        await maakPdf()
        resetApp()
      } else {
        if (editMode.value) {
          await deps.saveTournamentChanges('Toernooi opgeslagen.')
          await getRanking()
          await maakPdf()
        }
        resetApp()
      }
      editMode.value = false
      thisToernooiID.value = null
      resetApp()
    } else {
      resetApp()
    }
  }

  return {
    allMatchesPlayed,
    resetLocalStorage,
    scoresAreEntered,
    resetApp,
    startTournament,
    sluitToernooi,
  }
}
