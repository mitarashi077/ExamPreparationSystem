import { useSwipeable } from 'react-swipeable'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppStore } from '../stores/useAppStore'

const navigationItems = [
  { path: '/', name: 'ホーム' },
  { path: '/practice', name: '問題演習' },
  { path: '/progress', name: '進捗確認' },
  { path: '/settings', name: '設定' },
]

export const useSwipeNavigation = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { deviceType } = useAppStore()

  const getCurrentIndex = () => {
    return navigationItems.findIndex((item) => item.path === location.pathname)
  }

  const navigateToIndex = (index: number) => {
    if (index >= 0 && index < navigationItems.length) {
      navigate(navigationItems[index].path)
    }
  }

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (deviceType === 'mobile') {
        const currentIndex = getCurrentIndex()
        const nextIndex = currentIndex + 1
        navigateToIndex(nextIndex)
      }
    },
    onSwipedRight: () => {
      if (deviceType === 'mobile') {
        const currentIndex = getCurrentIndex()
        const prevIndex = currentIndex - 1
        navigateToIndex(prevIndex)
      }
    },
    preventScrollOnSwipe: true,
    trackMouse: false, // Only enable for touch devices
    delta: 50, // Minimum swipe distance
  })

  return {
    swipeHandlers,
    currentIndex: getCurrentIndex(),
    navigationItems,
    canSwipeLeft: getCurrentIndex() > 0,
    canSwipeRight: getCurrentIndex() < navigationItems.length - 1,
  }
}
