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
  FormControl,
  InputLabel,
  Select
} from '@mui/material'
import {
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material'
import { StudyTarget, TARGET_TYPE_LABELS, UNIT_LABELS, UpdateStudyTargetRequest } from '../types/examSchedule'
import { useExamScheduleStore } from '../stores/useExamScheduleStore'

interface StudyTargetCardProps {
  target: StudyTarget
  scheduleId: string
}

const StudyTargetCard: React.FC<StudyTargetCardProps> = ({ target, scheduleId }) => {
  const {
    updateProgress,
    updateStudyTarget,
    deleteStudyTarget,
    clearError
  } = useExamScheduleStore()

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState<UpdateStudyTargetRequest>({
    targetValue: target.targetValue,
    currentValue: target.currentValue
  })

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleIncrement = async (increment: number) => {
    try {
      await updateProgress(scheduleId, {
        studyTargetId: target.id,
        increment
      })
    } catch (error) {
      // エラーハンドリングはstoreで処理済み
    }
  }

  const handleEdit = () => {
    setEditForm({
      targetValue: target.targetValue,
      currentValue: target.currentValue
    })
    setEditDialogOpen(true)
    handleMenuClose()
  }

  const handleSaveEdit = async () => {
    try {
      await updateStudyTarget(target.id, editForm)
      setEditDialogOpen(false)
      clearError()
    } catch (error) {
      // エラーハンドリングはstoreで処理済み
    }
  }

  const handleDelete = () => {
    setDeleteDialogOpen(true)
    handleMenuClose()
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteStudyTarget(target.id)
      setDeleteDialogOpen(false)
      clearError()
    } catch (error) {
      // エラーハンドリングはstoreで処理済み
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'success'
    if (progress >= 80) return 'info'
    if (progress >= 60) return 'warning'
    return 'error'
  }

  const getTargetTypeColor = (targetType: string) => {
    switch (targetType) {
      case 'daily': return 'primary'
      case 'weekly': return 'secondary'
      case 'total': return 'success'
      default: return 'default'
    }
  }

  return (
    <>
      <Card 
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          border: target.progress >= 100 ? '2px solid' : '1px solid',
          borderColor: target.progress >= 100 ? 'success.main' : 'divider',
          position: 'relative'
        }}
      >
        {target.progress >= 100 && (
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
              fontWeight: 'bold'
            }}
          >
            完了
          </Box>
        )}

        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
          {/* ヘッダー */}
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box flexGrow={1}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Chip
                  label={TARGET_TYPE_LABELS[target.targetType]}
                  color={getTargetTypeColor(target.targetType)}
                  size="small"
                />
                {target.categoryName && (
                  <Chip
                    label={target.categoryName}
                    variant="outlined"
                    size="small"
                  />
                )}
              </Box>
              <Typography variant="h6" fontWeight="bold" noWrap>
                {target.targetValue} {UNIT_LABELS[target.unit]}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                現在: {target.currentValue} / {target.targetValue}
              </Typography>
            </Box>
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVertIcon />
            </IconButton>
          </Box>

          {/* 進捗表示 */}
          <Box sx={{ mb: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" color="text.secondary">
                進捗
              </Typography>
              <Typography variant="body2" fontWeight="bold" color={`${getProgressColor(target.progress)}.main`}>
                {target.progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(target.progress, 100)}
              color={getProgressColor(target.progress)}
              sx={{ 
                height: 8, 
                borderRadius: 4,
                bgcolor: 'rgba(0,0,0,0.1)'
              }}
            />
          </Box>

          {/* 進捗アイコン */}
          <Box display="flex" justifyContent="center" mb={2}>
            <TrendingUpIcon 
              sx={{ 
                fontSize: 40,
                color: target.progress >= 100 ? 'success.main' : 
                       target.progress >= 80 ? 'info.main' :
                       target.progress >= 60 ? 'warning.main' : 'error.main',
                opacity: 0.7
              }} 
            />
          </Box>
        </CardContent>

        {/* アクションボタン */}
        <Box sx={{ px: 2, pb: 2 }}>
          <Box display="flex" justifyContent="space-between" gap={1}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RemoveIcon />}
              onClick={() => handleIncrement(-1)}
              disabled={target.currentValue <= 0}
              sx={{ flexGrow: 1 }}
            >
              -1
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => handleIncrement(1)}
              sx={{ flexGrow: 1 }}
            >
              +1
            </Button>
          </Box>
        </Box>
      </Card>

      {/* メニュー */}
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

      {/* 編集ダイアログ */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>学習目標を編集</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              label="目標値"
              type="number"
              fullWidth
              value={editForm.targetValue}
              onChange={(e) => setEditForm(prev => ({ 
                ...prev, 
                targetValue: parseInt(e.target.value) || 0 
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
                currentValue: parseInt(e.target.value) || 0 
              }))}
              InputProps={{ inputProps: { min: 0 } }}
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

      {/* 削除確認ダイアログ */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>学習目標を削除</DialogTitle>
        <DialogContent>
          <Typography>
            この学習目標を削除してもよろしいですか？この操作は取り消せません。
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

export default StudyTargetCard