// Tests for ranking calculation and filtering
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import App from '../App.vue'
import dbService from '../services/dbServices.js'
import { sampleToernooien } from './fixtures/tournaments.js'
import { sampleSavedTeamsFromApi } from './fixtures/teams.js'
import { sampleRankingData, sampleRankingWithTies } from './fixtures/ranking.js'

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
        template: '<div data-testid="ranking-stub">{{ JSON.stringify(ranking) }}</div>',
        props: ['ranking', 'toernooien', 'vanaf', 'tot'],
      },
      Tournament: { name: 'Tournament', template: '<div />' },
      SelectPlayers: { name: 'SelectPlayers', template: '<div />', emits: ['addTeam'] },
      Qrcode: { name: 'Qrcode', template: '<div />' },
    },
  },
}

async function mountWithRankingData(rankingData = sampleRankingData) {
  dbService.checkServer.mockResolvedValue({ success: true })
  dbService.fetchToernooien.mockResolvedValue({ success: true, data: [...sampleToernooien] })
  dbService.fetchSavedTeams.mockResolvedValue({ success: true, data: [...sampleSavedTeamsFromApi] })
  dbService.fetchAllPlayers.mockResolvedValue({ success: true, data: [] })
  dbService.fetchRanking.mockResolvedValue({ success: true, data: [...rankingData] })

  const wrapper = mount(App, globalStubs)
  await flushPromises()
  return wrapper
}

