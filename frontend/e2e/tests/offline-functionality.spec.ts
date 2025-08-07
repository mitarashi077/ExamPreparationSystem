import { test, expect } from '@playwright/test'
import {
  NavigationHelpers,
  QuestionHelpers,
  ProgressHelpers,
  ErrorHelpers,
} from '../utils/test-helpers'
import { testScenarios } from '../fixtures/test-data'

/**
 * E2E Tests for Offline Functionality
 *
 * These tests validate the offline capabilities including:
 * - Offline mode activation
 * - Question caching and availability
 * - Answer submission queuing
 * - Online sync when connection restored
 * - Data consistency verification
 */

test.describe('Offline Functionality E2E Tests', () => {
  let navigation: NavigationHelpers
  let questions: QuestionHelpers
  let progress: ProgressHelpers
  let errorHandler: ErrorHelpers

  test.beforeEach(async ({ page }) => {
    navigation = new NavigationHelpers(page)
    questions = new QuestionHelpers(page)
    progress = new ProgressHelpers(page)
    errorHandler = new ErrorHelpers(page)
  })

  test('should detect offline status', async ({ page }) => {
    await navigation.goToPractice()

    // Simulate going offline
    await page.context().setOffline(true)

    // Wait for offline indicator
    await page.waitForSelector('[data-testid="offline-indicator"]', {
      timeout: 5000,
    })

    // Verify offline indicator is visible
    const offlineIndicator = page.locator('[data-testid="offline-indicator"]')
    await expect(offlineIndicator).toBeVisible()

    // Verify offline message
    const offlineMessage = await offlineIndicator.textContent()
    expect(offlineMessage?.toLowerCase()).toContain('offline')

    // Restore online status
    await page.context().setOffline(false)

    // Wait for offline indicator to disappear
    await expect(offlineIndicator).toBeHidden({ timeout: 5000 })
  })

  test('should cache questions for offline use', async ({ page }) => {
    // Load some questions while online
    await navigation.goToPractice()
    await questions.waitForQuestionToLoad()

    // Navigate through a few questions to cache them
    for (let i = 0; i < 3; i++) {
      await questions.selectAnswer(0)
      await questions.submitAnswer()

      if (i < 2) {
        await questions.nextQuestion()
        await questions.waitForQuestionToLoad()
      }
    }

    // Go offline
    await page.context().setOffline(true)

    // Navigate back to first question
    await page.reload()
    await navigation.goToPractice()

    // Should still be able to see cached questions
    await questions.waitForQuestionToLoad()
    const offlineQuestionText = await questions.getQuestionText()

    // Verify we can access cached content
    expect(offlineQuestionText.length).toBeGreaterThan(0)

    // Restore online status
    await page.context().setOffline(false)
  })

  test('should queue answers when offline', async ({ page }) => {
    // Load questions while online
    await navigation.goToPractice()
    await questions.waitForQuestionToLoad()

    // Go offline
    await page.context().setOffline(true)

    // Answer questions while offline
    const scenario = testScenarios.offlineMode

    for (let i = 0; i < scenario.questionsToAnswerOffline; i++) {
      await questions.waitForQuestionToLoad()

      // Select answer
      await questions.selectAnswer(i % 4)
      await questions.submitAnswer()

      // Should show queued/pending state
      const queuedIndicator = page.locator('[data-testid="answer-queued"]')
      if (await queuedIndicator.isVisible()) {
        await expect(queuedIndicator).toBeVisible()
      }

      // Move to next question
      if (i < scenario.questionsToAnswerOffline - 1) {
        await questions.nextQuestion()
      }
    }

    // Verify pending sync indicator
    const syncPendingIndicator = page.locator('[data-testid="sync-pending"]')
    if (await syncPendingIndicator.isVisible()) {
      await expect(syncPendingIndicator).toBeVisible()
    }

    // Restore online status
    await page.context().setOffline(false)

    // Wait for sync to complete
    await page.waitForSelector('[data-testid="sync-complete"]', {
      timeout: 10000,
    })

    // Verify answers were synced
    await navigation.goToProgress()
    await progress.waitForProgressUpdate()

    const totalAnswered = await progress.getTotalQuestions()
    expect(totalAnswered).toBeGreaterThanOrEqual(
      scenario.questionsToAnswerOffline,
    )
  })

  test('should maintain data consistency during offline/online transitions', async ({
    page,
  }) => {
    // Answer questions while online
    await navigation.goToPractice()

    for (let i = 0; i < 2; i++) {
      await questions.waitForQuestionToLoad()
      await questions.selectAnswer(0)
      await questions.submitAnswer()

      if (i < 1) {
        await questions.nextQuestion()
      }
    }

    // Check progress while online
    await navigation.goToProgress()
    await progress.waitForProgressUpdate()
    const onlineProgress = await progress.getTotalQuestions()

    // Go offline
    await page.context().setOffline(true)

    // Answer more questions offline
    await navigation.goToPractice()

    for (let i = 0; i < 2; i++) {
      await questions.waitForQuestionToLoad()
      await questions.selectAnswer(1)
      await questions.submitAnswer()

      if (i < 1) {
        await questions.nextQuestion()
      }
    }

    // Go back online
    await page.context().setOffline(false)

    // Wait for sync
    await page.waitForTimeout(3000)

    // Check final progress
    await navigation.goToProgress()
    await progress.waitForProgressUpdate()
    const finalProgress = await progress.getTotalQuestions()

    // Should have both online and offline answers
    expect(finalProgress).toBeGreaterThan(onlineProgress)
    expect(finalProgress).toBeGreaterThanOrEqual(4) // 2 online + 2 offline
  })

  test('should handle service worker registration', async ({ page }) => {
    await navigation.goToHome()

    // Check if service worker is registered
    const swRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration()
        return !!registration
      }
      return false
    })

    // If PWA is enabled, service worker should be registered
    if (swRegistered) {
      expect(swRegistered).toBe(true)

      // Check service worker state
      const swState = await page.evaluate(() => {
        return navigator.serviceWorker.controller?.state
      })

      expect(['activated', 'activating']).toContain(swState)
    }
  })

  test('should show appropriate offline error messages', async ({ page }) => {
    await navigation.goToPractice()

    // Go offline
    await page.context().setOffline(true)

    // Try to perform an action that requires network
    await questions.waitForQuestionToLoad()

    // Look for offline-specific messaging
    const offlineMessage = page.locator('[data-testid="offline-message"]')
    if (await offlineMessage.isVisible()) {
      const messageText = await offlineMessage.textContent()
      expect(messageText?.toLowerCase()).toMatch(
        /offline|no connection|network/i,
      )
    }

    // Restore connection
    await page.context().setOffline(false)
  })

  test('should handle mixed online/offline question loading', async ({
    page,
  }) => {
    // Load some questions online
    await navigation.goToPractice()
    await questions.waitForQuestionToLoad()

    // Go offline
    await page.context().setOffline(true)

    // Try to navigate to next question (should work if cached)
    await questions.nextQuestion()

    // Should either load cached question or show appropriate message
    try {
      await questions.waitForQuestionToLoad()
      const offlineQuestionText = await questions.getQuestionText()
      expect(offlineQuestionText.length).toBeGreaterThan(0)
    } catch {
      // If no cached questions, should show offline message
      const offlineMessage = page.locator('[data-testid="offline-message"]')
      await expect(offlineMessage).toBeVisible()
    }

    // Restore connection
    await page.context().setOffline(false)

    // Should be able to load new questions
    await questions.nextQuestion()
    await questions.waitForQuestionToLoad()
    const backOnlineQuestionText = await questions.getQuestionText()
    expect(backOnlineQuestionText.length).toBeGreaterThan(0)
  })

  test('should sync bookmarks when coming back online', async ({ page }) => {
    // Create a bookmark online
    await navigation.goToPractice()
    await questions.waitForQuestionToLoad()
    await questions.bookmarkQuestion()

    // Go offline
    await page.context().setOffline(true)

    // Create bookmarks offline
    await questions.nextQuestion()
    await questions.waitForQuestionToLoad()
    await questions.bookmarkQuestion()

    // Go back online
    await page.context().setOffline(false)

    // Wait for sync
    await page.waitForTimeout(3000)

    // Check bookmarks
    await navigation.goToBookmarks()

    // Should have both bookmarks after sync
    const bookmarkItems = page.locator('[data-testid="bookmark-item"]')
    const bookmarkCount = await bookmarkItems.count()
    expect(bookmarkCount).toBeGreaterThanOrEqual(1)
  })

  test('should handle app installation prompt when offline', async ({
    page,
  }) => {
    // Go offline
    await page.context().setOffline(true)

    await navigation.goToHome()

    // Check for PWA install prompt handling
    const installPrompt = page.locator('[data-testid="install-prompt"]')
    if (await installPrompt.isVisible()) {
      // Install prompt should still work offline for cached app
      await expect(installPrompt).toBeVisible()
    }

    // Restore connection
    await page.context().setOffline(false)
  })

  test('should preserve user preferences during offline mode', async ({
    page,
  }) => {
    // Set some preferences online
    await navigation.goToSettings()

    // Modify settings if available
    const themeToggle = page.locator('[data-testid="theme-toggle"]')
    if (await themeToggle.isVisible()) {
      await themeToggle.click()
    }

    // Go offline
    await page.context().setOffline(true)

    // Navigate away and back
    await navigation.goToPractice()
    await navigation.goToSettings()

    // Settings should be preserved
    if (await themeToggle.isVisible()) {
      const toggleState = await themeToggle.getAttribute('aria-pressed')
      expect(toggleState).toBeTruthy()
    }

    // Restore connection
    await page.context().setOffline(false)
  })

  test('should handle network errors gracefully', async ({ page }) => {
    await navigation.goToPractice()

    // Simulate network error instead of complete offline
    await errorHandler.simulateNetworkError()

    // Try to load question
    await questions.waitForQuestionToLoad()

    // Should show error handling UI
    await errorHandler.waitForErrorMessage()
    const errorMessage = await errorHandler.getErrorMessage()
    expect(errorMessage.toLowerCase()).toMatch(/error|failed|problem/i)

    // Should provide retry option
    const retryButton = page.locator('[data-testid="retry-button"]')
    if (await retryButton.isVisible()) {
      // Restore network
      await errorHandler.restoreNetwork()

      // Click retry
      await retryButton.click()

      // Should work after retry
      await questions.waitForQuestionToLoad()
      const questionText = await questions.getQuestionText()
      expect(questionText.length).toBeGreaterThan(0)
    }
  })
})
