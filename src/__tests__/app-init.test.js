// Tests for App.vue initialization and server connectivity
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import App from '../App.vue'
import dbService from '../services/dbServices.js'
import { sampleToernooien } from './fixtures/tournaments.js'
import { sampleSavedTeamsFromApi, samplePlayers } from './fixtures/teams.js'
import { sampleRankingData } from './fixtures/ranking.js'

vi.mock('../services/dbServices.js', () => import('./mocks/dbServices.js'))

// Stub child components
const globalStubs = {
  global: {
    stubs: {
      ConfirmDialog: { name: 'ConfirmDialog', template: '<div />', methods: { open: vi.fn(() => Promise.resolve(true)) }, expose: ['open'] },
      Ranking: { name: 'Ranking', template: '<div data-testid="ranking-stub" />' },
      Tournament: { name: 'Tournament', template: '<div data-testid="tournament-stub" />' },
      SelectPlayers: { name: 'SelectPlayers', template: '<div data-testid="select-players-stub" />' },
      Qrcode: { name: 'Qrcode', template: '<div data-testid="qrcode-stub" />' },
    },
  },
}

describe('App Initialization', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default: server available
    dbService.checkServer.mockResolvedValue({ success: true })
    dbService.fetchToernooien.mockResolvedValue({ success: true, data: [] })
    dbService.fetchSavedTeams.mockResolvedValue({ success: true, data: [] })
    dbService.fetchAllPlayers.mockResolvedValue({ success: true, data: [] })
    dbService.fetchRanking.mockResolvedValue({ success: true, data: [] })
  })

  it('renders without crashing', async () => {
    const wrapper = mount(App, globalStubs)
    await flushPromises()
    expect(wrapper.find('[data-testid="app-root"]').exists()).toBe(true)
  })

  it('shows the app title', async () => {
    const wrapper = mount(App, globalStubs)
    await flushPromises()
    expect(wrapper.find('[data-testid="app-title"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Laurierboom Kraak')
  })

  it('calls checkServer on mount', async () => {
    mount(App, globalStubs)
    await flushPromises()
    expect(dbService.checkServer).toHaveBeenCalledTimes(1)
  })

  it('fetches all data when server is available', async () => {
    dbService.checkServer.mockResolvedValue({ success: true })
    dbService.fetchSavedTeams.mockResolvedValue({ success: true, data: sampleSavedTeamsFromApi })
    dbService.fetchToernooien.mockResolvedValue({ success: true, data: sampleToernooien })
    dbService.fetchAllPlayers.mockResolvedValue({ success: true, data: samplePlayers })
    dbService.fetchRanking.mockResolvedValue({ success: true, data: sampleRankingData })

    mount(App, globalStubs)
    await flushPromises()

    expect(dbService.fetchSavedTeams).toHaveBeenCalled()
    expect(dbService.fetchToernooien).toHaveBeenCalled()
    expect(dbService.fetchAllPlayers).toHaveBeenCalled()
    expect(dbService.fetchRanking).toHaveBeenCalled()
  })

  it('shows semester and tournament selects when server is available', async () => {
    dbService.checkServer.mockResolvedValue({ success: true })
    dbService.fetchToernooien.mockResolvedValue({ success: true, data: sampleToernooien })
    dbService.fetchSavedTeams.mockResolvedValue({ success: true, data: sampleSavedTeamsFromApi })
    dbService.fetchAllPlayers.mockResolvedValue({ success: true, data: samplePlayers })
    dbService.fetchRanking.mockResolvedValue({ success: true, data: sampleRankingData })

    const wrapper = mount(App, globalStubs)
    await flushPromises()

    expect(wrapper.find('[data-testid="semester-select"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="tournament-select"]').exists()).toBe(true)
  })

  it('falls back to localStorage when server is unavailable', async () => {
    dbService.checkServer.mockResolvedValue({ success: false })

    const savedTeams = ['Alice/Bob', 'Carol/Dave']
    localStorage.setItem('savedTeams', JSON.stringify(savedTeams))

    mount(App, globalStubs)
    await flushPromises()

    expect(dbService.fetchSavedTeams).not.toHaveBeenCalled()
    expect(dbService.fetchToernooien).not.toHaveBeenCalled()
    expect(localStorage.getItem).toHaveBeenCalledWith('savedTeams')
  })

  it('does not show semester/tournament selects when server is unavailable', async () => {
    dbService.checkServer.mockResolvedValue({ success: false })

    const wrapper = mount(App, globalStubs)
    await flushPromises()

    expect(wrapper.find('[data-testid="semester-select"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="tournament-select"]').exists()).toBe(false)
  })

  it('shows teams section by default (not ranking)', async () => {
    const wrapper = mount(App, globalStubs)
    await flushPromises()

    expect(wrapper.find('[data-testid="toprow"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="ranking-section"]').exists()).toBe(false)
  })

  it('registers resize event listener on mount', async () => {
    const addEventSpy = vi.spyOn(window, 'addEventListener')
    mount(App, globalStubs)
    await flushPromises()

    const resizeCalls = addEventSpy.mock.calls.filter(c => c[0] === 'resize')
    expect(resizeCalls.length).toBeGreaterThanOrEqual(1)
  })

  it('registers storage event listener on mount', async () => {
    const addEventSpy = vi.spyOn(window, 'addEventListener')
    mount(App, globalStubs)
    await flushPromises()

    const storageCalls = addEventSpy.mock.calls.filter(c => c[0] === 'storage')
    expect(storageCalls.length).toBeGreaterThanOrEqual(1)
  })
})
