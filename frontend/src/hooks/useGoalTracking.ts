import { useCallback, useEffect } from 'react'
import { useGoalStore } from '../stores/useGoalStore'
import { useQuestionStore } from '../stores/useQuestionStore'
import { useBookmarkStore } from '../stores/useBookmarkStore'

/**
 * Hook for automatic goal progress tracking
 * Integrates with existing systems to automatically update goals
 */
export const useGoalTracking = () => {
  const { updateGoalFromActivity } = useGoalStore()
  const questionStore = useQuestionStore()
  const bookmarkStore = useBookmarkStore()

  // Track question answering activity
  const trackQuestionAnswered = useCallback(async (
    isCorrect: boolean,
    categoryId?: string,
    timeSpent?: number
  ) => {
    try {
      // Update question count goals
      await updateGoalFromActivity('question_answered', 1, categoryId)
      
      // Update accuracy goals (if correct)
      if (isCorrect) {
        await updateGoalFromActivity('accuracy', 1, categoryId)
      }
      
      // Update time goals (if time spent is provided)
      if (timeSpent) {
        const timeInMinutes = Math.round(timeSpent / 60000) // Convert ms to minutes
        await updateGoalFromActivity('study_time', timeInMinutes, categoryId)
      }
    } catch (error) {
      console.error('Failed to track question answered:', error)
    }
  }, [updateGoalFromActivity])

  // Track bookmark activity
  const trackBookmarkAdded = useCallback(async (categoryId?: string) => {
    try {
      await updateGoalFromActivity('bookmark_added', 1, categoryId)
    } catch (error) {
      console.error('Failed to track bookmark added:', error)
    }
  }, [updateGoalFromActivity])

  // Track review activity
  const trackReviewCompleted = useCallback(async (categoryId?: string) => {
    try {
      await updateGoalFromActivity('review_completed', 1, categoryId)
    } catch (error) {
      console.error('Failed to track review completed:', error)
    }
  }, [updateGoalFromActivity])

  // Track study session time
  const trackStudyTime = useCallback(async (
    timeInMinutes: number, 
    categoryId?: string
  ) => {
    try {
      await updateGoalFromActivity('study_time', timeInMinutes, categoryId)
    } catch (error) {
      console.error('Failed to track study time:', error)
    }
  }, [updateGoalFromActivity])

  // Integration with existing stores
  useEffect(() => {
    // For now, we'll integrate through manual calls
    // TODO: Implement proper store integration when question answering and bookmarking occur
    
    // The integration will be done through direct calls in the respective components
    // rather than through store subscriptions
  }, [trackQuestionAnswered, trackBookmarkAdded])

  return {
    trackQuestionAnswered,
    trackBookmarkAdded,
    trackReviewCompleted,
    trackStudyTime
  }
}

export default useGoalTracking