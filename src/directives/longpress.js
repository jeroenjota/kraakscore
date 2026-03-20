/**
 * v-longpress – Vue custom directive for long-press detection.
 * Fires the bound handler after a 600 ms press-and-hold on mouse or touch.
 * Cancels on click release, mouse-out, touch-end, or touch-cancel.
 */
// longpress.js
export default {
  mounted(el, binding) {
    let pressTimer = null;

    const start = (e) => {
      if (e.type === 'click' && e.button !== 0) return; // Alleen linker muisklik

      if (pressTimer === null) {
        pressTimer = setTimeout(() => {
          binding.value(e); // Voer de functie uit
        }, 600); // 600ms = longpress
      }
    };

    const cancel = () => {
      if (pressTimer !== null) {
        clearTimeout(pressTimer);
        pressTimer = null;
      }
    };

    // Events
    el.addEventListener('mousedown', start);
    el.addEventListener('touchstart', start);
    el.addEventListener('click', cancel);
    el.addEventListener('mouseout', cancel);
    el.addEventListener('touchend', cancel);
    el.addEventListener('touchcancel', cancel);
  }
};