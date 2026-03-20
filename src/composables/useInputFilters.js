/**
 * useInputFilters – keyboard input filter composable.
 * Provides event handlers that restrict what can be typed into form fields.
 */
export function useInputFilters() {
  /**
   * Block non-numeric key presses on an input element.
   * Only digits and navigation keys (Backspace, Tab, arrows, etc.) are allowed.
   */
  function blokkeerLetters(event) {
    const key = event.key;
    const allowedKeys = ["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete", "Home", "End"];
    if (!/^\d$/.test(key) && !allowedKeys.includes(key)) {
      event.preventDefault();
    }
  }

  return { blokkeerLetters };
}
