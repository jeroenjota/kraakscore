// Global test setup for Vitest
import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// ── Mock import.meta.env ──
// Vitest handles import.meta.env natively; we just set defaults here
process.env.VITE_BASE_URL_API = 'http://localhost:54321'
process.env.VITE_UPLOADS_URL = '/uploads'
process.env.VITE_PUBLIC_URL = 'http://localhost:54321'

// ── Mock vue-toastification ──
const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
  clear: vi.fn(),
}

vi.mock('vue-toastification', () => ({
  useToast: () => mockToast,
  default: {
    install: vi.fn(),
  },
}))

// ── Mock floating-vue (v-tooltip directive) ──
config.global.directives = {
  tooltip: {
    mounted() {},
    updated() {},
    unmounted() {},
  },
}

// ── Mock jsPDF ──
vi.mock('jspdf', () => {
  const mockDoc = {
    addPage: vi.fn(),
    output: vi.fn(() => new Blob(['fake-pdf'], { type: 'application/pdf' })),
    save: vi.fn(),
    setFont: vi.fn(),
    setFontSize: vi.fn(),
    text: vi.fn(),
    addImage: vi.fn(),
  }
  // Use regular functions (not arrows) so they can be called with `new`
  const MockJsPDF = vi.fn(function () { return mockDoc })
  return {
    default: MockJsPDF,
    jsPDF: MockJsPDF,
  }
})

// ── Mock PDF utils that load images (they fail in jsdom) ──
vi.mock('../utils/pdf/tournamentPDF.js', () => ({
  uitslagPDF: vi.fn(),
}))

vi.mock('../utils/pdf/rankingPDF.js', () => ({
  rankingPDF: vi.fn(),
}))

// ── Mock DOMPurify ──
vi.mock('dompurify', () => ({
  default: {
    sanitize: vi.fn((html) => html),
  },
}))

// ── Mock heroicons (they are SVG components) ──
const IconStub = { template: '<svg />' }
vi.mock('@heroicons/vue/24/solid', () => ({
  PrinterIcon: IconStub,
  TrashIcon: IconStub,
  PencilSquareIcon: IconStub,
  InboxIcon: IconStub,
  NewspaperIcon: IconStub,
}))

// ── localStorage mock helper ──
// jsdom provides localStorage, but we want to be able to spy on it
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => {
      store[key] = String(value)
    }),
    removeItem: vi.fn((key) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    _getStore: () => store,
    _setStore: (newStore) => {
      store = { ...newStore }
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// ── window.alert / window.open stubs ──
window.alert = vi.fn()
window.open = vi.fn()

// ── Reset mocks between tests ──
beforeEach(() => {
  vi.clearAllMocks()
  localStorageMock.clear()
  localStorageMock.clear.mockClear() // clear the call record from the clear() above
  localStorageMock.getItem.mockClear()
  localStorageMock.setItem.mockClear()
  localStorageMock.removeItem.mockClear()
})

// Export for use in tests
export { mockToast, localStorageMock }
