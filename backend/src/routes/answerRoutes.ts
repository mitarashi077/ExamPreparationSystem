import { Router } from 'express'
import { submitAnswer, getStudyStats, getHeatmapData } from '../controllers/answerController'

const router = Router()

// POST /api/answers - 回答提出
router.post('/', submitAnswer)

// GET /api/answers/stats - 学習統計取得
router.get('/stats', getStudyStats)

// GET /api/answers/heatmap - ヒートマップデータ取得
router.get('/heatmap', getHeatmapData)

export default router