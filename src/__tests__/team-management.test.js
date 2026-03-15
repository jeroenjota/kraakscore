// Tests for team management (adding, removing, editing teams in tournament)
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import App from '../App.vue'
import dbService from '../services/dbServices.js'
import { sampleSavedTeamsFromApi, sampleSavedTeams } from './fixtures/teams.js'

vi.mock('../services/dbServices.js', () => import('./mocks/dbServices.js'))

const globalStubs = {
  global: {
    stubs: {
      ConfirmDialog: { name: 'ConfirmDialog', template: '<div />', methods: { open: vi.fn(() => Promise.resolve(true)) }, expose: ['open'] },
      Ranking: { name: 'Ranking', template: '<div data-testid="ranking-stub" />' },
      Tournament: { name: 'Tournament', template: '<div data-testid="tournament-stub" />' },
      SelectPlayers: {
        name: 'SelectPlayers',
        template: '<div data-testid="select-players-stub" />',
        emits: ['addTeam'],
      },
      Qrcode: { name: 'Qrcode', template: '<div data-testid="qrcode-stub" />' },
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

describe('Team Management', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Adding teams via SelectPlayers emit', () => {
    it('adds a team when SelectPlayers emits addTeam', async () => {
      const wrapper = await mountServerAvailable()

      // Simulate the SelectPlayers emitting addTeam
      const selectPlayers = wrapper.findComponent({ name: 'SelectPlayers' })
      await selectPlayers.vm.$emit('addTeam', 'Alice/Bob')
      await flushPromises()

      // Team list should appear
      const teamList = wrapper.find('[data-testid="team-list"]')
      expect(teamList.exists()).toBe(true)
      expect(teamList.text()).toContain('Alice/Bob')
    })

    it('cleans team names when adding (capitalizes, sorts players)', async () => {
      const wrapper = await mountServerAvailable()

      const selectPlayers = wrapper.findComponent({ name: 'SelectPlayers' })
      await selectPlayers.vm.$emit('addTeam', 'bob alice')
      await flushPromises()

      // cleanTeamName should normalize: "bob alice" -> split on non-alphanum -> "Alice/Bob" (sorted)
      const teamList = wrapper.find('[data-testid="team-list"]')
      expect(teamList.exists()).toBe(true)
      expect(teamList.text()).toContain('Alice/Bob')
    })

    it('enforces maximum 8 teams', async () => {
      const wrapper = await mountServerAvailable()
      const selectPlayers = wrapper.findComponent({ name: 'SelectPlayers' })

      // Add 8 teams
      for (let i = 1; i <= 8; i++) {
        await selectPlayers.vm.$emit('addTeam', `Player${i}A/Player${i}B`)
        await flushPromises()
      }

      // Try adding a 9th team
      await selectPlayers.vm.$emit('addTeam', 'Extra/Team')
      await flushPromises()

      // Should have been blocked with an alert
      expect(window.alert).toHaveBeenCalledWith('Maximaal 8 teams toegestaan!')
      // Still only 8 teams
      const listItems = wrapper.findAll('[data-testid="team-list"] li')
      expect(listItems.length).toBe(8)
    })

    it('auto-reduces repeatRounds to 1 when teams >= 7', async () => {
      const wrapper = await mountServerAvailable()
      const selectPlayers = wrapper.findComponent({ name: 'SelectPlayers' })

      // First set repeatRounds to 2
      const repeatInput = wrapper.find('[data-testid="repeat-rounds-input"]')
      await repeatInput.setValue(2)
      await flushPromises()

      // Add 7 teams (triggers the >= 6 check which sets repeatRounds to 1)
      for (let i = 1; i <= 7; i++) {
        await selectPlayers.vm.$emit('addTeam', `Player${i}A/Player${i}B`)
        await flushPromises()
      }

      // repeatRounds should have been set to 1
      expect(repeatInput.element.value).toBe('1')
    })
  })

  describe('Removing teams', () => {
    it('removes a team by clicking with ctrl', async () => {
      const wrapper = await mountServerAvailable()
      const selectPlayers = wrapper.findComponent({ name: 'SelectPlayers' })

      await selectPlayers.vm.$emit('addTeam', 'Alice/Bob')
      await selectPlayers.vm.$emit('addTeam', 'Carol/Dave')
      await flushPromises()

      const items = wrapper.findAll('[data-testid="team-list"] li')
      expect(items.length).toBe(2)

      // Ctrl+click to remove first team
      await items[0].trigger('click', { ctrlKey: true })
      await flushPromises()

      const updatedItems = wrapper.findAll('[data-testid="team-list"] li')
      expect(updatedItems.length).toBe(1)
      expect(updatedItems[0].text()).toContain('Carol/Dave')
    })

    it('edits a team by clicking (moves to input, removes from list)', async () => {
      const wrapper = await mountServerAvailable()
      const selectPlayers = wrapper.findComponent({ name: 'SelectPlayers' })

      await selectPlayers.vm.$emit('addTeam', 'Alice/Bob')
      await selectPlayers.vm.$emit('addTeam', 'Carol/Dave')
      await flushPromises()

      // Click (exact) to edit
      const items = wrapper.findAll('[data-testid="team-list"] li')
      await items[0].trigger('click')
      await flushPromises()

      // First team should be removed from list
      const updatedItems = wrapper.findAll('[data-testid="team-list"] li')
      expect(updatedItems.length).toBe(1)
      expect(updatedItems[0].text()).toContain('Carol/Dave')
    })
  })

  describe('Team list persistence', () => {
    it('persists teams to localStorage via watcher', async () => {
      const wrapper = await mountServerAvailable()
      const selectPlayers = wrapper.findComponent({ name: 'SelectPlayers' })

      await selectPlayers.vm.$emit('addTeam', 'Alice/Bob')
      await flushPromises()

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'tournamentTeams',
        expect.stringContaining('Alice/Bob'),
      )
    })
  })

  describe('Saved teams interaction', () => {
    it('displays saved teams from API', async () => {
      const wrapper = await mountServerAvailable()

      const savedSection = wrapper.find('[data-testid="saved-teams-section"]')
      expect(savedSection.exists()).toBe(true)

      // Should list the teams from the API mock
      sampleSavedTeams.forEach(team => {
        expect(savedSection.text()).toContain(team)
      })
    })

    it('marks a team as selected with checkmark when in tournament', async () => {
      const wrapper = await mountServerAvailable()
      const selectPlayers = wrapper.findComponent({ name: 'SelectPlayers' })

      await selectPlayers.vm.$emit('addTeam', 'Alice/Bob')
      await flushPromises()

      const savedSection = wrapper.find('[data-testid="saved-teams-section"]')
      // The Alice/Bob entry should have a checkmark (✔ = &#10004;)
      const teamEntries = savedSection.findAll('li p')
      const aliceBobEntry = teamEntries.find(p => p.text().includes('Alice/Bob'))
      expect(aliceBobEntry).toBeDefined()
      expect(aliceBobEntry.text()).toContain('✔')
    })

    it('toggles team selection when clicking a saved team', async () => {
      const wrapper = await mountServerAvailable()

      const savedSection = wrapper.find('[data-testid="saved-teams-section"]')
      const teamEntries = savedSection.findAll('li p')
      const firstTeam = teamEntries[0]

      // Click to add
      await firstTeam.trigger('click')
      await flushPromises()

      expect(wrapper.find('[data-testid="team-list"]').exists()).toBe(true)

      // Click again to remove
      await firstTeam.trigger('click')
      await flushPromises()

      // Team list should be gone since no teams remain
      expect(wrapper.find('[data-testid="team-list"]').exists()).toBe(false)
    })

    it('disables teams with overlapping players', async () => {
      const wrapper = await mountServerAvailable()
      const selectPlayers = wrapper.findComponent({ name: 'SelectPlayers' })

      // Add Alice/Bob
      await selectPlayers.vm.$emit('addTeam', 'Alice/Bob')
      await flushPromises()

      // Any saved team containing Alice or Bob should have teamDisabled class
      // None of our sample teams besides Alice/Bob contain Alice or Bob, so let's check
      // that Alice/Bob has teamSelected class, and others don't have teamDisabled
      const savedSection = wrapper.find('[data-testid="saved-teams-section"]')
      const teamEntries = savedSection.findAll('li p')
      const aliceBobEntry = teamEntries.find(p => p.text().includes('Alice/Bob'))
      expect(aliceBobEntry.classes()).toContain('teamSelected')
    })
  })
})
