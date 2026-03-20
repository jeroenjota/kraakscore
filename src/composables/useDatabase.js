/**
 * useDatabase – database connectivity composable.
 * Provides functions to check server availability, fetch tournament lists,
 * retrieve all player names, and perform database maintenance (clean up
 * orphaned teams and players).
 */
import dbService from '../services/dbServices.js'
import { useToast } from 'vue-toastification'
import { useToastMessage } from './useToastMessage'

export function useDatabase(state, { getSavedTeamsFromApi }) {
  const toast = useToast()
  const { toastHTML } = useToastMessage()
  const { serverAvailable, spelers, toernooien, selectToernooi } = state

  // Ping the backend to check connectivity
  async function isServerActive() {
    const response = await dbService.checkServer()
    serverAvailable.value = response.success
  }

  // Fetch all tournaments from the server and reset the dropdown
  async function getSavedToernooien() {
    const response = await dbService.fetchToernooien()
    toernooien.value = response.data
    selectToernooi.value = 'Toernooien'
  }

  // Fetch all player names from the server
  async function getAllSpelers() {
    const response = await dbService.fetchAllPlayers()
    spelers.value = response.data.map((speler) => speler.naam)
  }

  // Remove orphaned teams (no tournaments) and players (no teams) after user confirmation
  async function cleanDatabase(bevestig) {
    try {
      const ok = await bevestig(
        'Opschonen database',
        'Weet je zeker dat je teams zonder toernooi en spelers zonder team wilt verwijderen?',
        'warning',
      )
      if (ok) {
        const response = await dbService.cleanTeamsAndPlayers()
        const data = response.data
        let msg = ''
        if (data.success) {
          if (data.aantal > 0) {
            if (data.items.teams && data.items.teams.length > 0) {
              const teamList = data.items.teams.map((item) => `<li>${item}</li>`).join('')
              msg += `<h2><strong>Verwijderde teams:</strong></h2><ol>${teamList}</ol>`
            }
            if (data.items.spelers && data.items.spelers.length > 0) {
              const spelersList = data.items.spelers.map((item) => `<li>${item}</li>`).join('')
              msg += `<h2><strong>Verwijderde spelers:</strong></h2><ol>${spelersList}</ol>`
            }
          } else {
            msg = 'Geen items verwijderd'
          }
          toastHTML('info', msg, { position: 'top-center', timeout: 8000 })
          await getSavedTeamsFromApi()
        }
      }
    } catch (error) {
      console.error('Fout bij het opschonen van de database:', error)
      toast.error('Fout bij het opschonen van de database: ' + error.message, {
        position: 'top-center',
        timeout: 5000,
      })
    }
  }

  return {
    isServerActive,
    getSavedToernooien,
    getAllSpelers,
    cleanDatabase,
  }
}
