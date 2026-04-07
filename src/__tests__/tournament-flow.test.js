// Tests for tournament lifecycle (start, close, reset)
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import App from '../App.vue'
import dbService from '../services/dbServices.js'
import { sampleSavedTeamsFromApi } from './fixtures/teams.js'

vi.mock('../services/dbServices.js', () => import('./mocks/dbServices.js'))

// We need ConfirmDialog to actually work for start tournament (multiple confirmations)
const mockDialogOpen = vi.fn()

const globalStubs = {
  global: {
    stubs: {
      ConfirmDialog: {
        name: 'ConfirmDialog',
        template: '<div ref="dialog" />',
        setup() {
          return { open: mockDialogOpen }
        },
        expose: ['open'],
      },
      Ranking: { name: 'Ranking', template: '<div />' },
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

async function mountWithTeams(numTeams = 4) {
  dbService.checkServer.mockResolvedValue({ success: true })
  dbService.fetchToernooien.mockResolvedValue({ success: true, data: [] })
  dbService.fetchSavedTeams.mockResolvedValue({ success: true, data: [...sampleSavedTeamsFromApi] })
  dbService.fetchAllPlayers.mockResolvedValue({ success: true, data: [] })
  dbService.fetchRanking.mockResolvedValue({ success: true, data: [] })
  dbService.getToernooiIdByDate.mockResolvedValue({ success: true, data: null })
  dbService.saveStandardTeams.mockResolvedValue({ success: true, data: {} })

  const wrapper = mount(App, globalStubs)
  await flushPromises()

  const selectPlayers = wrapper.findComponent({ name: 'SelectPlayers' })
  for (let i = 1; i <= numTeams; i++) {
    await selectPlayers.vm.$emit('addTeam', `Player${i}A/Player${i}B`)
    await flushPromises()
  }

  return wrapper
}

describe('Tournament Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDialogOpen.mockResolvedValue(true) // Confirm all dialogs by default
  })

  describe('Starting a tournament', () => {
    it('starts a tournament with 4 teams', async () => {
      const wrapper = await mountWithTeams(4)

      // Click start button
      const startBtn = wrapper.find('[data-testid="start-button"]')
      expect(startBtn.exists()).toBe(true)
      await startBtn.trigger('click')
      await flushPromises()

      // Tournament should be started - toprow should be hidden, tournament component shown
      expect(wrapper.find('[data-testid="toprow"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="tournament-component"]').exists()).toBe(true)
    })

    it('checks for existing tournament on same date before starting', async () => {
      const wrapper = await mountWithTeams(4)

      const startBtn = wrapper.find('[data-testid="start-button"]')
      await startBtn.trigger('click')
      await flushPromises()

      expect(dbService.getToernooiIdByDate).toHaveBeenCalled()
    })

    it('asks to overwrite when tournament exists for today', async () => {
      dbService.getToernooiIdByDate.mockResolvedValue({ success: true, data: 42 })
      const wrapper = await mountWithTeams(4)

      const startBtn = wrapper.find('[data-testid="start-button"]')
      await startBtn.trigger('click')
      await flushPromises()

      // Should have called dialog to confirm overwrite
      expect(mockDialogOpen).toHaveBeenCalled()
    })

    it('does not start if user cancels overwrite confirmation', async () => {
      const wrapper = await mountWithTeams(4)

      // Set mocks AFTER mountWithTeams (which overrides getToernooiIdByDate)
      dbService.getToernooiIdByDate.mockResolvedValue({ success: true, data: 42 })
      // First dialog: "tournament exists, overwrite?" -> No
      mockDialogOpen.mockResolvedValueOnce(false)

      dbService.fetchToernooi.mockResolvedValue({
        success: true,
        data: {
          id: 42,
          datum: new Date().toISOString(),
          teams: JSON.stringify(['A/B', 'C/D', 'E/F', 'G/H']),
          matches: JSON.stringify([]),
          groepsToernooi: 0,
          repeatRounds: 1,
        },
      })

      const startBtn = wrapper.find('[data-testid="start-button"]')
      await startBtn.trigger('click')
      await flushPromises()

      // Should load the existing tournament instead
      expect(dbService.fetchToernooi).toHaveBeenCalledWith(42)
    })

    it('prompts for group tournament with 7+ teams', async () => {
      const wrapper = await mountWithTeams(7)

      mockDialogOpen
        .mockResolvedValueOnce(true) // "groepstoernooi?" -> yes
        .mockResolvedValueOnce(true) // "start bevestiging" -> yes

      const startBtn = wrapper.find('[data-testid="start-button"]')
      await startBtn.trigger('click')
      await flushPromises()

      // At least one dialog should have been for group tournament
      expect(mockDialogOpen).toHaveBeenCalled()
    })

    it('shows close button when tournament is started', async () => {
      const wrapper = await mountWithTeams(4)

      const startBtn = wrapper.find('[data-testid="start-button"]')
      await startBtn.trigger('click')
      await flushPromises()

      expect(wrapper.find('[data-testid="close-button"]').exists()).toBe(true)
    })

    it('shows PDF button when tournament is started', async () => {
      const wrapper = await mountWithTeams(4)

      const startBtn = wrapper.find('[data-testid="start-button"]')
      await startBtn.trigger('click')
      await flushPromises()

      expect(wrapper.find('[data-testid="pdf-button"]').exists()).toBe(true)
    })

    it('saves tournament teams to localStorage on start', async () => {
      const wrapper = await mountWithTeams(4)

      const startBtn = wrapper.find('[data-testid="start-button"]')
      await startBtn.trigger('click')
      await flushPromises()

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'tournamentTeams',
        expect.any(String),
      )
    })
  })

  describe('Closing a tournament', () => {
    it('resets app when closing without scores', async () => {
      const wrapper = await mountWithTeams(4)

      const startBtn = wrapper.find('[data-testid="start-button"]')
      await startBtn.trigger('click')
      await flushPromises()

      // Close without entering scores
      const closeBtn = wrapper.find('[data-testid="close-button"]')
      await closeBtn.trigger('click')
      await flushPromises()

      // Should be back to main view
      expect(wrapper.find('[data-testid="toprow"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="tournament-component"]').exists()).toBe(false)
    })
  })

  describe('Reset', () => {
    it('resets localStorage keys on reset', async () => {
      const wrapper = await mountWithTeams(4)

      const startBtn = wrapper.find('[data-testid="start-button"]')
      await startBtn.trigger('click')
      await flushPromises()

      // Close to trigger reset
      const closeBtn = wrapper.find('[data-testid="close-button"]')
      await closeBtn.trigger('click')
      await flushPromises()

      // Should have cleared localStorage keys
      expect(localStorage.removeItem).toHaveBeenCalledWith('tournamentTeams')
      expect(localStorage.removeItem).toHaveBeenCalledWith('tournamentMatches')
      expect(localStorage.removeItem).toHaveBeenCalledWith('tournamentGroupMatches')
      expect(localStorage.removeItem).toHaveBeenCalledWith('tournamentFinalMatches')
      expect(localStorage.removeItem).toHaveBeenCalledWith('tournamentGroups')
    })
  })
})
