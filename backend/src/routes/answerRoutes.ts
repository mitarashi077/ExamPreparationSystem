import { Router } from 'express'
import { submitAnswer, getStudyStats } from '../controllers/answerController'

const router = Router()

// POST /api/answers - 回答提出
router.post('/', submitAnswer)

// GET /api/answers/stats - 学習統計取得
router.get('/stats', getStudyStats)

export default router