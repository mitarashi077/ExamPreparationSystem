import { useState, useEffect, useCallback } from 'react'

interface OfflineData {
  timestamp: number
  type: 'answer' | 'progress' | 'session'
  data: any
}

interface SyncStatus {
  isOnline: boolean
  pendingCount: number
  lastSyncTime: Date | null
  syncing: boolean
}

const OFFLINE_STORAGE_KEY = 'exam_prep_offline_data'
const LAST_SYNC_KEY = 'exam_prep_last_sync'

export const useOfflineSync = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    pendingCount: 0,
    lastSyncTime: null,
    syncing: false,
  })

  // オフラインデータを取得
  const getOfflineData = useCallback((): OfflineData[] => {
    try {
      const stored = localStorage.getItem(OFFLINE_STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Failed to load offline data:', error)
      return []
    }
  }, [])

  // オフラインデータを保存
  const saveOfflineData = useCallback((data: OfflineData[]) => {
    try {
      localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(data))
      setSyncStatus((prev) => ({ ...prev, pendingCount: data.length }))
    } catch (error) {
      console.error('Failed to save offline data:', error)
    }
  }, [])

  // データをオフラインキューに追加
  const addToOfflineQueue = useCallback(
    (type: OfflineData['type'], data: any) => {
      const offlineData = getOfflineData()
      const newEntry: OfflineData = {
        timestamp: Date.now(),
        type,
        data,
      }

      offlineData.push(newEntry)
      saveOfflineData(offlineData)

      console.log(`Added to offline queue: ${type}`, data)
    },
    [getOfflineData, saveOfflineData],
  )

  // オンライン復帰時の同期処理
  const syncOfflineData = useCallback(async () => {
    if (!syncStatus.isOnline || syncStatus.syncing) return

    const offlineData = getOfflineData()
    if (offlineData.length === 0) return

    setSyncStatus((prev) => ({ ...prev, syncing: true }))

    try {
      let successCount = 0
      const failedData: OfflineData[] = []

      for (const item of offlineData) {
        try {
          await syncSingleItem(item)
          successCount++
        } catch (error) {
          console.error(`Failed to sync item:`, item, error)
          failedData.push(item)
        }
      }

      // 同期に失敗したデータのみ保持
      saveOfflineData(failedData)

      // 最終同期時刻を更新
      const now = new Date()
      localStorage.setItem(LAST_SYNC_KEY, now.toISOString())

      setSyncStatus((prev) => ({
        ...prev,
        syncing: false,
        lastSyncTime: now,
        pendingCount: failedData.length,
      }))

      console.log(
        `Sync completed: ${successCount} success, ${failedData.length} failed`,
      )
    } catch (error) {
      console.error('Sync process failed:', error)
      setSyncStatus((prev) => ({ ...prev, syncing: false }))
    }
  }, [syncStatus.isOnline, syncStatus.syncing, getOfflineData, saveOfflineData])

  // 個別アイテムの同期
  const syncSingleItem = async (item: OfflineData): Promise<void> => {
    const { type, data } = item

    switch (type) {
      case 'answer':
        await fetch('/api/answers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        break

      case 'progress':
        // 進捗データの同期（必要に応じて実装）
        break

      case 'session':
        // セッションデータの同期（必要に応じて実装）
        break

      default:
        throw new Error(`Unknown sync type: ${type}`)
    }
  }

  // オンライン・オフライン状態の監視
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus((prev) => ({ ...prev, isOnline: true }))
      syncOfflineData() // 自動同期
    }

    const handleOffline = () => {
      setSyncStatus((prev) => ({ ...prev, isOnline: false }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // 初期化時にペンディングデータ数をチェック
    const offlineData = getOfflineData()
    const lastSyncStr = localStorage.getItem(LAST_SYNC_KEY)
    const lastSyncTime = lastSyncStr ? new Date(lastSyncStr) : null

    setSyncStatus((prev) => ({
      ...prev,
      pendingCount: offlineData.length,
      lastSyncTime,
    }))

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [syncOfflineData, getOfflineData])

  // 手動同期
  const manualSync = useCallback(async () => {
    if (syncStatus.isOnline) {
      await syncOfflineData()
    }
  }, [syncStatus.isOnline, syncOfflineData])

  // オフラインデータクリア
  const clearOfflineData = useCallback(() => {
    localStorage.removeItem(OFFLINE_STORAGE_KEY)
    localStorage.removeItem(LAST_SYNC_KEY)
    setSyncStatus((prev) => ({
      ...prev,
      pendingCount: 0,
      lastSyncTime: null,
    }))
  }, [])

  return {
    syncStatus,
    addToOfflineQueue,
    manualSync,
    clearOfflineData,
    getOfflineData,
  }
}
