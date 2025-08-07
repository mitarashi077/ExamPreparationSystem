import { renderHook, act } from '@testing-library/react'
import { vi } from 'vitest'

import React from 'react'
import { useDeviceDetection } from './useDeviceDetection'

// Mock MUI useMediaQuery
vi.mock('@mui/material/useMediaQuery', () => ({
  default: vi.fn(),
}))

// Mock the app store
vi.mock('../stores/useAppStore', () => ({
  useAppStore: vi.fn(() => ({
    setDeviceType: vi.fn(),
    setOnlineStatus: vi.fn(),
  })),
}))

// Mock theme
vi.mock('@mui/material/styles', () => ({
  useTheme: vi.fn(() => ({
    breakpoints: {
      down: vi.fn(),
      between: vi.fn(),
      up: vi.fn(),
    },
  })),
  createTheme: () => ({}),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}))

const mockUseMediaQuery = vi.mocked(
  require('@mui/material/useMediaQuery').default,
)
const mockUseAppStore = vi.mocked(require('../stores/useAppStore').useAppStore)

describe('useDeviceDetection', () => {
  const mockSetDeviceType = vi.fn()
  const mockSetOnlineStatus = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAppStore.mockReturnValue({
      setDeviceType: mockSetDeviceType,
      setOnlineStatus: mockSetOnlineStatus,
    })

    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    })
  })

  it('detects mobile device correctly', () => {
    mockUseMediaQuery
      .mockReturnValueOnce(true) // isMobile
      .mockReturnValueOnce(false) // isTablet
      .mockReturnValueOnce(false) // isDesktop

    const { result } = renderHook(() => useDeviceDetection())

    expect(result.current.isMobile).toBe(true)
    expect(result.current.isTablet).toBe(false)
    expect(result.current.isDesktop).toBe(false)
    expect(mockSetDeviceType).toHaveBeenCalledWith('mobile')
  })

  it('detects tablet device correctly', () => {
    mockUseMediaQuery
      .mockReturnValueOnce(false) // isMobile
      .mockReturnValueOnce(true) // isTablet
      .mockReturnValueOnce(false) // isDesktop

    const { result } = renderHook(() => useDeviceDetection())

    expect(result.current.isMobile).toBe(false)
    expect(result.current.isTablet).toBe(true)
    expect(result.current.isDesktop).toBe(false)
    expect(mockSetDeviceType).toHaveBeenCalledWith('tablet')
  })

  it('detects desktop device correctly', () => {
    mockUseMediaQuery
      .mockReturnValueOnce(false) // isMobile
      .mockReturnValueOnce(false) // isTablet
      .mockReturnValueOnce(true) // isDesktop

    const { result } = renderHook(() => useDeviceDetection())

    expect(result.current.isMobile).toBe(false)
    expect(result.current.isTablet).toBe(false)
    expect(result.current.isDesktop).toBe(true)
    expect(mockSetDeviceType).toHaveBeenCalledWith('desktop')
  })

  it('sets initial online status', () => {
    mockUseMediaQuery
      .mockReturnValueOnce(false) // isMobile
      .mockReturnValueOnce(false) // isTablet
      .mockReturnValueOnce(true) // isDesktop

    renderHook(() => useDeviceDetection())

    expect(mockSetOnlineStatus).toHaveBeenCalledWith(true)
  })

  it('handles online/offline events', () => {
    mockUseMediaQuery
      .mockReturnValueOnce(false) // isMobile
      .mockReturnValueOnce(false) // isTablet
      .mockReturnValueOnce(true) // isDesktop

    renderHook(() => useDeviceDetection())

    // Simulate going offline
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    })

    act(() => {
      window.dispatchEvent(new Event('offline'))
    })

    expect(mockSetOnlineStatus).toHaveBeenCalledWith(false)

    // Simulate going online
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    })

    act(() => {
      window.dispatchEvent(new Event('online'))
    })

    expect(mockSetOnlineStatus).toHaveBeenCalledWith(true)
  })

  it('cleans up event listeners on unmount', () => {
    mockUseMediaQuery
      .mockReturnValueOnce(false) // isMobile
      .mockReturnValueOnce(false) // isTablet
      .mockReturnValueOnce(true) // isDesktop

    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() => useDeviceDetection())

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'online',
      expect.any(Function),
    )
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'offline',
      expect.any(Function),
    )
  })

  it('updates device type when media queries change', () => {
    const { rerender } = renderHook(() => useDeviceDetection())

    // Initial state - desktop
    mockUseMediaQuery
      .mockReturnValueOnce(false) // isMobile
      .mockReturnValueOnce(false) // isTablet
      .mockReturnValueOnce(true) // isDesktop

    rerender()

    expect(mockSetDeviceType).toHaveBeenCalledWith('desktop')

    // Change to mobile
    mockUseMediaQuery
      .mockReturnValueOnce(true) // isMobile
      .mockReturnValueOnce(false) // isTablet
      .mockReturnValueOnce(false) // isDesktop

    rerender()

    expect(mockSetDeviceType).toHaveBeenCalledWith('mobile')
  })
})
