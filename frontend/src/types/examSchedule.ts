export interface ExamSchedule {
  id: string
  examType: 'spring' | 'autumn' | 'special'
  examDate: string // ISO date string
  targetScore?: number
  daysRemaining: number
  hoursRemaining: number
  minutesRemaining: number
  isExpired: boolean
  studyTargets: StudyTarget[]
  progressSummary: ProgressSummary
  createdAt: string
  updatedAt: string
}

export interface StudyTarget {
  id: string
  examScheduleId: string
  categoryId?: string
  categoryName?: string
  targetType: 'daily' | 'weekly' | 'total'
  targetValue: number
  currentValue: number
  unit: 'questions' | 'minutes' | 'sessions'
  progress: number // 0-100
  createdAt: string
  updatedAt: string
}

export interface ProgressSummary {
  overallProgress: number // 0-100
  onTrack: boolean
  dailyTarget: number
  weeklyTarget: number
}

export interface CountdownData {
  daysRemaining: number
  hoursRemaining: number
  minutesRemaining: number
  isExpired: boolean
}

export interface CreateExamScheduleRequest {
  examType: 'spring' | 'autumn' | 'special'
  examDate: string
  targetScore?: number
}

export interface UpdateExamScheduleRequest {
  examType?: 'spring' | 'autumn' | 'special'
  examDate?: string
  targetScore?: number
}

export interface CreateStudyTargetRequest {
  examScheduleId: string
  categoryId?: string
  targetType: 'daily' | 'weekly' | 'total'
  targetValue: number
  unit: 'questions' | 'minutes' | 'sessions'
}

export interface UpdateStudyTargetRequest {
  targetValue?: number
  currentValue?: number
}

export interface UpdateProgressRequest {
  studyTargetId: string
  increment: number
}

export interface ExamScheduleApiResponse {
  success: boolean
  data: ExamSchedule | ExamSchedule[] | StudyTarget | StudyTarget[] | null
  message: string
  error?: string
  details?: unknown[]
}

export const EXAM_TYPE_LABELS = {
  spring: '春期試験',
  autumn: '秋期試験',
  special: '特別試験'
} as const

export const TARGET_TYPE_LABELS = {
  daily: '日次目標',
  weekly: '週次目標',
  total: '総合目標'
} as const

export const UNIT_LABELS = {
  questions: '問題',
  minutes: '分',
  sessions: 'セッション'
} as const