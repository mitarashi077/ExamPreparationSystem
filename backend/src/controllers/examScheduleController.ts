import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

// Validation schemas
const createExamScheduleSchema = z.object({
  examType: z.enum(['spring', 'autumn', 'special']),
  examDate: z.string().pipe(z.coerce.date()),
  targetScore: z.number().int().min(0).max(100).optional()
})

const updateExamScheduleSchema = z.object({
  examType: z.enum(['spring', 'autumn', 'special']).optional(),
  examDate: z.string().pipe(z.coerce.date()).optional(),
  targetScore: z.number().int().min(0).max(100).optional()
})

const createStudyTargetSchema = z.object({
  examScheduleId: z.string().min(1),
  categoryId: z.string().optional(),
  targetType: z.enum(['daily', 'weekly', 'total']),
  targetValue: z.number().int().min(1),
  unit: z.enum(['questions', 'minutes', 'sessions'])
})

const updateStudyTargetSchema = z.object({
  targetValue: z.number().int().min(1).optional(),
  currentValue: z.number().int().min(0).optional()
})

// カウントダウン計算ヘルパー
const calculateCountdown = (examDate: Date) => {
  const now = new Date()
  const timeDiff = examDate.getTime() - now.getTime()
  
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

// 進捗サマリー計算ヘルパー
const calculateProgressSummary = (studyTargets: any[]) => {
  if (studyTargets.length === 0) {
    return {
      overallProgress: 0,
      onTrack: true,
      dailyTarget: 0,
      weeklyTarget: 0
    }
  }
  
  let totalProgress = 0
  let dailyTarget = 0
  let weeklyTarget = 0
  
  studyTargets.forEach(target => {
    const progress = target.targetValue > 0 ? (target.currentValue / target.targetValue) * 100 : 0
    totalProgress += Math.min(progress, 100)
    
    if (target.targetType === 'daily') {
      dailyTarget += target.targetValue
    } else if (target.targetType === 'weekly') {
      weeklyTarget += target.targetValue
    }
  })
  
  const overallProgress = Math.min(totalProgress / studyTargets.length, 100)
  const onTrack = overallProgress >= 70 // 70%以上で順調とみなす
  
  return {
    overallProgress: Math.round(overallProgress),
    onTrack,
    dailyTarget,
    weeklyTarget
  }
}

// 試験スケジュール一覧取得
export const getExamSchedules = async (_req: Request, res: Response): Promise<void> => {
  try {
    const examSchedules = await prisma.examSchedule.findMany({
      where: { isActive: true },
      include: {
        studyTargets: {
          include: {
            category: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { examDate: 'asc' }
    })

    const response = {
      success: true,
      data: examSchedules.map(schedule => {
        const countdown = calculateCountdown(schedule.examDate)
        const progressSummary = calculateProgressSummary(schedule.studyTargets)
        
        return {
          id: schedule.id,
          examType: schedule.examType,
          examDate: schedule.examDate.toISOString(),
          targetScore: schedule.targetScore,
          ...countdown,
          studyTargets: schedule.studyTargets.map(target => ({
            id: target.id,
            categoryId: target.categoryId,
            categoryName: target.category?.name || null,
            targetType: target.targetType,
            targetValue: target.targetValue,
            currentValue: target.currentValue,
            unit: target.unit,
            progress: target.targetValue > 0 ? Math.round((target.currentValue / target.targetValue) * 100) : 0
          })),
          progressSummary,
          createdAt: schedule.createdAt.toISOString(),
          updatedAt: schedule.updatedAt.toISOString()
        }
      }),
      message: 'Exam schedules retrieved successfully'
    }

    res.json(response)
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    })
  }
}

// 試験スケジュール作成
export const createExamSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = createExamScheduleSchema.safeParse(req.body)
    
    if (!validation.success) {
      res.status(400).json({ 
        success: false,
        error: 'Invalid request data',
        details: validation.error.issues
      })
      return
    }

    const { examType, examDate, targetScore } = validation.data

    // 同じ日付・タイプの試験が既に存在するかチェック
    const existingSchedule = await prisma.examSchedule.findFirst({
      where: {
        examType,
        examDate,
        isActive: true
      }
    })

    if (existingSchedule) {
      res.status(409).json({ 
        success: false,
        error: 'Exam schedule already exists for this date and type' 
      })
      return
    }

    const examSchedule = await prisma.examSchedule.create({
      data: {
        examType,
        examDate,
        targetScore,
        isActive: true
      },
      include: {
        studyTargets: {
          include: {
            category: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    const countdown = calculateCountdown(examSchedule.examDate)
    const progressSummary = calculateProgressSummary(examSchedule.studyTargets)

    const response = {
      success: true,
      data: {
        id: examSchedule.id,
        examType: examSchedule.examType,
        examDate: examSchedule.examDate.toISOString(),
        targetScore: examSchedule.targetScore,
        ...countdown,
        studyTargets: [],
        progressSummary,
        createdAt: examSchedule.createdAt.toISOString(),
        updatedAt: examSchedule.updatedAt.toISOString()
      },
      message: 'Exam schedule created successfully'
    }

    res.status(201).json(response)
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    })
  }
}

// 試験スケジュール更新
export const updateExamSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const validation = updateExamScheduleSchema.safeParse(req.body)
    
    if (!validation.success) {
      res.status(400).json({ 
        success: false,
        error: 'Invalid request data',
        details: validation.error.issues
      })
      return
    }

    // 存在確認
    const existingSchedule = await prisma.examSchedule.findFirst({
      where: {
        id,
        isActive: true
      }
    })

    if (!existingSchedule) {
      res.status(404).json({ 
        success: false,
        error: 'Exam schedule not found' 
      })
      return
    }

    const updateData = validation.data

    const examSchedule = await prisma.examSchedule.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: {
        studyTargets: {
          include: {
            category: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    const countdown = calculateCountdown(examSchedule.examDate)
    const progressSummary = calculateProgressSummary(examSchedule.studyTargets)

    const response = {
      success: true,
      data: {
        id: examSchedule.id,
        examType: examSchedule.examType,
        examDate: examSchedule.examDate.toISOString(),
        targetScore: examSchedule.targetScore,
        ...countdown,
        studyTargets: examSchedule.studyTargets.map(target => ({
          id: target.id,
          categoryId: target.categoryId,
          categoryName: target.category?.name || null,
          targetType: target.targetType,
          targetValue: target.targetValue,
          currentValue: target.currentValue,
          unit: target.unit,
          progress: target.targetValue > 0 ? Math.round((target.currentValue / target.targetValue) * 100) : 0
        })),
        progressSummary,
        createdAt: examSchedule.createdAt.toISOString(),
        updatedAt: examSchedule.updatedAt.toISOString()
      },
      message: 'Exam schedule updated successfully'
    }

    res.json(response)
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    })
  }
}

// 試験スケジュール削除
export const deleteExamSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    // 存在確認
    const existingSchedule = await prisma.examSchedule.findFirst({
      where: {
        id,
        isActive: true
      }
    })

    if (!existingSchedule) {
      res.status(404).json({ 
        success: false,
        error: 'Exam schedule not found' 
      })
      return
    }

    // 論理削除
    await prisma.examSchedule.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    })

    res.json({
      success: true,
      data: null,
      message: 'Exam schedule deleted successfully'
    })
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    })
  }
}

