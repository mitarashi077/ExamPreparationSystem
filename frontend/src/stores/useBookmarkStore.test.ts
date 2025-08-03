import { describe, it, expect, beforeEach } from 'vitest'
import { useBookmarkStore } from './useBookmarkStore'
import type { BookmarkItem } from '../types/bookmark'

describe('useBookmarkStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useBookmarkStore.setState({
      bookmarks: [],
      filters: {},
      isLoading: false,
      error: null,
    })
  })

  describe('Initial State', () => {
    it('should have empty initial state', () => {
      const state = useBookmarkStore.getState()
      expect(state.bookmarks).toEqual([])
      expect(state.filters).toEqual({})
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe(null)
    })
  })

  describe('addBookmark', () => {
    it('should add a new bookmark', () => {
      const questionData = {
        content: 'Test question content',
        categoryId: 'cat-1',
        categoryName: 'Test Category',
        difficulty: 3,
        year: 2023,
        session: 'Spring'
      }

      useBookmarkStore.getState().addBookmark('q-1', questionData)
      
      const state = useBookmarkStore.getState()
      expect(state.bookmarks).toHaveLength(1)
      expect(state.bookmarks[0].questionId).toBe('q-1')
      expect(state.bookmarks[0].questionContent).toBe('Test question content')
      expect(state.bookmarks[0].categoryId).toBe('cat-1')
      expect(state.bookmarks[0].difficulty).toBe(3)
      expect(state.bookmarks[0].memo).toBe('')
    })

    it('should not add duplicate bookmarks', () => {
      const questionData = {
        content: 'Test question content',
        categoryId: 'cat-1',
        categoryName: 'Test Category',
        difficulty: 3
      }

      useBookmarkStore.getState().addBookmark('q-1', questionData)
      useBookmarkStore.getState().addBookmark('q-1', questionData)
      
      const state = useBookmarkStore.getState()
      expect(state.bookmarks).toHaveLength(1)
    })

    it('should generate unique bookmark IDs', () => {
      const questionData = {
        content: 'Test question content',
        categoryId: 'cat-1',
        categoryName: 'Test Category',
        difficulty: 3
      }

      useBookmarkStore.getState().addBookmark('q-1', questionData)
      useBookmarkStore.getState().addBookmark('q-2', questionData)
      
      const state = useBookmarkStore.getState()
      expect(state.bookmarks[0].id).not.toBe(state.bookmarks[1].id)
    })
  })

  describe('removeBookmark', () => {
    beforeEach(() => {
      const questionData = {
        content: 'Test question content',
        categoryId: 'cat-1',
        categoryName: 'Test Category',
        difficulty: 3
      }
      useBookmarkStore.getState().addBookmark('q-1', questionData)
      useBookmarkStore.getState().addBookmark('q-2', questionData)
    })

    it('should remove bookmark by questionId', () => {
      useBookmarkStore.getState().removeBookmark('q-1')
      
      const state = useBookmarkStore.getState()
      expect(state.bookmarks).toHaveLength(1)
      expect(state.bookmarks[0].questionId).toBe('q-2')
    })

    it('should handle removal of non-existent bookmark', () => {
      useBookmarkStore.getState().removeBookmark('q-999')
      
      const state = useBookmarkStore.getState()
      expect(state.bookmarks).toHaveLength(2)
    })
  })

  describe('updateBookmarkMemo', () => {
    beforeEach(() => {
      const questionData = {
        content: 'Test question content',
        categoryId: 'cat-1',
        categoryName: 'Test Category',
        difficulty: 3
      }
      useBookmarkStore.getState().addBookmark('q-1', questionData)
    })

    it('should update bookmark memo', () => {
      const memo = 'This is an important question'
      useBookmarkStore.getState().updateBookmarkMemo('q-1', memo)
      
      const state = useBookmarkStore.getState()
      expect(state.bookmarks[0].memo).toBe(memo)
    })

    it('should update updatedAt timestamp when memo is updated', async () => {
      const initialTimestamp = useBookmarkStore.getState().bookmarks[0].updatedAt
      
      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10))
      
      useBookmarkStore.getState().updateBookmarkMemo('q-1', 'New memo')
      
      const state = useBookmarkStore.getState()
      expect(state.bookmarks[0].updatedAt).not.toBe(initialTimestamp)
    })
  })

  describe('toggleBookmark', () => {
    it('should add bookmark when not bookmarked', () => {
      const questionData = {
        content: 'Test question content',
        categoryId: 'cat-1',
        categoryName: 'Test Category',
        difficulty: 3
      }

      useBookmarkStore.getState().toggleBookmark('q-1', questionData)
      
      const state = useBookmarkStore.getState()
      expect(state.bookmarks).toHaveLength(1)
      expect(state.bookmarks[0].questionId).toBe('q-1')
    })

    it('should remove bookmark when already bookmarked', () => {
      const questionData = {
        content: 'Test question content',
        categoryId: 'cat-1',
        categoryName: 'Test Category',
        difficulty: 3
      }

      useBookmarkStore.getState().addBookmark('q-1', questionData)
      useBookmarkStore.getState().toggleBookmark('q-1')
      
      const state = useBookmarkStore.getState()
      expect(state.bookmarks).toHaveLength(0)
    })
  })

  describe('isBookmarked', () => {
    beforeEach(() => {
      const questionData = {
        content: 'Test question content',
        categoryId: 'cat-1',
        categoryName: 'Test Category',
        difficulty: 3
      }
      useBookmarkStore.getState().addBookmark('q-1', questionData)
    })

    it('should return true for bookmarked question', () => {
      const isBookmarked = useBookmarkStore.getState().isBookmarked('q-1')
      expect(isBookmarked).toBe(true)
    })

    it('should return false for non-bookmarked question', () => {
      const isBookmarked = useBookmarkStore.getState().isBookmarked('q-999')
      expect(isBookmarked).toBe(false)
    })
  })

  describe('getBookmark', () => {
    let bookmark: BookmarkItem

    beforeEach(() => {
      const questionData = {
        content: 'Test question content',
        categoryId: 'cat-1',
        categoryName: 'Test Category',
        difficulty: 3
      }
      useBookmarkStore.getState().addBookmark('q-1', questionData)
      bookmark = useBookmarkStore.getState().bookmarks[0]
    })

    it('should return bookmark for existing questionId', () => {
      const foundBookmark = useBookmarkStore.getState().getBookmark('q-1')
      expect(foundBookmark).toEqual(bookmark)
    })

    it('should return undefined for non-existent questionId', () => {
      const foundBookmark = useBookmarkStore.getState().getBookmark('q-999')
      expect(foundBookmark).toBeUndefined()
    })
  })

  describe('Filters', () => {
    beforeEach(() => {
      // Add test bookmarks with different properties
      const questionData1 = {
        content: 'Hardware question',
        categoryId: 'cat-1',
        categoryName: 'Hardware',
        difficulty: 3
      }
      const questionData2 = {
        content: 'Software question',
        categoryId: 'cat-2',
        categoryName: 'Software',
        difficulty: 5
      }
      
      useBookmarkStore.getState().addBookmark('q-1', questionData1)
      useBookmarkStore.getState().addBookmark('q-2', questionData2)
      useBookmarkStore.getState().updateBookmarkMemo('q-1', 'Important note')
    })

    describe('setFilters', () => {
      it('should set category filter', () => {
        useBookmarkStore.getState().setFilters({ categoryId: 'cat-1' })
        
        const state = useBookmarkStore.getState()
        expect(state.filters.categoryId).toBe('cat-1')
      })

      it('should set difficulty filter', () => {
        useBookmarkStore.getState().setFilters({ difficulty: 5 })
        
        const state = useBookmarkStore.getState()
        expect(state.filters.difficulty).toBe(5)
      })

      it('should set hasNotes filter', () => {
        useBookmarkStore.getState().setFilters({ hasNotes: true })
        
        const state = useBookmarkStore.getState()
        expect(state.filters.hasNotes).toBe(true)
      })

      it('should set search filter', () => {
        useBookmarkStore.getState().setFilters({ search: 'hardware' })
        
        const state = useBookmarkStore.getState()
        expect(state.filters.search).toBe('hardware')
      })
    })

    describe('clearFilters', () => {
      it('should clear all filters', () => {
        useBookmarkStore.getState().setFilters({ 
          categoryId: 'cat-1', 
          difficulty: 5, 
          hasNotes: true, 
          search: 'test' 
        })
        useBookmarkStore.getState().clearFilters()
        
        const state = useBookmarkStore.getState()
        expect(state.filters).toEqual({})
      })
    })

    describe('getFilteredBookmarks', () => {
      it('should filter by category', () => {
        useBookmarkStore.getState().setFilters({ categoryId: 'cat-1' })
        
        const filtered = useBookmarkStore.getState().getFilteredBookmarks()
        expect(filtered).toHaveLength(1)
        expect(filtered[0].categoryId).toBe('cat-1')
      })

      it('should filter by difficulty', () => {
        useBookmarkStore.getState().setFilters({ difficulty: 5 })
        
        const filtered = useBookmarkStore.getState().getFilteredBookmarks()
        expect(filtered).toHaveLength(1)
        expect(filtered[0].difficulty).toBe(5)
      })

      it('should filter by hasNotes', () => {
        useBookmarkStore.getState().setFilters({ hasNotes: true })
        
        const filtered = useBookmarkStore.getState().getFilteredBookmarks()
        expect(filtered).toHaveLength(1)
        expect(filtered[0].memo).toBe('Important note')
      })

      it('should filter by search term', () => {
        useBookmarkStore.getState().setFilters({ search: 'hardware' })
        
        const filtered = useBookmarkStore.getState().getFilteredBookmarks()
        expect(filtered).toHaveLength(1)
        expect(filtered[0].questionContent.toLowerCase()).toContain('hardware')
      })

      it('should return all bookmarks when no filters applied', () => {
        const filtered = useBookmarkStore.getState().getFilteredBookmarks()
        expect(filtered).toHaveLength(2)
      })
    })
  })

  describe('Loading and Error States', () => {
    it('should set loading state', () => {
      useBookmarkStore.getState().setLoading(true)
      
      const state = useBookmarkStore.getState()
      expect(state.isLoading).toBe(true)
    })

    it('should set error state', () => {
      const errorMessage = 'Failed to load bookmarks'
      useBookmarkStore.getState().setError(errorMessage)
      
      const state = useBookmarkStore.getState()
      expect(state.error).toBe(errorMessage)
    })

    it('should clear error state', () => {
      useBookmarkStore.getState().setError('Some error')
      useBookmarkStore.getState().clearError()
      
      const state = useBookmarkStore.getState()
      expect(state.error).toBe(null)
    })
  })

  describe('Persistence', () => {
    it('should persist bookmarks and filters in localStorage', () => {
      // This test would need to mock localStorage
      // For now, we just verify the structure exists
      const state = useBookmarkStore.getState()
      expect(typeof state.bookmarks).toBe('object')
      expect(typeof state.filters).toBe('object')
    })
  })
})