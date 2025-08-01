import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient() as any

// 間隔反復学習アルゴリズム - Spaced Repetition
class SpacedRepetitionAlgorithm {
  static getNextReviewInterval(masteryLevel: number, isCorrect: boolean): number {
    const baseIntervals = [1, 5, 30, 180, 1440, 4320];
    let newLevel = isCorrect 
      ? Math.min(5, masteryLevel + 1)
      : Math.max(0, masteryLevel - 1);
    return baseIntervals[newLevel] || baseIntervals[0];
  }

  static calculatePriority(masteryLevel: number, wrongCount: number, daysSinceLastReview: number): number {
    let priority = 1;
    priority += (5 - masteryLevel);
    priority += Math.min(wrongCount * 0.5, 3);
    priority += Math.min(daysSinceLastReview * 0.1, 2);
    return Math.min(Math.round(priority), 5);
  }
}

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

    // 復習リストへの自動追加処理
    let reviewItem = null;
    try {
      const existingReviewItem = await prisma.reviewItem.findUnique({
        where: { questionId }
      });

      const now = new Date();

      if (existingReviewItem) {
        // 既存アイテムの更新
        const newMasteryLevel = choice.isCorrect 
          ? Math.min(5, existingReviewItem.masteryLevel + 1)
          : Math.max(0, existingReviewItem.masteryLevel - 1);

        const correctStreak = choice.isCorrect 
          ? existingReviewItem.correctStreak + 1 
          : 0;

        const wrongCount = choice.isCorrect 
          ? existingReviewItem.wrongCount 
          : existingReviewItem.wrongCount + 1;

        const intervalMinutes = SpacedRepetitionAlgorithm.getNextReviewInterval(newMasteryLevel, choice.isCorrect);
        const nextReview = new Date(now.getTime() + intervalMinutes * 60 * 1000);

        const daysSinceLastReview = existingReviewItem.lastReviewed 
          ? Math.floor((now.getTime() - existingReviewItem.lastReviewed.getTime()) / (1000 * 60 * 60 * 24))
          : 0;
        const priority = SpacedRepetitionAlgorithm.calculatePriority(newMasteryLevel, wrongCount, daysSinceLastReview);

        reviewItem = await prisma.reviewItem.update({
          where: { questionId },
          data: {
            masteryLevel: newMasteryLevel,
            reviewCount: existingReviewItem.reviewCount + 1,
            lastReviewed: now,
            nextReview,
            wrongCount,
            correctStreak,
            priority,
            isActive: newMasteryLevel < 5,
            updatedAt: now
          }
        });
      } else if (!choice.isCorrect) {
        // 新規間違い問題の追加（正解の場合は追加しない）
        const intervalMinutes = SpacedRepetitionAlgorithm.getNextReviewInterval(0, false);
        const nextReview = new Date(now.getTime() + intervalMinutes * 60 * 1000);
        const priority = SpacedRepetitionAlgorithm.calculatePriority(0, 1, 0);

        reviewItem = await prisma.reviewItem.create({
          data: {
            questionId,
            masteryLevel: 0,
            reviewCount: 1,
            lastReviewed: now,
            nextReview,
            wrongCount: 1,
            correctStreak: 0,
            priority,
            isActive: true
          }
        });
      }
    } catch (reviewError) {
      console.error('復習アイテム処理エラー:', reviewError);
      // 復習機能のエラーは主機能に影響させない
    }

    // 正解の選択肢IDを取得
    const correctChoice = choice.question.choices.find((c: any) => c.isCorrect)

    res.json({
      answerId: answer.id,
      isCorrect: choice.isCorrect,
      correctChoiceId: correctChoice?.id,
      explanation: choice.question.explanation,
      timeSpent: answer.timeSpent,
      reviewItem: reviewItem ? { 
        id: reviewItem.id, 
        masteryLevel: reviewItem.masteryLevel,
        nextReview: reviewItem.nextReview,
        priority: reviewItem.priority
      } : null
    })
  } catch (error) {
    console.error('Error submitting answer:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// ヒートマップデータ取得
export const getHeatmapData = async (req: Request, res: Response): Promise<void> => {
  try {
    const days = parseInt(req.query.days as string) || 30

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // すべての回答データを取得
    const answers = await prisma.answer.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      include: {
        question: {
          include: {
            category: true
          }
        }
      }
    })

    // 分野別にデータを集約
    const categoryMap = new Map<string, { 
      categoryId: string; 
      categoryName: string; 
      totalAttempts: number; 
      correctAttempts: number; 
    }>()

    answers.forEach((answer: any) => {
      if (!answer.question?.category) return

      const categoryId = answer.question.categoryId
      const existing = categoryMap.get(categoryId) || {
        categoryId,
        categoryName: answer.question.category.name,
        totalAttempts: 0,
        correctAttempts: 0
      }

      existing.totalAttempts += 1
      if (answer.isCorrect) {
        existing.correctAttempts += 1
      }

      categoryMap.set(categoryId, existing)
    })

    // ヒートマップ用のデータ形式に変換
    const heatmapData = Array.from(categoryMap.values()).map(category => ({
      categoryId: category.categoryId,
      categoryName: category.categoryName,
      attempts: category.totalAttempts,
      accuracy: category.totalAttempts > 0 ? (category.correctAttempts / category.totalAttempts) * 100 : 0,
      colorIntensity: category.totalAttempts > 0 ? (category.correctAttempts / category.totalAttempts) : 0
    }))

    res.json({
      heatmapData,
      period: `${days}日間`,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching heatmap data:', error)
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

    // 分野別統計（現在は使用されていないがデータ構造を保持）
    // const categoryStats = await prisma.answer.groupBy({
    //   by: ['questionId'],
    //   where,
    //   _count: {
    //     _all: true
    //   },
    //   _avg: {
    //     timeSpent: true
    //   }
    // })

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
    
    dailyStats.forEach((answer: any) => {
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