// 学習目標一覧取得
export const getStudyTargets = async (req: Request, res: Response): Promise<void> => {
  try {
    const { scheduleId } = req.params

    // 試験スケジュール存在確認
    const examSchedule = await prisma.examSchedule.findFirst({
      where: {
        id: scheduleId,
        isActive: true
      }
    })

    if (!examSchedule) {
      res.status(404).json({ 
        success: false,
        error: 'Exam schedule not found' 
      })
      return
    }

    const studyTargets = await prisma.studyTarget.findMany({
      where: { examScheduleId: scheduleId },
      include: {
        category: {
          select: {
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const response = {
      success: true,
      data: studyTargets.map(target => ({
        id: target.id,
        examScheduleId: target.examScheduleId,
        categoryId: target.categoryId,
        categoryName: target.category?.name || null,
        targetType: target.targetType,
        targetValue: target.targetValue,
        currentValue: target.currentValue,
        unit: target.unit,
        progress: target.targetValue > 0 ? Math.round((target.currentValue / target.targetValue) * 100) : 0,
        createdAt: target.createdAt.toISOString(),
        updatedAt: target.updatedAt.toISOString()
      })),
      message: 'Study targets retrieved successfully'
    }

    res.json(response)
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    })
  }
}

// 学習目標作成
export const createStudyTarget = async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = createStudyTargetSchema.safeParse(req.body)
    
    if (!validation.success) {
      res.status(400).json({ 
        success: false,
        error: 'Invalid request data',
        details: validation.error.issues
      })
      return
    }

    const { examScheduleId, categoryId, targetType, targetValue, unit } = validation.data

    // 試験スケジュール存在確認
    const examSchedule = await prisma.examSchedule.findFirst({
      where: {
        id: examScheduleId,
        isActive: true
      }
    })

    if (!examSchedule) {
      res.status(404).json({ 
        success: false,
        error: 'Exam schedule not found' 
      })
      return
    }

    // カテゴリが指定されている場合の存在確認
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId }
      })

      if (!category) {
        res.status(404).json({ 
          success: false,
          error: 'Category not found' 
        })
        return
      }
    }

    const studyTarget = await prisma.studyTarget.create({
      data: {
        examScheduleId,
        categoryId,
        targetType,
        targetValue,
        unit,
        currentValue: 0
      },
      include: {
        category: {
          select: {
            name: true
          }
        }
      }
    })

    const response = {
      success: true,
      data: {
        id: studyTarget.id,
        examScheduleId: studyTarget.examScheduleId,
        categoryId: studyTarget.categoryId,
        categoryName: studyTarget.category?.name || null,
        targetType: studyTarget.targetType,
        targetValue: studyTarget.targetValue,
        currentValue: studyTarget.currentValue,
        unit: studyTarget.unit,
        progress: 0,
        createdAt: studyTarget.createdAt.toISOString(),
        updatedAt: studyTarget.updatedAt.toISOString()
      },
      message: 'Study target created successfully'
    }

    res.status(201).json(response)
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    })
  }
}

