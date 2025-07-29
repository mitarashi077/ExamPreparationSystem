import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

export interface UserAnswer {
  id: string
  isCorrect: boolean
  timeSpent?: number
  createdAt: string
}

interface QuestionState {
  // Current question data
  currentQuestion: Question | null
  currentAnswers: Choice[]
  selectedChoiceId: string | null
  userAnswer: UserAnswer | null
  showResult: boolean
  
  // Question list
  questions: QuestionSummary[]
  currentQuestionIndex: number
  
  // Study session
  sessionStartTime: number | null
  questionStartTime: number | null
  sessionStats: {
    totalQuestions: number
    correctAnswers: number
    totalTime: number
  }
  
  // Filters
  filters: {
    categoryId?: string
    difficulty?: number
    onlyUnanswered?: boolean
    onlyIncorrect?: boolean
  }
  
  // Actions
  setCurrentQuestion: (question: Question) => void
  setSelectedChoice: (choiceId: string) => void
  setUserAnswer: (answer: UserAnswer) => void
  setShowResult: (show: boolean) => void
  setQuestions: (questions: QuestionSummary[]) => void
  setCurrentQuestionIndex: (index: number) => void
  startSession: () => void
  startQuestion: () => void
  endQuestion: (isCorrect: boolean) => void
  endSession: () => void
  setFilters: (filters: Partial<QuestionState['filters']>) => void
  resetQuestion: () => void
  resetSession: () => void
}

export const useQuestionStore = create<QuestionState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentQuestion: null,
      currentAnswers: [],
      selectedChoiceId: null,
      userAnswer: null,
      showResult: false,
      questions: [],
      currentQuestionIndex: 0,
      sessionStartTime: null,
      questionStartTime: null,
      sessionStats: {
        totalQuestions: 0,
        correctAnswers: 0,
        totalTime: 0,
      },
      filters: {},
      
      // Actions
      setCurrentQuestion: (question) => {
        const shuffledAnswers = [...question.choices].sort(() => Math.random() - 0.5)
        set({ 
          currentQuestion: question,
          currentAnswers: shuffledAnswers, // Shuffle choices
          selectedChoiceId: null,
          userAnswer: null,
          showResult: false,
        })
      },
      
      setSelectedChoice: (choiceId) => {
        set({ selectedChoiceId: choiceId })
      },
      
      setUserAnswer: (answer) => {
        set({ userAnswer: answer, showResult: true })
      },
      
      setShowResult: (show) => {
        set({ showResult: show })
      },
      
      setQuestions: (questions) => {
        set({ questions, currentQuestionIndex: 0 })
      },
      
      setCurrentQuestionIndex: (index) => {
        set({ currentQuestionIndex: index })
      },
      
      startSession: () => {
        set({ 
          sessionStartTime: Date.now(),
          sessionStats: {
            totalQuestions: 0,
            correctAnswers: 0,
            totalTime: 0,
          }
        })
      },
      
      startQuestion: () => {
        set({ questionStartTime: Date.now() })
      },
      
      endQuestion: (isCorrect) => {
        const state = get()
        const timeSpent = state.questionStartTime ? Date.now() - state.questionStartTime : 0
        
        set({
          sessionStats: {
            totalQuestions: state.sessionStats.totalQuestions + 1,
            correctAnswers: state.sessionStats.correctAnswers + (isCorrect ? 1 : 0),
            totalTime: state.sessionStats.totalTime + timeSpent,
          },
          questionStartTime: null,
        })
      },
      
      endSession: () => {
        set({ 
          sessionStartTime: null,
          questionStartTime: null,
        })
      },
      
      setFilters: (filters) => {
        set((state) => ({
          filters: { ...state.filters, ...filters }
        }))
      },
      
      resetQuestion: () => {
        set({
          currentQuestion: null,
          currentAnswers: [],
          selectedChoiceId: null,
          userAnswer: null,
          showResult: false,
          questionStartTime: null,
        })
      },
      
      resetSession: () => {
        set({
          questions: [],
          currentQuestionIndex: 0,
          sessionStartTime: null,
          questionStartTime: null,
          sessionStats: {
            totalQuestions: 0,
            correctAnswers: 0,
            totalTime: 0,
          },
        })
      },
    }),
    {
      name: 'question-storage',
      partialize: (state) => ({
        sessionStats: state.sessionStats,
        filters: state.filters,
      }),
    }
  )
)