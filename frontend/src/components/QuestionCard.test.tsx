import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import QuestionCard from './QuestionCard'

// Mock components
vi.mock('./TouchButton', () => ({
  default: ({ children, onClick, disabled, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid={props['data-testid'] || 'touch-button'}
      {...props}
    >
      {children}
    </button>
  ),
}))

vi.mock('./ZoomableImage', () => ({
  default: ({ src, alt }: any) => (
    <img src={src} alt={alt} data-testid="zoomable-image" />
  ),
}))

vi.mock('./EssayQuestionCard', () => ({
  default: ({ question }: any) => (
    <div data-testid="essay-question-card">
      Essay Question: {question.content}
    </div>
  ),
}))

vi.mock('./BookmarkButton', () => ({
  default: ({ questionId }: any) => (
    <button data-testid="bookmark-button">Bookmark {questionId}</button>
  ),
}))

// Mock stores
const mockUseQuestionStore = vi.fn()
const mockUseAppStore = vi.fn()

vi.mock('../stores/useQuestionStore', () => ({
  useQuestionStore: () => mockUseQuestionStore(),
}))

vi.mock('../stores/useAppStore', () => ({
  useAppStore: () => mockUseAppStore(),
}))

const theme = createTheme()

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>)
}

const mockQuestion = {
  id: 'q1',
  content: 'What is the capital of Japan?',
  difficulty: 2,
  year: 2023,
  session: '春期',
  categoryId: 'cat1',
  explanation: 'Tokyo is the capital city of Japan.',
  questionType: 'multiple-choice',
}

const mockChoices = [
  { id: 'c1', content: 'Tokyo', isCorrect: true },
  { id: 'c2', content: 'Osaka', isCorrect: false },
  { id: 'c3', content: 'Kyoto', isCorrect: false },
  { id: 'c4', content: 'Hiroshima', isCorrect: false },
]

