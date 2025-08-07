// Test the spaced repetition algorithm logic extracted from controllers

// Extract the algorithm class for testing
class SpacedRepetitionAlgorithm {
  //習熟度レベルに基づく次回復習間隔（分）
  static getNextReviewInterval(
    masteryLevel: number,
    isCorrect: boolean,
  ): number {
    const baseIntervals = [
      1, // Level 0: 1分後
      5, // Level 1: 5分後
      30, // Level 2: 30分後
      180, // Level 3: 3時間後
      1440, // Level 4: 24時間後
      4320, // Level 5: 3日後
    ]

    let newLevel = masteryLevel

    if (isCorrect) {
      newLevel = Math.min(5, masteryLevel + 1)
    } else {
      newLevel = Math.max(0, masteryLevel - 1)
    }

    return baseIntervals[newLevel] || baseIntervals[0]
  }

  // 復習優先度の計算
  static calculatePriority(
    masteryLevel: number,
    wrongCount: number,
    daysSinceLastReview: number,
  ): number {
    let priority = 1

    // 習熟度が低いほど優先度高
    priority += 5 - masteryLevel

    // 間違い回数が多いほど優先度高
    priority += Math.min(wrongCount * 0.5, 3)

    // 最後の復習から時間が経つほど優先度高
    priority += Math.min(daysSinceLastReview * 0.1, 2)

    return Math.min(Math.round(priority), 5)
  }

  // Calculate new mastery level based on answer correctness
  static calculateNewMasteryLevel(
    currentLevel: number,
    isCorrect: boolean,
  ): number {
    if (isCorrect) {
      return Math.min(5, currentLevel + 1)
    } else {
      return Math.max(0, currentLevel - 1)
    }
  }

  // Calculate correct streak
  static calculateCorrectStreak(
    currentStreak: number,
    isCorrect: boolean,
  ): number {
    return isCorrect ? currentStreak + 1 : 0
  }

  // Calculate wrong count
  static calculateWrongCount(currentCount: number, isCorrect: boolean): number {
    return isCorrect ? currentCount : currentCount + 1
  }

  // Determine if review item should be active
  static shouldBeActive(masteryLevel: number): boolean {
    return masteryLevel < 5
  }

  // Calculate next review date
  static calculateNextReviewDate(
    baseDate: Date,
    intervalMinutes: number,
  ): Date {
    return new Date(baseDate.getTime() + intervalMinutes * 60 * 1000)
  }

  // Determine review urgency level
  static getUrgencyLevel(
    priority: number,
  ): 'low' | 'medium' | 'high' | 'urgent' {
    if (priority >= 5) return 'urgent'
    if (priority >= 4) return 'high'
    if (priority >= 3) return 'medium'
    return 'low'
  }

  // Calculate estimated review time
  static estimateReviewTime(
    itemCount: number,
    avgTimePerItem: number = 2,
  ): number {
    return itemCount * avgTimePerItem
  }

  // Suggest daily review count based on current items
  static suggestDailyReviewCount(totalItems: number): number {
    return Math.min(Math.max(totalItems, 5), 20)
  }
}

