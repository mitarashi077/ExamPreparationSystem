import React, { useState } from 'react'
import {
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import HeatmapChart from '../components/HeatmapChart'
import DailyStatsChart from '../components/DailyStatsChart'
import OfflineIndicator from '../components/OfflineIndicator'
import {
  useHeatmapData,
  useStudyStats,
  HeatmapData,
} from '../hooks/useProgressApi'

const ProgressPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<number>(30)
  const [selectedCategory, setSelectedCategory] = useState<HeatmapData | null>(
    null,
  )
  const [chartType, setChartType] = useState<'line' | 'bar'>('line')

  const {
    data: heatmapData,
    loading: heatmapLoading,
    error: heatmapError,
    refresh: refreshHeatmap,
    lastUpdated,
  } = useHeatmapData(selectedPeriod)

  const {
    data: statsData,
    loading: statsLoading,
    error: statsError,
    refresh: refreshStats,
  } = useStudyStats(7)

  const handlePeriodChange = (
    _event: React.MouseEvent<HTMLElement>,
    newPeriod: number | null,
  ) => {
    if (newPeriod !== null) {
      setSelectedPeriod(newPeriod)
    }
  }

  const handleCellClick = (category: HeatmapData) => {
    setSelectedCategory(category)
  }

  const handleRefresh = () => {
    refreshHeatmap()
    refreshStats()
  }

  const handleChartTypeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newChartType: 'line' | 'bar' | null,
  ) => {
    if (newChartType !== null) {
      setChartType(newChartType)
    }
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
        }}
      >
        <Typography variant="h4" component="h1">
          学習進捗
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <OfflineIndicator compact />

          <ToggleButtonGroup
            value={selectedPeriod}
            exclusive
            onChange={handlePeriodChange}
            size="small"
          >
            <ToggleButton value={7}>7日</ToggleButton>
            <ToggleButton value={30}>30日</ToggleButton>
            <ToggleButton value={90}>90日</ToggleButton>
          </ToggleButtonGroup>

          <IconButton
            onClick={handleRefresh}
            disabled={heatmapLoading || statsLoading}
          >
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {/* 概要統計カード */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                総回答数
              </Typography>
              <Typography variant="h4">
                {statsLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  statsData?.summary.totalAnswers || 0
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                正答数
              </Typography>
              <Typography variant="h4">
                {statsLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  statsData?.summary.correctAnswers || 0
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                正答率
              </Typography>
              <Typography variant="h4">
                {statsLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  `${Math.round(statsData?.summary.accuracy || 0)}%`
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                学習分野数
              </Typography>
              <Typography variant="h4">
                {heatmapLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  heatmapData.filter((d) => d.attempts > 0).length
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* エラー表示 */}
      {(heatmapError || statsError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {heatmapError || statsError}
        </Alert>
      )}

      {/* ヒートマップ */}
      <Paper sx={{ mb: 4 }}>
        {heatmapLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <HeatmapChart data={heatmapData} onCellClick={handleCellClick} />
        )}

        {lastUpdated && (
          <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary">
              最終更新: {new Date(lastUpdated).toLocaleString('ja-JP')}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* 日別統計グラフ */}
      <Paper sx={{ mb: 4 }}>
        <Box sx={{ p: 3 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
            }}
          >
            <Typography variant="h6" component="h2">
              日別学習統計
            </Typography>

            <ToggleButtonGroup
              value={chartType}
              exclusive
              onChange={handleChartTypeChange}
              size="small"
            >
              <ToggleButton value="line">線グラフ</ToggleButton>
              <ToggleButton value="bar">棒グラフ</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {statsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : statsData?.daily && statsData.daily.length > 0 ? (
            <DailyStatsChart data={statsData.daily} chartType={chartType} />
          ) : (
            <Box
              sx={{
                textAlign: 'center',
                py: 4,
                color: 'text.secondary',
              }}
            >
              <Typography>
                統計データがありません。問題を解いて学習を開始してください。
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* 選択された分野の詳細 */}
      {selectedCategory && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            分野詳細: {selectedCategory.categoryName}
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="primary">
                  {Math.round(selectedCategory.accuracy)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  正答率
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3">
                  {selectedCategory.attempts}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  回答数
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3">
                  {selectedCategory.attempts > 0
                    ? Math.round(
                        (selectedCategory.accuracy *
                          selectedCategory.attempts) /
                          100,
                      )
                    : 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  正解数
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  )
}

export default ProgressPage