describe('QuestionCard', () => {
  const mockOnAnswer = vi.fn()
  const mockOnAnswerSubmit = vi.fn()
  const mockOnEssaySubmit = vi.fn()
  const mockOnNextQuestion = vi.fn()
  const mockSetSelectedChoice = vi.fn()
  const mockStartQuestion = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()

    mockUseQuestionStore.mockReturnValue({
      currentQuestion: mockQuestion,
      currentAnswers: mockChoices,
      selectedChoiceId: null,
      userAnswer: null,
      showResult: false,
      questionStartTime: Date.now(),
      setSelectedChoice: mockSetSelectedChoice,
      startQuestion: mockStartQuestion,
    })

    mockUseAppStore.mockReturnValue({
      deviceType: 'desktop',
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders loading state when no question is provided', () => {
    mockUseQuestionStore.mockReturnValue({
      currentQuestion: null,
      currentAnswers: [],
      selectedChoiceId: null,
      userAnswer: null,
      showResult: false,
      questionStartTime: null,
      setSelectedChoice: mockSetSelectedChoice,
      startQuestion: mockStartQuestion,
    })

    renderWithTheme(<QuestionCard />)

    expect(screen.getByText('問題を読み込み中...')).toBeInTheDocument()
  })

  it('renders essay question card for essay type questions', () => {
    const essayQuestion = { ...mockQuestion, questionType: 'essay' }
    mockUseQuestionStore.mockReturnValue({
      currentQuestion: essayQuestion,
      currentAnswers: [],
      selectedChoiceId: null,
      userAnswer: null,
      showResult: false,
      questionStartTime: Date.now(),
      setSelectedChoice: mockSetSelectedChoice,
      startQuestion: mockStartQuestion,
    })

    renderWithTheme(<QuestionCard onEssaySubmit={mockOnEssaySubmit} />)

    expect(screen.getByTestId('essay-question-card')).toBeInTheDocument()
    expect(
      screen.getByText('Essay Question: What is the capital of Japan?'),
    ).toBeInTheDocument()
  })

  it('renders question content and choices correctly', () => {
    renderWithTheme(<QuestionCard />)

    expect(
      screen.getByText('What is the capital of Japan?'),
    ).toBeInTheDocument()
    expect(screen.getByText('Tokyo')).toBeInTheDocument()
    expect(screen.getByText('Osaka')).toBeInTheDocument()
    expect(screen.getByText('Kyoto')).toBeInTheDocument()
    expect(screen.getByText('Hiroshima')).toBeInTheDocument()
  })

  it('displays difficulty and year information', () => {
    renderWithTheme(<QuestionCard />)

    expect(screen.getByText('標準')).toBeInTheDocument()
    expect(screen.getByText('2023年春期')).toBeInTheDocument()
  })

  it('shows bookmark button when enabled', () => {
    renderWithTheme(<QuestionCard showBookmark={true} />)

    expect(screen.getByTestId('bookmark-button')).toBeInTheDocument()
  })

  it('hides bookmark button when disabled', () => {
    renderWithTheme(<QuestionCard showBookmark={false} />)

    expect(screen.queryByTestId('bookmark-button')).not.toBeInTheDocument()
  })

  it('displays timer when enabled', () => {
    renderWithTheme(<QuestionCard showTimer={true} />)

    expect(screen.getByText(/0:00/)).toBeInTheDocument()
  })

  it('handles choice selection', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

    renderWithTheme(<QuestionCard />)

    const tokyoChoice = screen.getByText('Tokyo').closest('button')
    expect(tokyoChoice).toBeInTheDocument()

    await user.click(tokyoChoice!)

    expect(mockSetSelectedChoice).toHaveBeenCalledWith('c1')
  })

  it('submits answer when submit button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

    mockUseQuestionStore.mockReturnValue({
      currentQuestion: mockQuestion,
      currentAnswers: mockChoices,
      selectedChoiceId: 'c1',
      userAnswer: null,
      showResult: false,
      questionStartTime: Date.now(),
      setSelectedChoice: mockSetSelectedChoice,
      startQuestion: mockStartQuestion,
    })

    renderWithTheme(<QuestionCard onAnswerSubmit={mockOnAnswerSubmit} />)

    const submitButton = screen.getByText('回答する')
    await user.click(submitButton)

    expect(mockOnAnswerSubmit).toHaveBeenCalledWith('c1', 0)
  })

  it('disables submit button when no choice is selected', () => {
    renderWithTheme(<QuestionCard />)

    const submitButton = screen.getByText('回答する')
    expect(submitButton).toBeDisabled()
  })

  it('displays result after answer submission', () => {
    mockUseQuestionStore.mockReturnValue({
      currentQuestion: mockQuestion,
      currentAnswers: mockChoices,
      selectedChoiceId: 'c1',
      userAnswer: { isCorrect: true, choiceId: 'c1' },
      showResult: true,
      questionStartTime: Date.now() - 5000,
      setSelectedChoice: mockSetSelectedChoice,
      startQuestion: mockStartQuestion,
    })

    renderWithTheme(<QuestionCard />)

    expect(screen.getByText('正解！')).toBeInTheDocument()
    expect(screen.getByText('回答時間: 0:05')).toBeInTheDocument()
  })

  it('shows explanation when enabled', () => {
    mockUseQuestionStore.mockReturnValue({
      currentQuestion: mockQuestion,
      currentAnswers: mockChoices,
      selectedChoiceId: 'c1',
      userAnswer: { isCorrect: true, choiceId: 'c1' },
      showResult: true,
      questionStartTime: Date.now(),
      setSelectedChoice: mockSetSelectedChoice,
      startQuestion: mockStartQuestion,
    })

    renderWithTheme(<QuestionCard showExplanation={true} />)

    expect(screen.getByText('解説')).toBeInTheDocument()
    expect(
      screen.getByText('Tokyo is the capital city of Japan.'),
    ).toBeInTheDocument()
  })

  it('shows next question button after result', () => {
    mockUseQuestionStore.mockReturnValue({
      currentQuestion: mockQuestion,
      currentAnswers: mockChoices,
      selectedChoiceId: 'c1',
      userAnswer: { isCorrect: true, choiceId: 'c1' },
      showResult: true,
      questionStartTime: Date.now(),
      setSelectedChoice: mockSetSelectedChoice,
      startQuestion: mockStartQuestion,
    })

    renderWithTheme(<QuestionCard onNextQuestion={mockOnNextQuestion} />)

    expect(screen.getByText('次の問題へ')).toBeInTheDocument()
  })

  it('calls onNextQuestion when next button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

    mockUseQuestionStore.mockReturnValue({
      currentQuestion: mockQuestion,
      currentAnswers: mockChoices,
      selectedChoiceId: 'c1',
      userAnswer: { isCorrect: true, choiceId: 'c1' },
      showResult: true,
      questionStartTime: Date.now(),
      setSelectedChoice: mockSetSelectedChoice,
      startQuestion: mockStartQuestion,
    })

    renderWithTheme(<QuestionCard onNextQuestion={mockOnNextQuestion} />)

    const nextButton = screen.getByText('次の問題へ')
    await user.click(nextButton)

    expect(mockOnNextQuestion).toHaveBeenCalled()
  })

  it('handles time limit correctly', () => {
    renderWithTheme(<QuestionCard timeLimit={5} />)

    expect(screen.getByText('0:00 / 5分')).toBeInTheDocument()
  })

  it('shows time warning when time is running out', () => {
    mockUseQuestionStore.mockReturnValue({
      currentQuestion: mockQuestion,
      currentAnswers: mockChoices,
      selectedChoiceId: null,
      userAnswer: null,
      showResult: false,
      questionStartTime: Date.now() - 240000, // 4 minutes ago (80% of 5 min limit)
      setSelectedChoice: mockSetSelectedChoice,
      startQuestion: mockStartQuestion,
    })

    renderWithTheme(<QuestionCard timeLimit={5} />)

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    // Time should be displayed in red/error color when warning
    const timeElement = screen.getByText(/4:00/)
    expect(timeElement).toBeInTheDocument()
  })

  it('works in review mode with prop question', () => {
    const reviewQuestion = {
      ...mockQuestion,
      choices: mockChoices,
    }

    renderWithTheme(
      <QuestionCard
        question={reviewQuestion}
        reviewMode={true}
        onAnswer={mockOnAnswer}
      />,
    )

    expect(
      screen.getByText('What is the capital of Japan?'),
    ).toBeInTheDocument()
    expect(screen.getByText('復習')).toBeInTheDocument()
  })

  it('handles review mode answer submission', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const reviewQuestion = {
      ...mockQuestion,
      choices: mockChoices,
    }

    mockOnAnswer.mockResolvedValue({ isCorrect: true, choiceId: 'c1' })

    renderWithTheme(
      <QuestionCard
        question={reviewQuestion}
        reviewMode={true}
        onAnswer={mockOnAnswer}
      />,
    )

    // Select a choice
    const tokyoChoice = screen.getByText('Tokyo').closest('button')
    await user.click(tokyoChoice!)

    // Submit answer
    const submitButton = screen.getByText('回答する')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnAnswer).toHaveBeenCalledWith('q1', 'c1', expect.any(Number))
    })
  })

  it('shows touch hint on mobile devices', () => {
    mockUseAppStore.mockReturnValue({
      deviceType: 'mobile',
    })

    renderWithTheme(<QuestionCard />)

    expect(
      screen.getByText('選択肢をタップして回答してください'),
    ).toBeInTheDocument()
  })

  it('displays zoomable image when question content includes 図', () => {
    const questionWithFigure = {
      ...mockQuestion,
      content: 'この図について答えなさい。',
    }

    mockUseQuestionStore.mockReturnValue({
      currentQuestion: questionWithFigure,
      currentAnswers: mockChoices,
      selectedChoiceId: null,
      userAnswer: null,
      showResult: false,
      questionStartTime: Date.now(),
      setSelectedChoice: mockSetSelectedChoice,
      startQuestion: mockStartQuestion,
    })

    renderWithTheme(<QuestionCard />)

    expect(screen.getByTestId('zoomable-image')).toBeInTheDocument()
  })

  it('formats time correctly', () => {
    mockUseQuestionStore.mockReturnValue({
      currentQuestion: mockQuestion,
      currentAnswers: mockChoices,
      selectedChoiceId: null,
      userAnswer: null,
      showResult: false,
      questionStartTime: Date.now() - 65000, // 1 minute 5 seconds ago
      setSelectedChoice: mockSetSelectedChoice,
      startQuestion: mockStartQuestion,
    })

    renderWithTheme(<QuestionCard />)

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(screen.getByText(/1:05/)).toBeInTheDocument()
  })

  it('shows incorrect result for wrong answer', () => {
    mockUseQuestionStore.mockReturnValue({
      currentQuestion: mockQuestion,
      currentAnswers: mockChoices,
      selectedChoiceId: 'c2',
      userAnswer: { isCorrect: false, choiceId: 'c2' },
      showResult: true,
      questionStartTime: Date.now(),
      setSelectedChoice: mockSetSelectedChoice,
      startQuestion: mockStartQuestion,
    })

    renderWithTheme(<QuestionCard />)

    expect(screen.getByText('不正解')).toBeInTheDocument()
  })
})
