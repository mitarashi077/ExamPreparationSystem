import express from 'express'
import {
  submitEssayAnswer,
  saveEssayDraft,
  getEssayDraft,
  getEssayAnswer,
  gradeEssayAnswer
} from '../controllers/essayController'

const router = express.Router()

// 記述式回答提出
router.post('/submit', submitEssayAnswer)

// 記述式回答下書き保存
router.post('/draft', saveEssayDraft)

// 記述式回答下書き取得
router.get('/draft/:questionId', getEssayDraft)

// 記述式回答取得（提出済み）
router.get('/:questionId', getEssayAnswer)

// 記述式回答採点（管理者用）
router.put('/grade/:id', gradeEssayAnswer)

export default router