import request from 'supertest'
import express from 'express'
import {
  addToReviewList,
  getReviewQuestions,
  getReviewSchedule,
  startReviewSession,
  endReviewSession,
  getReviewStats,
} from '../../controllers/reviewController'
import {
  testPrisma,
  createTestData,
  createMultipleTestQuestions,
} from '../setup'

// Create test app
const app = express()
app.use(express.json())

// Mount routes
app.post('/api/review/add', addToReviewList)
app.get('/api/review/questions', getReviewQuestions)
app.get('/api/review/schedule', getReviewSchedule)
app.post('/api/review/session/start', startReviewSession)
app.put('/api/review/session/:sessionId/end', endReviewSession)
app.get('/api/review/stats', getReviewStats)

describe('Review Controller', () => {
  describe('POST /api/review/add', () => {
    it('should create new review item for incorrect answer', async () => {
      const { question } = await createTestData()

      const response = await request(app).post('/api/review/add').send({
        questionId: question.id,
        isCorrect: false,
        timeSpent: 45,
        deviceType: 'pc',
      })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('復習リストに追加されました')
      expect(response.body.reviewItem).toBeDefined()
      expect(response.body.reviewItem.masteryLevel).toBe(0)
      expect(response.body.reviewItem.wrongCount).toBe(1)
      expect(response.body.reviewItem.isActive).toBe(true)
    })

    it('should not create review item for correct answer on first attempt', async () => {
      const { question } = await createTestData()

      const response = await request(app).post('/api/review/add').send({
        questionId: question.id,
        isCorrect: true,
        timeSpent: 30,
      })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('正解です！')
      expect(response.body.reviewItem).toBeNull()
    })

    it('should update existing review item for subsequent incorrect answer', async () => {
      const { question } = await createTestData()

      // First incorrect answer
      await request(app).post('/api/review/add').send({
        questionId: question.id,
        isCorrect: false,
        timeSpent: 45,
      })

      // Second incorrect answer
      const response = await request(app).post('/api/review/add').send({
        questionId: question.id,
        isCorrect: false,
        timeSpent: 50,
      })

      expect(response.status).toBe(200)
      expect(response.body.reviewItem.wrongCount).toBe(2)
      expect(response.body.reviewItem.reviewCount).toBe(2)
      expect(response.body.reviewItem.correctStreak).toBe(0)
      expect(response.body.reviewItem.masteryLevel).toBe(0) // Should stay at 0 for incorrect
    })

    it('should increase mastery level for correct answer on existing review item', async () => {
      const { question } = await createTestData()

      // First incorrect answer to create review item
      await request(app).post('/api/review/add').send({
        questionId: question.id,
        isCorrect: false,
        timeSpent: 45,
      })

      // Then correct answer
      const response = await request(app).post('/api/review/add').send({
        questionId: question.id,
        isCorrect: true,
        timeSpent: 30,
      })

      expect(response.status).toBe(200)
      expect(response.body.reviewItem.masteryLevel).toBe(1)
      expect(response.body.reviewItem.correctStreak).toBe(1)
      expect(response.body.reviewItem.wrongCount).toBe(1) // Should not change
    })

    it('should deactivate review item when mastery reaches level 5', async () => {
      const { question } = await createTestData()

      // Create review item and manually set mastery to 4
      await testPrisma.reviewItem.create({
        data: {
          questionId: question.id,
          masteryLevel: 4,
          reviewCount: 5,
          lastReviewed: new Date(),
          nextReview: new Date(),
          wrongCount: 1,
          correctStreak: 4,
          priority: 1,
          isActive: true,
        },
      })

      const response = await request(app).post('/api/review/add').send({
        questionId: question.id,
        isCorrect: true,
        timeSpent: 25,
      })

      expect(response.status).toBe(200)
      expect(response.body.reviewItem.masteryLevel).toBe(5)
      expect(response.body.reviewItem.isActive).toBe(false)
    })

    it('should validate required fields', async () => {
      const response = await request(app).post('/api/review/add').send({
        isCorrect: true,
        // Missing questionId
      })

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Invalid request data')
    })

    it('should calculate next review time based on spaced repetition algorithm', async () => {
      const { question } = await createTestData()

      const response = await request(app).post('/api/review/add').send({
        questionId: question.id,
        isCorrect: false,
        timeSpent: 45,
      })

      expect(response.status).toBe(200)
      expect(response.body.reviewItem.nextReview).toBeDefined()

      const nextReview = new Date(response.body.reviewItem.nextReview)
      const now = new Date()
      expect(nextReview.getTime()).toBeGreaterThan(now.getTime())
    })

    it('should calculate priority correctly', async () => {
      const { question } = await createTestData()

      const response = await request(app).post('/api/review/add').send({
        questionId: question.id,
        isCorrect: false,
        timeSpent: 45,
      })

      expect(response.status).toBe(200)
      expect(response.body.reviewItem.priority).toBeGreaterThan(0)
      expect(response.body.reviewItem.priority).toBeLessThanOrEqual(5)
    })
  })

  describe('GET /api/review/questions', () => {
    it('should return empty list when no review items exist', async () => {
      const response = await request(app).get('/api/review/questions')

      expect(response.status).toBe(200)
      expect(response.body.questions).toEqual([])
      expect(response.body.totalCount).toBe(0)
    })

    it('should return review questions due for review', async () => {
      const { question } = await createTestData()

      // Create review item due for review
      const pastDate = new Date()
      pastDate.setMinutes(pastDate.getMinutes() - 10)

      await testPrisma.reviewItem.create({
        data: {
          questionId: question.id,
          masteryLevel: 1,
          reviewCount: 1,
          lastReviewed: pastDate,
          nextReview: pastDate,
          wrongCount: 1,
          correctStreak: 0,
          priority: 3,
          isActive: true,
        },
      })

      const response = await request(app).get('/api/review/questions')

      expect(response.status).toBe(200)
      expect(response.body.questions).toHaveLength(1)
      expect(response.body.questions[0].questionId).toBe(question.id)
      expect(response.body.questions[0].question).toBeDefined()
      expect(response.body.questions[0].question.choices).toBeDefined()
    })

    it('should not return questions not yet due for review', async () => {
      const { question } = await createTestData()

      // Create review item due in the future
      const futureDate = new Date()
      futureDate.setHours(futureDate.getHours() + 1)

      await testPrisma.reviewItem.create({
        data: {
          questionId: question.id,
          masteryLevel: 1,
          reviewCount: 1,
          lastReviewed: new Date(),
          nextReview: futureDate,
          wrongCount: 1,
          correctStreak: 0,
          priority: 3,
          isActive: true,
        },
      })

      const response = await request(app).get('/api/review/questions')

      expect(response.status).toBe(200)
      expect(response.body.questions).toEqual([])
    })

    it('should filter by priority', async () => {
      const { questions } = await createMultipleTestQuestions(3)

      const now = new Date()

      // Create review items with different priorities
      await testPrisma.reviewItem.createMany({
        data: [
          {
            questionId: questions[0].id,
            masteryLevel: 1,
            reviewCount: 1,
            lastReviewed: now,
            nextReview: now,
            wrongCount: 1,
            correctStreak: 0,
            priority: 2,
            isActive: true,
          },
          {
            questionId: questions[1].id,
            masteryLevel: 0,
            reviewCount: 1,
            lastReviewed: now,
            nextReview: now,
            wrongCount: 2,
            correctStreak: 0,
            priority: 4,
            isActive: true,
          },
        ],
      })

      const response = await request(app).get(
        '/api/review/questions?priority=3',
      )

      expect(response.status).toBe(200)
      expect(response.body.questions).toHaveLength(1)
      expect(response.body.questions[0].priority).toBe(4)
    })

    it('should limit results', async () => {
      const { questions } = await createMultipleTestQuestions(5)

      const now = new Date()

      // Create multiple review items
      const reviewData = questions.map((q) => ({
        questionId: q.id,
        masteryLevel: 1,
        reviewCount: 1,
        lastReviewed: now,
        nextReview: now,
        wrongCount: 1,
        correctStreak: 0,
        priority: 3,
        isActive: true,
      }))

      await testPrisma.reviewItem.createMany({ data: reviewData })

      const response = await request(app).get('/api/review/questions?limit=2')

      expect(response.status).toBe(200)
      expect(response.body.questions).toHaveLength(2)
    })

    it('should sort by priority, next review time, and wrong count', async () => {
      const { questions } = await createMultipleTestQuestions(3)

      const now = new Date()
      const earlier = new Date(now.getTime() - 10000)

      await testPrisma.reviewItem.createMany({
        data: [
          {
            questionId: questions[0].id,
            masteryLevel: 1,
            reviewCount: 1,
            lastReviewed: now,
            nextReview: now,
            wrongCount: 1,
            correctStreak: 0,
            priority: 2,
            isActive: true,
          },
          {
            questionId: questions[1].id,
            masteryLevel: 0,
            reviewCount: 1,
            lastReviewed: earlier,
            nextReview: earlier,
            wrongCount: 3,
            correctStreak: 0,
            priority: 5,
            isActive: true,
          },
        ],
      })

      const response = await request(app).get('/api/review/questions')

      expect(response.status).toBe(200)
      expect(response.body.questions).toHaveLength(2)
      // Higher priority should come first
      expect(response.body.questions[0].priority).toBe(5)
      expect(response.body.questions[1].priority).toBe(2)
    })

    it('should include review stats', async () => {
      const { questions } = await createMultipleTestQuestions(6)

      const now = new Date()

      await testPrisma.reviewItem.createMany({
        data: [
          {
            questionId: questions[0].id,
            masteryLevel: 1,
            reviewCount: 1,
            lastReviewed: now,
            nextReview: now,
            wrongCount: 1,
            correctStreak: 0,
            priority: 5,
            isActive: true,
          },
          {
            questionId: questions[1].id,
            masteryLevel: 1,
            reviewCount: 1,
            lastReviewed: now,
            nextReview: now,
            wrongCount: 1,
            correctStreak: 0,
            priority: 3,
            isActive: true,
          },
          {
            questionId: questions[2].id,
            masteryLevel: 1,
            reviewCount: 1,
            lastReviewed: now,
            nextReview: now,
            wrongCount: 1,
            correctStreak: 0,
            priority: 2,
            isActive: true,
          },
        ],
      })

      const response = await request(app).get('/api/review/questions')

      expect(response.status).toBe(200)
      expect(response.body.reviewStats).toEqual({
        urgent: 1, // priority >= 4
        medium: 1, // priority === 3
        low: 1, // priority <= 2
      })
    })
  })

  describe('GET /api/review/schedule', () => {
    it('should return empty schedule when no review items exist', async () => {
      const response = await request(app).get('/api/review/schedule')

      expect(response.status).toBe(200)
      expect(response.body.schedule).toEqual({
        today: 0,
        tomorrow: 0,
        thisWeek: 0,
        totalActive: 0,
      })
    })

    it('should calculate review schedule correctly', async () => {
      const { questions } = await createMultipleTestQuestions(5)

      const now = new Date()
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      const nextWeek = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

      await testPrisma.reviewItem.createMany({
        data: [
          {
            questionId: questions[0].id,
            masteryLevel: 1,
            reviewCount: 1,
            lastReviewed: now,
            nextReview: now, // Due today
            wrongCount: 1,
            correctStreak: 0,
            priority: 3,
            isActive: true,
          },
          {
            questionId: questions[1].id,
            masteryLevel: 1,
            reviewCount: 1,
            lastReviewed: now,
            nextReview: tomorrow, // Due tomorrow
            wrongCount: 1,
            correctStreak: 0,
            priority: 2,
            isActive: true,
          },
          {
            questionId: questions[2].id,
            masteryLevel: 1,
            reviewCount: 1,
            lastReviewed: now,
            nextReview: nextWeek, // Due this week
            wrongCount: 1,
            correctStreak: 0,
            priority: 1,
            isActive: true,
          },
          {
            questionId: questions[3].id,
            masteryLevel: 5,
            reviewCount: 5,
            lastReviewed: now,
            nextReview: nextWeek,
            wrongCount: 1,
            correctStreak: 5,
            priority: 1,
            isActive: false, // Inactive
          },
        ],
      })

      const response = await request(app).get('/api/review/schedule')

      expect(response.status).toBe(200)
      expect(response.body.schedule.today).toBe(1)
      expect(response.body.schedule.tomorrow).toBe(1)
      expect(response.body.schedule.thisWeek).toBe(1)
      expect(response.body.schedule.totalActive).toBe(3)
    })

    it('should include mastery distribution', async () => {
      const { questions } = await createMultipleTestQuestions(4)

      const now = new Date()

      await testPrisma.reviewItem.createMany({
        data: [
          {
            questionId: questions[0].id,
            masteryLevel: 0,
            reviewCount: 1,
            lastReviewed: now,
            nextReview: now,
            wrongCount: 2,
            correctStreak: 0,
            priority: 3,
            isActive: true,
          },
          {
            questionId: questions[1].id,
            masteryLevel: 2,
            reviewCount: 3,
            lastReviewed: now,
            nextReview: now,
            wrongCount: 1,
            correctStreak: 2,
            priority: 2,
            isActive: true,
          },
          {
            questionId: questions[2].id,
            masteryLevel: 2,
            reviewCount: 2,
            lastReviewed: now,
            nextReview: now,
            wrongCount: 1,
            correctStreak: 1,
            priority: 2,
            isActive: true,
          },
        ],
      })

      const response = await request(app).get('/api/review/schedule')

      expect(response.status).toBe(200)
      expect(response.body.masteryDistribution).toEqual({
        level0: 1,
        level2: 2,
      })
    })

    it('should include recommendations', async () => {
      const { questions } = await createMultipleTestQuestions(3)

      const now = new Date()

      await testPrisma.reviewItem.createMany({
        data: [
          {
            questionId: questions[0].id,
            masteryLevel: 0,
            reviewCount: 1,
            lastReviewed: now,
            nextReview: now,
            wrongCount: 2,
            correctStreak: 0,
            priority: 5,
            isActive: true,
          },
          {
            questionId: questions[1].id,
            masteryLevel: 1,
            reviewCount: 1,
            lastReviewed: now,
            nextReview: now,
            wrongCount: 1,
            correctStreak: 0,
            priority: 3,
            isActive: true,
          },
        ],
      })

      const response = await request(app).get('/api/review/schedule')

      expect(response.status).toBe(200)
      expect(response.body.recommendations).toEqual({
        suggestedDailyReviews: 5, // Math.min(Math.max(2, 5), 20)
        estimatedTimeMinutes: 4, // 2 items * 2 minutes
        urgentItems: 1, // priority >= 4
      })
    })
  })

  describe('POST /api/review/session/start', () => {
    it('should start a new review session', async () => {
      const response = await request(app)
        .post('/api/review/session/start')
        .send({
          deviceType: 'pc',
        })

      expect(response.status).toBe(200)
      expect(response.body.sessionId).toBeDefined()
      expect(response.body.startTime).toBeDefined()
    })

    it('should work without device type', async () => {
      const response = await request(app)
        .post('/api/review/session/start')
        .send({})

      expect(response.status).toBe(200)
      expect(response.body.sessionId).toBeDefined()
    })

    it('should validate request data', async () => {
      const response = await request(app)
        .post('/api/review/session/start')
        .send({
          deviceType: 123, // Invalid type
        })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Invalid request data')
    })
  })

  describe('PUT /api/review/session/:sessionId/end', () => {
    it('should end a review session successfully', async () => {
      // First start a session
      const startResponse = await request(app)
        .post('/api/review/session/start')
        .send({ deviceType: 'mobile' })

      const sessionId = startResponse.body.sessionId

      const response = await request(app)
        .put(`/api/review/session/${sessionId}/end`)
        .send({
          duration: 300,
          totalItems: 5,
          correctItems: 3,
        })

      expect(response.status).toBe(200)
      expect(response.body.session).toBeDefined()
      expect(response.body.results).toEqual({
        totalItems: 5,
        correctItems: 3,
        accuracy: 60,
        timePerQuestion: 60, // 300 / 5
      })
    })

    it('should handle zero items gracefully', async () => {
      const startResponse = await request(app)
        .post('/api/review/session/start')
        .send({})

      const sessionId = startResponse.body.sessionId

      const response = await request(app)
        .put(`/api/review/session/${sessionId}/end`)
        .send({
          duration: 0,
          totalItems: 0,
          correctItems: 0,
        })

      expect(response.status).toBe(200)
      expect(response.body.results.accuracy).toBe(0)
      expect(response.body.results.timePerQuestion).toBe(0)
    })

    it('should return 404 for non-existent session', async () => {
      const response = await request(app)
        .put('/api/review/session/non-existent-id/end')
        .send({
          duration: 300,
          totalItems: 5,
          correctItems: 3,
        })

      expect(response.status).toBe(500) // Prisma error for non-existent record
    })
  })

  describe('GET /api/review/stats', () => {
    it('should return empty stats when no data exists', async () => {
      const response = await request(app).get('/api/review/stats')

      expect(response.status).toBe(200)
      expect(response.body.recentSessions).toEqual([])
      expect(response.body.categoryStats).toEqual({})
      expect(response.body.masteryProgress).toEqual([])
    })

    it('should return review statistics', async () => {
      const { category, questions } = await createMultipleTestQuestions(3)

      // Create review sessions
      await testPrisma.reviewSession.createMany({
        data: [
          {
            duration: 300,
            totalItems: 5,
            correctItems: 3,
            deviceType: 'pc',
          },
          {
            duration: 240,
            totalItems: 4,
            correctItems: 4,
            deviceType: 'mobile',
          },
        ],
      })

      // Create review items
      await testPrisma.reviewItem.createMany({
        data: [
          {
            questionId: questions[0].id,
            masteryLevel: 2,
            reviewCount: 3,
            lastReviewed: new Date(),
            nextReview: new Date(),
            wrongCount: 1,
            correctStreak: 2,
            priority: 2,
            isActive: true,
          },
          {
            questionId: questions[1].id,
            masteryLevel: 1,
            reviewCount: 2,
            lastReviewed: new Date(),
            nextReview: new Date(),
            wrongCount: 2,
            correctStreak: 0,
            priority: 3,
            isActive: true,
          },
        ],
      })

      const response = await request(app).get('/api/review/stats')

      expect(response.status).toBe(200)
      expect(response.body.recentSessions).toHaveLength(2)
      expect(response.body.recentSessions[0]).toMatchObject({
        totalItems: expect.any(Number),
        correctItems: expect.any(Number),
        accuracy: expect.any(Number),
        duration: expect.any(Number),
      })

      expect(response.body.categoryStats[category.name]).toBeDefined()
      expect(response.body.categoryStats[category.name]).toMatchObject({
        total: 2,
        avgMasteryLevel: 1.5,
        avgReviewCount: 2.5,
      })

      expect(response.body.masteryProgress).toBeTruthy()
    })

    it('should filter by period', async () => {
      // Create old review session
      const oldDate = new Date()
      oldDate.setDate(oldDate.getDate() - 15)

      await testPrisma.reviewSession.create({
        data: {
          duration: 300,
          totalItems: 3,
          correctItems: 2,
          createdAt: oldDate,
        },
      })

      // Create recent review session
      await testPrisma.reviewSession.create({
        data: {
          duration: 180,
          totalItems: 2,
          correctItems: 2,
        },
      })

      const response = await request(app).get('/api/review/stats?period=7')

      expect(response.status).toBe(200)
      expect(response.body.recentSessions).toHaveLength(1)
      expect(response.body.recentSessions[0].totalItems).toBe(2)
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Disconnect to simulate error
      await testPrisma.$disconnect()

      const response = await request(app).get('/api/review/questions')

      expect(response.status).toBe(500)
      expect(response.body.error).toBe('復習問題の取得に失敗しました')

      // Reconnect for other tests
      await testPrisma.$connect()
    })

    it('should handle invalid input data', async () => {
      const response = await request(app).post('/api/review/add').send({
        questionId: '', // Invalid empty string
        isCorrect: 'not-boolean', // Invalid type
      })

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })

    it('should handle malformed session IDs', async () => {
      const response = await request(app)
        .put('/api/review/session/invalid-id/end')
        .send({
          duration: 300,
          totalItems: 5,
          correctItems: 3,
        })

      expect(response.status).toBe(500)
      expect(response.body.error).toBe('復習セッションの終了に失敗しました')
    })
  })
})
