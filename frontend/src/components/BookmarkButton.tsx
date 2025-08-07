import React from 'react'
import { Box, IconButton, Zoom, styled } from '@mui/material'
import {
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
} from '@mui/icons-material'
import { useBookmarkStore } from '../stores/useBookmarkStore'
import { useAppStore } from '../stores/useAppStore'

interface BookmarkButtonProps {
  questionId: string
  questionData?: {
    content: string
    categoryId: string
    categoryName: string
    difficulty: number
    year?: number
    session?: string
  }
  size?: 'small' | 'medium' | 'large'
  showAnimation?: boolean
  color?: 'default' | 'primary' | 'warning'
  variant?: 'standard' | 'minimal'
  className?: string
  disabled?: boolean
  onToggle?: (isBookmarked: boolean) => void
}

const StyledIconButton = styled(IconButton)<{
  $size: string
  $variant: string
}>(({ theme, $size, $variant }) => {
  const sizeConfig = {
    small: { minSize: 40, iconSize: '1.2rem' },
    medium: { minSize: 44, iconSize: '1.4rem' },
    large: { minSize: 48, iconSize: '1.6rem' },
  }

  const config =
    sizeConfig[$size as keyof typeof sizeConfig] || sizeConfig.medium

  return {
    minWidth: config.minSize,
    minHeight: config.minSize,
    borderRadius: $variant === 'minimal' ? '50%' : theme.spacing(1.5),
    transition: 'all 0.2s ease-in-out',

    '& .MuiSvgIcon-root': {
      fontSize: config.iconSize,
      transition: 'all 0.2s ease-in-out',
    },

    '&:hover': {
      backgroundColor: theme.palette.action.hover,
      transform: 'scale(1.05)',
      '& .MuiSvgIcon-root': {
        transform: 'scale(1.1)',
      },
    },

    '&:active': {
      transform: 'scale(0.95)',
    },

    // Mobile optimizations
    [theme.breakpoints.down('sm')]: {
      minWidth: config.minSize + 4,
      minHeight: config.minSize + 4,
      '& .MuiSvgIcon-root': {
        fontSize: `calc(${config.iconSize} + 0.1rem)`,
      },
    },
  }
})

const AnimatedBookmarkIcon = styled(BookmarkIcon)<{ $isBookmarked: boolean }>(
  ({ $isBookmarked }) => ({
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: $isBookmarked ? 'scale(1)' : 'scale(0.8)',
    filter: $isBookmarked ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' : 'none',
  }),
)

const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  questionId,
  questionData,
  size = 'medium',
  showAnimation = true,
  color = 'warning',
  variant = 'standard',
  className,
  disabled = false,
  onToggle,
}) => {
  const { deviceType } = useAppStore()
  const { isBookmarked, toggleBookmark, clearError } = useBookmarkStore()

  const bookmarked = isBookmarked(questionId)

  const handleToggle = async () => {
    if (disabled) return

    clearError()

    // Haptic feedback for mobile devices
    if (deviceType === 'mobile' && 'vibrate' in navigator) {
      navigator.vibrate(15) // Slightly longer vibration for bookmark action
    }

    try {
      await toggleBookmark(questionId, questionData)

      // Call external callback if provided
      if (onToggle) {
        onToggle(!bookmarked)
      }
    } catch (error) {
      // Error is already handled in the store, but we can add additional UI feedback here if needed
      console.error('Bookmark toggle failed:', error)
    }
  }

  const getIconColor = () => {
    if (disabled) return 'action.disabled'

    switch (color) {
      case 'primary':
        return bookmarked ? 'primary.main' : 'action.active'
      case 'warning':
        return bookmarked ? 'warning.main' : 'action.active'
      default:
        return bookmarked ? 'text.primary' : 'action.active'
    }
  }

  const ariaLabel = bookmarked ? 'ブックマークを削除' : 'ブックマークに追加'

  return (
    <Box className={className}>
      <StyledIconButton
        $size={size}
        $variant={variant}
        onClick={handleToggle}
        disabled={disabled}
        aria-label={ariaLabel}
        title={ariaLabel}
        sx={{
          color: getIconColor(),
          '&:hover': {
            backgroundColor: 'action.hover',
          },
        }}
      >
        {showAnimation ? (
          <Zoom
            in={true}
            timeout={200}
            style={{
              transitionDelay: bookmarked ? '0ms' : '100ms',
            }}
          >
            <Box>
              {bookmarked ? (
                <AnimatedBookmarkIcon $isBookmarked={bookmarked} />
              ) : (
                <BookmarkBorderIcon />
              )}
            </Box>
          </Zoom>
        ) : bookmarked ? (
          <BookmarkIcon />
        ) : (
          <BookmarkBorderIcon />
        )}
      </StyledIconButton>
    </Box>
  )
}

export default BookmarkButton
