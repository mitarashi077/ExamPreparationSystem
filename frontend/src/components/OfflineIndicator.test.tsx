import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import OfflineIndicator from './OfflineIndicator'

// Mock the offline sync hook
const mockUseOfflineSync = vi.fn()
vi.mock('../hooks/useOfflineSync', () => ({
  useOfflineSync: () => mockUseOfflineSync(),
}))

const theme = createTheme()

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>)
}

describe('OfflineIndicator', () => {
  const mockManualSync = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseOfflineSync.mockReturnValue({
      syncStatus: {
        isOnline: true,
        syncing: false,
        pendingCount: 0,
        lastSyncTime: null,
      },
      manualSync: mockManualSync,
    })
  })

  describe('online status', () => {
    it('displays online status when connected', () => {
      renderWithTheme(<OfflineIndicator />)

      expect(screen.getByText('オンライン')).toBeInTheDocument()
    })

    it('displays offline status when disconnected', () => {
      mockUseOfflineSync.mockReturnValue({
        syncStatus: {
          isOnline: false,
          syncing: false,
          pendingCount: 0,
          lastSyncTime: null,
        },
        manualSync: mockManualSync,
      })

      renderWithTheme(<OfflineIndicator />)

      expect(screen.getByText('オフライン')).toBeInTheDocument()
    })

    it('displays pending sync count when items are pending', () => {
      mockUseOfflineSync.mockReturnValue({
        syncStatus: {
          isOnline: true,
          syncing: false,
          pendingCount: 5,
          lastSyncTime: null,
        },
        manualSync: mockManualSync,
      })

      renderWithTheme(<OfflineIndicator />)

      expect(screen.getByText('5件未同期')).toBeInTheDocument()
    })

    it('displays syncing status when syncing', () => {
      mockUseOfflineSync.mockReturnValue({
        syncStatus: {
          isOnline: true,
          syncing: true,
          pendingCount: 3,
          lastSyncTime: null,
        },
        manualSync: mockManualSync,
      })

      renderWithTheme(<OfflineIndicator />)

      expect(screen.getByText('同期中...')).toBeInTheDocument()
    })
  })

  describe('compact mode', () => {
    it('renders compact chip view when compact is true', () => {
      renderWithTheme(<OfflineIndicator compact={true} />)

      expect(screen.getByText('同期済み')).toBeInTheDocument()
    })

    it('shows offline label in compact mode when offline', () => {
      mockUseOfflineSync.mockReturnValue({
        syncStatus: {
          isOnline: false,
          syncing: false,
          pendingCount: 0,
          lastSyncTime: null,
        },
        manualSync: mockManualSync,
      })

      renderWithTheme(<OfflineIndicator compact={true} />)

      expect(screen.getByText('オフライン')).toBeInTheDocument()
    })

    it('shows badge with pending count in compact mode', () => {
      mockUseOfflineSync.mockReturnValue({
        syncStatus: {
          isOnline: true,
          syncing: false,
          pendingCount: 3,
          lastSyncTime: null,
        },
        manualSync: mockManualSync,
      })

      renderWithTheme(<OfflineIndicator compact={true} />)

      // Badge content should be present
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('makes chip clickable when there are pending items in compact mode', async () => {
      const user = userEvent.setup()

      mockUseOfflineSync.mockReturnValue({
        syncStatus: {
          isOnline: true,
          syncing: false,
          pendingCount: 2,
          lastSyncTime: null,
        },
        manualSync: mockManualSync,
      })

      renderWithTheme(<OfflineIndicator compact={true} />)

      const chip = screen.getByRole('button')
      await user.click(chip)

      expect(mockManualSync).toHaveBeenCalled()
    })
  })

  describe('sync functionality', () => {
    it('shows sync button when online with pending items', () => {
      mockUseOfflineSync.mockReturnValue({
        syncStatus: {
          isOnline: true,
          syncing: false,
          pendingCount: 3,
          lastSyncTime: null,
        },
        manualSync: mockManualSync,
      })

      renderWithTheme(<OfflineIndicator />)

      expect(screen.getByRole('button', { name: '同期' })).toBeInTheDocument()
    })

    it('does not show sync button when offline', () => {
      mockUseOfflineSync.mockReturnValue({
        syncStatus: {
          isOnline: false,
          syncing: false,
          pendingCount: 3,
          lastSyncTime: null,
        },
        manualSync: mockManualSync,
      })

      renderWithTheme(<OfflineIndicator />)

      expect(
        screen.queryByRole('button', { name: '同期' }),
      ).not.toBeInTheDocument()
    })

    it('does not show sync button when no pending items', () => {
      renderWithTheme(<OfflineIndicator />)

      expect(
        screen.queryByRole('button', { name: '同期' }),
      ).not.toBeInTheDocument()
    })

    it('calls manualSync when sync button is clicked', async () => {
      const user = userEvent.setup()

      mockUseOfflineSync.mockReturnValue({
        syncStatus: {
          isOnline: true,
          syncing: false,
          pendingCount: 2,
          lastSyncTime: null,
        },
        manualSync: mockManualSync,
      })

      renderWithTheme(<OfflineIndicator />)

      const syncButton = screen.getByRole('button', { name: '同期' })
      await user.click(syncButton)

      expect(mockManualSync).toHaveBeenCalled()
    })

    it('disables sync button when syncing', () => {
      mockUseOfflineSync.mockReturnValue({
        syncStatus: {
          isOnline: true,
          syncing: true,
          pendingCount: 2,
          lastSyncTime: null,
        },
        manualSync: mockManualSync,
      })

      renderWithTheme(<OfflineIndicator />)

      const syncButton = screen.getByRole('button', { name: '同期' })
      expect(syncButton).toBeDisabled()
    })
  })

  describe('progress indicator', () => {
    it('shows progress bar when syncing', () => {
      mockUseOfflineSync.mockReturnValue({
        syncStatus: {
          isOnline: true,
          syncing: true,
          pendingCount: 1,
          lastSyncTime: null,
        },
        manualSync: mockManualSync,
      })

      renderWithTheme(<OfflineIndicator />)

      expect(screen.getByRole('progressbar')).toBeInTheDocument()
      expect(screen.getByText('データを同期しています...')).toBeInTheDocument()
    })

    it('does not show progress bar when not syncing', () => {
      renderWithTheme(<OfflineIndicator />)

      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
      expect(
        screen.queryByText('データを同期しています...'),
      ).not.toBeInTheDocument()
    })
  })

  describe('last sync time', () => {
    it('displays last sync time when available', () => {
      const lastSyncTime = new Date('2023-01-01T12:00:00Z')

      mockUseOfflineSync.mockReturnValue({
        syncStatus: {
          isOnline: true,
          syncing: false,
          pendingCount: 0,
          lastSyncTime,
        },
        manualSync: mockManualSync,
      })

      renderWithTheme(<OfflineIndicator />)

      expect(screen.getByText(/最終同期:/)).toBeInTheDocument()
    })

    it('does not display last sync time when not available', () => {
      renderWithTheme(<OfflineIndicator />)

      expect(screen.queryByText(/最終同期:/)).not.toBeInTheDocument()
    })
  })

  describe('alerts', () => {
    it('shows offline alert when showAlert is true and offline', () => {
      mockUseOfflineSync.mockReturnValue({
        syncStatus: {
          isOnline: false,
          syncing: false,
          pendingCount: 0,
          lastSyncTime: null,
        },
        manualSync: mockManualSync,
      })

      renderWithTheme(<OfflineIndicator showAlert={true} />)

      expect(screen.getByText('オフラインモードで動作中')).toBeInTheDocument()
      expect(
        screen.getByText(
          '学習データはローカルに保存され、オンライン復帰時に自動同期されます。',
        ),
      ).toBeInTheDocument()
    })

    it('shows pending sync alert when showAlert is true and has pending items', () => {
      mockUseOfflineSync.mockReturnValue({
        syncStatus: {
          isOnline: true,
          syncing: false,
          pendingCount: 5,
          lastSyncTime: null,
        },
        manualSync: mockManualSync,
      })

      renderWithTheme(<OfflineIndicator showAlert={true} />)

      expect(screen.getByText('5件のデータが未同期です')).toBeInTheDocument()
      expect(
        screen.getByText(
          'オンライン接続が安定している時に同期を実行してください。',
        ),
      ).toBeInTheDocument()
    })

    it('does not show alerts when showAlert is false', () => {
      mockUseOfflineSync.mockReturnValue({
        syncStatus: {
          isOnline: false,
          syncing: false,
          pendingCount: 3,
          lastSyncTime: null,
        },
        manualSync: mockManualSync,
      })

      renderWithTheme(<OfflineIndicator showAlert={false} />)

      expect(
        screen.queryByText('オフラインモードで動作中'),
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText('3件のデータが未同期です'),
      ).not.toBeInTheDocument()
    })

    it('does not show alerts when online with no pending items', () => {
      renderWithTheme(<OfflineIndicator showAlert={true} />)

      expect(
        screen.queryByText('オフラインモードで動作中'),
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText(/件のデータが未同期です/),
      ).not.toBeInTheDocument()
    })
  })

  describe('tooltip in compact mode', () => {
    it('shows tooltip with status text in compact mode', () => {
      mockUseOfflineSync.mockReturnValue({
        syncStatus: {
          isOnline: true,
          syncing: false,
          pendingCount: 2,
          lastSyncTime: null,
        },
        manualSync: mockManualSync,
      })

      renderWithTheme(<OfflineIndicator compact={true} />)

      // Tooltip should be present in the DOM even if not visible
      const chip = screen.getByRole('button')
      expect(chip.closest('[data-mui-internal-clone-element]')).toBeTruthy()
    })
  })

  describe('status colors', () => {
    it('uses error color when offline', () => {
      mockUseOfflineSync.mockReturnValue({
        syncStatus: {
          isOnline: false,
          syncing: false,
          pendingCount: 0,
          lastSyncTime: null,
        },
        manualSync: mockManualSync,
      })

      renderWithTheme(<OfflineIndicator />)

      expect(screen.getByText('オフライン')).toBeInTheDocument()
    })

    it('uses warning color when pending items exist', () => {
      mockUseOfflineSync.mockReturnValue({
        syncStatus: {
          isOnline: true,
          syncing: false,
          pendingCount: 1,
          lastSyncTime: null,
        },
        manualSync: mockManualSync,
      })

      renderWithTheme(<OfflineIndicator />)

      expect(screen.getByText('1件未同期')).toBeInTheDocument()
    })

    it('uses success color when online and synced', () => {
      renderWithTheme(<OfflineIndicator />)

      expect(screen.getByText('オンライン')).toBeInTheDocument()
    })
  })
})
