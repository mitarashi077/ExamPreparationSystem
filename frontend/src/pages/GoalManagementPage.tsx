import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Fab,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  CircularProgress,
  Container
} from '@mui/material'
import {
  Add as AddIcon,
  FilterList as FilterIcon,
  TrendingUp as TrendingUpIcon,
  EmojiEvents as TrophyIcon,
  Visibility as ViewIcon,
  VisibilityOff as HideIcon
} from '@mui/icons-material'
import { useAppStore } from '../stores/useAppStore'
import { useGoalStore } from '../stores/useGoalStore'
import { GoalFilters, GOAL_TYPE_LABELS, TIMEFRAME_LABELS } from '../types/goal'
import GoalCard from '../components/GoalCard'
import GoalSettingModal from '../components/GoalSettingModal'
import AchievementDashboard from '../components/AchievementDashboard'

const GoalManagementPage: React.FC = () => {
  const { deviceType } = useAppStore()
  const {
    goals,
    statistics,
    filters,
    isLoading,
    error,
    fetchGoals,
    fetchStatistics,
    setFilters,
    clearFilters,
    getFilteredGoals,
    clearError
  } = useGoalStore()

  const [goalSettingOpen, setGoalSettingOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'goals' | 'achievements'>('goals')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchGoals()
    fetchStatistics()
  }, [fetchGoals, fetchStatistics])

  const filteredGoals = getFilteredGoals()

  const handleFilterChange = (key: keyof GoalFilters, value: any) => {
    setFilters({ [key]: value === '' ? undefined : value })
  }

  const activeFiltersCount = Object.values(filters).filter(v => v !== undefined).length

  const categories = [
    { id: 'hardware', name: 'ハードウェア' },
    { id: 'software', name: 'ソフトウェア' },
    { id: 'database', name: 'データベース' },
    { id: 'network', name: 'ネットワーク' },
    { id: 'security', name: 'セキュリティ' },
    { id: 'project', name: 'プロジェクトマネジメント' }
  ]

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" display="flex" alignItems="center" gap={1}>
            <TrophyIcon color="primary" />
            目標管理
          </Typography>
          <Typography variant="body1" color="text.secondary">
            学習目標を設定して達成度を管理しましょう
          </Typography>
        </Box>
        
        {deviceType !== 'mobile' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setGoalSettingOpen(true)}
            size="large"
          >
            新しい目標
          </Button>
        )}
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={clearError}
        >
          {error}
        </Alert>
      )}

      {/* View Mode Toggle */}
      <Box display="flex" justifyContent="center" mb={3}>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, newMode) => newMode && setViewMode(newMode)}
          aria-label="view mode"
        >
          <ToggleButton value="goals" aria-label="goals view">
            <TrendingUpIcon sx={{ mr: 1 }} />
            目標一覧
          </ToggleButton>
          <ToggleButton value="achievements" aria-label="achievements view">
            <TrophyIcon sx={{ mr: 1 }} />
            達成度
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {viewMode === 'achievements' ? (
        /* Achievement Dashboard */
        <Box>
          {isLoading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : statistics ? (
            <AchievementDashboard statistics={statistics} />
          ) : (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  統計データを読み込み中...
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      ) : (
        /* Goals View */
        <Box>
          {/* Filter Section */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" display="flex" alignItems="center" gap={1}>
                  <FilterIcon />
                  フィルター
                  {activeFiltersCount > 0 && (
                    <Chip
                      label={activeFiltersCount}
                      size="small"
                      color="primary"
                    />
                  )}
                </Typography>
                <Box>
                  <Button
                    startIcon={showFilters ? <HideIcon /> : <ViewIcon />}
                    onClick={() => setShowFilters(!showFilters)}
                    size="small"
                  >
                    {showFilters ? '隠す' : '表示'}
                  </Button>
                  {activeFiltersCount > 0 && (
                    <Button
                      onClick={clearFilters}
                      size="small"
                      sx={{ ml: 1 }}
                    >
                      クリア
                    </Button>
                  )}
                </Box>
              </Box>

              {showFilters && (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>目標タイプ</InputLabel>
                      <Select
                        value={filters.goalType || ''}
                        label="目標タイプ"
                        onChange={(e) => handleFilterChange('goalType', e.target.value)}
                      >
                        <MenuItem value="">すべて</MenuItem>
                        {Object.entries(GOAL_TYPE_LABELS).map(([key, label]) => (
                          <MenuItem key={key} value={key}>
                            {label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>期間</InputLabel>
                      <Select
                        value={filters.timeframe || ''}
                        label="期間"
                        onChange={(e) => handleFilterChange('timeframe', e.target.value)}
                      >
                        <MenuItem value="">すべて</MenuItem>
                        {Object.entries(TIMEFRAME_LABELS).map(([key, label]) => (
                          <MenuItem key={key} value={key}>
                            {label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>カテゴリ</InputLabel>
                      <Select
                        value={filters.categoryId || ''}
                        label="カテゴリ"
                        onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                      >
                        <MenuItem value="">すべて</MenuItem>
                        {categories.map((category) => (
                          <MenuItem key={category.id} value={category.id}>
                            {category.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>ステータス</InputLabel>
                      <Select
                        value={filters.isActive !== undefined ? filters.isActive.toString() : ''}
                        label="ステータス"
                        onChange={(e) => handleFilterChange('isActive', 
                          e.target.value === '' ? undefined : e.target.value === 'true'
                        )}
                      >
                        <MenuItem value="">すべて</MenuItem>
                        <MenuItem value="true">アクティブ</MenuItem>
                        <MenuItem value="false">非アクティブ</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>

          {/* Goals Grid */}
          {isLoading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : filteredGoals.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <TrophyIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  {goals.length === 0 ? '目標がありません' : 'フィルター条件に一致する目標がありません'}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  {goals.length === 0 
                    ? '新しい目標を設定して学習を始めましょう'
                    : 'フィルター条件を変更してみてください'
                  }
                </Typography>
                {goals.length === 0 && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setGoalSettingOpen(true)}
                    size="large"
                  >
                    最初の目標を設定
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {filteredGoals.map((goal) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={goal.id}>
                  <GoalCard goal={goal} />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Mobile FAB */}
      {deviceType === 'mobile' && (
        <Fab
          color="primary"
          aria-label="add goal"
          onClick={() => setGoalSettingOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Goal Setting Modal */}
      <GoalSettingModal
        open={goalSettingOpen}
        onClose={() => setGoalSettingOpen(false)}
      />
    </Container>
  )
}

export default GoalManagementPage