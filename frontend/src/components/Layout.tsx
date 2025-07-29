import { useState } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  useTheme,
  useMediaQuery,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Quiz as QuizIcon,
  TrendingUp as ProgressIcon,
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'

interface LayoutProps {
  children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    { text: 'ホーム', icon: <HomeIcon />, path: '/' },
    { text: '問題演習', icon: <QuizIcon />, path: '/practice' },
    { text: '進捗確認', icon: <ProgressIcon />, path: '/progress' },
  ]

  const getNavigationValue = () => {
    const currentPath = location.pathname
    const index = menuItems.findIndex(item => item.path === currentPath)
    return index !== -1 ? index : 0
  }

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen)
  }

  const handleNavigation = (path: string) => {
    navigate(path)
    if (isMobile) {
      setDrawerOpen(false)
    }
  }

  const drawer = (
    <Box sx={{ width: 250 }}>
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="fixed">
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            ESS試験対策
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', flex: 1 }}>
        {!isMobile && (
          <Drawer
            variant="permanent"
            sx={{
              width: 250,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: 250,
                boxSizing: 'border-box',
                top: 64, // AppBar height
                height: 'calc(100% - 64px)',
              },
            }}
          >
            {drawer}
          </Drawer>
        )}

        {isMobile && (
          <Drawer
            variant="temporary"
            open={drawerOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              '& .MuiDrawer-paper': {
                width: 250,
                boxSizing: 'border-box',
              },
            }}
          >
            {drawer}
          </Drawer>
        )}

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            mt: 8, // AppBar height
            mb: isMobile ? 7 : 0, // Bottom navigation height on mobile
            ml: isMobile ? 0 : 0,
          }}
        >
          {children}
        </Box>
      </Box>

      {isMobile && (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
          <BottomNavigation
            value={getNavigationValue()}
            onChange={(_, newValue) => {
              if (menuItems[newValue]) {
                navigate(menuItems[newValue].path)
              }
            }}
            showLabels
          >
            {menuItems.map((item) => (
              <BottomNavigationAction
                key={item.text}
                label={item.text}
                icon={item.icon}
              />
            ))}
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  )
}

export default Layout