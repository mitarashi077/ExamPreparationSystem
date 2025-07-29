import { Router } from 'express'
import { getQuestions, getQuestionById, getRandomQuestion } from '../controllers/questionController'

const router = Router()

// GET /api/questions - 問題一覧取得（ページネーション・フィルター対応）
router.get('/', getQuestions)

// GET /api/questions/random - ランダム問題取得
router.get('/random', getRandomQuestion)

// GET /api/questions/:id - 問題詳細取得
router.get('/:id', getQuestionById)

export default router