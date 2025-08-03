import { describe, it, expect, vi, beforeEach } from 'vitest'
import { bookmarkAPI, withRetry } from '../../utils/apiClient'

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      }
    }))
  }
}))

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('withRetry', () => {
    it('should succeed on first try', async () => {
      const mockOperation = vi.fn().mockResolvedValue('success')
      
      const result = await withRetry(mockOperation)
      
      expect(result).toBe('success')
      expect(mockOperation).toHaveBeenCalledTimes(1)
    })

    it('should retry on failure and eventually succeed', async () => {
      const mockOperation = vi.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValue('success')
      
      const result = await withRetry(mockOperation, 3, 10) // 3 retries, 10ms delay
      
      expect(result).toBe('success')
      expect(mockOperation).toHaveBeenCalledTimes(3)
    })

    it('should throw after max retries', async () => {
      const mockOperation = vi.fn().mockRejectedValue(new Error('Persistent failure'))
      
      await expect(withRetry(mockOperation, 2, 10)).rejects.toThrow('Persistent failure')
      expect(mockOperation).toHaveBeenCalledTimes(3) // initial + 2 retries
    })
  })

  describe('bookmarkAPI configuration', () => {
    it('should be properly configured', () => {
      expect(bookmarkAPI).toBeDefined()
      expect(bookmarkAPI.getBookmarks).toBeTypeOf('function')
      expect(bookmarkAPI.createBookmark).toBeTypeOf('function')
      expect(bookmarkAPI.updateBookmark).toBeTypeOf('function')
      expect(bookmarkAPI.deleteBookmark).toBeTypeOf('function')
      expect(bookmarkAPI.checkBookmarkStatus).toBeTypeOf('function')
    })
  })
})
