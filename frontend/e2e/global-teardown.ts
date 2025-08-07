import { FullConfig } from '@playwright/test'

/**
 * Global teardown for E2E tests
 *
 * This teardown cleans up after all tests have completed:
 * - Cleaning up test data
 * - Stopping services if needed
 * - Generating final reports
 */
async function globalTeardown(_config: FullConfig) {
  console.log('🧹 Starting E2E test global teardown...')

  try {
    // Perform any cleanup tasks here
    // For example: clean up test data, stop services, etc.

    console.log('✅ E2E test global teardown completed')
  } catch (error) {
    console.error('❌ Global teardown failed:', error)
    // Don't throw - we don't want teardown failures to fail the test run
  }
}

export default globalTeardown
