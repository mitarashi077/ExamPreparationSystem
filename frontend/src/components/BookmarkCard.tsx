import React, { useState } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Star as DifficultyIcon,
  Category as CategoryIcon,
  Note as NoteIcon,
} from '@mui/icons-material'
import type { BookmarkItem } from '../types/bookmark'

interface BookmarkCardProps {
  bookmark: BookmarkItem
  onEdit: (questionId: string, memo: string) => void
  onDelete: (questionId: string) => void
  isMobile?: boolean
}

const BookmarkCard: React.FC<BookmarkCardProps> = ({
  bookmark,
  onEdit,
  onDelete,
  isMobile = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

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

  const shouldTruncate = bookmark.questionContent.length > 100
  const displayContent = shouldTruncate && !isExpanded
    ? `${bookmark.questionContent.substring(0, 100)}...`
    : bookmark.questionContent

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent sx={{ pb: '16px !important' }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box display="flex" gap={1} flexWrap="wrap" sx={{ flex: 1, mr: 1 }}>
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
          
          <Box display="flex" gap={0.5}>
            <IconButton
              size="small"
              onClick={() => onEdit(bookmark.questionId, bookmark.memo || '')}
              sx={{ 
                color: 'primary.main',
                minWidth: isMobile ? 44 : 'auto',
                minHeight: isMobile ? 44 : 'auto',
              }}
              aria-label="メモを編集"
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onDelete(bookmark.questionId)}
              sx={{ 
                color: 'error.main',
                minWidth: isMobile ? 44 : 'auto',
                minHeight: isMobile ? 44 : 'auto',
              }}
              aria-label="ブックマークを削除"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Question Content */}
        <Box>
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 2,
              cursor: shouldTruncate ? 'pointer' : 'default',
              '&:hover': shouldTruncate ? { bgcolor: 'action.hover' } : {},
              p: 1,
              borderRadius: 1,
              lineHeight: 1.6,
            }}
            onClick={shouldTruncate ? () => setIsExpanded(!isExpanded) : undefined}
          >
            {displayContent}
            {shouldTruncate && (
              <IconButton 
                size="small" 
                sx={{ ml: 1, verticalAlign: 'middle' }}
                aria-label={isExpanded ? '折りたたむ' : '展開する'}
              >
                {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            )}
          </Typography>
        </Box>

        {/* Memo Section */}
        {bookmark.memo && (
          <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, mb: 2 }}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <NoteIcon fontSize="small" color="primary" />
              <Typography variant="subtitle2" color="primary">
                メモ
              </Typography>
            </Box>
            <Typography 
              variant="body2" 
              sx={{ 
                whiteSpace: 'pre-wrap',
                lineHeight: 1.5,
              }}
            >
              {bookmark.memo}
            </Typography>
          </Box>
        )}

        {/* Footer */}
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center"
          flexWrap={isMobile ? 'wrap' : 'nowrap'}
          gap={1}
        >
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
  )
}

export default BookmarkCard