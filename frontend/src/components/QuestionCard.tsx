import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Fade,
  Collapse,
} from '@mui/material'
import {
  Schedule as TimeIcon,
  Star as DifficultyIcon,
  CheckCircle as CorrectIcon,
  Cancel as IncorrectIcon,
  Info as InfoIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
} from '@mui/icons-material'
import TouchButton from './TouchButton'
import ZoomableImage from './ZoomableImage'
import EssayQuestionCard from './EssayQuestionCard'
import { useQuestionStore } from '../stores/useQuestionStore'
import { useAppStore } from '../stores/useAppStore'
import { useBookmarkStore } from '../stores/useBookmarkStore'

interface QuestionCardProps {
  question?: any // 復習モード用の直接問題データ
  onAnswer?: (questionId: string, choiceId: string, timeSpent: number) => Promise<any> // 復習モード用
  onAnswerSubmit?: (choiceId: string, timeSpent: number) => void
  onEssaySubmit?: (questionId: string, content: string, timeSpent: number) => Promise<any> // 記述式回答送信
  onNextQuestion?: () => void
  showTimer?: boolean
  timeLimit?: number // minutes
  reviewMode?: boolean // 復習モード
  showExplanation?: boolean // 解説表示
  showBookmark?: boolean // ブックマークボタン表示
  categoryName?: string // カテゴリ名（ブックマーク用）
}

