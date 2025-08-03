import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  Chip,
  Alert,
  Collapse,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  IconButton,
  Pagination,
  Fade,
} from '@mui/material'
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Bookmark as BookmarkIcon,
  Clear as ClearIcon,
  BookmarkBorder as BookmarkBorderIcon,
} from '@mui/icons-material'
import { useBookmarkStore } from '../stores/useBookmarkStore'
import { useDeviceDetection } from '../hooks/useDeviceDetection'
import TouchButton from '../components/TouchButton'
import BookmarkCard from '../components/BookmarkCard'
import MemoEditModal from '../components/MemoEditModal'

const ITEMS_PER_PAGE = 10

const BookmarksPage: React.FC = () => {
  const { isMobile } = useDeviceDetection()
  
  const { 
    bookmarks, 
    filters, 
    error,
    isLoading,
    removeBookmark,
    updateBookmarkMemo,
    setFilters,
    clearFilters,
    getFilteredBookmarks,
    clearError,
    loadBookmarks,
    loadMockData
  } = useBookmarkStore()

  // Local state
  const [showFilters, setShowFilters] = useState(false)
  const [searchText, setSearchText] = useState(filters.search || '')
  const [editingMemo, setEditingMemo] = useState<{ 
    questionId: string; 
    memo: string; 
    questionContent?: string;
  } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const filteredBookmarks = getFilteredBookmarks()
  const totalPages = Math.ceil(filteredBookmarks.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedBookmarks = filteredBookmarks.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  // Get unique categories for filter
  const categories = Array.from(new Set(bookmarks.map(b => b.categoryName)))

  // Initialize search text from store
  useEffect(() => {
    setSearchText(filters.search || '')
  }, [filters.search])

  // Apply search filter with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters({ search: searchText.trim() || undefined })
      setCurrentPage(1) // Reset to first page when searching
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchText, setFilters])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  // Load bookmarks from API on component mount
  useEffect(() => {
    loadBookmarks()
  }, [])
  
  // Reload bookmarks when filters change (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (Object.keys(filters).length > 0) {
        loadBookmarks(filters)
      }
    }, 500)
    
    return () => clearTimeout(timeoutId)
  }, [filters, loadBookmarks])

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters)
  }

  const handleClearFilters = () => {
    clearFilters()
    setSearchText('')
  }

  const handleDeleteBookmark = async (questionId: string) => {
    if (deleteConfirm === questionId) {
      try {
        await removeBookmark(questionId)
        setDeleteConfirm(null)
      } catch (error) {
        // Error is handled in the store
        console.error('Delete failed:', error)
      }
    } else {
      setDeleteConfirm(questionId)
      // Auto-clear confirmation after 3 seconds
      setTimeout(() => setDeleteConfirm(null), 3000)
    }
  }

  const handleMemoEdit = (questionId: string, currentMemo: string) => {
    const bookmark = bookmarks.find(b => b.questionId === questionId)
    setEditingMemo({ 
      questionId, 
      memo: currentMemo,
      questionContent: bookmark?.questionContent
    })
  }

  const handleMemoSave = async () => {
    if (editingMemo) {
      try {
        await updateBookmarkMemo(editingMemo.questionId, editingMemo.memo)
        setEditingMemo(null)
      } catch (error) {
        // Error is handled in the store
        console.error('Memo save failed:', error)
      }
    }
  }

  const handleMemoCancel = () => {
    setEditingMemo(null)
  }

  const handleMemoChange = (memo: string) => {
    if (editingMemo) {
      setEditingMemo({ ...editingMemo, memo })
    }
  }

  return (
    <Box sx={{ 
      p: isMobile ? 1 : 2, 
      pb: isMobile ? 10 : 2,
      minHeight: '100vh',
      bgcolor: 'background.default',
    }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          component="h1" 
          gutterBottom
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontWeight: 600,
          }}
        >
          <BookmarkIcon sx={{ fontSize: 'inherit', color: 'primary.main' }} />
          ブックマーク
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          重要な問題をブックマークして、メモと一緒に管理できます
        </Typography>
        
        {/* Statistics */}
        <Box display="flex" gap={2} flexWrap="wrap">
          <Chip
            icon={<BookmarkIcon />}
            label={`${bookmarks.length}件のブックマーク`}
            variant="outlined"
            color="primary"
          />
          {bookmarks.filter(b => b.memo && b.memo.trim()).length > 0 && (
            <Chip
              label={`${bookmarks.filter(b => b.memo && b.memo.trim()).length}件にメモあり`}
              variant="outlined"
              color="info"
            />
          )}
        </Box>
      </Box>

      {/* Error Display */}
      {error && (
        <Fade in={!!error}>
          <Alert 
            severity="error" 
            onClose={clearError}
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        </Fade>
      )}

      {/* Search and Filter Bar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            fullWidth
            placeholder="問題内容、カテゴリ、メモを検索..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchText && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchText('')}
                    aria-label="検索をクリア"
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ 
              flex: 1, 
              minWidth: '200px',
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
          
          <TouchButton
            variant="outlined"
            onClick={() => setShowFilters(!showFilters)}
            startIcon={<FilterIcon />}
            touchSize={isMobile ? 'large' : 'medium'}
            color={Object.keys(filters).length > 0 ? 'primary' : 'inherit'}
          >
            フィルタ
            {Object.keys(filters).length > 0 && (
              <Chip 
                label={Object.keys(filters).length}
                size="small"
                color="primary"
                sx={{ ml: 1, minWidth: 20, height: 20 }}
              />
            )}
          </TouchButton>
        </Box>

        {/* Filter Panel */}
        <Collapse in={showFilters}>
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>カテゴリ</InputLabel>
                  <Select
                    value={filters.categoryId || ''}
                    onChange={(e) => handleFilterChange({ categoryId: e.target.value || undefined })}
                    label="カテゴリ"
                  >
                    <MenuItem value="">すべて</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>難易度</InputLabel>
                  <Select
                    value={filters.difficulty ?? ''}
                    onChange={(e) => handleFilterChange({ difficulty: e.target.value ? Number(e.target.value) : undefined })}
                    label="難易度"
                  >
                    <MenuItem value="">すべて</MenuItem>
                    <MenuItem value={1}>基礎</MenuItem>
                    <MenuItem value={2}>標準</MenuItem>
                    <MenuItem value={3}>応用</MenuItem>
                    <MenuItem value={4}>発展</MenuItem>
                    <MenuItem value={5}>最高</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={filters.hasNotes ?? false}
                      onChange={(e) => handleFilterChange({ hasNotes: e.target.checked ? true : undefined })}
                    />
                  }
                  label="メモあり"
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <TouchButton
                  variant="outlined"
                  onClick={handleClearFilters}
                  fullWidth
                  startIcon={<ClearIcon />}
                  touchSize={isMobile ? 'large' : 'medium'}
                >
                  クリア
                </TouchButton>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </Paper>

      {/* Results Count */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {filteredBookmarks.length} 件のブックマーク
          {bookmarks.length !== filteredBookmarks.length && ` (全 ${bookmarks.length} 件中)`}
        </Typography>
      </Box>

      {/* Bookmark List */}
      {filteredBookmarks.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <BookmarkBorderIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {bookmarks.length === 0 ? 'ブックマークはありません' : '条件に一致するブックマークがありません'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {bookmarks.length === 0 
              ? '問題演習でブックマークボタンを押して、重要な問題を保存しましょう'
              : '検索条件やフィルタを変更してみてください'
            }
          </Typography>
          {bookmarks.length === 0 && (
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <TouchButton
                variant="outlined"
                onClick={loadMockData}
                touchSize={isMobile ? 'large' : 'medium'}
              >
                サンプルデータを読み込む
              </TouchButton>
              <TouchButton
                variant="contained"
                onClick={() => loadBookmarks()}
                touchSize={isMobile ? 'large' : 'medium'}
                disabled={isLoading}
              >
                {isLoading ? '読み込み中...' : 'API から読み込む'}
              </TouchButton>
            </Box>
          )}
        </Paper>
      ) : (
        <>
          {/* Bookmark Cards */}
          <Box sx={{ mb: 3 }}>
            {paginatedBookmarks.map((bookmark) => (
              <BookmarkCard
                key={bookmark.id}
                bookmark={bookmark}
                onEdit={handleMemoEdit}
                onDelete={handleDeleteBookmark}
                isMobile={isMobile}
              />
            ))}
          </Box>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" sx={{ mt: 4 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(_, page) => setCurrentPage(page)}
                color="primary"
                size={isMobile ? 'large' : 'medium'}
                sx={{
                  '& .MuiPaginationItem-root': {
                    minWidth: isMobile ? 44 : 32,
                    height: isMobile ? 44 : 32,
                    fontSize: isMobile ? '1.1rem' : '0.875rem',
                  },
                }}
              />
            </Box>
          )}
        </>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <Fade in={!!deleteConfirm}>
          <Alert 
            severity="warning" 
            sx={{ 
              position: 'fixed',
              bottom: isMobile ? 80 : 20,
              left: 20,
              right: 20,
              zIndex: 1000,
            }}
            action={
              <TouchButton
                color="inherit"
                size="small"
                onClick={() => handleDeleteBookmark(deleteConfirm)}
              >
                削除する
              </TouchButton>
            }
          >
            もう一度削除ボタンを押すと、ブックマークが削除されます
          </Alert>
        </Fade>
      )}

      {/* Memo Edit Modal */}
      <MemoEditModal
        open={!!editingMemo}
        memo={editingMemo?.memo || ''}
        questionContent={editingMemo?.questionContent}
        isMobile={isMobile}
        onClose={handleMemoCancel}
        onSave={handleMemoSave}
        onMemoChange={handleMemoChange}
      />
    </Box>
  )
}

export default BookmarksPage