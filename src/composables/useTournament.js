// src/composables/useTournament.js
import { ref } from 'vue'
import dbService from '../services/dbservices.js'
import { useToast } from 'vue-toastification'

export function useTournament() {
  const toernooien = ref([])
  const thisToernooi = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const toast = useToast()

  // Laad alle toernooien
  async function loadToernooien() {
    loading.value = true
    error.value = null
    try {
      toernooien.value = await dbService.fetchToernooien()
    } catch (e) {
      error.value = e
      toast.error('Fout bij het laden van toernooien')
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  // Haal één toernooi op op basis van id
  async function loadToernooi(id) {
    loading.value = true
    error.value = null
    try {
      thisToernooi.value = await dbService.fetchToernooi(id)
    } catch (e) {
      error.value = e
      toast.error(`Fout bij het laden van toernooi ${id}`)
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  // Sla een nieuw toernooi op
  async function saveToernooi(toernooiData) {
    loading.value = true
    error.value = null
    try {
      const saved = await dbService.saveToernooi(toernooiData)
      toast.success('Toernooi succesvol opgeslagen')
      return saved
    } catch (e) {
      error.value = e
      toast.error('Fout bij het opslaan van toernooi')
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  // Update een bestaand toernooi
  async function updateToernooi(id, toernooiData) {
    loading.value = true
    error.value = null
    try {
      const updated = await dbService.updateToernooi(id, toernooiData)
      toast.success('Toernooi succesvol bijgewerkt')
      return updated
    } catch (e) {
      error.value = e
      toast.error('Fout bij het bijwerken van toernooi')
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  // Verwijder een toernooi
  async function deleteToernooi(id) {
    loading.value = true
    error.value = null
    try {
      await dbService.deleteToernooi(id)
      toast.success('Toernooi succesvol verwijderd')
    } catch (e) {
      error.value = e
      toast.error('Fout bij het verwijderen van toernooi')
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    toernooien,
    thisToernooi,
    loading,
    error,
    loadToernooien,
    loadToernooi,
    saveToernooi,
    updateToernooi,
    deleteToernooi,
  }
}
