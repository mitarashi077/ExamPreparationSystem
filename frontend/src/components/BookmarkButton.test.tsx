import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import BookmarkButton from './BookmarkButton'

// Mock stores
const mockUseBookmarkStore = vi.fn()
const mockUseAppStore = vi.fn()

vi.mock('../stores/useBookmarkStore', () => ({
  useBookmarkStore: () => mockUseBookmarkStore(),
}))

vi.mock('../stores/useAppStore', () => ({
  useAppStore: () => mockUseAppStore(),
}))

const theme = createTheme()

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>)
}

const mockQuestionData = {
  content: 'Test question content',
  categoryId: 'cat1',
  categoryName: 'Test Category',
  difficulty: 2,
  year: 2023,
  session: '春期',
}

describe('BookmarkButton', () => {
  const mockToggleBookmark = vi.fn()
  const mockIsBookmarked = vi.fn()
  const mockClearError = vi.fn()
  const mockOnToggle = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    mockUseBookmarkStore.mockReturnValue({
      isBookmarked: mockIsBookmarked,
      toggleBookmark: mockToggleBookmark,
      clearError: mockClearError,
    })

    mockUseAppStore.mockReturnValue({
      deviceType: 'desktop',
    })

    mockIsBookmarked.mockReturnValue(false)

    // Mock navigator.vibrate
    Object.defineProperty(navigator, 'vibrate', {
      writable: true,
      value: vi.fn(),
    })
  })

  it('renders unbookmarked state correctly', () => {
    mockIsBookmarked.mockReturnValue(false)

    renderWithTheme(
      <BookmarkButton questionId="q1" questionData={mockQuestionData} />,
    )

    const button = screen.getByRole('button', { name: 'ブックマークに追加' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-label', 'ブックマークに追加')
    expect(button).toHaveAttribute('title', 'ブックマークに追加')
  })

  it('renders bookmarked state correctly', () => {
    mockIsBookmarked.mockReturnValue(true)

    renderWithTheme(
      <BookmarkButton questionId="q1" questionData={mockQuestionData} />,
    )

    const button = screen.getByRole('button', { name: 'ブックマークを削除' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-label', 'ブックマークを削除')
    expect(button).toHaveAttribute('title', 'ブックマークを削除')
  })

  it('toggles bookmark when clicked', async () => {
    const user = userEvent.setup()
    mockToggleBookmark.mockResolvedValue(undefined)

    renderWithTheme(
      <BookmarkButton questionId="q1" questionData={mockQuestionData} />,
    )

    const button = screen.getByRole('button')
    await user.click(button)

    expect(mockClearError).toHaveBeenCalled()
    expect(mockToggleBookmark).toHaveBeenCalledWith('q1', mockQuestionData)
  })

  it('calls onToggle callback when bookmark is toggled', async () => {
    const user = userEvent.setup()
    mockToggleBookmark.mockResolvedValue(undefined)
    mockIsBookmarked.mockReturnValue(false) // Currently not bookmarked

    renderWithTheme(
      <BookmarkButton
        questionId="q1"
        questionData={mockQuestionData}
        onToggle={mockOnToggle}
      />,
    )

    const button = screen.getByRole('button')
    await user.click(button)

    await waitFor(() => {
      expect(mockOnToggle).toHaveBeenCalledWith(true) // Will be bookmarked after toggle
    })
  })

  it('handles bookmark toggle error gracefully', async () => {
    const user = userEvent.setup()
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    const error = new Error('Toggle failed')
    mockToggleBookmark.mockRejectedValue(error)

    renderWithTheme(
      <BookmarkButton questionId="q1" questionData={mockQuestionData} />,
    )

    const button = screen.getByRole('button')
    await user.click(button)

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Bookmark toggle failed:',
        error,
      )
    })

    consoleErrorSpy.mockRestore()
  })

  it('does not toggle when disabled', async () => {
    const user = userEvent.setup()

    renderWithTheme(
      <BookmarkButton
        questionId="q1"
        questionData={mockQuestionData}
        disabled={true}
      />,
    )

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()

    await user.click(button)

    expect(mockToggleBookmark).not.toHaveBeenCalled()
  })

  it('triggers haptic feedback on mobile devices', async () => {
    const user = userEvent.setup()
    const mockVibrate = vi.fn()

    mockUseAppStore.mockReturnValue({
      deviceType: 'mobile',
    })

    Object.defineProperty(navigator, 'vibrate', {
      writable: true,
      value: mockVibrate,
    })

    mockToggleBookmark.mockResolvedValue(undefined)

    renderWithTheme(
      <BookmarkButton questionId="q1" questionData={mockQuestionData} />,
    )

    const button = screen.getByRole('button')
    await user.click(button)

    expect(mockVibrate).toHaveBeenCalledWith(15)
  })

  it('does not trigger haptic feedback on desktop devices', async () => {
    const user = userEvent.setup()
    const mockVibrate = vi.fn()

    mockUseAppStore.mockReturnValue({
      deviceType: 'desktop',
    })

    Object.defineProperty(navigator, 'vibrate', {
      writable: true,
      value: mockVibrate,
    })

    mockToggleBookmark.mockResolvedValue(undefined)

    renderWithTheme(
      <BookmarkButton questionId="q1" questionData={mockQuestionData} />,
    )

    const button = screen.getByRole('button')
    await user.click(button)

    expect(mockVibrate).not.toHaveBeenCalled()
  })

  it('handles missing vibrate API gracefully', async () => {
    const user = userEvent.setup()

    mockUseAppStore.mockReturnValue({
      deviceType: 'mobile',
    })

    Object.defineProperty(navigator, 'vibrate', {
      writable: true,
      value: undefined,
    })

    mockToggleBookmark.mockResolvedValue(undefined)

    renderWithTheme(
      <BookmarkButton questionId="q1" questionData={mockQuestionData} />,
    )

    const button = screen.getByRole('button')

    // Should not throw an error
    await user.click(button)
    expect(mockToggleBookmark).toHaveBeenCalled()
  })

  it('renders with different sizes', () => {
    const { rerender } = renderWithTheme(
      <BookmarkButton questionId="q1" size="small" />,
    )

    expect(screen.getByRole('button')).toBeInTheDocument()

    rerender(
      <ThemeProvider theme={theme}>
        <BookmarkButton questionId="q1" size="medium" />
      </ThemeProvider>,
    )

    expect(screen.getByRole('button')).toBeInTheDocument()

    rerender(
      <ThemeProvider theme={theme}>
        <BookmarkButton questionId="q1" size="large" />
      </ThemeProvider>,
    )

    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('renders with different colors', () => {
    const { rerender } = renderWithTheme(
      <BookmarkButton questionId="q1" color="default" />,
    )

    expect(screen.getByRole('button')).toBeInTheDocument()

    rerender(
      <ThemeProvider theme={theme}>
        <BookmarkButton questionId="q1" color="primary" />
      </ThemeProvider>,
    )

    expect(screen.getByRole('button')).toBeInTheDocument()

    rerender(
      <ThemeProvider theme={theme}>
        <BookmarkButton questionId="q1" color="warning" />
      </ThemeProvider>,
    )

    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('renders with different variants', () => {
    const { rerender } = renderWithTheme(
      <BookmarkButton questionId="q1" variant="standard" />,
    )

    expect(screen.getByRole('button')).toBeInTheDocument()

    rerender(
      <ThemeProvider theme={theme}>
        <BookmarkButton questionId="q1" variant="minimal" />
      </ThemeProvider>,
    )

    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('works without question data', async () => {
    const user = userEvent.setup()
    mockToggleBookmark.mockResolvedValue(undefined)

    renderWithTheme(<BookmarkButton questionId="q1" />)

    const button = screen.getByRole('button')
    await user.click(button)

    expect(mockToggleBookmark).toHaveBeenCalledWith('q1', undefined)
  })

  it('applies custom className', () => {
    renderWithTheme(
      <BookmarkButton questionId="q1" className="custom-bookmark-button" />,
    )

    const container = screen.getByRole('button').parentElement
    expect(container).toHaveClass('custom-bookmark-button')
  })

  it('renders without animation when showAnimation is false', () => {
    mockIsBookmarked.mockReturnValue(true)

    renderWithTheme(<BookmarkButton questionId="q1" showAnimation={false} />)

    // Should render the bookmark icon directly without Zoom animation
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('works with tablet device type', async () => {
    const user = userEvent.setup()
    const mockVibrate = vi.fn()

    mockUseAppStore.mockReturnValue({
      deviceType: 'tablet',
    })

    Object.defineProperty(navigator, 'vibrate', {
      writable: true,
      value: mockVibrate,
    })

    mockToggleBookmark.mockResolvedValue(undefined)

    renderWithTheme(
      <BookmarkButton questionId="q1" questionData={mockQuestionData} />,
    )

    const button = screen.getByRole('button')
    await user.click(button)

    // Should not vibrate on tablet (only mobile)
    expect(mockVibrate).not.toHaveBeenCalled()
    expect(mockToggleBookmark).toHaveBeenCalled()
  })

  it('maintains correct bookmark state during multiple toggles', async () => {
    const user = userEvent.setup()
    mockToggleBookmark.mockResolvedValue(undefined)

    // Start as not bookmarked
    mockIsBookmarked.mockReturnValue(false)

    const { rerender } = renderWithTheme(
      <BookmarkButton questionId="q1" onToggle={mockOnToggle} />,
    )

    const button = screen.getByRole('button')

    // First toggle - should call with true (will be bookmarked)
    await user.click(button)
    await waitFor(() => {
      expect(mockOnToggle).toHaveBeenCalledWith(true)
    })

    // Simulate bookmark state changed to true
    mockIsBookmarked.mockReturnValue(true)
    mockOnToggle.mockClear()

    rerender(
      <ThemeProvider theme={theme}>
        <BookmarkButton questionId="q1" onToggle={mockOnToggle} />
      </ThemeProvider>,
    )

    // Second toggle - should call with false (will be unbookmarked)
    await user.click(button)
    await waitFor(() => {
      expect(mockOnToggle).toHaveBeenCalledWith(false)
    })
  })
})
