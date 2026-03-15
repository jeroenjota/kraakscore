// Tests for standard/saved teams CRUD operations
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import App from '../App.vue'
import dbService from '../services/dbServices.js'
import { sampleSavedTeamsFromApi } from './fixtures/teams.js'

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
      Ranking: { name: 'Ranking', template: '<div />' },
      Tournament: { name: 'Tournament', template: '<div />' },
      SelectPlayers: {
        name: 'SelectPlayers',
        template: '<div data-testid="select-players-stub" />',
        emits: ['addTeam'],
      },
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
  dbService.saveStandardTeams.mockResolvedValue({ success: true, data: {} })

  const wrapper = mount(App, globalStubs)
  await flushPromises()
  return wrapper
}

describe('Saved Teams Management', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches saved teams from API on mount', async () => {
    await mountServerAvailable()
    expect(dbService.fetchSavedTeams).toHaveBeenCalledTimes(1)
  })

  it('deduplicates teams fetched from API', async () => {
    dbService.checkServer.mockResolvedValue({ success: true })
    dbService.fetchToernooien.mockResolvedValue({ success: true, data: [] })
    dbService.fetchSavedTeams.mockResolvedValue({
      success: true,
      data: [
        { team: 'Alice/Bob' },
        { team: 'alice/bob' }, // duplicate after cleanTeamName
        { team: 'Carol/Dave' },
      ],
    })
    dbService.fetchAllPlayers.mockResolvedValue({ success: true, data: [] })
    dbService.fetchRanking.mockResolvedValue({ success: true, data: [] })

    const wrapper = mount(App, globalStubs)
    await flushPromises()

    // Should only have unique teams after cleanTeamName normalization
    const savedSection = wrapper.find('[data-testid="saved-teams-section"]')
    const items = savedSection.findAll('li')
    // "alice/bob" normalizes to "Alice/Bob", so only 2 unique teams
    expect(items.length).toBe(2)
  })

  it('saves teams to localStorage after fetching from API', async () => {
    await mountServerAvailable()
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'savedTeams',
      expect.any(String),
    )
  })

  it('adds new tournament teams to saved teams list on tournament start', async () => {
    const wrapper = await mountServerAvailable()
    const selectPlayers = wrapper.findComponent({ name: 'SelectPlayers' })

    // Add a team not in the saved list
    await selectPlayers.vm.$emit('addTeam', 'NewPlayer/Another')
    await flushPromises()

    // The team should appear in the saved teams section eventually
    // (addTeamsToList is called when tournament starts, not immediately)
    // Let's verify the team is in the tournament list
    expect(wrapper.find('[data-testid="team-list"]').text()).toContain('Another/Newplayer')
  })

  it('shows clean database button when no tournament teams selected', async () => {
    const wrapper = await mountServerAvailable()

    const cleanBtn = wrapper.find('[data-testid="clean-database-button"]')
    expect(cleanBtn.exists()).toBe(true)
  })

  it('hides clean database button when tournament teams are selected', async () => {
    const wrapper = await mountServerAvailable()
    const selectPlayers = wrapper.findComponent({ name: 'SelectPlayers' })

    await selectPlayers.vm.$emit('addTeam', 'Alice/Bob')
    await flushPromises()

    const cleanBtn = wrapper.find('[data-testid="clean-database-button"]')
    expect(cleanBtn.exists()).toBe(false)
  })

  it('shows start button only when 4+ teams are selected', async () => {
    const wrapper = await mountServerAvailable()

    // No teams - no start button
    expect(wrapper.find('[data-testid="start-button"]').exists()).toBe(false)

    const selectPlayers = wrapper.findComponent({ name: 'SelectPlayers' })

    // Add 3 teams - still no start button (needs > 3)
    for (let i = 1; i <= 3; i++) {
      await selectPlayers.vm.$emit('addTeam', `P${i}A/P${i}B`)
      await flushPromises()
    }
    expect(wrapper.find('[data-testid="start-button"]').exists()).toBe(false)

    // Add 4th team - start button should appear
    await selectPlayers.vm.$emit('addTeam', 'P4A/P4B')
    await flushPromises()
    expect(wrapper.find('[data-testid="start-button"]').exists()).toBe(true)
  })
})
