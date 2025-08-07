import React from 'react'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import Layout from './Layout'

// Mock the device detection hook
vi.mock('../hooks/useDeviceDetection', () => ({
  useDeviceDetection: vi.fn(),
}))

// Mock the layout components
vi.mock('./MobileLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mobile-layout">{children}</div>
  ),
}))

vi.mock('./DesktopLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="desktop-layout">{children}</div>
  ),
}))

const theme = createTheme()

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>)
}

describe('Layout', () => {
  const mockUseDeviceDetection = vi.mocked(
    require('../hooks/useDeviceDetection').useDeviceDetection,
  )

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders children correctly', () => {
    mockUseDeviceDetection.mockReturnValue({
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    })

    renderWithTheme(
      <Layout>
        <div data-testid="test-child">Test Content</div>
      </Layout>,
    )

    expect(screen.getByTestId('test-child')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('renders MobileLayout when isMobile is true', () => {
    mockUseDeviceDetection.mockReturnValue({
      isMobile: true,
      isTablet: false,
      isDesktop: false,
    })

    renderWithTheme(
      <Layout>
        <div data-testid="test-child">Mobile Content</div>
      </Layout>,
    )

    expect(screen.getByTestId('mobile-layout')).toBeInTheDocument()
    expect(screen.queryByTestId('desktop-layout')).not.toBeInTheDocument()
    expect(screen.getByTestId('test-child')).toBeInTheDocument()
  })

  it('renders MobileLayout when isTablet is true', () => {
    mockUseDeviceDetection.mockReturnValue({
      isMobile: false,
      isTablet: true,
      isDesktop: false,
    })

    renderWithTheme(
      <Layout>
        <div data-testid="test-child">Tablet Content</div>
      </Layout>,
    )

    expect(screen.getByTestId('mobile-layout')).toBeInTheDocument()
    expect(screen.queryByTestId('desktop-layout')).not.toBeInTheDocument()
    expect(screen.getByTestId('test-child')).toBeInTheDocument()
  })

  it('renders DesktopLayout when neither isMobile nor isTablet is true', () => {
    mockUseDeviceDetection.mockReturnValue({
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    })

    renderWithTheme(
      <Layout>
        <div data-testid="test-child">Desktop Content</div>
      </Layout>,
    )

    expect(screen.getByTestId('desktop-layout')).toBeInTheDocument()
    expect(screen.queryByTestId('mobile-layout')).not.toBeInTheDocument()
    expect(screen.getByTestId('test-child')).toBeInTheDocument()
  })

  it('prefers mobile layout when both isMobile and isTablet are true', () => {
    mockUseDeviceDetection.mockReturnValue({
      isMobile: true,
      isTablet: true,
      isDesktop: false,
    })

    renderWithTheme(
      <Layout>
        <div data-testid="test-child">Content</div>
      </Layout>,
    )

    expect(screen.getByTestId('mobile-layout')).toBeInTheDocument()
    expect(screen.queryByTestId('desktop-layout')).not.toBeInTheDocument()
  })
})
