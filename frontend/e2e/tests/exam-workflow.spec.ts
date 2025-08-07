import { test, expect } from '@playwright/test'
import {
  NavigationHelpers,
  QuestionHelpers,
  ProgressHelpers,
  PerformanceHelpers,
  DataHelpers,
} from '../utils/test-helpers'
import {
  _testQuestions,
  performanceBenchmarks,
  testScenarios,
} from '../fixtures/test-data'

/**
 * E2E Tests for Complete Exam Workflow
 *
 * These tests validate the core exam-taking functionality including:
 * - Question loading and display
 * - Answer selection and submission
 * - Progress tracking through exam session
 * - Results display and scoring
 * - Session completion and data persistence
 */

test.describe('Exam Workflow E2E Tests', () => {
  let navigation: NavigationHelpers
  let questions: QuestionHelpers
  let progress: ProgressHelpers
  let performance: PerformanceHelpers
  let dataValidation: DataHelpers

  test.beforeEach(async ({ page }) => {
    navigation = new NavigationHelpers(page)
    questions = new QuestionHelpers(page)
    progress = new ProgressHelpers(page)
    performance = new PerformanceHelpers(page)
    dataValidation = new DataHelpers(page)

    // Navigate to practice page before each test
    await navigation.goToPractice()
  })

  test('should load practice page and display first question', async ({
    page,
  }) => {
    // Verify practice page loads within performance target
    const loadTime = await performance.measurePageLoadTime()
    expect(loadTime).toBeLessThan(performanceBenchmarks.pageLoadTime.target)

    // Verify page elements are present
    await expect(page.locator('[data-testid="practice-page"]')).toBeVisible()
    await expect(page.locator('[data-testid="question-card"]')).toBeVisible()

    // Wait for question to load
    await questions.waitForQuestionToLoad()

    // Validate question data
    await dataValidation.validateQuestionData()

    // Verify question text is not empty
    const questionText = await questions.getQuestionText()
    expect(questionText.length).toBeGreaterThan(0)

    // Verify answer options are present
    const answerOptions = page.locator('[data-testid^="answer-option-"]')
    await expect(answerOptions).toHaveCount(4) // Expecting 4 options
  })

  test('should allow answer selection and submission', async ({ page }) => {
    await questions.waitForQuestionToLoad()

    // Select first answer option
    await questions.selectAnswer(0)

    // Verify answer is selected
    const selectedAnswer = await questions.getSelectedAnswer()
    expect(selectedAnswer).toBeTruthy()

    // Submit answer
    await questions.submitAnswer()

    // Wait for result to be displayed
    await page.waitForSelector('[data-testid="answer-result"]')

    // Verify result is shown
    const resultElement = page.locator('[data-testid="answer-result"]')
    await expect(resultElement).toBeVisible()
  })

  test('should track progress through multiple questions', async ({ page }) => {
    const scenario = testScenarios.completePracticeSession

    for (let i = 0; i < scenario.questionsToAnswer; i++) {
      // Wait for question to load
      await questions.waitForQuestionToLoad()

      // Select and submit answer
      await questions.selectAnswer(1) // Select second option
      await questions.submitAnswer()

      // Wait for result
      await page.waitForSelector('[data-testid="answer-result"]')

      // Move to next question (except for last question)
      if (i < scenario.questionsToAnswer - 1) {
        await questions.nextQuestion()
      }

      // Verify progress is updated
      await progress.waitForProgressUpdate()
    }

    // Verify final progress
    const finalProgress = await progress.getProgressPercentage()
    expect(finalProgress).toBeGreaterThan(0)

    const totalAnswered = await progress.getTotalQuestions()
    expect(totalAnswered).toBeGreaterThanOrEqual(scenario.questionsToAnswer)
  })

  test('should handle question navigation correctly', async ({
    page: _page,
  }) => {
    await questions.waitForQuestionToLoad()

    // Get initial question text
    const firstQuestionText = await questions.getQuestionText()

    // Answer first question
    await questions.selectAnswer(0)
    await questions.submitAnswer()

    // Navigate to next question
    await questions.nextQuestion()
    await questions.waitForQuestionToLoad()

    // Verify we're on a different question
    const secondQuestionText = await questions.getQuestionText()
    expect(secondQuestionText).not.toBe(firstQuestionText)

    // Navigate back to previous question
    await questions.previousQuestion()
    await questions.waitForQuestionToLoad()

    // Verify we're back to the first question
    const backToFirstQuestion = await questions.getQuestionText()
    expect(backToFirstQuestion).toBe(firstQuestionText)

    // Verify the answer is still selected
    const selectedAnswer = await questions.getSelectedAnswer()
    expect(selectedAnswer).toBeTruthy()
  })

  test('should display correct feedback for answers', async ({ page }) => {
    await questions.waitForQuestionToLoad()

    // Select an answer and submit
    await questions.selectAnswer(1)
    await questions.submitAnswer()

    // Wait for feedback
    await page.waitForSelector('[data-testid="answer-result"]')

    // Verify feedback elements are present
    await expect(page.locator('[data-testid="answer-result"]')).toBeVisible()
    await expect(page.locator('[data-testid="correct-answer"]')).toBeVisible()
    await expect(page.locator('[data-testid="explanation"]')).toBeVisible()

    // Verify explanation text is present
    const explanation = await page.textContent('[data-testid="explanation"]')
    expect(explanation).toBeTruthy()
    expect(explanation!.length).toBeGreaterThan(0)
  })

  test('should persist session data across page reloads', async ({ page }) => {
    await questions.waitForQuestionToLoad()

    // Answer a few questions
    for (let i = 0; i < 3; i++) {
      await questions.selectAnswer(i % 4)
      await questions.submitAnswer()

      if (i < 2) {
        await questions.nextQuestion()
        await questions.waitForQuestionToLoad()
      }
    }

    // Get progress before reload
    const progressBefore = await progress.getProgressPercentage()
    const correctBefore = await progress.getCorrectAnswers()

    // Reload the page
    await page.reload()
    await navigation.goToPractice()

    // Wait for data to load
    await progress.waitForProgressUpdate()

    // Verify progress is maintained
    const progressAfter = await progress.getProgressPercentage()
    const correctAfter = await progress.getCorrectAnswers()

    expect(progressAfter).toBe(progressBefore)
    expect(correctAfter).toBe(correctBefore)
  })

  test('should handle rapid answer submissions', async ({ page }) => {
    await questions.waitForQuestionToLoad()

    // Rapidly select and submit answers
    for (let i = 0; i < 5; i++) {
      await questions.selectAnswer(i % 4)
      await questions.submitAnswer()

      // Wait for result briefly
      await page.waitForSelector('[data-testid="answer-result"]', {
        timeout: 5000,
      })

      // Move to next question immediately
      if (i < 4) {
        await questions.nextQuestion()
        await questions.waitForQuestionToLoad()
      }
    }

    // Verify all answers were recorded
    const totalAnswered = await progress.getTotalQuestions()
    expect(totalAnswered).toBeGreaterThanOrEqual(5)
  })

  test('should validate API response performance', async ({ page: _page }) => {
    // Measure API response time for loading questions
    const questionApiTime =
      await performance.measureApiResponse('/api/questions')
    expect(questionApiTime).toBeLessThan(
      performanceBenchmarks.apiResponseTime.target,
    )

    await questions.waitForQuestionToLoad()

    // Select and submit answer, measure submission API time
    await questions.selectAnswer(0)

    const submissionApiTime =
      await performance.measureApiResponse('/api/answers')
    await questions.submitAnswer()

    expect(submissionApiTime).toBeLessThan(
      performanceBenchmarks.apiResponseTime.target,
    )
  })

  test('should complete full exam session successfully', async ({ page }) => {
    const scenario = testScenarios.completePracticeSession

    // Complete a full session
    for (let i = 0; i < scenario.questionsToAnswer; i++) {
      await questions.waitForQuestionToLoad()

      // Select answer (alternate between options for variety)
      const answerIndex = i % 4
      await questions.selectAnswer(answerIndex)
      await questions.submitAnswer()

      // Check if answer was correct
      await page.waitForSelector('[data-testid="answer-result"]')
      const isCorrect = await questions.isAnswerCorrect()

      // Navigate to next question
      if (i < scenario.questionsToAnswer - 1) {
        await questions.nextQuestion()
      }
    }

    // Verify session completion
    const finalCorrect = await progress.getCorrectAnswers()
    const finalTotal = await progress.getTotalQuestions()

    expect(finalTotal).toBeGreaterThanOrEqual(scenario.questionsToAnswer)
    expect(finalCorrect).toBeGreaterThanOrEqual(0)

    // Verify progress percentage is calculated correctly
    const progressPercentage = await progress.getProgressPercentage()
    const expectedProgress = Math.round((finalCorrect / finalTotal) * 100)
    expect(Math.abs(progressPercentage - expectedProgress)).toBeLessThanOrEqual(
      1,
    )
  })
})
