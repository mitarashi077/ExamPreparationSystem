import React from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  useTheme,
  alpha
} from '@mui/material'
import { StudyGoal, GoalProgress } from '../types/goal'

interface ProgressChartProps {
  goal: StudyGoal
  progressData: GoalProgress[]
  height?: number
}

const ProgressChart: React.FC<ProgressChartProps> = ({ 
  goal, 
  progressData, 
  height = 200 
}) => {
  const theme = useTheme()

  // Generate mock data points for visualization
  const generateDataPoints = () => {
    const points = []
    const daysCount = 30 // Show last 30 days
    const today = new Date()
    
    for (let i = daysCount - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      
      // Simulate progressive data - in real implementation, use actual progressData
      const progress = Math.min(
        (daysCount - i) * (goal.currentValue / daysCount) + 
        Math.random() * 5 - 2.5, // Add some variation
        goal.targetValue
      )
      
      points.push({
        date: date.toISOString().split('T')[0],
        value: Math.max(0, progress),
        percentage: Math.min((progress / goal.targetValue) * 100, 100)
      })
    }
    
    return points
  }

  const dataPoints = generateDataPoints()
  const maxValue = goal.targetValue
  const minValue = 0

  // SVG dimensions
  const svgWidth = 600
  const svgHeight = height
  const padding = 40
  const chartWidth = svgWidth - padding * 2
  const chartHeight = svgHeight - padding * 2

  // Create path for the line chart
  const createPath = (points: typeof dataPoints) => {
    if (points.length === 0) return ''
    
    const pathPoints = points.map((point, index) => {
      const x = padding + (index / (points.length - 1)) * chartWidth
      const y = padding + (1 - (point.value - minValue) / (maxValue - minValue)) * chartHeight
      
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    
    return pathPoints.join(' ')
  }

  // Create area path for filling under the curve
  const createAreaPath = (points: typeof dataPoints) => {
    if (points.length === 0) return ''
    
    const linePath = createPath(points)
    const lastPoint = points[points.length - 1]
    const firstPoint = points[0]
    
    const x1 = padding
    const x2 = padding + chartWidth
    const bottomY = padding + chartHeight
    
    return `${linePath} L ${x2} ${bottomY} L ${x1} ${bottomY} Z`
  }

  // Create grid lines
  const createGridLines = () => {
    const lines = []
    const gridCount = 5
    
    // Horizontal grid lines
    for (let i = 0; i <= gridCount; i++) {
      const y = padding + (i / gridCount) * chartHeight
      const value = maxValue - (i / gridCount) * (maxValue - minValue)
      
      lines.push(
        <g key={`h-grid-${i}`}>
          <line
            x1={padding}
            y1={y}
            x2={padding + chartWidth}
            y2={y}
            stroke={alpha(theme.palette.divider, 0.3)}
            strokeWidth={1}
            strokeDasharray="2,2"
          />
          <text
            x={padding - 10}
            y={y + 4}
            textAnchor="end"
            fontSize="12"
            fill={theme.palette.text.secondary}
          >
            {Math.round(value)}
          </text>
        </g>
      )
    }
    
    return lines
  }

  // Create target line
  const targetY = padding + (1 - (goal.targetValue - minValue) / (maxValue - minValue)) * chartHeight
  
  const path = createPath(dataPoints)
  const areaPath = createAreaPath(dataPoints)

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          進捗チャート - {goal.goalType}
        </Typography>
        
        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          <svg
            width={svgWidth}
            height={svgHeight}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            style={{ minWidth: '400px' }}
          >
            {/* Grid lines */}
            {createGridLines()}
            
            {/* Target line */}
            <line
              x1={padding}
              y1={targetY}
              x2={padding + chartWidth}
              y2={targetY}
              stroke={theme.palette.warning.main}
              strokeWidth={2}
              strokeDasharray="5,5"
            />
            <text
              x={padding + chartWidth - 5}
              y={targetY - 5}
              textAnchor="end"
              fontSize="12"
              fill={theme.palette.warning.main}
              fontWeight="bold"
            >
              目標: {goal.targetValue}
            </text>
            
            {/* Area fill */}
            <path
              d={areaPath}
              fill={alpha(theme.palette.primary.main, 0.1)}
            />
            
            {/* Progress line */}
            <path
              d={path}
              fill="none"
              stroke={theme.palette.primary.main}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Data points */}
            {dataPoints.map((point, index) => {
              const x = padding + (index / (dataPoints.length - 1)) * chartWidth
              const y = padding + (1 - (point.value - minValue) / (maxValue - minValue)) * chartHeight
              
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r={3}
                  fill={theme.palette.primary.main}
                  stroke="white"
                  strokeWidth={2}
                >
                  <title>
                    {point.date}: {Math.round(point.value)} ({Math.round(point.percentage)}%)
                  </title>
                </circle>
              )
            })}
            
            {/* Current value indicator */}
            {dataPoints.length > 0 && (
              <g>
                <circle
                  cx={padding + chartWidth}
                  cy={padding + (1 - (goal.currentValue - minValue) / (maxValue - minValue)) * chartHeight}
                  r={5}
                  fill={theme.palette.secondary.main}
                  stroke="white"
                  strokeWidth={2}
                />
                <text
                  x={padding + chartWidth + 10}
                  y={padding + (1 - (goal.currentValue - minValue) / (maxValue - minValue)) * chartHeight + 4}
                  fontSize="12"
                  fill={theme.palette.secondary.main}
                  fontWeight="bold"
                >
                  現在: {goal.currentValue}
                </text>
              </g>
            )}
          </svg>
        </Box>
        
        {/* Chart legend */}
        <Box display="flex" justifyContent="center" gap={3} mt={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 16,
                height: 2,
                bgcolor: theme.palette.primary.main,
                borderRadius: 1
              }}
            />
            <Typography variant="body2" color="text.secondary">
              実績
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 16,
                height: 2,
                bgcolor: theme.palette.warning.main,
                borderRadius: 1,
                opacity: 0.7
              }}
            />
            <Typography variant="body2" color="text.secondary">
              目標
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 8,
                height: 8,
                bgcolor: theme.palette.secondary.main,
                borderRadius: '50%'
              }}
            />
            <Typography variant="body2" color="text.secondary">
              現在値
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default ProgressChart