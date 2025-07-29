import { forwardRef } from 'react'
import { Button, ButtonProps, styled } from '@mui/material'
import { useAppStore } from '../stores/useAppStore'

interface TouchButtonProps extends ButtonProps {
  touchSize?: 'small' | 'medium' | 'large'
  hapticFeedback?: boolean
}

const StyledTouchButton = styled(Button)<{ touchsize: string }>(({ theme, touchsize }) => ({
  minHeight: touchsize === 'large' ? 64 : touchsize === 'medium' ? 56 : 48,
  minWidth: touchsize === 'large' ? 120 : touchsize === 'medium' ? 100 : 80,
  fontSize: touchsize === 'large' ? '1.2rem' : touchsize === 'medium' ? '1rem' : '0.9rem',
  padding: theme.spacing(2, 3),
  borderRadius: touchsize === 'large' ? 16 : touchsize === 'medium' ? 12 : 8,
  fontWeight: 600,
  transition: 'all 0.2s ease-in-out',
  boxShadow: theme.shadows[2],
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
  
  '&:active': {
    transform: 'translateY(0px)',
    boxShadow: theme.shadows[1],
  },
  
  [theme.breakpoints.down('sm')]: {
    minHeight: touchsize === 'large' ? 72 : touchsize === 'medium' ? 64 : 56,
    minWidth: touchsize === 'large' ? 140 : touchsize === 'medium' ? 120 : 100,
    fontSize: touchsize === 'large' ? '1.3rem' : touchsize === 'medium' ? '1.1rem' : '1rem',
    padding: theme.spacing(2.5, 4),
  },
}))

const TouchButton = forwardRef<HTMLButtonElement, TouchButtonProps>(
  ({ touchSize = 'medium', hapticFeedback = true, onClick, children, ...props }, ref) => {
    const { deviceType } = useAppStore()
    
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      // Haptic feedback for mobile devices
      if (hapticFeedback && deviceType === 'mobile' && 'vibrate' in navigator) {
        navigator.vibrate(10) // Short vibration
      }
      
      if (onClick) {
        onClick(event)
      }
    }

    return (
      <StyledTouchButton
        ref={ref}
        touchsize={touchSize}
        onClick={handleClick}
        {...props}
      >
        {children}
      </StyledTouchButton>
    )
  }
)

TouchButton.displayName = 'TouchButton'

export default TouchButton