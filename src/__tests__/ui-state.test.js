// Tests for UI state management (zoom, computed properties, conditional rendering)
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import App from '../App.vue'
import dbService from '../services/dbServices.js'

vi.mock('../services/dbServices.js', () => import('./mocks/dbServices.js'))

const globalStubs = {
  global: {
    stubs: {
      ConfirmDialog: {
        name: 'ConfirmDialog',
        template: '<div />',
        methods: { open: vi.fn(() => Promise.resolve(true)) },
        expose: ['open'],
      },
      Ranking: {
        name: 'Ranking',
        template: '<div data-testid="ranking-stub" />',
        props: ['ranking', 'toernooien', 'vanaf', 'tot'],
      },
      Tournament: {
        name: 'Tournament',
        template: '<div data-testid="tournament-stub" />',
        emits: ['saveToernooi'],
      },
      SelectPlayers: {
        name: 'SelectPlayers',
        template: '<div data-testid="select-players-stub" />',
        emits: ['addTeam'],
      },
      Qrcode: { name: 'Qrcode', template: '<div />' },
    },
  },
}

async function mountDefault() {
  dbService.checkServer.mockResolvedValue({ success: true })
  dbService.fetchToernooien.mockResolvedValue({ success: true, data: [] })
  dbService.fetchSavedTeams.mockResolvedValue({ success: true, data: [] })
  dbService.fetchAllPlayers.mockResolvedValue({ success: true, data: [] })
  dbService.fetchRanking.mockResolvedValue({ success: true, data: [] })

  const wrapper = mount(App, globalStubs)
  await flushPromises()
  return wrapper
}

describe('UI State', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Zoom functionality', () => {
    it('applies zoomStyle to the root div', async () => {
      const wrapper = await mountDefault()
      const root = wrapper.find('[data-testid="app-root"]')

      // Should have transform style
      const style = root.attributes('style')
      expect(style).toContain('transform')
      expect(style).toContain('scale')
    })

    it('toggles zoom when clicking the title', async () => {
      const wrapper = await mountDefault()
      const title = wrapper.find('[data-testid="app-title"]')

      // Get initial scale
      const root = wrapper.find('[data-testid="app-root"]')
      const initialStyle = root.attributes('style')

      // Click to toggle zoom
      await title.trigger('click')
      await flushPromises()

      const newStyle = root.attributes('style')
      // Style should have changed (scale decreased by 0.1)
      expect(newStyle).not.toBe(initialStyle)
    })

    it('wraps zoom back to 1.0 when below 0.7', async () => {
      // Mock window.innerWidth so initial scale is 1.0 (>= 1200)
      Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true, configurable: true })

      const wrapper = await mountDefault()
      const title = wrapper.find('[data-testid="app-title"]')
      const root = wrapper.find('[data-testid="app-root"]')

      // Click multiple times to cycle through scales
      // Starting from 1.0: each click reduces by 0.1
      // 1.0 -> 0.9 -> 0.8 -> 0.7 -> 0.6 (< 0.7, wraps to 1.0)
      for (let i = 0; i < 4; i++) {
        await title.trigger('click')
        await flushPromises()
      }

      // After 4 clicks, scale should be back to 1.0
      const style = root.attributes('style')
      expect(style).toContain('scale(1)')
    })
  })

  describe('Conditional rendering', () => {
    it('shows teams section by default (not ranking)', async () => {
      const wrapper = await mountDefault()

      expect(wrapper.find('[data-testid="teams-section"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="ranking-stub"]').exists()).toBe(false)
    })

    it('toggles between ranking and teams view', async () => {
      const wrapper = await mountDefault()
      const rankingBtn = wrapper.find('[data-testid="ranking-toggle"]')

      // Click to show ranking
      await rankingBtn.trigger('click')
      await flushPromises()

      expect(wrapper.find('[data-testid="ranking-stub"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="teams-section"]').exists()).toBe(false)

      // Click again to go back
      await rankingBtn.trigger('click')
      await flushPromises()

      expect(wrapper.find('[data-testid="ranking-stub"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="teams-section"]').exists()).toBe(true)
    })

    it('ranking toggle button shows "Seizoen" when ranking is hidden', async () => {
      const wrapper = await mountDefault()
      const rankingBtn = wrapper.find('[data-testid="ranking-toggle"]')
      expect(rankingBtn.text()).toContain('Seizoen')
    })

    it('ranking toggle button shows "Terug" when ranking is shown', async () => {
      const wrapper = await mountDefault()
      const rankingBtn = wrapper.find('[data-testid="ranking-toggle"]')

      await rankingBtn.trigger('click')
      await flushPromises()

      expect(rankingBtn.text()).toContain('Terug')
    })

    it('shows "Laurierboom Kraak" title when no tournament is active', async () => {
      const wrapper = await mountDefault()
      expect(wrapper.text()).toContain('Laurierboom Kraak')
    })

    it('hides toprow when tournament is started', async () => {
      dbService.getToernooiIdByDate.mockResolvedValue({ success: true, data: null })
      dbService.saveStandardTeams.mockResolvedValue({ success: true, data: {} })

      const wrapper = await mountDefault()
      const selectPlayers = wrapper.findComponent({ name: 'SelectPlayers' })

      // Add 4 teams
      for (let i = 1; i <= 4; i++) {
        await selectPlayers.vm.$emit('addTeam', `P${i}A/P${i}B`)
        await flushPromises()
      }

      // Start tournament - mock the ConfirmDialog to return true
      const startBtn = wrapper.find('[data-testid="start-button"]')
      await startBtn.trigger('click')
      await flushPromises()

      expect(wrapper.find('[data-testid="toprow"]').exists()).toBe(false)
    })
  })

  describe('Close button label (sluitKnop computed)', () => {
    it('shows "Sluiten" when no scores entered', async () => {
      dbService.getToernooiIdByDate.mockResolvedValue({ success: true, data: null })
      dbService.saveStandardTeams.mockResolvedValue({ success: true, data: {} })

      const wrapper = await mountDefault()
      const selectPlayers = wrapper.findComponent({ name: 'SelectPlayers' })

      for (let i = 1; i <= 4; i++) {
        await selectPlayers.vm.$emit('addTeam', `P${i}A/P${i}B`)
        await flushPromises()
      }

      const startBtn = wrapper.find('[data-testid="start-button"]')
      await startBtn.trigger('click')
      await flushPromises()

      const closeBtn = wrapper.find('[data-testid="close-button"]')
      expect(closeBtn.text()).toContain('Sluiten')
    })
  })

  describe('Repeat rounds input', () => {
    it('shows repeat rounds input', async () => {
      const wrapper = await mountDefault()
      const input = wrapper.find('[data-testid="repeat-rounds-input"]')
      expect(input.exists()).toBe(true)
    })

    it('defaults to 1 round', async () => {
      const wrapper = await mountDefault()
      const input = wrapper.find('[data-testid="repeat-rounds-input"]')
      expect(input.element.value).toBe('1')
    })

    it('allows setting to 2 when fewer than 7 teams', async () => {
      const wrapper = await mountDefault()
      const input = wrapper.find('[data-testid="repeat-rounds-input"]')
      await input.setValue(2)
      expect(input.element.value).toBe('2')
    })
  })
})
