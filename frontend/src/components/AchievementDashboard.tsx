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
  ListItemIcon,
  ListItemText,
  Avatar,
  Badge
} from '@mui/material'
import {
  EmojiEvents as TrophyIcon,
  TrendingUp as TrendingUpIcon,
  Timeline as TimelineIcon,
  Stars as StarsIcon,
  LocalFireDepartment as FireIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  QuestionAnswer as QuestionIcon,
  Speed as SpeedIcon,
  Bookmark as BookmarkIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material'
import {
  GoalStatistics,
  GoalAchievement,
  GOAL_TYPE_LABELS,
  BADGE_TYPE_LABELS
} from '../types/goal'

interface AchievementDashboardProps {
  statistics: GoalStatistics
}

const AchievementDashboard: React.FC<AchievementDashboardProps> = ({ statistics }) => {
  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'success'
    if (progress >= 60) return 'warning'
    return 'error'
  }

  const getBadgeColor = (badgeType: string) => {
    switch (badgeType) {
      case 'bronze': return '#CD7F32'
      case 'silver': return '#C0C0C0'
      case 'gold': return '#FFD700'
      case 'platinum': return '#E5E4E2'
      default: return '#CD7F32'
    }
  }

  const getGoalTypeIcon = (goalType: string) => {
    switch (goalType) {
      case 'time': return <ScheduleIcon />
      case 'questions': return <QuestionIcon />
      case 'accuracy': return <SpeedIcon />
      case 'bookmarks': return <BookmarkIcon />
      case 'reviews': return <RefreshIcon />
      default: return <TrophyIcon />
    }
  }

  const getStreakIcon = (streak: number) => {
    if (streak >= 30) return <StarsIcon sx={{ color: 'gold' }} />
    if (streak >= 14) return <FireIcon sx={{ color: 'orange' }} />
    if (streak >= 7) return <FireIcon sx={{ color: 'red' }} />
    return <FireIcon sx={{ color: 'gray' }} />
  }

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <TrophyIcon color="primary" />
          <Typography variant="h5" fontWeight="bold">
            達成度ダッシュボード
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Overall Progress */}
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <Box position="relative" display="inline-flex" mb={2}>
                <CircularProgress
                  variant="determinate"
                  value={statistics.overallProgress}
                  size={120}
                  thickness={4}
                  color={getProgressColor(statistics.overallProgress)}
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
                    {statistics.overallProgress}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    総合達成度
                  </Typography>
                </Box>
              </Box>
              
              <Box display="flex" justifyContent="center" gap={2} mb={2}>
                <Box textAlign="center">
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    {statistics.activeGoals}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    アクティブ
                  </Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="h6" fontWeight="bold" color="success.main">
                    {statistics.completedGoals}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    達成済み
                  </Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="h6" fontWeight="bold" color="text.primary">
                    {statistics.totalGoals}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    総目標数
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Streak Information */}
          <Grid item xs={12} md={4}>
            <Box>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                <FireIcon color="primary" />
                連続達成記録
              </Typography>

              <List dense>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {getStreakIcon(statistics.streaks.dailyStreak)}
                  </ListItemIcon>
                  <ListItemText
                    primary="日次目標"
                    secondary={`${statistics.streaks.dailyStreak}日連続達成`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {getStreakIcon(statistics.streaks.weeklyStreak * 7)}
                  </ListItemIcon>
                  <ListItemText
                    primary="週次目標"
                    secondary={`${statistics.streaks.weeklyStreak}週連続達成`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {getStreakIcon(statistics.streaks.monthlyStreak * 30)}
                  </ListItemIcon>
                  <ListItemText
                    primary="月次目標"
                    secondary={`${statistics.streaks.monthlyStreak}ヶ月連続達成`}
                  />
                </ListItem>
              </List>
            </Box>
          </Grid>

          {/* Recent Achievements */}
          <Grid item xs={12} md={4}>
            <Box>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                <TrophyIcon color="primary" />
                最近の達成
              </Typography>
              
              {statistics.recentAchievements.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  まだ達成した目標がありません
                </Typography>
              ) : (
                <List dense>
                  {statistics.recentAchievements.slice(0, 3).map((achievement) => (
                    <ListItem key={achievement.id}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Avatar
                          sx={{
                            width: 24,
                            height: 24,
                            bgcolor: getBadgeColor(achievement.badgeType),
                            fontSize: '0.75rem'
                          }}
                        >
                          <TrophyIcon sx={{ fontSize: 16 }} />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            {getGoalTypeIcon(achievement.goalType)}
                            <Typography variant="body2">
                              {GOAL_TYPE_LABELS[achievement.goalType as keyof typeof GOAL_TYPE_LABELS] || achievement.goalType}
                            </Typography>
                            <Chip
                              label={BADGE_TYPE_LABELS[achievement.badgeType]}
                              size="small"
                              sx={{
                                bgcolor: getBadgeColor(achievement.badgeType),
                                color: 'white',
                                fontSize: '0.7rem'
                              }}
                            />
                          </Box>
                        }
                        secondary={`${achievement.value} - ${new Date(achievement.achievedAt).toLocaleDateString()}`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </Grid>

          {/* Category Breakdown */}
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                <TimelineIcon color="primary" />
                カテゴリ別達成度
              </Typography>
              
              {Object.keys(statistics.categoryBreakdown).length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  カテゴリ別目標が設定されていません
                </Typography>
              ) : (
                <List dense>
                  {Object.entries(statistics.categoryBreakdown).map(([categoryId, breakdown]) => (
                    <ListItem key={categoryId} sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircleIcon 
                          color={breakdown.averageProgress >= 80 ? 'success' : 
                                breakdown.averageProgress >= 60 ? 'warning' : 'error'} 
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={breakdown.categoryName}
                        secondary={
                          <Box>
                            <LinearProgress
                              variant="determinate"
                              value={breakdown.averageProgress}
                              color={getProgressColor(breakdown.averageProgress)}
                              sx={{ height: 4, borderRadius: 2, mb: 0.5 }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {Math.round(breakdown.averageProgress)}% ({breakdown.completedCount}/{breakdown.goalsCount}達成)
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

          {/* Goal Type Breakdown */}
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                <TrendingUpIcon color="primary" />
                目標タイプ別達成度
              </Typography>
              
              <List dense>
                {Object.entries(statistics.typeBreakdown).map(([goalType, breakdown]) => (
                  <ListItem key={goalType} sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      {getGoalTypeIcon(goalType)}
                    </ListItemIcon>
                    <ListItemText
                      primary={GOAL_TYPE_LABELS[goalType as keyof typeof GOAL_TYPE_LABELS] || goalType}
                      secondary={
                        <Box>
                          <LinearProgress
                            variant="determinate"
                            value={breakdown.averageProgress}
                            color={getProgressColor(breakdown.averageProgress)}
                            sx={{ height: 4, borderRadius: 2, mb: 0.5 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {Math.round(breakdown.averageProgress)}% ({breakdown.completedCount}/{breakdown.goalsCount}達成)
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Grid>

          {/* Motivational Section */}
          <Grid item xs={12}>
            <Box
              sx={{
                p: 2,
                bgcolor: 'primary.light',
                borderRadius: 2,
                color: 'primary.contrastText',
                textAlign: 'center'
              }}
            >
              <TrophyIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                頑張っています！
              </Typography>
              <Typography variant="body1">
                {statistics.completedGoals > 0 ? (
                  `${statistics.completedGoals}個の目標を達成しました。`
                ) : (
                  '目標達成に向けて頑張りましょう！'
                )}
                {statistics.overallProgress >= 80 && ' 素晴らしい進捗です！'}
                {statistics.streaks.dailyStreak >= 7 && ` ${statistics.streaks.dailyStreak}日連続の学習、すごい！`}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default AchievementDashboard