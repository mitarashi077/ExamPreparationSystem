import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 回答提出
export const submitAnswer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { questionId, choiceId, timeSpent, deviceType } = req.body

    if (!questionId || !choiceId) {
      res.status(400).json({ error: 'QuestionId and choiceId are required' })
      return
    }

    // 選択肢の正解確認
    const choice = await prisma.choice.findUnique({
      where: { id: choiceId },
      include: {
        question: {
          include: {
            choices: true
          }
        }
      }
    })

    if (!choice) {
      res.status(404).json({ error: 'Choice not found' })
      return
    }

    // 回答を記録
    const answer = await prisma.answer.create({
      data: {
        questionId,
        isCorrect: choice.isCorrect,
        timeSpent: timeSpent || null,
        deviceType: deviceType || null
      }
    })

    // 正解の選択肢IDを取得
    const correctChoice = choice.question.choices.find(c => c.isCorrect)

    res.json({
      answerId: answer.id,
      isCorrect: choice.isCorrect,
      correctChoiceId: correctChoice?.id,
      explanation: choice.question.explanation,
      timeSpent: answer.timeSpent
    })
  } catch (error) {
    console.error('Error submitting answer:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// 学習統計取得
export const getStudyStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const deviceType = req.query.deviceType as string
    const categoryId = req.query.categoryId as string
    const days = parseInt(req.query.days as string) || 7

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const where: any = {
      createdAt: {
        gte: startDate
      }
    }

    if (deviceType) {
      where.deviceType = deviceType
    }

    if (categoryId) {
      where.question = {
        categoryId
      }
    }

    // 基本統計
    const totalAnswers = await prisma.answer.count({ where })
    const correctAnswers = await prisma.answer.count({
      where: {
        ...where,
        isCorrect: true
      }
    })

    // 分野別統計
    const categoryStats = await prisma.answer.groupBy({
      by: ['questionId'],
      where,
      _count: {
        _all: true
      },
      _avg: {
        timeSpent: true
      }
    })

    // 日別統計
    const dailyStats = await prisma.answer.findMany({
      where,
      select: {
        createdAt: true,
        isCorrect: true,
        timeSpent: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // 日別データを集計
    const dailyMap = new Map<string, { correct: number; total: number; totalTime: number }>()
    
    dailyStats.forEach(answer => {
      const date = answer.createdAt.toISOString().split('T')[0]
      const current = dailyMap.get(date) || { correct: 0, total: 0, totalTime: 0 }
      
      current.total += 1
      if (answer.isCorrect) current.correct += 1
      if (answer.timeSpent) current.totalTime += answer.timeSpent
      
      dailyMap.set(date, current)
    })

    const dailyArray = Array.from(dailyMap.entries()).map(([date, stats]) => ({
      date,
      correctAnswers: stats.correct,
      totalAnswers: stats.total,
      accuracy: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
      averageTime: stats.total > 0 ? stats.totalTime / stats.total : 0
    }))

    res.json({
      summary: {
        totalAnswers,
        correctAnswers,
        accuracy: totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0,
        period: `${days}日間`
      },
      daily: dailyArray
    })
  } catch (error) {
    console.error('Error fetching study stats:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}