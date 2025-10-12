import { useToast } from 'vue-toastification'
import { h } from 'vue'

export function useToastMessage() {
  const toast = useToast()

  /**
   * Toon een toast met HTML-inhoud
   * @param {'success'|'error'|'info'|'warning'} type
   * @param {string} html - HTML string
   * @param {object} options - extra instellingen
   */
  function toastHTML(type, html, options = {}) {
    // Maak een renderbare VNode met innerHTML
    const vnode = {
      render() {
        return h('div', { innerHTML: html })
      },
    }

    toast[type](vnode, {
      ...options,
      timeout: 3000,
      position: 'top-center',
    })
  }

  return { toastHTML }
}
