import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { QuestionListResponse, QuestionDetailResponse } from '../types/Question'

const prisma = new PrismaClient()

// 問題一覧取得（軽量レスポンス・ページネーション対応）
export const getQuestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const categoryId = req.query.categoryId as string
    const difficulty = req.query.difficulty ? parseInt(req.query.difficulty as string) : undefined
    const onlyUnanswered = req.query.onlyUnanswered === 'true'
    const onlyIncorrect = req.query.onlyIncorrect === 'true'
    const search = req.query.search as string

    const skip = (page - 1) * limit

    // フィルター条件の構築
    const where: any = {}
    
    if (categoryId) {
      where.categoryId = categoryId
    }
    
    if (difficulty) {
      where.difficulty = difficulty
    }
    
    if (search) {
      where.content = {
        contains: search
      }
    }

    // 未回答・不正解フィルターの処理
    if (onlyUnanswered || onlyIncorrect) {
      if (onlyUnanswered) {
        where.answers = {
          none: {}
        }
      }
      
      if (onlyIncorrect) {
        where.answers = {
          some: {
            isCorrect: false
          }
        }
      }
    }

    // 総件数取得
    const total = await prisma.question.count({ where })

    // 問題一覧取得（軽量データのみ）
    const questions = await prisma.question.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        content: true,
        difficulty: true,
        categoryId: true,
        category: {
          select: {
            name: true
          }
        },
        answers: {
          take: 1,
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            isCorrect: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const totalPages = Math.ceil(total / limit)
    
    const response: QuestionListResponse = {
      questions: questions.map(q => ({
        id: q.id,
        content: q.content.length > 100 ? q.content.substring(0, 100) + '...' : q.content,
        difficulty: q.difficulty,
        categoryId: q.categoryId,
        categoryName: q.category.name,
        hasAnswered: q.answers.length > 0,
        isCorrect: q.answers.length > 0 ? q.answers[0].isCorrect : undefined
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      filters: {
        categoryId,
        difficulty,
        onlyUnanswered,
        onlyIncorrect
      }
    }

    res.json(response)
  } catch (error) {
    // Error fetching questions logged for debugging
    res.status(500).json({ error: 'Internal server error' })
  }
}

// 問題詳細取得
export const getQuestionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        choices: {
          orderBy: {
            createdAt: 'asc'
          }
        },
        answers: {
          take: 1,
          orderBy: {
            createdAt: 'desc'
          }
        },
        essayAnswers: {
          where: {
            isDraft: false
          },
          take: 1,
          orderBy: {
            createdAt: 'desc'
          }
        },
        sections: {
          orderBy: {
            order: 'asc'
          }
        },
        category: {
          select: {
            name: true
          }
        }
      }
    })

    if (!question) {
      res.status(404).json({ error: 'Question not found' })
      return
    }

    const response: QuestionDetailResponse = {
      question: {
        id: question.id,
        content: question.content,
        explanation: question.explanation || undefined,
        difficulty: question.difficulty,
        year: question.year || undefined,
        session: question.session || undefined,
        categoryId: question.categoryId,
        questionType: (question.questionType as 'multiple_choice' | 'essay' | 'long_form') || 'multiple_choice',
        maxScore: question.maxScore || undefined,
        sampleAnswer: question.sampleAnswer || undefined,
        hasImages: question.hasImages || false,
        hasTables: question.hasTables || false,
        hasCodeBlocks: question.hasCodeBlocks || false,
        readingTime: question.readingTime || undefined,
        sections: question.sections?.map(section => ({
          id: section.id,
          questionId: section.questionId,
          title: section.title,
          content: section.content,
          order: section.order,
          sectionType: section.sectionType as 'introduction' | 'main' | 'subsection' | 'conclusion',
          hasImage: section.hasImage,
          hasTable: section.hasTable,
          hasCode: section.hasCode,
          createdAt: section.createdAt.toISOString(),
          updatedAt: section.updatedAt.toISOString()
        })) || [],
        choices: question.choices.map(choice => ({
          id: choice.id,
          content: choice.content,
          isCorrect: choice.isCorrect
        }))
      },
      userAnswer: question.answers.length > 0 ? {
        id: question.answers[0].id,
        isCorrect: question.answers[0].isCorrect,
        timeSpent: question.answers[0].timeSpent || undefined,
        createdAt: question.answers[0].createdAt.toISOString()
      } : undefined,
      essayAnswer: question.essayAnswers.length > 0 ? {
        id: question.essayAnswers[0].id,
        content: question.essayAnswers[0].content,
        timeSpent: question.essayAnswers[0].timeSpent || undefined,
        deviceType: question.essayAnswers[0].deviceType || undefined,
        isDraft: question.essayAnswers[0].isDraft,
        score: question.essayAnswers[0].score || undefined,
        feedback: question.essayAnswers[0].feedback || undefined,
        createdAt: question.essayAnswers[0].createdAt.toISOString(),
        updatedAt: question.essayAnswers[0].updatedAt.toISOString()
      } : undefined
    }

    res.json(response)
  } catch (error) {
    // Error fetching question logged for debugging
    res.status(500).json({ error: 'Internal server error' })
  }
}

