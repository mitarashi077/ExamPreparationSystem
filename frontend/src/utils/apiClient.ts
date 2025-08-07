import axios, { AxiosInstance, AxiosResponse } from 'axios'
import type { BookmarkItem } from '../types/bookmark'

// API base configuration
const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001/api'

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for adding authentication or common headers
apiClient.interceptors.request.use(
  (config) => {
    // Add common headers or authentication tokens here if needed
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor for handling common error scenarios
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error) => {
    // Handle common error scenarios
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout')
      throw new Error('リクエストがタイムアウトしました')
    }

    if (!error.response) {
      console.error('Network error:', error.message)
      throw new Error('ネットワークエラーが発生しました')
    }

    const { status, data } = error.response

    switch (status) {
      case 400:
        throw new Error(data?.error || '不正なリクエストです')
      case 404:
        throw new Error(data?.error || 'リソースが見つかりません')
      case 409:
        throw new Error(data?.error || '既に存在します')
      case 500:
        throw new Error('サーバーエラーが発生しました')
      default:
        throw new Error(data?.error || `エラーが発生しました (${status})`)
    }
  },
)

// API response types
interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
}

interface BookmarkListResponse {
  bookmarks: BookmarkItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  filters: {
    categoryId?: string
    difficulty?: number
    search?: string
  }
}

interface BookmarkStatusResponse {
  questionId: string
  isBookmarked: boolean
  bookmarkId: string | null
  memo: string | null
}

// Bookmark API functions
export const bookmarkAPI = {
  // Get all bookmarks with filtering and pagination
  async getBookmarks(params?: {
    categoryId?: string
    difficulty?: number
    search?: string
    page?: number
    limit?: number
  }): Promise<BookmarkItem[]> {
    const response = await apiClient.get<ApiResponse<BookmarkListResponse>>(
      '/bookmarks',
      {
        params,
      },
    )
    return response.data.data.bookmarks
  },

  // Create a new bookmark
  async createBookmark(
    questionId: string,
    memo?: string,
  ): Promise<BookmarkItem> {
    const response = await apiClient.post<ApiResponse<BookmarkItem>>(
      '/bookmarks',
      {
        questionId,
        memo: memo || undefined,
      },
    )
    return response.data.data
  },

  // Update bookmark memo
  async updateBookmark(
    bookmarkId: string,
    memo: string,
  ): Promise<BookmarkItem> {
    const response = await apiClient.put<ApiResponse<BookmarkItem>>(
      `/bookmarks/${bookmarkId}`,
      {
        memo,
      },
    )
    return response.data.data
  },

  // Delete a bookmark
  async deleteBookmark(bookmarkId: string): Promise<void> {
    await apiClient.delete(`/bookmarks/${bookmarkId}`)
  },

  // Check if a question is bookmarked
  async checkBookmarkStatus(questionId: string): Promise<{
    isBookmarked: boolean
    bookmarkId?: string
    memo?: string
  }> {
    try {
      const response = await apiClient.get<ApiResponse<BookmarkStatusResponse>>(
        `/bookmarks/question/${questionId}`,
      )
      const { isBookmarked, bookmarkId, memo } = response.data.data
      return {
        isBookmarked,
        bookmarkId: bookmarkId || undefined,
        memo: memo || undefined,
      }
    } catch (error) {
      // If question not found or no bookmark, return false
      return { isBookmarked: false }
    }
  },
}

// Retry utility for failed requests
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
): Promise<T> => {
  let lastError: Error

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error

      if (i === maxRetries) {
        throw lastError
      }

      // Wait before retrying
      await new Promise((resolve) =>
        setTimeout(resolve, delay * Math.pow(2, i)),
      )
    }
  }

  throw lastError!
}

export default apiClient
