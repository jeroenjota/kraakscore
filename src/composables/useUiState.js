/**
 * useUiState – UI toggle helpers.
 * Manages derived UI labels (save/close button text) and simple toggles
 * for the ranking view and edit mode.
 */
import { computed } from 'vue'

export function useUiState(state) {
  const { scoresEntered, editMode, showRanking } = state

  // Button label: "Opslaan" when editing with scores, otherwise "Sluiten"
  const sluitKnop = computed(() => {
    return scoresEntered.value && editMode.value ? 'Opslaan' : 'Sluiten'
  })

  const toggleShowRanking = () => {
    showRanking.value = !showRanking.value
  }

  const toggleEditMode = () => {
    editMode.value = !editMode.value
  }

  return {
    sluitKnop,
    toggleShowRanking,
    toggleEditMode,
  }
}
