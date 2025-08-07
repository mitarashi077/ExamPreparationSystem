export interface Bookmark {
  id: number
  questionId: number
  userId: number
  memo?: string
  category?: string
  createdAt: string
  updatedAt: string
}

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

export interface BookmarkFilters {
  categoryId?: string
  difficulty?: number
  hasNotes?: boolean
  search?: string
}

export interface BookmarkState {
  // Bookmark data
  bookmarks: BookmarkItem[]

  // Filters
  filters: BookmarkFilters

  // UI state
  isLoading: boolean
  error: string | null
}

export interface BookmarkActions {
  addBookmark: (
    questionId: string,
    questionData: {
      content: string
      categoryId: string
      categoryName: string
      difficulty: number
      year?: number
      session?: string
    },
  ) => Promise<void>
  removeBookmark: (questionId: string) => Promise<void>
  updateBookmarkMemo: (questionId: string, memo: string) => Promise<void>
  toggleBookmark: (
    questionId: string,
    questionData?: {
      content: string
      categoryId: string
      categoryName: string
      difficulty: number
      year?: number
      session?: string
    },
  ) => Promise<void>
  isBookmarked: (questionId: string) => boolean
  getBookmark: (questionId: string) => BookmarkItem | undefined
  setFilters: (filters: Partial<BookmarkFilters>) => void
  clearFilters: () => void
  getFilteredBookmarks: () => BookmarkItem[]
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  loadBookmarks: (filters?: {
    categoryId?: string
    difficulty?: number
    search?: string
  }) => Promise<void>
  checkBookmarkStatus: (questionId: string) => Promise<{
    isBookmarked: boolean
    bookmarkId?: string
    memo?: string
  }>
  loadMockData: () => void
}

export type BookmarkStore = BookmarkState & BookmarkActions
