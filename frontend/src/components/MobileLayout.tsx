import { useState, useEffect } from 'react'
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
} from '@mui/material'
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Quiz as QuizIcon,
  TrendingUp as ProgressIcon,
  Settings as SettingsIcon,
  WifiOff as OfflineIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppStore } from '../stores/useAppStore'

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

  const menuItems = [
    { text: 'ホーム', icon: <HomeIcon />, path: '/', badge: 0 },
    { text: '問題演習', icon: <QuizIcon />, path: '/practice', badge: 0 },
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
          
          {!isOnline && (
            <IconButton color="inherit" size="small">
              <OfflineIcon />
            </IconButton>
          )}
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

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: 8, // AppBar height
          mb: 8, // Bottom navigation height
          px: 2,
          py: 1,
          minHeight: 'calc(100vh - 128px)', // Full height minus top and bottom bars
        }}
      >
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
          {menuItems.slice(0, 3).map((item) => (
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