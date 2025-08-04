import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import {
  ExamSchedule,
  StudyTarget,
  CountdownData,
  CreateExamScheduleRequest,
  UpdateExamScheduleRequest,
  CreateStudyTargetRequest,
  UpdateStudyTargetRequest,
  UpdateProgressRequest
} from '../types/examSchedule'
import apiClient from '../utils/apiClient'

interface ExamScheduleStore {
  // State
  currentSchedule: ExamSchedule | null
  allSchedules: ExamSchedule[]
  studyTargets: StudyTarget[]
  countdown: CountdownData
  isLoading: boolean
  error: string | null
  countdownTimer: NodeJS.Timeout | null

  // Actions
  fetchExamSchedules: () => Promise<void>
  setCurrentSchedule: (schedule: ExamSchedule | null) => void
  createExamSchedule: (data: CreateExamScheduleRequest) => Promise<ExamSchedule>
  updateExamSchedule: (id: string, data: UpdateExamScheduleRequest) => Promise<ExamSchedule>
  deleteExamSchedule: (id: string) => Promise<void>
  
  fetchStudyTargets: (scheduleId: string) => Promise<void>
  createStudyTarget: (data: CreateStudyTargetRequest) => Promise<StudyTarget>
  updateStudyTarget: (id: string, data: UpdateStudyTargetRequest) => Promise<StudyTarget>
  deleteStudyTarget: (id: string) => Promise<void>
  
  updateProgress: (scheduleId: string, data: UpdateProgressRequest) => Promise<StudyTarget>
  
  // Real-time countdown
  startCountdownTimer: () => void
  stopCountdownTimer: () => void
  updateCountdown: () => void
  
  // Utility actions
  clearError: () => void
  setLoading: (loading: boolean) => void
}

// カウントダウン計算ヘルパー
const calculateCountdown = (examDate: string): CountdownData => {
  const now = new Date()
  const exam = new Date(examDate)
  const timeDiff = exam.getTime() - now.getTime()
  
  if (timeDiff <= 0) {
    return {
      daysRemaining: 0,
      hoursRemaining: 0,
      minutesRemaining: 0,
      isExpired: true
    }
  }
  
  const daysRemaining = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
  const hoursRemaining = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutesRemaining = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
  
  return {
    daysRemaining,
    hoursRemaining,
    minutesRemaining,
    isExpired: false
  }
}

