import { renderHook, act } from '@testing-library/react'
import { vi } from 'vitest'
import { useSwipeNavigation } from './useSwipeNavigation'

// Mock react-router-dom
const mockNavigate = vi.fn()
const mockLocation = { pathname: '/' }

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
}))

// Mock react-swipeable
const mockUseSwipeable = vi.fn()
vi.mock('react-swipeable', () => ({
  useSwipeable: (config: any) => {
    mockUseSwipeable(config)
    return {
      onSwipedLeft: config.onSwipedLeft,
      onSwipedRight: config.onSwipedRight,
      ref: vi.fn(),
    }
  },
}))

// Mock app store
const mockUseAppStore = vi.fn()
vi.mock('../stores/useAppStore', () => ({
  useAppStore: () => mockUseAppStore(),
}))

describe('useSwipeNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAppStore.mockReturnValue({
      deviceType: 'mobile',
    })
  })

  it('initializes with correct navigation items', () => {
    const { result } = renderHook(() => useSwipeNavigation())

    expect(result.current.navigationItems).toEqual([
      { path: '/', name: 'ホーム' },
      { path: '/practice', name: '問題演習' },
      { path: '/progress', name: '進捗確認' },
      { path: '/settings', name: '設定' },
    ])
  })

  it('returns correct current index for home page', () => {
    mockLocation.pathname = '/'

    const { result } = renderHook(() => useSwipeNavigation())

    expect(result.current.currentIndex).toBe(0)
  })

  it('returns correct current index for practice page', () => {
    mockLocation.pathname = '/practice'

    const { result } = renderHook(() => useSwipeNavigation())

    expect(result.current.currentIndex).toBe(1)
  })

  it('returns -1 for unknown paths', () => {
    mockLocation.pathname = '/unknown'

    const { result } = renderHook(() => useSwipeNavigation())

    expect(result.current.currentIndex).toBe(-1)
  })

  it('determines canSwipeLeft correctly', () => {
    // At home (index 0) - cannot swipe left
    mockLocation.pathname = '/'
    const { result: result1 } = renderHook(() => useSwipeNavigation())
    expect(result1.current.canSwipeLeft).toBe(false)

    // At practice (index 1) - can swipe left
    mockLocation.pathname = '/practice'
    const { result: result2 } = renderHook(() => useSwipeNavigation())
    expect(result2.current.canSwipeLeft).toBe(true)
  })

  it('determines canSwipeRight correctly', () => {
    // At settings (last index) - cannot swipe right
    mockLocation.pathname = '/settings'
    const { result: result1 } = renderHook(() => useSwipeNavigation())
    expect(result1.current.canSwipeRight).toBe(false)

    // At home (index 0) - can swipe right
    mockLocation.pathname = '/'
    const { result: result2 } = renderHook(() => useSwipeNavigation())
    expect(result2.current.canSwipeRight).toBe(true)
  })

  it('configures swipeable with correct options', () => {
    renderHook(() => useSwipeNavigation())

    expect(mockUseSwipeable).toHaveBeenCalledWith({
      onSwipedLeft: expect.any(Function),
      onSwipedRight: expect.any(Function),
      preventScrollOnSwipe: true,
      trackMouse: false,
      delta: 50,
    })
  })

  it('handles swipe left on mobile devices', () => {
    mockLocation.pathname = '/'
    mockUseAppStore.mockReturnValue({ deviceType: 'mobile' })

    renderHook(() => useSwipeNavigation())

    const swipeConfig = mockUseSwipeable.mock.calls[0][0]

    act(() => {
      swipeConfig.onSwipedLeft()
    })

    expect(mockNavigate).toHaveBeenCalledWith('/practice')
  })

  it('handles swipe right on mobile devices', () => {
    mockLocation.pathname = '/practice'
    mockUseAppStore.mockReturnValue({ deviceType: 'mobile' })

    renderHook(() => useSwipeNavigation())

    const swipeConfig = mockUseSwipeable.mock.calls[0][0]

    act(() => {
      swipeConfig.onSwipedRight()
    })

    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('does not navigate beyond boundaries when swiping left', () => {
    mockLocation.pathname = '/settings' // Last page
    mockUseAppStore.mockReturnValue({ deviceType: 'mobile' })

    renderHook(() => useSwipeNavigation())

    const swipeConfig = mockUseSwipeable.mock.calls[0][0]

    act(() => {
      swipeConfig.onSwipedLeft()
    })

    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('does not navigate beyond boundaries when swiping right', () => {
    mockLocation.pathname = '/' // First page
    mockUseAppStore.mockReturnValue({ deviceType: 'mobile' })

    renderHook(() => useSwipeNavigation())

    const swipeConfig = mockUseSwipeable.mock.calls[0][0]

    act(() => {
      swipeConfig.onSwipedRight()
    })

    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('does not respond to swipes on desktop devices', () => {
    mockLocation.pathname = '/'
    mockUseAppStore.mockReturnValue({ deviceType: 'desktop' })

    renderHook(() => useSwipeNavigation())

    const swipeConfig = mockUseSwipeable.mock.calls[0][0]

    act(() => {
      swipeConfig.onSwipedLeft()
    })

    expect(mockNavigate).not.toHaveBeenCalled()

    act(() => {
      swipeConfig.onSwipedRight()
    })

    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('does not respond to swipes on tablet devices', () => {
    mockLocation.pathname = '/'
    mockUseAppStore.mockReturnValue({ deviceType: 'tablet' })

    renderHook(() => useSwipeNavigation())

    const swipeConfig = mockUseSwipeable.mock.calls[0][0]

    act(() => {
      swipeConfig.onSwipedLeft()
    })

    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('handles unknown paths gracefully when swiping', () => {
    mockLocation.pathname = '/unknown'
    mockUseAppStore.mockReturnValue({ deviceType: 'mobile' })

    renderHook(() => useSwipeNavigation())

    const swipeConfig = mockUseSwipeable.mock.calls[0][0]

    // Clear any previous navigate calls
    mockNavigate.mockClear()

    act(() => {
      swipeConfig.onSwipedLeft()
    })

    expect(mockNavigate).not.toHaveBeenCalled()

    act(() => {
      swipeConfig.onSwipedRight()
    })

    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('navigates through multiple pages correctly', () => {
    mockLocation.pathname = '/'
    mockUseAppStore.mockReturnValue({ deviceType: 'mobile' })

    const { rerender } = renderHook(() => useSwipeNavigation())

    // Swipe left from home to practice
    let swipeConfig = mockUseSwipeable.mock.calls[0][0]
    act(() => {
      swipeConfig.onSwipedLeft()
    })
    expect(mockNavigate).toHaveBeenCalledWith('/practice')

    // Update location and rerender
    mockLocation.pathname = '/practice'
    rerender()

    // Swipe left from practice to progress
    swipeConfig = mockUseSwipeable.mock.calls[1][0]
    act(() => {
      swipeConfig.onSwipedLeft()
    })
    expect(mockNavigate).toHaveBeenCalledWith('/progress')

    // Update location and rerender
    mockLocation.pathname = '/progress'
    rerender()

    // Swipe right from progress back to practice
    swipeConfig = mockUseSwipeable.mock.calls[2][0]
    act(() => {
      swipeConfig.onSwipedRight()
    })
    expect(mockNavigate).toHaveBeenCalledWith('/practice')
  })

  it('returns swipe handlers for use in components', () => {
    const { result } = renderHook(() => useSwipeNavigation())

    expect(result.current.swipeHandlers).toBeDefined()
    expect(typeof result.current.swipeHandlers.onSwipedLeft).toBe('function')
    expect(typeof result.current.swipeHandlers.onSwipedRight).toBe('function')
  })
})
