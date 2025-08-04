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
  Tabs,
  Tab,
  Grid,
  IconButton,
  Card,
  CardContent,
  Chip
} from '@mui/material'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon
} from '@mui/icons-material'
import { format } from 'date-fns'
import {
  ExamSchedule,
  CreateExamScheduleRequest,
  UpdateExamScheduleRequest,
  CreateStudyTargetRequest,
  EXAM_TYPE_LABELS,
  TARGET_TYPE_LABELS,
  UNIT_LABELS
} from '../types/examSchedule'
import { useExamScheduleStore } from '../stores/useExamScheduleStore'

interface ExamSettingsModalProps {
  open: boolean
  onClose: () => void
  schedule?: ExamSchedule | null
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
)

const ExamSettingsModal: React.FC<ExamSettingsModalProps> = ({ open, onClose, schedule }) => {
  const {
    createExamSchedule,
    updateExamSchedule,
    createStudyTarget,
    studyTargets,
    fetchStudyTargets,
    isLoading,
    error,
    clearError
  } = useExamScheduleStore()

  const [activeTab, setActiveTab] = useState(0)
  const [examForm, setExamForm] = useState<CreateExamScheduleRequest | UpdateExamScheduleRequest>({
    examType: 'spring' as const,
    examDate: '',
    targetScore: undefined
  })
  const [studyTargetForm, setStudyTargetForm] = useState<CreateStudyTargetRequest>({
    examScheduleId: '',
    categoryId: undefined,
    targetType: 'daily' as const,
    targetValue: 10,
    unit: 'questions' as const
  })

  useEffect(() => {
    if (schedule) {
      setExamForm({
        examType: schedule.examType,
        examDate: schedule.examDate,
        targetScore: schedule.targetScore
      })
      setStudyTargetForm(prev => ({
        ...prev,
        examScheduleId: schedule.id
      }))
      fetchStudyTargets(schedule.id)
    } else {
      setExamForm({
        examType: 'spring' as const,
        examDate: '',
        targetScore: undefined
      })
      setStudyTargetForm({
        examScheduleId: '',
        categoryId: undefined,
        targetType: 'daily' as const,
        targetValue: 10,
        unit: 'questions' as const
      })
    }
  }, [schedule, fetchStudyTargets])

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  const handleExamSubmit = async () => {
    try {
      if (schedule) {
        await updateExamSchedule(schedule.id, examForm)
      } else {
        const newSchedule = await createExamSchedule(examForm as CreateExamScheduleRequest)
        setStudyTargetForm(prev => ({
          ...prev,
          examScheduleId: newSchedule.id
        }))
        setActiveTab(1) // 学習目標タブに移動
      }
      clearError()
    } catch (error) {
      // エラーハンドリングはstoreで処理済み
    }
  }

  const handleStudyTargetSubmit = async () => {
    try {
      await createStudyTarget(studyTargetForm)
      setStudyTargetForm(prev => ({
        ...prev,
        targetValue: 10,
        categoryId: undefined
      }))
      clearError()
    } catch (error) {
      // エラーハンドリングはstoreで処理済み
    }
  }

  const handleClose = () => {
    clearError()
    setActiveTab(0)
    onClose()
  }

  const isExamFormValid = () => {
    return examForm.examType && examForm.examDate
  }

  const isStudyTargetFormValid = () => {
    return studyTargetForm.examScheduleId && 
           studyTargetForm.targetType && 
           studyTargetForm.targetValue > 0 && 
           studyTargetForm.unit
  }

  return (
    <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { minHeight: '60vh' }
        }}
      >
        <DialogTitle>
          {schedule ? '試験設定を編集' : '新しい試験設定'}
        </DialogTitle>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="試験情報" />
            <Tab label="学習目標" disabled={!schedule && !studyTargetForm.examScheduleId} />
          </Tabs>
        </Box>

        <DialogContent sx={{ p: 0 }}>
          {error && (
            <Alert severity="error" onClose={clearError} sx={{ m: 3, mb: 0 }}>
              {error}
            </Alert>
          )}

          {/* 試験情報タブ */}
          <TabPanel value={activeTab} index={0}>
            <Box sx={{ px: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>試験種別</InputLabel>
                    <Select
                      value={examForm.examType}
                      label="試験種別"
                      onChange={(e) => setExamForm(prev => ({ 
                        ...prev, 
                        examType: e.target.value as 'spring' | 'autumn' | 'special'
                      }))}
                    >
                      <MenuItem value="spring">{EXAM_TYPE_LABELS.spring}</MenuItem>
                      <MenuItem value="autumn">{EXAM_TYPE_LABELS.autumn}</MenuItem>
                      <MenuItem value="special">{EXAM_TYPE_LABELS.special}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="試験日"
                    type="date"
                    fullWidth
                    required
                    value={examForm.examDate ? examForm.examDate.split('T')[0] : ''}
                    onChange={(e) => setExamForm(prev => ({ 
                      ...prev, 
                      examDate: e.target.value ? new Date(e.target.value).toISOString() : ''
                    }))}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="目標点数（オプション）"
                    type="number"
                    fullWidth
                    value={examForm.targetScore || ''}
                    onChange={(e) => setExamForm(prev => ({ 
                      ...prev, 
                      targetScore: parseInt(e.target.value) || undefined
                    }))}
                    InputProps={{ inputProps: { min: 0, max: 100 } }}
                    helperText="0-100点で入力してください"
                  />
                </Grid>
              </Grid>

              {schedule && (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    現在の進捗状況
                  </Typography>
                  <Typography variant="body1">
                    総合進捗: {schedule.progressSummary.overallProgress}%
                  </Typography>
                  <Typography variant="body1">
                    残り日数: {schedule.daysRemaining}日
                  </Typography>
                </Box>
              )}
            </Box>
          </TabPanel>

          {/* 学習目標タブ */}
          <TabPanel value={activeTab} index={1}>
            <Box sx={{ px: 3 }}>
              {/* 新しい学習目標の作成 */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    新しい学習目標を追加
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth>
                        <InputLabel>目標タイプ</InputLabel>
                        <Select
                          value={studyTargetForm.targetType}
                          label="目標タイプ"
                          onChange={(e) => setStudyTargetForm(prev => ({ 
                            ...prev, 
                            targetType: e.target.value as 'daily' | 'weekly' | 'total'
                          }))}
                        >
                          <MenuItem value="daily">{TARGET_TYPE_LABELS.daily}</MenuItem>
                          <MenuItem value="weekly">{TARGET_TYPE_LABELS.weekly}</MenuItem>
                          <MenuItem value="total">{TARGET_TYPE_LABELS.total}</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={3}>
                      <TextField
                        label="目標値"
                        type="number"
                        fullWidth
                        value={studyTargetForm.targetValue}
                        onChange={(e) => setStudyTargetForm(prev => ({ 
                          ...prev, 
                          targetValue: parseInt(e.target.value) || 0
                        }))}
                        InputProps={{ inputProps: { min: 1 } }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={3}>
                      <FormControl fullWidth>
                        <InputLabel>単位</InputLabel>
                        <Select
                          value={studyTargetForm.unit}
                          label="単位"
                          onChange={(e) => setStudyTargetForm(prev => ({ 
                            ...prev, 
                            unit: e.target.value as 'questions' | 'minutes' | 'sessions'
                          }))}
                        >
                          <MenuItem value="questions">{UNIT_LABELS.questions}</MenuItem>
                          <MenuItem value="minutes">{UNIT_LABELS.minutes}</MenuItem>
                          <MenuItem value="sessions">{UNIT_LABELS.sessions}</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={2}>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleStudyTargetSubmit}
                        disabled={!isStudyTargetFormValid() || isLoading}
                        fullWidth
                        sx={{ height: '56px' }}
                      >
                        追加
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* 既存の学習目標一覧 */}
              <Typography variant="h6" gutterBottom>
                設定済み学習目標
              </Typography>
              
              {studyTargets.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                  <Typography variant="body1">
                    学習目標が設定されていません
                  </Typography>
                  <Typography variant="body2">
                    上記のフォームから学習目標を追加してください
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {studyTargets.map((target) => (
                    <Grid item xs={12} sm={6} key={target.id}>
                      <Card variant="outlined">
                        <CardContent sx={{ pb: 2 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                            <Box>
                              <Box display="flex" gap={1} mb={1}>
                                <Chip
                                  label={TARGET_TYPE_LABELS[target.targetType]}
                                  size="small"
                                  color="primary"
                                />
                                {target.categoryName && (
                                  <Chip
                                    label={target.categoryName}
                                    size="small"
                                    variant="outlined"
                                  />
                                )}
                              </Box>
                              <Typography variant="body1" fontWeight="bold">
                                {target.targetValue} {UNIT_LABELS[target.unit]}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                進捗: {target.currentValue} / {target.targetValue} ({target.progress}%)
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </TabPanel>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose}>
            キャンセル
          </Button>
          {activeTab === 0 ? (
            <Button
              onClick={handleExamSubmit}
              variant="contained"
              disabled={!isExamFormValid() || isLoading}
              startIcon={<SaveIcon />}
            >
              {schedule ? '更新' : '作成'}
            </Button>
          ) : (
            <Button onClick={handleClose} variant="contained">
              完了
            </Button>
          )}
        </DialogActions>
      </Dialog>
  )
}

export default ExamSettingsModal