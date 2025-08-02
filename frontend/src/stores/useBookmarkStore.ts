import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface BookmarkItem {
  id: string
  questionId: string
  questionContent: string
  categoryId: string
  categoryName: string
  difficulty: number
  year?: number
  session?: string
  memo?: string
  createdAt: string
  updatedAt: string
}

interface BookmarkState {
  // Bookmark data
  bookmarks: BookmarkItem[]
  
  // Filters
  filters: {
    categoryId?: string
    difficulty?: number
    hasNotes?: boolean
    search?: string
  }
  
  // UI state
  isLoading: boolean
  error: string | null
  
  // Actions
  addBookmark: (questionId: string, questionData: {
    content: string
    categoryId: string
    categoryName: string
    difficulty: number
    year?: number
    session?: string
  }) => void
  removeBookmark: (questionId: string) => void
  updateBookmarkMemo: (questionId: string, memo: string) => void
  toggleBookmark: (questionId: string, questionData?: {
    content: string
    categoryId: string
    categoryName: string
    difficulty: number
    year?: number
    session?: string
  }) => void
  isBookmarked: (questionId: string) => boolean
  getBookmark: (questionId: string) => BookmarkItem | undefined
  setFilters: (filters: Partial<BookmarkState['filters']>) => void
  clearFilters: () => void
  getFilteredBookmarks: () => BookmarkItem[]
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set, get) => ({
      // Initial state
      bookmarks: [],
      filters: {},
      isLoading: false,
      error: null,
      
      // Actions
      addBookmark: (questionId, questionData) => {
        const state = get()
        
        // Check if already bookmarked to prevent duplicates
        if (state.bookmarks.some(b => b.questionId === questionId)) {
          return
        }
        
        const newBookmark: BookmarkItem = {
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
        
        set({
          bookmarks: [...state.bookmarks, newBookmark],
          error: null,
        })
      },
      
      removeBookmark: (questionId) => {
        const state = get()
        set({
          bookmarks: state.bookmarks.filter(b => b.questionId !== questionId),
          error: null,
        })
      },
      
      updateBookmarkMemo: (questionId, memo) => {
        const state = get()
        const updatedBookmarks = state.bookmarks.map(bookmark => 
          bookmark.questionId === questionId 
            ? { 
                ...bookmark, 
                memo, 
                updatedAt: new Date().toISOString() 
              }
            : bookmark
        )
        
        set({
          bookmarks: updatedBookmarks,
          error: null,
        })
      },
      
      toggleBookmark: (questionId, questionData) => {
        const state = get()
        const isCurrentlyBookmarked = state.bookmarks.some(b => b.questionId === questionId)
        
        if (isCurrentlyBookmarked) {
          get().removeBookmark(questionId)
        } else if (questionData) {
          get().addBookmark(questionId, questionData)
        }
      },
      
      isBookmarked: (questionId) => {
        const state = get()
        return state.bookmarks.some(b => b.questionId === questionId)
      },
      
      getBookmark: (questionId) => {
        const state = get()
        return state.bookmarks.find(b => b.questionId === questionId)
      },
      
      setFilters: (newFilters) => {
        const state = get()
        set({
          filters: { ...state.filters, ...newFilters }
        })
      },
      
      clearFilters: () => {
        set({
          filters: {}
        })
      },
      
      getFilteredBookmarks: () => {
        const state = get()
        let filtered = [...state.bookmarks]
        
        // Category filter
        if (state.filters.categoryId) {
          filtered = filtered.filter(b => b.categoryId === state.filters.categoryId)
        }
        
        // Difficulty filter
        if (state.filters.difficulty !== undefined) {
          filtered = filtered.filter(b => b.difficulty === state.filters.difficulty)
        }
        
        // Has notes filter
        if (state.filters.hasNotes !== undefined) {
          if (state.filters.hasNotes) {
            filtered = filtered.filter(b => b.memo && b.memo.trim().length > 0)
          } else {
            filtered = filtered.filter(b => !b.memo || b.memo.trim().length === 0)
          }
        }
        
        // Search filter
        if (state.filters.search && state.filters.search.trim()) {
          const searchTerm = state.filters.search.toLowerCase().trim()
          filtered = filtered.filter(b => 
            b.questionContent.toLowerCase().includes(searchTerm) ||
            b.categoryName.toLowerCase().includes(searchTerm) ||
            (b.memo && b.memo.toLowerCase().includes(searchTerm))
          )
        }
        
        // Sort by updated date (most recent first)
        return filtered.sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
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
    }),
    {
      name: 'bookmark-storage',
      partialize: (state) => ({
        bookmarks: state.bookmarks,
        filters: state.filters,
      }),
    }
  )
)