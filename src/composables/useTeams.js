/**
 * useTeams – team management composable.
 * Handles adding, editing, removing, and toggling teams for the current
 * tournament. Enforces the 8-team maximum and filters out players already
 * assigned to a team from the available-teams list.
 */
import { computed } from 'vue'
import { cleanTeamName } from '../utils/editUtils.js'

export function useTeams(state) {
  const { toernooiTeams, savedTeams, newTeam, repeatRounds, tournamentStarted } = state

  // Active tournament teams (trimmed, non-empty)
  const filteredTeams = computed(() =>
    toernooiTeams.value.map((t) => t.trim()).filter((t) => t)
  )

  // Saved teams whose players are not yet assigned to the current tournament
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

  // Check if a team is already part of the tournament
  const teamSelected = (tm) => toernooiTeams.value.indexOf(tm) > -1

  // Add a new team (max 8); auto-sets repeatRounds to 1 when 6+ teams
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

  // Move a team back to the input field for editing (only before tournament starts)
  function editTeam(i) {
    if (!tournamentStarted.value) {
      newTeam.value = toernooiTeams.value[i]
      toernooiTeams.value.splice(i, 1)
    }
  }

  // Remove a team by index (only before tournament starts)
  function removeTeam(i) {
    if (!tournamentStarted.value) {
      toernooiTeams.value.splice(i, 1)
    }
  }

  // Clear all teams from the current tournament
  function removeTeamsFromToernooi() {
    toernooiTeams.value = []
  }

  // Toggle a team: add if not present, remove if already selected (max 8)
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
