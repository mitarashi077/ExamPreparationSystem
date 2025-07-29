import { Router } from 'express'
import { getCategories, getCategoryStats } from '../controllers/categoryController'

const router = Router()

// GET /api/categories - カテゴリ一覧取得
router.get('/', getCategories)

// GET /api/categories/:id/stats - カテゴリ別統計取得
router.get('/:id/stats', getCategoryStats)

export default router