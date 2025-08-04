export interface Choice {
  id: string
  content: string
  isCorrect: boolean
}

export interface QuestionSection {
  id: string
  questionId: string
  title: string
  content: string
  order: number
  sectionType: 'introduction' | 'main' | 'subsection' | 'conclusion'
  hasImage: boolean
  hasTable: boolean
  hasCode: boolean
  createdAt: string
  updatedAt: string
}

export interface Question {
  id: string
  content: string
  explanation?: string
  difficulty: number
  year?: number
  session?: string
  categoryId: string
  questionType?: 'multiple_choice' | 'essay' | 'long_form'
  maxScore?: number
  sampleAnswer?: string
  hasImages?: boolean
  hasTables?: boolean
  hasCodeBlocks?: boolean
  readingTime?: number
  sections?: QuestionSection[]
  choices: Choice[]
}

export interface EssayAnswer {
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
  essayAnswer?: EssayAnswer
}