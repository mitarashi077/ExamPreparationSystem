export interface StudyGoal {
  id: string
  examScheduleId?: string
  categoryId?: string
  categoryName?: string
  goalType: 'time' | 'questions' | 'accuracy' | 'bookmarks' | 'reviews'
  targetValue: number
  currentValue: number
  timeframe: 'daily' | 'weekly' | 'monthly'
  deadline?: string
  isActive: boolean
  progress: number // 0-100
  createdAt: string
  updatedAt: string
}

export interface GoalProgress {
  id: string
  goalId: string
  date: string
  value: number
  notes?: string
  createdAt: string
}

export interface GoalAchievement {
  id: string
  goalId: string
  achievedAt: string
  value: number
  goalType: string
  badgeType: 'bronze' | 'silver' | 'gold' | 'platinum'
}

export interface CreateGoalRequest {
  examScheduleId?: string
  categoryId?: string
  goalType: 'time' | 'questions' | 'accuracy' | 'bookmarks' | 'reviews'
  targetValue: number
  timeframe: 'daily' | 'weekly' | 'monthly'
  deadline?: string
}

export interface UpdateGoalRequest {
  targetValue?: number
  currentValue?: number
  isActive?: boolean
  deadline?: string
}

export interface GoalFilters {
  goalType?: string
  timeframe?: string
  categoryId?: string
  isActive?: boolean
  achievedOnly?: boolean
}

export interface GoalStatistics {
  totalGoals: number
  activeGoals: number
  completedGoals: number
  overallProgress: number
  categoryBreakdown: {
    [categoryId: string]: {
      categoryName: string
      goalsCount: number
      averageProgress: number
      completedCount: number
    }
  }
  typeBreakdown: {
    [goalType: string]: {
      goalsCount: number
      averageProgress: number
      completedCount: number
    }
  }
  recentAchievements: GoalAchievement[]
  streaks: {
    dailyStreak: number
    weeklyStreak: number
    monthlyStreak: number
  }
}

export const GOAL_TYPE_LABELS = {
  time: '学習時間',
  questions: '問題数',
  accuracy: '正答率',
  bookmarks: 'ブックマーク',
  reviews: '復習回数'
} as const

export const TIMEFRAME_LABELS = {
  daily: '日次',
  weekly: '週次',
  monthly: '月次'
} as const

export const GOAL_TYPE_UNITS = {
  time: '分',
  questions: '問',
  accuracy: '%',
  bookmarks: '件',
  reviews: '回'
} as const

export const BADGE_TYPE_LABELS = {
  bronze: 'ブロンズ',
  silver: 'シルバー',
  gold: 'ゴールド',
  platinum: 'プラチナ'
} as const

export interface GoalApiResponse<T = any> {
  success: boolean
  data: T
  message: string
  error?: string
}