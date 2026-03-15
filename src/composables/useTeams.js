import { computed } from 'vue'
import { cleanTeamName } from '../utils/editUtils.js'

export function useTeams(state) {
  const { toernooiTeams, savedTeams, newTeam, repeatRounds, tournamentStarted } = state

  const filteredTeams = computed(() =>
    toernooiTeams.value.map((t) => t.trim()).filter((t) => t)
  )

  const availableTeams = computed(() => {
    if (toernooiTeams.value.length === 0) return savedTeams.value
    const selectedSpelers = new Set()
    toernooiTeams.value.forEach((team) => {
      const s = team.split('/')
      s.forEach((speler) => selectedSpelers.add(speler.trim()))
    })
    return savedTeams.value.filter((team) => {
      const teamleden = team.split('/').map((t) => t.trim())
      return !teamleden.some((player) => selectedSpelers.has(player))
    })
  })

  const teamSelected = (tm) => toernooiTeams.value.indexOf(tm) > -1

  function addTeam(team) {
    newTeam.value = team
    if (newTeam.value.trim()) {
      newTeam.value = cleanTeamName(newTeam.value)
      if (toernooiTeams.value.length >= 8) {
        alert('Maximaal 8 teams toegestaan!')
        newTeam.value = ''
        return
      }
      if (toernooiTeams.value.length >= 6) {
        repeatRounds.value = 1
      }
      toernooiTeams.value.push(newTeam.value.trim())
      newTeam.value = ''
    }
  }

  function editTeam(i) {
    if (!tournamentStarted.value) {
      newTeam.value = toernooiTeams.value[i]
      toernooiTeams.value.splice(i, 1)
    }
  }

  function removeTeam(i) {
    if (!tournamentStarted.value) {
      toernooiTeams.value.splice(i, 1)
    }
  }

  function removeTeamsFromToernooi() {
    toernooiTeams.value = []
  }

  function getTeam(tm) {
    tm = cleanTeamName(tm)
    const idx = toernooiTeams.value.indexOf(tm)
    if (idx < 0) {
      if (toernooiTeams.value.length < 8) {
        toernooiTeams.value.push(tm)
      }
    } else {
      toernooiTeams.value.splice(idx, 1)
    }
  }

  return {
    filteredTeams,
    availableTeams,
    teamSelected,
    addTeam,
    editTeam,
    removeTeam,
    removeTeamsFromToernooi,
    getTeam,
  }
}
