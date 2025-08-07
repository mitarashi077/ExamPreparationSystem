import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BookmarkItem, BookmarkStore } from '../types/bookmark'
import { bookmarkAPI, withRetry } from '../utils/apiClient'

// Mock data for development and testing
export const createMockBookmarks = (): BookmarkItem[] => [
  {
    id: 'bookmark_1',
    questionId: 'q_1',
    questionContent:
      'マイクロコントローラのアーキテクチャに関する問題で、ハーバード・アーキテクチャとフォン・ノイマン・アーキテクチャの違いについて最も適切な説明はどれか。',
    categoryId: 'cat_hardware',
    categoryName: 'ハードウェア設計',
    difficulty: 3,
    year: 2023,
    session: '春期',
    memo: 'ハーバード・アーキテクチャは命令とデータが別々のメモリ空間を持つ',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'bookmark_2',
    questionId: 'q_15',
    questionContent:
      'リアルタイムシステムにおけるEDFスケジューリングアルゴリズムの特徴として正しいものはどれか。',
    categoryId: 'cat_realtime',
    categoryName: 'リアルタイムシステム',
    difficulty: 4,
    year: 2023,
    session: '秋期',
    memo: '',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'bookmark_3',
    questionId: 'q_28',
    questionContent:
      'C言語におけるvolatile修飾子の役割と使用場面について、最も適切な説明はどれか。',
    categoryId: 'cat_software',
    categoryName: 'ソフトウェア開発',
    difficulty: 5,
    year: 2022,
    session: '春期',
    memo: 'ハードウェアレジスタアクセス時に必須。コンパイラの最適化を抑制する。',
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  },
]

// Mock API functions for Phase 2 integration
export const mockBookmarkAPI = {
  async fetchBookmarks(): Promise<BookmarkItem[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    return createMockBookmarks()
  },

  async addBookmark(
    questionId: string,
    questionData: {
      content: string
      categoryId: string
      categoryName: string
      difficulty: number
      year?: number
      session?: string
    },
  ): Promise<BookmarkItem> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return {
      id: `bookmark_${questionId}_${Date.now()}`,
      questionId,
      questionContent: questionData.content,
      categoryId: questionData.categoryId,
      categoryName: questionData.categoryName,
      difficulty: questionData.difficulty,
      year: questionData.year,
      session: questionData.session,
      memo: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  },

  async removeBookmark(_questionId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    // Mock success
  },

  async updateBookmarkMemo(
    questionId: string,
    memo: string,
  ): Promise<BookmarkItem> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    // Return updated bookmark (mock)
    const mockBookmarks = createMockBookmarks()
    const bookmark = mockBookmarks.find((b) => b.questionId === questionId)
    if (!bookmark) throw new Error('Bookmark not found')

    return {
      ...bookmark,
      memo,
      updatedAt: new Date().toISOString(),
    }
  },
}

