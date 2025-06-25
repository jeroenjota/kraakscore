export function useInputFilters() {
  function blokkeerLetters(event) {
    const key = event.key;
    const allowedKeys = ["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete", "Home", "End"];
    if (!/^\d$/.test(key) && !allowedKeys.includes(key)) {
      event.preventDefault();
    }
  }

  return { blokkeerLetters };
}
