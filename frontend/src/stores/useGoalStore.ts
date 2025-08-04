import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import {
  StudyGoal,
  GoalProgress,
  GoalAchievement,
  CreateGoalRequest,
  UpdateGoalRequest,
  GoalFilters,
  GoalStatistics
} from '../types/goal'
import apiClient from '../utils/apiClient'

interface GoalStore {
  // State
  goals: StudyGoal[]
  goalProgress: GoalProgress[]
  achievements: GoalAchievement[]
  statistics: GoalStatistics | null
  filters: GoalFilters
  isLoading: boolean
  error: string | null

  // Actions
  fetchGoals: (filters?: GoalFilters) => Promise<void>
  createGoal: (data: CreateGoalRequest) => Promise<StudyGoal>
  updateGoal: (id: string, data: UpdateGoalRequest) => Promise<StudyGoal>
  deleteGoal: (id: string) => Promise<void>
  
  fetchGoalProgress: (goalId: string) => Promise<void>
  recordProgress: (goalId: string, value: number, notes?: string) => Promise<void>
  
  fetchAchievements: () => Promise<void>
  fetchStatistics: () => Promise<void>
  
  // Real-time progress tracking
  incrementGoalProgress: (goalId: string, increment: number) => Promise<void>
  updateGoalFromActivity: (activityType: string, value: number, categoryId?: string) => Promise<void>
  
  // Filters and utilities
  setFilters: (filters: Partial<GoalFilters>) => void
  clearFilters: () => void
  getFilteredGoals: () => StudyGoal[]
  getGoalById: (id: string) => StudyGoal | undefined
  
  // Error handling
  clearError: () => void
  setLoading: (loading: boolean) => void
}