// 学習目標更新
export const updateStudyTarget = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const validation = updateStudyTargetSchema.safeParse(req.body)
    
    if (!validation.success) {
      res.status(400).json({ 
        success: false,
        error: 'Invalid request data',
        details: validation.error.issues
      })
      return
    }

    // 存在確認
    const existingTarget = await prisma.studyTarget.findUnique({
      where: { id }
    })

    if (!existingTarget) {
      res.status(404).json({ 
        success: false,
        error: 'Study target not found' 
      })
      return
    }

    const updateData = validation.data

    const studyTarget = await prisma.studyTarget.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: {
        category: {
          select: {
            name: true
          }
        }
      }
    })

    const response = {
      success: true,
      data: {
        id: studyTarget.id,
        examScheduleId: studyTarget.examScheduleId,
        categoryId: studyTarget.categoryId,
        categoryName: studyTarget.category?.name || null,
        targetType: studyTarget.targetType,
        targetValue: studyTarget.targetValue,
        currentValue: studyTarget.currentValue,
        unit: studyTarget.unit,
        progress: studyTarget.targetValue > 0 ? Math.round((studyTarget.currentValue / studyTarget.targetValue) * 100) : 0,
        createdAt: studyTarget.createdAt.toISOString(),
        updatedAt: studyTarget.updatedAt.toISOString()
      },
      message: 'Study target updated successfully'
    }

    res.json(response)
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    })
  }
}

// 学習目標削除
export const deleteStudyTarget = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    // 存在確認
    const existingTarget = await prisma.studyTarget.findUnique({
      where: { id }
    })

    if (!existingTarget) {
      res.status(404).json({ 
        success: false,
        error: 'Study target not found' 
      })
      return
    }

    // 物理削除（StudyTargetは参照データが少ないため）
    await prisma.studyTarget.delete({
      where: { id }
    })

    res.json({
      success: true,
      data: null,
      message: 'Study target deleted successfully'
    })
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    })
  }
}

// 進捗更新
export const updateProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { scheduleId } = req.params
    const { studyTargetId, increment } = req.body

    if (!studyTargetId || typeof increment !== 'number') {
      res.status(400).json({ 
        success: false,
        error: 'studyTargetId and increment are required' 
      })
      return
    }

    // 学習目標存在確認
    const studyTarget = await prisma.studyTarget.findFirst({
      where: {
        id: studyTargetId,
        examScheduleId: scheduleId
      }
    })

    if (!studyTarget) {
      res.status(404).json({ 
        success: false,
        error: 'Study target not found' 
      })
      return
    }

    // 進捗更新
    const updatedTarget = await prisma.studyTarget.update({
      where: { id: studyTargetId },
      data: {
        currentValue: Math.max(0, studyTarget.currentValue + increment),
        updatedAt: new Date()
      },
      include: {
        category: {
          select: {
            name: true
          }
        }
      }
    })

    const response = {
      success: true,
      data: {
        id: updatedTarget.id,
        examScheduleId: updatedTarget.examScheduleId,
        categoryId: updatedTarget.categoryId,
        categoryName: updatedTarget.category?.name || null,
        targetType: updatedTarget.targetType,
        targetValue: updatedTarget.targetValue,
        currentValue: updatedTarget.currentValue,
        unit: updatedTarget.unit,
        progress: updatedTarget.targetValue > 0 ? Math.round((updatedTarget.currentValue / updatedTarget.targetValue) * 100) : 0,
        createdAt: updatedTarget.createdAt.toISOString(),
        updatedAt: updatedTarget.updatedAt.toISOString()
      },
      message: 'Progress updated successfully'
    }

    res.json(response)
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    })
  }
}