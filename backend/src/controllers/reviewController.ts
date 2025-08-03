import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

// Clean DATABASE_URL if it has psql prefix
let cleanUrl = process.env.DATABASE_URL;
if (cleanUrl?.startsWith("psql '") && cleanUrl.endsWith("'")) {
  cleanUrl = cleanUrl.slice(5, -1);
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: cleanUrl
    }
  }
});

// バリデーションスキーマ
const reviewAnswerSchema = z.object({
  questionId: z.string(),
  isCorrect: z.boolean(),
  timeSpent: z.number().optional(),
  deviceType: z.string().optional()
});

const reviewSessionSchema = z.object({
  duration: z.number().optional(),
  deviceType: z.string().optional()
});

// 間隔反復学習アルゴリズム - Spaced Repetition
class SpacedRepetitionAlgorithm {
  // 習熟度レベルに基づく次回復習間隔（分）
  static getNextReviewInterval(masteryLevel: number, isCorrect: boolean): number {
    const baseIntervals = [
      1,        // Level 0: 1分後
      5,        // Level 1: 5分後
      30,       // Level 2: 30分後
      180,      // Level 3: 3時間後
      1440,     // Level 4: 24時間後
      4320      // Level 5: 3日後
    ];

    let newLevel = masteryLevel;
    
    if (isCorrect) {
      newLevel = Math.min(5, masteryLevel + 1);
    } else {
      newLevel = Math.max(0, masteryLevel - 1);
    }

    return baseIntervals[newLevel] || baseIntervals[0];
  }

  // 復習優先度の計算
  static calculatePriority(masteryLevel: number, wrongCount: number, daysSinceLastReview: number): number {
    let priority = 1;

    // 習熟度が低いほど優先度高
    priority += (5 - masteryLevel);
    
    // 間違い回数が多いほど優先度高
    priority += Math.min(wrongCount * 0.5, 3);
    
    // 最後の復習から時間が経つほど優先度高
    priority += Math.min(daysSinceLastReview * 0.1, 2);

    return Math.min(Math.round(priority), 5);
  }
}

// 間違い問題を復習リストに追加
export const addToReviewList = async (req: Request, res: Response) => {
  try {
    const { questionId, isCorrect, timeSpent, deviceType } = reviewAnswerSchema.parse(req.body);

    // 既存の復習アイテムを取得または作成
    const existingReviewItem = await prisma.reviewItem.findUnique({
      where: { questionId }
    });

    const now = new Date();
    let reviewItem;

    if (existingReviewItem) {
      // 既存アイテムの更新
      const newMasteryLevel = isCorrect 
        ? Math.min(5, existingReviewItem.masteryLevel + 1)
        : Math.max(0, existingReviewItem.masteryLevel - 1);

      const correctStreak = isCorrect 
        ? existingReviewItem.correctStreak + 1 
        : 0;

      const wrongCount = isCorrect 
        ? existingReviewItem.wrongCount 
        : existingReviewItem.wrongCount + 1;

      // 次回復習時間の計算
      const intervalMinutes = SpacedRepetitionAlgorithm.getNextReviewInterval(newMasteryLevel, isCorrect);
      const nextReview = new Date(now.getTime() + intervalMinutes * 60 * 1000);

      // 優先度の計算
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
          isActive: newMasteryLevel < 5, // 完全習得（レベル5）になったら非アクティブ
          updatedAt: now
        },
        include: {
          question: {
            include: {
              category: true,
              choices: true
            }
          }
        }
      });
    } else if (!isCorrect) {
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
        },
        include: {
          question: {
            include: {
              category: true,
              choices: true
            }
          }
        }
      });
    }

    // 回答履歴も記録
    await prisma.answer.create({
      data: {
        questionId,
        isCorrect,
        timeSpent,
        deviceType
      }
    });

    res.json({ 
      success: true, 
      reviewItem,
      message: isCorrect ? '正解です！' : '復習リストに追加されました'
    });
  } catch (error) {
    // 復習アイテム追加エラー logged for debugging
    res.status(500).json({ error: '復習アイテムの追加に失敗しました' });
  }
};