// ランダム問題取得
export const getRandomQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const categoryId = req.query.categoryId as string
    const difficulty = req.query.difficulty ? parseInt(req.query.difficulty as string) : undefined
    const excludeAnswered = req.query.excludeAnswered === 'true'

    const where: any = {}
    
    if (categoryId) {
      where.categoryId = categoryId
    }
    
    if (difficulty) {
      where.difficulty = difficulty
    }
    
    if (excludeAnswered) {
      where.answers = {
        none: {}
      }
    }

    // 条件に合う問題の総数を取得
    const count = await prisma.question.count({ where })
    
    if (count === 0) {
      res.status(404).json({ error: 'No questions found matching criteria' })
      return
    }

    // ランダムインデックスを生成
    const randomIndex = Math.floor(Math.random() * count)

    const question = await prisma.question.findMany({
      where,
      skip: randomIndex,
      take: 1,
      include: {
        choices: {
          orderBy: {
            createdAt: 'asc'
          }
        },
        answers: {
          take: 1,
          orderBy: {
            createdAt: 'desc'
          }
        },
        essayAnswers: {
          where: {
            isDraft: false
          },
          take: 1,
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (question.length === 0) {
      res.status(404).json({ error: 'Question not found' })
      return
    }

    const selectedQuestion = question[0]
    
    const response: QuestionDetailResponse = {
      question: {
        id: selectedQuestion.id,
        content: selectedQuestion.content,
        explanation: selectedQuestion.explanation || undefined,
        difficulty: selectedQuestion.difficulty,
        year: selectedQuestion.year || undefined,
        session: selectedQuestion.session || undefined,
        categoryId: selectedQuestion.categoryId,
        questionType: (selectedQuestion.questionType as 'multiple_choice' | 'essay') || 'multiple_choice',
        maxScore: selectedQuestion.maxScore || undefined,
        sampleAnswer: selectedQuestion.sampleAnswer || undefined,
        choices: selectedQuestion.choices.map(choice => ({
          id: choice.id,
          content: choice.content,
          isCorrect: choice.isCorrect
        }))
      },
      userAnswer: selectedQuestion.answers.length > 0 ? {
        id: selectedQuestion.answers[0].id,
        isCorrect: selectedQuestion.answers[0].isCorrect,
        timeSpent: selectedQuestion.answers[0].timeSpent || undefined,
        createdAt: selectedQuestion.answers[0].createdAt.toISOString()
      } : undefined,
      essayAnswer: selectedQuestion.essayAnswers.length > 0 ? {
        id: selectedQuestion.essayAnswers[0].id,
        content: selectedQuestion.essayAnswers[0].content,
        timeSpent: selectedQuestion.essayAnswers[0].timeSpent || undefined,
        deviceType: selectedQuestion.essayAnswers[0].deviceType || undefined,
        isDraft: selectedQuestion.essayAnswers[0].isDraft,
        score: selectedQuestion.essayAnswers[0].score || undefined,
        feedback: selectedQuestion.essayAnswers[0].feedback || undefined,
        createdAt: selectedQuestion.essayAnswers[0].createdAt.toISOString(),
        updatedAt: selectedQuestion.essayAnswers[0].updatedAt.toISOString()
      } : undefined
    }

    res.json(response)
  } catch (error) {
    // Error fetching random question logged for debugging
    res.status(500).json({ error: 'Internal server error' })
  }
}