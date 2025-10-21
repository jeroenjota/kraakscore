import { ref, getCurrentInstance, nextTick } from 'vue'

const dialogRef = ref(null)

// Registreer de ConfirmDialog-component
export function registerConfirmDialog(refInstance) {
  dialogRef.value = refInstance
}

// Globale confirm-functie
export function useConfirm() {
  async function confirm(options) {
    if (!dialogRef.value) {
      console.error('ConfirmDialog niet geregistreerd')
      return false
    }

    // Wacht tot de component volledig gemount is
    await nextTick()

    return dialogRef.value.open(options)
  }

  return { confirm }
}
