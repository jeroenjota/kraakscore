// Tests for utility functions
import { describe, it, expect } from 'vitest'
import { cleanTeamName } from '../utils/editUtils.js'
import { niceDate, stripTime, getSemester } from '../utils/dateUtils.js'

describe('editUtils', () => {
  describe('cleanTeamName', () => {
    it('replaces space with / and capitalizes names', () => {
      expect(cleanTeamName('alice bob')).toBe('Alice/Bob')
    })

    it('replaces comma with / and sorts alphabetically', () => {
      expect(cleanTeamName('bob,alice')).toBe('Alice/Bob')
    })

    it('replaces dash with / and sorts alphabetically', () => {
      expect(cleanTeamName('bob-alice')).toBe('Alice/Bob')
    })

    it('normalizes all-caps names', () => {
      expect(cleanTeamName('ALICE/BOB')).toBe('Alice/Bob')
    })

    it('keeps 2-char names fully uppercase and sorts', () => {
      expect(cleanTeamName('jk/alice')).toBe('Alice/JK')
    })

    it('keeps both names uppercase when both are ≤2 chars', () => {
      expect(cleanTeamName('ab/cd')).toBe('AB/CD')
    })

    it('returns already clean name unchanged', () => {
      expect(cleanTeamName('Alice/Bob')).toBe('Alice/Bob')
    })

    it('sorts names alphabetically', () => {
      expect(cleanTeamName('bob/alice')).toBe('Alice/Bob')
    })

    it('handles single name without separator', () => {
      expect(cleanTeamName('alice')).toBe('Alice')
    })

    it('handles multiple separators', () => {
      expect(cleanTeamName('alice-bob,charlie')).toBe('Alice/Bob/Charlie')
    })

    it('handles names with numbers', () => {
      expect(cleanTeamName('alice1/bob2')).toBe('Alice1/Bob2')
    })
  })
})

describe('dateUtils', () => {
  describe('niceDate', () => {
    it('formats date with day and month in Dutch locale', () => {
      const date = new Date('2025-03-15')
      const result = niceDate(date)
      // Should contain day number and month abbreviation
      expect(result).toMatch(/15/)
      expect(result).toMatch(/mrt/)
    })

    it('includes year when jaar=true', () => {
      const date = new Date('2025-03-15')
      const result = niceDate(date, true)
      expect(result).toMatch(/2025/)
    })

    it('returns empty string for null', () => {
      expect(niceDate(null)).toBe('')
    })

    it('returns empty string for undefined', () => {
      expect(niceDate(undefined)).toBe('')
    })

    it('returns empty string for false', () => {
      expect(niceDate(false)).toBe('')
    })
  })

  describe('stripTime', () => {
    it('removes time component and returns date at midnight', () => {
      const date = new Date('2025-03-15T14:30:45')
      const result = stripTime(date)
      expect(result.getHours()).toBe(0)
      expect(result.getMinutes()).toBe(0)
      expect(result.getSeconds()).toBe(0)
      expect(result.getDate()).toBe(15)
      expect(result.getMonth()).toBe(2) // March is month 2 (0-indexed)
      expect(result.getFullYear()).toBe(2025)
    })

    it('returns null for invalid date', () => {
      const result = stripTime('invalid-date')
      expect(result).toBeNull()
    })

    it('handles date string input', () => {
      const result = stripTime('2025-03-15')
      expect(result).not.toBeNull()
      expect(result.getHours()).toBe(0)
    })
  })

  describe('getSemester', () => {
    it('returns 1e semester for January', () => {
      const date = new Date('2025-01-15')
      expect(getSemester(date)).toBe('1e semester')
    })

    it('returns 1e semester for June', () => {
      const date = new Date('2025-06-15')
      expect(getSemester(date)).toBe('1e semester')
    })

    it('returns 2e semester for July', () => {
      const date = new Date('2025-07-15')
      expect(getSemester(date)).toBe('2e semester')
    })

    it('returns 2e semester for December', () => {
      const date = new Date('2025-12-15')
      expect(getSemester(date)).toBe('2e semester')
    })

    it('includes year when jaar=true', () => {
      const date = new Date('2025-03-15')
      const result = getSemester(date, true)
      expect(result).toBe('1e semester 2025')
    })

    it('includes year for second semester when jaar=true', () => {
      const date = new Date('2025-09-15')
      const result = getSemester(date, true)
      expect(result).toBe('2e semester 2025')
    })
  })
})
