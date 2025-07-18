export function useSwipeToDelete(callback) {
  const touchStartPos = ref({ x: 0, y: 0 });

  function onTouchStart(event) {
    const touch = event.changedTouches[0];
    touchStartPos.value = { x: touch.clientX, y: touch.clientY };
  }

  function onTouchEnd(event, itemIndex) {
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartPos.value.x;
    const deltaY = touch.clientY - touchStartPos.value.y;

    if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 30 && deltaX < 0) {
      callback(itemIndex);
    }
  }

  return {
    onTouchStart,
    onTouchEnd
  };
}
