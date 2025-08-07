import { Page, expect } from '@playwright/test'

/**
 * Test helper utilities for E2E tests
 *
 * This module provides reusable functions for common test operations
 * across the ExamPreparationSystem E2E test suite.
 */

/**
 * Navigation helpers
 */
export class NavigationHelpers {
  constructor(private page: Page) {}

  async goToHome() {
    await this.page.goto('/')
    await this.page.waitForSelector('[data-testid="home-page"]')
  }

  async goToPractice() {
    await this.page.goto('/practice')
    await this.page.waitForSelector('[data-testid="practice-page"]')
  }

  async goToProgress() {
    await this.page.goto('/progress')
    await this.page.waitForSelector('[data-testid="progress-page"]')
  }

  async goToBookmarks() {
    await this.page.goto('/bookmarks')
    await this.page.waitForSelector('[data-testid="bookmarks-page"]')
  }

  async goToReview() {
    await this.page.goto('/review')
    await this.page.waitForSelector('[data-testid="review-page"]')
  }

  async goToSettings() {
    await this.page.goto('/settings')
    await this.page.waitForSelector('[data-testid="settings-page"]')
  }
}

/**
 * Question interaction helpers
 */
export class QuestionHelpers {
  constructor(private page: Page) {}

  async waitForQuestionToLoad() {
    await this.page.waitForSelector('[data-testid="question-card"]')
    await this.page.waitForSelector('[data-testid="question-text"]')
  }

  async selectAnswer(answerIndex: number) {
    const answerSelector = `[data-testid="answer-option-${answerIndex}"]`
    await this.page.waitForSelector(answerSelector)
    await this.page.click(answerSelector)
  }

  async submitAnswer() {
    await this.page.click('[data-testid="submit-answer"]')
  }

  async nextQuestion() {
    await this.page.click('[data-testid="next-question"]')
  }

  async previousQuestion() {
    await this.page.click('[data-testid="previous-question"]')
  }

  async bookmarkQuestion() {
    await this.page.click('[data-testid="bookmark-button"]')
  }

  async getQuestionText(): Promise<string> {
    return (await this.page.textContent('[data-testid="question-text"]')) || ''
  }

  async getSelectedAnswer(): Promise<string | null> {
    const selectedOption = this.page.locator(
      '[data-testid^="answer-option-"][aria-pressed="true"]',
    )
    return await selectedOption.textContent()
  }

  async isAnswerCorrect(): Promise<boolean> {
    const resultElement = this.page.locator('[data-testid="answer-result"]')
    const result = await resultElement.getAttribute('data-correct')
    return result === 'true'
  }
}

/**
 * Progress tracking helpers
 */
export class ProgressHelpers {
  constructor(private page: Page) {}

  async getProgressPercentage(): Promise<number> {
    const progressElement = this.page.locator(
      '[data-testid="progress-percentage"]',
    )
    const progressText = await progressElement.textContent()
    return parseInt(progressText?.replace('%', '') || '0')
  }

  async getCorrectAnswers(): Promise<number> {
    const correctElement = this.page.locator('[data-testid="correct-answers"]')
    const correctText = await correctElement.textContent()
    return parseInt(correctText || '0')
  }

  async getTotalQuestions(): Promise<number> {
    const totalElement = this.page.locator('[data-testid="total-questions"]')
    const totalText = await totalElement.textContent()
    return parseInt(totalText || '0')
  }

  async waitForProgressUpdate() {
    // Wait for progress indicators to update
    await this.page.waitForTimeout(1000)
  }
}

/**
 * Bookmark helpers
 */
export class BookmarkHelpers {
  constructor(private page: Page) {}

  async getBookmarkCount(): Promise<number> {
    const bookmarks = this.page.locator('[data-testid="bookmark-item"]')
    return await bookmarks.count()
  }

  async removeBookmark(index: number) {
    const removeButton = this.page.locator(
      `[data-testid="remove-bookmark-${index}"]`,
    )
    await removeButton.click()
  }

  async clickBookmark(index: number) {
    const bookmarkItem = this.page.locator(
      `[data-testid="bookmark-item-${index}"]`,
    )
    await bookmarkItem.click()
  }
}

