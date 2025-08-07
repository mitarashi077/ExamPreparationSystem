import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright configuration for End-to-End testing
 *
 * This configuration sets up comprehensive E2E testing for the ExamPreparationSystem
 * including critical user flows, cross-browser testing, and performance validation.
 */
export default defineConfig({
  // Test directory structure
  testDir: './e2e',

  // Global test timeout (30 seconds)
  timeout: 30000,

  // Global expect timeout (5 seconds)
  expect: {
    timeout: 5000,
  },

  // Run tests in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ['list'],
    ['html', { outputFolder: 'e2e-results/html' }],
    ['json', { outputFile: 'e2e-results/results.json' }],
    ['junit', { outputFile: 'e2e-results/junit.xml' }],
  ],

  // Global setup and teardown
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',

  // Output directory for test artifacts
  outputDir: 'e2e-results/artifacts',

  // Shared settings for all projects
  use: {
    // Base URL for testing
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3003',

    // Global timeout for actions
    actionTimeout: 10000,

    // Global timeout for navigation
    navigationTimeout: 15000,

    // Collect trace when retrying the failed test
    trace: 'retry-with-trace',

    // Record video for failed tests
    video: 'retain-on-failure',

    // Take screenshot on failure
    screenshot: 'only-on-failure',

    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile testing
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },

    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },

    // Tablet testing
    {
      name: 'tablet',
      use: { ...devices['iPad Pro'] },
    },
  ],

  // Development server configuration
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3003',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
