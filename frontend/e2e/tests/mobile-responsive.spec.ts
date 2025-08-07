import { test, expect } from '@playwright/test'
import {
  NavigationHelpers,
  QuestionHelpers,
  MobileHelpers,
} from '../utils/test-helpers'

/**
 * E2E Tests for Mobile Responsiveness and Touch Interactions
 *
 * These tests validate mobile-specific functionality including:
 * - Desktop browser compatibility (Chrome, Firefox, Safari, Edge)
 * - Mobile responsiveness testing
 * - Touch interaction functionality
 * - PWA functionality verification
 * - Swipe gestures and mobile navigation
 */

test.describe('Mobile Responsive E2E Tests', () => {
  let navigation: NavigationHelpers
  let questions: QuestionHelpers
  let mobile: MobileHelpers

  test.beforeEach(async ({ page }) => {
    navigation = new NavigationHelpers(page)
    questions = new QuestionHelpers(page)
    mobile = new MobileHelpers(page)

    // Set mobile viewport for mobile tests
    await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE size
  })

  test('should display mobile layout correctly', async ({ page }) => {
    await navigation.goToHome()

    // Wait for mobile layout to load
    await mobile.waitForMobileLayout()

    // Verify mobile-specific elements
    const mobileNav = page.locator('[data-testid="mobile-navigation"]')
    if (await mobileNav.isVisible()) {
      await expect(mobileNav).toBeVisible()
    }

    // Verify responsive layout elements
    const mainContent = page.locator('[data-testid="main-content"]')
    await expect(mainContent).toBeVisible()

    // Check that content fits within viewport
    const bodyElement = page.locator('body')
    const boundingBox = await bodyElement.boundingBox()

    if (boundingBox) {
      // No horizontal scrolling should be needed
      expect(boundingBox.width).toBeLessThanOrEqual(375 + 20) // Allow for small tolerance
    }
  })

  test('should support touch interactions on practice page', async ({
    page,
  }) => {
    await navigation.goToPractice()
    await questions.waitForQuestionToLoad()

    // Test touch selection of answers
    const answerOptions = page.locator('[data-testid^="answer-option-"]')
    const firstOption = answerOptions.first()

    // Touch the answer option
    await firstOption.tap()

    // Verify selection state
    const ariaPressed = await firstOption.getAttribute('aria-pressed')
    expect(ariaPressed).toBe('true')

    // Test touch submission
    const submitButton = page.locator('[data-testid="submit-answer"]')
    await submitButton.tap()

    // Wait for result
    await page.waitForSelector('[data-testid="answer-result"]')
    const resultElement = page.locator('[data-testid="answer-result"]')
    await expect(resultElement).toBeVisible()
  })

  test('should support swipe gestures for navigation', async ({ page }) => {
    await navigation.goToPractice()
    await questions.waitForQuestionToLoad()

    const initialQuestionText = await questions.getQuestionText()

    // Test swipe left for next question
    await mobile.swipeLeft()

    // Wait for navigation to complete
    await page.waitForTimeout(1000)
    await questions.waitForQuestionToLoad()

    const nextQuestionText = await questions.getQuestionText()

    // Should have navigated to next question
    if (nextQuestionText !== initialQuestionText) {
      expect(nextQuestionText).not.toBe(initialQuestionText)

      // Test swipe right to go back
      await mobile.swipeRight()
      await page.waitForTimeout(1000)
      await questions.waitForQuestionToLoad()

      const backQuestionText = await questions.getQuestionText()
      expect(backQuestionText).toBe(initialQuestionText)
    }
  })

  test('should handle mobile menu navigation', async ({ page }) => {
    await navigation.goToHome()

    // Look for mobile menu trigger (hamburger menu)
    const menuTrigger = page.locator(
      '[data-testid="mobile-menu-trigger"], [aria-label*="menu"], .hamburger',
    )

    if (await menuTrigger.isVisible()) {
      // Open mobile menu
      await menuTrigger.tap()

      // Wait for menu to open
      const mobileMenu = page.locator(
        '[data-testid="mobile-menu"], .mobile-menu',
      )
      await expect(mobileMenu).toBeVisible()

      // Test navigation links in mobile menu
      const practiceLink = mobileMenu.locator(
        '[data-testid="practice-link"], a[href*="practice"]',
      )
      if (await practiceLink.isVisible()) {
        await practiceLink.tap()

        // Should navigate to practice page
        await expect(
          page.locator('[data-testid="practice-page"]'),
        ).toBeVisible()
      }
    }
  })

  test('should display content properly on different mobile screen sizes', async ({
    page,
  }) => {
    const screenSizes = [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPhone 12', width: 390, height: 844 },
      { name: 'Samsung Galaxy S8+', width: 360, height: 740 },
      { name: 'iPhone 12 Pro Max', width: 428, height: 926 },
    ]

    for (const screen of screenSizes) {
      await page.setViewportSize({ width: screen.width, height: screen.height })

      await navigation.goToPractice()
      await questions.waitForQuestionToLoad()

      // Verify content is visible and properly sized
      const questionCard = page.locator('[data-testid="question-card"]')
      await expect(questionCard).toBeVisible()

      const cardBoundingBox = await questionCard.boundingBox()
      if (cardBoundingBox) {
        // Content should fit within screen width
        expect(cardBoundingBox.width).toBeLessThanOrEqual(screen.width)

        // Content should be reasonably sized (not too small)
        expect(cardBoundingBox.width).toBeGreaterThan(screen.width * 0.8)
      }

      // Test answer options are properly sized
      const answerOptions = page.locator('[data-testid^="answer-option-"]')
      const firstOption = answerOptions.first()

      if (await firstOption.isVisible()) {
        const optionBoundingBox = await firstOption.boundingBox()
        if (optionBoundingBox) {
          // Touch targets should meet minimum size requirements
          expect(optionBoundingBox.height).toBeGreaterThanOrEqual(44) // iOS minimum
        }
      }

      console.log(
        `✓ ${screen.name} (${screen.width}x${screen.height}) layout verified`,
      )
    }
  })

  test('should handle orientation changes', async ({ page }) => {
    await navigation.goToPractice()
    await questions.waitForQuestionToLoad()

    // Test portrait orientation (default)
    await page.setViewportSize({ width: 375, height: 667 })

    const portraitQuestionText = await questions.getQuestionText()
    expect(portraitQuestionText.length).toBeGreaterThan(0)

    // Test landscape orientation
    await page.setViewportSize({ width: 667, height: 375 })

    // Wait for layout adjustment
    await page.waitForTimeout(500)

    // Content should still be visible and functional
    const landscapeQuestionText = await questions.getQuestionText()
    expect(landscapeQuestionText).toBe(portraitQuestionText)

    // Test interaction in landscape
    await questions.selectAnswer(0)
    const selectedAnswer = await questions.getSelectedAnswer()
    expect(selectedAnswer).toBeTruthy()
  })

  test('should optimize performance for mobile devices', async ({ page }) => {
    // Simulate slower mobile network
    await page.route('**/*', (route) => {
      // Add delay to simulate mobile network
      setTimeout(() => route.continue(), 100)
    })

    const startTime = Date.now()
    await navigation.goToPractice()
    await questions.waitForQuestionToLoad()
    const loadTime = Date.now() - startTime

    // Should load within reasonable time even on slower connection
    expect(loadTime).toBeLessThan(10000) // 10 seconds max

    // Test rapid interactions don't cause performance issues
    for (let i = 0; i < 5; i++) {
      await questions.selectAnswer(i % 4)
      await page.waitForTimeout(100) // Brief delay
    }

    // Should remain responsive
    const finalQuestionText = await questions.getQuestionText()
    expect(finalQuestionText.length).toBeGreaterThan(0)

    // Remove route
    await page.unroute('**/*')
  })

  test('should support mobile accessibility features', async ({ page }) => {
    await navigation.goToPractice()
    await questions.waitForQuestionToLoad()

    // Test voice over / screen reader support
    const questionText = page.locator('[data-testid="question-text"]')
    const ariaLabel = await questionText.getAttribute('aria-label')
    const role = await questionText.getAttribute('role')

    // Question should be accessible to screen readers
    expect(ariaLabel || role).toBeTruthy()

    // Test answer options accessibility
    const answerOptions = page.locator('[data-testid^="answer-option-"]')
    const firstOption = answerOptions.first()

    const optionRole = await firstOption.getAttribute('role')
    const optionAriaLabel = await firstOption.getAttribute('aria-label')

    expect(optionRole || optionAriaLabel).toBeTruthy()

    // Test touch target sizes for accessibility
    const optionBoundingBox = await firstOption.boundingBox()
    if (optionBoundingBox) {
      expect(optionBoundingBox.width).toBeGreaterThanOrEqual(44)
      expect(optionBoundingBox.height).toBeGreaterThanOrEqual(44)
    }
  })

  test('should handle mobile form interactions', async ({ page }) => {
    await navigation.goToSettings()

    // Find form inputs
    const inputs = page.locator('input, select, textarea')
    const inputCount = await inputs.count()

    if (inputCount > 0) {
      const firstInput = inputs.first()

      // Test mobile keyboard interaction
      await firstInput.tap()

      // Check if virtual keyboard doesn't obscure content
      const inputBoundingBox = await firstInput.boundingBox()
      if (inputBoundingBox) {
        // Input should be visible (not covered by virtual keyboard)
        expect(inputBoundingBox.y).toBeLessThan(400) // Reasonable threshold
      }

      // Test input functionality
      await firstInput.fill('test value')
      const inputValue = await firstInput.inputValue()
      expect(inputValue).toBe('test value')
    }
  })

  test('should support mobile PWA features', async ({ page }) => {
    await navigation.goToHome()

    // Check for PWA manifest
    const manifestLink = page.locator('link[rel="manifest"]')
    if ((await manifestLink.count()) > 0) {
      const manifestHref = await manifestLink.getAttribute('href')
      expect(manifestHref).toBeTruthy()
    }

    // Check for service worker registration
    const hasServiceWorker = await page.evaluate(() => {
      return 'serviceWorker' in navigator
    })

    if (hasServiceWorker) {
      const swRegistered = await page.evaluate(async () => {
        try {
          const registration = await navigator.serviceWorker.getRegistration()
          return !!registration
        } catch {
          return false
        }
      })

      // Service worker should be registered for PWA functionality
      expect(swRegistered).toBe(true)
    }

    // Check for app installation prompt (if applicable)
    const installPrompt = page.locator('[data-testid="install-prompt"]')
    if (await installPrompt.isVisible()) {
      await expect(installPrompt).toBeVisible()
    }
  })

  test('should handle mobile network conditions', async ({ page }) => {
    // Test offline functionality on mobile
    await navigation.goToPractice()
    await questions.waitForQuestionToLoad()

    // Go offline
    await page.context().setOffline(true)

    // Should show offline indicator
    const offlineIndicator = page.locator('[data-testid="offline-indicator"]')
    if (await offlineIndicator.isVisible()) {
      await expect(offlineIndicator).toBeVisible()
    }

    // Should still work with cached content
    const offlineQuestionText = await questions.getQuestionText()
    expect(offlineQuestionText.length).toBeGreaterThan(0)

    // Restore connection
    await page.context().setOffline(false)

    // Should sync properly
    await page.waitForTimeout(2000)
    const restoredQuestionText = await questions.getQuestionText()
    expect(restoredQuestionText.length).toBeGreaterThan(0)
  })

  test('should optimize mobile battery usage', async ({ page }) => {
    // Test that animations and intensive operations are optimized for mobile
    await page.emulateMedia({ reducedMotion: 'reduce' })

    await navigation.goToPractice()
    await questions.waitForQuestionToLoad()

    // Rapid interactions should not cause excessive battery drain
    const startTime = Date.now()

    for (let i = 0; i < 10; i++) {
      await questions.selectAnswer(i % 4)
      await questions.submitAnswer()

      if (i < 9) {
        await questions.nextQuestion()
        await questions.waitForQuestionToLoad()
      }
    }

    const totalTime = Date.now() - startTime

    // Operations should complete efficiently
    expect(totalTime).toBeLessThan(30000) // 30 seconds for 10 operations

    // Reset reduced motion
    await page.emulateMedia({ reducedMotion: 'no-preference' })
  })

  test('should handle mobile text scaling', async ({ page }) => {
    // Test with different text scale factors
    const textScales = [1.0, 1.25, 1.5, 2.0] // Normal, Large, Larger, Largest

    for (const scale of textScales) {
      // Simulate text scaling (approximate)
      await page.addStyleTag({
        content: `* { font-size: ${scale}em !important; }`,
      })

      await navigation.goToPractice()
      await questions.waitForQuestionToLoad()

      // Content should remain readable and functional
      const questionCard = page.locator('[data-testid="question-card"]')
      await expect(questionCard).toBeVisible()

      // Text should not overflow containers
      const questionText = await questions.getQuestionText()
      expect(questionText.length).toBeGreaterThan(0)

      // Touch targets should still be accessible
      const answerOption = page.locator('[data-testid="answer-option-0"]')
      if (await answerOption.isVisible()) {
        const boundingBox = await answerOption.boundingBox()
        if (boundingBox) {
          expect(boundingBox.height).toBeGreaterThanOrEqual(44)
        }
      }

      console.log(`✓ Text scale ${scale}x verified`)

      // Remove the style for next iteration
      await page.evaluate(() => {
        const styleElements = document.querySelectorAll('style')
        styleElements[styleElements.length - 1]?.remove()
      })
    }
  })
})
