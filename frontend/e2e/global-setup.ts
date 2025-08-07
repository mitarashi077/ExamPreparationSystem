import { chromium, FullConfig } from '@playwright/test'

/**
 * Global setup for E2E tests
 *
 * This setup prepares the test environment by:
 * - Starting the backend server if needed
 * - Seeding test data
 * - Performing any global authentication
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting E2E test global setup...')

  // Start a browser for setup tasks
  const browser = await chromium.launch()
  const page = await browser.newPage()

  try {
    // Wait for the application to be ready
    const baseURL = config.projects[0].use.baseURL || 'http://localhost:3003'

    console.log(`📡 Checking if application is ready at ${baseURL}`)

    // Wait for the application to load
    await page.goto(baseURL, { waitUntil: 'networkidle' })

    // Verify the application is working
    await page.waitForSelector('[data-testid="home-page"]', { timeout: 30000 })

    console.log('✅ Application is ready for E2E testing')

    // Perform any global setup tasks here
    // For example: seed test data, set up authentication state, etc.
  } catch (error) {
    console.error('❌ Global setup failed:', error)
    throw error
  } finally {
    await browser.close()
  }

  console.log('✅ E2E test global setup completed')
}

export default globalSetup
