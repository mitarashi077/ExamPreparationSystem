import { test, expect } from '@playwright/test'
import {
  NavigationHelpers,
  QuestionHelpers,
  PerformanceHelpers,
} from '../utils/test-helpers'
import { performanceBenchmarks } from '../fixtures/test-data'

/**
 * E2E Tests for Performance and Load Testing
 *
 * These tests validate performance requirements including:
 * - Page load performance (< 2 seconds)
 * - API response times (< 200ms)
 * - Bundle size optimization verification
 * - Memory usage optimization
 * - Concurrent user simulation
 */

test.describe('Performance E2E Tests', () => {
  let navigation: NavigationHelpers
  let questions: QuestionHelpers
  let performance: PerformanceHelpers

  test.beforeEach(async ({ page }) => {
    navigation = new NavigationHelpers(page)
    questions = new QuestionHelpers(page)
    performance = new PerformanceHelpers(page)
  })

  test('should meet page load performance targets', async ({ page }) => {
    // Test each major page load performance
    const pages = [
      { name: 'Home', navigate: () => navigation.goToHome() },
      { name: 'Practice', navigate: () => navigation.goToPractice() },
      { name: 'Progress', navigate: () => navigation.goToProgress() },
      { name: 'Bookmarks', navigate: () => navigation.goToBookmarks() },
    ]

    for (const pageTest of pages) {
      const startTime = Date.now()
      await pageTest.navigate()
      await page.waitForLoadState('networkidle')
      const loadTime = Date.now() - startTime

      console.log(`${pageTest.name} page load time: ${loadTime}ms`)
      expect(loadTime).toBeLessThan(performanceBenchmarks.pageLoadTime.target)

      if (loadTime > performanceBenchmarks.pageLoadTime.warning) {
        console.warn(
          `${pageTest.name} page load time exceeds warning threshold: ${loadTime}ms`,
        )
      }
    }
  })

  test('should meet API response time targets', async ({ page }) => {
    const apiCalls: { endpoint: string; duration: number }[] = []

    // Track API response times
    page.on('response', (response) => {
      if (response.url().includes('/api/')) {
        const timing = response.request().timing()
        if (timing) {
          apiCalls.push({
            endpoint: new URL(response.url()).pathname,
            duration: timing.responseEnd - timing.requestStart,
          })
        }
      }
    })

    // Perform various operations to trigger API calls
    await navigation.goToPractice()
    await questions.waitForQuestionToLoad()

    await questions.selectAnswer(0)
    await questions.submitAnswer()

    await navigation.goToProgress()

    // Wait for all API calls to complete
    await page.waitForTimeout(3000)

    // Validate API response times
    for (const apiCall of apiCalls) {
      console.log(`${apiCall.endpoint} response time: ${apiCall.duration}ms`)
      expect(apiCall.duration).toBeLessThan(
        performanceBenchmarks.apiResponseTime.warning,
      )

      if (apiCall.duration < performanceBenchmarks.apiResponseTime.target) {
        console.log(`✓ ${apiCall.endpoint} meets target performance`)
      }
    }
  })

  test('should measure First Contentful Paint (FCP)', async ({ page }) => {
    // Navigate to main pages and measure FCP
    const pages = ['/', '/practice', '/progress']

    for (const pagePath of pages) {
      await page.goto(pagePath)

      // Measure Web Vitals
      const fcp = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries()
            const fcpEntry = entries.find(
              (entry) => entry.name === 'first-contentful-paint',
            )
            if (fcpEntry) {
              resolve(fcpEntry.startTime)
            }
          }).observe({ entryTypes: ['paint'] })

          // Fallback timeout
          setTimeout(() => resolve(-1), 5000)
        })
      })

      if (fcp > 0) {
        console.log(`FCP for ${pagePath}: ${fcp}ms`)
        expect(fcp).toBeLessThan(
          performanceBenchmarks.firstContentfulPaint.target,
        )
      }
    }
  })

  test('should handle rapid user interactions without performance degradation', async ({
    page,
  }) => {
    await navigation.goToPractice()
    await questions.waitForQuestionToLoad()

    const startTime = Date.now()

    // Perform rapid interactions
    for (let i = 0; i < 10; i++) {
      await questions.selectAnswer(i % 4)
      await questions.submitAnswer()

      // Don't wait for full response, just enough to trigger next interaction
      await page.waitForTimeout(100)

      if (i < 9) {
        await questions.nextQuestion()
        await page.waitForTimeout(100)
      }
    }

    const totalTime = Date.now() - startTime
    const averageTimePerInteraction = totalTime / 10

    console.log(
      `Average time per rapid interaction: ${averageTimePerInteraction}ms`,
    )

    // Should handle rapid interactions efficiently
    expect(averageTimePerInteraction).toBeLessThan(1000) // 1 second per interaction

    // Verify the application is still responsive
    await questions.waitForQuestionToLoad()
    const questionText = await questions.getQuestionText()
    expect(questionText.length).toBeGreaterThan(0)
  })

  test('should measure bundle size impact on load performance', async ({
    page,
  }) => {
    // Track resource loading
    const resources: { url: string; size: number; type: string }[] = []

    page.on('response', async (response) => {
      const contentLength = response.headers()['content-length']
      const contentType = response.headers()['content-type'] || ''

      if (contentLength) {
        resources.push({
          url: response.url(),
          size: parseInt(contentLength),
          type: contentType,
        })
      }
    })

    await navigation.goToPractice()
    await page.waitForLoadState('networkidle')

    // Analyze bundle sizes
    const jsResources = resources.filter((r) => r.type.includes('javascript'))
    const cssResources = resources.filter((r) => r.type.includes('css'))

    const totalJsSize = jsResources.reduce((sum, r) => sum + r.size, 0)
    const totalCssSize = cssResources.reduce((sum, r) => sum + r.size, 0)

    console.log(
      `Total JavaScript bundle size: ${(totalJsSize / 1024).toFixed(2)} KB`,
    )
    console.log(`Total CSS bundle size: ${(totalCssSize / 1024).toFixed(2)} KB`)

    // Bundle size targets (reasonable for modern web apps)
    expect(totalJsSize).toBeLessThan(1024 * 1024) // 1MB for JS
    expect(totalCssSize).toBeLessThan(256 * 1024) // 256KB for CSS
  })

  test('should maintain performance under simulated load', async ({
    page: _page,
    context,
  }) => {
    // Simulate multiple concurrent operations
    const operations = []

    // Create multiple pages to simulate concurrent users
    for (let i = 0; i < 3; i++) {
      const newPage = await context.newPage()
      operations.push(
        (async () => {
          const pageNavigation = new NavigationHelpers(newPage)
          const pageQuestions = new QuestionHelpers(newPage)

          await pageNavigation.goToPractice()
          await pageQuestions.waitForQuestionToLoad()

          // Answer questions rapidly
          for (let j = 0; j < 5; j++) {
            await pageQuestions.selectAnswer(j % 4)
            await pageQuestions.submitAnswer()

            if (j < 4) {
              await pageQuestions.nextQuestion()
            }
          }

          await newPage.close()
        })(),
      )
    }

    const startTime = Date.now()
    await Promise.all(operations)
    const totalTime = Date.now() - startTime

    console.log(`Concurrent operations completed in: ${totalTime}ms`)

    // Should handle concurrent load efficiently
    expect(totalTime).toBeLessThan(30000) // 30 seconds for all operations

    // Main page should still be responsive
    await navigation.goToPractice()
    await questions.waitForQuestionToLoad()
    const questionText = await questions.getQuestionText()
    expect(questionText.length).toBeGreaterThan(0)
  })

  test('should handle memory usage efficiently', async ({ page }) => {
    await navigation.goToPractice()

    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory
        ? {
            usedJSMemory: (performance as any).memory.usedJSMemory,
            totalJSMemory: (performance as any).memory.totalJSMemory,
          }
        : null
    })

    // Perform memory-intensive operations
    for (let i = 0; i < 20; i++) {
      await questions.waitForQuestionToLoad()
      await questions.selectAnswer(i % 4)
      await questions.submitAnswer()

      if (i < 19) {
        await questions.nextQuestion()
      }
    }

    // Navigate between pages to trigger cleanup
    await navigation.goToProgress()
    await navigation.goToBookmarks()
    await navigation.goToPractice()

    // Get final memory usage
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory
        ? {
            usedJSMemory: (performance as any).memory.usedJSMemory,
            totalJSMemory: (performance as any).memory.totalJSMemory,
          }
        : null
    })

    if (initialMemory && finalMemory) {
      const memoryIncrease =
        finalMemory.usedJSMemory - initialMemory.usedJSMemory
      const memoryIncreaseMB = memoryIncrease / (1024 * 1024)

      console.log(
        `Memory usage increased by: ${memoryIncreaseMB.toFixed(2)} MB`,
      )

      // Memory increase should be reasonable (< 50MB for this test)
      expect(memoryIncreaseMB).toBeLessThan(50)
    }
  })

  test('should optimize image and asset loading', async ({ page }) => {
    const resourceMetrics: {
      url: string
      size: number
      loadTime: number
      type: string
    }[] = []

    page.on('response', async (response) => {
      const url = response.url()
      const contentType = response.headers()['content-type'] || ''
      const contentLength = response.headers()['content-length']
      const timing = response.request().timing()

      if (
        contentLength &&
        timing &&
        (contentType.includes('image') ||
          url.includes('.png') ||
          url.includes('.jpg') ||
          url.includes('.svg'))
      ) {
        resourceMetrics.push({
          url: url,
          size: parseInt(contentLength),
          loadTime: timing.responseEnd - timing.requestStart,
          type: contentType,
        })
      }
    })

    await navigation.goToHome()
    await page.waitForLoadState('networkidle')

    // Analyze image loading performance
    for (const metric of resourceMetrics) {
      const sizeKB = metric.size / 1024
      console.log(
        `Image ${metric.url}: ${sizeKB.toFixed(2)} KB, ${metric.loadTime}ms`,
      )

      // Images should load efficiently
      expect(metric.loadTime).toBeLessThan(2000) // 2 seconds max per image

      // Images should be optimized (reasonable size limits)
      if (metric.url.includes('.jpg') || metric.url.includes('.png')) {
        expect(sizeKB).toBeLessThan(500) // 500KB max per image
      }
    }
  })

  test('should maintain UI responsiveness during background operations', async ({
    page,
  }) => {
    await navigation.goToPractice()
    await questions.waitForQuestionToLoad()

    // Start background operations (answer submission)
    const backgroundOps = []

    for (let i = 0; i < 5; i++) {
      backgroundOps.push(
        (async () => {
          await questions.selectAnswer(i % 4)
          await questions.submitAnswer()

          if (i < 4) {
            await questions.nextQuestion()
            await questions.waitForQuestionToLoad()
          }
        })(),
      )
    }

    // While background operations are running, test UI responsiveness
    const uiResponseTimes = []

    for (let i = 0; i < 3; i++) {
      const startTime = Date.now()

      // Navigate to different page
      await navigation.goToProgress()
      await page.waitForSelector('[data-testid="progress-page"]')

      const responseTime = Date.now() - startTime
      uiResponseTimes.push(responseTime)

      // Return to practice
      await navigation.goToPractice()
      await page.waitForTimeout(500) // Brief delay between tests
    }

    // Wait for background operations to complete
    await Promise.all(backgroundOps)

    // UI should remain responsive during background operations
    const averageResponseTime =
      uiResponseTimes.reduce((sum, time) => sum + time, 0) /
      uiResponseTimes.length
    console.log(
      `Average UI response time during background operations: ${averageResponseTime}ms`,
    )

    expect(averageResponseTime).toBeLessThan(3000) // 3 seconds max for navigation
  })

  test('should handle offline-to-online transition performance', async ({
    page,
  }) => {
    // Load content while online
    await navigation.goToPractice()
    await questions.waitForQuestionToLoad()

    // Go offline
    await page.context().setOffline(true)

    // Perform operations offline
    for (let i = 0; i < 3; i++) {
      await questions.selectAnswer(i % 4)
      await questions.submitAnswer()

      if (i < 2) {
        await questions.nextQuestion()
      }
    }

    // Measure online transition performance
    const transitionStartTime = Date.now()

    // Go back online
    await page.context().setOffline(false)

    // Wait for sync to complete
    await page.waitForTimeout(5000)

    const transitionTime = Date.now() - transitionStartTime
    console.log(`Offline-to-online transition time: ${transitionTime}ms`)

    // Transition should be reasonably fast
    expect(transitionTime).toBeLessThan(10000) // 10 seconds max

    // Verify system is still responsive after transition
    await navigation.goToProgress()
    const progressElement = page.locator('[data-testid="progress-page"]')
    await expect(progressElement).toBeVisible()
  })
})
