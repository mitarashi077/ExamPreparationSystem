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
} from '@mui/icons-material'
import TouchButton from './TouchButton'
import ZoomableImage from './ZoomableImage'
import { useQuestionStore } from '../stores/useQuestionStore'
import { useAppStore } from '../stores/useAppStore'

interface QuestionCardProps {
  onAnswerSubmit?: (choiceId: string, timeSpent: number) => void
  onNextQuestion?: () => void
  showTimer?: boolean
  timeLimit?: number // minutes
}

const QuestionCard = ({ 
  onAnswerSubmit, 
  onNextQuestion, 
  showTimer = true,
  timeLimit 
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
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [showHint, setShowHint] = useState(false)

  // Timer effect
  useEffect(() => {
    if (!questionStartTime || showResult) return

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - questionStartTime) / 1000)
      setTimeElapsed(elapsed)
      
      // Auto-submit if time limit exceeded
      if (timeLimit && elapsed >= timeLimit * 60) {
        if (selectedChoiceId && onAnswerSubmit) {
          onAnswerSubmit(selectedChoiceId, elapsed)
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [questionStartTime, showResult, timeLimit, selectedChoiceId, onAnswerSubmit])

  // Start timer when question loads
  useEffect(() => {
    if (currentQuestion && !questionStartTime) {
      startQuestion()
      setTimeElapsed(0)
      setShowHint(true)
      setTimeout(() => setShowHint(false), 3000)
    }
  }, [currentQuestion, questionStartTime, startQuestion])

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
    if (showResult) return // Prevent selection after answer
    setSelectedChoice(choiceId)
  }

  const handleSubmitAnswer = () => {
    if (!selectedChoiceId || !onAnswerSubmit) return
    onAnswerSubmit(selectedChoiceId, timeElapsed)
  }

  if (!currentQuestion) {
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
        <Box display="flex" alignItems="center" justifyContent="between" mb={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip
              icon={<DifficultyIcon fontSize="small" />}
              label={getDifficultyLabel(currentQuestion.difficulty)}
              size="small"
              color={getDifficultyColor(currentQuestion.difficulty) as any}
              variant="outlined"
            />
            {currentQuestion.year && currentQuestion.session && (
              <Chip
                label={`${currentQuestion.year}年${currentQuestion.session}`}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
          
          {showTimer && (
            <Box display="flex" alignItems="center" gap={1}>
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
            </Box>
          )}
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
          {currentQuestion.content}
        </Typography>

        {/* Sample Image (if this were a real question with images) */}
        {currentQuestion.content.includes('図') && (
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
          {currentAnswers.map((choice, index) => (
            <TouchButton
              key={choice.id}
              fullWidth
              variant={selectedChoiceId === choice.id ? 'contained' : 'outlined'}
              color={
                showResult && userAnswer
                  ? choice.isCorrect
                    ? 'success'
                    : selectedChoiceId === choice.id && !choice.isCorrect
                    ? 'error'
                    : 'inherit'
                  : selectedChoiceId === choice.id
                  ? 'primary'
                  : 'inherit'
              }
              touchSize="large"
              onClick={() => handleChoiceSelect(choice.id)}
              disabled={showResult}
              sx={{
                mb: 2,
                justifyContent: 'flex-start',
                textAlign: 'left',
                minHeight: deviceType === 'mobile' ? 64 : 56,
                position: 'relative',
                '&.Mui-disabled': {
                  opacity: showResult ? 1 : 0.6,
                },
              }}
              startIcon={
                showResult && userAnswer ? (
                  choice.isCorrect ? (
                    <CorrectIcon />
                  ) : selectedChoiceId === choice.id && !choice.isCorrect ? (
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
                      bgcolor: selectedChoiceId === choice.id ? 'primary.contrastText' : 'action.disabled',
                      color: selectedChoiceId === choice.id ? 'primary.main' : 'text.secondary',
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
        {!showResult && (
          <Box sx={{ mt: 3 }}>
            <TouchButton
              fullWidth
              variant="contained"
              touchSize="large"
              disabled={!selectedChoiceId || isTimeUp}
              onClick={handleSubmitAnswer}
              color={isTimeUp ? 'error' : 'primary'}
            >
              {isTimeUp ? '時間切れ' : '回答する'}
            </TouchButton>
          </Box>
        )}

        {/* Result and Explanation */}
        <Fade in={showResult}>
          <Box sx={{ mt: 3 }}>
            {userAnswer && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: userAnswer.isCorrect ? 'success.light' : 'error.light',
                  color: userAnswer.isCorrect ? 'success.contrastText' : 'error.contrastText',
                  mb: 2,
                }}
              >
                <Typography variant="h6" gutterBottom>
                  {userAnswer.isCorrect ? '正解！' : '不正解'}
                </Typography>
                <Typography variant="body2">
                  回答時間: {formatTime(Math.floor((userAnswer.timeSpent || 0) / 1000))}
                </Typography>
              </Box>
            )}

            {currentQuestion.explanation && (
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
                  {currentQuestion.explanation}
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