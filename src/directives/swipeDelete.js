export default {
  mounted(el, binding) {
    let touchStartX = 0;
    let touchStartY = 0;

    el.addEventListener('touchstart', (e) => {
      const touch = e.changedTouches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    });

    el.addEventListener('touchend', (e) => {
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;

      // Detecteer swipe naar links
      if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 30 && deltaX < 0) {
        binding.value(); // Roep de functie aan die je in de directive meegeeft
      }
    });
  }
};