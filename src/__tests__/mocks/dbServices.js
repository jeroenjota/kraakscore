// Mock for src/services/dbServices.js
// Each method returns { success: true, data: ... } by default.
// Tests can override specific methods with vi.mocked(dbService.xxx).mockResolvedValueOnce(...)

import { vi } from 'vitest'

const dbService = {
  checkServer: vi.fn().mockResolvedValue({ success: true }),

  fetchToernooien: vi.fn().mockResolvedValue({
    success: true,
    data: [],
  }),

  fetchToernooi: vi.fn().mockResolvedValue({
    success: true,
    data: {},
  }),

  getToernooiIdByDate: vi.fn().mockResolvedValue({
    success: true,
    data: null,
  }),

  fetchAllPlayers: vi.fn().mockResolvedValue({
    success: true,
    data: [],
  }),

  saveToernooi: vi.fn().mockResolvedValue({
    success: true,
    data: { id: 99, message: 'Toernooi opgeslagen' },
  }),

  updateToernooi: vi.fn().mockResolvedValue({
    success: true,
    data: { message: 'Toernooi bijgewerkt' },
  }),

  deleteToernooi: vi.fn().mockResolvedValue({
    success: true,
    data: { message: 'Toernooi verwijderd' },
  }),

  fetchSavedTeams: vi.fn().mockResolvedValue({
    success: true,
    data: [],
  }),

  saveStandardTeams: vi.fn().mockResolvedValue({
    success: true,
    data: { message: 'Teams opgeslagen' },
  }),

  cleanTeamsAndPlayers: vi.fn().mockResolvedValue({
    success: true,
    data: { success: true, aantal: 0, items: { teams: [], spelers: [] } },
  }),

  fetchRanking: vi.fn().mockResolvedValue({
    success: true,
    data: [],
  }),

  uploadPDF: vi.fn().mockResolvedValue({
    success: true,
    data: { url: 'http://localhost/pdfs/test.pdf', filename: 'test.pdf' },
  }),

  pdfExists: vi.fn().mockResolvedValue(false),

  openPDF: vi.fn(),
}

export default dbService
export const apiClient = { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() }
