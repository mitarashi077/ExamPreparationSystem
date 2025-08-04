import { useState } from 'react'
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Divider,
  LinearProgress,
  Chip,
  Collapse,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  CheckCircle as CheckedIcon,
  RadioButtonUnchecked as UncheckedIcon,
  ExpandLess,
  ExpandMore,
  Bookmark as BookmarkIcon,
  Schedule as TimeIcon,
  Article as ArticleIcon,
} from '@mui/icons-material'
import { QuestionSection, LongQuestionNavigation } from '../types/longQuestion'

interface NavigationSidebarProps {
  sections: QuestionSection[]
  navigation: LongQuestionNavigation
  onSectionClick: (sectionIndex: number) => void
  onSectionBookmark?: (sectionId: string) => void
  readingTime?: number
  isOpen?: boolean
  onToggle?: () => void
  bookmarkedSections?: Set<string>
}

const NavigationSidebar = ({
  sections,
  navigation,
  onSectionClick,
  onSectionBookmark,
  readingTime,
  isOpen: controlledOpen,
  onToggle,
  bookmarkedSections = new Set(),
}: NavigationSidebarProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [internalOpen, setInternalOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
  const handleToggle = onToggle || (() => setInternalOpen(!internalOpen))

  const getSectionIcon = (sectionType: string) => {
    switch (sectionType) {
      case 'introduction':
        return '📝'
      case 'main':
        return '📄'
      case 'subsection':
        return '📋'
      case 'conclusion':
        return '✅'
      default:
        return '📄'
    }
  }

  const getSectionTypeLabel = (sectionType: string) => {
    switch (sectionType) {
      case 'introduction':
        return '導入'
      case 'main':
        return 'メイン'
      case 'subsection':
        return 'サブセクション'
      case 'conclusion':
        return 'まとめ'
      default:
        return 'セクション'
    }
  }

  const groupedSections = sections.reduce((acc, section, index) => {
    const type = section.sectionType
    if (!acc[type]) {
      acc[type] = []
    }
    acc[type].push({ ...section, index })
    return acc
  }, {} as Record<string, Array<QuestionSection & { index: number }>>)

  const toggleSectionExpansion = (sectionType: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionType)) {
        newSet.delete(sectionType)
      } else {
        newSet.add(sectionType)
      }
      return newSet
    })
  }

  const drawerContent = (
    <Box sx={{ width: isMobile ? '280px' : '320px', height: '100%' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
            <ArticleIcon sx={{ mr: 1 }} />
            目次
          </Typography>
          {isMobile && (
            <IconButton onClick={handleToggle} size="small">
              <CloseIcon />
            </IconButton>
          )}
        </Box>
        
        {/* Progress Section */}
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              読了進捗
            </Typography>
            <Typography variant="body2" color="primary.main" sx={{ ml: 1, fontWeight: 'bold' }}>
              {Math.round(navigation.readingProgress)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={navigation.readingProgress}
            sx={{ height: 6, borderRadius: 3 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {navigation.currentSectionIndex + 1} / {navigation.totalSections}
            </Typography>
            {readingTime && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="caption" color="text.secondary">
                  約{readingTime}分
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Section List */}
      <List sx={{ flexGrow: 1, overflow: 'auto' }}>
        {Object.entries(groupedSections).map(([sectionType, sectionGroup]) => (
          <Box key={sectionType}>
            <ListItem
              sx={{
                bgcolor: 'grey.50',
                borderBottom: 1,
                borderColor: 'divider',
              }}
            >
              <ListItemButton
                onClick={() => toggleSectionExpansion(sectionType)}
                sx={{ py: 1 }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Typography fontSize="1.2rem">
                    {getSectionIcon(sectionType)}
                  </Typography>
                </ListItemIcon>
                <ListItemText
                  primary={getSectionTypeLabel(sectionType)}
                  secondary={`${sectionGroup.length}個のセクション`}
                />
                {expandedSections.has(sectionType) ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            
            <Collapse in={expandedSections.has(sectionType)} timeout="auto" unmountOnExit>
              {sectionGroup.map((section) => {
                const isRead = navigation.sectionProgress[section.id] || false
                const isCurrent = navigation.currentSectionIndex === section.index
                const isBookmarked = bookmarkedSections.has(section.id)

                return (
                  <ListItem key={section.id} disablePadding>
                    <ListItemButton
                      selected={isCurrent}
                      onClick={() => onSectionClick(section.index)}
                      sx={{
                        pl: 4,
                        py: 1,
                        '&.Mui-selected': {
                          bgcolor: 'primary.light',
                          color: 'primary.contrastText',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        {isRead ? (
                          <CheckedIcon color="success" fontSize="small" />
                        ) : (
                          <UncheckedIcon color="disabled" fontSize="small" />
                        )}
                      </ListItemIcon>
                      
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography
                              variant="body2"
                              noWrap
                              sx={{
                                flex: 1,
                                fontWeight: isCurrent ? 'bold' : 'normal',
                              }}
                            >
                              {section.title}
                            </Typography>
                            {isBookmarked && (
                              <BookmarkIcon
                                fontSize="small"
                                color="warning"
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                            {section.hasImage && (
                              <Chip label="画像" size="small" variant="outlined" />
                            )}
                            {section.hasTable && (
                              <Chip label="表" size="small" variant="outlined" />
                            )}
                            {section.hasCode && (
                              <Chip label="コード" size="small" variant="outlined" />
                            )}
                          </Box>
                        }
                      />
                      
                      {onSectionBookmark && (
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation()
                            onSectionBookmark(section.id)
                          }}
                          sx={{ ml: 1 }}
                        >
                          <BookmarkIcon
                            fontSize="small"
                            color={isBookmarked ? 'warning' : 'disabled'}
                          />
                        </IconButton>
                      )}
                    </ListItemButton>
                  </ListItem>
                )
              })}
            </Collapse>
          </Box>
        ))}
      </List>

      {/* Footer Stats */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            読了済み
          </Typography>
          <Typography variant="caption" color="success.main" fontWeight="bold">
            {Object.values(navigation.sectionProgress).filter(Boolean).length} / {sections.length}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">
            ブックマーク
          </Typography>
          <Typography variant="caption" color="warning.main" fontWeight="bold">
            {bookmarkedSections.size}
          </Typography>
        </Box>
      </Box>
    </Box>
  )

  return (
    <>
      {/* Navigation Toggle Button (Mobile) */}
      {isMobile && (
        <Box sx={{ position: 'fixed', top: 16, left: 16, zIndex: 1200 }}>
          <IconButton
            onClick={handleToggle}
            sx={{
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            }}
            size="small"
          >
            <MenuIcon />
          </IconButton>
        </Box>
      )}

      {/* Drawer */}
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        anchor="left"
        open={isOpen}
        onClose={isMobile ? handleToggle : undefined}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: isMobile ? '280px' : '320px',
            bgcolor: 'background.paper',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  )
}

export default NavigationSidebar