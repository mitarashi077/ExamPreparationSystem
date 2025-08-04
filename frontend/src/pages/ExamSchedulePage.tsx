import React, { useEffect, useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Fab,
  Alert,
  Skeleton
} from '@mui/material'
import {
  Add as AddIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material'
import { useExamScheduleStore } from '../stores/useExamScheduleStore'
import CountdownWidget from '../components/CountdownWidget'
import ProgressDashboard from '../components/ProgressDashboard'
import StudyTargetCard from '../components/StudyTargetCard'
import ExamSettingsModal from '../components/ExamSettingsModal'
import { ExamSchedule, StudyTarget } from '../types/examSchedule'

const ExamSchedulePage: React.FC = () => {
  const {
    currentSchedule,
    allSchedules,
    studyTargets,
    isLoading,
    error,
    fetchExamSchedules,
    setCurrentSchedule,
    fetchStudyTargets,
    startCountdownTimer,
    stopCountdownTimer,
    clearError
  } = useExamScheduleStore()

  const [settingsModalOpen, setSettingsModalOpen] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState<ExamSchedule | null>(null)

  useEffect(() => {
    fetchExamSchedules()
    startCountdownTimer()

    return () => {
      stopCountdownTimer()
    }
  }, [fetchExamSchedules, startCountdownTimer, stopCountdownTimer])

  useEffect(() => {
    if (currentSchedule) {
      fetchStudyTargets(currentSchedule.id)
    }
  }, [currentSchedule, fetchStudyTargets])

  const handleCreateSchedule = () => {
    setSelectedSchedule(null)
    setSettingsModalOpen(true)
  }

  const handleEditSchedule = (schedule: ExamSchedule) => {
    setSelectedSchedule(schedule)
    setSettingsModalOpen(true)
  }

  const handleScheduleSelect = (schedule: ExamSchedule) => {
    setCurrentSchedule(schedule)
  }

  const handleCloseModal = () => {
    setSettingsModalOpen(false)
    setSelectedSchedule(null)
  }

  const LoadingSkeleton = () => (
    <Box>
      <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" height={300} sx={{ mb: 2 }} />
      <Grid container spacing={2}>
        {[1, 2, 3].map((i) => (
          <Grid item xs={12} md={4} key={i}>
            <Skeleton variant="rectangular" height={150} />
          </Grid>
        ))}
      </Grid>
    </Box>
  )

  if (isLoading && !currentSchedule) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <LoadingSkeleton />
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* エラー表示 */}
      {error && (
        <Alert severity="error" onClose={clearError} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* ヘッダー */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box display="flex" alignItems="center" gap={2}>
          <ScheduleIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            試験日程管理
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateSchedule}
          sx={{ borderRadius: 2 }}
        >
          試験予定追加
        </Button>
      </Box>

      {!currentSchedule ? (
        /* 試験スケジュールが未設定の場合 */
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <CardContent>
            <ScheduleIcon color="disabled" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              試験予定が設定されていません
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              試験日程を設定して学習計画を立てましょう
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={handleCreateSchedule}
              sx={{ borderRadius: 2 }}
            >
              試験予定を作成
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* メインコンテンツ */
        <Grid container spacing={3}>
          {/* カウントダウンウィジェット */}
          <Grid item xs={12}>
            <CountdownWidget
              schedule={currentSchedule}
              onEdit={() => handleEditSchedule(currentSchedule)}
            />
          </Grid>

          {/* 進捗ダッシュボード */}
          <Grid item xs={12}>
            <ProgressDashboard
              schedule={currentSchedule}
              studyTargets={studyTargets}
            />
          </Grid>

          {/* 学習目標カード */}
          <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h5" fontWeight="bold" display="flex" alignItems="center" gap={1}>
                <TrendingUpIcon color="primary" />
                学習目標
              </Typography>
            </Box>
            
            {studyTargets.length === 0 ? (
              <Card sx={{ textAlign: 'center', py: 4 }}>
                <CardContent>
                  <TrendingUpIcon color="disabled" sx={{ fontSize: 48, mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    学習目標が設定されていません
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    学習目標を設定して効率的に勉強を進めましょう
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              <Grid container spacing={2}>
                {studyTargets.map((target: StudyTarget) => (
                  <Grid item xs={12} md={6} lg={4} key={target.id}>
                    <StudyTargetCard
                      target={target}
                      scheduleId={currentSchedule.id}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>

          {/* その他の試験予定 */}
          {allSchedules.length > 1 && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                その他の試験予定
              </Typography>
              <Grid container spacing={2}>
                {allSchedules
                  .filter(s => s.id !== currentSchedule.id)
                  .map((schedule) => (
                    <Grid item xs={12} md={6} key={schedule.id}>
                      <Card 
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                        onClick={() => handleScheduleSelect(schedule)}
                      >
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {schedule.examType === 'spring' ? '春期試験' : 
                             schedule.examType === 'autumn' ? '秋期試験' : '特別試験'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(schedule.examDate).toLocaleDateString('ja-JP', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            あと{schedule.daysRemaining}日
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
              </Grid>
            </Grid>
          )}
        </Grid>
      )}

      {/* フローティングアクションボタン（モバイル用） */}
      <Fab
        color="primary"
        aria-label="add exam schedule"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', md: 'none' }
        }}
        onClick={handleCreateSchedule}
      >
        <AddIcon />
      </Fab>

      {/* 試験設定モーダル */}
      <ExamSettingsModal
        open={settingsModalOpen}
        onClose={handleCloseModal}
        schedule={selectedSchedule}
      />
    </Container>
  )
}

export default ExamSchedulePage