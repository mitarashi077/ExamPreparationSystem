import { Router } from 'express'
import { 
  getBookmarks, 
  createBookmark, 
  updateBookmark, 
  deleteBookmark, 
  checkBookmarkStatus 
} from '../controllers/bookmarkController'

const router = Router()

// GET /api/bookmarks - ブックマーク一覧取得（フィルタリング・ページネーション対応）
router.get('/', getBookmarks)

// POST /api/bookmarks - ブックマーク作成
router.post('/', createBookmark)

// PUT /api/bookmarks/:id - ブックマーク更新（メモのみ）
router.put('/:id', updateBookmark)

// DELETE /api/bookmarks/:id - ブックマーク削除
router.delete('/:id', deleteBookmark)

// GET /api/bookmarks/question/:questionId - 特定問題のブックマーク状態確認
router.get('/question/:questionId', checkBookmarkStatus)

export default router