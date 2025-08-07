import { renderHook, act } from '@testing-library/react'
import { vi } from 'vitest'
import { useOfflineSync } from './useOfflineSync'

describe('useOfflineSync', () => {
  const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
    })
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    })
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  it('initializes with online status from navigator', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    })

    const { result } = renderHook(() => useOfflineSync())

    expect(result.current.syncStatus.isOnline).toBe(false)
    expect(result.current.syncStatus.pendingCount).toBe(0)
    expect(result.current.syncStatus.lastSyncTime).toBe(null)
    expect(result.current.syncStatus.syncing).toBe(false)
  })

  it('initializes with online status true', () => {
    const { result } = renderHook(() => useOfflineSync())

    expect(result.current.syncStatus.isOnline).toBe(true)
    expect(result.current.syncStatus.pendingCount).toBe(0)
    expect(result.current.syncStatus.lastSyncTime).toBe(null)
    expect(result.current.syncStatus.syncing).toBe(false)
  })

  it('provides manualSync function', () => {
    const { result } = renderHook(() => useOfflineSync())

    expect(typeof result.current.manualSync).toBe('function')
  })

  it('handles localStorage errors gracefully when loading offline data', () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    mockLocalStorage.getItem.mockImplementation(() => {
      throw new Error('Storage error')
    })

    const { result } = renderHook(() => useOfflineSync())

    // Should not throw and should have default values
    expect(result.current.syncStatus.pendingCount).toBe(0)
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to load offline data:',
      expect.any(Error),
    )

    consoleErrorSpy.mockRestore()
  })

  it('handles localStorage errors gracefully when saving offline data', () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    mockLocalStorage.setItem.mockImplementation(() => {
      throw new Error('Storage error')
    })

    const { result } = renderHook(() => useOfflineSync())

    // The hook should handle save errors without crashing
    expect(result.current.syncStatus).toBeDefined()

    consoleErrorSpy.mockRestore()
  })

  it('loads existing offline data count on initialization', () => {
    const mockOfflineData = JSON.stringify([
      { timestamp: Date.now(), type: 'answer', data: { questionId: 'q1' } },
      { timestamp: Date.now(), type: 'progress', data: { score: 85 } },
    ])
    mockLocalStorage.getItem.mockReturnValue(mockOfflineData)

    const { result } = renderHook(() => useOfflineSync())

    expect(result.current.syncStatus.pendingCount).toBe(2)
  })

  it('handles invalid JSON in localStorage', () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    mockLocalStorage.getItem.mockReturnValue('invalid-json')

    const { result } = renderHook(() => useOfflineSync())

    expect(result.current.syncStatus.pendingCount).toBe(0)
    expect(consoleErrorSpy).toHaveBeenCalled()

    consoleErrorSpy.mockRestore()
  })

  it('responds to online/offline events', () => {
    const { result } = renderHook(() => useOfflineSync())

    // Simulate going offline
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    })

    act(() => {
      window.dispatchEvent(new Event('offline'))
    })

    expect(result.current.syncStatus.isOnline).toBe(false)

    // Simulate going online
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    })

    act(() => {
      window.dispatchEvent(new Event('online'))
    })

    expect(result.current.syncStatus.isOnline).toBe(true)
  })

  it('loads last sync time from localStorage', () => {
    const lastSyncTime = '2023-01-01T12:00:00Z'
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'exam_prep_last_sync') {
        return lastSyncTime
      }
      return null
    })

    const { result } = renderHook(() => useOfflineSync())

    expect(result.current.syncStatus.lastSyncTime).toEqual(
      new Date(lastSyncTime),
    )
  })

  it('handles invalid last sync time gracefully', () => {
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'exam_prep_last_sync') {
        return 'invalid-date'
      }
      return null
    })

    const { result } = renderHook(() => useOfflineSync())

    expect(result.current.syncStatus.lastSyncTime).toBe(null)
  })

  it('cleans up event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() => useOfflineSync())

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
})
