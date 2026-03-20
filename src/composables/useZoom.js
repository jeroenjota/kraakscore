/**
 * useZoom – responsive scaling composable.
 * Calculates a CSS scale factor based on the viewport width so the app
 * fits comfortably on smaller screens. Also exposes a manual toggleZoom()
 * that cycles through decreasing scale values.
 */
import { ref, computed } from 'vue'

export function useZoom() {
  const windowWidth = ref(window.innerWidth)
  const windowHeight = ref(window.innerHeight)
  const scale = ref(1)

  // Map viewport width to a scale factor (1.0 down to 0.7)
  const winScale = (width) => {
    if (width >= 1200) return 1
    if (width >= 1000) return 0.9
    if (width >= 800) return 0.8
    return 0.7
  }

  // CSS style object that applies the current scale from the top-left corner
  const zoomStyle = computed(() => ({
    transform: `scale(${scale.value})`,
    transformOrigin: 'top left',
    width: `${100 / scale.value}%`,
    height: `${100 / scale.value}%`,
  }))

  // Re-read the viewport dimensions and recalculate the scale
  const updateScale = () => {
    windowWidth.value = window.innerWidth
    windowHeight.value = window.innerHeight
    scale.value = winScale(windowWidth.value)
  }

  // Manually step down zoom by 0.1; wraps back to 1.0 when below 0.7
  const toggleZoom = () => {
    scale.value -= 0.1
    if (scale.value < 0.7) scale.value = 1
  }

  return {
    windowWidth,
    windowHeight,
    scale,
    winScale,
    zoomStyle,
    updateScale,
    toggleZoom,
  }
}