import { useState, useEffect } from 'react'
import { 
  Typography, 
  Box, 
  Card, 
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Fab,
} from '@mui/material'
import { 
  useSearchParams, 
  useNavigate 
} from 'react-router-dom'
import {
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material'
import QuestionSwiper from '../components/QuestionSwiper'
import TouchButton from '../components/TouchButton'
import StudySessionTimer from '../components/StudySessionTimer'
import OfflineIndicator from '../components/OfflineIndicator'
import { useQuestionStore } from '../stores/useQuestionStore'
import { useQuestionApi } from '../hooks/useQuestionApi'
import { useAppStore } from '../stores/useAppStore'
import { useOfflineSync } from '../hooks/useOfflineSync'

const PracticePage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { deviceType } = useAppStore()
  
  const {
    currentQuestion,
    sessionStats,
    filters,
    setCurrentQuestion,
    setQuestions,
    startSession,
    startQuestion,
    endQuestion,
    setUserAnswer,
    resetSession,
  } = useQuestionStore()


  const { 
    loading, 
    error, 
    fetchRandomQuestion, 
    fetchQuestions, 
    fetchQuestionById,
    submitAnswer,
    fetchCategories 
  } = useQuestionApi()

  const [categories, setCategories] = useState<any[]>([])
  const [practiceMode, setPracticeMode] = useState<'random' | 'list'>('random')
  const [sessionComplete, setSessionComplete] = useState(false)
  
  // オフライン同期機能
  const { syncStatus, addToOfflineQueue } = useOfflineSync()
  
  // Get URL parameters
  const mode = searchParams.get('mode') // 'quick' or 'practice'
  const timeLimit = searchParams.get('time') ? parseInt(searchParams.get('time')!) : undefined
  const categoryId = searchParams.get('category')
  const difficulty = searchParams.get('difficulty') ? parseInt(searchParams.get('difficulty')!) : undefined
  
  // 短時間学習モードの判定
  const isTimedSession = mode === 'timed' || (timeLimit && [5, 10, 15].includes(timeLimit))

  // Initialize practice session
  useEffect(() => {
    let isMounted = true
    
    const initializePractice = async () => {
      if (!isMounted) return
      
      startSession()
      
      // Load categories
      const categoriesData = await fetchCategories()
      if (categoriesData && isMounted) {
        setCategories(categoriesData)
      }

      // Load first question
      if (isMounted) {
        if (mode === 'quick' || practiceMode === 'random') {
          const question = await fetchRandomQuestion({
            categoryId: categoryId || undefined,
            difficulty: difficulty || undefined,
            excludeAnswered: true,
          })
          if (question && isMounted) {
            setCurrentQuestion(question)
          }
        } else {
          const response = await fetchQuestions(1, 10, {
            categoryId: categoryId || undefined,
            difficulty: difficulty || undefined,
            onlyUnanswered: true,
          })
          if (response?.questions.length && isMounted) {
            setQuestions(response.questions)
            const firstQuestion = await fetchQuestionById(response.questions[0].id)
            if (firstQuestion && isMounted) {
              setCurrentQuestion(firstQuestion)
            }
          }
        }
      }
    }

    initializePractice()
    
    return () => {
      isMounted = false
    }
  }, [mode, categoryId, difficulty])

  const loadRandomQuestion = async () => {
    const question = await fetchRandomQuestion({
      categoryId: categoryId || undefined,
      difficulty: difficulty || undefined,
      excludeAnswered: true,
    })

    if (question) {
      setCurrentQuestion(question)
    }
  }

  const loadQuestionList = async () => {
    const response = await fetchQuestions(1, 10, {
      categoryId: categoryId || undefined,
      difficulty: difficulty || undefined,
      onlyUnanswered: true,
    })

    if (response?.questions.length) {
      setQuestions(response.questions)
      const firstQuestion = await fetchQuestionById(response.questions[0].id)
      if (firstQuestion) {
        setCurrentQuestion(firstQuestion)
      }
    }
  }

  const handleAnswerSubmit = async (choiceId: string, timeSpent: number) => {
    if (!currentQuestion) return

    const answerData = {
      questionId: currentQuestion.id,
      choiceId,
      timeSpent: timeSpent * 1000, // Convert to milliseconds
      deviceType
    }

    try {
      if (syncStatus.isOnline) {
        // オンライン時: 通常のAPI送信
        const result = await submitAnswer(
          currentQuestion.id,
          choiceId,
          timeSpent * 1000,
          deviceType
        )

        if (result) {
          // Update local state
          endQuestion(result.isCorrect)
          setUserAnswer({
            id: result.answerId,
            isCorrect: result.isCorrect,
            timeSpent: timeSpent * 1000,
            createdAt: new Date().toISOString(),
          })
        }
      } else {
        // オフライン時: ローカルキューに追加
        addToOfflineQueue('answer', answerData)
        
        // ローカルで正解判定を行う（簡易的）
        const correctChoice = currentQuestion.choices?.find(c => c.isCorrect)
        const isCorrect = choiceId === correctChoice?.id
        
        // Update local state
        endQuestion(isCorrect)
        setUserAnswer({
          id: `offline_${Date.now()}`, // 一時的なID
          isCorrect,
          timeSpent: timeSpent * 1000,
          createdAt: new Date().toISOString(),
        })
      }
    } catch (error) {
      console.error('Answer submission failed:', error)
      // オンライン送信に失敗した場合もオフラインキューに追加
      addToOfflineQueue('answer', answerData)
    }
  }

  const handleNextQuestion = async () => {
    if (mode === 'quick' || practiceMode === 'random') {
      await loadRandomQuestion()
    }
    // For list mode, QuestionSwiper handles navigation
  }

  const handleRefresh = () => {
    resetSession()
    window.location.reload()
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category?.name || '全分野'
  }

  const handleSessionComplete = (duration: number, questionsAnswered: number) => {
    setSessionComplete(true)
    // セッション完了の統計をサーバーに送信する場合はここで実装
    console.log(`セッション完了: ${duration}秒, ${questionsAnswered}問回答`)
  }

  const handleSessionPause = (elapsedTime: number) => {
    // 一時停止時の処理
    console.log(`セッション一時停止: ${elapsedTime}秒経過`)
  }

  const handleSessionResume = () => {
    // 再開時の処理
    console.log('セッション再開')
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <TouchButton
          variant="contained"
          onClick={handleRefresh}
          startIcon={<RefreshIcon />}
        >
          再読み込み
        </TouchButton>
      </Box>
    )
  }

  if (loading && !currentQuestion) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    )
  }

  if (!currentQuestion) {
    return (
      <Box textAlign="center">
        <Typography variant="h6" color="text.secondary" gutterBottom>
          問題が見つかりませんでした
        </Typography>
        <TouchButton
          variant="contained"
          onClick={handleRefresh}
          startIcon={<RefreshIcon />}
        >
          再読み込み
        </TouchButton>
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4" component="h1">
          {mode === 'quick' ? `${timeLimit}分クイック` : '問題演習'}
        </Typography>
        
        <OfflineIndicator compact />
        
        <Fab
          size="small"
          onClick={() => navigate('/settings')}
          sx={{ 
            position: 'fixed',
            bottom: deviceType === 'mobile' ? 100 : 24,
            right: 24,
            zIndex: 10,
          }}
        >
          <SettingsIcon />
        </Fab>
      </Box>

      {/* Practice Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ py: 2 }}>
          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
            <Chip
              label={getCategoryName(categoryId || '')}
              color="primary"
              variant="outlined"
              size="small"
            />
            {difficulty && (
              <Chip
                label={`難易度 ${difficulty}`}
                color="secondary"
                variant="outlined"
                size="small"
              />
            )}
            {timeLimit && (
              <Chip
                label={`制限時間 ${timeLimit}分`}
                color="warning"
                variant="outlined"
                size="small"
              />
            )}
          </Box>
          
          {sessionStats.totalQuestions > 0 && (
            <Box display="flex" alignItems="center" gap={3} mt={2}>
              <Typography variant="body2" color="text.secondary">
                問題数: {sessionStats.totalQuestions}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                正答率: {Math.round((sessionStats.correctAnswers / sessionStats.totalQuestions) * 100)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                平均時間: {Math.round(sessionStats.totalTime / sessionStats.totalQuestions / 1000)}秒
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Study Session Timer */}
      {isTimedSession && !sessionComplete && (
        <StudySessionTimer
          onSessionComplete={handleSessionComplete}
          onSessionPause={handleSessionPause}
          onSessionResume={handleSessionResume}
          questionsAnswered={sessionStats.totalQuestions}
        />
      )}

      {/* Session Complete Message */}
      {sessionComplete && (
        <Alert severity="success" sx={{ mb: 3 }}>
          学習セッションが完了しました！ 回答数: {sessionStats.totalQuestions}問、正答率: {Math.round((sessionStats.correctAnswers / sessionStats.totalQuestions) * 100)}%
        </Alert>
      )}

      {/* Question Display */}
      <Box sx={{ mb: 4 }}>
        <QuestionSwiper
          onAnswerSubmit={handleAnswerSubmit}
          showTimer={true}
          timeLimit={timeLimit}
          allowSwipeNavigation={practiceMode === 'list'}
        />
      </Box>

      {/* Quick Mode Actions */}
      {mode === 'quick' && (
        <Box display="flex" gap={2} justifyContent="center" mt={3}>
          <TouchButton
            variant="outlined"
            onClick={handleRefresh}
            startIcon={<RefreshIcon />}
          >
            新しい問題
          </TouchButton>
          <TouchButton
            variant="contained"
            onClick={() => navigate('/')}
          >
            終了
          </TouchButton>
        </Box>
      )}
    </Box>
  )
}

export default PracticePage