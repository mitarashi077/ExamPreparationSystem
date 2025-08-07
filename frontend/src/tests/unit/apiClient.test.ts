import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { bookmarkAPI, withRetry } from '../../utils/apiClient'
import type { BookmarkItem } from '../../types/bookmark'

// Mock axios
const mockedAxios = vi.mocked(axios)
const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  interceptors: {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  },
}

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockApiClient),
  },
}))

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('bookmarkAPI', () => {
    const mockBookmark: BookmarkItem = {
      id: 'bookmark1',
      questionId: 'question1',
      categoryId: 'category1',
      categoryName: 'Test Category',
      questionContent: 'Test question?',
      difficulty: 2,
      year: 2023,
      session: '春期',
      memo: 'Test memo',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    }

    describe('getBookmarks', () => {
      it('should fetch bookmarks successfully', async () => {
        const mockResponse = {
          data: {
            data: {
              bookmarks: [mockBookmark],
              pagination: {
                page: 1,
                limit: 10,
                total: 1,
                totalPages: 1,
                hasNextPage: false,
                hasPrevPage: false,
              },
              filters: {},
            },
          },
        }
        mockApiClient.get.mockResolvedValue(mockResponse)

        const result = await bookmarkAPI.getBookmarks()

        expect(mockApiClient.get).toHaveBeenCalledWith('/bookmarks', {
          params: undefined,
        })
        expect(result).toEqual([mockBookmark])
      })

      it('should fetch bookmarks with parameters', async () => {
        const params = { categoryId: 'cat1', difficulty: 2, page: 1, limit: 5 }
        const mockResponse = {
          data: {
            data: {
              bookmarks: [mockBookmark],
              pagination: {
                page: 1,
                limit: 5,
                total: 1,
                totalPages: 1,
                hasNextPage: false,
                hasPrevPage: false,
              },
              filters: params,
            },
          },
        }
        mockApiClient.get.mockResolvedValue(mockResponse)

        const result = await bookmarkAPI.getBookmarks(params)

        expect(mockApiClient.get).toHaveBeenCalledWith('/bookmarks', { params })
        expect(result).toEqual([mockBookmark])
      })
    })

    describe('createBookmark', () => {
      it('should create bookmark successfully', async () => {
        const mockResponse = {
          data: {
            data: mockBookmark,
          },
        }
        mockApiClient.post.mockResolvedValue(mockResponse)

        const result = await bookmarkAPI.createBookmark(
          'question1',
          'Test memo',
        )

        expect(mockApiClient.post).toHaveBeenCalledWith('/bookmarks', {
          questionId: 'question1',
          memo: 'Test memo',
        })
        expect(result).toEqual(mockBookmark)
      })

      it('should create bookmark without memo', async () => {
        const mockResponse = {
          data: {
            data: { ...mockBookmark, memo: null },
          },
        }
        mockApiClient.post.mockResolvedValue(mockResponse)

        await bookmarkAPI.createBookmark('question1')

        expect(mockApiClient.post).toHaveBeenCalledWith('/bookmarks', {
          questionId: 'question1',
          memo: undefined,
        })
      })
    })

    describe('updateBookmark', () => {
      it('should update bookmark successfully', async () => {
        const updatedBookmark = { ...mockBookmark, memo: 'Updated memo' }
        const mockResponse = {
          data: {
            data: updatedBookmark,
          },
        }
        mockApiClient.put.mockResolvedValue(mockResponse)

        const result = await bookmarkAPI.updateBookmark(
          'bookmark1',
          'Updated memo',
        )

        expect(mockApiClient.put).toHaveBeenCalledWith('/bookmarks/bookmark1', {
          memo: 'Updated memo',
        })
        expect(result).toEqual(updatedBookmark)
      })
    })

    describe('deleteBookmark', () => {
      it('should delete bookmark successfully', async () => {
        mockApiClient.delete.mockResolvedValue({})

        await bookmarkAPI.deleteBookmark('bookmark1')

        expect(mockApiClient.delete).toHaveBeenCalledWith(
          '/bookmarks/bookmark1',
        )
      })
    })

    describe('checkBookmarkStatus', () => {
      it('should return bookmark status when bookmark exists', async () => {
        const mockResponse = {
          data: {
            data: {
              questionId: 'question1',
              isBookmarked: true,
              bookmarkId: 'bookmark1',
              memo: 'Test memo',
            },
          },
        }
        mockApiClient.get.mockResolvedValue(mockResponse)

        const result = await bookmarkAPI.checkBookmarkStatus('question1')

        expect(mockApiClient.get).toHaveBeenCalledWith(
          '/bookmarks/question/question1',
        )
        expect(result).toEqual({
          isBookmarked: true,
          bookmarkId: 'bookmark1',
          memo: 'Test memo',
        })
      })

      it('should return false when bookmark does not exist', async () => {
        mockApiClient.get.mockRejectedValue(new Error('Not found'))

        const result = await bookmarkAPI.checkBookmarkStatus('question1')

        expect(result).toEqual({ isBookmarked: false })
      })

      it('should handle null values in response', async () => {
        const mockResponse = {
          data: {
            data: {
              questionId: 'question1',
              isBookmarked: false,
              bookmarkId: null,
              memo: null,
            },
          },
        }
        mockApiClient.get.mockResolvedValue(mockResponse)

        const result = await bookmarkAPI.checkBookmarkStatus('question1')

        expect(result).toEqual({
          isBookmarked: false,
          bookmarkId: undefined,
          memo: undefined,
        })
      })
    })
  })

  describe('withRetry', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should succeed on first try', async () => {
      const mockOperation = vi.fn().mockResolvedValue('success')

      const result = await withRetry(mockOperation)

      expect(result).toBe('success')
      expect(mockOperation).toHaveBeenCalledTimes(1)
    })

    it('should retry on failure and eventually succeed', async () => {
      const mockOperation = vi
        .fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValue('success')

      const retryPromise = withRetry(mockOperation, 3, 10)

      // Fast forward time for retries
      vi.advanceTimersByTime(100)

      const result = await retryPromise

      expect(result).toBe('success')
      expect(mockOperation).toHaveBeenCalledTimes(3)
    })

    it('should throw after max retries', async () => {
      const mockOperation = vi
        .fn()
        .mockRejectedValue(new Error('Persistent failure'))

      const retryPromise = withRetry(mockOperation, 2, 10)

      // Fast forward time for retries
      vi.advanceTimersByTime(1000)

      await expect(retryPromise).rejects.toThrow('Persistent failure')
      expect(mockOperation).toHaveBeenCalledTimes(3) // initial + 2 retries
    })

    it('should use exponential backoff for delays', async () => {
      const mockOperation = vi.fn().mockRejectedValue(new Error('Failure'))

      const retryPromise = withRetry(mockOperation, 2, 100)

      // Check timing of retries
      setTimeout(() => {
        expect(mockOperation).toHaveBeenCalledTimes(1)
      }, 50)

      setTimeout(() => {
        expect(mockOperation).toHaveBeenCalledTimes(2)
      }, 150)

      setTimeout(() => {
        expect(mockOperation).toHaveBeenCalledTimes(3)
      }, 350)

      vi.advanceTimersByTime(1000)

      await expect(retryPromise).rejects.toThrow('Failure')
    })

    it('should handle custom retry parameters', async () => {
      const mockOperation = vi
        .fn()
        .mockRejectedValue(new Error('Custom failure'))

      const retryPromise = withRetry(mockOperation, 1, 50)

      vi.advanceTimersByTime(100)

      await expect(retryPromise).rejects.toThrow('Custom failure')
      expect(mockOperation).toHaveBeenCalledTimes(2) // initial + 1 retry
    })
  })

  describe('API client configuration', () => {
    it('should create axios instance with correct configuration', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:3001/api',
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    })

    it('should setup request and response interceptors', () => {
      expect(mockApiClient.interceptors.request.use).toHaveBeenCalled()
      expect(mockApiClient.interceptors.response.use).toHaveBeenCalled()
    })
  })
})
