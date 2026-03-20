/**
 * useTournamentData – tournament CRUD composable.
 * Handles loading, saving, updating, and deleting tournaments via the API.
 * Tournament match data is stored in localStorage for real-time editing and
 * persisted to the server on save.
 */
import dbService from '../services/dbServices.js'
import { useToast } from 'vue-toastification'
import { niceDate } from '../utils/dateUtils.js'
import { getPdfUrl } from '../utils/pdfUtils.js'

export function useTournamentData(state, { bevestig, getRanking, filterRankingByPeriod, resetApp, setActiveSemester, setPeriode }) {
  const toast = useToast()
  const {
    serverAvailable, thisToernooiID, thisToernooiDatum, groepsToernooi,
    repeatRounds, toernooiSaved, pdfUrl, selectToernooi, tournamentStarted,
  } = state

  // Load a tournament by ID from the server and populate localStorage with its data
  async function loadTournament(tn) {
    const response = await dbService.fetchToernooi(tn)
    const data = response.data
    thisToernooiID.value = data.id
    repeatRounds.value = data.repeatRounds || 1
    thisToernooiDatum.value = data.datum ? new Date(data.datum) : new Date()
    groepsToernooi.value = data.groepsToernooi !== 0
    localStorage.setItem('tournamentTeams', data.teams)
    if (!groepsToernooi.value || groepsToernooi.value === 0) {
      localStorage.setItem('tournamentMatches', data.matches)
    } else {
      localStorage.setItem('tournamentGroups', data.groups)
      localStorage.setItem('tournamentGroupMatches', data.groupMatches)
      localStorage.setItem('tournamentFinalMatches', data.finalMatches)
    }
    tournamentStarted.value = true
  }

  // Select and load a tournament, setting the PDF URL and marking it as saved
  async function selectTournament(tn) {
    thisToernooiID.value = tn
    await loadTournament(tn)
    pdfUrl.value = getPdfUrl(thisToernooiDatum.value)
    toernooiSaved.value = true
  }

  // Handler for the tournament dropdown selection
  async function handleSelectTournament() {
    if (selectToernooi.value && selectToernooi.value.id) {
      await selectTournament(selectToernooi.value.id)
      setActiveSemester()
      setPeriode()
    }
  }

  // Push local match/team changes of an existing tournament to the server
  async function saveTournamentChanges(msg = 'Toernooi opgeslagen') {
    if (!selectToernooi.value || !serverAvailable.value) return
    const pdfNaam = ('Kraken ' + niceDate(thisToernooiDatum.value, true) + '.pdf')
      .replace(/\s+/g, '_')
      .toLowerCase()
    if (thisToernooiID.value) {
      await dbService.updateToernooi(thisToernooiID.value, {
        teams: localStorage.getItem('tournamentTeams'),
        matches: localStorage.getItem('tournamentMatches'),
        groups: localStorage.getItem('tournamentGroups'),
        groupMatches: localStorage.getItem('tournamentGroupMatches'),
        finalMatches: localStorage.getItem('tournamentFinalMatches'),
        groepsToernooi: groepsToernooi.value || false,
        repeatRounds: repeatRounds.value || 1,
        pdfUrl: pdfNaam || null,
      })
      if (msg) toast.success(msg, { position: 'top-center', timeout: 3000 })
      await getRanking()
      filterRankingByPeriod()
    }
  }

  // Save a tournament: update if it already has an ID, or create a new one
  async function saveTournament(msg = 'Toernooi opslaan') {
    if (!serverAvailable.value) {
      toast.warning('Server niet beschikbaar, kan toernooi niet opslaan.', {
        position: 'top-center',
        timeout: 5000,
      })
      return
    }
    const tnId = thisToernooiID.value || null
    if (tnId) {
      await saveTournamentChanges(msg)
      return
    }
    thisToernooiDatum.value = new Date().toISOString().split('T')[0]
    const tnTeams = localStorage.getItem('tournamentTeams')
    const matches = localStorage.getItem('tournamentMatches')
    const groups = localStorage.getItem('tournamentGroups')
    const groupMatches = localStorage.getItem('tournamentGroupMatches')
    const finalMatches = localStorage.getItem('tournamentFinalMatches')
    const pdfNaam = ('Kraken ' + niceDate(thisToernooiDatum.value, true) + '.pdf')
      .replace(/\s+/g, '_')
      .toLowerCase()
    const toernooi = {
      datum: thisToernooiDatum.value,
      teams: tnTeams ? JSON.parse(tnTeams) : [],
      matches: matches ? JSON.parse(matches) : [],
      groups: groups ? JSON.parse(groups) : [],
      groupMatches: groupMatches ? JSON.parse(groupMatches) : [],
      finalMatches: finalMatches ? JSON.parse(finalMatches) : [],
      groepsToernooi: groepsToernooi.value || false,
      repeatRounds: repeatRounds.value || 1,
      pdfUrl: pdfNaam || null,
    }
    try {
      const response = await dbService.saveToernooi(toernooi)
      thisToernooiID.value = response.data.id
      toernooiSaved.value = true
      if (msg) toast.success(msg, { position: 'top-center', timeout: 3000 })
    } catch (error) {
      console.error('Fout bij het opslaan van toernooi:', error)
      toast.error('Fout bij het opslaan van toernooi: ' + error.message, {
        position: 'top-center',
        timeout: 5000,
      })
    }
  }

  // Delete a tournament after triple confirmation (safety for production data)
  async function removeTournament(tn) {
    if (!serverAvailable.value) return
    let ok = await bevestig(
      'Toernooi verwijderen',
      `Weet je zeker dat je het toernooi op ${niceDate(tn.datum)} wilt verwijderen?`,
      'warning',
    )
    if (!ok) return
    ok = await bevestig('Let op', 'Doe dit alleen met test toernooien!', 'warning')
    if (!ok) return
    ok = await bevestig('Echt verwijderen?', 'WEET JE HET ECHT HEEL ZEKER?', 'error')
    if (!ok) return
    await dbService.deleteToernooi(tn.id)
    resetApp()
    toast.success(`Toernooi op ${niceDate(tn.datum)} is verwijderd.`, {
      position: 'top-center',
      timeout: 3000,
    })
  }

  return {
    loadTournament,
    selectTournament,
    handleSelectTournament,
    saveTournamentChanges,
    saveTournament,
    removeTournament,
  }
}
