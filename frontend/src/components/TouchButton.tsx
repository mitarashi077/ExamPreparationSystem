import React, { forwardRef } from 'react'
import { Button, ButtonProps, styled } from '@mui/material'
import { useAppStore } from '../stores/useAppStore'

interface TouchButtonProps extends ButtonProps {
  touchSize?: 'small' | 'medium' | 'large'
  hapticFeedback?: boolean
}

const StyledTouchButton = styled(Button)<{ touchsize: string }>`
  min-height: ${({ touchsize }) => touchsize === 'large' ? '64px' : touchsize === 'medium' ? '56px' : '48px'};
  min-width: ${({ touchsize }) => touchsize === 'large' ? '120px' : touchsize === 'medium' ? '100px' : '80px'};
  font-size: ${({ touchsize }) => touchsize === 'large' ? '1.2rem' : touchsize === 'medium' ? '1rem' : '0.9rem'};
  padding: ${({ theme }) => theme.spacing(2, 3)};
  border-radius: ${({ touchsize }) => touchsize === 'large' ? '16px' : touchsize === 'medium' ? '12px' : '8px'};
  font-weight: 600;
  transition: all 0.2s ease-in-out;
  box-shadow: ${({ theme }) => theme.shadows[2]};
  writing-mode: horizontal-tb !important;
  text-orientation: mixed !important;
  direction: ltr;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows[4]};
  }
  
  &:active {
    transform: translateY(0px);
    box-shadow: ${({ theme }) => theme.shadows[1]};
  }
  
  ${({ theme }) => theme.breakpoints.down('sm')} {
    min-height: ${({ touchsize }) => touchsize === 'large' ? '72px' : touchsize === 'medium' ? '64px' : '56px'};
    min-width: ${({ touchsize }) => touchsize === 'large' ? '140px' : touchsize === 'medium' ? '120px' : '100px'};
    font-size: ${({ touchsize }) => touchsize === 'large' ? '1.3rem' : touchsize === 'medium' ? '1.1rem' : '1rem'};
    padding: ${({ theme }) => theme.spacing(2.5, 4)};
  }
`

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