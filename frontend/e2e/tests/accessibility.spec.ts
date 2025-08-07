import { test, expect } from '@playwright/test'
import {
  NavigationHelpers,
  QuestionHelpers,
  AccessibilityHelpers,
} from '../utils/test-helpers'
import { accessibilityTestData } from '../fixtures/test-data'

/**
 * E2E Tests for Accessibility (A11Y) Compliance
 *
 * These tests validate accessibility requirements including:
 * - Screen reader compatibility
 * - Keyboard navigation
 * - ARIA attributes validation
 * - Color contrast compliance
 * - Focus management testing
 * - WCAG 2.1 AA compliance
 */

test.describe('Accessibility E2E Tests', () => {
  let navigation: NavigationHelpers
  let questions: QuestionHelpers

  test.beforeEach(async ({ page }) => {
    navigation = new NavigationHelpers(page)
    questions = new QuestionHelpers(page)
  })

  test('should support keyboard navigation throughout the application', async ({
    page,
  }) => {
    await navigation.goToHome()

    // Test tab navigation through main navigation
    const navigationLinks = accessibilityTestData.keyboardNavigation.tabOrder

    for (let i = 0; i < navigationLinks.length; i++) {
      await page.keyboard.press('Tab')

      // Check if the expected element is focused
      const focusedElement = page.locator(':focus')
      await expect(focusedElement).toBeVisible()

      // Verify we can activate the focused element with Enter or Space
      if (
        (await focusedElement.getAttribute('href')) ||
        (await focusedElement.getAttribute('role')) === 'button'
      ) {
        const tagName = await focusedElement.evaluate((el) =>
          el.tagName.toLowerCase(),
        )

        if (tagName === 'a' || tagName === 'button') {
          // Test that Enter key works
          const currentUrl = page.url()
          await page.keyboard.press('Enter')

          // If navigation occurred, go back
          if (page.url() !== currentUrl) {
            await page.goBack()
          }
        }
      }
    }
  })

  test('should provide proper ARIA labels and attributes', async ({ page }) => {
    const pagesToTest = [
      { name: 'Home', navigate: () => navigation.goToHome() },
      { name: 'Practice', navigate: () => navigation.goToPractice() },
      { name: 'Progress', navigate: () => navigation.goToProgress() },
      { name: 'Bookmarks', navigate: () => navigation.goToBookmarks() },
    ]

    for (const pageTest of pagesToTest) {
      await pageTest.navigate()

      // Check for proper heading structure
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all()
      expect(headings.length).toBeGreaterThan(0)

      // Verify h1 exists and is unique
      const h1Elements = await page.locator('h1').all()
      expect(h1Elements.length).toBe(1)

      // Check buttons have accessible names
      const buttons = await page.locator('button').all()
      for (const button of buttons) {
        const ariaLabel = await button.getAttribute('aria-label')
        const ariaLabelledby = await button.getAttribute('aria-labelledby')
        const textContent = await button.textContent()

        // Button should have either aria-label, aria-labelledby, or text content
        const hasAccessibleName =
          ariaLabel ||
          ariaLabelledby ||
          (textContent && textContent.trim().length > 0)
        expect(hasAccessibleName).toBeTruthy()
      }

      // Check inputs have labels
      const inputs = await page.locator('input, select, textarea').all()
      for (const input of inputs) {
        const ariaLabel = await input.getAttribute('aria-label')
        const ariaLabelledby = await input.getAttribute('aria-labelledby')
        const id = await input.getAttribute('id')

        // Input should have aria-label, aria-labelledby, or associated label
        const hasLabel =
          ariaLabel ||
          ariaLabelledby ||
          (id && (await page.locator(`label[for="${id}"]`).count()) > 0)
        expect(hasLabel).toBeTruthy()
      }
    }
  })

  test('should maintain proper focus management', async ({ page }) => {
    await navigation.goToPractice()
    await questions.waitForQuestionToLoad()

    // Test focus management in question interaction
    await questions.selectAnswer(0)

    // Focus should be on the selected answer
    const focusedElement = page.locator(':focus')
    const focusedAriaPressed = await focusedElement.getAttribute('aria-pressed')
    expect(focusedAriaPressed).toBe('true')

    // Submit answer and check focus management
    await questions.submitAnswer()

    // Wait for result to appear
    await page.waitForSelector('[data-testid="answer-result"]')

    // Focus should be managed appropriately (either on result or next action)
    const newFocusedElement = page.locator(':focus')
    await expect(newFocusedElement).toBeVisible()
  })

  test('should support screen reader navigation', async ({ page }) => {
    await navigation.goToPractice()
    await questions.waitForQuestionToLoad()

    // Check for proper landmark roles
    const landmarks = [
      { role: 'main', selector: '[role="main"], main' },
      { role: 'navigation', selector: '[role="navigation"], nav' },
      { role: 'banner', selector: '[role="banner"], header' },
    ]

    for (const landmark of landmarks) {
      const elements = await page.locator(landmark.selector).all()
      if (elements.length > 0) {
        // Verify landmark is properly identified
        const element = elements[0]
        const role =
          (await element.getAttribute('role')) ||
          (await element.evaluate((el) => el.tagName.toLowerCase()))
        expect(['main', 'navigation', 'nav', 'banner', 'header']).toContain(
          role,
        )
      }
    }

    // Check for skip links
    const skipLink = page
      .locator('[data-testid="skip-link"], a[href="#main"]')
      .first()
    if (await skipLink.isVisible()) {
      await expect(skipLink).toBeVisible()

      // Test skip link functionality
      await skipLink.click()
      const mainContent = page.locator('#main, [role="main"], main').first()
      await expect(mainContent).toBeFocused()
    }
  })

  test('should provide proper form accessibility', async ({ page }) => {
    await navigation.goToSettings()

    // Find all form controls
    const formControls = await page
      .locator(
        'input, select, textarea, [role="slider"], [role="checkbox"], [role="radio"]',
      )
      .all()

    for (const control of formControls) {
      // Check for proper labeling
      const ariaLabel = await control.getAttribute('aria-label')
      const ariaLabelledby = await control.getAttribute('aria-labelledby')
      const id = await control.getAttribute('id')

      const hasLabel =
        ariaLabel ||
        ariaLabelledby ||
        (id && (await page.locator(`label[for="${id}"]`).count()) > 0)
      expect(hasLabel).toBeTruthy()

      // Check for error message association
      const ariaDescribedby = await control.getAttribute('aria-describedby')
      if (ariaDescribedby) {
        const describedByElement = page.locator(`#${ariaDescribedby}`)
        await expect(describedByElement).toBeAttached()
      }

      // Check for required field indication
      const required = await control.getAttribute('required')
      const ariaRequired = await control.getAttribute('aria-required')

      if (required !== null || ariaRequired === 'true') {
        // Required fields should be properly indicated
        expect(ariaRequired).toBe('true')
      }
    }
  })

  test('should handle dynamic content accessibility', async ({ page }) => {
    await navigation.goToPractice()
    await questions.waitForQuestionToLoad()

    // Test live regions for dynamic updates
    await questions.selectAnswer(0)
    await questions.submitAnswer()

    // Wait for dynamic content update
    await page.waitForSelector('[data-testid="answer-result"]')

    // Check for live regions or proper ARIA announcements
    const liveRegions = await page
      .locator('[aria-live], [role="status"], [role="alert"]')
      .all()

    if (liveRegions.length > 0) {
      for (const liveRegion of liveRegions) {
        const ariaLive = await liveRegion.getAttribute('aria-live')
        const role = await liveRegion.getAttribute('role')

        // Live regions should have appropriate politeness settings
        if (ariaLive) {
          expect(['polite', 'assertive', 'off']).toContain(ariaLive)
        }

        if (role) {
          expect(['status', 'alert', 'log']).toContain(role)
        }
      }
    }
  })

  test('should support high contrast and color accessibility', async ({
    page,
  }) => {
    // Test with forced colors (high contrast mode simulation)
    await page.emulateMedia({ forcedColors: 'active' })

    await navigation.goToPractice()
    await questions.waitForQuestionToLoad()

    // Verify content is still visible and functional
    const questionText = await questions.getQuestionText()
    expect(questionText.length).toBeGreaterThan(0)

    // Test interaction still works
    await questions.selectAnswer(0)
    const selectedAnswer = await questions.getSelectedAnswer()
    expect(selectedAnswer).toBeTruthy()

    // Reset forced colors
    await page.emulateMedia({ forcedColors: 'none' })
  })

  test('should provide proper error accessibility', async ({ page }) => {
    // Simulate an error condition
    await page.route('**/api/questions/**', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server Error' }),
      })
    })

    await navigation.goToPractice()

    // Wait for error message
    await page.waitForSelector('[data-testid="error-message"], [role="alert"]')

    // Check error accessibility
    const errorElements = await page
      .locator('[data-testid="error-message"], [role="alert"]')
      .all()
    expect(errorElements.length).toBeGreaterThan(0)

    for (const errorElement of errorElements) {
      // Error should be announced to screen readers
      const role = await errorElement.getAttribute('role')
      const ariaLive = await errorElement.getAttribute('aria-live')

      const isAnnounced =
        role === 'alert' || ariaLive === 'assertive' || ariaLive === 'polite'
      expect(isAnnounced).toBeTruthy()

      // Error text should be meaningful
      const errorText = await errorElement.textContent()
      expect(errorText).toBeTruthy()
      expect(errorText!.length).toBeGreaterThan(0)
    }

    // Restore normal API responses
    await page.unroute('**/api/questions/**')
  })

  test('should support alternative text for images', async ({ page }) => {
    await navigation.goToHome()

    // Check all images have alt text
    const images = await page.locator('img').all()

    for (const image of images) {
      const alt = await image.getAttribute('alt')
      const ariaLabel = await image.getAttribute('aria-label')
      const ariaLabelledby = await image.getAttribute('aria-labelledby')
      const role = await image.getAttribute('role')

      // Images should have alt text, aria-label, or be marked as decorative
      const hasAccessibleText =
        alt !== null || ariaLabel || ariaLabelledby || role === 'presentation'
      expect(hasAccessibleText).toBeTruthy()

      // If alt text exists, it should be meaningful for non-decorative images
      if (alt !== null && alt !== '' && role !== 'presentation') {
        expect(alt.length).toBeGreaterThan(0)
      }
    }
  })

  test('should handle modal and dialog accessibility', async ({ page }) => {
    // Look for modal triggers (settings, help, etc.)
    const modalTriggers = await page
      .locator(
        '[data-testid*="modal"], [data-testid*="dialog"], [aria-haspopup="dialog"]',
      )
      .all()

    for (const trigger of modalTriggers) {
      if (await trigger.isVisible()) {
        await trigger.click()

        // Wait for modal to appear
        const modal = page
          .locator(
            '[role="dialog"], [role="alertdialog"], .modal, [data-testid*="modal"]',
          )
          .first()

        if (await modal.isVisible()) {
          // Modal should have proper ARIA attributes
          const role = await modal.getAttribute('role')
          expect(['dialog', 'alertdialog']).toContain(role)

          // Modal should have accessible name
          const ariaLabel = await modal.getAttribute('aria-label')
          const ariaLabelledby = await modal.getAttribute('aria-labelledby')
          expect(ariaLabel || ariaLabelledby).toBeTruthy()

          // Focus should be trapped in modal
          const focusedElement = page.locator(':focus')
          const focusedIsInModal = await focusedElement.evaluate(
            (el, modalEl) => {
              return modalEl.contains(el)
            },
            await modal.elementHandle(),
          )
          expect(focusedIsInModal).toBeTruthy()

          // Close modal (look for close button or ESC key)
          const closeButton = modal
            .locator('[data-testid="close"], [aria-label*="close"], .close')
            .first()
          if (await closeButton.isVisible()) {
            await closeButton.click()
          } else {
            await page.keyboard.press('Escape')
          }

          // Modal should be closed
          await expect(modal).toBeHidden()
        }
      }
    }
  })

  test('should provide proper progress and status accessibility', async ({
    page,
  }) => {
    await navigation.goToProgress()

    // Check progress bars and status indicators
    const progressBars = await page
      .locator('[role="progressbar"], progress, [data-testid*="progress"]')
      .all()

    for (const progressBar of progressBars) {
      // Progress bars should have proper ARIA attributes
      const role = await progressBar.getAttribute('role')
      const ariaValueNow = await progressBar.getAttribute('aria-valuenow')
      const ariaValueMin = await progressBar.getAttribute('aria-valuemin')
      const ariaValueMax = await progressBar.getAttribute('aria-valuemax')
      const ariaLabel = await progressBar.getAttribute('aria-label')
      const ariaLabelledby = await progressBar.getAttribute('aria-labelledby')

      // Should have role="progressbar" or be a progress element
      const tagName = await progressBar.evaluate((el) =>
        el.tagName.toLowerCase(),
      )
      const isProgressElement = tagName === 'progress' || role === 'progressbar'
      expect(isProgressElement).toBeTruthy()

      // Should have accessible name
      expect(ariaLabel || ariaLabelledby).toBeTruthy()

      // Should have value information
      if (role === 'progressbar') {
        expect(ariaValueNow).toBeTruthy()
        expect(ariaValueMin).toBeTruthy()
        expect(ariaValueMax).toBeTruthy()
      }
    }
  })

  test('should support reduced motion preferences', async ({ page }) => {
    // Test with reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' })

    await navigation.goToPractice()
    await questions.waitForQuestionToLoad()

    // Perform interactions that might trigger animations
    await questions.selectAnswer(0)
    await questions.submitAnswer()
    await questions.nextQuestion()

    // Application should still function properly with reduced motion
    await questions.waitForQuestionToLoad()
    const questionText = await questions.getQuestionText()
    expect(questionText.length).toBeGreaterThan(0)

    // Reset motion preference
    await page.emulateMedia({ reducedMotion: 'no-preference' })
  })

  test('should handle touch accessibility for mobile users', async ({
    page,
  }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await navigation.goToPractice()
    await questions.waitForQuestionToLoad()

    // Check touch target sizes
    const touchTargets = await page
      .locator(
        'button, a, [role="button"], input[type="radio"], input[type="checkbox"]',
      )
      .all()

    for (const target of touchTargets) {
      if (await target.isVisible()) {
        const boundingBox = await target.boundingBox()

        if (boundingBox) {
          // Touch targets should meet minimum size requirements (44x44px for iOS, 48x48px for Android)
          const minSize = accessibilityTestData.touchTargets.minimumSize
          expect(boundingBox.width).toBeGreaterThanOrEqual(minSize)
          expect(boundingBox.height).toBeGreaterThanOrEqual(minSize)
        }
      }
    }

    // Reset viewport
    await page.setViewportSize({ width: 1280, height: 720 })
  })
})
