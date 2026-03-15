// Helper to mount App.vue for testing
import { mount } from '@vue/test-utils'
import { vi } from 'vitest'
import App from '../App.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import dbService from '../services/dbServices.js'

// Make dbService available for mocking in tests
export { dbService }

export async function mountApp(overrides = {}) {
  // Reset localStorage mock to empty state
  const store = {}
  const getItemMock = vi.fn((key) => store[key] ?? null)
  const setItemMock = vi.fn((key, value) => {
    store[key] = String(value)
  })
  const removeItemMock = vi.fn((key) => {
    delete store[key]
  })
  const clearMock = vi.fn(() => {
    Object.keys(store).forEach(k => delete store[k])
  })

  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: getItemMock,
      setItem: setItemMock,
      removeItem: removeItemMock,
      clear: clearMock,
      _getStore: () => store,
      _setStore: (newStore) => Object.assign(store, newStore),
    },
    writable: true,
  })

  // Mock window.resize for zoom functionality
  vi.spyOn(window, 'addEventListener')
  vi.spyOn(window, 'removeEventListener')

  const wrapper = mount(App, {
    global: {
      stubs: {
        ConfirmDialog,
        Ranking: { template: '<div data-testid="ranking-component"><slot /></div>' },
        Tournament: { template: '<div data-testid="tournament-component" />' },
        SelectPlayers: { template: '<div data-testid="select-players-component" />' },
        Qrcode: { template: '<div data-testid="qrcode-component" />' },
      },
      provide: {
        // Provide any global injections here
      },
    },
    ...overrides,
  })

  return {
    wrapper,
    store,
    getItemMock,
    setItemMock,
    removeItemMock,
  }
}

/**
 * Quick shallow mount without child component rendering
 * Use this when you only need to test App's own logic and don't need child components
 */
export async function mountAppShallow(overrides = {}) {
  vi.spyOn(window, 'addEventListener')
  vi.spyOn(window, 'removeEventListener')

  const wrapper = mount(App, {
    global: {
      stubs: {
        ConfirmDialog: true,
        Ranking: true,
        Tournament: true,
        SelectPlayers: true,
        Qrcode: true,
        PrinterIcon: true,
        TrashIcon: true,
        PencilSquareIcon: true,
        InboxIcon: true,
      },
    },
    ...overrides,
  })

  return { wrapper }
}