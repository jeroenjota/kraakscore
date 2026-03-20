/**
 * useConfirm – global confirmation dialog composable.
 * Provides a promise-based confirm() function that opens a ConfirmDialog
 * and resolves to true (OK) or false (Cancel).
 *
 * Usage:
 *   1. Register the dialog ref once via registerConfirmDialog(ref)
 *   2. Call confirm({ title, message, type }) anywhere in the app
 */
import { ref, getCurrentInstance, nextTick } from 'vue'

// Singleton ref holding the ConfirmDialog component instance
const dialogRef = ref(null)

// Registreer de ConfirmDialog-component
export function registerConfirmDialog(refInstance) {
  dialogRef.value = refInstance
}

// Globale confirm-functie
export function useConfirm() {
  /**
   * Open the confirm dialog and return the user's choice.
   * @param {object} options - { title, message, type } passed to ConfirmDialog.open()
   * @returns {Promise<boolean>} true if confirmed, false if cancelled
   */
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
