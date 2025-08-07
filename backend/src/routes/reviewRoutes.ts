import express from 'express'
import {
  addToReviewList,
  getReviewQuestions,
  getReviewSchedule,
  startReviewSession,
  endReviewSession,
  getReviewStats,
} from '../controllers/reviewController'

const router = express.Router()

// 間違い問題を復習リストに追加
router.post('/items', addToReviewList)

// 復習対象問題の取得
router.get('/questions', getReviewQuestions)

// 復習スケジュールの取得
router.get('/schedule', getReviewSchedule)

// 復習セッション関連
router.post('/sessions', startReviewSession)
router.put('/sessions/:sessionId', endReviewSession)

// 復習統計の取得
router.get('/stats', getReviewStats)

export default router
