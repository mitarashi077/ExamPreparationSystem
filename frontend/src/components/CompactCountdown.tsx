import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Chip,
  Tooltip
} from '@mui/material'
import {
  Schedule as ScheduleIcon,
  Warning as WarningIcon
} from '@mui/icons-material'
import { useExamScheduleStore } from '../stores/useExamScheduleStore'
import { EXAM_TYPE_LABELS } from '../types/examSchedule'

const CompactCountdown: React.FC = () => {
  const { currentSchedule, fetchExamSchedules } = useExamScheduleStore()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    fetchExamSchedules()
  }, [fetchExamSchedules])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // 1分間隔で更新

    return () => clearInterval(timer)
  }, [])

  if (!currentSchedule) {
    return null
  }

  const examDate = new Date(currentSchedule.examDate)
  const now = currentTime
  const timeDiff = examDate.getTime() - now.getTime()
  
  const daysRemaining = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
  const hoursRemaining = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  
  const isExpired = timeDiff <= 0
  const isUrgent = daysRemaining <= 7 && daysRemaining > 0
  const isCritical = daysRemaining <= 3 && daysRemaining > 0

  const getColor = () => {
    if (isExpired) return 'default'
    if (isCritical) return 'error'
    if (isUrgent) return 'warning'
    return 'primary'
  }

  const getIcon = () => {
    if (isCritical || isUrgent) return <WarningIcon />
    return <ScheduleIcon />
  }

  const getDisplayText = () => {
    if (isExpired) return '終了'
    if (daysRemaining === 0) return `${hoursRemaining}時間`
    return `${daysRemaining}日`
  }

  const getTooltipText = () => {
    const examTypeLabel = EXAM_TYPE_LABELS[currentSchedule.examType]
    const dateStr = examDate.toLocaleDateString('ja-JP')
    
    if (isExpired) {
      return `${examTypeLabel}は終了しました (${dateStr})`
    }
    
    return `${examTypeLabel} - ${dateStr} まで残り${daysRemaining}日${hoursRemaining}時間`
  }

  return (
    <Tooltip title={getTooltipText()}>
      <Chip
        icon={getIcon()}
        label={getDisplayText()}
        color={getColor()}
        size="small"
        sx={{
          cursor: 'pointer',
          '& .MuiChip-icon': {
            fontSize: 16
          }
        }}
      />
    </Tooltip>
  )
}

export default CompactCountdown