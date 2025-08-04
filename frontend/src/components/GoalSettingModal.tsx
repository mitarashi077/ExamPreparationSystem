import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  Chip,
  Grid
} from '@mui/material'
import {
  Schedule as ScheduleIcon,
  QuestionAnswer as QuestionIcon,
  Speed as SpeedIcon,
  Bookmark as BookmarkIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material'
import {
  CreateGoalRequest,
  GOAL_TYPE_LABELS,
  TIMEFRAME_LABELS,
  GOAL_TYPE_UNITS
} from '../types/goal'
import { useGoalStore } from '../stores/useGoalStore'
import { useExamScheduleStore } from '../stores/useExamScheduleStore'

interface GoalSettingModalProps {
  open: boolean
  onClose: () => void
}

interface Category {
  id: string
  name: string
}

const GoalSettingModal: React.FC<GoalSettingModalProps> = ({ open, onClose }) => {
  const { createGoal, clearError, error } = useGoalStore()
  const { currentSchedule, allSchedules } = useExamScheduleStore()
  
  const [formData, setFormData] = useState<CreateGoalRequest>({
    goalType: 'questions',
    targetValue: 10,
    timeframe: 'daily'
  })
  const [categories] = useState<Category[]>([
    { id: 'hardware', name: 'ハードウェア' },
    { id: 'software', name: 'ソフトウェア' },
    { id: 'database', name: 'データベース' },
    { id: 'network', name: 'ネットワーク' },
    { id: 'security', name: 'セキュリティ' },
    { id: 'project', name: 'プロジェクトマネジメント' }
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      // Reset form when opening
      setFormData({
        goalType: 'questions',
        targetValue: getDefaultTargetValue('questions', 'daily'),
        timeframe: 'daily',
        examScheduleId: currentSchedule?.id
      })
      clearError()
    }
  }, [open, currentSchedule, clearError])

  const getDefaultTargetValue = (goalType: string, timeframe: string): number => {
    const defaults: Record<string, Record<string, number>> = {
      questions: { daily: 10, weekly: 50, monthly: 200 },
      time: { daily: 60, weekly: 300, monthly: 1200 }, // minutes
      accuracy: { daily: 70, weekly: 75, monthly: 80 }, // percentage
      bookmarks: { daily: 3, weekly: 15, monthly: 50 },
      reviews: { daily: 5, weekly: 25, monthly: 100 }
    }
    return defaults[goalType]?.[timeframe] || 10
  }

  const getGoalTypeIcon = (goalType: string) => {
    switch (goalType) {
      case 'time': return <ScheduleIcon />
      case 'questions': return <QuestionIcon />
      case 'accuracy': return <SpeedIcon />
      case 'bookmarks': return <BookmarkIcon />
      case 'reviews': return <RefreshIcon />
      default: return <QuestionIcon />
    }
  }

  const getGoalTypeDescription = (goalType: string) => {
    switch (goalType) {
      case 'time': return '学習時間の目標を設定します'
      case 'questions': return '解答する問題数の目標を設定します'
      case 'accuracy': return '正答率の目標を設定します'
      case 'bookmarks': return 'ブックマークする問題数の目標を設定します'
      case 'reviews': return '復習回数の目標を設定します'
      default: return ''
    }
  }

  const handleGoalTypeChange = (goalType: string) => {
    const newTargetValue = getDefaultTargetValue(goalType, formData.timeframe)
    setFormData(prev => ({
      ...prev,
      goalType: goalType as any,
      targetValue: newTargetValue
    }))
  }

  const handleTimeframeChange = (timeframe: string) => {
    const newTargetValue = getDefaultTargetValue(formData.goalType, timeframe)
    setFormData(prev => ({
      ...prev,
      timeframe: timeframe as any,
      targetValue: newTargetValue
    }))
  }

  const handleSubmit = async () => {
    if (!formData.targetValue || formData.targetValue <= 0) {
      return
    }

    setIsSubmitting(true)
    try {
      await createGoal(formData)
      onClose()
    } catch (error) {
      // Error is handled in store
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTimeframeDeadline = () => {
    const now = new Date()
    switch (formData.timeframe) {
      case 'daily':
        return new Date(now.setDate(now.getDate() + 1)).toISOString()
      case 'weekly':
        return new Date(now.setDate(now.getDate() + 7)).toISOString()
      case 'monthly':
        return new Date(now.setMonth(now.getMonth() + 1)).toISOString()
      default:
        return undefined
    }
  }

  const finalFormData: CreateGoalRequest = {
    ...formData,
    deadline: getTimeframeDeadline()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h5" component="div" display="flex" alignItems="center" gap={1}>
          {getGoalTypeIcon(formData.goalType)}
          新しい目標を設定
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Goal Type Selection */}
          <Typography variant="h6" gutterBottom>
            目標の種類
          </Typography>
          <Grid container spacing={1} sx={{ mb: 3 }}>
            {Object.entries(GOAL_TYPE_LABELS).map(([type, label]) => (
              <Grid item key={type}>
                <Chip
                  icon={getGoalTypeIcon(type)}
                  label={label}
                  clickable
                  color={formData.goalType === type ? 'primary' : 'default'}
                  variant={formData.goalType === type ? 'filled' : 'outlined'}
                  onClick={() => handleGoalTypeChange(type)}
                />
              </Grid>
            ))}
          </Grid>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {getGoalTypeDescription(formData.goalType)}
          </Typography>

          {/* Timeframe Selection */}
          <Typography variant="h6" gutterBottom>
            期間
          </Typography>
          <Grid container spacing={1} sx={{ mb: 3 }}>
            {Object.entries(TIMEFRAME_LABELS).map(([timeframe, label]) => (
              <Grid item key={timeframe}>
                <Chip
                  label={label}
                  clickable
                  color={formData.timeframe === timeframe ? 'secondary' : 'default'}
                  variant={formData.timeframe === timeframe ? 'filled' : 'outlined'}
                  onClick={() => handleTimeframeChange(timeframe)}
                />
              </Grid>
            ))}
          </Grid>

          {/* Target Value */}
          <TextField
            label={`目標値 (${GOAL_TYPE_UNITS[formData.goalType]})`}
            type="number"
            fullWidth
            value={formData.targetValue}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              targetValue: parseFloat(e.target.value) || 0 
            }))}
            sx={{ mb: 3 }}
            InputProps={{ 
              inputProps: { 
                min: formData.goalType === 'accuracy' ? 0 : 1,
                max: formData.goalType === 'accuracy' ? 100 : undefined
              } 
            }}
            helperText={
              formData.goalType === 'accuracy' 
                ? '0-100の範囲で入力してください' 
                : '目標となる数値を入力してください'
            }
          />

          {/* Category Selection */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>カテゴリ (オプション)</InputLabel>
            <Select
              value={formData.categoryId || ''}
              label="カテゴリ (オプション)"
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                categoryId: e.target.value || undefined 
              }))}
            >
              <MenuItem value="">すべてのカテゴリ</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Exam Schedule Selection */}
          {allSchedules.length > 0 && (
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>試験スケジュール (オプション)</InputLabel>
              <Select
                value={formData.examScheduleId || ''}
                label="試験スケジュール (オプション)"
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  examScheduleId: e.target.value || undefined 
                }))}
              >
                <MenuItem value="">関連付けなし</MenuItem>
                {allSchedules.map((schedule) => (
                  <MenuItem key={schedule.id} value={schedule.id}>
                    {schedule.examType} - {new Date(schedule.examDate).toLocaleDateString()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Preview */}
          <Box 
            sx={{ 
              p: 2, 
              bgcolor: 'background.default', 
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Typography variant="subtitle2" gutterBottom>
              目標プレビュー
            </Typography>
            <Typography variant="body1">
              <strong>{TIMEFRAME_LABELS[formData.timeframe]}</strong>で
              <strong>{formData.targetValue} {GOAL_TYPE_UNITS[formData.goalType]}</strong>の
              <strong>{GOAL_TYPE_LABELS[formData.goalType]}</strong>目標
            </Typography>
            {formData.categoryId && (
              <Typography variant="body2" color="text.secondary">
                カテゴリ: {categories.find(c => c.id === formData.categoryId)?.name}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary">
              期限: {finalFormData.deadline ? new Date(finalFormData.deadline).toLocaleDateString() : '設定なし'}
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          キャンセル
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={isSubmitting || !formData.targetValue || formData.targetValue <= 0}
        >
          {isSubmitting ? '作成中...' : '目標を作成'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default GoalSettingModal