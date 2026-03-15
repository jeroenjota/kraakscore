// Tests for PDF generation and upload
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import App from '../App.vue'
import dbService from '../services/dbServices.js'
import { sampleToernooien, sampleToernooiDetail } from './fixtures/tournaments.js'
import { sampleSavedTeamsFromApi } from './fixtures/teams.js'
import { uitslagPDF } from '../utils/pdf/tournamentPDF.js'
import { rankingPDF } from '../utils/pdf/rankingPDF.js'

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
      Tournament: {
        name: 'Tournament',
        template: '<div data-testid="tournament-stub" />',
        emits: ['saveToernooi'],
      },
      SelectPlayers: {
        name: 'SelectPlayers',
        template: '<div />',
        emits: ['addTeam'],
      },
      Qrcode: { name: 'Qrcode', template: '<div data-testid="qrcode-stub" />' },
    },
  },
}

async function mountAndStartTournament() {
  dbService.checkServer.mockResolvedValue({ success: true })
  dbService.fetchToernooien.mockResolvedValue({ success: true, data: [...sampleToernooien] })
  dbService.fetchSavedTeams.mockResolvedValue({ success: true, data: [...sampleSavedTeamsFromApi] })
  dbService.fetchAllPlayers.mockResolvedValue({ success: true, data: [] })
  dbService.fetchRanking.mockResolvedValue({ success: true, data: [] })
  dbService.getToernooiIdByDate.mockResolvedValue({ success: true, data: null })
  dbService.saveStandardTeams.mockResolvedValue({ success: true, data: {} })
  dbService.pdfExists.mockResolvedValue(false)
  dbService.uploadPDF.mockResolvedValue({ success: true, data: { url: 'http://test/pdf.pdf' } })
  mockDialogOpen.mockResolvedValue(true)

  const wrapper = mount(App, globalStubs)
  await flushPromises()

  // Add 4 teams and start
  const selectPlayers = wrapper.findComponent({ name: 'SelectPlayers' })
  for (let i = 1; i <= 4; i++) {
    await selectPlayers.vm.$emit('addTeam', `P${i}A/P${i}B`)
    await flushPromises()
  }

  const startBtn = wrapper.find('[data-testid="start-button"]')
  await startBtn.trigger('click')
  await flushPromises()

  return wrapper
}

describe('PDF Generation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDialogOpen.mockResolvedValue(true)
  })

  it('shows PDF button when tournament is started', async () => {
    const wrapper = await mountAndStartTournament()
    expect(wrapper.find('[data-testid="pdf-button"]').exists()).toBe(true)
  })

  it('calls PDF generation utilities when clicking PDF button', async () => {
    const wrapper = await mountAndStartTournament()

    const pdfBtn = wrapper.find('[data-testid="pdf-button"]')
    await pdfBtn.trigger('click')
    await flushPromises()

    expect(uitslagPDF).toHaveBeenCalled()
    expect(rankingPDF).toHaveBeenCalled()
  })

  it('uploads PDF to server after generation', async () => {
    const wrapper = await mountAndStartTournament()

    const pdfBtn = wrapper.find('[data-testid="pdf-button"]')
    await pdfBtn.trigger('click')
    await flushPromises()

    expect(dbService.uploadPDF).toHaveBeenCalled()
  })

  it('checks if PDF already exists before generating', async () => {
    dbService.pdfExists.mockResolvedValue(true)
    // Dialog for "PDF exists, recreate?" -> yes
    mockDialogOpen.mockResolvedValue(true)

    const wrapper = await mountAndStartTournament()

    const pdfBtn = wrapper.find('[data-testid="pdf-button"]')
    await pdfBtn.trigger('click')
    await flushPromises()

    expect(dbService.pdfExists).toHaveBeenCalled()
  })

  it('opens existing PDF if user declines to regenerate', async () => {
    const wrapper = await mountAndStartTournament()

    // Set mocks AFTER mountAndStartTournament (which overrides pdfExists to false)
    dbService.pdfExists.mockResolvedValue(true)
    // "PDF exists, recreate?" -> no
    mockDialogOpen.mockResolvedValueOnce(false)

    const pdfBtn = wrapper.find('[data-testid="pdf-button"]')
    await pdfBtn.trigger('click')
    await flushPromises()

    // Should open existing PDF instead of regenerating
    expect(dbService.openPDF).toHaveBeenCalled()
    // Should NOT upload a new one
    expect(dbService.uploadPDF).not.toHaveBeenCalled()
  })
})
