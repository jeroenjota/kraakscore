// Tests for database maintenance (cleanDatabase, isServerActive)
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import App from '../App.vue'
import dbService from '../services/dbServices.js'
import { sampleSavedTeamsFromApi } from './fixtures/teams.js'

vi.mock('../services/dbServices.js', () => import('./mocks/dbServices.js'))

const mockDialogOpen = vi.fn(() => Promise.resolve(true))

const globalStubs = {
  global: {
    stubs: {
      ConfirmDialog: {
        name: 'ConfirmDialog',
        template: '<div />',
        setup() {
          return { open: mockDialogOpen }
        },
        expose: ['open'],
      },
      Ranking: { name: 'Ranking', template: '<div />' },
      Tournament: { name: 'Tournament', template: '<div />' },
      SelectPlayers: { name: 'SelectPlayers', template: '<div />', emits: ['addTeam'] },
      Qrcode: { name: 'Qrcode', template: '<div />' },
    },
  },
}

async function mountServerAvailable() {
  dbService.checkServer.mockResolvedValue({ success: true })
  dbService.fetchToernooien.mockResolvedValue({ success: true, data: [] })
  dbService.fetchSavedTeams.mockResolvedValue({ success: true, data: [...sampleSavedTeamsFromApi] })
  dbService.fetchAllPlayers.mockResolvedValue({ success: true, data: [] })
  dbService.fetchRanking.mockResolvedValue({ success: true, data: [] })

  const wrapper = mount(App, globalStubs)
  await flushPromises()
  return wrapper
}

describe('Database Maintenance', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDialogOpen.mockResolvedValue(true)
  })

  describe('Server connectivity', () => {
    it('sets serverAvailable to true when server responds', async () => {
      const wrapper = await mountServerAvailable()
      // Verification: semester select should be visible (only when serverAvailable)
      expect(wrapper.find('[data-testid="semester-select"]').exists()).toBe(true)
    })

    it('sets serverAvailable to false when server is down', async () => {
      dbService.checkServer.mockResolvedValue({ success: false })

      const wrapper = mount(App, globalStubs)
      await flushPromises()

      // Semester select should not be visible
      expect(wrapper.find('[data-testid="semester-select"]').exists()).toBe(false)
    })
  })

  describe('cleanDatabase', () => {
    it('shows clean database button when no teams in tournament', async () => {
      const wrapper = await mountServerAvailable()
      expect(wrapper.find('[data-testid="clean-database-button"]').exists()).toBe(true)
    })

    it('calls confirmation dialog before cleaning', async () => {
      const wrapper = await mountServerAvailable()

      const cleanBtn = wrapper.find('[data-testid="clean-database-button"]')
      await cleanBtn.trigger('click')
      await flushPromises()

      expect(mockDialogOpen).toHaveBeenCalled()
    })

    it('calls dbService.cleanTeamsAndPlayers on confirmation', async () => {
      dbService.cleanTeamsAndPlayers.mockResolvedValue({
        success: true,
        data: { success: true, aantal: 2, items: { teams: ['OldTeam'], spelers: ['OldPlayer'] } },
      })

      const wrapper = await mountServerAvailable()

      const cleanBtn = wrapper.find('[data-testid="clean-database-button"]')
      await cleanBtn.trigger('click')
      await flushPromises()

      expect(dbService.cleanTeamsAndPlayers).toHaveBeenCalledTimes(1)
    })

    it('does not clean when user cancels confirmation', async () => {
      mockDialogOpen.mockResolvedValueOnce(false)

      const wrapper = await mountServerAvailable()

      const cleanBtn = wrapper.find('[data-testid="clean-database-button"]')
      await cleanBtn.trigger('click')
      await flushPromises()

      expect(dbService.cleanTeamsAndPlayers).not.toHaveBeenCalled()
    })

    it('refreshes saved teams after cleaning', async () => {
      dbService.cleanTeamsAndPlayers.mockResolvedValue({
        success: true,
        data: { success: true, aantal: 1, items: { teams: ['Removed'], spelers: [] } },
      })

      const wrapper = await mountServerAvailable()

      // Reset the call count after initial mount
      dbService.fetchSavedTeams.mockClear()

      const cleanBtn = wrapper.find('[data-testid="clean-database-button"]')
      await cleanBtn.trigger('click')
      await flushPromises()

      // Should re-fetch saved teams after cleaning
      expect(dbService.fetchSavedTeams).toHaveBeenCalled()
    })

    it('handles clean response with zero items removed', async () => {
      dbService.cleanTeamsAndPlayers.mockResolvedValue({
        success: true,
        data: { success: true, aantal: 0, items: { teams: [], spelers: [] } },
      })

      const wrapper = await mountServerAvailable()

      const cleanBtn = wrapper.find('[data-testid="clean-database-button"]')
      await cleanBtn.trigger('click')
      await flushPromises()

      // Should not throw, clean completes gracefully
      expect(dbService.cleanTeamsAndPlayers).toHaveBeenCalled()
    })
  })
})
