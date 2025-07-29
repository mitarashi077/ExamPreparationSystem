import { useEffect } from 'react'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useAppStore } from '../stores/useAppStore'

export const useDeviceDetection = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'))
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))
  
  const { setDeviceType, setOnlineStatus } = useAppStore()

  useEffect(() => {
    if (isMobile) {
      setDeviceType('mobile')
    } else if (isTablet) {
      setDeviceType('tablet')
    } else if (isDesktop) {
      setDeviceType('desktop')
    }
  }, [isMobile, isTablet, isDesktop, setDeviceType])

  useEffect(() => {
    const handleOnlineStatus = () => {
      setOnlineStatus(navigator.onLine)
    }

    window.addEventListener('online', handleOnlineStatus)
    window.addEventListener('offline', handleOnlineStatus)
    
    // Initial status
    handleOnlineStatus()

    return () => {
      window.removeEventListener('online', handleOnlineStatus)
      window.removeEventListener('offline', handleOnlineStatus)
    }
  }, [setOnlineStatus])

  return {
    isMobile,
    isTablet,
    isDesktop,
  }
}