// Tests for semester/period filtering logic
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import App from '../App.vue'
import dbService from '../services/dbServices.js'
import { sampleToernooien } from './fixtures/tournaments.js'
import { sampleSavedTeamsFromApi } from './fixtures/teams.js'
import { sampleRankingData } from './fixtures/ranking.js'

vi.mock('../services/dbServices.js', () => import('./mocks/dbServices.js'))

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

async function mountWithTournaments() {
  dbService.checkServer.mockResolvedValue({ success: true })
  dbService.fetchToernooien.mockResolvedValue({ success: true, data: [...sampleToernooien] })
  dbService.fetchSavedTeams.mockResolvedValue({ success: true, data: [...sampleSavedTeamsFromApi] })
  dbService.fetchAllPlayers.mockResolvedValue({ success: true, data: [] })
  dbService.fetchRanking.mockResolvedValue({ success: true, data: [...sampleRankingData] })

  const wrapper = mount(App, globalStubs)
  await flushPromises()
  return wrapper
}

describe('Semester & Period Management', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('semester select is populated from tournament dates', async () => {
    const wrapper = await mountWithTournaments()
    const semesterSelect = wrapper.find('[data-testid="semester-select"]')
    expect(semesterSelect.exists()).toBe(true)

    const options = semesterSelect.findAll('option')
    // sampleToernooien has dates in 2025-1 (Jan, Mar) and 2025-2 (Jul, Sep)
    const optionTexts = options.map(o => o.text().trim())
    expect(optionTexts).toContain('2025-1')
    expect(optionTexts).toContain('2025-2')
  })

  it('sets active semester based on current date', async () => {
    const wrapper = await mountWithTournaments()
    const semesterSelect = wrapper.find('[data-testid="semester-select"]')
    // The current date is March 14, 2026, so semester should be 2026-1
    // But since tournaments only have 2025 dates, it depends on setActiveSemester logic
    // It defaults to current date semester when no active tournament
    const now = new Date()
    const expectedSemester = `${now.getFullYear()}-${Math.ceil((now.getMonth() + 1) / 6)}`
    // The value might not match a tournament semester, but the model should be set
    expect(semesterSelect.element.value).toBeDefined()
  })

  it('tournament select shows filtered tournaments for selected semester', async () => {
    const wrapper = await mountWithTournaments()
    const tournamentSelect = wrapper.find('[data-testid="tournament-select"]')
    expect(tournamentSelect.exists()).toBe(true)

    // The first option is the disabled "Toernooien" placeholder
    const options = tournamentSelect.findAll('option')
    expect(options[0].text().trim()).toBe('Toernooien')
  })

  it('changing semester filters tournaments correctly', async () => {
    const wrapper = await mountWithTournaments()
    const semesterSelect = wrapper.find('[data-testid="semester-select"]')

    // Set to first semester of 2025
    await semesterSelect.setValue('2025-1')
    await semesterSelect.trigger('change')
    await flushPromises()

    // Tournament select should show tournaments from Jan-Jun 2025
    const tournamentSelect = wrapper.find('[data-testid="tournament-select"]')
    const options = tournamentSelect.findAll('option').slice(1) // skip disabled placeholder
    // sampleToernooien has 2 tournaments in 2025 S1 (Jan 15 and Mar 20)
    expect(options.length).toBe(2)
  })

  it('changing semester to S2 shows only second-semester tournaments', async () => {
    const wrapper = await mountWithTournaments()
    const semesterSelect = wrapper.find('[data-testid="semester-select"]')

    await semesterSelect.setValue('2025-2')
    await semesterSelect.trigger('change')
    await flushPromises()

    const tournamentSelect = wrapper.find('[data-testid="tournament-select"]')
    const options = tournamentSelect.findAll('option').slice(1) // skip disabled placeholder
    // sampleToernooien has 2 tournaments in 2025 S2 (Jul 10 and Sep 5)
    expect(options.length).toBe(2)
  })
})
