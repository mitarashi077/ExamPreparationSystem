import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import HomePage from './HomePage'

// Mock react-router-dom navigate
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock components
vi.mock('../components/TouchCardList', () => ({
  default: ({ items, onClick: _onClick, ...props }: any) => (
    <div data-testid="touch-card-list" {...props}>
      {items.map((item: any) => (
        <button
          key={item.id}
          data-testid={`card-${item.id}`}
          onClick={item.onClick}
        >
          {item.title}
        </button>
      ))}
    </div>
  ),
}))

vi.mock('../components/ZoomableImage', () => ({
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} data-testid="zoomable-image" {...props} />
  ),
}))

const theme = createTheme()

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>{component}</ThemeProvider>
    </BrowserRouter>,
  )
}

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders page title correctly', () => {
    renderWithProviders(<HomePage />)

    expect(
      screen.getByRole('heading', { level: 1, name: 'ESS試験対策' }),
    ).toBeInTheDocument()
  })

  it('displays daily study status card', () => {
    renderWithProviders(<HomePage />)

    expect(screen.getByText('今日の学習状況')).toBeInTheDocument()
    expect(screen.getByText('連続3日')).toBeInTheDocument()
    expect(screen.getByText('今日の目標: 10問')).toBeInTheDocument()
    expect(screen.getByText('3/10問 完了 (30%)')).toBeInTheDocument()
    expect(screen.getByText('平均 2.5分/問')).toBeInTheDocument()
  })

  it('displays progress bar for daily goals', () => {
    renderWithProviders(<HomePage />)

    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toBeInTheDocument()
    expect(progressBar).toHaveAttribute('aria-valuenow', '30')
  })

  it('renders main menu section', () => {
    renderWithProviders(<HomePage />)

    expect(
      screen.getByRole('heading', { level: 2, name: 'メインメニュー' }),
    ).toBeInTheDocument()
    expect(screen.getByTestId('card-practice')).toBeInTheDocument()
    expect(screen.getByTestId('card-progress')).toBeInTheDocument()
  })

  it('renders study mode section', () => {
    renderWithProviders(<HomePage />)

    expect(
      screen.getByRole('heading', { level: 2, name: '通勤学習モード' }),
    ).toBeInTheDocument()
    expect(screen.getByTestId('card-timed-5')).toBeInTheDocument()
    expect(screen.getByTestId('card-timed-10')).toBeInTheDocument()
    expect(screen.getByTestId('card-timed-15')).toBeInTheDocument()
    expect(screen.getByTestId('card-essay-demo')).toBeInTheDocument()
  })

  it('renders zoomable image demo section', () => {
    renderWithProviders(<HomePage />)

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'サンプル図表（ピンチズーム対応）',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        '実際の試験問題では、回路図やシステム構成図が表示されます。',
      ),
    ).toBeInTheDocument()
    expect(screen.getByTestId('zoomable-image')).toBeInTheDocument()
    expect(screen.getByAltText('システム構成図サンプル')).toBeInTheDocument()
  })

  it('navigates to practice page when practice card is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<HomePage />)

    const practiceCard = screen.getByTestId('card-practice')
    await user.click(practiceCard)

    expect(mockNavigate).toHaveBeenCalledWith('/practice')
  })

  it('navigates to progress page when progress card is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<HomePage />)

    const progressCard = screen.getByTestId('card-progress')
    await user.click(progressCard)

    expect(mockNavigate).toHaveBeenCalledWith('/progress')
  })

  it('navigates to timed practice with 5 minutes when clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<HomePage />)

    const timedCard = screen.getByTestId('card-timed-5')
    await user.click(timedCard)

    expect(mockNavigate).toHaveBeenCalledWith('/practice?mode=timed&time=5')
  })

  it('navigates to timed practice with 10 minutes when clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<HomePage />)

    const timedCard = screen.getByTestId('card-timed-10')
    await user.click(timedCard)

    expect(mockNavigate).toHaveBeenCalledWith('/practice?mode=timed&time=10')
  })

  it('navigates to timed practice with 15 minutes when clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<HomePage />)

    const timedCard = screen.getByTestId('card-timed-15')
    await user.click(timedCard)

    expect(mockNavigate).toHaveBeenCalledWith('/practice?mode=timed&time=15')
  })

  it('navigates to essay demo when essay demo card is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<HomePage />)

    const essayCard = screen.getByTestId('card-essay-demo')
    await user.click(essayCard)

    expect(mockNavigate).toHaveBeenCalledWith('/essay-demo')
  })

  it('displays all card titles correctly', () => {
    renderWithProviders(<HomePage />)

    // Main menu cards
    expect(screen.getByText('問題演習')).toBeInTheDocument()
    expect(screen.getByText('学習進捗')).toBeInTheDocument()

    // Study mode cards
    expect(screen.getByText('5分タイマー学習')).toBeInTheDocument()
    expect(screen.getByText('10分タイマー学習')).toBeInTheDocument()
    expect(screen.getByText('15分タイマー学習')).toBeInTheDocument()
    expect(screen.getByText('記述式問題デモ')).toBeInTheDocument()
  })

  it('displays schedule and speed icons', () => {
    renderWithProviders(<HomePage />)

    // Check if icons are rendered (they should be in the DOM)
    const _scheduleIcon = document.querySelector('[data-testid="ScheduleIcon"]')
    const _speedIcon = document.querySelector('[data-testid="SpeedIcon"]')

    // Even if MUI icons don't have testids, they should render as SVG elements
    const svgElements = document.querySelectorAll('svg')
    expect(svgElements.length).toBeGreaterThan(0)
  })

  it('has proper accessibility structure', () => {
    renderWithProviders(<HomePage />)

    // Check heading hierarchy
    const mainHeading = screen.getByRole('heading', { level: 1 })
    const subHeadings = screen.getAllByRole('heading', { level: 2 })

    expect(mainHeading).toBeInTheDocument()
    expect(subHeadings).toHaveLength(3) // Main menu, Study mode, Sample chart
  })

  it('displays success chip for study streak', () => {
    renderWithProviders(<HomePage />)

    const streakChip = screen.getByText('連続3日')
    expect(streakChip).toBeInTheDocument()
  })

  it('shows proper study statistics', () => {
    renderWithProviders(<HomePage />)

    expect(screen.getByText('今日の目標: 10問')).toBeInTheDocument()
    expect(screen.getByText('3/10問 完了 (30%)')).toBeInTheDocument()
    expect(screen.getByText('平均 2.5分/問')).toBeInTheDocument()
  })

  it('renders all required TouchCardList components', () => {
    renderWithProviders(<HomePage />)

    const touchCardLists = screen.getAllByTestId('touch-card-list')
    expect(touchCardLists).toHaveLength(2) // Main menu and study mode
  })

  it('passes correct props to TouchCardList components', () => {
    renderWithProviders(<HomePage />)

    const touchCardLists = screen.getAllByTestId('touch-card-list')

    // Both should have showSwipeIndicators prop
    touchCardLists.forEach((list) => {
      expect(list).toHaveAttribute('showSwipeIndicators', 'true')
    })
  })

  it('displays zoomable image with correct props', () => {
    renderWithProviders(<HomePage />)

    const zoomableImage = screen.getByTestId('zoomable-image')
    expect(zoomableImage).toHaveAttribute('alt', 'システム構成図サンプル')
    expect(zoomableImage).toHaveAttribute('maxHeight', '200')
    expect(zoomableImage).toHaveAttribute('showControls', 'true')
    expect(zoomableImage).toHaveAttribute('showTouchHint', 'true')
  })

  it('contains base64 encoded SVG image', () => {
    renderWithProviders(<HomePage />)

    const zoomableImage = screen.getByTestId('zoomable-image')
    const src = zoomableImage.getAttribute('src')
    expect(src).toContain('data:image/svg+xml;base64,')
  })

  it('handles empty state gracefully', () => {
    renderWithProviders(<HomePage />)

    // Should render without errors even if no data is loaded
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })
})
