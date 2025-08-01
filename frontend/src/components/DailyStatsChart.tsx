import React from 'react'
import { Box, Typography, useTheme } from '@mui/material'
import { LineChart } from '@mui/x-charts/LineChart'
import { BarChart } from '@mui/x-charts/BarChart'

interface DailyStats {
  date: string
  correctAnswers: number
  totalAnswers: number
  accuracy: number
  averageTime: number
}

interface DailyStatsChartProps {
  data: DailyStats[]
  chartType?: 'line' | 'bar'
}

const DailyStatsChart: React.FC<DailyStatsChartProps> = ({ data, chartType = 'line' }) => {
  const theme = useTheme()

  // データを日付順にソートし、X軸とY軸データを準備
  const sortedData = data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  // X軸のラベル
  const xAxisData = sortedData.map(item => 
    new Date(item.date).toLocaleDateString('ja-JP', { 
      month: 'numeric', 
      day: 'numeric' 
    })
  )

  // Y軸のデータ系列
  const accuracyData = sortedData.map(item => Math.round(item.accuracy))
  const totalAnswersData = sortedData.map(item => item.totalAnswers)
  const correctAnswersData = sortedData.map(item => item.correctAnswers)

  if (data.length === 0) {
    return (
      <Box sx={{ 
        height: { xs: 300, sm: 400 }, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'text.secondary'
      }}>
        <Typography>学習データがありません</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ height: { xs: 300, sm: 400 }, width: '100%' }}>
      {chartType === 'line' ? (
        <LineChart
          xAxis={[{ 
            scaleType: 'point', 
            data: xAxisData,
          }]}
          series={[
            {
              data: accuracyData,
              label: '正答率(%)',
              color: theme.palette.primary.main,
              curve: 'linear'
            },
            {
              data: totalAnswersData,
              label: '総回答数',
              color: theme.palette.secondary.main,
              curve: 'linear'
            }
          ]}
          width={undefined}
          height={undefined}
          margin={{ left: 70, right: 70, top: 50, bottom: 50 }}
        />
      ) : (
        <BarChart
          xAxis={[{ 
            scaleType: 'band', 
            data: xAxisData
          }]}
          series={[
            {
              data: totalAnswersData,
              label: '総回答数',
              color: theme.palette.primary.main
            },
            {
              data: correctAnswersData,
              label: '正答数',
              color: theme.palette.success.main
            }
          ]}
          width={undefined}
          height={undefined}
          margin={{ left: 70, right: 70, top: 50, bottom: 50 }}
        />
      )}
    </Box>
  )
}

export default DailyStatsChart