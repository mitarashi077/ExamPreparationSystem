import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 記述式回答提出
export const submitEssayAnswer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { questionId, content, timeSpent, deviceType } = req.body

    if (!questionId || !content?.trim()) {
      res.status(400).json({ error: 'QuestionId and content are required' })
      return
    }

    // 問題の存在確認と記述式問題かチェック
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: {
        id: true,
        questionType: true,
        maxScore: true
      }
    })

    if (!question) {
      res.status(404).json({ error: 'Question not found' })
      return
    }

    if (question.questionType !== 'essay') {
      res.status(400).json({ error: 'This endpoint is only for essay questions' })
      return
    }

    // 既存の下書きを削除（提出時）
    await prisma.essayAnswer.deleteMany({
      where: {
        questionId,
        isDraft: true
      }
    })

    // 記述式回答を記録
    const essayAnswer = await prisma.essayAnswer.create({
      data: {
        questionId,
        content: content.trim(),
        timeSpent: timeSpent || null,
        deviceType: deviceType || null,
        isDraft: false
      }
    })

    res.json({
      id: essayAnswer.id,
      content: essayAnswer.content,
      timeSpent: essayAnswer.timeSpent,
      isDraft: essayAnswer.isDraft,
      createdAt: essayAnswer.createdAt.toISOString(),
      maxScore: question.maxScore,
      message: '記述式回答を提出しました'
    })
  } catch (error) {
    console.error('Essay answer submission error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// 記述式回答下書き保存
export const saveEssayDraft = async (req: Request, res: Response): Promise<void> => {
  try {
    const { questionId, content, timeSpent, deviceType } = req.body

    if (!questionId || !content?.trim()) {
      res.status(400).json({ error: 'QuestionId and content are required' })
      return
    }

    // 問題の存在確認と記述式問題かチェック
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: {
        id: true,
        questionType: true
      }
    })

    if (!question) {
      res.status(404).json({ error: 'Question not found' })
      return
    }

    if (question.questionType !== 'essay') {
      res.status(400).json({ error: 'This endpoint is only for essay questions' })
      return
    }

    // 既存の下書きを更新または新規作成
    const existingDraft = await prisma.essayAnswer.findFirst({
      where: {
        questionId,
        isDraft: true
      }
    })

    let essayDraft
    if (existingDraft) {
      essayDraft = await prisma.essayAnswer.update({
        where: { id: existingDraft.id },
        data: {
          content: content.trim(),
          timeSpent: timeSpent || null,
          deviceType: deviceType || null,
          updatedAt: new Date()
        }
      })
    } else {
      essayDraft = await prisma.essayAnswer.create({
        data: {
          questionId,
          content: content.trim(),
          timeSpent: timeSpent || null,
          deviceType: deviceType || null,
          isDraft: true
        }
      })
    }

    res.json({
      id: essayDraft.id,
      content: essayDraft.content,
      timeSpent: essayDraft.timeSpent,
      isDraft: essayDraft.isDraft,
      updatedAt: essayDraft.updatedAt.toISOString(),
      message: '下書きを保存しました'
    })
  } catch (error) {
    console.error('Essay draft save error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// 記述式回答下書き取得
export const getEssayDraft = async (req: Request, res: Response): Promise<void> => {
  try {
    const { questionId } = req.params

    if (!questionId) {
      res.status(400).json({ error: 'QuestionId is required' })
      return
    }

    const draft = await prisma.essayAnswer.findFirst({
      where: {
        questionId,
        isDraft: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    if (!draft) {
      res.status(404).json({ error: 'Draft not found' })
      return
    }

    res.json({
      id: draft.id,
      content: draft.content,
      timeSpent: draft.timeSpent,
      isDraft: draft.isDraft,
      createdAt: draft.createdAt.toISOString(),
      updatedAt: draft.updatedAt.toISOString()
    })
  } catch (error) {
    console.error('Essay draft fetch error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// 記述式回答取得（提出済み）
export const getEssayAnswer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { questionId } = req.params

    if (!questionId) {
      res.status(400).json({ error: 'QuestionId is required' })
      return
    }

    const answer = await prisma.essayAnswer.findFirst({
      where: {
        questionId,
        isDraft: false
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        question: {
          select: {
            maxScore: true,
            sampleAnswer: true
          }
        }
      }
    })

    if (!answer) {
      res.status(404).json({ error: 'Essay answer not found' })
      return
    }

    res.json({
      id: answer.id,
      content: answer.content,
      timeSpent: answer.timeSpent,
      isDraft: answer.isDraft,
      score: answer.score,
      feedback: answer.feedback,
      createdAt: answer.createdAt.toISOString(),
      updatedAt: answer.updatedAt.toISOString(),
      maxScore: answer.question.maxScore,
      sampleAnswer: answer.question.sampleAnswer
    })
  } catch (error) {
    console.error('Essay answer fetch error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// 記述式回答採点（管理者用）
export const gradeEssayAnswer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { score, feedback } = req.body

    if (!id) {
      res.status(400).json({ error: 'Answer id is required' })
      return
    }

    if (score !== undefined && (typeof score !== 'number' || score < 0)) {
      res.status(400).json({ error: 'Score must be a non-negative number' })
      return
    }

    const answer = await prisma.essayAnswer.findUnique({
      where: { id },
      include: {
        question: {
          select: {
            maxScore: true
          }
        }
      }
    })

    if (!answer) {
      res.status(404).json({ error: 'Essay answer not found' })
      return
    }

    if (answer.isDraft) {
      res.status(400).json({ error: 'Cannot grade draft answers' })
      return
    }

    // 満点を超えないようにチェック
    const maxScore = answer.question.maxScore || 100
    const finalScore = score !== undefined ? Math.min(score, maxScore) : undefined

    const gradedAnswer = await prisma.essayAnswer.update({
      where: { id },
      data: {
        score: finalScore,
        feedback: feedback?.trim() || null,
        updatedAt: new Date()
      }
    })

    res.json({
      id: gradedAnswer.id,
      score: gradedAnswer.score,
      feedback: gradedAnswer.feedback,
      maxScore,
      updatedAt: gradedAnswer.updatedAt.toISOString(),
      message: '採点を完了しました'
    })
  } catch (error) {
    console.error('Essay grading error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}