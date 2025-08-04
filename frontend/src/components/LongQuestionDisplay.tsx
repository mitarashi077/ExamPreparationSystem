import { useState, useEffect, useRef } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Fab,
  IconButton,
  Chip,
  LinearProgress,
  Collapse,
  Alert,
  useTheme,
  useMediaQuery,
  Divider,
} from '@mui/material'
import {
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Schedule as TimeIcon,
  Star as DifficultyIcon,
  Bookmark as BookmarkIcon,
  MenuBook as ReadingIcon,
  CheckCircle as CompleteIcon,
} from '@mui/icons-material'
import ContentRenderer from './ContentRenderer'
import NavigationSidebar from './NavigationSidebar'
import BookmarkButton from './BookmarkButton'
import TouchButton from './TouchButton'
import { useAppStore } from '../stores/useAppStore'
import { LongQuestionDisplayProps, LongQuestionNavigation } from '../types/longQuestion'

const LongQuestionDisplay = ({
  question,
  onAnswer,
  onEssaySubmit,
  onNextQuestion,
  onSectionRead,
  onBookmarkSection,
  showTimer = true,
  timeLimit,
  reviewMode = false,
  showExplanation = false,
  showBookmark = true,
  categoryName,
}: LongQuestionDisplayProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { deviceType } = useAppStore()
  
  // State management
  const [navigation, setNavigation] = useState<LongQuestionNavigation>({
    currentSectionIndex: 0,
    totalSections: question.sections.length,
    sectionProgress: {},
    readingProgress: 0,
  })
  
  const [showNavigation, setShowNavigation] = useState(!isMobile)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [questionStartTime] = useState(Date.now())
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [bookmarkedSections, setBookmarkedSections] = useState<Set<string>>(new Set())
  const [isReading, setIsReading] = useState(false)
  const [showAnswerSection, setShowAnswerSection] = useState(false)
  
  // Refs for scroll management
  const contentRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<Record<string, HTMLDivElement>>({})

  // Timer effect
  useEffect(() => {
    if (!showTimer) return

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - questionStartTime) / 1000)
      setTimeElapsed(elapsed)
    }, 1000)

    return () => clearInterval(interval)
  }, [questionStartTime, showTimer])

  // Initialize reading state
  useEffect(() => {
    if (question.sections.length > 0) {
      setIsReading(true)
      // Mark first section as current
      updateSectionProgress(question.sections[0].id, false)
    }
  }, [question.id])

  // Auto-scroll to current section
  useEffect(() => {
    const currentSection = question.sections[navigation.currentSectionIndex]
    if (currentSection && sectionRefs.current[currentSection.id]) {
      const element = sectionRefs.current[currentSection.id]
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [navigation.currentSectionIndex])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'success'
      case 2: return 'info'
      case 3: return 'warning'
      case 4: return 'error'
      case 5: return 'error'
      default: return 'default'
    }
  }

  const getDifficultyLabel = (difficulty: number) => {
    switch (difficulty) {
      case 1: return '基礎'
      case 2: return '標準'
      case 3: return '応用'
      case 4: return '発展'
      case 5: return '最高'
      default: return '不明'
    }
  }

  const updateSectionProgress = (sectionId: string, isRead: boolean) => {
    setNavigation(prev => {
      const newProgress = { ...prev.sectionProgress, [sectionId]: isRead }
      const readCount = Object.values(newProgress).filter(Boolean).length
      const readingProgress = (readCount / prev.totalSections) * 100

      return {
        ...prev,
        sectionProgress: newProgress,
        readingProgress,
      }
    })

    if (isRead && onSectionRead) {
      onSectionRead(sectionId)
    }
  }

  const handleSectionClick = (sectionIndex: number) => {
    setNavigation(prev => ({ ...prev, currentSectionIndex: sectionIndex }))
    if (isMobile) {
      setShowNavigation(false)
    }
  }

  const handleSectionBookmark = (sectionId: string) => {
    setBookmarkedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })

    if (onBookmarkSection) {
      onBookmarkSection(sectionId)
    }
  }

  const toggleSectionExpansion = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
        // Mark as read when expanded
        updateSectionProgress(sectionId, true)
      }
      return newSet
    })
  }

  const handlePrevSection = () => {
    if (navigation.currentSectionIndex > 0) {
      setNavigation(prev => ({
        ...prev,
        currentSectionIndex: prev.currentSectionIndex - 1,
      }))
    }
  }

  const handleNextSection = () => {
    if (navigation.currentSectionIndex < navigation.totalSections - 1) {
      setNavigation(prev => ({
        ...prev,
        currentSectionIndex: prev.currentSectionIndex + 1,
      }))
    } else {
      // All sections read, show answer section
      setShowAnswerSection(true)
    }
  }

  const handleCompleteReading = () => {
    // Mark all sections as read
    const allSectionsRead = question.sections.reduce((acc, section) => {
      acc[section.id] = true
      return acc
    }, {} as Record<string, boolean>)

    setNavigation(prev => ({
      ...prev,
      sectionProgress: allSectionsRead,
      readingProgress: 100,
    }))

    setIsReading(false)
    setShowAnswerSection(true)
  }

  const currentSection = question.sections[navigation.currentSectionIndex]
  const timeProgress = timeLimit ? (timeElapsed / (timeLimit * 60)) * 100 : 0
  const isTimeWarning = timeLimit && timeElapsed > (timeLimit * 60 * 0.8)

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Navigation Sidebar */}
      <NavigationSidebar
        sections={question.sections}
        navigation={navigation}
        onSectionClick={handleSectionClick}
        onSectionBookmark={handleSectionBookmark}
        readingTime={question.readingTime}
        isOpen={showNavigation}
        onToggle={() => setShowNavigation(!showNavigation)}
        bookmarkedSections={bookmarkedSections}
      />

      {/* Main Content */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          ml: showNavigation && !isMobile ? '320px' : 0,
          transition: 'margin 0.3s ease',
        }}
        ref={contentRef}
      >
        <Card sx={{ m: 2, maxWidth: '900px', mx: 'auto' }}>
          {/* Header */}
          <Box sx={{ p: 2, pb: 0 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Box display="flex" alignItems="center" gap={1}>
                <Chip
                  icon={<DifficultyIcon fontSize="small" />}
                  label={getDifficultyLabel(question.difficulty)}
                  size="small"
                  color={getDifficultyColor(question.difficulty) as any}
                  variant="outlined"
                />
                {question.year && question.session && (
                  <Chip
                    label={`${question.year}年${question.session}`}
                    size="small"
                    variant="outlined"
                  />
                )}
                <Chip
                  label="長文問題"
                  size="small"
                  color="info"
                  variant="filled"
                />
                {reviewMode && (
                  <Chip
                    label="復習"
                    size="small"
                    color="warning"
                    variant="filled"
                  />
                )}
              </Box>

              <Box display="flex" alignItems="center" gap={1}>
                {showBookmark && (
                  <BookmarkButton
                    questionId={question.id}
                    questionData={{
                      content: question.content,
                      categoryId: question.categoryId,
                      categoryName: categoryName || 'カテゴリ未設定',
                      difficulty: question.difficulty,
                      year: question.year,
                      session: question.session,
                    }}
                    size="medium"
                    color="warning"
                    showAnimation={true}
                  />
                )}
                {showTimer && (
                  <>
                    <TimeIcon 
                      fontSize="small" 
                      color={isTimeWarning ? 'error' : 'action'} 
                    />
                    <Typography 
                      variant="body2" 
                      color={isTimeWarning ? 'error' : 'text.secondary'}
                      fontWeight={isTimeWarning ? 'bold' : 'normal'}
                    >
                      {formatTime(timeElapsed)}
                      {timeLimit && ` / ${timeLimit}分`}
                    </Typography>
                  </>
                )}
              </Box>
            </Box>

            {/* Reading Progress */}
            <Box sx={{ mb: 2 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">
                  読了進捗
                </Typography>
                <Typography variant="body2" color="primary.main" fontWeight="bold">
                  {Math.round(navigation.readingProgress)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={navigation.readingProgress}
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>

            {/* Time Progress Bar */}
            {timeLimit && (
              <LinearProgress
                variant="determinate"
                value={Math.min(timeProgress, 100)}
                color={isTimeWarning ? 'error' : 'primary'}
                sx={{ mb: 2, height: 4, borderRadius: 2 }}
              />
            )}
          </Box>

          <CardContent sx={{ pt: 1 }}>
            {/* Question Title */}
            <Typography variant="h5" component="h1" gutterBottom sx={{ mb: 3 }}>
              {question.content}
            </Typography>

            {/* Reading Mode */}
            {isReading && !showAnswerSection && (
              <Box>
                {/* Content Features Alert */}
                {(question.hasImages || question.hasTables || question.hasCodeBlocks) && (
                  <Alert severity="info" sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ReadingIcon fontSize="small" />
                      この問題には以下の要素が含まれています：
                      {question.hasImages && <Chip label="図表" size="small" />}
                      {question.hasTables && <Chip label="表" size="small" />}
                      {question.hasCodeBlocks && <Chip label="コード" size="small" />}
                    </Box>
                  </Alert>
                )}

                {/* Sections Display */}
                {question.sections.map((section, index) => (
                  <Card
                    key={section.id}
                    ref={el => {
                      if (el) sectionRefs.current[section.id] = el
                    }}
                    sx={{
                      mb: 2,
                      border: navigation.currentSectionIndex === index ? 2 : 1,
                      borderColor: navigation.currentSectionIndex === index 
                        ? 'primary.main' 
                        : 'divider',
                    }}
                  >
                    {/* Section Header */}
                    <Box
                      sx={{
                        p: 2,
                        pb: 1,
                        bgcolor: navigation.currentSectionIndex === index 
                          ? 'primary.light' 
                          : 'grey.50',
                      }}
                    >
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                            {section.title}
                          </Typography>
                          {navigation.sectionProgress[section.id] && (
                            <CompleteIcon color="success" fontSize="small" />
                          )}
                        </Box>
                        
                        <Box display="flex" alignItems="center" gap={1}>
                          {bookmarkedSections.has(section.id) && (
                            <BookmarkIcon color="warning" fontSize="small" />
                          )}
                          <IconButton
                            size="small"
                            onClick={() => toggleSectionExpansion(section.id)}
                          >
                            {expandedSections.has(section.id) ? <CollapseIcon /> : <ExpandIcon />}
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>

                    {/* Section Content */}
                    <Collapse in={expandedSections.has(section.id)} timeout="auto">
                      <CardContent sx={{ pt: 1 }}>
                        <ContentRenderer
                          content={section.content}
                          showImages={question.hasImages}
                          showTables={question.hasTables}
                          showCode={question.hasCodeBlocks}
                          maxImageHeight={isMobile ? 200 : 300}
                        />
                      </CardContent>
                    </Collapse>
                  </Card>
                ))}

                {/* Navigation Controls */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                  <TouchButton
                    variant="outlined"
                    startIcon={<PrevIcon />}
                    onClick={handlePrevSection}
                    disabled={navigation.currentSectionIndex === 0}
                  >
                    前のセクション
                  </TouchButton>

                  {navigation.currentSectionIndex === navigation.totalSections - 1 ? (
                    <TouchButton
                      variant="contained"
                      endIcon={<CompleteIcon />}
                      onClick={handleCompleteReading}
                      color="success"
                    >
                      読解完了
                    </TouchButton>
                  ) : (
                    <TouchButton
                      variant="contained"
                      endIcon={<NextIcon />}
                      onClick={handleNextSection}
                    >
                      次のセクション
                    </TouchButton>
                  )}
                </Box>
              </Box>
            )}

            {/* Answer Section */}
            {showAnswerSection && (
              <Box>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" gutterBottom>
                  解答
                </Typography>

                {question.choices && question.choices.length > 0 ? (
                  <Box>
                    {/* Multiple choice answer section */}
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      上記の長文を読んで、以下の質問に答えてください。
                    </Typography>
                    {/* Here you would render the choice selection UI */}
                    <Alert severity="info">
                      選択肢形式の回答部分は既存のQuestionCardコンポーネントと統合予定
                    </Alert>
                  </Box>
                ) : (
                  <Box>
                    {/* Essay answer section */}
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      上記の長文を読んで、記述式で回答してください。
                    </Typography>
                    <Alert severity="info">
                      記述式回答部分は既存のEssayQuestionCardコンポーネントと統合予定
                    </Alert>
                  </Box>
                )}

                {onNextQuestion && (
                  <TouchButton
                    fullWidth
                    variant="contained"
                    touchSize="large"
                    onClick={onNextQuestion}
                    sx={{ mt: 3 }}
                  >
                    次の問題へ
                  </TouchButton>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Floating Action Buttons (Mobile) */}
      {isMobile && isReading && (
        <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Fab
              size="small"
              color="primary"
              onClick={handlePrevSection}
              disabled={navigation.currentSectionIndex === 0}
            >
              <PrevIcon />
            </Fab>
            <Fab
              size="small"
              color="primary"
              onClick={handleNextSection}
              disabled={navigation.currentSectionIndex === navigation.totalSections - 1 && !showAnswerSection}
            >
              <NextIcon />
            </Fab>
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default LongQuestionDisplay