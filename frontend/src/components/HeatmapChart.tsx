import React from 'react'
import { Box, Paper, Typography, Grid, Chip, useTheme } from '@mui/material'
import { styled } from '@mui/material/styles'

interface HeatmapData {
  categoryId: string
  categoryName: string
  attempts: number
  accuracy: number
  colorIntensity: number
}

interface HeatmapChartProps {
  data: HeatmapData[]
  onCellClick?: (category: HeatmapData) => void
}

const HeatmapCell = styled(Paper)<{ intensity: number; isMobile?: boolean }>(
  ({ theme, intensity, isMobile = false }) => ({
    padding: isMobile ? theme.spacing(1.5) : theme.spacing(2),
    minHeight: isMobile ? 80 : 100,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backgroundColor:
      intensity === 0
        ? theme.palette.grey[100]
        : `hsl(${120 * intensity}, 70%, ${85 - intensity * 20}%)`,
    border: `2px solid ${theme.palette.divider}`,
    '&:hover': {
      transform: 'scale(1.02)',
      boxShadow: theme.shadows[4],
      zIndex: 1,
    },
  }),
)

const HeatmapChart: React.FC<HeatmapChartProps> = ({ data, onCellClick }) => {
  const theme = useTheme()

  const getAccuracyColor = (accuracy: number): string => {
    if (accuracy >= 80) return 'success'
    if (accuracy >= 60) return 'warning'
    return 'error'
  }

  const getAccuracyText = (accuracy: number, attempts: number): string => {
    if (attempts === 0) return '未回答'
    return `${Math.round(accuracy)}%`
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" component="h2" gutterBottom>
        分野別習熟度ヒートマップ
      </Typography>

      <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              backgroundColor: theme.palette.grey[100],
              border: `1px solid ${theme.palette.divider}`,
            }}
          />
          <Typography variant="caption">未回答</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              backgroundColor: 'hsl(0, 70%, 85%)',
            }}
          />
          <Typography variant="caption">低習熟度</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              backgroundColor: 'hsl(60, 70%, 75%)',
            }}
          />
          <Typography variant="caption">中習熟度</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              backgroundColor: 'hsl(120, 70%, 65%)',
            }}
          />
          <Typography variant="caption">高習熟度</Typography>
        </Box>
      </Box>

      <Grid container spacing={2}>
        {data.map((category) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={category.categoryId}>
            <HeatmapCell
              intensity={category.colorIntensity}
              isMobile={false}
              onClick={() => onCellClick?.(category)}
            >
              <Typography
                variant="body2"
                fontWeight="bold"
                textAlign="center"
                sx={{
                  mb: 1,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  lineHeight: 1.2,
                }}
              >
                {category.categoryName}
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                <Chip
                  label={getAccuracyText(category.accuracy, category.attempts)}
                  color={
                    category.attempts === 0
                      ? 'default'
                      : (getAccuracyColor(category.accuracy) as any)
                  }
                  size="small"
                  variant="filled"
                />

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.6rem', sm: '0.75rem' } }}
                >
                  {category.attempts}問回答
                </Typography>
              </Box>
            </HeatmapCell>
          </Grid>
        ))}
      </Grid>

      {data.length === 0 && (
        <Box
          sx={{
            textAlign: 'center',
            py: 4,
            color: 'text.secondary',
          }}
        >
          <Typography>
            回答データがありません。問題を解いて学習を開始してください。
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default HeatmapChart
