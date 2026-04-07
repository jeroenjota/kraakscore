import dbService from '../services/dbServices.js'
import { useToast } from 'vue-toastification'
import { cleanTeamName } from '../utils/editUtils.js'

export function useSavedTeams(state, { bevestig }) {
  const toast = useToast()
  const { serverAvailable, savedTeams, toernooiTeams } = state

  async function getSavedTeamsFromApi() {
    if (!serverAvailable.value) return
    await dbService
      .fetchSavedTeams()
      .then((response) => {
        const teamLijst = response.data.sort()
        savedTeams.value = []
        teamLijst.forEach((tm) => {
          const thisTeam = cleanTeamName(tm.team)
          if (!savedTeams.value.includes(thisTeam)) {
            savedTeams.value.push(thisTeam)
          }
        })
        localStorage.setItem('savedTeams', JSON.stringify(savedTeams.value.sort()))
      })
      .catch((error) => {
        console.error('Fout bij het ophalen van teams:', error)
        toast.error('Fout bij het ophalen van teams: ' + error.message, {
          position: 'bottom-center',
          timeout: 2000,
        })
      })
  }

  async function standardTeamsToApi(msg) {
    const bewaardeTeams = savedTeams.value.map((team) => {
      const sp = team.split('/')
      return { players: sp }
    })
    const sendTeams = { teams: bewaardeTeams }
    await dbService
      .saveStandardTeams(sendTeams)
      .then(() => {
        if (msg) toast.success(msg, { position: 'top-center', timeout: 3000 })
      })
      .catch((error) => {
        toast.error('Fout bij het opslaan van standaard teams: ' + error.message, {
          position: 'top-center',
          timeout: 3000,
        })
      })
  }

  function addTeamsToList() {
    let teamsSaved = false
    if (!toernooiTeams.value.every((tm) => savedTeams.value.includes(tm))) {
      toernooiTeams.value.forEach((tm) => {
        if (!savedTeams.value.includes(tm)) {
          savedTeams.value.push(tm)
          teamsSaved = true
        }
      })
      savedTeams.value.sort()
      localStorage.setItem('savedTeams', JSON.stringify(savedTeams.value))
      if (teamsSaved) {
        standardTeamsToApi('Nieuwe teams zijn opgeslagen')
      }
    }
  }

  async function removeStandardTeam(tm) {
    const idx = savedTeams.value.indexOf(tm)
    const idx2 = toernooiTeams.value.indexOf(tm)
    if (idx > -1 && idx2 < 0) {
      const ok = await bevestig(
        'Team verwijderen',
        `${tm} definitief verwijderen uit standaardlijst?`,
        'warning',
      )
      if (ok) {
        savedTeams.value.splice(idx, 1)
        localStorage.setItem('savedTeams', JSON.stringify(savedTeams.value))
        await standardTeamsToApi('Team verwijderd uit standaardlijst: ' + tm)
      }
    }
  }

  return {
    getSavedTeamsFromApi,
    standardTeamsToApi,
    addTeamsToList,
    removeStandardTeam,
  }
}
