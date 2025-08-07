import { test, expect } from '@playwright/test'
import {
  NavigationHelpers,
  QuestionHelpers,
  ProgressHelpers,
  BookmarkHelpers,
  PerformanceHelpers,
  ErrorHelpers,
} from '../utils/test-helpers'
import { performanceBenchmarks } from '../fixtures/test-data'

/**
 * E2E Tests for Cross-System Integration
 *
 * These tests validate the integration between frontend and backend including:
 * - API communication reliability
 * - Error handling across systems
 * - Data format consistency
 * - Real-time data synchronization
 * - Database integration
 * - Performance under realistic load
 */

test.describe('Cross-System Integration E2E Tests', () => {
  let navigation: NavigationHelpers
  let questions: QuestionHelpers
  let progress: ProgressHelpers
  let bookmarks: BookmarkHelpers
  let errorHandler: ErrorHelpers

  test.beforeEach(async ({ page }) => {
    navigation = new NavigationHelpers(page)
    questions = new QuestionHelpers(page)
    progress = new ProgressHelpers(page)
    bookmarks = new BookmarkHelpers(page)
    errorHandler = new ErrorHelpers(page)
  })

  test('should handle complete frontend-backend question flow', async ({
    page,
  }) => {
    // Track API calls
    const apiCalls: string[] = []
    page.on('response', (response) => {
      if (response.url().includes('/api/')) {
        apiCalls.push(
          `${response.request().method()} ${response.url()} - ${response.status()}`,
        )
      }
    })

    // Load practice page
    await navigation.goToPractice()
    await questions.waitForQuestionToLoad()

    // Verify question API was called
    const questionApiCalls = apiCalls.filter((call) =>
      call.includes('/questions'),
    )
    expect(questionApiCalls.length).toBeGreaterThan(0)
    expect(questionApiCalls[0]).toContain('200')

    // Answer question and verify submission API
    await questions.selectAnswer(0)
    await questions.submitAnswer()

    // Wait for answer submission API call
    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/answers') && response.status() === 200,
    )

    const answerApiCalls = apiCalls.filter((call) => call.includes('/answers'))
    expect(answerApiCalls.length).toBeGreaterThan(0)
    expect(answerApiCalls[0]).toContain('200')

    // Verify progress API
    await navigation.goToProgress()
    await progress.waitForProgressUpdate()

    const progressApiCalls = apiCalls.filter((call) =>
      call.includes('/progress'),
    )
    expect(progressApiCalls.length).toBeGreaterThan(0)
  })

  test('should maintain data consistency across API calls', async ({
    page,
  }) => {
    // Answer questions and track consistency
    await navigation.goToPractice()

    const answeredQuestions: { id: string; answer: number }[] = []

    for (let i = 0; i < 3; i++) {
      await questions.waitForQuestionToLoad()

      // Get question ID if available
      const questionId = await page.getAttribute(
        '[data-testid="question-card"]',
        'data-question-id',
      )

      const answerIndex = i % 4
      await questions.selectAnswer(answerIndex)
      await questions.submitAnswer()

      if (questionId) {
        answeredQuestions.push({ id: questionId, answer: answerIndex })
      }

      if (i < 2) {
        await questions.nextQuestion()
      }
    }

    // Check progress consistency
    await navigation.goToProgress()
    await progress.waitForProgressUpdate()

    const totalAnswered = await progress.getTotalQuestions()
    expect(totalAnswered).toBeGreaterThanOrEqual(3)

    // Verify data persists across page reload
    await page.reload()
    await navigation.goToProgress()
    await progress.waitForProgressUpdate()

    const persistedTotal = await progress.getTotalQuestions()
    expect(persistedTotal).toBe(totalAnswered)
  })

  test('should handle API error scenarios gracefully', async ({ page }) => {
    await navigation.goToPractice()

    // Intercept API calls and simulate errors
    await page.route('**/api/questions/**', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      })
    })

    // Try to load questions
    await page.reload()

    // Should show error handling UI
    await errorHandler.waitForErrorMessage()
    const errorMessage = await errorHandler.getErrorMessage()
    expect(errorMessage).toBeTruthy()

    // Should provide retry mechanism
    const retryButton = page.locator('[data-testid="retry-button"]')
    if (await retryButton.isVisible()) {
      // Restore normal API responses
      await page.unroute('**/api/questions/**')

      await retryButton.click()

      // Should work after retry
      await questions.waitForQuestionToLoad()
      expect(_questionText.length).toBeGreaterThan(0)
    }
  })

  test('should validate API response formats', async ({ page }) => {
    const apiResponses: any[] = []

    page.on('response', async (response) => {
      if (response.url().includes('/api/') && response.status() === 200) {
        try {
          const body = await response.json()
          apiResponses.push({
            url: response.url(),
            method: response.request().method(),
            body: body,
          })
        } catch {
          // Non-JSON response
        }
      }
    })

    // Load questions
    await navigation.goToPractice()
    await questions.waitForQuestionToLoad()

    // Verify question API response format
    const questionResponses = apiResponses.filter((r) =>
      r.url.includes('/questions'),
    )
    if (questionResponses.length > 0) {
      const questionData = questionResponses[0].body

      // Validate question structure
      expect(questionData).toHaveProperty('id')
      expect(questionData).toHaveProperty('text')
      expect(questionData).toHaveProperty('options')
      expect(Array.isArray(questionData.options)).toBe(true)
      expect(questionData.options.length).toBeGreaterThan(0)
    }

    // Submit answer and verify response
    await questions.selectAnswer(0)
    await questions.submitAnswer()

    // Wait for answer response
    await page.waitForTimeout(2000)

    const answerResponses = apiResponses.filter((r) =>
      r.url.includes('/answers'),
    )
    if (answerResponses.length > 0) {
      const answerData = answerResponses[0].body

      // Validate answer response structure
      expect(answerData).toHaveProperty('correct')
      expect(typeof answerData.correct).toBe('boolean')

      if (answerData.explanation) {
        expect(typeof answerData.explanation).toBe('string')
      }
    }
  })

  test('should handle concurrent API requests', async ({ page }) => {
    // Track concurrent requests
    const concurrentRequests = new Map<string, number>()

    page.on('request', (request) => {
      if (request.url().includes('/api/')) {
        const endpoint = new URL(request.url()).pathname
        concurrentRequests.set(
          endpoint,
          (concurrentRequests.get(endpoint) || 0) + 1,
        )
      }
    })

    // Rapidly navigate between pages to create concurrent requests
    await navigation.goToPractice()
    await navigation.goToProgress()
    await navigation.goToBookmarks()
    await navigation.goToPractice()

    // Wait for all requests to complete
    await page.waitForTimeout(3000)

    // Verify system handled concurrent requests
    await questions.waitForQuestionToLoad()
    expect(_questionText.length).toBeGreaterThan(0)
  })

  test('should sync bookmarks across frontend and backend', async ({
    page,
  }) => {
    // Create bookmark via frontend
    await navigation.goToPractice()
    await questions.waitForQuestionToLoad()

    await questions.bookmarkQuestion()

    // Verify bookmark API call was made
    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/bookmarks') &&
        (response.request().method() === 'POST' ||
          response.request().method() === 'PUT'),
    )

    // Navigate to bookmarks page
    await navigation.goToBookmarks()

    // Verify bookmark appears (frontend-backend sync)
    const bookmarkCount = await bookmarks.getBookmarkCount()
    expect(bookmarkCount).toBe(1)

    // Remove bookmark via frontend
    await bookmarks.removeBookmark(0)

    // Verify deletion API call
    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/bookmarks') &&
        response.request().method() === 'DELETE',
    )

    // Verify bookmark is removed
    await page.waitForTimeout(1000)
    const updatedBookmarkCount = await bookmarks.getBookmarkCount()
    expect(updatedBookmarkCount).toBe(0)
  })

  test('should handle database connection issues', async ({ page }) => {
    await navigation.goToPractice()

    // Simulate database connection error
    await page.route('**/api/**', (route) => {
      route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Service Unavailable - Database Connection Failed',
        }),
      })
    })

    await page.reload()

    // Should show appropriate error message
    await errorHandler.waitForErrorMessage()
    const errorMessage = await errorHandler.getErrorMessage()
    expect(errorMessage.toLowerCase()).toMatch(/error|unavailable|connection/i)

    // Restore normal responses
    await page.unroute('**/api/**')
  })

  test('should validate API performance benchmarks', async ({ page }) => {
    const apiTimings: { endpoint: string; duration: number }[] = []

    page.on('response', (response) => {
      if (response.url().includes('/api/')) {
        const timing = response.request().timing()
        if (timing) {
          apiTimings.push({
            endpoint: new URL(response.url()).pathname,
            duration: timing.responseEnd - timing.requestStart,
          })
        }
      }
    })

    // Perform operations and measure performance
    await navigation.goToPractice()
    await questions.waitForQuestionToLoad()

    await questions.selectAnswer(0)
    await questions.submitAnswer()

    await navigation.goToProgress()
    await progress.waitForProgressUpdate()

    // Wait for all API calls to complete
    await page.waitForTimeout(2000)

    // Verify API performance
    const questionApiTiming = apiTimings.find((t) =>
      t.endpoint.includes('/questions'),
    )
    if (questionApiTiming) {
      expect(questionApiTiming.duration).toBeLessThan(
        performanceBenchmarks.apiResponseTime.warning,
      )
    }

    const answerApiTiming = apiTimings.find((t) =>
      t.endpoint.includes('/answers'),
    )
    if (answerApiTiming) {
      expect(answerApiTiming.duration).toBeLessThan(
        performanceBenchmarks.apiResponseTime.warning,
      )
    }
  })

  test('should handle data validation errors', async ({ page }) => {
    await navigation.goToPractice()
    await questions.waitForQuestionToLoad()

    // Intercept answer submission with invalid data
    await page.route('**/api/answers', (route) => {
      const request = route.request()
      if (request.method() === 'POST') {
        route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Validation Error',
            details: 'Invalid answer format',
          }),
        })
      } else {
        route.continue()
      }
    })

    // Try to submit answer
    await questions.selectAnswer(0)
    await questions.submitAnswer()

    // Should handle validation error gracefully
    await errorHandler.waitForErrorMessage()
    const errorMessage = await errorHandler.getErrorMessage()
    expect(errorMessage.toLowerCase()).toMatch(/error|invalid|validation/i)

    // Restore normal API
    await page.unroute('**/api/answers')
  })

  test('should maintain session state across system interactions', async ({
    page,
  }) => {
    // Create session state through various interactions
    await navigation.goToPractice()

    // Answer some questions
    for (let i = 0; i < 3; i++) {
      await questions.waitForQuestionToLoad()
      await questions.selectAnswer(i % 4)
      await questions.submitAnswer()

      if (i < 2) {
        await questions.nextQuestion()
      }
    }

    // Create bookmark
    await questions.bookmarkQuestion()

    // Get initial state
    await navigation.goToProgress()
    await progress.waitForProgressUpdate()
    const initialProgress = await progress.getTotalQuestions()

    await navigation.goToBookmarks()
    const initialBookmarks = await bookmarks.getBookmarkCount()

    // Simulate session interruption and recovery
    await page.context().clearCookies()
    await page.reload()

    // Verify state is maintained (assuming localStorage/persistence)
    await navigation.goToProgress()
    await progress.waitForProgressUpdate()
    const restoredProgress = await progress.getTotalQuestions()

    await navigation.goToBookmarks()
    const restoredBookmarks = await bookmarks.getBookmarkCount()

    // State should be preserved through backend persistence
    expect(restoredProgress).toBeGreaterThanOrEqual(initialProgress)
    expect(restoredBookmarks).toBeGreaterThanOrEqual(initialBookmarks)
  })
})
