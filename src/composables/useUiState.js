import { computed } from 'vue'

export function useUiState(state) {
  const { scoresEntered, editMode, showRanking } = state

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
