import request from 'supertest'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import questionRoutes from '../../routes/questionRoutes'
import answerRoutes from '../../routes/answerRoutes'
import categoryRoutes from '../../routes/categoryRoutes'
import reviewRoutes from '../../routes/reviewRoutes'
import bookmarkRoutes from '../../routes/bookmarkRoutes'
import {
  testPrisma,
  createTestData,
  createMultipleTestQuestions,
} from '../setup'

// Create full test app with all routes
const createFullApp = () => {
  const app = express()

  // Apply middleware
  app.use(helmet())
  app.use(cors())
  app.use(morgan('combined'))
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true }))

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'OK',
      message: 'Test server is running',
      timestamp: new Date().toISOString(),
    })
  })

  // API Routes
  app.use('/api/questions', questionRoutes)
  app.use('/api/answers', answerRoutes)
  app.use('/api/categories', categoryRoutes)
  app.use('/api/review', reviewRoutes)
  app.use('/api/bookmarks', bookmarkRoutes)

  // 404 handler
  app.use('*', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found' })
  })

  // Error handler
  app.use(
    (
      err: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      console.error('API Error:', err.message)
      res.status(500).json({ error: 'Internal server error' })
    },
  )

  return app
}

describe('API Integration Tests', () => {
  let app: express.Application

  beforeEach(() => {
    app = createFullApp()
  })

  describe('Health Check', () => {
    it('should return server health status', async () => {
      const response = await request(app).get('/api/health')

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('OK')
      expect(response.body.message).toBe('Test server is running')
      expect(response.body.timestamp).toBeDefined()
    })
  })

  describe('Complete Question-Answer Flow', () => {
    it('should handle complete question answering workflow', async () => {
      // 1. Create test data
      const { category, question } = await createTestData()

      // 2. Get categories
      const categoriesResponse = await request(app).get('/api/categories')
      expect(categoriesResponse.status).toBe(200)
      expect(categoriesResponse.body).toHaveLength(1)
      expect(categoriesResponse.body[0].id).toBe(category.id)

      // 3. Get questions
      const questionsResponse = await request(app).get('/api/questions')
      expect(questionsResponse.status).toBe(200)
      expect(questionsResponse.body.questions).toHaveLength(1)
      expect(questionsResponse.body.questions[0].id).toBe(question.id)

      // 4. Get specific question details
      const questionResponse = await request(app).get(
        `/api/questions/${question.id}`,
      )
      expect(questionResponse.status).toBe(200)
      expect(questionResponse.body.question.choices).toHaveLength(4)

      // 5. Submit incorrect answer
      const incorrectChoice = question.choices.find((c: { isCorrect: boolean }) => !c.isCorrect)!
      const answerResponse = await request(app).post('/api/answers').send({
        questionId: question.id,
        choiceId: incorrectChoice.id,
        timeSpent: 45,
        deviceType: 'pc',
      })

      expect(answerResponse.status).toBe(200)
      expect(answerResponse.body.isCorrect).toBe(false)
      expect(answerResponse.body.reviewItem).toBeDefined()

      // 6. Check that question now shows as answered
      const answeredQuestionResponse = await request(app).get(
        `/api/questions/${question.id}`,
      )
      expect(answeredQuestionResponse.status).toBe(200)
      expect(answeredQuestionResponse.body.userAnswer).toBeDefined()
      expect(answeredQuestionResponse.body.userAnswer.isCorrect).toBe(false)

      // 7. Check review list
      const reviewResponse = await request(app).get('/api/review/questions')
      expect(reviewResponse.status).toBe(200)
      expect(reviewResponse.body.questions).toHaveLength(1)
      expect(reviewResponse.body.questions[0].questionId).toBe(question.id)

      // 8. Create bookmark
      const bookmarkResponse = await request(app).post('/api/bookmarks').send({
        questionId: question.id,
        memo: 'Need to review this question',
      })

      expect(bookmarkResponse.status).toBe(201)
      expect(bookmarkResponse.body.success).toBe(true)

      // 9. Check bookmark list
      const bookmarksResponse = await request(app).get('/api/bookmarks')
      expect(bookmarksResponse.status).toBe(200)
      expect(bookmarksResponse.body.data.bookmarks).toHaveLength(1)
      expect(bookmarksResponse.body.data.bookmarks[0].questionId).toBe(
        question.id,
      )
    })

    it('should handle correct answer workflow without review item creation', async () => {
      const { question } = await createTestData()

      // Submit correct answer
      const correctChoice = question.choices.find((c: { isCorrect: boolean }) => c.isCorrect)!
      const answerResponse = await request(app).post('/api/answers').send({
        questionId: question.id,
        choiceId: correctChoice.id,
        timeSpent: 30,
        deviceType: 'mobile',
      })

      expect(answerResponse.status).toBe(200)
      expect(answerResponse.body.isCorrect).toBe(true)
      expect(answerResponse.body.reviewItem).toBeNull()

      // Check review list is empty
      const reviewResponse = await request(app).get('/api/review/questions')
      expect(reviewResponse.status).toBe(200)
      expect(reviewResponse.body.questions).toHaveLength(0)
    })
  })

  describe('Multi-Category Workflow', () => {
    it('should handle questions across multiple categories', async () => {
      // Create multiple categories and questions
      const category1 = await testPrisma.category.create({
        data: { name: 'Category 1', description: 'First category' },
      })

      const category2 = await testPrisma.category.create({
        data: { name: 'Category 2', description: 'Second category' },
      })

      const question1 = await testPrisma.question.create({
        data: {
          content: 'Question in category 1',
          categoryId: category1.id,
          difficulty: 2,
          choices: {
            create: [
              { content: 'A', isCorrect: true },
              { content: 'B', isCorrect: false },
            ],
          },
        },
        include: { choices: true },
      })

      const question2 = await testPrisma.question.create({
        data: {
          content: 'Question in category 2',
          categoryId: category2.id,
          difficulty: 3,
          choices: {
            create: [
              { content: 'X', isCorrect: false },
              { content: 'Y', isCorrect: true },
            ],
          },
        },
        include: { choices: true },
      })

      // Get all categories
      const categoriesResponse = await request(app).get('/api/categories')
      expect(categoriesResponse.status).toBe(200)
      expect(categoriesResponse.body).toHaveLength(2)

      // Filter questions by category
      const category1QuestionsResponse = await request(app).get(
        `/api/questions?categoryId=${category1.id}`,
      )
      expect(category1QuestionsResponse.status).toBe(200)
      expect(category1QuestionsResponse.body.questions).toHaveLength(1)
      expect(category1QuestionsResponse.body.questions[0].categoryId).toBe(
        category1.id,
      )

      // Submit answers to both questions
      await request(app)
        .post('/api/answers')
        .send({
          questionId: question1.id,
          choiceId: question1.choices.find((c) => !c.isCorrect)!.id,
          timeSpent: 30,
        })

      await request(app)
        .post('/api/answers')
        .send({
          questionId: question2.id,
          choiceId: question2.choices.find((c) => c.isCorrect)!.id,
          timeSpent: 25,
        })

      // Check category stats
      const category1StatsResponse = await request(app).get(
        `/api/categories/${category1.id}/stats`,
      )
      expect(category1StatsResponse.status).toBe(200)
      expect(category1StatsResponse.body.summary.totalAnswers).toBe(1)
      expect(category1StatsResponse.body.summary.accuracy).toBe(0)

      const category2StatsResponse = await request(app).get(
        `/api/categories/${category2.id}/stats`,
      )
      expect(category2StatsResponse.status).toBe(200)
      expect(category2StatsResponse.body.summary.accuracy).toBe(100)
    })
  })

  describe('Review System Integration', () => {
    it('should handle complete review workflow', async () => {
      const { question } = await createTestData()
      const incorrectChoice = question.choices.find((c: { isCorrect: boolean }) => !c.isCorrect)!

      // 1. Submit incorrect answer to add to review
      const answerResponse = await request(app).post('/api/answers').send({
        questionId: question.id,
        choiceId: incorrectChoice.id,
        timeSpent: 45,
      })

      expect(answerResponse.body.reviewItem).toBeDefined()
      const _reviewItemId = answerResponse.body.reviewItem.id

      // 2. Start review session
      const sessionStartResponse = await request(app)
        .post('/api/review/session/start')
        .send({ deviceType: 'pc' })

      expect(sessionStartResponse.status).toBe(200)
      const sessionId = sessionStartResponse.body.sessionId

      // 3. Get review questions
      const reviewQuestionsResponse = await request(app).get(
        '/api/review/questions',
      )
      expect(reviewQuestionsResponse.status).toBe(200)
      expect(reviewQuestionsResponse.body.questions).toHaveLength(1)

      // 4. Submit correct answer in review
      const correctChoice = question.choices.find((c: { isCorrect: boolean }) => c.isCorrect)!
      const reviewAnswerResponse = await request(app)
        .post('/api/review/add')
        .send({
          questionId: question.id,
          isCorrect: true,
          timeSpent: 30,
          deviceType: 'pc',
        })

      expect(reviewAnswerResponse.status).toBe(200)
      expect(reviewAnswerResponse.body.reviewItem.masteryLevel).toBe(1)

      // 5. End review session
      const sessionEndResponse = await request(app)
        .put(`/api/review/session/${sessionId}/end`)
        .send({
          duration: 60,
          totalItems: 1,
          correctItems: 1,
        })

      expect(sessionEndResponse.status).toBe(200)
      expect(sessionEndResponse.body.results.accuracy).toBe(100)

      // 6. Check review schedule
      const scheduleResponse = await request(app).get('/api/review/schedule')
      expect(scheduleResponse.status).toBe(200)
      expect(scheduleResponse.body.schedule.totalActive).toBe(1)
    })
  })

  describe('Bookmark System Integration', () => {
    it('should handle complete bookmark workflow', async () => {
      const { category, question } = await createTestData()

      // 1. Check initial bookmark status
      const initialStatusResponse = await request(app).get(
        `/api/bookmarks/status/${question.id}`,
      )
      expect(initialStatusResponse.status).toBe(200)
      expect(initialStatusResponse.body.data.isBookmarked).toBe(false)

      // 2. Create bookmark
      const createResponse = await request(app).post('/api/bookmarks').send({
        questionId: question.id,
        memo: 'Important question to remember',
      })

      expect(createResponse.status).toBe(201)
      const bookmarkId = createResponse.body.data.id

      // 3. Check bookmark status after creation
      const afterCreateStatusResponse = await request(app).get(
        `/api/bookmarks/status/${question.id}`,
      )
      expect(afterCreateStatusResponse.status).toBe(200)
      expect(afterCreateStatusResponse.body.data.isBookmarked).toBe(true)
      expect(afterCreateStatusResponse.body.data.memo).toBe(
        'Important question to remember',
      )

      // 4. Update bookmark memo
      const updateResponse = await request(app)
        .put(`/api/bookmarks/${bookmarkId}`)
        .send({
          memo: 'Updated memo for this question',
        })

      expect(updateResponse.status).toBe(200)
      expect(updateResponse.body.data.memo).toBe(
        'Updated memo for this question',
      )

      // 5. Get bookmarks list
      const listResponse = await request(app).get('/api/bookmarks')
      expect(listResponse.status).toBe(200)
      expect(listResponse.body.data.bookmarks).toHaveLength(1)
      expect(listResponse.body.data.bookmarks[0].memo).toBe(
        'Updated memo for this question',
      )

      // 6. Filter bookmarks by category
      const filteredResponse = await request(app).get(
        `/api/bookmarks?categoryId=${category.id}`,
      )
      expect(filteredResponse.status).toBe(200)
      expect(filteredResponse.body.data.bookmarks).toHaveLength(1)

      // 7. Delete bookmark
      const deleteResponse = await request(app).delete(
        `/api/bookmarks/${bookmarkId}`,
      )
      expect(deleteResponse.status).toBe(200)

      // 8. Verify bookmark is deleted (soft delete)
      const finalStatusResponse = await request(app).get(
        `/api/bookmarks/status/${question.id}`,
      )
      expect(finalStatusResponse.status).toBe(200)
      expect(finalStatusResponse.body.data.isBookmarked).toBe(false)

      // 9. Verify bookmark not in list
      const finalListResponse = await request(app).get('/api/bookmarks')
      expect(finalListResponse.status).toBe(200)
      expect(finalListResponse.body.data.bookmarks).toHaveLength(0)
    })
  })

  describe('Statistics and Analytics', () => {
    it('should provide comprehensive statistics across all features', async () => {
      const { category, questions } = await createMultipleTestQuestions(4)

      // Submit various answers
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i]
        const isCorrect = i % 2 === 0
        const choice = question.choices.find((c) => c.isCorrect === isCorrect)!

        await request(app)
          .post('/api/answers')
          .send({
            questionId: question.id,
            choiceId: choice.id,
            timeSpent: 30 + i * 5,
            deviceType: i % 2 === 0 ? 'pc' : 'mobile',
          })
      }

      // Get heatmap data
      const heatmapResponse = await request(app).get('/api/answers/heatmap')
      expect(heatmapResponse.status).toBe(200)
      expect(heatmapResponse.body.heatmapData).toHaveLength(1)
      expect(heatmapResponse.body.heatmapData[0].attempts).toBe(3) // questions.length - 1

      // Get study stats
      const statsResponse = await request(app).get('/api/answers/stats')
      expect(statsResponse.status).toBe(200)
      expect(statsResponse.body.summary.totalAnswers).toBe(3)
      expect(statsResponse.body.summary.accuracy).toBeCloseTo(33.33, 1)

      // Get category-specific stats
      const categoryStatsResponse = await request(app).get(
        `/api/categories/${category.id}/stats`,
      )
      expect(categoryStatsResponse.status).toBe(200)
      expect(categoryStatsResponse.body.summary.totalAnswers).toBe(3)

      // Get review stats
      const reviewStatsResponse = await request(app).get('/api/review/stats')
      expect(reviewStatsResponse.status).toBe(200)
      // Should have review items for incorrect answers
    })
  })

  describe('Pagination and Filtering', () => {
    it('should handle pagination across different endpoints', async () => {
      const { questions } = await createMultipleTestQuestions(6)

      // Create bookmarks for all questions
      for (const question of questions) {
        await testPrisma.bookmark.create({
          data: {
            questionId: question.id,
            userId: null,
            memo: `Bookmark for ${question.id}`,
            isActive: true,
          },
        })
      }

      // Test question pagination
      const questionsPage1 = await request(app).get(
        '/api/questions?page=1&limit=2',
      )
      expect(questionsPage1.status).toBe(200)
      expect(questionsPage1.body.questions).toHaveLength(2)
      expect(questionsPage1.body.pagination.hasNextPage).toBe(true)

      const questionsPage2 = await request(app).get(
        '/api/questions?page=2&limit=2',
      )
      expect(questionsPage2.status).toBe(200)
      expect(questionsPage2.body.questions).toHaveLength(2)

      // Test bookmark pagination
      const bookmarksPage1 = await request(app).get(
        '/api/bookmarks?page=1&limit=3',
      )
      expect(bookmarksPage1.status).toBe(200)
      expect(bookmarksPage1.body.data.bookmarks).toHaveLength(3)

      const bookmarksPage2 = await request(app).get(
        '/api/bookmarks?page=2&limit=3',
      )
      expect(bookmarksPage2.status).toBe(200)
      expect(bookmarksPage2.body.data.bookmarks).toHaveLength(2) // Remaining bookmarks
    })
  })

  describe('Error Handling Integration', () => {
    it('should handle cascading errors gracefully', async () => {
      // Try to answer non-existent question
      const nonExistentAnswerResponse = await request(app)
        .post('/api/answers')
        .send({
          questionId: 'non-existent-id',
          choiceId: 'non-existent-choice-id',
        })

      expect(nonExistentAnswerResponse.status).toBe(404)

      // Try to bookmark non-existent question
      const nonExistentBookmarkResponse = await request(app)
        .post('/api/bookmarks')
        .send({
          questionId: 'non-existent-id',
        })

      expect(nonExistentBookmarkResponse.status).toBe(404)

      // Try to get stats for non-existent category
      const nonExistentCategoryResponse = await request(app).get(
        '/api/categories/non-existent-id/stats',
      )

      expect(nonExistentCategoryResponse.status).toBe(404)
    })

    it('should validate data consistency across endpoints', async () => {
      const { question } = await createTestData()

      // Submit answer
      const choice = question.choices.find((c: { isCorrect: boolean }) => !c.isCorrect)!
      await request(app).post('/api/answers').send({
        questionId: question.id,
        choiceId: choice.id,
        timeSpent: 30,
      })

      // Create bookmark
      await request(app).post('/api/bookmarks').send({
        questionId: question.id,
        memo: 'Test bookmark',
      })

      // Verify data consistency
      const questionResponse = await request(app).get(
        `/api/questions/${question.id}`,
      )
      expect(questionResponse.body.userAnswer).toBeDefined()

      const bookmarkStatusResponse = await request(app).get(
        `/api/bookmarks/status/${question.id}`,
      )
      expect(bookmarkStatusResponse.body.data.isBookmarked).toBe(true)

      const reviewResponse = await request(app).get('/api/review/questions')
      expect(reviewResponse.body.questions).toHaveLength(1)
    })
  })

  describe('Performance and Concurrency', () => {
    it('should handle concurrent requests', async () => {
      const { questions } = await createMultipleTestQuestions(5)

      // Simulate concurrent answer submissions
      const promises = questions.map((question, index) => {
        const choice = question.choices.find(
          (c) => c.isCorrect === (index % 2 === 0),
        )!
        return request(app)
          .post('/api/answers')
          .send({
            questionId: question.id,
            choiceId: choice.id,
            timeSpent: 30 + index * 5,
          })
      })

      const responses = await Promise.all(promises)

      // All requests should succeed
      responses.forEach((response) => {
        expect(response.status).toBe(200)
      })

      // Verify all answers were recorded
      const statsResponse = await request(app).get('/api/answers/stats')
      expect(statsResponse.status).toBe(200)
      expect(statsResponse.body.summary.totalAnswers).toBe(4) // questions.length - 1
    })
  })

  describe('API Contract Consistency', () => {
    it('should maintain consistent response formats across endpoints', async () => {
      const { category, question } = await createTestData()

      // Check question response format
      const questionResponse = await request(app).get(
        `/api/questions/${question.id}`,
      )
      expect(questionResponse.body).toHaveProperty('question')
      expect(questionResponse.body.question).toHaveProperty('id')
      expect(questionResponse.body.question).toHaveProperty('content')
      expect(questionResponse.body.question).toHaveProperty('choices')

      // Check category response format
      const categoriesResponse = await request(app).get('/api/categories')
      expect(Array.isArray(categoriesResponse.body)).toBe(true)
      if (categoriesResponse.body.length > 0) {
        expect(categoriesResponse.body[0]).toHaveProperty('id')
        expect(categoriesResponse.body[0]).toHaveProperty('name')
        expect(categoriesResponse.body[0]).toHaveProperty('totalQuestions')
      }

      // Check bookmark response format
      const bookmarksResponse = await request(app).get('/api/bookmarks')
      expect(bookmarksResponse.body).toHaveProperty('success')
      expect(bookmarksResponse.body).toHaveProperty('data')
      expect(bookmarksResponse.body.data).toHaveProperty('bookmarks')
      expect(bookmarksResponse.body.data).toHaveProperty('pagination')
    })

    it('should handle HTTP status codes correctly', async () => {
      const { question } = await createTestData()

      // 200 for successful GET
      const getResponse = await request(app).get(
        `/api/questions/${question.id}`,
      )
      expect(getResponse.status).toBe(200)

      // 201 for successful creation
      const createResponse = await request(app)
        .post('/api/bookmarks')
        .send({ questionId: question.id })
      expect(createResponse.status).toBe(201)

      // 404 for not found
      const notFoundResponse = await request(app).get(
        '/api/questions/non-existent-id',
      )
      expect(notFoundResponse.status).toBe(404)

      // 400 for bad request
      const badRequestResponse = await request(app)
        .post('/api/answers')
        .send({ questionId: 'missing-choice-id' })
      expect(badRequestResponse.status).toBe(400)
    })
  })
})