/**
 * Performance helpers
 */
export class PerformanceHelpers {
  constructor(private page: Page) {}

  async measurePageLoadTime(): Promise<number> {
    const startTime = Date.now()
    await this.page.waitForLoadState('networkidle')
    const endTime = Date.now()
    return endTime - startTime
  }

  async measureApiResponse(apiPath: string): Promise<number> {
    const startTime = Date.now()
    const _response = await this.page.waitForResponse(
      (response) =>
        response.url().includes(apiPath) && response.status() === 200,
    )
    const endTime = Date.now()
    return endTime - startTime
  }

  async checkResourceLoading() {
    // Check for failed resources
    const failedRequests: string[] = []

    this.page.on('response', (response) => {
      if (response.status() >= 400) {
        failedRequests.push(`${response.status()}: ${response.url()}`)
      }
    })

    return failedRequests
  }
}

/**
 * Mobile helpers
 */
export class MobileHelpers {
  constructor(private page: Page) {}

  async swipeLeft() {
    const viewport = this.page.viewportSize()
    if (!viewport) return

    await this.page.touchscreen.tap(viewport.width * 0.8, viewport.height * 0.5)
    await this.page.touchscreen.tap(viewport.width * 0.2, viewport.height * 0.5)
  }

  async swipeRight() {
    const viewport = this.page.viewportSize()
    if (!viewport) return

    await this.page.touchscreen.tap(viewport.width * 0.2, viewport.height * 0.5)
    await this.page.touchscreen.tap(viewport.width * 0.8, viewport.height * 0.5)
  }

  async waitForMobileLayout() {
    await this.page.waitForSelector('[data-testid="mobile-layout"]')
  }
}

/**
 * Accessibility helpers
 */
export class AccessibilityHelpers {
  constructor(private page: Page) {}

  async checkKeyboardNavigation() {
    // Test tab navigation
    await this.page.keyboard.press('Tab')
    const focusedElement = await this.page.locator(':focus')
    return focusedElement.isVisible()
  }

  async checkAriaLabels() {
    const elementsWithoutAria = await this.page.locator(
      'button:not([aria-label]):not([aria-labelledby])',
    )
    const count = await elementsWithoutAria.count()
    return count === 0
  }

  async checkColorContrast() {
    // This would typically integrate with axe-core or similar tool
    // For now, we'll do a basic check
    return true // Placeholder
  }
}

/**
 * Error handling helpers
 */
export class ErrorHelpers {
  constructor(private page: Page) {}

  async waitForErrorMessage() {
    await this.page.waitForSelector('[data-testid="error-message"]')
  }

  async getErrorMessage(): Promise<string> {
    const errorElement = this.page.locator('[data-testid="error-message"]')
    return (await errorElement.textContent()) || ''
  }

  async dismissError() {
    const dismissButton = this.page.locator('[data-testid="dismiss-error"]')
    if (await dismissButton.isVisible()) {
      await dismissButton.click()
    }
  }

  async simulateNetworkError() {
    await this.page.route('**/api/**', (route) => {
      route.abort('failed')
    })
  }

  async restoreNetwork() {
    await this.page.unroute('**/api/**')
  }
}

/**
 * Data validation helpers
 */
export class DataHelpers {
  constructor(private page: Page) {}

  async validateQuestionData() {
    const questionText = await this.page.textContent(
      '[data-testid="question-text"]',
    )
    const answerOptions = await this.page
      .locator('[data-testid^="answer-option-"]')
      .count()

    expect(questionText).toBeTruthy()
    expect(answerOptions).toBeGreaterThan(0)
  }

  async validateProgressData() {
    const progress = await this.page.textContent(
      '[data-testid="progress-percentage"]',
    )
    const correct = await this.page.textContent(
      '[data-testid="correct-answers"]',
    )
    const total = await this.page.textContent('[data-testid="total-questions"]')

    expect(progress).toMatch(/\d+%/)
    expect(correct).toMatch(/\d+/)
    expect(total).toMatch(/\d+/)
  }
}
