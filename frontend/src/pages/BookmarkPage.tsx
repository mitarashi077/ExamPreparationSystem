import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  List,
  TextField,
  InputAdornment,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  Card,
  CardContent,
  IconButton,
  Collapse,
  Grid,
} from '@mui/material'
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Bookmark as BookmarkIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Star as DifficultyIcon,
  Category as CategoryIcon,
  Clear as ClearIcon,
  Note as NoteIcon,
} from '@mui/icons-material'
import { useBookmarkStore } from '../stores/useBookmarkStore'
import { useAppStore } from '../stores/useAppStore'
import TouchButton from '../components/TouchButton'

const BookmarkPage = () => {
  const { deviceType } = useAppStore()
  const { 
    bookmarks, 
    filters, 
    error,
    removeBookmark,
    updateBookmarkMemo,
    setFilters,
    clearFilters,
    getFilteredBookmarks,
    clearError 
  } = useBookmarkStore()

  const [showFilters, setShowFilters] = useState(false)
  const [searchText, setSearchText] = useState(filters.search || '')
  const [editingMemo, setEditingMemo] = useState<{ questionId: string; memo: string } | null>(null)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  const filteredBookmarks = getFilteredBookmarks()

  // Initialize search text from store
  useEffect(() => {
    setSearchText(filters.search || '')
  }, [filters.search])

  // Apply search filter with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters({ search: searchText.trim() || undefined })
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchText, setFilters])

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters)
  }

  const handleClearFilters = () => {
    clearFilters()
    setSearchText('')
  }

  const handleDeleteBookmark = (questionId: string) => {
    removeBookmark(questionId)
  }

  const handleMemoEdit = (questionId: string, currentMemo: string) => {
    setEditingMemo({ questionId, memo: currentMemo })
  }

  const handleMemoSave = () => {
    if (editingMemo) {
      updateBookmarkMemo(editingMemo.questionId, editingMemo.memo)
      setEditingMemo(null)
    }
  }

  const handleMemoCancel = () => {
    setEditingMemo(null)
  }

  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'success'
      case 2: return 'info'
      case 3: return 'warning'
      case 4: return 'error'
      case 5: return 'error'
      default: return 'default'
    }
  }

  const getDifficultyLabel = (difficulty: number) => {
    switch (difficulty) {
      case 1: return '基礎'
      case 2: return '標準'
      case 3: return '応用'
      case 4: return '発展'
      case 5: return '最高'
      default: return '不明'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get unique categories for filter
  const categories = Array.from(new Set(bookmarks.map(b => b.categoryName)))

  return (
    <Box sx={{ p: deviceType === 'mobile' ? 1 : 2, pb: deviceType === 'mobile' ? 10 : 2 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <BookmarkIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          ブックマーク
        </Typography>
        <Typography variant="body2" color="text.secondary">
          重要な問題をブックマークして、メモと一緒に管理できます
        </Typography>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert 
          severity="error" 
          onClose={clearError}
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      {/* Search and Filter Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            fullWidth
            placeholder="問題内容、カテゴリ、メモを検索..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchText && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchText('')}
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1, minWidth: '200px' }}
          />
          
          <TouchButton
            variant="outlined"
            onClick={() => setShowFilters(!showFilters)}
            startIcon={<FilterIcon />}
            touchSize={deviceType === 'mobile' ? 'large' : 'medium'}
          >
            フィルタ
          </TouchButton>
        </Box>

        {/* Filter Panel */}
        <Collapse in={showFilters}>
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Grid container spacing={2}>
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
                  touchSize={deviceType === 'mobile' ? 'large' : 'medium'}
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
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <BookmarkIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {bookmarks.length === 0 ? 'ブックマークはありません' : '条件に一致するブックマークがありません'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {bookmarks.length === 0 
              ? '問題演習でブックマークボタンを押して、重要な問題を保存しましょう'
              : '検索条件やフィルタを変更してみてください'
            }
          </Typography>
        </Paper>
      ) : (
        <List sx={{ bgcolor: 'background.paper' }}>
          {filteredBookmarks.map((bookmark) => (
            <Card key={bookmark.id} sx={{ mb: 2 }}>
              <CardContent sx={{ pb: '16px !important' }}>
                {/* Header */}
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    <Chip
                      icon={<DifficultyIcon fontSize="small" />}
                      label={getDifficultyLabel(bookmark.difficulty)}
                      size="small"
                      color={getDifficultyColor(bookmark.difficulty) as any}
                      variant="outlined"
                    />
                    <Chip
                      icon={<CategoryIcon fontSize="small" />}
                      label={bookmark.categoryName}
                      size="small"
                      variant="outlined"
                    />
                    {bookmark.year && bookmark.session && (
                      <Chip
                        label={`${bookmark.year}年${bookmark.session}`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                  
                  <Box display="flex" gap={1}>
                    <IconButton
                      size="small"
                      onClick={() => handleMemoEdit(bookmark.questionId, bookmark.memo || '')}
                      sx={{ color: 'primary.main' }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteBookmark(bookmark.questionId)}
                      sx={{ color: 'error.main' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                {/* Question Content */}
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mb: 2,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                    p: 1,
                    borderRadius: 1,
                  }}
                  onClick={() => setExpandedCard(expandedCard === bookmark.id ? null : bookmark.id)}
                >
                  {bookmark.questionContent.length > 100 && expandedCard !== bookmark.id
                    ? `${bookmark.questionContent.substring(0, 100)}...`
                    : bookmark.questionContent
                  }
                  {bookmark.questionContent.length > 100 && (
                    <IconButton size="small" sx={{ ml: 1 }}>
                      {expandedCard === bookmark.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  )}
                </Typography>

                {/* Memo Section */}
                {bookmark.memo && (
                  <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, mb: 2 }}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <NoteIcon fontSize="small" color="primary" />
                      <Typography variant="subtitle2" color="primary">
                        メモ
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {bookmark.memo}
                    </Typography>
                  </Box>
                )}

                {/* Footer */}
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    作成: {formatDate(bookmark.createdAt)}
                  </Typography>
                  {bookmark.updatedAt !== bookmark.createdAt && (
                    <Typography variant="caption" color="text.secondary">
                      更新: {formatDate(bookmark.updatedAt)}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </List>
      )}

      {/* Memo Edit Dialog */}
      <Dialog 
        open={!!editingMemo} 
        onClose={handleMemoCancel}
        maxWidth="sm"
        fullWidth
        fullScreen={deviceType === 'mobile'}
      >
        <DialogTitle>メモを編集</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="メモ"
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            value={editingMemo?.memo || ''}
            onChange={(e) => setEditingMemo(prev => prev ? { ...prev, memo: e.target.value } : null)}
            placeholder="この問題についてのメモを入力してください..."
          />
        </DialogContent>
        <DialogActions>
          <TouchButton onClick={handleMemoCancel}>
            キャンセル
          </TouchButton>
          <TouchButton onClick={handleMemoSave} variant="contained">
            保存
          </TouchButton>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default BookmarkPage