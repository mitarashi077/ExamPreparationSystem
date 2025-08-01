import React, { useState, useEffect, useCallback } from 'react'
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Chip, 
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material'
import { 
  PlayArrow, 
  Pause, 
  Stop, 
  Timer as TimerIcon,
  CheckCircle,
  Warning
} from '@mui/icons-material'

interface StudySessionTimerProps {
  onSessionComplete?: (duration: number, questionsAnswered: number) => void
  onSessionPause?: (duration: number) => void
  onSessionResume?: () => void
  questionsAnswered?: number
}

type SessionDuration = 5 | 10 | 15 // 分

interface SessionState {
  duration: SessionDuration
  timeRemaining: number // 秒
  isRunning: boolean
  isPaused: boolean
  questionsAnswered: number
  startTime: Date | null
}

const StudySessionTimer: React.FC<StudySessionTimerProps> = ({
  onSessionComplete,
  onSessionPause,
  onSessionResume,
  questionsAnswered = 0
}) => {
  const [session, setSession] = useState<SessionState>({
    duration: 5,
    timeRemaining: 5 * 60, // 5分 = 300秒
    isRunning: false,
    isPaused: false,
    questionsAnswered,
    startTime: null
  })

  const [showCompletionDialog, setShowCompletionDialog] = useState(false)
  const [showWarningDialog, setShowWarningDialog] = useState(false)

  // タイマーカウントダウン
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (session.isRunning && !session.isPaused && session.timeRemaining > 0) {
      interval = setInterval(() => {
        setSession(prev => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1
        }))
      }, 1000)
    }

    if (session.timeRemaining === 0 && session.isRunning) {
      handleSessionComplete()
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [session.isRunning, session.isPaused, session.timeRemaining])

  // 問題数更新
  useEffect(() => {
    setSession(prev => ({
      ...prev,
      questionsAnswered
    }))
  }, [questionsAnswered])

  const handleDurationChange = (
    _event: React.MouseEvent<HTMLElement>,
    newDuration: SessionDuration | null,
  ) => {
    if (newDuration !== null && !session.isRunning) {
      setSession(prev => ({
        ...prev,
        duration: newDuration,
        timeRemaining: newDuration * 60
      }))
    }
  }

  const handleStartSession = () => {
    setSession(prev => ({
      ...prev,
      isRunning: true,
      isPaused: false,
      startTime: new Date()
    }))
  }

  const handlePauseSession = () => {
    setSession(prev => ({
      ...prev,
      isPaused: true
    }))
    onSessionPause?.(session.duration * 60 - session.timeRemaining)
  }

  const handleResumeSession = () => {
    setSession(prev => ({
      ...prev,
      isPaused: false
    }))
    onSessionResume?.()
  }

  const handleStopSession = () => {
    if (session.timeRemaining < session.duration * 60 * 0.5) {
      // 半分以上進んでいる場合は警告を表示
      setShowWarningDialog(true)
    } else {
      performStopSession()
    }
  }

  const performStopSession = () => {
    setSession({
      duration: session.duration,
      timeRemaining: session.duration * 60,
      isRunning: false,
      isPaused: false,
      questionsAnswered: 0,
      startTime: null
    })
    setShowWarningDialog(false)
  }

  const handleSessionComplete = useCallback(() => {
    const totalDuration = session.duration * 60
    setSession(prev => ({
      ...prev,
      isRunning: false,
      timeRemaining: 0
    }))
    setShowCompletionDialog(true)
    onSessionComplete?.(totalDuration, session.questionsAnswered)
  }, [session.duration, session.questionsAnswered, onSessionComplete])

  const resetSession = () => {
    setSession(prev => ({
      ...prev,
      timeRemaining: prev.duration * 60,
      isRunning: false,
      isPaused: false,
      questionsAnswered: 0,
      startTime: null
    }))
    setShowCompletionDialog(false)
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getProgressPercentage = (): number => {
    const totalSeconds = session.duration * 60
    return ((totalSeconds - session.timeRemaining) / totalSeconds) * 100
  }

  const getSessionStatus = (): { color: 'success' | 'warning' | 'error' | 'info', label: string } => {
    if (!session.isRunning && session.timeRemaining === session.duration * 60) {
      return { color: 'info', label: '準備完了' }
    }
    if (session.isPaused) {
      return { color: 'warning', label: '一時停止中' }
    }
    if (session.isRunning) {
      return { color: 'success', label: '学習中' }
    }
    if (session.timeRemaining === 0) {
      return { color: 'success', label: '完了' }
    }
    return { color: 'info', label: '待機中' }
  }

  const status = getSessionStatus()

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <TimerIcon color="action" />
        <Typography variant="h6">短時間学習セッション</Typography>
        <Chip 
          label={status.label} 
          color={status.color} 
          size="small" 
          variant="outlined" 
        />
      </Box>

      {/* 時間設定 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          学習時間を選択
        </Typography>
        <ToggleButtonGroup
          value={session.duration}
          exclusive
          onChange={handleDurationChange}
          size="small"
          disabled={session.isRunning}
        >
          <ToggleButton value={5}>5分</ToggleButton>
          <ToggleButton value={10}>10分</ToggleButton>
          <ToggleButton value={15}>15分</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* タイマー表示 */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography 
          variant="h2" 
          sx={{ 
            fontFamily: 'monospace',
            color: session.timeRemaining <= 60 ? 'error.main' : 'text.primary',
            fontWeight: 'bold'
          }}
        >
          {formatTime(session.timeRemaining)}
        </Typography>
        
        <LinearProgress 
          variant="determinate" 
          value={getProgressPercentage()} 
          sx={{ 
            mt: 2, 
            height: 8, 
            borderRadius: 4,
            backgroundColor: 'grey.200',
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              backgroundColor: session.timeRemaining <= 60 ? 'error.main' : 'primary.main'
            }
          }} 
        />
      </Box>

      {/* 統計情報 */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mb: 3 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" color="primary">
            {session.questionsAnswered}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            回答数
          </Typography>
        </Box>
        
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4">
            {session.questionsAnswered > 0 
              ? Math.round((session.questionsAnswered / ((session.duration * 60 - session.timeRemaining) / 60)) * 10) / 10
              : 0
            }
          </Typography>
          <Typography variant="caption" color="text.secondary">
            問/分
          </Typography>
        </Box>
      </Box>

      {/* 制御ボタン */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        {!session.isRunning ? (
          <Button
            variant="contained"
            startIcon={<PlayArrow />}
            onClick={handleStartSession}
            size="large"
          >
            開始
          </Button>
        ) : session.isPaused ? (
          <>
            <Button
              variant="contained"
              startIcon={<PlayArrow />}
              onClick={handleResumeSession}
              size="large"
            >
              再開
            </Button>
            <Button
              variant="outlined"
              startIcon={<Stop />}
              onClick={handleStopSession}
              size="large"
            >
              終了
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outlined"
              startIcon={<Pause />}
              onClick={handlePauseSession}
              size="large"
            >
              一時停止
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Stop />}
              onClick={handleStopSession}
              size="large"
            >
              終了
            </Button>
          </>
        )}
      </Box>

      {session.timeRemaining <= 60 && session.isRunning && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          残り時間が1分を切りました！
        </Alert>
      )}

      {/* 完了ダイアログ */}
      <Dialog open={showCompletionDialog} onClose={() => setShowCompletionDialog(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircle color="success" />
          学習セッション完了！
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            {session.duration}分間の学習セッションが完了しました。
          </Typography>
          <Typography>
            回答数: {session.questionsAnswered}問
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetSession} variant="contained">
            新しいセッションを開始
          </Button>
        </DialogActions>
      </Dialog>

      {/* 中断警告ダイアログ */}
      <Dialog open={showWarningDialog} onClose={() => setShowWarningDialog(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning color="warning" />
          セッションを終了しますか？
        </DialogTitle>
        <DialogContent>
          <Typography>
            学習セッションの途中です。本当に終了しますか？
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowWarningDialog(false)}>
            キャンセル
          </Button>
          <Button onClick={performStopSession} color="error" variant="contained">
            終了
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

export default StudySessionTimer