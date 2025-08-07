import React, { useState } from 'react'
import { Card, CardProps, Box, Fade } from '@mui/material'
import { useSwipeable } from 'react-swipeable'
import {
  ArrowBackIos as ArrowBackIcon,
  ArrowForwardIos as ArrowForwardIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material'

interface SwipeableCardProps
  extends Omit<CardProps, 'onSwipedLeft' | 'onSwipedRight'> {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  showSwipeIndicators?: boolean
  swipeThreshold?: number
  children: React.ReactNode
}

const SwipeableCard = ({
  onSwipeLeft,
  onSwipeRight,
  showSwipeIndicators = true,
  swipeThreshold = 50,
  children,
  sx,
  ...cardProps
}: SwipeableCardProps) => {
  const [isSwipeActive, setIsSwipeActive] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(
    null,
  )

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (onSwipeLeft) {
        onSwipeLeft()
      }
    },
    onSwipedRight: () => {
      if (onSwipeRight) {
        onSwipeRight()
      }
    },
    onSwiping: (eventData) => {
      setIsSwipeActive(true)
      if (eventData.deltaX > 0) {
        setSwipeDirection('right')
      } else {
        setSwipeDirection('left')
      }
    },
    onSwiped: () => {
      setIsSwipeActive(false)
      setSwipeDirection(null)
    },
    preventScrollOnSwipe: true,
    trackMouse: false,
    delta: swipeThreshold,
  })

  return (
    <Card
      {...swipeHandlers}
      sx={{
        position: 'relative',
        overflow: 'visible',
        transition: 'transform 0.2s ease-out, box-shadow 0.2s ease-out',
        transform: isSwipeActive
          ? `translateX(${swipeDirection === 'right' ? '5px' : swipeDirection === 'left' ? '-5px' : '0px'})`
          : 'translateX(0px)',
        boxShadow: isSwipeActive ? 4 : 1,
        cursor: onSwipeLeft || onSwipeRight ? 'grab' : 'default',
        '&:active': {
          cursor: onSwipeLeft || onSwipeRight ? 'grabbing' : 'default',
        },
        ...sx,
      }}
      {...cardProps}
    >
      {/* Left Swipe Indicator */}
      {showSwipeIndicators && onSwipeLeft && (
        <Fade in={isSwipeActive && swipeDirection === 'left'}>
          <Box
            sx={{
              position: 'absolute',
              right: -40,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ArrowForwardIcon fontSize="small" />
          </Box>
        </Fade>
      )}

      {/* Right Swipe Indicator */}
      {showSwipeIndicators && onSwipeRight && (
        <Fade in={isSwipeActive && swipeDirection === 'right'}>
          <Box
            sx={{
              position: 'absolute',
              left: -40,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ArrowBackIcon fontSize="small" />
          </Box>
        </Fade>
      )}

      {/* Swipe Hint Indicators */}
      {showSwipeIndicators && (onSwipeLeft || onSwipeRight) && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            opacity: 0.3,
            display: { xs: 'block', md: 'none' }, // Only show on mobile
          }}
        >
          <MoreIcon fontSize="small" />
        </Box>
      )}

      {children}
    </Card>
  )
}

export default SwipeableCard