// 復習対象問題の取得
export const getReviewQuestions = async (req: Request, res: Response) => {
  try {
    const { limit = '10', priority = '1' } = req.query;
    const now = new Date();

    const reviewItems = await prisma.reviewItem.findMany({
      where: {
        isActive: true,
        priority: {
          gte: parseInt(priority as string)
        },
        nextReview: {
          lte: now
        }
      },
      include: {
        question: {
          include: {
            category: true,
            choices: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { nextReview: 'asc' },
        { wrongCount: 'desc' }
      ],
      take: parseInt(limit as string)
    });

    res.json({
      questions: reviewItems,
      totalCount: reviewItems.length,
      reviewStats: {
        urgent: reviewItems.filter((item: any) => item.priority >= 4).length,
        medium: reviewItems.filter((item: any) => item.priority === 3).length,
        low: reviewItems.filter((item: any) => item.priority <= 2).length
      }
    });
  } catch (error) {
    // 復習問題取得エラー logged for debugging
    res.status(500).json({ 
      error: '復習問題の取得に失敗しました',
      details: error instanceof Error ? error.message : String(error)
    });
  }
};

// 復習スケジュールの取得
export const getReviewSchedule = async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [todayItems, tomorrowItems, thisWeekItems, totalActiveItems] = await Promise.all([
      // 今日復習すべき問題
      prisma.reviewItem.count({
        where: {
          isActive: true,
          nextReview: { lte: now }
        }
      }),
      // 明日復習すべき問題
      prisma.reviewItem.count({
        where: {
          isActive: true,
          nextReview: {
            gt: now,
            lte: tomorrow
          }
        }
      }),
      // 今週中に復習すべき問題
      prisma.reviewItem.count({
        where: {
          isActive: true,
          nextReview: {
            gt: tomorrow,
            lte: nextWeek
          }
        }
      }),
      // 全体のアクティブ復習アイテム数
      prisma.reviewItem.count({
        where: { isActive: true }
      })
    ]);

    // 習熟度別統計
    const masteryStats = await prisma.reviewItem.groupBy({
      by: ['masteryLevel'],
      where: { isActive: true },
      _count: {
        masteryLevel: true
      }
    });

    res.json({
      schedule: {
        today: todayItems,
        tomorrow: tomorrowItems,
        thisWeek: thisWeekItems,
        totalActive: totalActiveItems
      },
      masteryDistribution: masteryStats.reduce((acc: any, item: any) => {
        acc[`level${item.masteryLevel}`] = item._count.masteryLevel;
        return acc;
      }, {} as Record<string, number>),
      recommendations: {
        suggestedDailyReviews: Math.min(Math.max(todayItems, 5), 20),
        estimatedTimeMinutes: todayItems * 2, // 1問あたり2分と仮定
        urgentItems: await prisma.reviewItem.count({
          where: {
            isActive: true,
            priority: { gte: 4 },
            nextReview: { lte: now }
          }
        })
      }
    });
  } catch (error) {
    // 復習スケジュール取得エラー logged for debugging
    res.status(500).json({ 
      error: '復習スケジュールの取得に失敗しました',
      details: error instanceof Error ? error.message : String(error)
    });
  }
};

// 復習セッションの開始
export const startReviewSession = async (req: Request, res: Response) => {
  try {
    const { deviceType } = reviewSessionSchema.parse(req.body);

    const session = await prisma.reviewSession.create({
      data: {
        deviceType,
        totalItems: 0,
        correctItems: 0
      }
    });

    res.json({ sessionId: session.id, startTime: session.createdAt });
  } catch (error) {
    // 復習セッション開始エラー logged for debugging
    res.status(500).json({ error: '復習セッションの開始に失敗しました' });
  }
};

// 復習セッションの終了
export const endReviewSession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { duration, totalItems, correctItems } = req.body;

    const session = await prisma.reviewSession.update({
      where: { id: sessionId },
      data: {
        duration,
        totalItems,
        correctItems
      }
    });

    const accuracy = totalItems > 0 ? (correctItems / totalItems) * 100 : 0;

    res.json({
      session,
      results: {
        totalItems,
        correctItems,
        accuracy: Math.round(accuracy * 100) / 100,
        timePerQuestion: totalItems > 0 ? Math.round(duration / totalItems) : 0
      }
    });
  } catch (error) {
    // 復習セッション終了エラー logged for debugging
    res.status(500).json({ error: '復習セッションの終了に失敗しました' });
  }
};

// 復習統計の取得
export const getReviewStats = async (req: Request, res: Response) => {
  try {
    const { period = '7' } = req.query;
    const days = parseInt(period as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [recentSessions, categoryStats, progressStats] = await Promise.all([
      // 最近の復習セッション
      prisma.reviewSession.findMany({
        where: {
          createdAt: { gte: startDate }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      // カテゴリ別復習統計
      prisma.reviewItem.findMany({
        where: { isActive: true },
        include: {
          question: {
            include: { category: true }
          }
        }
      }),
      // 習熟度進捗統計
      prisma.reviewItem.groupBy({
        by: ['masteryLevel'],
        where: { isActive: true },
        _count: { masteryLevel: true },
        _avg: { reviewCount: true }
      })
    ]);

    // カテゴリ別統計を集計
    const categoryStatsMap = categoryStats.reduce((acc: any, item: any) => {
      const categoryName = item.question.category.name;
      if (!acc[categoryName]) {
        acc[categoryName] = {
          total: 0,
          avgMasteryLevel: 0,
          avgReviewCount: 0,
          totalMasteryLevel: 0
        };
      }
      acc[categoryName].total += 1;
      acc[categoryName].totalMasteryLevel += item.masteryLevel;
      acc[categoryName].avgReviewCount += item.reviewCount;
      return acc;
    }, {} as Record<string, any>);

    // 平均値を計算
    Object.keys(categoryStatsMap).forEach(key => {
      const stat = categoryStatsMap[key];
      stat.avgMasteryLevel = Math.round((stat.totalMasteryLevel / stat.total) * 100) / 100;
      stat.avgReviewCount = Math.round((stat.avgReviewCount / stat.total) * 100) / 100;
      delete stat.totalMasteryLevel;
    });

    res.json({
      recentSessions: recentSessions.map((session: any) => ({
        date: session.createdAt,
        totalItems: session.totalItems,
        correctItems: session.correctItems,
        accuracy: session.totalItems > 0 ? Math.round((session.correctItems / session.totalItems) * 100) : 0,
        duration: session.duration
      })),
      categoryStats: categoryStatsMap,
      masteryProgress: progressStats.map((stat: any) => ({
        level: stat.masteryLevel,
        count: stat._count.masteryLevel,
        avgReviewCount: Math.round((stat._avg.reviewCount || 0) * 100) / 100
      }))
    });
  } catch (error) {
    // 復習統計取得エラー logged for debugging
    res.status(500).json({ error: '復習統計の取得に失敗しました' });
  }
};