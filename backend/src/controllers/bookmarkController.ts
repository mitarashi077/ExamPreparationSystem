import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

// Create Prisma client with environment-based configuration
const createPrismaClient = () => {
  let cleanUrl = process.env.DATABASE_URL
  if (cleanUrl?.startsWith("psql '") && cleanUrl.endsWith("'")) {
    cleanUrl = cleanUrl.slice(5, -1)
  }

  return new PrismaClient({
    datasources: {
      db: {
        url: cleanUrl,
      },
    },
  })
}

const prisma = createPrismaClient()

// Validation schemas
const createBookmarkSchema = z.object({
  questionId: z.string().min(1, 'QuestionId is required'),
  memo: z.string().optional(),
})

const updateBookmarkSchema = z.object({
  memo: z.string().optional(),
})

const querySchema = z.object({
  categoryId: z.string().optional(),
  difficulty: z.coerce.number().int().min(1).max(5).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
})

// ブックマーク一覧取得（フィルタリング・ページネーション対応）
export const getBookmarks = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const validation = querySchema.safeParse(req.query)

    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        details: validation.error.issues,
      })
      return
    }

    const { categoryId, difficulty, page, limit, search } = validation.data
    const skip = (page - 1) * limit

    // フィルター条件の構築
    const where: any = {
      isActive: true,
    }

    // 関連する問題の条件
    const questionWhere: any = {}

    if (categoryId) {
      questionWhere.categoryId = categoryId
    }

    if (difficulty) {
      questionWhere.difficulty = difficulty
    }

    if (search) {
      questionWhere.content = {
        contains: search,
      }
    }

    // 問題の条件がある場合のみ追加
    if (Object.keys(questionWhere).length > 0) {
      where.question = questionWhere
    }

    // 総件数取得
    const total = await prisma.bookmark.count({ where })

    // ブックマーク一覧取得
    const bookmarks = await prisma.bookmark.findMany({
      where,
      skip,
      take: limit,
      include: {
        question: {
          include: {
            category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const totalPages = Math.ceil(total / limit)

    const response = {
      success: true,
      data: {
        bookmarks: bookmarks.map((bookmark: { id: string; questionId: string; question: { content: string; categoryId: string; category: { name: string } } }) => ({
          id: bookmark.id,
          questionId: bookmark.questionId,
          questionContent:
            bookmark.question.content.length > 100
              ? bookmark.question.content.substring(0, 100) + '...'
              : bookmark.question.content,
          categoryId: bookmark.question.categoryId,
          categoryName: bookmark.question.category.name,
          difficulty: bookmark.question.difficulty,
          year: bookmark.question.year,
          session: bookmark.question.session,
          memo: bookmark.memo,
          createdAt: bookmark.createdAt.toISOString(),
          updatedAt: bookmark.updatedAt.toISOString(),
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        filters: {
          categoryId,
          difficulty,
          search,
        },
      },
      message: 'Bookmarks retrieved successfully',
    }

    res.json(response)
  } catch (error) {
    // Error logged for debugging
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    })
  }
}

// ブックマーク作成
export const createBookmark = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const validation = createBookmarkSchema.safeParse(req.body)

    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: validation.error.issues,
      })
      return
    }

    const { questionId, memo } = validation.data

    // 問題の存在確認
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!question) {
      res.status(404).json({
        success: false,
        error: 'Question not found',
      })
      return
    }

    // 既存ブックマーク確認（userId は現時点では null で統一）
    const existingBookmark = await prisma.bookmark.findFirst({
      where: {
        questionId,
        userId: null,
        isActive: true,
      },
    })

    if (existingBookmark) {
      res.status(409).json({
        success: false,
        error: 'Bookmark already exists for this question',
      })
      return
    }

    // ブックマーク作成
    const bookmark = await prisma.bookmark.create({
      data: {
        questionId,
        userId: null, // 現時点ではユーザー管理未実装
        memo: memo || null,
        isActive: true,
      },
      include: {
        question: {
          include: {
            category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    const response = {
      success: true,
      data: {
        id: bookmark.id,
        questionId: bookmark.questionId,
        questionContent: bookmark.question.content,
        categoryId: bookmark.question.categoryId,
        categoryName: bookmark.question.category.name,
        difficulty: bookmark.question.difficulty,
        year: bookmark.question.year,
        session: bookmark.question.session,
        memo: bookmark.memo,
        createdAt: bookmark.createdAt.toISOString(),
        updatedAt: bookmark.updatedAt.toISOString(),
      },
      message: 'Bookmark created successfully',
    }

    res.status(201).json(response)
  } catch (error) {
    // Error logged for debugging
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    })
  }
}

// ブックマーク更新（メモのみ）
export const updateBookmark = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params
    const validation = updateBookmarkSchema.safeParse(req.body)

    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: validation.error.issues,
      })
      return
    }

    const { memo } = validation.data

    // ブックマーク存在確認
    const existingBookmark = await prisma.bookmark.findFirst({
      where: {
        id,
        isActive: true,
      },
    })

    if (!existingBookmark) {
      res.status(404).json({
        success: false,
        error: 'Bookmark not found',
      })
      return
    }

    // ブックマーク更新
    const bookmark = await prisma.bookmark.update({
      where: { id },
      data: {
        memo: memo || null,
        updatedAt: new Date(),
      },
      include: {
        question: {
          include: {
            category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    const response = {
      success: true,
      data: {
        id: bookmark.id,
        questionId: bookmark.questionId,
        questionContent: bookmark.question.content,
        categoryId: bookmark.question.categoryId,
        categoryName: bookmark.question.category.name,
        difficulty: bookmark.question.difficulty,
        year: bookmark.question.year,
        session: bookmark.question.session,
        memo: bookmark.memo,
        createdAt: bookmark.createdAt.toISOString(),
        updatedAt: bookmark.updatedAt.toISOString(),
      },
      message: 'Bookmark updated successfully',
    }

    res.json(response)
  } catch (error) {
    // Error logged for debugging
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    })
  }
}

// ブックマーク削除
export const deleteBookmark = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params

    // ブックマーク存在確認
    const existingBookmark = await prisma.bookmark.findFirst({
      where: {
        id,
        isActive: true,
      },
    })

    if (!existingBookmark) {
      res.status(404).json({
        success: false,
        error: 'Bookmark not found',
      })
      return
    }

    // 論理削除（isActive = false）
    await prisma.bookmark.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    })

    const response = {
      success: true,
      data: null,
      message: 'Bookmark deleted successfully',
    }

    res.json(response)
  } catch (error) {
    // Error logged for debugging
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    })
  }
}

// 特定の問題がブックマークされているかチェック
export const checkBookmarkStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { questionId } = req.params

    // 問題の存在確認
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    })

    if (!question) {
      res.status(404).json({
        success: false,
        error: 'Question not found',
      })
      return
    }

    // ブックマーク状態確認
    const bookmark = await prisma.bookmark.findFirst({
      where: {
        questionId,
        userId: null, // 現時点ではユーザー管理未実装
        isActive: true,
      },
    })

    const response = {
      success: true,
      data: {
        questionId,
        isBookmarked: !!bookmark,
        bookmarkId: bookmark?.id || null,
        memo: bookmark?.memo || null,
      },
      message: 'Bookmark status retrieved successfully',
    }

    res.json(response)
  } catch (error) {
    // Error logged for debugging
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    })
  }
}
