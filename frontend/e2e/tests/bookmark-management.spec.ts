import { test, expect } from '@playwright/test'
import {
  NavigationHelpers,
  QuestionHelpers,
  BookmarkHelpers,
  DataHelpers,
} from '../utils/test-helpers'

/**
 * E2E Tests for Bookmark Management
 *
 * These tests validate the bookmark functionality including:
 * - User bookmarking questions during practice
 * - Navigation to bookmarks page
 * - Bookmark list display and organization
 * - Bookmark removal functionality
 * - Bookmark persistence across sessions
 */

test.describe('Bookmark Management E2E Tests', () => {
  let navigation: NavigationHelpers
  let questions: QuestionHelpers
  let bookmarks: BookmarkHelpers

  test.beforeEach(async ({ page }) => {
    navigation = new NavigationHelpers(page)
    questions = new QuestionHelpers(page)
    bookmarks = new BookmarkHelpers(page)
  })

  test('should bookmark questions during practice session', async ({
    page,
  }) => {
    await navigation.goToPractice()
    await questions.waitForQuestionToLoad()

    // Get initial question text
    const questionText = await questions.getQuestionText()

    // Bookmark the question
    await questions.bookmarkQuestion()

    // Verify bookmark button state changes
    const bookmarkButton = page.locator('[data-testid="bookmark-button"]')
    await expect(bookmarkButton).toHaveAttribute('aria-pressed', 'true')

    // Navigate to bookmarks page
    await navigation.goToBookmarks()

    // Verify the question appears in bookmarks
    const bookmarkItems = page.locator('[data-testid="bookmark-item"]')
    await expect(bookmarkItems).toHaveCount(1)

    // Verify the bookmarked question text
    const bookmarkedText = await page.textContent(
      '[data-testid="bookmark-item-0"] [data-testid="question-text"]',
    )
    expect(bookmarkedText).toContain(questionText.substring(0, 50)) // Check first 50 chars
  })

  test('should manage multiple bookmarks', async ({ page }) => {
    const scenario = testScenarios.bookmarkManagement

    await navigation.goToPractice()

    const bookmarkedQuestions: string[] = []

    // Bookmark multiple questions
    for (let i = 0; i < scenario.questionsToBookmark; i++) {
      await questions.waitForQuestionToLoad()

      const questionText = await questions.getQuestionText()
      bookmarkedQuestions.push(questionText)

      // Bookmark the question
      await questions.bookmarkQuestion()

      // Verify bookmark button is active
      const bookmarkButton = page.locator('[data-testid="bookmark-button"]')
      await expect(bookmarkButton).toHaveAttribute('aria-pressed', 'true')

      // Move to next question
      if (i < scenario.questionsToBookmark - 1) {
        await questions.nextQuestion()
      }
    }

    // Navigate to bookmarks page
    await navigation.goToBookmarks()

    // Verify all bookmarks are present
    const bookmarkCount = await bookmarks.getBookmarkCount()
    expect(bookmarkCount).toBe(scenario.questionsToBookmark)

    // Verify bookmark content
    for (let i = 0; i < scenario.questionsToBookmark; i++) {
      const bookmarkItem = page.locator(`[data-testid="bookmark-item-${i}"]`)
      await expect(bookmarkItem).toBeVisible()

      const bookmarkText = await page.textContent(
        `[data-testid="bookmark-item-${i}"] [data-testid="question-text"]`,
      )
      const originalQuestion = bookmarkedQuestions[i]
      expect(bookmarkText).toContain(originalQuestion.substring(0, 50))
    }
  })

  test('should remove bookmarks successfully', async ({ page }) => {
    // First, create some bookmarks
    await navigation.goToPractice()

    // Bookmark 3 questions
    for (let i = 0; i < 3; i++) {
      await questions.waitForQuestionToLoad()
      await questions.bookmarkQuestion()

      if (i < 2) {
        await questions.nextQuestion()
      }
    }

    // Navigate to bookmarks page
    await navigation.goToBookmarks()

    // Verify we have 3 bookmarks
    let bookmarkCount = await bookmarks.getBookmarkCount()
    expect(bookmarkCount).toBe(3)

    // Remove the middle bookmark
    await bookmarks.removeBookmark(1)

    // Wait for update
    await page.waitForTimeout(1000)

    // Verify bookmark count decreased
    bookmarkCount = await bookmarks.getBookmarkCount()
    expect(bookmarkCount).toBe(2)

    // Remove all remaining bookmarks
    await bookmarks.removeBookmark(0)
    await bookmarks.removeBookmark(0) // Index shifts after removal

    // Wait for update
    await page.waitForTimeout(1000)

    // Verify no bookmarks remain
    bookmarkCount = await bookmarks.getBookmarkCount()
    expect(bookmarkCount).toBe(0)

    // Verify empty state is shown
    const emptyState = page.locator('[data-testid="bookmarks-empty"]')
    await expect(emptyState).toBeVisible()
  })

  test('should navigate to bookmarked questions', async ({ page }) => {
    // Create a bookmark first
    await navigation.goToPractice()
    await questions.waitForQuestionToLoad()

    const originalQuestionText = await questions.getQuestionText()
    await questions.bookmarkQuestion()

    // Navigate to bookmarks page
    await navigation.goToBookmarks()

    // Click on the bookmarked question
    await bookmarks.clickBookmark(0)

    // Should navigate back to practice page with the bookmarked question
    await expect(page.locator('[data-testid="practice-page"]')).toBeVisible()
    await questions.waitForQuestionToLoad()

    // Verify we're on the correct question
    const currentQuestionText = await questions.getQuestionText()
    expect(currentQuestionText).toBe(originalQuestionText)

    // Verify bookmark button is still active
    const bookmarkButton = page.locator('[data-testid="bookmark-button"]')
    await expect(bookmarkButton).toHaveAttribute('aria-pressed', 'true')
  })

  test('should persist bookmarks across sessions', async ({ page }) => {
    // Create bookmarks
    await navigation.goToPractice()

    const bookmarkedQuestions: string[] = []

    for (let i = 0; i < 2; i++) {
      await questions.waitForQuestionToLoad()
      const questionText = await questions.getQuestionText()
      bookmarkedQuestions.push(questionText)

      await questions.bookmarkQuestion()

      if (i < 1) {
        await questions.nextQuestion()
      }
    }

    // Navigate to bookmarks and verify
    await navigation.goToBookmarks()
    let bookmarkCount = await bookmarks.getBookmarkCount()
    expect(bookmarkCount).toBe(2)

    // Reload the page to simulate session restart
    await page.reload()
    await navigation.goToBookmarks()

    // Verify bookmarks are still present
    bookmarkCount = await bookmarks.getBookmarkCount()
    expect(bookmarkCount).toBe(2)

    // Verify bookmark content is preserved
    for (let i = 0; i < 2; i++) {
      const bookmarkText = await page.textContent(
        `[data-testid="bookmark-item-${i}"] [data-testid="question-text"]`,
      )
      const originalQuestion = bookmarkedQuestions[i]
      expect(bookmarkText).toContain(originalQuestion.substring(0, 50))
    }
  })

  test('should toggle bookmark status correctly', async ({ page }) => {
    await navigation.goToPractice()
    await questions.waitForQuestionToLoad()

    const bookmarkButton = page.locator('[data-testid="bookmark-button"]')

    // Initially not bookmarked
    await expect(bookmarkButton).toHaveAttribute('aria-pressed', 'false')

    // Bookmark the question
    await questions.bookmarkQuestion()
    await expect(bookmarkButton).toHaveAttribute('aria-pressed', 'true')

    // Verify it appears in bookmarks list
    await navigation.goToBookmarks()
    let bookmarkCount = await bookmarks.getBookmarkCount()
    expect(bookmarkCount).toBe(1)

    // Go back and unbookmark
    await navigation.goToPractice()
    await questions.waitForQuestionToLoad()

    // Should still be bookmarked
    await expect(bookmarkButton).toHaveAttribute('aria-pressed', 'true')

    // Toggle bookmark off
    await questions.bookmarkQuestion()
    await expect(bookmarkButton).toHaveAttribute('aria-pressed', 'false')

    // Verify it's removed from bookmarks list
    await navigation.goToBookmarks()
    bookmarkCount = await bookmarks.getBookmarkCount()
    expect(bookmarkCount).toBe(0)

    // Verify empty state
    const emptyState = page.locator('[data-testid="bookmarks-empty"]')
    await expect(emptyState).toBeVisible()
  })

  test('should display bookmark metadata correctly', async ({ page }) => {
    await navigation.goToPractice()
    await questions.waitForQuestionToLoad()

    // Bookmark a question
    await questions.bookmarkQuestion()

    // Navigate to bookmarks
    await navigation.goToBookmarks()

    // Verify bookmark item contains required metadata
    const bookmarkItem = page.locator('[data-testid="bookmark-item-0"]')
    await expect(bookmarkItem).toBeVisible()

    // Check for question text
    const questionText = page.locator(
      '[data-testid="bookmark-item-0"] [data-testid="question-text"]',
    )
    await expect(questionText).toBeVisible()

    // Check for category (if displayed)
    const categoryText = page.locator(
      '[data-testid="bookmark-item-0"] [data-testid="question-category"]',
    )
    if (await categoryText.isVisible()) {
      const category = await categoryText.textContent()
      expect(category).toBeTruthy()
    }

    // Check for bookmark date
    const dateText = page.locator(
      '[data-testid="bookmark-item-0"] [data-testid="bookmark-date"]',
    )
    if (await dateText.isVisible()) {
      const date = await dateText.textContent()
      expect(date).toBeTruthy()
    }
  })

  test('should handle bookmark operations during answer submission', async ({
    page,
  }) => {
    await navigation.goToPractice()
    await questions.waitForQuestionToLoad()

    // Select an answer
    await questions.selectAnswer(0)

    // Bookmark the question
    await questions.bookmarkQuestion()

    // Submit the answer
    await questions.submitAnswer()

    // Wait for result
    await page.waitForSelector('[data-testid="answer-result"]')

    // Verify bookmark is still active after submission
    const bookmarkButton = page.locator('[data-testid="bookmark-button"]')
    await expect(bookmarkButton).toHaveAttribute('aria-pressed', 'true')

    // Navigate to bookmarks and verify
    await navigation.goToBookmarks()
    const bookmarkCount = await bookmarks.getBookmarkCount()
    expect(bookmarkCount).toBe(1)
  })

  test('should handle empty bookmarks list gracefully', async ({ page }) => {
    await navigation.goToBookmarks()

    // Verify empty state is displayed
    const emptyState = page.locator('[data-testid="bookmarks-empty"]')
    await expect(emptyState).toBeVisible()

    // Verify no bookmark items are present
    const bookmarkItems = page.locator('[data-testid="bookmark-item"]')
    await expect(bookmarkItems).toHaveCount(0)

    // Verify helpful message or call-to-action is present
    const emptyMessage = page.locator('[data-testid="bookmarks-empty-message"]')
    if (await emptyMessage.isVisible()) {
      const message = await emptyMessage.textContent()
      expect(message).toBeTruthy()
    }
  })
})
