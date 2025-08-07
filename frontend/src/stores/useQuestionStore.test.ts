import { act, renderHook } from '@testing-library/react'
import { vi } from 'vitest'
import {
  useQuestionStore,
  type Question,
  type QuestionSummary,
  type Choice,
  type UserAnswer,
} from './useQuestionStore'

// Mock localStorage for persist middleware
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('useQuestionStore', () => {
  const mockQuestion: Question = {
    id: 'q1',
    content: 'What is the capital of Japan?',
    explanation: 'Tokyo is the capital of Japan.',
    difficulty: 2,
    year: 2023,
    session: '春期',
    categoryId: 'geography',
    choices: [
      { id: 'c1', content: 'Tokyo', isCorrect: true },
      { id: 'c2', content: 'Osaka', isCorrect: false },
      { id: 'c3', content: 'Kyoto', isCorrect: false },
      { id: 'c4', content: 'Hiroshima', isCorrect: false },
    ],
    questionType: 'multiple_choice',
  }

  const mockEssayQuestion: Question = {
    id: 'eq1',
    content: 'Explain the importance of data structures in computer science.',
    explanation:
      'Data structures are fundamental for organizing and managing data efficiently.',
    difficulty: 4,
    categoryId: 'computer-science',
    choices: [],
    questionType: 'essay',
    maxScore: 10,
    sampleAnswer: 'Data structures are crucial for...',
  }

  const mockQuestions: QuestionSummary[] = [
    {
      id: 'q1',
      content: 'Question 1',
      difficulty: 1,
      categoryId: 'cat1',
      categoryName: 'Category 1',
    },
    {
      id: 'q2',
      content: 'Question 2',
      difficulty: 2,
      categoryId: 'cat2',
      categoryName: 'Category 2',
      hasAnswered: true,
      isCorrect: true,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('initializes with default state', () => {
    const { result } = renderHook(() => useQuestionStore())

    expect(result.current.currentQuestion).toBe(null)
    expect(result.current.currentAnswers).toEqual([])
    expect(result.current.selectedChoiceId).toBe(null)
    expect(result.current.userAnswer).toBe(null)
    expect(result.current.showResult).toBe(false)
    expect(result.current.currentEssayAnswer).toBe(null)
    expect(result.current.essayContent).toBe('')
    expect(result.current.isEssayPreview).toBe(false)
    expect(result.current.questions).toEqual([])
    expect(result.current.currentQuestionIndex).toBe(0)
    expect(result.current.sessionStartTime).toBe(null)
    expect(result.current.questionStartTime).toBe(null)
    expect(result.current.sessionStats).toEqual({
      totalQuestions: 0,
      correctAnswers: 0,
      totalTime: 0,
    })
    expect(result.current.filters).toEqual({})
  })

  describe('question management', () => {
    it('sets current question and shuffles choices', () => {
      const { result } = renderHook(() => useQuestionStore())

      act(() => {
        result.current.setCurrentQuestion(mockQuestion)
      })

      expect(result.current.currentQuestion).toEqual(mockQuestion)
      expect(result.current.currentAnswers).toHaveLength(4)
      expect(result.current.selectedChoiceId).toBe(null)
      expect(result.current.userAnswer).toBe(null)
      expect(result.current.showResult).toBe(false)
    })

    it('does not shuffle choices for essay questions', () => {
      const { result } = renderHook(() => useQuestionStore())

      act(() => {
        result.current.setCurrentQuestion(mockEssayQuestion)
      })

      expect(result.current.currentQuestion).toEqual(mockEssayQuestion)
      expect(result.current.currentAnswers).toEqual([])
      expect(result.current.essayContent).toBe('')
      expect(result.current.isEssayPreview).toBe(false)
    })

    it('loads essay draft when setting essay question', () => {
      const { result } = renderHook(() => useQuestionStore())

      // First save a draft
      act(() => {
        result.current.setCurrentQuestion(mockEssayQuestion)
        result.current.setEssayContent('Draft content')
        result.current.saveEssayDraft('eq1')
      })

      // Clear content and set question again
      act(() => {
        result.current.setEssayContent('')
        result.current.setCurrentQuestion(mockEssayQuestion)
      })

      expect(result.current.essayContent).toBe('Draft content')
    })

    it('sets selected choice', () => {
      const { result } = renderHook(() => useQuestionStore())

      act(() => {
        result.current.setSelectedChoice('c1')
      })

      expect(result.current.selectedChoiceId).toBe('c1')
    })

    it('sets user answer and shows result', () => {
      const { result } = renderHook(() => useQuestionStore())
      const userAnswer: UserAnswer = {
        id: 'a1',
        isCorrect: true,
        timeSpent: 5000,
        createdAt: '2023-01-01T00:00:00Z',
      }

      act(() => {
        result.current.setUserAnswer(userAnswer)
      })

      expect(result.current.userAnswer).toEqual(userAnswer)
      expect(result.current.showResult).toBe(true)
    })

    it('sets show result', () => {
      const { result } = renderHook(() => useQuestionStore())

      act(() => {
        result.current.setShowResult(true)
      })

      expect(result.current.showResult).toBe(true)

      act(() => {
        result.current.setShowResult(false)
      })

      expect(result.current.showResult).toBe(false)
    })

    it('resets question state', () => {
      const { result } = renderHook(() => useQuestionStore())

      // Set some state
      act(() => {
        result.current.setCurrentQuestion(mockQuestion)
        result.current.setSelectedChoice('c1')
        result.current.setShowResult(true)
        result.current.startQuestion()
      })

      // Reset
      act(() => {
        result.current.resetQuestion()
      })

      expect(result.current.currentQuestion).toBe(null)
      expect(result.current.currentAnswers).toEqual([])
      expect(result.current.selectedChoiceId).toBe(null)
      expect(result.current.userAnswer).toBe(null)
      expect(result.current.showResult).toBe(false)
      expect(result.current.questionStartTime).toBe(null)
      expect(result.current.currentEssayAnswer).toBe(null)
      expect(result.current.essayContent).toBe('')
      expect(result.current.isEssayPreview).toBe(false)
    })
  })

  describe('question list management', () => {
    it('sets questions and resets index', () => {
      const { result } = renderHook(() => useQuestionStore())

      act(() => {
        result.current.setCurrentQuestionIndex(5)
        result.current.setQuestions(mockQuestions)
      })

      expect(result.current.questions).toEqual(mockQuestions)
      expect(result.current.currentQuestionIndex).toBe(0)
    })

    it('sets current question index', () => {
      const { result } = renderHook(() => useQuestionStore())

      act(() => {
        result.current.setCurrentQuestionIndex(3)
      })

      expect(result.current.currentQuestionIndex).toBe(3)
    })
  })

  describe('session management', () => {
    it('starts session and initializes stats', () => {
      const { result } = renderHook(() => useQuestionStore())
      const now = Date.now()
      vi.setSystemTime(now)

      act(() => {
        result.current.startSession()
      })

      expect(result.current.sessionStartTime).toBe(now)
      expect(result.current.sessionStats).toEqual({
        totalQuestions: 0,
        correctAnswers: 0,
        totalTime: 0,
      })
    })

    it('starts question timer', () => {
      const { result } = renderHook(() => useQuestionStore())
      const now = Date.now()
      vi.setSystemTime(now)

      act(() => {
        result.current.startQuestion()
      })

      expect(result.current.questionStartTime).toBe(now)
    })

    it('ends question and updates stats for correct answer', () => {
      const { result } = renderHook(() => useQuestionStore())
      const startTime = Date.now()
      const endTime = startTime + 5000

      vi.setSystemTime(startTime)
      act(() => {
        result.current.startQuestion()
      })

      vi.setSystemTime(endTime)
      act(() => {
        result.current.endQuestion(true)
      })

      expect(result.current.sessionStats.totalQuestions).toBe(1)
      expect(result.current.sessionStats.correctAnswers).toBe(1)
      expect(result.current.sessionStats.totalTime).toBe(5000)
      expect(result.current.questionStartTime).toBe(null)
    })

    it('ends question and updates stats for incorrect answer', () => {
      const { result } = renderHook(() => useQuestionStore())
      const startTime = Date.now()
      const endTime = startTime + 3000

      vi.setSystemTime(startTime)
      act(() => {
        result.current.startQuestion()
      })

      vi.setSystemTime(endTime)
      act(() => {
        result.current.endQuestion(false)
      })

      expect(result.current.sessionStats.totalQuestions).toBe(1)
      expect(result.current.sessionStats.correctAnswers).toBe(0)
      expect(result.current.sessionStats.totalTime).toBe(3000)
    })

    it('handles end question without start time', () => {
      const { result } = renderHook(() => useQuestionStore())

      act(() => {
        result.current.endQuestion(true)
      })

      expect(result.current.sessionStats.totalQuestions).toBe(1)
      expect(result.current.sessionStats.correctAnswers).toBe(1)
      expect(result.current.sessionStats.totalTime).toBe(0)
    })

    it('ends session and clears timers', () => {
      const { result } = renderHook(() => useQuestionStore())

      act(() => {
        result.current.startSession()
        result.current.startQuestion()
        result.current.endSession()
      })

      expect(result.current.sessionStartTime).toBe(null)
      expect(result.current.questionStartTime).toBe(null)
    })

    it('resets session state', () => {
      const { result } = renderHook(() => useQuestionStore())

      // Set session state
      act(() => {
        result.current.setQuestions(mockQuestions)
        result.current.setCurrentQuestionIndex(1)
        result.current.startSession()
        result.current.startQuestion()
        result.current.endQuestion(true)
      })

      // Reset session
      act(() => {
        result.current.resetSession()
      })

      expect(result.current.questions).toEqual([])
      expect(result.current.currentQuestionIndex).toBe(0)
      expect(result.current.sessionStartTime).toBe(null)
      expect(result.current.questionStartTime).toBe(null)
      expect(result.current.sessionStats).toEqual({
        totalQuestions: 0,
        correctAnswers: 0,
        totalTime: 0,
      })
    })
  })

  describe('filters', () => {
    it('sets filters', () => {
      const { result } = renderHook(() => useQuestionStore())

      act(() => {
        result.current.setFilters({
          categoryId: 'cat1',
          difficulty: 3,
        })
      })

      expect(result.current.filters).toEqual({
        categoryId: 'cat1',
        difficulty: 3,
      })
    })

    it('merges filters', () => {
      const { result } = renderHook(() => useQuestionStore())

      act(() => {
        result.current.setFilters({ categoryId: 'cat1' })
        result.current.setFilters({ difficulty: 2 })
      })

      expect(result.current.filters).toEqual({
        categoryId: 'cat1',
        difficulty: 2,
      })
    })

    it('overwrites existing filter values', () => {
      const { result } = renderHook(() => useQuestionStore())

      act(() => {
        result.current.setFilters({ categoryId: 'cat1' })
        result.current.setFilters({ categoryId: 'cat2' })
      })

      expect(result.current.filters).toEqual({
        categoryId: 'cat2',
      })
    })
  })

  describe('essay functionality', () => {
    it('sets essay content', () => {
      const { result } = renderHook(() => useQuestionStore())

      act(() => {
        result.current.setEssayContent('My essay content')
      })

      expect(result.current.essayContent).toBe('My essay content')
    })

    it('sets essay preview mode', () => {
      const { result } = renderHook(() => useQuestionStore())

      act(() => {
        result.current.setEssayPreview(true)
      })

      expect(result.current.isEssayPreview).toBe(true)

      act(() => {
        result.current.setEssayPreview(false)
      })

      expect(result.current.isEssayPreview).toBe(false)
    })

    it('saves essay draft', () => {
      const { result } = renderHook(() => useQuestionStore())
      const now = Date.now()
      vi.setSystemTime(now)

      act(() => {
        result.current.startQuestion()
        result.current.setEssayContent('Draft content')
        result.current.saveEssayDraft('eq1')
      })

      const draft = result.current.essayDrafts.get('eq1')
      expect(draft).toBeDefined()
      expect(draft?.content).toBe('Draft content')
      expect(draft?.isDraft).toBe(true)
      expect(draft?.timeSpent).toBe(0)
    })

    it('does not save empty essay draft', () => {
      const { result } = renderHook(() => useQuestionStore())

      act(() => {
        result.current.setEssayContent('   ')
        result.current.saveEssayDraft('eq1')
      })

      expect(result.current.essayDrafts.size).toBe(0)
    })

    it('loads essay draft', () => {
      const { result } = renderHook(() => useQuestionStore())

      // Save draft first
      act(() => {
        result.current.setEssayContent('Draft content')
        result.current.saveEssayDraft('eq1')
        result.current.setEssayContent('')
      })

      // Load draft
      act(() => {
        result.current.loadEssayDraft('eq1')
      })

      expect(result.current.essayContent).toBe('Draft content')
    })

    it('handles loading non-existent draft', () => {
      const { result } = renderHook(() => useQuestionStore())

      act(() => {
        result.current.setEssayContent('Original content')
        result.current.loadEssayDraft('non-existent')
      })

      expect(result.current.essayContent).toBe('Original content')
    })

    it('submits essay answer', () => {
      const { result } = renderHook(() => useQuestionStore())
      const now = Date.now()
      vi.setSystemTime(now)

      act(() => {
        result.current.startQuestion()
        result.current.setEssayContent('Final answer')
        result.current.submitEssayAnswer('eq1')
      })

      expect(result.current.currentEssayAnswer).toBeDefined()
      expect(result.current.currentEssayAnswer?.content).toBe('Final answer')
      expect(result.current.currentEssayAnswer?.isDraft).toBe(false)
      expect(result.current.showResult).toBe(true)
    })

    it('does not submit empty essay answer', () => {
      const { result } = renderHook(() => useQuestionStore())

      act(() => {
        result.current.setEssayContent('   ')
        result.current.submitEssayAnswer('eq1')
      })

      expect(result.current.currentEssayAnswer).toBe(null)
      expect(result.current.showResult).toBe(false)
    })

    it('removes draft after essay submission', () => {
      const { result } = renderHook(() => useQuestionStore())

      // Save draft first
      act(() => {
        result.current.setEssayContent('Draft content')
        result.current.saveEssayDraft('eq1')
      })

      expect(result.current.essayDrafts.size).toBe(1)

      // Submit answer
      act(() => {
        result.current.setEssayContent('Final answer')
        result.current.submitEssayAnswer('eq1')
      })

      expect(result.current.essayDrafts.size).toBe(0)
    })

    it('sets current essay answer', () => {
      const { result } = renderHook(() => useQuestionStore())
      const essayAnswer = {
        id: 'ea1',
        content: 'Essay answer',
        timeSpent: 300,
        isDraft: false,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
        score: 8,
        feedback: 'Good answer',
      }

      act(() => {
        result.current.setCurrentEssayAnswer(essayAnswer)
      })

      expect(result.current.currentEssayAnswer).toEqual(essayAnswer)
    })
  })

  describe('persistence', () => {
    it('persists session stats, filters, and essay drafts', () => {
      const { result } = renderHook(() => useQuestionStore())

      act(() => {
        result.current.setFilters({ categoryId: 'cat1' })
        result.current.startSession()
        result.current.endQuestion(true)
        result.current.setEssayContent('Draft')
        result.current.saveEssayDraft('eq1')
      })

      // Check that the store updates correctly
      expect(result.current.filters.categoryId).toBe('cat1')
      expect(result.current.sessionStats.totalQuestions).toBe(1)
      expect(result.current.essayDrafts.size).toBe(1)
    })
  })
})
