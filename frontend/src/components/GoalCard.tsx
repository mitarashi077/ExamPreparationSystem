import React, { useState } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  LinearProgress,
  Button,
  Menu,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel
} from '@mui/material'
import {
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  EmojiEvents as TrophyIcon,
  Schedule as ScheduleIcon,
  Speed as SpeedIcon,
  QuestionAnswer as QuestionIcon,
  Bookmark as BookmarkIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material'
import {
  StudyGoal,
  UpdateGoalRequest,
  GOAL_TYPE_LABELS,
  TIMEFRAME_LABELS,
  GOAL_TYPE_UNITS
} from '../types/goal'
import { useGoalStore } from '../stores/useGoalStore'

interface GoalCardProps {
  goal: StudyGoal
}

const GoalCard: React.FC<GoalCardProps> = ({ goal }) => {
  const {
    updateGoal,
    deleteGoal,
    incrementGoalProgress,
    clearError
  } = useGoalStore()

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState<UpdateGoalRequest>({
    targetValue: goal.targetValue,
    currentValue: goal.currentValue,
    isActive: goal.isActive
  })

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleIncrement = async (increment: number) => {
    try {
      await incrementGoalProgress(goal.id, increment)
    } catch (error) {
      // Error handling is done in store
    }
  }

  const handleEdit = () => {
    setEditForm({
      targetValue: goal.targetValue,
      currentValue: goal.currentValue,
      isActive: goal.isActive
    })
    setEditDialogOpen(true)
    handleMenuClose()
  }

  const handleSaveEdit = async () => {
    try {
      await updateGoal(goal.id, editForm)
      setEditDialogOpen(false)
      clearError()
    } catch (error) {
      // Error handling is done in store
    }
  }

  const handleDelete = () => {
    setDeleteDialogOpen(true)
    handleMenuClose()
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteGoal(goal.id)
      setDeleteDialogOpen(false)
      clearError()
    } catch (error) {
      // Error handling is done in store
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'success'
    if (progress >= 80) return 'info'
    if (progress >= 60) return 'warning'
    return 'error'
  }

  const getTimeframeColor = (timeframe: string) => {
    switch (timeframe) {
      case 'daily': return 'primary'
      case 'weekly': return 'secondary'
      case 'monthly': return 'success'
      default: return 'default'
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

  const getIncrementValue = () => {
    switch (goal.goalType) {
      case 'time': return 15 // 15 minutes
      case 'questions': return 1
      case 'accuracy': return 1 // 1%
      case 'bookmarks': return 1
      case 'reviews': return 1
      default: return 1
    }
  }

  const isDeadlineApproaching = () => {
    if (!goal.deadline) return false
    const deadline = new Date(goal.deadline)
    const now = new Date()
    const diffTime = deadline.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 2 && diffDays > 0
  }

  const isOverdue = () => {
    if (!goal.deadline) return false
    return new Date(goal.deadline) < new Date()
  }

  return (
    <>
      <Card 
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          border: goal.progress >= 100 ? '2px solid' : '1px solid',
          borderColor: goal.progress >= 100 ? 'success.main' : 
                      isOverdue() ? 'error.main' :
                      isDeadlineApproaching() ? 'warning.main' : 'divider',
          position: 'relative',
          opacity: goal.isActive ? 1 : 0.6
        }}
      >
        {goal.progress >= 100 && (
          <Box
            sx={{
              position: 'absolute',
              top: -1,
              right: -1,
              bgcolor: 'success.main',
              color: 'white',
              px: 1,
              py: 0.5,
              borderRadius: '0 0 0 8px',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5
            }}
          >
            <TrophyIcon sx={{ fontSize: 12 }} />
            達成
          </Box>
        )}

        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box flexGrow={1}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Chip
                  icon={getGoalTypeIcon(goal.goalType)}
                  label={GOAL_TYPE_LABELS[goal.goalType]}
                  color="primary"
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={TIMEFRAME_LABELS[goal.timeframe]}
                  color={getTimeframeColor(goal.timeframe)}
                  size="small"
                />
                {goal.categoryName && (
                  <Chip
                    label={goal.categoryName}
                    variant="outlined"
                    size="small"
                  />
                )}
              </Box>
              <Typography variant="h6" fontWeight="bold" noWrap>
                {goal.targetValue} {GOAL_TYPE_UNITS[goal.goalType]}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                現在: {goal.currentValue} / {goal.targetValue} {GOAL_TYPE_UNITS[goal.goalType]}
              </Typography>
            </Box>
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVertIcon />
            </IconButton>
          </Box>

          {/* Progress */}
          <Box sx={{ mb: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" color="text.secondary">
                進捗
              </Typography>
              <Typography 
                variant="body2" 
                fontWeight="bold" 
                color={`${getProgressColor(goal.progress)}.main`}
              >
                {goal.progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(goal.progress, 100)}
              color={getProgressColor(goal.progress)}
              sx={{ 
                height: 8, 
                borderRadius: 4,
                bgcolor: 'rgba(0,0,0,0.1)'
              }}
            />
          </Box>

          {/* Deadline info */}
          {goal.deadline && (
            <Box sx={{ mb: 2 }}>
              <Typography 
                variant="caption" 
                color={isOverdue() ? 'error' : isDeadlineApproaching() ? 'warning.main' : 'text.secondary'}
                display="flex"
                alignItems="center"
                gap={0.5}
              >
                <ScheduleIcon sx={{ fontSize: 14 }} />
                {isOverdue() ? '期限超過' : 
                 isDeadlineApproaching() ? '期限迫る' : 
                 `期限: ${new Date(goal.deadline).toLocaleDateString()}`}
              </Typography>
            </Box>
          )}

          {/* Goal icon */}
          <Box display="flex" justifyContent="center" mb={2}>
            {getGoalTypeIcon(goal.goalType)}
          </Box>
        </CardContent>

        {/* Action buttons */}
        {goal.isActive && goal.progress < 100 && (
          <Box sx={{ px: 2, pb: 2 }}>
            <Box display="flex" justifyContent="space-between" gap={1}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<RemoveIcon />}
                onClick={() => handleIncrement(-getIncrementValue())}
                disabled={goal.currentValue <= 0}
                sx={{ flexGrow: 1 }}
              >
                -{getIncrementValue()}
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => handleIncrement(getIncrementValue())}
                sx={{ flexGrow: 1 }}
              >
                +{getIncrementValue()}
              </Button>
            </Box>
          </Box>
        )}
      </Card>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} />
          編集
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          削除
        </MenuItem>
      </Menu>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>目標を編集</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              label="目標値"
              type="number"
              fullWidth
              value={editForm.targetValue}
              onChange={(e) => setEditForm(prev => ({ 
                ...prev, 
                targetValue: parseFloat(e.target.value) || 0 
              }))}
              sx={{ mb: 2 }}
              InputProps={{ inputProps: { min: 1 } }}
            />
            <TextField
              label="現在値"
              type="number"
              fullWidth
              value={editForm.currentValue}
              onChange={(e) => setEditForm(prev => ({ 
                ...prev, 
                currentValue: parseFloat(e.target.value) || 0 
              }))}
              sx={{ mb: 2 }}
              InputProps={{ inputProps: { min: 0 } }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm(prev => ({ 
                    ...prev, 
                    isActive: e.target.checked 
                  }))}
                />
              }
              label="アクティブ"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSaveEdit} variant="contained">
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>目標を削除</DialogTitle>
        <DialogContent>
          <Typography>
            この目標を削除してもよろしいですか？この操作は取り消せません。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            キャンセル
          </Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error">
            削除
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default GoalCard