// Mock data for initial development
const generateMockGoals = (): StudyGoal[] => [
  {
    id: 'goal-1',
    examScheduleId: 'exam-1',
    categoryId: 'hardware',
    categoryName: 'ハードウェア',
    goalType: 'questions',
    targetValue: 50,
    currentValue: 32,
    timeframe: 'weekly',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    progress: 64,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'goal-2',
    goalType: 'time',
    targetValue: 120,
    currentValue: 85,
    timeframe: 'daily',
    isActive: true,
    progress: 71,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'goal-3',
    categoryId: 'software',
    categoryName: 'ソフトウェア',
    goalType: 'accuracy',
    targetValue: 80,
    currentValue: 92,
    timeframe: 'monthly',
    isActive: true,
    progress: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

const generateMockAchievements = (): GoalAchievement[] => [
  {
    id: 'achievement-1',
    goalId: 'goal-3',
    achievedAt: new Date().toISOString(),
    value: 92,
    goalType: 'accuracy',
    badgeType: 'gold'
  }
]

const generateMockStatistics = (): GoalStatistics => ({
  totalGoals: 3,
  activeGoals: 3,
  completedGoals: 1,
  overallProgress: 78,
  categoryBreakdown: {
    hardware: {
      categoryName: 'ハードウェア',
      goalsCount: 1,
      averageProgress: 64,
      completedCount: 0
    },
    software: {
      categoryName: 'ソフトウェア',
      goalsCount: 1,
      averageProgress: 100,
      completedCount: 1
    }
  },
  typeBreakdown: {
    questions: {
      goalsCount: 1,
      averageProgress: 64,
      completedCount: 0
    },
    time: {
      goalsCount: 1,
      averageProgress: 71,
      completedCount: 0
    },
    accuracy: {
      goalsCount: 1,
      averageProgress: 100,
      completedCount: 1
    }
  },
  recentAchievements: generateMockAchievements(),
  streaks: {
    dailyStreak: 5,
    weeklyStreak: 2,
    monthlyStreak: 1
  }
})

export const useGoalStore = create<GoalStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        goals: [],
        goalProgress: [],
        achievements: [],
        statistics: null,
        filters: {},
        isLoading: false,
        error: null,

        // Actions
        fetchGoals: async (filters) => {
          set({ isLoading: true, error: null })
          try {
            // For now, use mock data
            // TODO: Replace with actual API call when backend is ready
            // const response = await apiClient.get('/api/goals', { params: filters })
            // const goals = response.data.data
            
            const goals = generateMockGoals()
            set({ goals, isLoading: false })
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to fetch goals',
              isLoading: false
            })
          }
        },

        createGoal: async (data) => {
          set({ isLoading: true, error: null })
          try {
            // Mock implementation
            const newGoal: StudyGoal = {
              id: `goal-${Date.now()}`,
              ...data,
              currentValue: 0,
              progress: 0,
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
            
            set((state) => ({
              goals: [newGoal, ...state.goals],
              isLoading: false
            }))
            
            return newGoal
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create goal'
            set({ error: errorMessage, isLoading: false })
            throw new Error(errorMessage)
          }
        },

        updateGoal: async (id, data) => {
          set({ isLoading: true, error: null })
          try {
            set((state) => {
              const updatedGoals = state.goals.map(goal => {
                if (goal.id === id) {
                  const updatedGoal = { ...goal, ...data, updatedAt: new Date().toISOString() }
                  // Recalculate progress if values changed
                  if (data.currentValue !== undefined || data.targetValue !== undefined) {
                    updatedGoal.progress = Math.min(
                      Math.round((updatedGoal.currentValue / updatedGoal.targetValue) * 100),
                      100
                    )
                  }
                  return updatedGoal
                }
                return goal
              })
              return { goals: updatedGoals, isLoading: false }
            })
            
            const updatedGoal = get().goals.find(g => g.id === id)
            if (!updatedGoal) throw new Error('Goal not found')
            
            return updatedGoal
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update goal'
            set({ error: errorMessage, isLoading: false })
            throw new Error(errorMessage)
          }
        },

        deleteGoal: async (id) => {
          set({ isLoading: true, error: null })
          try {
            set((state) => ({
              goals: state.goals.filter(g => g.id !== id),
              isLoading: false
            }))
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete goal'
            set({ error: errorMessage, isLoading: false })
            throw new Error(errorMessage)
          }
        },

        fetchGoalProgress: async (goalId) => {
          set({ isLoading: true, error: null })
          try {
            // Mock implementation
            const mockProgress: GoalProgress[] = [
              {
                id: 'progress-1',
                goalId,
                date: new Date().toISOString(),
                value: 10,
                notes: '朝の学習セッション',
                createdAt: new Date().toISOString()
              }
            ]
            set({ goalProgress: mockProgress, isLoading: false })
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to fetch goal progress',
              isLoading: false
            })
          }
        },

        recordProgress: async (goalId, value, notes) => {
          set({ error: null })
          try {
            const newProgress: GoalProgress = {
              id: `progress-${Date.now()}`,
              goalId,
              date: new Date().toISOString(),
              value,
              notes,
              createdAt: new Date().toISOString()
            }
            
            set((state) => ({
              goalProgress: [newProgress, ...state.goalProgress]
            }))
            
            // Update goal current value
            await get().incrementGoalProgress(goalId, value)
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to record progress'
            set({ error: errorMessage })
            throw new Error(errorMessage)
          }
        },

        fetchAchievements: async () => {
          set({ isLoading: true, error: null })
          try {
            const achievements = generateMockAchievements()
            set({ achievements, isLoading: false })
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to fetch achievements',
              isLoading: false
            })
          }
        },

        fetchStatistics: async () => {
          set({ isLoading: true, error: null })
          try {
            const statistics = generateMockStatistics()
            set({ statistics, isLoading: false })
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to fetch statistics',
              isLoading: false
            })
          }
        },

        incrementGoalProgress: async (goalId, increment) => {
          set({ error: null })
          try {
            set((state) => {
              const updatedGoals = state.goals.map(goal => {
                if (goal.id === goalId) {
                  const newCurrentValue = Math.max(0, goal.currentValue + increment)
                  const newProgress = Math.min(
                    Math.round((newCurrentValue / goal.targetValue) * 100),
                    100
                  )
                  return {
                    ...goal,
                    currentValue: newCurrentValue,
                    progress: newProgress,
                    updatedAt: new Date().toISOString()
                  }
                }
                return goal
              })
              return { goals: updatedGoals }
            })
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to increment progress'
            set({ error: errorMessage })
            throw new Error(errorMessage)
          }
        },

        updateGoalFromActivity: async (activityType, value, categoryId) => {
          try {
            const { goals } = get()
            const relevantGoals = goals.filter(goal => {
              // Match goal type with activity
              const typeMatches = 
                (activityType === 'question_answered' && goal.goalType === 'questions') ||
                (activityType === 'study_time' && goal.goalType === 'time') ||
                (activityType === 'bookmark_added' && goal.goalType === 'bookmarks') ||
                (activityType === 'review_completed' && goal.goalType === 'reviews')
              
              // Match category if specified
              const categoryMatches = !categoryId || !goal.categoryId || goal.categoryId === categoryId
              
              return typeMatches && categoryMatches && goal.isActive
            })
            
            // Update matching goals
            for (const goal of relevantGoals) {
              await get().incrementGoalProgress(goal.id, value)
            }
          } catch (error) {
            console.error('Failed to update goals from activity:', error)
          }
        },

        setFilters: (filters) => {
          set((state) => ({
            filters: { ...state.filters, ...filters }
          }))
        },

        clearFilters: () => {
          set({ filters: {} })
        },

        getFilteredGoals: () => {
          const { goals, filters } = get()
          return goals.filter(goal => {
            if (filters.goalType && goal.goalType !== filters.goalType) return false
            if (filters.timeframe && goal.timeframe !== filters.timeframe) return false
            if (filters.categoryId && goal.categoryId !== filters.categoryId) return false
            if (filters.isActive !== undefined && goal.isActive !== filters.isActive) return false
            if (filters.achievedOnly && goal.progress < 100) return false
            return true
          })
        },

        getGoalById: (id) => {
          return get().goals.find(goal => goal.id === id)
        },

        clearError: () => set({ error: null }),
        setLoading: (loading) => set({ isLoading: loading })
      }),
      {
        name: 'goal-storage',
        partialize: (state) => ({
          goals: state.goals,
          filters: state.filters
        })
      }
    ),
    {
      name: 'goal-store'
    }
  )
)