import React from 'react'
import { useDeviceDetection } from '../hooks/useDeviceDetection'
import MobileLayout from './MobileLayout'
import DesktopLayout from './DesktopLayout'

interface LayoutProps {
  children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const { isMobile, isTablet } = useDeviceDetection()

  // Use mobile layout for mobile and tablet devices
  if (isMobile || isTablet) {
    return <MobileLayout>{children}</MobileLayout>
  }

  // Use desktop layout for larger screens
  return <DesktopLayout>{children}</DesktopLayout>
}

export default Layout