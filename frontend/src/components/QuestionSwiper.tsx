import { useState, useEffect } from 'react'
import { Box, IconButton, Typography, Fade } from '@mui/material'
import { useSwipeable } from 'react-swipeable'
import {
  ArrowBackIos as PrevIcon,
  ArrowForwardIos as NextIcon,
  SwipeLeft as SwipeLeftIcon,
  SwipeRight as SwipeRightIcon,
} from '@mui/icons-material'
import QuestionCard from './QuestionCard'
import { useQuestionStore } from '../stores/useQuestionStore'
import { useAppStore } from '../stores/useAppStore'

interface QuestionSwiperProps {
  onAnswerSubmit?: (choiceId: string, timeSpent: number) => void
  onNextQuestion?: () => void // External next question handler for random mode
  showTimer?: boolean
  timeLimit?: number
  allowSwipeNavigation?: boolean
}

const QuestionSwiper = ({ 
  onAnswerSubmit,
  onNextQuestion: externalOnNextQuestion,
  showTimer = true, 
  timeLimit,
  allowSwipeNavigation = true 
}: QuestionSwiperProps) => {
  const { 
    questions, 
    currentQuestionIndex, 
    showResult,
    setCurrentQuestionIndex,
  } = useQuestionStore()
  
  const { deviceType } = useAppStore()
  const [showSwipeHint, setShowSwipeHint] = useState(false)

  const canGoPrev = currentQuestionIndex > 0
  const canGoNext = currentQuestionIndex < questions.length - 1
  const hasMultipleQuestions = questions.length > 1

  // Show swipe hint for mobile users
  useEffect(() => {
    if (deviceType === 'mobile' && hasMultipleQuestions && allowSwipeNavigation) {
      const hasSeenHint = localStorage.getItem('question-swipe-hint-seen')
      if (!hasSeenHint) {
        setShowSwipeHint(true)
        const timer = setTimeout(() => {
          setShowSwipeHint(false)
          localStorage.setItem('question-swipe-hint-seen', 'true')
        }, 4000)
        return () => clearTimeout(timer)
      }
    }
  }, [deviceType, hasMultipleQuestions, allowSwipeNavigation])

  const handlePrevQuestion = () => {
    if (canGoPrev) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleNextQuestion = () => {
    if (externalOnNextQuestion) {
      // Use external handler for random mode or when single question mode
      externalOnNextQuestion()
    } else if (canGoNext) {
      // Use internal navigation for list mode
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (allowSwipeNavigation && !showResult && (externalOnNextQuestion || canGoNext)) {
        handleNextQuestion()
      }
    },
    onSwipedRight: () => {
      if (allowSwipeNavigation && canGoPrev && !showResult) {
        handlePrevQuestion()
      }
    },
    preventScrollOnSwipe: true,
    trackMouse: false,
    delta: 50,
  })

  return (
    <Box
      {...(allowSwipeNavigation ? swipeHandlers : {})}
      sx={{
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Swipe Hint */}
      <Fade in={showSwipeHint}>
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            px: 3,
            py: 1.5,
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            boxShadow: 3,
          }}
        >
          <SwipeRightIcon fontSize="small" />
          <Typography variant="body2">
            左右にスワイプで問題切り替え
          </Typography>
          <SwipeLeftIcon fontSize="small" />
        </Box>
      </Fade>

      {/* Navigation Buttons (Desktop) */}
      {hasMultipleQuestions && deviceType !== 'mobile' && (
        <>
          <IconButton
            onClick={handlePrevQuestion}
            disabled={!canGoPrev || showResult}
            sx={{
              position: 'absolute',
              left: -16,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              bgcolor: 'background.paper',
              boxShadow: 2,
              '&:hover': {
                bgcolor: 'background.paper',
                boxShadow: 4,
              },
              '&.Mui-disabled': {
                display: 'none',
              },
            }}
          >
            <PrevIcon />
          </IconButton>

          <IconButton
            onClick={handleNextQuestion}
            disabled={!(externalOnNextQuestion || canGoNext) || showResult}
            sx={{
              position: 'absolute',
              right: -16,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              bgcolor: 'background.paper',
              boxShadow: 2,
              '&:hover': {
                bgcolor: 'background.paper',
                boxShadow: 4,
              },
              '&.Mui-disabled': {
                display: 'none',
              },
            }}
          >
            <NextIcon />
          </IconButton>
        </>
      )}

      {/* Question Counter */}
      {hasMultipleQuestions && (
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 10,
            bgcolor: 'rgba(0, 0, 0, 0.6)',
            color: 'white',
            px: 2,
            py: 0.5,
            borderRadius: 2,
            fontSize: '0.875rem',
          }}
        >
          {currentQuestionIndex + 1} / {questions.length}
        </Box>
      )}

      {/* Swipe Indicators (Mobile) */}
      {deviceType === 'mobile' && hasMultipleQuestions && allowSwipeNavigation && !showResult && (
        <>
          {canGoPrev && (
            <Box
              sx={{
                position: 'absolute',
                left: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 5,
                opacity: 0.3,
                pointerEvents: 'none',
              }}
            >
              <SwipeRightIcon color="primary" />
            </Box>
          )}

          {(externalOnNextQuestion || canGoNext) && (
            <Box
              sx={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 5,
                opacity: 0.3,
                pointerEvents: 'none',
              }}
            >
              <SwipeLeftIcon color="primary" />
            </Box>
          )}
        </>
      )}

      {/* Question Progress Dots */}
      {hasMultipleQuestions && questions.length <= 10 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 1,
            zIndex: 10,
          }}
        >
          {questions.map((_, index) => (
            <Box
              key={index}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: index === currentQuestionIndex 
                  ? 'primary.main' 
                  : questions[index]?.hasAnswered 
                    ? questions[index]?.isCorrect 
                      ? 'success.main' 
                      : 'error.main'
                    : 'action.disabled',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
              onClick={() => setCurrentQuestionIndex(index)}
            />
          ))}
        </Box>
      )}

      {/* Main Question Card */}
      <Box
        sx={{
          transition: 'transform 0.3s ease-out',
          position: 'relative',
        }}
      >
        <QuestionCard
          onAnswerSubmit={onAnswerSubmit}
          onNextQuestion={showResult && (externalOnNextQuestion || canGoNext) ? handleNextQuestion : undefined}
          showTimer={showTimer}
          timeLimit={timeLimit}
        />
      </Box>
    </Box>
  )
}

export default QuestionSwiper