describe('Spaced Repetition Algorithm', () => {
  describe('getNextReviewInterval', () => {
    it('should return correct intervals for each mastery level with correct answers', () => {
      expect(SpacedRepetitionAlgorithm.getNextReviewInterval(0, true)).toBe(5) // 0 -> 1
      expect(SpacedRepetitionAlgorithm.getNextReviewInterval(1, true)).toBe(30) // 1 -> 2
      expect(SpacedRepetitionAlgorithm.getNextReviewInterval(2, true)).toBe(180) // 2 -> 3
      expect(SpacedRepetitionAlgorithm.getNextReviewInterval(3, true)).toBe(
        1440,
      ) // 3 -> 4
      expect(SpacedRepetitionAlgorithm.getNextReviewInterval(4, true)).toBe(
        4320,
      ) // 4 -> 5
    })

    it('should return correct intervals for each mastery level with incorrect answers', () => {
      expect(SpacedRepetitionAlgorithm.getNextReviewInterval(1, false)).toBe(1) // 1 -> 0
      expect(SpacedRepetitionAlgorithm.getNextReviewInterval(2, false)).toBe(5) // 2 -> 1
      expect(SpacedRepetitionAlgorithm.getNextReviewInterval(3, false)).toBe(30) // 3 -> 2
      expect(SpacedRepetitionAlgorithm.getNextReviewInterval(4, false)).toBe(
        180,
      ) // 4 -> 3
      expect(SpacedRepetitionAlgorithm.getNextReviewInterval(5, false)).toBe(
        1440,
      ) // 5 -> 4
    })

    it('should not go below level 0 or above level 5', () => {
      expect(SpacedRepetitionAlgorithm.getNextReviewInterval(0, false)).toBe(1) // 0 stays 0
      expect(SpacedRepetitionAlgorithm.getNextReviewInterval(5, true)).toBe(
        4320,
      ) // 5 stays 5
    })

    it('should handle invalid mastery levels gracefully', () => {
      expect(SpacedRepetitionAlgorithm.getNextReviewInterval(-1, true)).toBe(1) // Below 0 -> default to 1
      expect(SpacedRepetitionAlgorithm.getNextReviewInterval(10, true)).toBe(1) // Above 5 -> default to 1
    })
  })

  describe('calculatePriority', () => {
    it('should calculate priority based on mastery level', () => {
      // Low mastery = high priority
      expect(
        SpacedRepetitionAlgorithm.calculatePriority(0, 1, 0),
      ).toBeGreaterThan(SpacedRepetitionAlgorithm.calculatePriority(4, 1, 0))
    })

    it('should increase priority with more wrong answers', () => {
      const lowWrong = SpacedRepetitionAlgorithm.calculatePriority(2, 1, 0)
      const highWrong = SpacedRepetitionAlgorithm.calculatePriority(2, 5, 0)

      expect(highWrong).toBeGreaterThan(lowWrong)
    })

    it('should increase priority with more days since last review', () => {
      const recent = SpacedRepetitionAlgorithm.calculatePriority(2, 1, 1)
      const old = SpacedRepetitionAlgorithm.calculatePriority(2, 1, 30)

      expect(old).toBeGreaterThan(recent)
    })

    it('should cap priority at 5', () => {
      const maxPriority = SpacedRepetitionAlgorithm.calculatePriority(
        0,
        10,
        100,
      )
      expect(maxPriority).toBe(5)
    })

    it('should have minimum priority of 1', () => {
      const minPriority = SpacedRepetitionAlgorithm.calculatePriority(5, 0, 0)
      expect(minPriority).toBeGreaterThanOrEqual(1)
    })

    it('should cap wrong count bonus at 3', () => {
      const priority1 = SpacedRepetitionAlgorithm.calculatePriority(2, 6, 0) // 6 * 0.5 = 3 (capped)
      const priority2 = SpacedRepetitionAlgorithm.calculatePriority(2, 10, 0) // 10 * 0.5 = 5, but capped at 3

      // Both should have same wrong count contribution
      expect(priority1).toBe(priority2)
    })

    it('should cap days since review bonus at 2', () => {
      const priority1 = SpacedRepetitionAlgorithm.calculatePriority(2, 1, 20) // 20 * 0.1 = 2 (capped)
      const priority2 = SpacedRepetitionAlgorithm.calculatePriority(2, 1, 50) // 50 * 0.1 = 5, but capped at 2

      // Both should have same days contribution
      expect(priority1).toBe(priority2)
    })
  })

  describe('calculateNewMasteryLevel', () => {
    it('should increase mastery level for correct answers', () => {
      expect(SpacedRepetitionAlgorithm.calculateNewMasteryLevel(2, true)).toBe(
        3,
      )
      expect(SpacedRepetitionAlgorithm.calculateNewMasteryLevel(0, true)).toBe(
        1,
      )
    })

    it('should decrease mastery level for incorrect answers', () => {
      expect(SpacedRepetitionAlgorithm.calculateNewMasteryLevel(3, false)).toBe(
        2,
      )
      expect(SpacedRepetitionAlgorithm.calculateNewMasteryLevel(1, false)).toBe(
        0,
      )
    })

    it('should not exceed bounds', () => {
      expect(SpacedRepetitionAlgorithm.calculateNewMasteryLevel(5, true)).toBe(
        5,
      )
      expect(SpacedRepetitionAlgorithm.calculateNewMasteryLevel(0, false)).toBe(
        0,
      )
    })
  })

  describe('calculateCorrectStreak', () => {
    it('should increment streak for correct answers', () => {
      expect(SpacedRepetitionAlgorithm.calculateCorrectStreak(2, true)).toBe(3)
      expect(SpacedRepetitionAlgorithm.calculateCorrectStreak(0, true)).toBe(1)
    })

    it('should reset streak for incorrect answers', () => {
      expect(SpacedRepetitionAlgorithm.calculateCorrectStreak(5, false)).toBe(0)
      expect(SpacedRepetitionAlgorithm.calculateCorrectStreak(1, false)).toBe(0)
    })
  })

  describe('calculateWrongCount', () => {
    it('should maintain count for correct answers', () => {
      expect(SpacedRepetitionAlgorithm.calculateWrongCount(3, true)).toBe(3)
      expect(SpacedRepetitionAlgorithm.calculateWrongCount(0, true)).toBe(0)
    })

    it('should increment count for incorrect answers', () => {
      expect(SpacedRepetitionAlgorithm.calculateWrongCount(2, false)).toBe(3)
      expect(SpacedRepetitionAlgorithm.calculateWrongCount(0, false)).toBe(1)
    })
  })

  describe('shouldBeActive', () => {
    it('should be active for mastery levels below 5', () => {
      expect(SpacedRepetitionAlgorithm.shouldBeActive(0)).toBe(true)
      expect(SpacedRepetitionAlgorithm.shouldBeActive(3)).toBe(true)
      expect(SpacedRepetitionAlgorithm.shouldBeActive(4)).toBe(true)
    })

    it('should be inactive for mastery level 5', () => {
      expect(SpacedRepetitionAlgorithm.shouldBeActive(5)).toBe(false)
    })

    it('should handle invalid levels', () => {
      expect(SpacedRepetitionAlgorithm.shouldBeActive(-1)).toBe(true)
      expect(SpacedRepetitionAlgorithm.shouldBeActive(6)).toBe(false)
    })
  })

  describe('calculateNextReviewDate', () => {
    it('should calculate correct next review date', () => {
      const baseDate = new Date('2023-01-01T12:00:00Z')
      const intervalMinutes = 60

      const nextDate = SpacedRepetitionAlgorithm.calculateNextReviewDate(
        baseDate,
        intervalMinutes,
      )
      const expectedDate = new Date('2023-01-01T13:00:00Z')

      expect(nextDate.getTime()).toBe(expectedDate.getTime())
    })

    it('should handle different intervals correctly', () => {
      const baseDate = new Date('2023-01-01T12:00:00Z')

      const fiveMinutes = SpacedRepetitionAlgorithm.calculateNextReviewDate(
        baseDate,
        5,
      )
      const oneDay = SpacedRepetitionAlgorithm.calculateNextReviewDate(
        baseDate,
        1440,
      )

      expect(fiveMinutes.getTime()).toBe(
        new Date('2023-01-01T12:05:00Z').getTime(),
      )
      expect(oneDay.getTime()).toBe(new Date('2023-01-02T12:00:00Z').getTime())
    })
  })

  describe('getUrgencyLevel', () => {
    it('should categorize priority levels correctly', () => {
      expect(SpacedRepetitionAlgorithm.getUrgencyLevel(5)).toBe('urgent')
      expect(SpacedRepetitionAlgorithm.getUrgencyLevel(4)).toBe('high')
      expect(SpacedRepetitionAlgorithm.getUrgencyLevel(3)).toBe('medium')
      expect(SpacedRepetitionAlgorithm.getUrgencyLevel(2)).toBe('low')
      expect(SpacedRepetitionAlgorithm.getUrgencyLevel(1)).toBe('low')
    })

    it('should handle edge cases', () => {
      expect(SpacedRepetitionAlgorithm.getUrgencyLevel(0)).toBe('low')
      expect(SpacedRepetitionAlgorithm.getUrgencyLevel(6)).toBe('urgent')
    })
  })

  describe('estimateReviewTime', () => {
    it('should calculate estimated time correctly', () => {
      expect(SpacedRepetitionAlgorithm.estimateReviewTime(5)).toBe(10) // 5 * 2
      expect(SpacedRepetitionAlgorithm.estimateReviewTime(3, 3)).toBe(9) // 3 * 3
      expect(SpacedRepetitionAlgorithm.estimateReviewTime(0)).toBe(0) // 0 * 2
    })

    it('should use default time per item', () => {
      expect(SpacedRepetitionAlgorithm.estimateReviewTime(4)).toBe(8) // 4 * 2 (default)
    })
  })

  describe('suggestDailyReviewCount', () => {
    it('should suggest appropriate daily review counts', () => {
      expect(SpacedRepetitionAlgorithm.suggestDailyReviewCount(3)).toBe(5) // min 5
      expect(SpacedRepetitionAlgorithm.suggestDailyReviewCount(10)).toBe(10) // actual count
      expect(SpacedRepetitionAlgorithm.suggestDailyReviewCount(25)).toBe(20) // max 20
    })

    it('should handle edge cases', () => {
      expect(SpacedRepetitionAlgorithm.suggestDailyReviewCount(0)).toBe(5)
      expect(SpacedRepetitionAlgorithm.suggestDailyReviewCount(-5)).toBe(5)
      expect(SpacedRepetitionAlgorithm.suggestDailyReviewCount(100)).toBe(20)
    })
  })

  describe('Integration Scenarios', () => {
    it('should handle complete learning progression', () => {
      let masteryLevel = 0
      let wrongCount = 1
      let correctStreak = 0
      const _daysSinceReview = 0

      // First correct answer
      masteryLevel = SpacedRepetitionAlgorithm.calculateNewMasteryLevel(
        masteryLevel,
        true,
      )
      correctStreak = SpacedRepetitionAlgorithm.calculateCorrectStreak(
        correctStreak,
        true,
      )
      const interval1 = SpacedRepetitionAlgorithm.getNextReviewInterval(
        masteryLevel - 1,
        true,
      )

      expect(masteryLevel).toBe(1)
      expect(correctStreak).toBe(1)
      expect(interval1).toBe(5)

      // Second correct answer
      masteryLevel = SpacedRepetitionAlgorithm.calculateNewMasteryLevel(
        masteryLevel,
        true,
      )
      correctStreak = SpacedRepetitionAlgorithm.calculateCorrectStreak(
        correctStreak,
        true,
      )
      const interval2 = SpacedRepetitionAlgorithm.getNextReviewInterval(
        masteryLevel - 1,
        true,
      )

      expect(masteryLevel).toBe(2)
      expect(correctStreak).toBe(2)
      expect(interval2).toBe(30)

      // One wrong answer (regression)
      masteryLevel = SpacedRepetitionAlgorithm.calculateNewMasteryLevel(
        masteryLevel,
        false,
      )
      correctStreak = SpacedRepetitionAlgorithm.calculateCorrectStreak(
        correctStreak,
        false,
      )
      wrongCount = SpacedRepetitionAlgorithm.calculateWrongCount(
        wrongCount,
        false,
      )
      const interval3 = SpacedRepetitionAlgorithm.getNextReviewInterval(
        masteryLevel + 1,
        false,
      )

      expect(masteryLevel).toBe(1)
      expect(correctStreak).toBe(0)
      expect(wrongCount).toBe(2)
      expect(interval3).toBe(5)
    })

    it('should calculate realistic priorities for different scenarios', () => {
      // New difficult question (just wrong)
      const newDifficult = SpacedRepetitionAlgorithm.calculatePriority(0, 1, 0)

      // Repeatedly wrong question
      const repeatedlyWrong = SpacedRepetitionAlgorithm.calculatePriority(
        0,
        5,
        0,
      )

      // Old question not reviewed in a while
      const oldQuestion = SpacedRepetitionAlgorithm.calculatePriority(2, 1, 30)

      // Well-mastered question
      const masteredQuestion = SpacedRepetitionAlgorithm.calculatePriority(
        4,
        1,
        1,
      )

      expect(repeatedlyWrong).toBeGreaterThan(newDifficult)
      expect(oldQuestion).toBeGreaterThan(masteredQuestion)
      expect(newDifficult).toBeGreaterThan(masteredQuestion)
    })

    it('should provide reasonable review scheduling', () => {
      const baseDate = new Date('2023-01-01T12:00:00Z')

      // Different mastery levels should have different intervals
      const beginner = SpacedRepetitionAlgorithm.getNextReviewInterval(0, true)
      const intermediate = SpacedRepetitionAlgorithm.getNextReviewInterval(
        2,
        true,
      )
      const advanced = SpacedRepetitionAlgorithm.getNextReviewInterval(4, true)

      const beginnerNext = SpacedRepetitionAlgorithm.calculateNextReviewDate(
        baseDate,
        beginner,
      )
      const intermediateNext =
        SpacedRepetitionAlgorithm.calculateNextReviewDate(
          baseDate,
          intermediate,
        )
      const advancedNext = SpacedRepetitionAlgorithm.calculateNextReviewDate(
        baseDate,
        advanced,
      )

      expect(beginnerNext.getTime()).toBeLessThan(intermediateNext.getTime())
      expect(intermediateNext.getTime()).toBeLessThan(advancedNext.getTime())
    })
  })
})