export const useExamScheduleStore = create<ExamScheduleStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentSchedule: null,
      allSchedules: [],
      studyTargets: [],
      countdown: {
        daysRemaining: 0,
        hoursRemaining: 0,
        minutesRemaining: 0,
        isExpired: true
      },
      isLoading: false,
      error: null,
      countdownTimer: null,

      // Actions
      fetchExamSchedules: async () => {
        set({ isLoading: true, error: null })
        try {
          const response = await apiClient.get('/api/exam-schedules')
          const schedules = response.data.data || []
          
          set({ 
            allSchedules: schedules,
            isLoading: false 
          })
          
          // 最新の有効な試験をcurrentScheduleに設定
          const activeSchedules = schedules.filter((s: ExamSchedule) => !s.isExpired)
          if (activeSchedules.length > 0) {
            const nearestSchedule = activeSchedules.sort((a: ExamSchedule, b: ExamSchedule) => 
              new Date(a.examDate).getTime() - new Date(b.examDate).getTime()
            )[0]
            set({ currentSchedule: nearestSchedule })
            get().updateCountdown()
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch exam schedules',
            isLoading: false 
          })
        }
      },

      setCurrentSchedule: (schedule) => {
        set({ currentSchedule: schedule })
        if (schedule) {
          get().updateCountdown()
          get().fetchStudyTargets(schedule.id)
        }
      },

      createExamSchedule: async (data) => {
        set({ isLoading: true, error: null })
        try {
          const response = await apiClient.post('/api/exam-schedules', data)
          const newSchedule = response.data.data
          
          set((state) => ({
            allSchedules: [newSchedule, ...state.allSchedules],
            isLoading: false
          }))
          
          return newSchedule
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create exam schedule'
          set({ error: errorMessage, isLoading: false })
          throw new Error(errorMessage)
        }
      },

      updateExamSchedule: async (id, data) => {
        set({ isLoading: true, error: null })
        try {
          const response = await apiClient.put(`/api/exam-schedules/${id}`, data)
          const updatedSchedule = response.data.data
          
          set((state) => ({
            allSchedules: state.allSchedules.map(s => 
              s.id === id ? updatedSchedule : s
            ),
            currentSchedule: state.currentSchedule?.id === id ? updatedSchedule : state.currentSchedule,
            isLoading: false
          }))
          
          // currentScheduleが更新された場合はカウントダウンも更新
          if (get().currentSchedule?.id === id) {
            get().updateCountdown()
          }
          
          return updatedSchedule
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update exam schedule'
          set({ error: errorMessage, isLoading: false })
          throw new Error(errorMessage)
        }
      },

      deleteExamSchedule: async (id) => {
        set({ isLoading: true, error: null })
        try {
          await apiClient.delete(`/api/exam-schedules/${id}`)
          
          set((state) => ({
            allSchedules: state.allSchedules.filter(s => s.id !== id),
            currentSchedule: state.currentSchedule?.id === id ? null : state.currentSchedule,
            isLoading: false
          }))
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete exam schedule'
          set({ error: errorMessage, isLoading: false })
          throw new Error(errorMessage)
        }
      },

      fetchStudyTargets: async (scheduleId) => {
        set({ isLoading: true, error: null })
        try {
          const response = await apiClient.get(`/api/exam-schedules/${scheduleId}/study-targets`)
          const targets = response.data.data || []
          
          set({ 
            studyTargets: targets,
            isLoading: false 
          })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch study targets',
            isLoading: false 
          })
        }
      },

      createStudyTarget: async (data) => {
        set({ isLoading: true, error: null })
        try {
          const response = await apiClient.post('/api/exam-schedules/study-targets', data)
          const newTarget = response.data.data
          
          set((state) => ({
            studyTargets: [newTarget, ...state.studyTargets],
            isLoading: false
          }))
          
          return newTarget
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create study target'
          set({ error: errorMessage, isLoading: false })
          throw new Error(errorMessage)
        }
      },

      updateStudyTarget: async (id, data) => {
        set({ isLoading: true, error: null })
        try {
          const response = await apiClient.put(`/api/exam-schedules/study-targets/${id}`, data)
          const updatedTarget = response.data.data
          
          set((state) => ({
            studyTargets: state.studyTargets.map(t => 
              t.id === id ? updatedTarget : t
            ),
            isLoading: false
          }))
          
          // currentScheduleの学習目標も更新
          set((state) => ({
            currentSchedule: state.currentSchedule ? {
              ...state.currentSchedule,
              studyTargets: state.currentSchedule.studyTargets.map(t =>
                t.id === id ? updatedTarget : t
              )
            } : null
          }))
          
          return updatedTarget
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update study target'
          set({ error: errorMessage, isLoading: false })
          throw new Error(errorMessage)
        }
      },

      deleteStudyTarget: async (id) => {
        set({ isLoading: true, error: null })
        try {
          await apiClient.delete(`/api/exam-schedules/study-targets/${id}`)
          
          set((state) => ({
            studyTargets: state.studyTargets.filter(t => t.id !== id),
            isLoading: false
          }))
          
          // currentScheduleの学習目標からも削除
          set((state) => ({
            currentSchedule: state.currentSchedule ? {
              ...state.currentSchedule,
              studyTargets: state.currentSchedule.studyTargets.filter(t => t.id !== id)
            } : null
          }))
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete study target'
          set({ error: errorMessage, isLoading: false })
          throw new Error(errorMessage)
        }
      },

      updateProgress: async (scheduleId, data) => {
        set({ error: null })
        try {
          const response = await apiClient.post(`/api/exam-schedules/${scheduleId}/progress`, data)
          const updatedTarget = response.data.data
          
          set((state) => ({
            studyTargets: state.studyTargets.map(t => 
              t.id === data.studyTargetId ? updatedTarget : t
            )
          }))
          
          // currentScheduleの学習目標も更新
          set((state) => ({
            currentSchedule: state.currentSchedule ? {
              ...state.currentSchedule,
              studyTargets: state.currentSchedule.studyTargets.map(t =>
                t.id === data.studyTargetId ? updatedTarget : t
              )
            } : null
          }))
          
          return updatedTarget
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update progress'
          set({ error: errorMessage })
          throw new Error(errorMessage)
        }
      },

      // Real-time countdown
      startCountdownTimer: () => {
        const { countdownTimer } = get()
        if (countdownTimer) {
          clearInterval(countdownTimer)
        }
        
        const timer = setInterval(() => {
          get().updateCountdown()
        }, 60000) // 1分間隔で更新
        
        set({ countdownTimer: timer })
      },

      stopCountdownTimer: () => {
        const { countdownTimer } = get()
        if (countdownTimer) {
          clearInterval(countdownTimer)
          set({ countdownTimer: null })
        }
      },

      updateCountdown: () => {
        const { currentSchedule } = get()
        if (currentSchedule) {
          const countdown = calculateCountdown(currentSchedule.examDate)
          set({ countdown })
        }
      },

      // Utility actions
      clearError: () => set({ error: null }),
      
      setLoading: (loading) => set({ isLoading: loading })
    }),
    {
      name: 'exam-schedule-store'
    }
  )
)