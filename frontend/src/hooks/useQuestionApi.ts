import { useState, useCallback } from 'react'
import { Question, QuestionSummary, UserAnswer } from '../stores/useQuestionStore'

const API_BASE_URL = '/api'

interface QuestionListResponse {
  questions: QuestionSummary[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

interface QuestionDetailResponse {
  question: Question
  userAnswer?: UserAnswer
}

interface SubmitAnswerResponse {
  answerId: string
  isCorrect: boolean
  correctChoiceId: string
  explanation?: string
  timeSpent?: number
}

export const useQuestionApi = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchQuestions = useCallback(async (
    page = 1,
    limit = 10,
    filters: {
      categoryId?: string
      difficulty?: number
      onlyUnanswered?: boolean
      onlyIncorrect?: boolean
      search?: string
    } = {}
  ): Promise<QuestionListResponse | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...Object.entries(filters).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            acc[key] = value.toString()
          }
          return acc
        }, {} as Record<string, string>)
      })

      const response = await fetch(`${API_BASE_URL}/questions?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch questions'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchQuestionById = useCallback(async (id: string): Promise<Question | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_BASE_URL}/questions/${id}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: QuestionDetailResponse = await response.json()
      return data.question
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch question'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchRandomQuestion = useCallback(async (filters: {
    categoryId?: string
    difficulty?: number
    excludeAnswered?: boolean
  } = {}): Promise<Question | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams(
        Object.entries(filters).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            acc[key] = value.toString()
          }
          return acc
        }, {} as Record<string, string>)
      )

      const response = await fetch(`${API_BASE_URL}/questions/random?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: QuestionDetailResponse = await response.json()
      return data.question
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch random question'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const submitAnswer = useCallback(async (
    questionId: string,
    choiceId: string,
    timeSpent?: number,
    deviceType?: string
  ): Promise<SubmitAnswerResponse | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_BASE_URL}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId,
          choiceId,
          timeSpent,
          deviceType,
        }),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit answer'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_BASE_URL}/categories`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch categories'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    fetchQuestions,
    fetchQuestionById,
    fetchRandomQuestion,
    submitAnswer,
    fetchCategories,
  }
}