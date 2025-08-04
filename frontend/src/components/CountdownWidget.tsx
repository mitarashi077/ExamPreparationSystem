import React, { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  Grid,
  LinearProgress
} from '@mui/material'
import {
  Edit as EditIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material'
import { format, differenceInDays } from 'date-fns'
import { ja } from 'date-fns/locale'
import { ExamSchedule, EXAM_TYPE_LABELS } from '../types/examSchedule'

interface CountdownWidgetProps {
  schedule: ExamSchedule
  onEdit: () => void
}

const CountdownWidget: React.FC<CountdownWidgetProps> = ({ schedule, onEdit }) => {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000) // 1秒間隔で更新

    return () => clearInterval(timer)
  }, [])

  const examDate = new Date(schedule.examDate)
  const now = currentTime
  const timeDiff = examDate.getTime() - now.getTime()
  
  // リアルタイムカウントダウン計算
  const daysRemaining = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
  const hoursRemaining = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutesRemaining = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
  const secondsRemaining = Math.floor((timeDiff % (1000 * 60)) / 1000)
  
  const isExpired = timeDiff <= 0
  const isUrgent = daysRemaining <= 7 && daysRemaining > 0
  const isCritical = daysRemaining <= 3 && daysRemaining > 0

  const getStatusColor = () => {
    if (isExpired) return 'error'
    if (isCritical) return 'error'
    if (isUrgent) return 'warning'
    return 'success'
  }

  const getStatusIcon = () => {
    if (isExpired) return <CheckCircleIcon />
    if (isCritical || isUrgent) return <WarningIcon />
    return <ScheduleIcon />
  }

  const getProgressValue = () => {
    const totalDays = differenceInDays(examDate, new Date(schedule.createdAt))
    const passedDays = totalDays - daysRemaining
    return totalDays > 0 ? Math.max(0, Math.min(100, (passedDays / totalDays) * 100)) : 0
  }

  return (
    <Card 
      sx={{ 
        background: `linear-gradient(135deg, ${
          isExpired ? '#f44336' : 
          isCritical ? '#ff5722' :
          isUrgent ? '#ff9800' : 
          '#2196f3'
        }15, ${
          isExpired ? '#f44336' : 
          isCritical ? '#ff5722' :
          isUrgent ? '#ff9800' : 
          '#2196f3'
        }05)`,
        border: `2px solid ${
          isExpired ? '#f44336' : 
          isCritical ? '#ff5722' :
          isUrgent ? '#ff9800' : 
          '#2196f3'
        }`,
        position: 'relative',
        overflow: 'visible'
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* ヘッダー */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              {getStatusIcon()}
              <Typography variant="h5" fontWeight="bold">
                {EXAM_TYPE_LABELS[schedule.examType]}
              </Typography>
              <Chip
                label={isExpired ? '終了' : isCritical ? '緊急' : isUrgent ? '注意' : '準備中'}
                color={getStatusColor()}
                size="small"
                sx={{ ml: 1 }}
              />
            </Box>
            <Typography variant="body1" color="text.secondary">
              {format(examDate, 'yyyy年M月d日(E)', { locale: ja })}
            </Typography>
            {schedule.targetScore && (
              <Typography variant="body2" color="text.secondary">
                目標点数: {schedule.targetScore}点
              </Typography>
            )}
          </Box>
          <IconButton onClick={onEdit} size="small">
            <EditIcon />
          </IconButton>
        </Box>

        {/* カウントダウン表示 */}
        {!isExpired ? (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={3}>
              <Box textAlign="center">
                <Typography
                  variant="h3"
                  fontWeight="bold"
                  color={getStatusColor()}
                  sx={{ 
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' },
                    lineHeight: 1
                  }}
                >
                  {daysRemaining}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  日
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box textAlign="center">
                <Typography
                  variant="h3"
                  fontWeight="bold"
                  color="text.primary"
                  sx={{ 
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' },
                    lineHeight: 1
                  }}
                >
                  {hoursRemaining}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  時間
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box textAlign="center">
                <Typography
                  variant="h3"
                  fontWeight="bold"
                  color="text.primary"
                  sx={{ 
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' },
                    lineHeight: 1
                  }}
                >
                  {minutesRemaining}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  分
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box textAlign="center">
                <Typography
                  variant="h3"
                  fontWeight="bold"
                  color="text.secondary"
                  sx={{ 
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' },
                    lineHeight: 1
                  }}
                >
                  {secondsRemaining}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  秒
                </Typography>
              </Box>
            </Grid>
          </Grid>
        ) : (
          <Box textAlign="center" sx={{ mb: 3 }}>
            <Typography variant="h4" color="error" fontWeight="bold">
              試験終了
            </Typography>
            <Typography variant="body1" color="text.secondary">
              お疲れ様でした！
            </Typography>
          </Box>
        )}

        {/* プログレスバー */}
        {!isExpired && (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" color="text.secondary">
                試験まで
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {Math.round(getProgressValue())}%経過
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={getProgressValue()}
              color={getStatusColor()}
              sx={{ 
                height: 8, 
                borderRadius: 4,
                backgroundColor: 'rgba(0,0,0,0.1)'
              }}
            />
          </Box>
        )}

        {/* 学習進捗サマリー */}
        {schedule.progressSummary && (
          <Box 
            sx={{ 
              mt: 2, 
              p: 2, 
              bgcolor: 'background.paper', 
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Typography variant="body2" color="text.secondary" gutterBottom>
              学習進捗
            </Typography>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight="bold">
                {schedule.progressSummary.overallProgress}%
              </Typography>
              <Chip
                label={schedule.progressSummary.onTrack ? '順調' : '要注意'}
                color={schedule.progressSummary.onTrack ? 'success' : 'warning'}
                size="small"
              />
            </Box>
            <LinearProgress
              variant="determinate"
              value={schedule.progressSummary.overallProgress}
              color={schedule.progressSummary.onTrack ? 'success' : 'warning'}
              sx={{ 
                mt: 1,
                height: 6, 
                borderRadius: 3
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default CountdownWidget