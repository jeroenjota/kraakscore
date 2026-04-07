import { ref, computed } from 'vue'

export function useZoom() {
  const windowWidth = ref(window.innerWidth)
  const windowHeight = ref(window.innerHeight)
  const scale = ref(1)

  const winScale = (width) => {
    if (width >= 1200) return 1
    if (width >= 1000) return 0.9
    if (width >= 800) return 0.8
    return 0.7
  }

  const zoomStyle = computed(() => ({
    transform: `scale(${scale.value})`,
    transformOrigin: 'top left',
    width: `${100 / scale.value}%`,
    height: `${100 / scale.value}%`,
  }))

  const updateScale = () => {
    windowWidth.value = window.innerWidth
    windowHeight.value = window.innerHeight
    scale.value = winScale(windowWidth.value)
  }

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