const QuestionCard = ({ 
  question: propQuestion,
  onAnswer,
  onAnswerSubmit,
  onEssaySubmit,
  onNextQuestion, 
  showTimer = true,
  timeLimit,
  reviewMode = false,
  showExplanation = false,
  showBookmark = true,
  categoryName
}: QuestionCardProps) => {
  const { 
    currentQuestion, 
    currentAnswers, 
    selectedChoiceId, 
    userAnswer, 
    showResult,
    questionStartTime,
    setSelectedChoice,
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
  
  // 復習モード用の状態
  const [reviewSelectedChoice, setReviewSelectedChoice] = useState<string | null>(null)
  const [reviewShowResult, setReviewShowResult] = useState(false)
  const [reviewAnswer, setReviewAnswer] = useState<any>(null)
  const [reviewStartTime, setReviewStartTime] = useState<number | null>(null)
  
  // 実際に使用するデータを決定
  const activeQuestion = reviewMode ? propQuestion : currentQuestion
  const activeAnswers = reviewMode ? propQuestion?.choices || [] : currentAnswers
  const activeSelectedChoice = reviewMode ? reviewSelectedChoice : selectedChoiceId
  const activeShowResult = reviewMode ? reviewShowResult : showResult
  const activeStartTime = reviewMode ? reviewStartTime : questionStartTime

  // 記述式問題の場合はEssayQuestionCardを使用
  if (activeQuestion?.questionType === 'essay') {
    return (
      <EssayQuestionCard
        question={activeQuestion}
        onSubmit={onEssaySubmit}
        onNextQuestion={onNextQuestion}
        showTimer={showTimer}
        timeLimit={timeLimit}
        showBookmark={showBookmark}
        categoryName={categoryName}
      />
    )
  }

  // Timer effect
  useEffect(() => {
    if (!activeStartTime || activeShowResult) return

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - activeStartTime) / 1000)
      setTimeElapsed(elapsed)
      
      // Auto-submit if time limit exceeded
      if (timeLimit && elapsed >= timeLimit * 60) {
        if (activeSelectedChoice) {
          if (reviewMode && onAnswer) {
            onAnswer(activeQuestion.id, activeSelectedChoice, elapsed)
          } else if (onAnswerSubmit) {
            onAnswerSubmit(activeSelectedChoice, elapsed)
          }
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [activeStartTime, activeShowResult, timeLimit, activeSelectedChoice, onAnswerSubmit, onAnswer, reviewMode, activeQuestion])

  // Start timer when question loads
  useEffect(() => {
    if (reviewMode && propQuestion && !reviewStartTime) {
      setReviewStartTime(Date.now())
      setTimeElapsed(0)
      setShowHint(true)
      setTimeout(() => setShowHint(false), 3000)
    } else if (!reviewMode && currentQuestion && !questionStartTime) {
      startQuestion()
      setTimeElapsed(0)
      setShowHint(true)
      setTimeout(() => setShowHint(false), 3000)
    }
  }, [reviewMode, propQuestion, currentQuestion, questionStartTime, reviewStartTime, startQuestion])

  // 復習モードで問題が変わったときの初期化
  useEffect(() => {
    if (reviewMode && propQuestion) {
      setReviewSelectedChoice(null)
      setReviewShowResult(false)
      setReviewAnswer(null)
      setReviewStartTime(Date.now())
      setTimeElapsed(0)
    }
  }, [reviewMode, propQuestion?.id])

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

  const handleChoiceSelect = (choiceId: string) => {
    if (activeShowResult) return // Prevent selection after answer
    
    if (reviewMode) {
      setReviewSelectedChoice(choiceId)
    } else {
      setSelectedChoice(choiceId)
    }
  }

  const handleSubmitAnswer = async () => {
    if (!activeSelectedChoice) return
    
    if (reviewMode && onAnswer) {
      try {
        const result = await onAnswer(activeQuestion.id, activeSelectedChoice, timeElapsed)
        setReviewAnswer(result)
        setReviewShowResult(true)
      } catch (error) {
        console.error('復習回答送信エラー:', error)
      }
    } else if (onAnswerSubmit) {
      onAnswerSubmit(activeSelectedChoice, timeElapsed)
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
  const isTimeWarning = timeLimit && timeElapsed > (timeLimit * 60 * 0.8)
  const isTimeUp = timeLimit && timeElapsed >= timeLimit * 60

  return (
    <Card sx={{ maxWidth: '100%', mx: 'auto' }}>
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

        {/* Sample Image (if this were a real question with images) */}
        {activeQuestion.content.includes('図') && (
          <Box sx={{ my: 3 }}>
            <ZoomableImage
              src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1IiBzdHJva2U9IiNkZGQiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+5Zu35omL44K144Oz44OX44Or</dGV4dD48L3N2Zz4="
              alt="問題図表"
              maxHeight={200}
              showTouchHint={false}
            />
          </Box>
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
              選択肢をタップして回答してください
            </Typography>
          </Box>
        </Collapse>

        {/* Answer Choices */}
        <Box sx={{ mt: 3 }}>
          {activeAnswers.map((choice: any, index: any) => (
            <TouchButton
              key={choice.id}
              fullWidth
              variant={activeSelectedChoice === choice.id ? 'contained' : 'outlined'}
              color={
                activeShowResult && (userAnswer || reviewAnswer)
                  ? choice.isCorrect
                    ? 'success'
                    : activeSelectedChoice === choice.id && !choice.isCorrect
                    ? 'error'
                    : 'inherit'
                  : activeSelectedChoice === choice.id
                  ? 'primary'
                  : 'inherit'
              }
              touchSize="large"
              onClick={() => handleChoiceSelect(choice.id)}
              disabled={activeShowResult}
              sx={{
                mb: 2,
                justifyContent: 'flex-start',
                textAlign: 'left',
                minHeight: deviceType === 'mobile' ? 64 : 56,
                position: 'relative',
                '&.Mui-disabled': {
                  opacity: activeShowResult ? 1 : 0.6,
                },
              }}
              startIcon={
                activeShowResult && (userAnswer || reviewAnswer) ? (
                  choice.isCorrect ? (
                    <CorrectIcon />
                  ) : activeSelectedChoice === choice.id && !choice.isCorrect ? (
                    <IncorrectIcon />
                  ) : null
                ) : (
                  <Typography
                    component="span"
                    sx={{
                      minWidth: 24,
                      height: 24,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: activeSelectedChoice === choice.id ? 'primary.contrastText' : 'action.disabled',
                      color: activeSelectedChoice === choice.id ? 'primary.main' : 'text.secondary',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                    }}
                  >
                    {String.fromCharCode(65 + index)}
                  </Typography>
                )
              }
            >
              <Typography variant="body1" sx={{ flex: 1, whiteSpace: 'normal' }}>
                {choice.content}
              </Typography>
            </TouchButton>
          ))}
        </Box>

        {/* Submit Button */}
        {!activeShowResult && (
          <Box sx={{ mt: 3 }}>
            <TouchButton
              fullWidth
              variant="contained"
              touchSize="large"
              disabled={!activeSelectedChoice || !!isTimeUp}
              onClick={handleSubmitAnswer}
              color={isTimeUp ? 'error' : 'primary'}
            >
              {isTimeUp ? '時間切れ' : '回答する'}
            </TouchButton>
          </Box>
        )}

        {/* Result and Explanation */}
        <Fade in={activeShowResult}>
          <Box sx={{ mt: 3 }}>
            {(userAnswer || reviewAnswer) && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: (userAnswer?.isCorrect || reviewAnswer?.isCorrect) ? 'success.light' : 'error.light',
                  color: (userAnswer?.isCorrect || reviewAnswer?.isCorrect) ? 'success.contrastText' : 'error.contrastText',
                  mb: 2,
                }}
              >
                <Typography variant="h6" gutterBottom>
                  {(userAnswer?.isCorrect || reviewAnswer?.isCorrect) ? '正解！' : '不正解'}
                </Typography>
                <Typography variant="body2">
                  回答時間: {formatTime(timeElapsed)}
                </Typography>
                {reviewMode && reviewAnswer?.reviewItem && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    習熟度レベル: {reviewAnswer.reviewItem.masteryLevel}/5
                  </Typography>
                )}
              </Box>
            )}

            {(showExplanation || reviewMode) && activeQuestion.explanation && (
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'info.light',
                  borderRadius: 2,
                  mb: 2,
                }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  解説
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                  {activeQuestion.explanation}
                </Typography>
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

export default QuestionCard