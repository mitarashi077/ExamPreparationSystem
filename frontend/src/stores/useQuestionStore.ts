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
  questionType?: 'multiple_choice' | 'essay' // 問題タイプ追加
  maxScore?: number // 記述式問題の満点
  sampleAnswer?: string // 記述式問題のサンプル回答
}

export interface EssayAnswer {
  id: string
  content: string // Markdown形式の回答内容
  timeSpent: number
  isDraft: boolean
  createdAt: string
  updatedAt: string
  score?: number // 採点結果
  feedback?: string // フィードバック
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

  // Essay question data
  currentEssayAnswer: EssayAnswer | null
  essayContent: string
  isEssayPreview: boolean
  essayDrafts: Map<string, EssayAnswer> // questionId -> draft

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

  // Essay actions
  setEssayContent: (content: string) => void
  setEssayPreview: (isPreview: boolean) => void
  saveEssayDraft: (questionId: string) => void
  loadEssayDraft: (questionId: string) => void
  submitEssayAnswer: (questionId: string) => void
  setCurrentEssayAnswer: (answer: EssayAnswer) => void
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

      // Essay initial state
      currentEssayAnswer: null,
      essayContent: '',
      isEssayPreview: false,
      essayDrafts: new Map(),

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
        const shuffledAnswers =
          question.questionType === 'essay'
            ? []
            : [...question.choices].sort(() => Math.random() - 0.5)
        set({
          currentQuestion: question,
          currentAnswers: shuffledAnswers, // Shuffle choices for multiple choice only
          selectedChoiceId: null,
          userAnswer: null,
          showResult: false,
          // Reset essay state when switching questions
          essayContent: '',
          isEssayPreview: false,
          currentEssayAnswer: null,
        })

        // Load draft for essay questions
        if (question.questionType === 'essay') {
          const state = get()
          const draft = state.essayDrafts.get(question.id)
          if (draft) {
            set({ essayContent: draft.content })
          }
        }
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
          },
        })
      },

      startQuestion: () => {
        set({ questionStartTime: Date.now() })
      },

      endQuestion: (isCorrect) => {
        const state = get()
        const timeSpent = state.questionStartTime
          ? Date.now() - state.questionStartTime
          : 0

        set({
          sessionStats: {
            totalQuestions: state.sessionStats.totalQuestions + 1,
            correctAnswers:
              state.sessionStats.correctAnswers + (isCorrect ? 1 : 0),
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
          filters: { ...state.filters, ...filters },
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
          // Reset essay state
          currentEssayAnswer: null,
          essayContent: '',
          isEssayPreview: false,
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
          // Reset essay session state but keep drafts
        })
      },

      // Essay actions implementation
      setEssayContent: (content) => {
        set({ essayContent: content })
      },

      setEssayPreview: (isPreview) => {
        set({ isEssayPreview: isPreview })
      },

      saveEssayDraft: (questionId) => {
        const state = get()
        if (!state.essayContent.trim()) return

        const draft: EssayAnswer = {
          id: `draft-${questionId}-${Date.now()}`,
          content: state.essayContent,
          timeSpent: state.questionStartTime
            ? Date.now() - state.questionStartTime
            : 0,
          isDraft: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        const newDrafts = new Map(state.essayDrafts)
        newDrafts.set(questionId, draft)
        set({ essayDrafts: newDrafts })
      },

      loadEssayDraft: (questionId) => {
        const state = get()
        const draft = state.essayDrafts.get(questionId)
        if (draft) {
          set({ essayContent: draft.content })
        }
      },

      submitEssayAnswer: (questionId) => {
        const state = get()
        if (!state.essayContent.trim()) return

        const answer: EssayAnswer = {
          id: `answer-${questionId}-${Date.now()}`,
          content: state.essayContent,
          timeSpent: state.questionStartTime
            ? Date.now() - state.questionStartTime
            : 0,
          isDraft: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        set({
          currentEssayAnswer: answer,
          showResult: true,
        })

        // Remove draft after submission
        const newDrafts = new Map(state.essayDrafts)
        newDrafts.delete(questionId)
        set({ essayDrafts: newDrafts })
      },

      setCurrentEssayAnswer: (answer) => {
        set({ currentEssayAnswer: answer })
      },
    }),
    {
      name: 'question-storage',
      partialize: (state) => ({
        sessionStats: state.sessionStats,
        filters: state.filters,
        essayDrafts: Array.from(state.essayDrafts.entries()), // Map to Array for persistence
      }),
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray((state as any).essayDrafts)) {
          // Convert Array back to Map
          state.essayDrafts = new Map((state as any).essayDrafts)
        }
      },
    },
  ),
)
