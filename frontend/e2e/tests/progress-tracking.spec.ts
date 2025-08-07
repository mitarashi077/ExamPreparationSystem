import { test, expect } from '@playwright/test'
import {
  NavigationHelpers,
  QuestionHelpers,
  ProgressHelpers,
  DataHelpers,
} from '../utils/test-helpers'

/**
 * E2E Tests for Progress Tracking
 *
 * These tests validate the progress tracking functionality including:
 * - Progress data collection during study
 * - Progress page navigation and display
 * - Charts and statistics rendering
 * - Historical progress data
 * - Progress reset functionality
 */

test.describe('Progress Tracking E2E Tests', () => {
  let navigation: NavigationHelpers
  let questions: QuestionHelpers
  let progress: ProgressHelpers
  let dataValidation: DataHelpers

  test.beforeEach(async ({ page }) => {
    navigation = new NavigationHelpers(page)
    questions = new QuestionHelpers(page)
    progress = new ProgressHelpers(page)
    dataValidation = new DataHelpers(page)
  })

  test('should display progress page with initial state', async ({ page }) => {
    await navigation.goToProgress()

    // Verify progress page loads
    await expect(page.locator('[data-testid="progress-page"]')).toBeVisible()

    // Verify key progress elements are present
    await expect(
      page.locator('[data-testid="progress-overview"]'),
    ).toBeVisible()
    await expect(page.locator('[data-testid="progress-charts"]')).toBeVisible()
    await expect(
      page.locator('[data-testid="progress-statistics"]'),
    ).toBeVisible()

    // Validate progress data structure
    await dataValidation.validateProgressData()
  })

  test('should update progress after answering questions', async ({ page }) => {
    // Get initial progress
    await navigation.goToProgress()
    const _initialProgress = await progress.getProgressPercentage()
    const initialCorrect = await progress.getCorrectAnswers()
    const initialTotal = await progress.getTotalQuestions()

    // Answer some questions
    await navigation.goToPractice()

    const questionsToAnswer = 5
    let correctAnswers = 0

    for (let i = 0; i < questionsToAnswer; i++) {
      await questions.waitForQuestionToLoad()

      // Select first answer option
      await questions.selectAnswer(0)
      await questions.submitAnswer()

      // Wait for result and check if correct
      await page.waitForSelector('[data-testid="answer-result"]')
      const isCorrect = await questions.isAnswerCorrect()
      if (isCorrect) correctAnswers++

      // Move to next question
      if (i < questionsToAnswer - 1) {
        await questions.nextQuestion()
      }
    }

    // Check updated progress
    await navigation.goToProgress()
    await progress.waitForProgressUpdate()

    const updatedProgress = await progress.getProgressPercentage()
    const updatedCorrect = await progress.getCorrectAnswers()
    const updatedTotal = await progress.getTotalQuestions()

    // Verify progress has increased
    expect(updatedTotal).toBeGreaterThan(initialTotal)
    expect(updatedCorrect).toBeGreaterThanOrEqual(initialCorrect)

    // Verify progress percentage is calculated correctly
    const expectedProgress = Math.round((updatedCorrect / updatedTotal) * 100)
    expect(Math.abs(updatedProgress - expectedProgress)).toBeLessThanOrEqual(1)
  })

  test('should display progress charts correctly', async ({ page }) => {
    await navigation.goToProgress()

    // Wait for charts to render
    await page.waitForSelector('[data-testid="progress-charts"]')

    // Check for performance chart
    const performanceChart = page.locator('[data-testid="performance-chart"]')
    if (await performanceChart.isVisible()) {
      // Verify chart container has content
      const chartContent = await performanceChart.innerHTML()
      expect(chartContent.length).toBeGreaterThan(0)
    }

    // Check for category breakdown chart
    const categoryChart = page.locator('[data-testid="category-chart"]')
    if (await categoryChart.isVisible()) {
      // Verify chart container has content
      const chartContent = await categoryChart.innerHTML()
      expect(chartContent.length).toBeGreaterThan(0)
    }

    // Check for progress over time chart
    const timeChart = page.locator('[data-testid="time-chart"]')
    if (await timeChart.isVisible()) {
      // Verify chart container has content
      const chartContent = await timeChart.innerHTML()
      expect(chartContent.length).toBeGreaterThan(0)
    }
  })

  test('should show detailed statistics', async ({ page }) => {
    await navigation.goToProgress()

    // Verify statistics section is visible
    await expect(
      page.locator('[data-testid="progress-statistics"]'),
    ).toBeVisible()

    // Check for key statistics
    const stats = [
      'total-questions-answered',
      'correct-answers',
      'accuracy-percentage',
      'time-spent',
      'average-time-per-question',
    ]

    for (const stat of stats) {
      const statElement = page.locator(`[data-testid="${stat}"]`)
      if (await statElement.isVisible()) {
        const statValue = await statElement.textContent()
        expect(statValue).toBeTruthy()
        expect(statValue!.trim().length).toBeGreaterThan(0)
      }
    }
  })

  test('should track progress across multiple sessions', async ({
    page: _page,
  }) => {
    const _scenario = testScenarios.progressTracking

    // Complete first session
    await navigation.goToPractice()

    for (let i = 0; i < 3; i++) {
      await questions.waitForQuestionToLoad()
      await questions.selectAnswer(0)
      await questions.submitAnswer()

      if (i < 2) {
        await questions.nextQuestion()
      }
    }

    // Check progress after first session
    await navigation.goToProgress()
    await progress.waitForProgressUpdate()
    const firstSessionTotal = await progress.getTotalQuestions()
    const firstSessionCorrect = await progress.getCorrectAnswers()

    // Complete second session
    await navigation.goToPractice()

    for (let i = 0; i < 3; i++) {
      await questions.waitForQuestionToLoad()
      await questions.selectAnswer(1)
      await questions.submitAnswer()

      if (i < 2) {
        await questions.nextQuestion()
      }
    }

    // Check cumulative progress
    await navigation.goToProgress()
    await progress.waitForProgressUpdate()
    const secondSessionTotal = await progress.getTotalQuestions()
    const secondSessionCorrect = await progress.getCorrectAnswers()

    // Verify cumulative tracking
    expect(secondSessionTotal).toBeGreaterThan(firstSessionTotal)
    expect(secondSessionCorrect).toBeGreaterThanOrEqual(firstSessionCorrect)

    // Verify both sessions are accounted for
    expect(secondSessionTotal - firstSessionTotal).toBe(3)
  })

  test('should persist progress data across page reloads', async ({ page }) => {
    // Answer some questions
    await navigation.goToPractice()

    for (let i = 0; i < 4; i++) {
      await questions.waitForQuestionToLoad()
      await questions.selectAnswer(i % 4)
      await questions.submitAnswer()

      if (i < 3) {
        await questions.nextQuestion()
      }
    }

    // Check progress
    await navigation.goToProgress()
    await progress.waitForProgressUpdate()

    const beforeReloadTotal = await progress.getTotalQuestions()
    const beforeReloadCorrect = await progress.getCorrectAnswers()
    const beforeReloadProgress = await progress.getProgressPercentage()

    // Reload the page
    await page.reload()
    await navigation.goToProgress()
    await progress.waitForProgressUpdate()

    // Verify progress is maintained
    const afterReloadTotal = await progress.getTotalQuestions()
    const afterReloadCorrect = await progress.getCorrectAnswers()
    const afterReloadProgress = await progress.getProgressPercentage()

    expect(afterReloadTotal).toBe(beforeReloadTotal)
    expect(afterReloadCorrect).toBe(beforeReloadCorrect)
    expect(afterReloadProgress).toBe(beforeReloadProgress)
  })

  test('should show category-specific progress', async ({ page }) => {
    await navigation.goToProgress()

    // Check for category breakdown section
    const categorySection = page.locator('[data-testid="category-progress"]')
    if (await categorySection.isVisible()) {
      // Verify category items are present
      const categoryItems = page.locator('[data-testid^="category-item-"]')
      const categoryCount = await categoryItems.count()

      if (categoryCount > 0) {
        // Check each category item has required data
        for (let i = 0; i < Math.min(categoryCount, 5); i++) {
          const categoryItem = page.locator(
            `[data-testid="category-item-${i}"]`,
          )
          await expect(categoryItem).toBeVisible()

          // Check for category name
          const categoryName = page.locator(
            `[data-testid="category-item-${i}"] [data-testid="category-name"]`,
          )
          if (await categoryName.isVisible()) {
            const name = await categoryName.textContent()
            expect(name).toBeTruthy()
          }

          // Check for category progress
          const categoryProgress = page.locator(
            `[data-testid="category-item-${i}"] [data-testid="category-progress"]`,
          )
          if (await categoryProgress.isVisible()) {
            const progressText = await categoryProgress.textContent()
            expect(progressText).toBeTruthy()
          }
        }
      }
    }
  })

  test('should handle progress reset functionality', async ({ page }) => {
    // Answer some questions first
    await navigation.goToPractice()

    for (let i = 0; i < 3; i++) {
      await questions.waitForQuestionToLoad()
      await questions.selectAnswer(0)
      await questions.submitAnswer()

      if (i < 2) {
        await questions.nextQuestion()
      }
    }

    // Check initial progress
    await navigation.goToProgress()
    await progress.waitForProgressUpdate()

    const initialTotal = await progress.getTotalQuestions()
    expect(initialTotal).toBeGreaterThan(0)

    // Look for reset functionality
    const resetButton = page.locator('[data-testid="reset-progress"]')
    if (await resetButton.isVisible()) {
      // Click reset button
      await resetButton.click()

      // Handle confirmation dialog if present
      const confirmButton = page.locator('[data-testid="confirm-reset"]')
      if (await confirmButton.isVisible()) {
        await confirmButton.click()
      }

      // Wait for reset to complete
      await progress.waitForProgressUpdate()

      // Verify progress has been reset
      const afterResetTotal = await progress.getTotalQuestions()
      const afterResetCorrect = await progress.getCorrectAnswers()
      const afterResetProgress = await progress.getProgressPercentage()

      expect(afterResetTotal).toBe(0)
      expect(afterResetCorrect).toBe(0)
      expect(afterResetProgress).toBe(0)
    }
  })

  test('should display progress with proper accessibility', async ({
    page,
  }) => {
    await navigation.goToProgress()

    // Check for proper headings structure
    const headings = page.locator('h1, h2, h3, h4, h5, h6')
    const headingCount = await headings.count()
    expect(headingCount).toBeGreaterThan(0)

    // Check for ARIA labels on progress elements
    const progressBars = page.locator('[role="progressbar"]')
    const progressBarCount = await progressBars.count()

    for (let i = 0; i < progressBarCount; i++) {
      const progressBar = progressBars.nth(i)
      const ariaLabel = await progressBar.getAttribute('aria-label')
      const ariaValueNow = await progressBar.getAttribute('aria-valuenow')

      // Should have either aria-label or aria-labelledby
      const hasLabel =
        ariaLabel || (await progressBar.getAttribute('aria-labelledby'))
      expect(hasLabel).toBeTruthy()

      // Should have aria-valuenow for progress bars
      if (ariaValueNow) {
        expect(parseInt(ariaValueNow)).toBeGreaterThanOrEqual(0)
      }
    }
  })

  test('should handle large progress datasets efficiently', async ({
    page,
  }) => {
    // This test would typically involve seeding a large amount of progress data
    // For now, we'll test that the page loads efficiently even with existing data

    const startTime = Date.now()
    await navigation.goToProgress()

    // Wait for all progress elements to load
    await page.waitForSelector('[data-testid="progress-overview"]')
    await page.waitForSelector('[data-testid="progress-charts"]')
    await page.waitForSelector('[data-testid="progress-statistics"]')

    const loadTime = Date.now() - startTime

    // Page should load within reasonable time (5 seconds)
    expect(loadTime).toBeLessThan(5000)

    // Verify all key elements are visible
    await expect(
      page.locator('[data-testid="progress-overview"]'),
    ).toBeVisible()
    await expect(page.locator('[data-testid="progress-charts"]')).toBeVisible()
    await expect(
      page.locator('[data-testid="progress-statistics"]'),
    ).toBeVisible()
  })
})
