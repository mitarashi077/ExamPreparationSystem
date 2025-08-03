import { useState, useEffect, useCallback } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Fade,
  Tabs,
  Tab,
  Button,
  Alert,
  Collapse,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  Schedule as TimeIcon,
  Star as DifficultyIcon,
  Info as InfoIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Save as SaveIcon,
  Preview as PreviewIcon,
  Edit as EditIcon,
  Send as SubmitIcon,
  Code as CodeIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
} from '@mui/icons-material'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import Editor from '@monaco-editor/react'
import TouchButton from './TouchButton'
import { useQuestionStore, Question } from '../stores/useQuestionStore'
import { useAppStore } from '../stores/useAppStore'
import { useBookmarkStore } from '../stores/useBookmarkStore'

interface EssayQuestionCardProps {
  question?: Question
  onSubmit?: (questionId: string, content: string, timeSpent: number) => Promise<any>
  onNextQuestion?: () => void
  showTimer?: boolean
  timeLimit?: number // minutes
  showBookmark?: boolean
  categoryName?: string
}

const EssayQuestionCard = ({
  question: propQuestion,
  onSubmit,
  onNextQuestion,
  showTimer = true,
  timeLimit,
  showBookmark = true,
  categoryName
}: EssayQuestionCardProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  const {
    currentQuestion,
    essayContent,
    isEssayPreview,
    currentEssayAnswer,
    showResult,
    questionStartTime,
    setEssayContent,
    setEssayPreview,
    saveEssayDraft,
    submitEssayAnswer,
    startQuestion,
  } = useQuestionStore()
  
  const { deviceType } = useAppStore()
  const {
    isBookmarked,
    toggleBookmark,
    clearError
  } = useBookmarkStore()
  
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentTab, setCurrentTab] = useState(0) // 0: Editor, 1: Preview
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [editorHeight, setEditorHeight] = useState(400)
  
  const activeQuestion = propQuestion || currentQuestion
  
  // Timer effect
  useEffect(() => {
    if (!questionStartTime || showResult) return

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - questionStartTime) / 1000)
      setTimeElapsed(elapsed)
      
      // Auto-save draft every 30 seconds
      if (elapsed % 30 === 0 && essayContent.trim() && activeQuestion) {
        handleSaveDraft()
      }
      
      // Auto-submit if time limit exceeded
      if (timeLimit && elapsed >= timeLimit * 60) {
        if (essayContent.trim() && activeQuestion) {
          handleSubmit()
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [questionStartTime, showResult, timeLimit, essayContent, activeQuestion])

  // Start timer when question loads
  useEffect(() => {
    if (activeQuestion && !questionStartTime) {
      startQuestion()
      setTimeElapsed(0)
      setShowHint(true)
      setTimeout(() => setShowHint(false), 3000)
    }
  }, [activeQuestion, questionStartTime, startQuestion])

  // Responsive editor height
  useEffect(() => {
    if (isMobile) {
      setEditorHeight(isFullscreen ? window.innerHeight - 200 : 300)
    } else {
      setEditorHeight(isFullscreen ? window.innerHeight - 250 : 400)
    }
  }, [isMobile, isFullscreen])

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

  const handleSaveDraft = useCallback(() => {
    if (!activeQuestion || !essayContent.trim()) return
    
    saveEssayDraft(activeQuestion.id)
    setLastSaved(new Date().toLocaleTimeString())
  }, [activeQuestion, essayContent, saveEssayDraft])

  const handleSubmit = async () => {
    if (!activeQuestion || !essayContent.trim()) return
    
    try {
      if (onSubmit) {
        await onSubmit(activeQuestion.id, essayContent, timeElapsed)
      } else {
        submitEssayAnswer(activeQuestion.id)
      }
    } catch (error) {
      console.error('記述式回答送信エラー:', error)
    }
  }

  const handleBookmarkToggle = () => {
    if (!activeQuestion) return
    
    clearError()
    
    const questionData = {
      content: activeQuestion.content,
      categoryId: activeQuestion.categoryId,
      categoryName: categoryName || 'カテゴリ未設定',
      difficulty: activeQuestion.difficulty,
      year: activeQuestion.year,
      session: activeQuestion.session,
    }
    
    toggleBookmark(activeQuestion.id, questionData)
  }

  const handleTabChange = (_: any, newValue: number) => {
    setCurrentTab(newValue)
    if (newValue === 1) {
      setEssayPreview(true)
    } else {
      setEssayPreview(false)
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  if (!activeQuestion) {
    return (
      <Card sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          問題を読み込み中...
        </Typography>
      </Card>
    )
  }

  const timeProgress = timeLimit ? (timeElapsed / (timeLimit * 60)) * 100 : 0
  const isTimeWarning = !!(timeLimit && timeElapsed > (timeLimit * 60 * 0.8))
  const isTimeUp = !!(timeLimit && timeElapsed >= timeLimit * 60)
  const wordCount = essayContent.length
  const isSubmittable = essayContent.trim().length > 0

  return (
    <Card sx={{ 
      maxWidth: '100%', 
      mx: 'auto',
      height: isFullscreen ? '100vh' : 'auto',
      position: isFullscreen ? 'fixed' : 'relative',
      top: isFullscreen ? 0 : 'auto',
      left: isFullscreen ? 0 : 'auto',
      right: isFullscreen ? 0 : 'auto',
      bottom: isFullscreen ? 0 : 'auto',
      zIndex: isFullscreen ? 9999 : 'auto',
      overflow: isFullscreen ? 'auto' : 'visible',
    }}>
      {/* Progress and Info Bar */}
      <Box sx={{ p: 2, pb: 0 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip
              icon={<DifficultyIcon fontSize="small" />}
              label={getDifficultyLabel(activeQuestion.difficulty)}
              size="small"
              color={getDifficultyColor(activeQuestion.difficulty) as any}
              variant="outlined"
            />
            {activeQuestion.year && activeQuestion.session && (
              <Chip
                label={`${activeQuestion.year}年${activeQuestion.session}`}
                size="small"
                variant="outlined"
              />
            )}
            <Chip
              label="記述式"
              size="small"
              color="secondary"
              variant="filled"
            />
            {activeQuestion.maxScore && (
              <Chip
                label={`配点: ${activeQuestion.maxScore}点`}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
          
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title={isFullscreen ? '通常表示' : '全画面表示'}>
              <IconButton size="small" onClick={toggleFullscreen}>
                {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </IconButton>
            </Tooltip>
            
            {showBookmark && (
              <TouchButton
                size="small"
                variant="text"
                touchSize="medium"
                onClick={handleBookmarkToggle}
                sx={{
                  minWidth: 44,
                  minHeight: 44,
                  color: isBookmarked(activeQuestion.id) ? 'warning.main' : 'action.active',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
                aria-label={isBookmarked(activeQuestion.id) ? 'ブックマークを削除' : 'ブックマークに追加'}
              >
                {isBookmarked(activeQuestion.id) ? (
                  <BookmarkIcon />
                ) : (
                  <BookmarkBorderIcon />
                )}
              </TouchButton>
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
        {/* Question Content */}
        <Typography variant="h6" component="h2" gutterBottom sx={{ lineHeight: 1.6 }}>
          {activeQuestion.content}
        </Typography>

        {/* Sample Answer Hint */}
        {activeQuestion.sampleAnswer && (
          <Collapse in={showHint}>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                サンプル回答を参考にMarkdown形式で記述してください。
                コードブロックには言語名を指定することでシンタックスハイライトが適用されます。
              </Typography>
            </Alert>
          </Collapse>
        )}

        {/* Touch Hint */}
        <Collapse in={showHint && deviceType === 'mobile'}>
          <Box
            sx={{
              mb: 2,
              p: 2,
              bgcolor: 'info.light',
              color: 'info.contrastText',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <InfoIcon fontSize="small" />
            <Typography variant="body2">
              エディタでMarkdown形式で回答を記述してください
            </Typography>
          </Box>
        </Collapse>

        {!showResult && (
          <>
            {/* Editor Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs value={currentTab} onChange={handleTabChange}>
                <Tab icon={<EditIcon />} label="エディタ" />
                <Tab icon={<PreviewIcon />} label="プレビュー" />
              </Tabs>
            </Box>

            {/* Editor Panel */}
            {currentTab === 0 && (
              <Box sx={{ mb: 2 }}>
                <Box sx={{ 
                  border: 1, 
                  borderColor: 'divider', 
                  borderRadius: 1,
                  overflow: 'hidden'
                }}>
                  <Editor
                    height={editorHeight}
                    defaultLanguage="markdown"
                    value={essayContent}
                    onChange={(value) => setEssayContent(value || '')}
                    theme={theme.palette.mode === 'dark' ? 'vs-dark' : 'vs'}
                    options={{
                      minimap: { enabled: !isMobile },
                      wordWrap: 'on',
                      lineNumbers: 'on',
                      fontSize: isMobile ? 14 : 16,
                      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", consolas, monospace',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                      insertSpaces: true,
                      renderWhitespace: 'selection',
                      bracketPairColorization: {
                        enabled: true
                      },
                      suggestOnTriggerCharacters: true,
                      acceptSuggestionOnEnter: 'on',
                      quickSuggestions: true,
                    } as any}
                  />
                </Box>
                
                {/* Editor Status Bar */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mt: 1,
                  fontSize: '0.875rem',
                  color: 'text.secondary'
                }}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Typography variant="caption">
                      文字数: {wordCount}
                    </Typography>
                    {lastSaved && (
                      <Typography variant="caption">
                        最終保存: {lastSaved}
                      </Typography>
                    )}
                  </Box>
                  
                  <Button
                    size="small"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveDraft}
                    disabled={!essayContent.trim()}
                  >
                    下書き保存
                  </Button>
                </Box>
              </Box>
            )}

            {/* Preview Panel */}
            {currentTab === 1 && (
              <Box sx={{ 
                mb: 2,
                p: 2,
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                minHeight: editorHeight,
                bgcolor: 'background.paper',
                overflow: 'auto'
              }}>
                {essayContent.trim() ? (
                  <ReactMarkdown
                    components={{
                      code(props) {
                        const {children, className, ...rest} = props
                        const match = /language-(\w+)/.exec(className || '')
                        return match ? (
                          <SyntaxHighlighter
                            style={vscDarkPlus as any}
                            language={match[1]}
                            PreTag="div"
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...rest}>
                            {children}
                          </code>
                        )
                      }
                    }}
                  >
                    {essayContent}
                  </ReactMarkdown>
                ) : (
                  <Typography variant="body2" color="text.secondary" fontStyle="italic">
                    プレビューするには左のエディタで回答を記述してください
                  </Typography>
                )}
              </Box>
            )}

            {/* Submit Button */}
            <Box sx={{ mt: 3 }}>
              <TouchButton
                fullWidth
                variant="contained"
                touchSize="large"
                disabled={!isSubmittable || isTimeUp}
                onClick={handleSubmit}
                startIcon={<SubmitIcon />}
                color={isTimeUp ? 'error' : 'primary'}
              >
                {isTimeUp ? '時間切れ' : '回答を提出'}
              </TouchButton>
            </Box>
          </>
        )}

        {/* Result Display */}
        <Fade in={showResult}>
          <Box sx={{ mt: 3 }}>
            {currentEssayAnswer && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'success.light',
                  color: 'success.contrastText',
                  mb: 2,
                }}
              >
                <Typography variant="h6" gutterBottom>
                  回答を提出しました
                </Typography>
                <Typography variant="body2">
                  回答時間: {formatTime(currentEssayAnswer.timeSpent / 1000)}
                </Typography>
                <Typography variant="body2">
                  文字数: {currentEssayAnswer.content.length}文字
                </Typography>
                {currentEssayAnswer.score && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    採点結果: {currentEssayAnswer.score}点 / {activeQuestion.maxScore || 100}点
                  </Typography>
                )}
                {currentEssayAnswer.feedback && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    フィードバック: {currentEssayAnswer.feedback}
                  </Typography>
                )}
              </Box>
            )}

            {/* Sample Answer */}
            {activeQuestion.sampleAnswer && (
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'info.light',
                  borderRadius: 2,
                  mb: 2,
                }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  サンプル回答
                </Typography>
                <Box sx={{ 
                  bgcolor: 'background.paper',
                  p: 2,
                  borderRadius: 1,
                  border: 1,
                  borderColor: 'divider'
                }}>
                  <ReactMarkdown
                    components={{
                      code(props) {
                        const {children, className, ...rest} = props
                        const match = /language-(\w+)/.exec(className || '')
                        return match ? (
                          <SyntaxHighlighter
                            style={vscDarkPlus as any}
                            language={match[1]}
                            PreTag="div"
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...rest}>
                            {children}
                          </code>
                        )
                      }
                    }}
                  >
                    {activeQuestion.sampleAnswer}
                  </ReactMarkdown>
                </Box>
              </Box>
            )}

            {onNextQuestion && (
              <TouchButton
                fullWidth
                variant="contained"
                touchSize="large"
                onClick={onNextQuestion}
              >
                次の問題へ
              </TouchButton>
            )}
          </Box>
        </Fade>
      </CardContent>
    </Card>
  )
}

export default EssayQuestionCard