import { Router } from 'express'
import {
  getExamSchedules,
  createExamSchedule,
  updateExamSchedule,
  deleteExamSchedule,
  getStudyTargets,
  createStudyTarget,
  updateStudyTarget,
  deleteStudyTarget,
  updateProgress
} from '../controllers/examScheduleController'

const router = Router()

// 試験スケジュール管理
router.get('/', getExamSchedules)
router.post('/', createExamSchedule)
router.put('/:id', updateExamSchedule)
router.delete('/:id', deleteExamSchedule)

// 学習目標管理
router.get('/:scheduleId/study-targets', getStudyTargets)
router.post('/study-targets', createStudyTarget)
router.put('/study-targets/:id', updateStudyTarget)
router.delete('/study-targets/:id', deleteStudyTarget)

// 進捗管理
router.post('/:scheduleId/progress', updateProgress)

export default router