export const useBookmarkStore = create<BookmarkStore>()(
  persist(
    (set, get) => ({
      // Initial state
      bookmarks: [],
      filters: {},
      isLoading: false,
      error: null,

      // Actions
      addBookmark: async (questionId, questionData) => {
        const state = get()

        // Check if already bookmarked to prevent duplicates
        if (state.bookmarks.some((b) => b.questionId === questionId)) {
          return
        }

        try {
          set({ isLoading: true, error: null })

          // Use optimistic update
          const optimisticBookmark: BookmarkItem = {
            id: `temp_${questionId}_${Date.now()}`,
            questionId,
            questionContent: questionData.content,
            categoryId: questionData.categoryId,
            categoryName: questionData.categoryName,
            difficulty: questionData.difficulty,
            year: questionData.year,
            session: questionData.session,
            memo: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }

          set({
            bookmarks: [...state.bookmarks, optimisticBookmark],
            isLoading: false,
          })

          // Create bookmark via API with retry
          const newBookmark = await withRetry(() =>
            bookmarkAPI.createBookmark(questionId),
          )

          // Replace optimistic bookmark with real one
          const currentState = get()
          const updatedBookmarks = currentState.bookmarks.map((b) =>
            b.id === optimisticBookmark.id ? newBookmark : b,
          )

          set({
            bookmarks: updatedBookmarks,
            error: null,
          })
        } catch (error) {
          // Remove optimistic bookmark on failure
          const currentState = get()
          const rollbackBookmarks = currentState.bookmarks.filter(
            (b) => b.questionId !== questionId,
          )
          set({
            bookmarks: rollbackBookmarks,
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : 'ブックマークの追加に失敗しました',
          })
        }
      },

      removeBookmark: async (questionId) => {
        const state = get()
        const bookmark = state.bookmarks.find(
          (b) => b.questionId === questionId,
        )

        if (!bookmark) {
          return
        }

        try {
          set({ isLoading: true, error: null })

          // Optimistic update
          const optimisticBookmarks = state.bookmarks.filter(
            (b) => b.questionId !== questionId,
          )
          set({
            bookmarks: optimisticBookmarks,
            isLoading: false,
          })

          // Delete via API with retry
          await withRetry(() => bookmarkAPI.deleteBookmark(bookmark.id))
        } catch (error) {
          // Rollback on failure - restore the bookmark
          const currentState = get()
          set({
            bookmarks: [...currentState.bookmarks, bookmark],
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : 'ブックマークの削除に失敗しました',
          })
        }
      },

      updateBookmarkMemo: async (questionId, memo) => {
        const state = get()
        const bookmark = state.bookmarks.find(
          (b) => b.questionId === questionId,
        )

        if (!bookmark) {
          return
        }

        try {
          set({ isLoading: true, error: null })

          // Optimistic update
          const optimisticBookmarks = state.bookmarks.map((b) =>
            b.questionId === questionId
              ? {
                  ...b,
                  memo,
                  updatedAt: new Date().toISOString(),
                }
              : b,
          )

          set({
            bookmarks: optimisticBookmarks,
            isLoading: false,
          })

          // Update via API with retry
          const updatedBookmark = await withRetry(() =>
            bookmarkAPI.updateBookmark(bookmark.id, memo),
          )

          // Update with server response
          const currentState = get()
          const finalBookmarks = currentState.bookmarks.map((b) =>
            b.questionId === questionId ? updatedBookmark : b,
          )

          set({
            bookmarks: finalBookmarks,
            error: null,
          })
        } catch (error) {
          // Rollback on failure - restore original memo
          const currentState = get()
          const rollbackBookmarks = currentState.bookmarks.map((b) =>
            b.questionId === questionId
              ? { ...b, memo: bookmark.memo, updatedAt: bookmark.updatedAt }
              : b,
          )
          set({
            bookmarks: rollbackBookmarks,
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : 'メモの更新に失敗しました',
          })
        }
      },

      toggleBookmark: async (questionId, questionData) => {
        const state = get()
        const isCurrentlyBookmarked = state.bookmarks.some(
          (b) => b.questionId === questionId,
        )

        if (isCurrentlyBookmarked) {
          await get().removeBookmark(questionId)
        } else if (questionData) {
          await get().addBookmark(questionId, questionData)
        }
      },

      isBookmarked: (questionId) => {
        const state = get()
        return state.bookmarks.some((b) => b.questionId === questionId)
      },

      getBookmark: (questionId) => {
        const state = get()
        return state.bookmarks.find((b) => b.questionId === questionId)
      },

      setFilters: (newFilters) => {
        const state = get()
        set({
          filters: { ...state.filters, ...newFilters },
        })
      },

      clearFilters: () => {
        set({
          filters: {},
        })
      },

      getFilteredBookmarks: () => {
        const state = get()
        let filtered = [...state.bookmarks]

        // Category filter
        if (state.filters.categoryId) {
          filtered = filtered.filter(
            (b) => b.categoryId === state.filters.categoryId,
          )
        }

        // Difficulty filter
        if (state.filters.difficulty !== undefined) {
          filtered = filtered.filter(
            (b) => b.difficulty === state.filters.difficulty,
          )
        }

        // Has notes filter
        if (state.filters.hasNotes !== undefined) {
          if (state.filters.hasNotes) {
            filtered = filtered.filter(
              (b) => b.memo && b.memo.trim().length > 0,
            )
          } else {
            filtered = filtered.filter(
              (b) => !b.memo || b.memo.trim().length === 0,
            )
          }
        }

        // Search filter
        if (state.filters.search && state.filters.search.trim()) {
          const searchTerm = state.filters.search.toLowerCase().trim()
          filtered = filtered.filter(
            (b) =>
              b.questionContent.toLowerCase().includes(searchTerm) ||
              b.categoryName.toLowerCase().includes(searchTerm) ||
              (b.memo && b.memo.toLowerCase().includes(searchTerm)),
          )
        }

        // Sort by updated date (most recent first)
        return filtered.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        )
      },

      setLoading: (loading) => {
        set({ isLoading: loading })
      },

      setError: (error) => {
        set({ error })
      },

      clearError: () => {
        set({ error: null })
      },

      // Load bookmarks from API
      loadBookmarks: async (filters?: {
        categoryId?: string
        difficulty?: number
        search?: string
      }) => {
        try {
          set({ isLoading: true, error: null })

          const bookmarks = await withRetry(() =>
            bookmarkAPI.getBookmarks(filters),
          )

          set({
            bookmarks,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : 'ブックマークの読み込みに失敗しました',
          })
        }
      },

      // Check bookmark status for a question
      checkBookmarkStatus: async (questionId: string) => {
        try {
          const status = await bookmarkAPI.checkBookmarkStatus(questionId)
          return status
        } catch (error) {
          console.error('Error checking bookmark status:', error)
          return { isBookmarked: false }
        }
      },

      // Development helper - load mock data
      loadMockData: () => {
        set({
          bookmarks: createMockBookmarks(),
          error: null,
        })
      },
    }),
    {
      name: 'bookmark-storage',
      partialize: (state) => ({
        bookmarks: state.bookmarks,
        filters: state.filters,
      }),
    },
  ),
)
