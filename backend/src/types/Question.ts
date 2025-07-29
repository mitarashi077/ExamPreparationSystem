export interface Choice {
  id: string
  content: string
  isCorrect: boolean
}

export interface Question {
  id: string
  content: string
  explanation?: string
  difficulty: number
  year?: number
  session?: string
  categoryId: string
  choices: Choice[]
}

export interface QuestionSummary {
  id: string
  content: string
  difficulty: number
  categoryId: string
  categoryName: string
  hasAnswered?: boolean
  isCorrect?: boolean
}

export interface QuestionListResponse {
  questions: QuestionSummary[]
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
    onlyUnanswered?: boolean
    onlyIncorrect?: boolean
  }
}

export interface QuestionDetailResponse {
  question: Question
  userAnswer?: {
    id: string
    isCorrect: boolean
    timeSpent?: number
    createdAt: string
  }
}