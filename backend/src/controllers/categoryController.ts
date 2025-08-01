import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// カテゴリ一覧取得
export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        _count: {
          select: {
            questions: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    const categoriesWithStats = await Promise.all(
      categories.map(async (category) => {
        // 各カテゴリの統計情報を取得
        const totalQuestions = category._count.questions
        
        // 回答済み問題数
        const answeredQuestions = await prisma.question.count({
          where: {
            categoryId: category.id,
            answers: {
              some: {}
            }
          }
        })

        // 正答率
        const correctAnswers = await prisma.answer.count({
          where: {
            question: {
              categoryId: category.id
            },
            isCorrect: true
          }
        })

        const totalAnswers = await prisma.answer.count({
          where: {
            question: {
              categoryId: category.id
            }
          }
        })

        return {
          id: category.id,
          name: category.name,
          description: category.description,
          totalQuestions,
          answeredQuestions,
          accuracy: totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0,
          progress: totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0
        }
      })
    )

    res.json(categoriesWithStats)
  } catch (error) {
    console.error('Error fetching categories:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// カテゴリ別詳細統計
export const getCategoryStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const days = parseInt(req.query.days as string) || 30

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const category = await prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true
      }
    })

    if (!category) {
      res.status(404).json({ error: 'Category not found' })
      return
    }

    // 基本統計
    const totalQuestions = await prisma.question.count({
      where: { categoryId: id }
    })

    const answeredQuestions = await prisma.question.count({
      where: {
        categoryId: id,
        answers: {
          some: {
            createdAt: {
              gte: startDate
            }
          }
        }
      }
    })

    const answers = await prisma.answer.findMany({
      where: {
        question: {
          categoryId: id
        },
        createdAt: {
          gte: startDate
        }
      },
      select: {
        isCorrect: true,
        timeSpent: true,
        createdAt: true,
        question: {
          select: {
            difficulty: true
          }
        }
      }
    })

    const totalAnswers = answers.length
    const correctAnswers = answers.filter(a => a.isCorrect).length
    const averageTime = answers.reduce((sum, a) => sum + (a.timeSpent || 0), 0) / totalAnswers || 0

    // 難易度別統計
    const difficultyStats = [1, 2, 3, 4, 5].map(difficulty => {
      const difficultyAnswers = answers.filter(a => a.question.difficulty === difficulty)
      const difficultyCorrect = difficultyAnswers.filter(a => a.isCorrect).length
      
      return {
        difficulty,
        totalAnswers: difficultyAnswers.length,
        correctAnswers: difficultyCorrect,
        accuracy: difficultyAnswers.length > 0 ? (difficultyCorrect / difficultyAnswers.length) * 100 : 0
      }
    })

    // 最近の学習トレンド（日別）
    const dailyMap = new Map<string, { correct: number; total: number }>()
    
    answers.forEach(answer => {
      const date = answer.createdAt.toISOString().split('T')[0]
      const current = dailyMap.get(date) || { correct: 0, total: 0 }
      
      current.total += 1
      if (answer.isCorrect) current.correct += 1
      
      dailyMap.set(date, current)
    })

    const dailyTrend = Array.from(dailyMap.entries())
      .map(([date, stats]) => ({
        date,
        accuracy: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
        totalAnswers: stats.total
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    res.json({
      category,
      summary: {
        totalQuestions,
        answeredQuestions,
        totalAnswers,
        correctAnswers,
        accuracy: totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0,
        averageTime: Math.round(averageTime),
        progress: totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0
      },
      difficultyStats: difficultyStats.filter(d => d.totalAnswers > 0),
      dailyTrend,
      period: `${days}日間`
    })
  } catch (error) {
    console.error('Error fetching category stats:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}