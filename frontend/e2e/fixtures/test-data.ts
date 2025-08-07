/**
 * Test data fixtures for E2E tests
 *
 * This module provides consistent test data for use across
 * all E2E tests in the ExamPreparationSystem.
 */

export interface TestQuestion {
  id: string
  text: string
  options: string[]
  correctAnswer: number
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  explanation: string
}

export interface TestUserProgress {
  totalQuestions: number
  correctAnswers: number
  incorrectAnswers: number
  progressPercentage: number
  timeSpent: number
}

export interface TestBookmark {
  questionId: string
  questionText: string
  category: string
  dateBookmarked: string
}

/**
 * Sample questions for testing
 */
export const testQuestions: TestQuestion[] = [
  {
    id: 'q1',
    text: 'What is the primary purpose of an interrupt in embedded systems?',
    options: [
      'To pause program execution',
      'To handle asynchronous events',
      'To save memory',
      'To increase clock speed',
    ],
    correctAnswer: 1,
    category: 'interrupts',
    difficulty: 'medium',
    explanation:
      'Interrupts are used to handle asynchronous events that require immediate attention from the processor.',
  },
  {
    id: 'q2',
    text: 'Which of the following is a characteristic of RTOS?',
    options: [
      'High throughput',
      'Deterministic response time',
      'Complex user interface',
      'Large memory footprint',
    ],
    correctAnswer: 1,
    category: 'rtos',
    difficulty: 'medium',
    explanation:
      'Real-Time Operating Systems (RTOS) are characterized by their deterministic response times to events.',
  },
  {
    id: 'q3',
    text: 'What is the main advantage of using DMA in embedded systems?',
    options: [
      'Reduces power consumption',
      'Increases clock frequency',
      'Frees up CPU for other tasks',
      'Improves code readability',
    ],
    correctAnswer: 2,
    category: 'dma',
    difficulty: 'hard',
    explanation:
      'DMA (Direct Memory Access) allows peripherals to transfer data directly to/from memory without CPU intervention.',
  },
  {
    id: 'q4',
    text: 'Which communication protocol is commonly used for short-range, low-power IoT devices?',
    options: ['Ethernet', 'WiFi', 'Bluetooth LE', 'USB'],
    correctAnswer: 2,
    category: 'communication',
    difficulty: 'easy',
    explanation:
      'Bluetooth Low Energy (BLE) is designed for short-range, low-power communication in IoT devices.',
  },
  {
    id: 'q5',
    text: 'What is the purpose of a watchdog timer in embedded systems?',
    options: [
      'To measure elapsed time',
      'To reset the system if it becomes unresponsive',
      'To schedule tasks',
      'To count clock cycles',
    ],
    correctAnswer: 1,
    category: 'system-reliability',
    difficulty: 'medium',
    explanation:
      'A watchdog timer automatically resets the system if the software fails to respond within a specified time period.',
  },
]

/**
 * Sample user progress data
 */
export const testUserProgress: TestUserProgress = {
  totalQuestions: 100,
  correctAnswers: 67,
  incorrectAnswers: 33,
  progressPercentage: 67,
  timeSpent: 1800000, // 30 minutes in milliseconds
}

/**
 * Sample bookmarks
 */
export const testBookmarks: TestBookmark[] = [
  {
    questionId: 'q1',
    questionText:
      'What is the primary purpose of an interrupt in embedded systems?',
    category: 'interrupts',
    dateBookmarked: '2024-01-15T10:30:00Z',
  },
  {
    questionId: 'q3',
    questionText:
      'What is the main advantage of using DMA in embedded systems?',
    category: 'dma',
    dateBookmarked: '2024-01-16T14:45:00Z',
  },
]

/**
 * Performance benchmarks
 */
export const performanceBenchmarks = {
  pageLoadTime: {
    target: 2000, // 2 seconds
    warning: 3000, // 3 seconds
  },
  apiResponseTime: {
    target: 200, // 200ms
    warning: 500, // 500ms
  },
  firstContentfulPaint: {
    target: 1500, // 1.5 seconds
    warning: 2000, // 2 seconds
  },
}

/**
 * Test scenarios for different user journeys
 */
export const testScenarios = {
  completePracticeSession: {
    name: 'Complete Practice Session',
    description:
      'User completes a full practice session with multiple questions',
    questionsToAnswer: 5,
    expectedOutcome: 'Progress is updated and results are displayed',
  },
  bookmarkManagement: {
    name: 'Bookmark Management',
    description: 'User bookmarks questions and manages bookmark list',
    questionsToBookmark: 3,
    expectedOutcome: 'Bookmarks are saved and can be accessed later',
  },
  progressTracking: {
    name: 'Progress Tracking',
    description: 'User progress is accurately tracked and displayed',
    sessionsToComplete: 2,
    expectedOutcome: 'Progress charts and statistics are updated',
  },
  offlineMode: {
    name: 'Offline Mode',
    description: 'Application works offline and syncs when online',
    questionsToAnswerOffline: 3,
    expectedOutcome: 'Data is cached and synced when connection is restored',
  },
  errorRecovery: {
    name: 'Error Recovery',
    description: 'Application handles errors gracefully',
    errorTypes: ['network', 'server', 'timeout'],
    expectedOutcome: 'User sees helpful error messages and can retry',
  },
}

/**
 * Mobile-specific test data
 */
export const mobileTestData = {
  swipeGestures: {
    leftSwipe: 'Navigate to next question',
    rightSwipe: 'Navigate to previous question',
    expectedBehavior: 'Smooth navigation without page reload',
  },
  touchTargets: {
    minimumSize: 44, // pixels
    spacing: 8, // pixels between touch targets
    expectedBehavior: 'All interactive elements are easily tappable',
  },
}

/**
 * Accessibility test data
 */
export const accessibilityTestData = {
  keyboardNavigation: {
    tabOrder: ['home-link', 'practice-link', 'progress-link', 'bookmarks-link'],
    expectedBehavior: 'All interactive elements are keyboard accessible',
  },
  ariaLabels: {
    requiredElements: ['button', 'input', 'select', 'textarea'],
    expectedBehavior: 'All interactive elements have appropriate ARIA labels',
  },
  colorContrast: {
    minimumRatio: 4.5, // WCAG AA standard
    expectedBehavior: 'All text meets minimum contrast requirements',
  },
}

/**
 * Error simulation data
 */
export const errorSimulationData = {
  networkErrors: {
    '500': 'Internal Server Error',
    '404': 'Not Found',
    '403': 'Forbidden',
    timeout: 'Request Timeout',
    offline: 'Network Unavailable',
  },
  expectedBehavior: {
    userFriendlyMessage: true,
    retryOption: true,
    fallbackContent: true,
    errorLogging: true,
  },
}
