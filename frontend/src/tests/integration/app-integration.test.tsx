import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import App from '../../App'

// Mock all the components that depend on external services
vi.mock('../../components/TouchCardList', () => ({
  default: ({ items }: any) => (
    <div data-testid="touch-card-list">
      {items.map((item: any) => (
        <button key={item.id} data-testid={`card-${item.id}`}>
          {item.title}
        </button>
      ))}
    </div>
  ),
}))

vi.mock('../../components/ZoomableImage', () => ({
  default: () => <div data-testid="zoomable-image" />,
}))

// Mock stores
vi.mock('../../stores/useAppStore', () => ({
  useAppStore: () => ({
    deviceType: 'desktop',
    theme: 'light',
    isMobileMenuOpen: false,
    setMobileMenuOpen: vi.fn(),
    setCurrentPage: vi.fn(),
  }),
}))

vi.mock('../../hooks/useDeviceDetection', () => ({
  useDeviceDetection: () => ({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  }),
}))

vi.mock('../../hooks/useSwipeNavigation', () => ({
  useSwipeNavigation: () => ({
    swipeHandlers: {},
    currentIndex: 0,
    navigationItems: [],
    canSwipeLeft: false,
    canSwipeRight: false,
  }),
}))

const theme = createTheme()

const renderApp = () => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </BrowserRouter>,
  )
}

describe('App Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the application without crashing', () => {
    renderApp()

    expect(screen.getByText('ESS試験対策')).toBeInTheDocument()
  })

  it('displays the home page by default', () => {
    renderApp()

    expect(screen.getByText('ESS試験対策')).toBeInTheDocument()
    expect(screen.getByText('今日の学習状況')).toBeInTheDocument()
    expect(screen.getByText('メインメニュー')).toBeInTheDocument()
    expect(screen.getByText('通勤学習モード')).toBeInTheDocument()
  })

  it('shows progress information', () => {
    renderApp()

    expect(screen.getByText('今日の目標: 10問')).toBeInTheDocument()
    expect(screen.getByText('3/10問 完了 (30%)')).toBeInTheDocument()
    expect(screen.getByText('平均 2.5分/問')).toBeInTheDocument()
    expect(screen.getByText('連続3日')).toBeInTheDocument()
  })

  it('displays study mode options', () => {
    renderApp()

    expect(screen.getByTestId('touch-card-list')).toBeInTheDocument()
  })

  it('shows zoomable image demo', () => {
    renderApp()

    expect(
      screen.getByText('サンプル図表（ピンチズーム対応）'),
    ).toBeInTheDocument()
    expect(screen.getByTestId('zoomable-image')).toBeInTheDocument()
  })

  it('has proper heading structure', () => {
    renderApp()

    const mainHeading = screen.getByRole('heading', { level: 1 })
    const subHeadings = screen.getAllByRole('heading', { level: 2 })

    expect(mainHeading).toBeInTheDocument()
    expect(subHeadings.length).toBeGreaterThan(0)
  })

  it('displays the progress bar', () => {
    renderApp()

    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toBeInTheDocument()
    expect(progressBar).toHaveAttribute('aria-valuenow', '30')
  })

  it('shows study streak information', () => {
    renderApp()

    expect(screen.getByText('連続3日')).toBeInTheDocument()
  })

  it('has accessible navigation structure', () => {
    renderApp()

    // Should have main heading
    expect(
      screen.getByRole('heading', { level: 1, name: 'ESS試験対策' }),
    ).toBeInTheDocument()

    // Should have section headings
    expect(
      screen.getByRole('heading', { level: 2, name: 'メインメニュー' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: '通勤学習モード' }),
    ).toBeInTheDocument()
  })

  it('renders without JavaScript errors', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    renderApp()

    await waitFor(() => {
      expect(screen.getByText('ESS試験対策')).toBeInTheDocument()
    })

    expect(consoleSpy).not.toHaveBeenCalled()

    consoleSpy.mockRestore()
  })

  it('maintains state during user interactions', async () => {
    const user = userEvent.setup()
    renderApp()

    // The app should remain stable during interactions
    const mainHeading = screen.getByText('ESS試験対策')
    expect(mainHeading).toBeInTheDocument()

    // Simulate some user interactions that shouldn't break the app
    const progressSection = screen.getByText('今日の学習状況')
    await user.hover(progressSection)

    expect(mainHeading).toBeInTheDocument()
  })
})
