import React from 'react'
import { Box, Slide } from '@mui/material'
import { useLocation } from 'react-router-dom'
import { useSwipeNavigation } from '../hooks/useSwipeNavigation'

interface SwipeablePagesProps {
  children: React.ReactNode
}

const SwipeablePages = ({ children }: SwipeablePagesProps) => {
  const location = useLocation()
  const { navigationItems } = useSwipeNavigation()

  const currentIndex = navigationItems.findIndex(
    (item) => item.path === location.pathname,
  )
  const isValidPage = currentIndex !== -1

  if (!isValidPage) {
    return <Box>{children}</Box>
  }

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <Slide
        direction="left"
        in={true}
        mountOnEnter
        unmountOnExit
        timeout={{
          enter: 300,
          exit: 200,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflowY: 'auto',
          }}
        >
          {children}
        </Box>
      </Slide>
    </Box>
  )
}

export default SwipeablePages
