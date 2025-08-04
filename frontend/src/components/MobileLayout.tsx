import React, { useState, useEffect } from 'react'
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Badge,
  Chip,
  Fab,
  Collapse,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Quiz as QuizIcon,
  TrendingUp as ProgressIcon,
  Settings as SettingsIcon,
  WifiOff as OfflineIcon,
  Close as CloseIcon,
  SwipeLeft as SwipeLeftIcon,
  SwipeRight as SwipeRightIcon,
  Info as InfoIcon,
  Bookmark as BookmarkIcon,
  Schedule as ScheduleIcon,
  EmojiEvents as GoalsIcon,
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppStore } from '../stores/useAppStore'
import { useSwipeNavigation } from '../hooks/useSwipeNavigation'
import CompactCountdown from './CompactCountdown'

interface MobileLayoutProps {
  children: React.ReactNode
}

const MobileLayout = ({ children }: MobileLayoutProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { 
    isMobileMenuOpen, 
    isOnline, 
    setMobileMenuOpen 
  } = useAppStore()
  
  const { 
    swipeHandlers, 
    canSwipeLeft, 
    canSwipeRight,
    currentIndex,
    navigationItems 
  } = useSwipeNavigation()
  
  const [showSwipeHint, setShowSwipeHint] = useState(false)

  // Show swipe hint on first visit
  useEffect(() => {
    const hasSeenHint = localStorage.getItem('swipe-hint-seen')
    if (!hasSeenHint) {
      setShowSwipeHint(true)
      const timer = setTimeout(() => {
        setShowSwipeHint(false)
        localStorage.setItem('swipe-hint-seen', 'true')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [])

  const menuItems = [
    { text: 'ホーム', icon: <HomeIcon />, path: '/', badge: 0 },
    { text: '問題演習', icon: <QuizIcon />, path: '/practice', badge: 0 },
    { text: 'ブックマーク', icon: <BookmarkIcon />, path: '/bookmarks', badge: 0 },
    { text: '試験日程', icon: <ScheduleIcon />, path: '/exam-schedule', badge: 0 },
    { text: '目標管理', icon: <GoalsIcon />, path: '/goals', badge: 0 },
    { text: '進捗確認', icon: <ProgressIcon />, path: '/progress', badge: 0 },
    { text: '設定', icon: <SettingsIcon />, path: '/settings', badge: 0 },
  ]

  const getNavigationValue = () => {
    const currentPath = location.pathname
    const index = menuItems.findIndex(item => item.path === currentPath)
    return index !== -1 ? index : 0
  }

  const handleDrawerToggle = () => {
    setMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleNavigation = (path: string) => {
    navigate(path)
    setMobileMenuOpen(false)
  }

  const drawer = (
    <Box sx={{ width: 280, height: '100%', bgcolor: 'background.paper' }}>
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6" component="div">
          ESS試験対策
        </Typography>
        <IconButton onClick={handleDrawerToggle} size="small">
          <CloseIcon />
        </IconButton>
      </Box>
      
      {!isOnline && (
        <Box sx={{ p: 2 }}>
          <Chip
            icon={<OfflineIcon />}
            label="オフラインモード"
            color="warning"
            variant="outlined"
            size="small"
          />
        </Box>
      )}

      <List sx={{ flex: 1 }}>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            selected={location.pathname === item.path}
            sx={{
              mx: 1,
              my: 0.5,
              borderRadius: 2,
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: location.pathname === item.path ? 'inherit' : 'action.active',
              }}
            >
              {item.badge > 0 ? (
                <Badge badgeContent={item.badge} color="error">
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )}
            </ListItemIcon>
            <ListItemText 
              primary={item.text}
              primaryTypographyProps={{
                fontWeight: location.pathname === item.path ? 600 : 400,
              }}
            />
          </ListItem>
        ))}
      </List>

      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary">
          Version 1.0.0
        </Typography>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top App Bar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: 'primary.main',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="メニューを開く"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            ESS試験対策
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <CompactCountdown />
            {!isOnline && (
              <IconButton color="inherit" size="small">
                <OfflineIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Side Drawer */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={isMobileMenuOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main Content with Swipe Support */}
      <Box
        {...swipeHandlers}
        component="main"
        sx={{
          flexGrow: 1,
          mt: 8, // AppBar height
          mb: 8, // Bottom navigation height
          px: 2,
          py: 1,
          minHeight: 'calc(100vh - 128px)', // Full height minus top and bottom bars
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Swipe Hint */}
        <Collapse in={showSwipeHint}>
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              px: 2,
              py: 1,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              boxShadow: 3,
            }}
          >
            <InfoIcon fontSize="small" />
            <Typography variant="caption">
              左右にスワイプしてページを切り替え
            </Typography>
          </Box>
        </Collapse>

        {/* Swipe Indicators */}
        {canSwipeLeft && (
          <Fab
            size="small"
            sx={{
              position: 'fixed',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              opacity: 0.7,
              '&:hover': {
                opacity: 1,
              },
            }}
            disabled
          >
            <SwipeRightIcon fontSize="small" />
          </Fab>
        )}

        {canSwipeRight && (
          <Fab
            size="small"
            sx={{
              position: 'fixed',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              opacity: 0.7,
              '&:hover': {
                opacity: 1,
              },
            }}
            disabled
          >
            <SwipeLeftIcon fontSize="small" />
          </Fab>
        )}

        {/* Page Indicator */}
        <Box
          sx={{
            position: 'fixed',
            bottom: 80, // Above bottom navigation
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 0.5,
            zIndex: 1,
          }}
        >
          {navigationItems.slice(0, 4).map((_, index) => (
            <Box
              key={index}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: index === currentIndex ? 'primary.main' : 'action.disabled',
                transition: 'background-color 0.3s ease',
              }}
            />
          ))}
        </Box>

        {children}
      </Box>

      {/* Bottom Navigation */}
      <Paper 
        sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0,
          zIndex: (theme) => theme.zIndex.appBar,
        }} 
        elevation={8}
      >
        <BottomNavigation
          value={getNavigationValue()}
          onChange={(_, newValue) => {
            if (menuItems[newValue]) {
              navigate(menuItems[newValue].path)
            }
          }}
          showLabels
          sx={{
            height: 64,
            '& .MuiBottomNavigationAction-root': {
              minWidth: 'auto',
              padding: '6px 12px 8px',
            },
          }}
        >
          {menuItems.slice(0, 4).map((item) => (
            <BottomNavigationAction
              key={item.text}
              label={item.text}
              icon={
                item.badge > 0 ? (
                  <Badge badgeContent={item.badge} color="error">
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )
              }
              sx={{
                '&.Mui-selected': {
                  color: 'primary.main',
                },
              }}
            />
          ))}
        </BottomNavigation>
      </Paper>
    </Box>
  )
}

export default MobileLayout