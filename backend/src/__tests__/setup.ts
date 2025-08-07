import { PrismaClient } from '@prisma/client'

// Test database configuration
let cleanUrl =
  process.env.DATABASE_URL ||
  'postgresql://test:test@localhost:5432/exam_prep_test'
if (cleanUrl?.startsWith("psql '") && cleanUrl.endsWith("'")) {
  cleanUrl = cleanUrl.slice(5, -1)
}

// Create test Prisma client
export const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: cleanUrl,
    },
  },
})

// Global test setup
beforeAll(async () => {
  try {
    await testPrisma.$connect()
    console.log('Test database connected')
  } catch (error) {
    console.error('Failed to connect to test database:', error)
  }
})

// Global test teardown
afterAll(async () => {
  try {
    await testPrisma.$disconnect()
    console.log('Test database disconnected')
  } catch (error) {
    console.error('Failed to disconnect from test database:', error)
  }
})

// Reset database between tests
beforeEach(async () => {
  try {
    // Clean up data in reverse dependency order
    await testPrisma.reviewSession.deleteMany()
    await testPrisma.reviewItem.deleteMany()
    await testPrisma.bookmark.deleteMany()
    await testPrisma.answer.deleteMany()
    await testPrisma.studySession.deleteMany()
    await testPrisma.choice.deleteMany()
    await testPrisma.question.deleteMany()
    await testPrisma.category.deleteMany()
  } catch (error) {
    console.error('Failed to clean test database:', error)
  }
})

// Helper function to create test data
export const createTestData = async () => {
  // Create test category
  const category = await testPrisma.category.create({
    data: {
      name: 'Test Category',
      description: 'Test category for testing',
    },
  })

  // Create test question with choices
  const question = await testPrisma.question.create({
    data: {
      content: 'Test question content?',
      explanation: 'Test explanation',
      difficulty: 2,
      year: 2023,
      session: '春期',
      categoryId: category.id,
      choices: {
        create: [
          { content: 'Choice A', isCorrect: false },
          { content: 'Choice B', isCorrect: true },
          { content: 'Choice C', isCorrect: false },
          { content: 'Choice D', isCorrect: false },
        ],
      },
    },
    include: {
      choices: true,
      category: true,
    },
  })

  return { category, question }
}

// Helper function to create multiple test questions
export const createMultipleTestQuestions = async (count: number = 3) => {
  const { category } = await createTestData()

  const questions = []
  for (let i = 1; i < count; i++) {
    const question = await testPrisma.question.create({
      data: {
        content: `Test question ${i + 1} content?`,
        explanation: `Test explanation ${i + 1}`,
        difficulty: (i % 5) + 1,
        year: 2023,
        session: i % 2 === 0 ? '春期' : '秋期',
        categoryId: category.id,
        choices: {
          create: [
            { content: `Choice A${i + 1}`, isCorrect: false },
            { content: `Choice B${i + 1}`, isCorrect: true },
            { content: `Choice C${i + 1}`, isCorrect: false },
            { content: `Choice D${i + 1}`, isCorrect: false },
          ],
        },
      },
      include: {
        choices: true,
      },
    })
    questions.push(question)
  }

  return { category, questions }
}
