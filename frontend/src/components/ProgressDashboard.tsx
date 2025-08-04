import React from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  CircularProgress,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  AssignmentTurnedIn as AssignmentIcon,
  Speed as SpeedIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material'
import { ExamSchedule, StudyTarget, TARGET_TYPE_LABELS, UNIT_LABELS } from '../types/examSchedule'

interface ProgressDashboardProps {
  schedule: ExamSchedule
  studyTargets: StudyTarget[]
}

const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ schedule, studyTargets }) => {
  const { progressSummary } = schedule

  // カテゴリ別進捗を計算
  const categoryProgress = studyTargets.reduce((acc, target) => {
    const categoryName = target.categoryName || '全般'
    if (!acc[categoryName]) {
      acc[categoryName] = {
        totalTargets: 0,
        completedTargets: 0,
        averageProgress: 0,
        totalProgress: 0
      }
    }
    acc[categoryName].totalTargets += 1
    acc[categoryName].totalProgress += target.progress
    if (target.progress >= 100) {
      acc[categoryName].completedTargets += 1
    }
    acc[categoryName].averageProgress = acc[categoryName].totalProgress / acc[categoryName].totalTargets
    return acc
  }, {} as Record<string, any>)

  // 今日・今週の目標達成状況
  const dailyTargets = studyTargets.filter(t => t.targetType === 'daily')
  const weeklyTargets = studyTargets.filter(t => t.targetType === 'weekly')
  const totalTargets = studyTargets.filter(t => t.targetType === 'total')

  const getDailyProgress = () => {
    if (dailyTargets.length === 0) return 0
    return dailyTargets.reduce((sum, target) => sum + target.progress, 0) / dailyTargets.length
  }

  const getWeeklyProgress = () => {
    if (weeklyTargets.length === 0) return 0
    return weeklyTargets.reduce((sum, target) => sum + target.progress, 0) / weeklyTargets.length
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'success'
    if (progress >= 60) return 'warning'
    return 'error'
  }

  const getProgressIcon = (progress: number) => {
    if (progress >= 80) return <CheckCircleIcon color="success" />
    if (progress >= 60) return <WarningIcon color="warning" />
    return <WarningIcon color="error" />
  }

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <TrendingUpIcon color="primary" />
          <Typography variant="h5" fontWeight="bold">
            学習進捗ダッシュボード
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* 総合進捗 */}
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <Box position="relative" display="inline-flex" mb={2}>
                <CircularProgress
                  variant="determinate"
                  value={progressSummary.overallProgress}
                  size={120}
                  thickness={4}
                  color={getProgressColor(progressSummary.overallProgress)}
                />
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  bottom={0}
                  right={0}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexDirection="column"
                >
                  <Typography variant="h4" fontWeight="bold">
                    {progressSummary.overallProgress}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    総合進捗
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Chip
                  icon={getProgressIcon(progressSummary.overallProgress)}
                  label={progressSummary.onTrack ? '順調に進行中' : '要注意'}
                  color={progressSummary.onTrack ? 'success' : 'warning'}
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {studyTargets.length}個の目標を設定中
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* 日次・週次進捗 */}
          <Grid item xs={12} md={4}>
            <Box>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                <ScheduleIcon color="primary" />
                期間別進捗
              </Typography>

              {/* 日次目標 */}
              <Box sx={{ mb: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    今日の目標
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {Math.round(getDailyProgress())}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={getDailyProgress()}
                  color={getProgressColor(getDailyProgress())}
                  sx={{ height: 8, borderRadius: 4, mb: 1 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {dailyTargets.length}個の日次目標
                </Typography>
              </Box>

              {/* 週次目標 */}
              <Box sx={{ mb: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    今週の目標
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {Math.round(getWeeklyProgress())}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={getWeeklyProgress()}
                  color={getProgressColor(getWeeklyProgress())}
                  sx={{ height: 8, borderRadius: 4, mb: 1 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {weeklyTargets.length}個の週次目標
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* カテゴリ別進捗 */}
          <Grid item xs={12} md={4}>
            <Box>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                <AssignmentIcon color="primary" />
                カテゴリ別進捗
              </Typography>
              
              {Object.keys(categoryProgress).length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  カテゴリ別目標が設定されていません
                </Typography>
              ) : (
                <List dense>
                  {Object.entries(categoryProgress).map(([category, progress]: [string, any]) => (
                    <ListItem key={category} sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        {getProgressIcon(progress.averageProgress)}
                      </ListItemIcon>
                      <ListItemText
                        primary={category}
                        secondary={
                          <Box>
                            <LinearProgress
                              variant="determinate"
                              value={progress.averageProgress}
                              color={getProgressColor(progress.averageProgress)}
                              sx={{ height: 4, borderRadius: 2, mb: 0.5 }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {Math.round(progress.averageProgress)}% ({progress.completedTargets}/{progress.totalTargets}完了)
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </Grid>

          {/* 学習ペース分析 */}
          <Grid item xs={12}>
            <Box
              sx={{
                p: 2,
                bgcolor: 'background.default',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                <SpeedIcon color="primary" />
                学習ペース分析
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" fontWeight="bold" color="primary">
                      {progressSummary.dailyTarget}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      日次目標値
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" fontWeight="bold" color="primary">
                      {progressSummary.weeklyTarget}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      週次目標値
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" fontWeight="bold" color="primary">
                      {schedule.daysRemaining}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      残り日数
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" fontWeight="bold" color="primary">
                      {totalTargets.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      総合目標数
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* 推奨アクション */}
              {!progressSummary.onTrack && (
                <Box 
                  sx={{ 
                    mt: 2, 
                    p: 2, 
                    bgcolor: 'warning.light', 
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'warning.main'
                  }}
                >
                  <Typography variant="body2" fontWeight="bold" color="warning.dark">
                    推奨アクション
                  </Typography>
                  <Typography variant="body2" color="warning.dark">
                    現在の進捗が目標を下回っています。日次の学習時間を増やすか、目標を調整することをお勧めします。
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default ProgressDashboard