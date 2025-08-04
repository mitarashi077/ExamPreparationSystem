import axios, { AxiosInstance, AxiosResponse } from 'axios'
import type { BookmarkItem } from '../types/bookmark'
import type { StudyGoal, GoalProgress, GoalAchievement, GoalStatistics, CreateGoalRequest, UpdateGoalRequest, GoalFilters } from '../types/goal'

// API base configuration
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001/api'

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor for adding authentication or common headers
apiClient.interceptors.request.use(
  (config) => {
    // Add common headers or authentication tokens here if needed
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
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
  }
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

// Essay Answer types
interface EssayAnswer {
  id: string
  content: string
  timeSpent?: number
  deviceType?: string
  isDraft: boolean
  score?: number
  feedback?: string
  createdAt: string
  updatedAt: string
}

interface EssaySubmissionResponse {
  id: string
  content: string
  timeSpent?: number
  isDraft: boolean
  createdAt: string
  maxScore?: number
  message: string
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
    const response = await apiClient.get<ApiResponse<BookmarkListResponse>>('/bookmarks', {
      params
    })
    return response.data.data.bookmarks
  },

  // Create a new bookmark
  async createBookmark(questionId: string, memo?: string): Promise<BookmarkItem> {
    const response = await apiClient.post<ApiResponse<BookmarkItem>>('/bookmarks', {
      questionId,
      memo: memo || undefined
    })
    return response.data.data
  },

  // Update bookmark memo
  async updateBookmark(bookmarkId: string, memo: string): Promise<BookmarkItem> {
    const response = await apiClient.put<ApiResponse<BookmarkItem>>(`/bookmarks/${bookmarkId}`, {
      memo
    })
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
        `/bookmarks/question/${questionId}`
      )
      const { isBookmarked, bookmarkId, memo } = response.data.data
      return {
        isBookmarked,
        bookmarkId: bookmarkId || undefined,
        memo: memo || undefined
      }
    } catch (error) {
      // If question not found or no bookmark, return false
      return { isBookmarked: false }
    }
  }
}

// Essay Answer API functions
export const essayAPI = {
  // Submit essay answer
  async submitEssayAnswer(
    questionId: string, 
    content: string, 
    timeSpent?: number,
    deviceType?: string
  ): Promise<EssaySubmissionResponse> {
    const response = await apiClient.post<EssaySubmissionResponse>('/essays/submit', {
      questionId,
      content,
      timeSpent,
      deviceType
    })
    return response.data
  },

  // Save essay draft
  async saveEssayDraft(
    questionId: string, 
    content: string, 
    timeSpent?: number,
    deviceType?: string
  ): Promise<EssaySubmissionResponse> {
    const response = await apiClient.post<EssaySubmissionResponse>('/essays/draft', {
      questionId,
      content,
      timeSpent,
      deviceType
    })
    return response.data
  },

  // Get essay draft
  async getEssayDraft(questionId: string): Promise<EssayAnswer> {
    const response = await apiClient.get<EssayAnswer>(`/essays/draft/${questionId}`)
    return response.data
  },

  // Get submitted essay answer
  async getEssayAnswer(questionId: string): Promise<EssayAnswer & {
    maxScore?: number
    sampleAnswer?: string
  }> {
    const response = await apiClient.get<EssayAnswer & {
      maxScore?: number
      sampleAnswer?: string
    }>(`/essays/${questionId}`)
    return response.data
  },

  // Grade essay answer (admin only)
  async gradeEssayAnswer(answerId: string, score?: number, feedback?: string): Promise<{
    id: string
    score?: number
    feedback?: string
    maxScore?: number
    updatedAt: string
    message: string
  }> {
    const response = await apiClient.put<{
      id: string
      score?: number
      feedback?: string
      maxScore?: number
      updatedAt: string
      message: string
    }>(`/essays/grade/${answerId}`, {
      score,
      feedback
    })
    return response.data
  }
}

// Retry utility for failed requests
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
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
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
    }
  }
  
  throw lastError!
}

// Goal API functions
export const goalAPI = {
  // Get all goals with filtering
  async getGoals(filters?: GoalFilters): Promise<StudyGoal[]> {
    const response = await apiClient.get<ApiResponse<StudyGoal[]>>('/goals', {
      params: filters
    })
    return response.data.data
  },

  // Create a new goal
  async createGoal(data: CreateGoalRequest): Promise<StudyGoal> {
    const response = await apiClient.post<ApiResponse<StudyGoal>>('/goals', data)
    return response.data.data
  },

  // Update a goal
  async updateGoal(id: string, data: UpdateGoalRequest): Promise<StudyGoal> {
    const response = await apiClient.put<ApiResponse<StudyGoal>>(`/goals/${id}`, data)
    return response.data.data
  },

  // Delete a goal
  async deleteGoal(id: string): Promise<void> {
    await apiClient.delete(`/goals/${id}`)
  },

  // Get goal progress history
  async getGoalProgress(goalId: string): Promise<GoalProgress[]> {
    const response = await apiClient.get<ApiResponse<GoalProgress[]>>(`/goals/${goalId}/progress`)
    return response.data.data
  },

  // Record progress for a goal
  async recordProgress(goalId: string, value: number, notes?: string): Promise<GoalProgress> {
    const response = await apiClient.post<ApiResponse<GoalProgress>>(`/goals/${goalId}/progress`, {
      value,
      notes
    })
    return response.data.data
  },

  // Increment goal progress
  async incrementProgress(goalId: string, increment: number): Promise<StudyGoal> {
    const response = await apiClient.post<ApiResponse<StudyGoal>>(`/goals/${goalId}/increment`, {
      increment
    })
    return response.data.data
  },

  // Get achievements
  async getAchievements(): Promise<GoalAchievement[]> {
    const response = await apiClient.get<ApiResponse<GoalAchievement[]>>('/goals/achievements')
    return response.data.data
  },

  // Get goal statistics
  async getStatistics(): Promise<GoalStatistics> {
    const response = await apiClient.get<ApiResponse<GoalStatistics>>('/goals/statistics')
    return response.data.data
  },

  // Update goal progress from activity (automatic tracking)
  async updateFromActivity(activityType: string, value: number, categoryId?: string): Promise<void> {
    await apiClient.post('/goals/activity', {
      activityType,
      value,
      categoryId
    })
  }
}

export default apiClient
