// Tests for input filter composables
import { describe, it, expect, vi } from 'vitest'
import { useInputFilters } from '../composables/useInputFilters.js'

describe('useInputFilters', () => {
  describe('blokkeerLetters', () => {
    it('allows digit keys (0-9)', () => {
      const { blokkeerLetters } = useInputFilters()
      const mockEvent = { key: '5', preventDefault: vi.fn() }
      blokkeerLetters(mockEvent)
      expect(mockEvent.preventDefault).not.toHaveBeenCalled()
    })

    it('allows digit 0', () => {
      const { blokkeerLetters } = useInputFilters()
      const mockEvent = { key: '0', preventDefault: vi.fn() }
      blokkeerLetters(mockEvent)
      expect(mockEvent.preventDefault).not.toHaveBeenCalled()
    })

    it('allows digit 9', () => {
      const { blokkeerLetters } = useInputFilters()
      const mockEvent = { key: '9', preventDefault: vi.fn() }
      blokkeerLetters(mockEvent)
      expect(mockEvent.preventDefault).not.toHaveBeenCalled()
    })

    it('blocks letter keys', () => {
      const { blokkeerLetters } = useInputFilters()
      const mockEvent = { key: 'a', preventDefault: vi.fn() }
      blokkeerLetters(mockEvent)
      expect(mockEvent.preventDefault).toHaveBeenCalled()
    })

    it('blocks uppercase letter keys', () => {
      const { blokkeerLetters } = useInputFilters()
      const mockEvent = { key: 'Z', preventDefault: vi.fn() }
      blokkeerLetters(mockEvent)
      expect(mockEvent.preventDefault).toHaveBeenCalled()
    })

    it('allows Backspace key', () => {
      const { blokkeerLetters } = useInputFilters()
      const mockEvent = { key: 'Backspace', preventDefault: vi.fn() }
      blokkeerLetters(mockEvent)
      expect(mockEvent.preventDefault).not.toHaveBeenCalled()
    })

    it('allows Tab key', () => {
      const { blokkeerLetters } = useInputFilters()
      const mockEvent = { key: 'Tab', preventDefault: vi.fn() }
      blokkeerLetters(mockEvent)
      expect(mockEvent.preventDefault).not.toHaveBeenCalled()
    })

    it('allows ArrowLeft key', () => {
      const { blokkeerLetters } = useInputFilters()
      const mockEvent = { key: 'ArrowLeft', preventDefault: vi.fn() }
      blokkeerLetters(mockEvent)
      expect(mockEvent.preventDefault).not.toHaveBeenCalled()
    })

    it('allows ArrowRight key', () => {
      const { blokkeerLetters } = useInputFilters()
      const mockEvent = { key: 'ArrowRight', preventDefault: vi.fn() }
      blokkeerLetters(mockEvent)
      expect(mockEvent.preventDefault).not.toHaveBeenCalled()
    })

    it('allows Delete key', () => {
      const { blokkeerLetters } = useInputFilters()
      const mockEvent = { key: 'Delete', preventDefault: vi.fn() }
      blokkeerLetters(mockEvent)
      expect(mockEvent.preventDefault).not.toHaveBeenCalled()
    })

    it('allows Home key', () => {
      const { blokkeerLetters } = useInputFilters()
      const mockEvent = { key: 'Home', preventDefault: vi.fn() }
      blokkeerLetters(mockEvent)
      expect(mockEvent.preventDefault).not.toHaveBeenCalled()
    })

    it('allows End key', () => {
      const { blokkeerLetters } = useInputFilters()
      const mockEvent = { key: 'End', preventDefault: vi.fn() }
      blokkeerLetters(mockEvent)
      expect(mockEvent.preventDefault).not.toHaveBeenCalled()
    })

    it('blocks special character @', () => {
      const { blokkeerLetters } = useInputFilters()
      const mockEvent = { key: '@', preventDefault: vi.fn() }
      blokkeerLetters(mockEvent)
      expect(mockEvent.preventDefault).toHaveBeenCalled()
    })

    it('blocks special character #', () => {
      const { blokkeerLetters } = useInputFilters()
      const mockEvent = { key: '#', preventDefault: vi.fn() }
      blokkeerLetters(mockEvent)
      expect(mockEvent.preventDefault).toHaveBeenCalled()
    })

    it('blocks special character $', () => {
      const { blokkeerLetters } = useInputFilters()
      const mockEvent = { key: '$', preventDefault: vi.fn() }
      blokkeerLetters(mockEvent)
      expect(mockEvent.preventDefault).toHaveBeenCalled()
    })

    it('blocks space character', () => {
      const { blokkeerLetters } = useInputFilters()
      const mockEvent = { key: ' ', preventDefault: vi.fn() }
      blokkeerLetters(mockEvent)
      expect(mockEvent.preventDefault).toHaveBeenCalled()
    })
  })
})
