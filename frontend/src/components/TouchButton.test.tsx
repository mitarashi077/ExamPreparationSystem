import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import TouchButton from './TouchButton'

// Mock the app store
const mockUseAppStore = vi.fn()
vi.mock('../stores/useAppStore', () => ({
  useAppStore: () => mockUseAppStore(),
}))

const theme = createTheme()

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>)
}

describe('TouchButton', () => {
  const mockOnClick = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAppStore.mockReturnValue({
      deviceType: 'desktop',
    })

    // Mock navigator.vibrate
    Object.defineProperty(navigator, 'vibrate', {
      writable: true,
      value: vi.fn(),
    })
  })

  it('renders children correctly', () => {
    renderWithTheme(<TouchButton>Test Button</TouchButton>)

    expect(screen.getByText('Test Button')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('applies default touchSize medium', () => {
    renderWithTheme(
      <TouchButton data-testid="touch-button">Test Button</TouchButton>,
    )

    const button = screen.getByTestId('touch-button')
    expect(button).toBeInTheDocument()
    // The component should render without errors with default props
  })

  it('applies small touchSize correctly', () => {
    renderWithTheme(
      <TouchButton touchSize="small" data-testid="touch-button">
        Small Button
      </TouchButton>,
    )

    const button = screen.getByTestId('touch-button')
    expect(button).toBeInTheDocument()
    expect(screen.getByText('Small Button')).toBeInTheDocument()
  })

  it('applies large touchSize correctly', () => {
    renderWithTheme(
      <TouchButton touchSize="large" data-testid="touch-button">
        Large Button
      </TouchButton>,
    )

    const button = screen.getByTestId('touch-button')
    expect(button).toBeInTheDocument()
    expect(screen.getByText('Large Button')).toBeInTheDocument()
  })

  it('calls onClick handler when clicked', async () => {
    const user = userEvent.setup()

    renderWithTheme(
      <TouchButton onClick={mockOnClick}>Clickable Button</TouchButton>,
    )

    const button = screen.getByText('Clickable Button')
    await user.click(button)

    expect(mockOnClick).toHaveBeenCalledTimes(1)
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

    renderWithTheme(
      <TouchButton onClick={mockOnClick} hapticFeedback={true}>
        Mobile Button
      </TouchButton>,
    )

    const button = screen.getByText('Mobile Button')
    await user.click(button)

    expect(mockVibrate).toHaveBeenCalledWith(10)
    expect(mockOnClick).toHaveBeenCalledTimes(1)
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

    renderWithTheme(
      <TouchButton onClick={mockOnClick} hapticFeedback={true}>
        Desktop Button
      </TouchButton>,
    )

    const button = screen.getByText('Desktop Button')
    await user.click(button)

    expect(mockVibrate).not.toHaveBeenCalled()
    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it('does not trigger haptic feedback when disabled', async () => {
    const user = userEvent.setup()
    const mockVibrate = vi.fn()

    mockUseAppStore.mockReturnValue({
      deviceType: 'mobile',
    })

    Object.defineProperty(navigator, 'vibrate', {
      writable: true,
      value: mockVibrate,
    })

    renderWithTheme(
      <TouchButton onClick={mockOnClick} hapticFeedback={false}>
        No Haptic Button
      </TouchButton>,
    )

    const button = screen.getByText('No Haptic Button')
    await user.click(button)

    expect(mockVibrate).not.toHaveBeenCalled()
    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it('handles missing vibrate API gracefully', async () => {
    const user = userEvent.setup()

    mockUseAppStore.mockReturnValue({
      deviceType: 'mobile',
    })

    // Remove vibrate from navigator
    Object.defineProperty(navigator, 'vibrate', {
      writable: true,
      value: undefined,
    })

    renderWithTheme(
      <TouchButton onClick={mockOnClick} hapticFeedback={true}>
        No Vibrate Button
      </TouchButton>,
    )

    const button = screen.getByText('No Vibrate Button')

    // Should not throw an error
    await user.click(button)
    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it('passes through other Button props', () => {
    renderWithTheme(
      <TouchButton
        color="primary"
        variant="contained"
        disabled={true}
        data-testid="styled-button"
      >
        Styled Button
      </TouchButton>,
    )

    const button = screen.getByTestId('styled-button')
    expect(button).toBeInTheDocument()
    expect(button).toBeDisabled()
    expect(screen.getByText('Styled Button')).toBeInTheDocument()
  })

  it('works with different button variants', () => {
    renderWithTheme(
      <TouchButton variant="outlined" color="secondary">
        Outlined Button
      </TouchButton>,
    )

    expect(screen.getByText('Outlined Button')).toBeInTheDocument()
  })

  it('can be used as a submit button', () => {
    renderWithTheme(
      <TouchButton type="submit" data-testid="submit-button">
        Submit
      </TouchButton>,
    )

    const button = screen.getByTestId('submit-button')
    expect(button).toHaveAttribute('type', 'submit')
  })

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>()

    renderWithTheme(<TouchButton ref={ref}>Button with Ref</TouchButton>)

    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    expect(ref.current?.textContent).toBe('Button with Ref')
  })

  it('handles tablet device type', async () => {
    const user = userEvent.setup()
    const mockVibrate = vi.fn()

    mockUseAppStore.mockReturnValue({
      deviceType: 'tablet',
    })

    Object.defineProperty(navigator, 'vibrate', {
      writable: true,
      value: mockVibrate,
    })

    renderWithTheme(
      <TouchButton onClick={mockOnClick} hapticFeedback={true}>
        Tablet Button
      </TouchButton>,
    )

    const button = screen.getByText('Tablet Button')
    await user.click(button)

    // Should not vibrate on tablet (only mobile)
    expect(mockVibrate).not.toHaveBeenCalled()
    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it('handles click events properly with synthetic events', () => {
    renderWithTheme(
      <TouchButton onClick={mockOnClick}>Event Button</TouchButton>,
    )

    const button = screen.getByText('Event Button')
    fireEvent.click(button)

    expect(mockOnClick).toHaveBeenCalledTimes(1)
    expect(mockOnClick).toHaveBeenCalledWith(expect.any(Object))
  })

  it('works without onClick handler', async () => {
    const user = userEvent.setup()

    renderWithTheme(<TouchButton>Button Without Click</TouchButton>)

    const button = screen.getByText('Button Without Click')

    // Should not throw an error when clicked
    await user.click(button)
    expect(button).toBeInTheDocument()
  })
})