describe('Ranking', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches ranking data from API on mount', async () => {
    await mountWithRankingData()
    expect(dbService.fetchRanking).toHaveBeenCalledTimes(1)
  })

  it('does not fetch ranking when server is unavailable', async () => {
    dbService.checkServer.mockResolvedValue({ success: false })
    dbService.fetchToernooien.mockResolvedValue({ success: true, data: [] })
    dbService.fetchSavedTeams.mockResolvedValue({ success: true, data: [] })
    dbService.fetchAllPlayers.mockResolvedValue({ success: true, data: [] })
    dbService.fetchRanking.mockResolvedValue({ success: true, data: [] })

    mount(App, globalStubs)
    await flushPromises()

    expect(dbService.fetchRanking).not.toHaveBeenCalled()
  })

  it('toggles ranking view when clicking ranking button', async () => {
    const wrapper = await mountWithRankingData()

    // Initially ranking is not shown
    expect(wrapper.find('[data-testid="ranking-stub"]').exists()).toBe(false)

    // Click ranking toggle
    const rankingBtn = wrapper.find('[data-testid="ranking-toggle"]')
    await rankingBtn.trigger('click')
    await flushPromises()

    expect(wrapper.find('[data-testid="ranking-stub"]').exists()).toBe(true)
  })

  it('filters ranking by selected semester period', async () => {
    const wrapper = await mountWithRankingData()

    // Set semester to 2025-1
    const semesterSelect = wrapper.find('[data-testid="semester-select"]')
    await semesterSelect.setValue('2025-1')
    await semesterSelect.trigger('change')
    await flushPromises()

    // Toggle ranking view
    const rankingBtn = wrapper.find('[data-testid="ranking-toggle"]')
    await rankingBtn.trigger('click')
    await flushPromises()

    // The ranking stub should have received filtered data
    const rankingStub = wrapper.findComponent({ name: 'Ranking' })
    const rankingProp = rankingStub.props('ranking')

    // Only players with scores in 2025 S1 should be present
    const playerNames = rankingProp.map(r => r.speler)
    expect(playerNames).toContain('Alice')
    expect(playerNames).toContain('Bob')
    expect(playerNames).toContain('Carol')
    expect(playerNames).toContain('Eve')
    // Dave only has scores in S2
    expect(playerNames).not.toContain('Dave')
  })

  it('calculates best 6 scores per player', async () => {
    const wrapper = await mountWithRankingData()

    // Set semester to 2025-1
    const semesterSelect = wrapper.find('[data-testid="semester-select"]')
    await semesterSelect.setValue('2025-1')
    await semesterSelect.trigger('change')
    await flushPromises()

    // Toggle ranking
    const rankingBtn = wrapper.find('[data-testid="ranking-toggle"]')
    await rankingBtn.trigger('click')
    await flushPromises()

    const rankingStub = wrapper.findComponent({ name: 'Ranking' })
    const rankingProp = rankingStub.props('ranking')

    // Alice has 7 scores total, but one (Jul 10) is in S2.
    // Her S1 scores: 10+8+12+6+9+11 = 56 (exactly 6, so best 6 = all)
    const alice = rankingProp.find(r => r.speler === 'Alice')
    expect(alice).toBeDefined()
    expect(alice.totaal).toBe(56)

    // Eve has 6 scores in S1 (all 7 punten each) = 42
    const eve = rankingProp.find(r => r.speler === 'Eve')
    expect(eve).toBeDefined()
    expect(eve.totaal).toBe(42)

    // Bob: 10+8+12 = 30
    const bob = rankingProp.find(r => r.speler === 'Bob')
    expect(bob).toBeDefined()
    expect(bob.totaal).toBe(30)
  })

  it('assigns positions correctly (1st, 2nd, 3rd...)', async () => {
    const wrapper = await mountWithRankingData()

    const semesterSelect = wrapper.find('[data-testid="semester-select"]')
    await semesterSelect.setValue('2025-1')
    await semesterSelect.trigger('change')
    await flushPromises()

    const rankingBtn = wrapper.find('[data-testid="ranking-toggle"]')
    await rankingBtn.trigger('click')
    await flushPromises()

    const rankingStub = wrapper.findComponent({ name: 'Ranking' })
    const rankingProp = rankingStub.props('ranking')

    // Should be sorted: Alice(56), Eve(42), Bob(30), Carol(22)
    expect(rankingProp[0].speler).toBe('Alice')
    expect(rankingProp[0].plaats).toBe(1)
    expect(rankingProp[1].speler).toBe('Eve')
    expect(rankingProp[1].plaats).toBe(2)
    expect(rankingProp[2].speler).toBe('Bob')
    expect(rankingProp[2].plaats).toBe(3)
    expect(rankingProp[3].speler).toBe('Carol')
    expect(rankingProp[3].plaats).toBe(4)
  })

  it('handles ties correctly (same position for same score)', async () => {
    const wrapper = await mountWithRankingData(sampleRankingWithTies)

    const semesterSelect = wrapper.find('[data-testid="semester-select"]')
    await semesterSelect.setValue('2025-1')
    await semesterSelect.trigger('change')
    await flushPromises()

    const rankingBtn = wrapper.find('[data-testid="ranking-toggle"]')
    await rankingBtn.trigger('click')
    await flushPromises()

    const rankingStub = wrapper.findComponent({ name: 'Ranking' })
    const rankingProp = rankingStub.props('ranking')

    // Player1 and Player2 both have 10 points - should share position 1
    const p1 = rankingProp.find(r => r.speler === 'Player1')
    const p2 = rankingProp.find(r => r.speler === 'Player2')
    const p3 = rankingProp.find(r => r.speler === 'Player3')

    expect(p1.plaats).toBe(1)
    expect(p2.plaats).toBe(1)
    // Player3 should be position 3 (not 2, because 2 is tied at 1st)
    expect(p3.plaats).toBe(3)
  })

  it('excludes players with 0 total from ranking', async () => {
    const wrapper = await mountWithRankingData()

    // Set to 2025-2
    const semesterSelect = wrapper.find('[data-testid="semester-select"]')
    await semesterSelect.setValue('2025-2')
    await semesterSelect.trigger('change')
    await flushPromises()

    const rankingBtn = wrapper.find('[data-testid="ranking-toggle"]')
    await rankingBtn.trigger('click')
    await flushPromises()

    const rankingStub = wrapper.findComponent({ name: 'Ranking' })
    const rankingProp = rankingStub.props('ranking')

    // In S2, Bob and Carol have no scores, so they shouldn't appear
    const playerNames = rankingProp.map(r => r.speler)
    expect(playerNames).not.toContain('Bob')
    expect(playerNames).not.toContain('Carol')
  })
})
