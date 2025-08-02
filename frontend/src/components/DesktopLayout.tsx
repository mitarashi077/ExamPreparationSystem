import React from 'react'
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  Chip,
  Avatar,
} from '@mui/material'
import {
  Home as HomeIcon,
  Quiz as QuizIcon,
  TrendingUp as ProgressIcon,
  Settings as SettingsIcon,
  WifiOff as OfflineIcon,
  School as SchoolIcon,
  Refresh as ReviewIcon,
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppStore } from '../stores/useAppStore'

const DRAWER_WIDTH = 280

interface DesktopLayoutProps {
  children: React.ReactNode
}

const DesktopLayout = ({ children }: DesktopLayoutProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isOnline } = useAppStore()

  const menuItems = [
    { text: 'ホーム', icon: <HomeIcon />, path: '/', badge: 0 },
    { text: '問題演習', icon: <QuizIcon />, path: '/practice', badge: 0 },
    { text: '間違い問題復習', icon: <ReviewIcon />, path: '/review', badge: 0 },
    { text: '進捗確認', icon: <ProgressIcon />, path: '/progress', badge: 0 },
  ]

  const settingsItems = [
    { text: '設定', icon: <SettingsIcon />, path: '/settings', badge: 0 },
  ]

  const handleNavigation = (path: string) => {
    navigate(path)
  }

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Top App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${DRAWER_WIDTH}px)`,
          ml: `${DRAWER_WIDTH}px`,
          bgcolor: 'primary.main',
        }}
      >
        <Toolbar>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            エンベデッドシステムスペシャリスト試験対策
          </Typography>
          
          {!isOnline && (
            <Chip
              icon={<OfflineIcon />}
              label="オフライン"
              color="warning"
              size="small"
              variant="outlined"
              sx={{ color: 'white', borderColor: 'white' }}
            />
          )}
        </Toolbar>
      </AppBar>

      {/* Side Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: 'background.paper',
            borderRight: 1,
            borderColor: 'divider',
          },
        }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <SchoolIcon />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                ESS試験対策
              </Typography>
              <Typography variant="caption" color="text.secondary">
                学習システム
              </Typography>
            </Box>
          </Box>
        </Toolbar>
        
        <Divider />
        
        {!isOnline && (
          <Box sx={{ p: 2 }}>
            <Chip
              icon={<OfflineIcon />}
              label="オフラインモード"
              color="warning"
              variant="outlined"
              size="small"
              // fullWidth
            />
          </Box>
        )}

        {/* Main Navigation */}
        <List sx={{ px: 1 }}>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => handleNavigation(item.path)}
              selected={location.pathname === item.path}
              sx={{
                my: 0.5,
                borderRadius: 2,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                },
                '&:hover': {
                  bgcolor: location.pathname === item.path ? 'primary.dark' : 'action.hover',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path ? 'inherit' : 'action.active',
                  minWidth: 40,
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
                  fontSize: '0.95rem',
                }}
              />
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 1 }} />

        {/* Settings */}
        <List sx={{ px: 1 }}>
          {settingsItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => handleNavigation(item.path)}
              selected={location.pathname === item.path}
              sx={{
                my: 0.5,
                borderRadius: 2,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                },
                '&:hover': {
                  bgcolor: location.pathname === item.path ? 'primary.dark' : 'action.hover',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path ? 'inherit' : 'action.active',
                  minWidth: 40,
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
                  fontSize: '0.95rem',
                }}
              />
            </ListItem>
          ))}
        </List>

        {/* Footer */}
        <Box sx={{ mt: 'auto', p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" align="center" display="block">
            Version 1.0.0
          </Typography>
          <Typography variant="caption" color="text.secondary" align="center" display="block">
            © 2024 ESS試験対策システム
          </Typography>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: 3,
          mt: 8, // AppBar height
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

export default DesktopLayout