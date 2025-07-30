import { useState, useEffect } from 'react'

export interface HeatmapData {
  categoryId: string
  categoryName: string
  attempts: number
  accuracy: number
  colorIntensity: number
}

export interface StudyStats {
  summary: {
    totalAnswers: number
    correctAnswers: number
    accuracy: number
    period: string
  }
  daily: Array<{
    date: string
    correctAnswers: number
    totalAnswers: number
    accuracy: number
    averageTime: number
  }>
}

export interface HeatmapResponse {
  heatmapData: HeatmapData[]
  period: string
  updatedAt: string
}

export const useHeatmapData = (days: number = 30) => {
  const [data, setData] = useState<HeatmapData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  const fetchHeatmapData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/answers/heatmap?days=${days}`)
      if (!response.ok) {
        throw new Error('ヒートマップデータの取得に失敗しました')
      }
      
      const result: HeatmapResponse = await response.json()
      setData(result.heatmapData)
      setLastUpdated(result.updatedAt)
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHeatmapData()
  }, [days])

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh: fetchHeatmapData
  }
}

export const useStudyStats = (days: number = 7) => {
  const [data, setData] = useState<StudyStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/answers/stats?days=${days}`)
      if (!response.ok) {
        throw new Error('統計データの取得に失敗しました')
      }
      
      const result: StudyStats = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [days])

  return {
    data,
    loading,
    error,
    refresh: fetchStats
  }
}