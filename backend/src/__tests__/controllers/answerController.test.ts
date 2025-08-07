import request from 'supertest'
import express from 'express'
import {
  submitAnswer,
  getHeatmapData,
  getStudyStats,
} from '../../controllers/answerController'
import {
  testPrisma,
  createTestData,
  createMultipleTestQuestions,
} from '../setup'

// Create test app
const app = express()
app.use(express.json())

// Mount routes
app.post('/api/answers', submitAnswer)
app.get('/api/answers/heatmap', getHeatmapData)
app.get('/api/answers/stats', getStudyStats)

describe('Answer Controller', () => {
  describe('POST /api/answers', () => {
    it('should submit correct answer successfully', async () => {
      const { question } = await createTestData()
      const correctChoice = question.choices.find((c: { isCorrect: boolean }) => c.isCorrect)!

      const response = await request(app).post('/api/answers').send({
        questionId: question.id,
        choiceId: correctChoice.id,
        timeSpent: 45,
        deviceType: 'pc',
      })

      expect(response.status).toBe(200)
      expect(response.body.isCorrect).toBe(true)
      expect(response.body.correctChoiceId).toBe(correctChoice.id)
      expect(response.body.explanation).toBe(question.explanation)
      expect(response.body.timeSpent).toBe(45)
      expect(response.body.answerId).toBeDefined()
    })

    it('should submit incorrect answer and create review item', async () => {
      const { question } = await createTestData()
      const incorrectChoice = question.choices.find((c: { isCorrect: boolean }) => !c.isCorrect)!

      const response = await request(app).post('/api/answers').send({
        questionId: question.id,
        choiceId: incorrectChoice.id,
        timeSpent: 30,
        deviceType: 'mobile',
      })

      expect(response.status).toBe(200)
      expect(response.body.isCorrect).toBe(false)
      expect(response.body.reviewItem).toBeDefined()
      expect(response.body.reviewItem.masteryLevel).toBe(0)
      expect(response.body.reviewItem.priority).toBeGreaterThan(0)

      // Verify review item was created in database
      const reviewItem = await testPrisma.reviewItem.findUnique({
        where: { questionId: question.id },
      })
      expect(reviewItem).toBeDefined()
      expect(reviewItem!.wrongCount).toBe(1)
      expect(reviewItem!.isActive).toBe(true)
    })

    it('should update existing review item on subsequent incorrect answer', async () => {
      const { question } = await createTestData()
      const incorrectChoice = question.choices.find((c: { isCorrect: boolean }) => !c.isCorrect)!

      // First incorrect answer
      await request(app).post('/api/answers').send({
        questionId: question.id,
        choiceId: incorrectChoice.id,
        timeSpent: 30,
      })

      // Second incorrect answer
      const response = await request(app).post('/api/answers').send({
        questionId: question.id,
        choiceId: incorrectChoice.id,
        timeSpent: 25,
      })

      expect(response.status).toBe(200)
      expect(response.body.reviewItem.wrongCount).toBe(2)
      expect(response.body.reviewItem.reviewCount).toBe(2)
      expect(response.body.reviewItem.correctStreak).toBe(0)
    })

    it('should update review item and increase mastery on correct answer', async () => {
      const { question } = await createTestData()
      const incorrectChoice = question.choices.find((c: { isCorrect: boolean }) => !c.isCorrect)!
      const correctChoice = question.choices.find((c: { isCorrect: boolean }) => c.isCorrect)!

      // First incorrect answer to create review item
      await request(app).post('/api/answers').send({
        questionId: question.id,
        choiceId: incorrectChoice.id,
        timeSpent: 30,
      })

      // Then correct answer
      const response = await request(app).post('/api/answers').send({
        questionId: question.id,
        choiceId: correctChoice.id,
        timeSpent: 20,
      })

      expect(response.status).toBe(200)
      expect(response.body.reviewItem.masteryLevel).toBe(1)
      expect(response.body.reviewItem.correctStreak).toBe(1)
    })

    it('should require questionId and choiceId', async () => {
      const response = await request(app).post('/api/answers').send({
        timeSpent: 30,
      })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('QuestionId and choiceId are required')
    })

    it('should return 404 for non-existent choice', async () => {
      const { question } = await createTestData()

      const response = await request(app).post('/api/answers').send({
        questionId: question.id,
        choiceId: 'non-existent-choice-id',
        timeSpent: 30,
      })

      expect(response.status).toBe(404)
      expect(response.body.error).toBe('Choice not found')
    })

    it('should handle optional parameters correctly', async () => {
      const { question } = await createTestData()
      const correctChoice = question.choices.find((c: { isCorrect: boolean }) => c.isCorrect)!

      const response = await request(app).post('/api/answers').send({
        questionId: question.id,
        choiceId: correctChoice.id,
        // No timeSpent or deviceType
      })

      expect(response.status).toBe(200)
      expect(response.body.timeSpent).toBeNull()
    })

    it('should not create review item for correct answer on first attempt', async () => {
      const { question } = await createTestData()
      const correctChoice = question.choices.find((c: { isCorrect: boolean }) => c.isCorrect)!

      const response = await request(app).post('/api/answers').send({
        questionId: question.id,
        choiceId: correctChoice.id,
        timeSpent: 30,
      })

      expect(response.status).toBe(200)
      expect(response.body.reviewItem).toBeNull()

      // Verify no review item was created
      const reviewItem = await testPrisma.reviewItem.findUnique({
        where: { questionId: question.id },
      })
      expect(reviewItem).toBeNull()
    })

    it('should deactivate review item when mastery level reaches 5', async () => {
      const { question } = await createTestData()
      const correctChoice = question.choices.find((c: { isCorrect: boolean }) => c.isCorrect)!
      const incorrectChoice = question.choices.find((c: { isCorrect: boolean }) => !c.isCorrect)!

      // Create review item with incorrect answer
      await request(app).post('/api/answers').send({
        questionId: question.id,
        choiceId: incorrectChoice.id,
      })

      // Manually set mastery level to 4
      await testPrisma.reviewItem.update({
        where: { questionId: question.id },
        data: { masteryLevel: 4 },
      })

      // Submit correct answer to reach mastery level 5
      const response = await request(app).post('/api/answers').send({
        questionId: question.id,
        choiceId: correctChoice.id,
      })

      expect(response.status).toBe(200)
      expect(response.body.reviewItem.masteryLevel).toBe(5)
      expect(response.body.reviewItem.isActive).toBe(false)
    })
  })

  describe('GET /api/answers/heatmap', () => {
    it('should return empty heatmap when no answers exist', async () => {
      const response = await request(app).get('/api/answers/heatmap')

      expect(response.status).toBe(200)
      expect(response.body.heatmapData).toEqual([])
      expect(response.body.period).toBe('30日間')
    })

    it('should return heatmap data with category statistics', async () => {
      const { category, questions } = await createMultipleTestQuestions(3)

      // Submit answers for different questions
      for (let i = 0; i < questions.length; i++) {
        await testPrisma.answer.create({
          data: {
            questionId: questions[i].id,
            isCorrect: i % 2 === 0, // Alternate correct/incorrect
            timeSpent: 30,
          },
        })
      }

      const response = await request(app).get('/api/answers/heatmap')

      expect(response.status).toBe(200)
      expect(response.body.heatmapData).toHaveLength(1)
      expect(response.body.heatmapData[0].categoryId).toBe(category.id)
      expect(response.body.heatmapData[0].categoryName).toBe(category.name)
      expect(response.body.heatmapData[0].attempts).toBeGreaterThan(0)
      expect(response.body.heatmapData[0].accuracy).toBeGreaterThanOrEqual(0)
      expect(
        response.body.heatmapData[0].colorIntensity,
      ).toBeGreaterThanOrEqual(0)
    })

    it('should filter by custom day period', async () => {
      const { questions } = await createMultipleTestQuestions(2)

      // Create old answer (outside 7 day period)
      const oldDate = new Date()
      oldDate.setDate(oldDate.getDate() - 10)

      await testPrisma.answer.create({
        data: {
          questionId: questions[0].id,
          isCorrect: true,
          timeSpent: 30,
          createdAt: oldDate,
        },
      })

      // Create recent answer
      await testPrisma.answer.create({
        data: {
          questionId: questions[1].id,
          isCorrect: false,
          timeSpent: 45,
        },
      })

      const response = await request(app).get('/api/answers/heatmap?days=7')

      expect(response.status).toBe(200)
      expect(response.body.period).toBe('7日間')
      // Should only include recent answer
      expect(response.body.heatmapData[0].attempts).toBe(1)
    })
  })

  describe('GET /api/answers/stats', () => {
    it('should return empty stats when no answers exist', async () => {
      const response = await request(app).get('/api/answers/stats')

      expect(response.status).toBe(200)
      expect(response.body.summary.totalAnswers).toBe(0)
      expect(response.body.summary.correctAnswers).toBe(0)
      expect(response.body.summary.accuracy).toBe(0)
      expect(response.body.daily).toEqual([])
    })

    it('should return study statistics', async () => {
      const { questions } = await createMultipleTestQuestions(3)

      // Create answers with different dates
      const today = new Date()
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      await testPrisma.answer.createMany({
        data: [
          {
            questionId: questions[0].id,
            isCorrect: true,
            timeSpent: 30,
            deviceType: 'pc',
            createdAt: today,
          },
          {
            questionId: questions[1].id,
            isCorrect: false,
            timeSpent: 45,
            deviceType: 'mobile',
            createdAt: today,
          },
          {
            questionId: questions[2].id,
            isCorrect: true,
            timeSpent: 25,
            deviceType: 'pc',
            createdAt: yesterday,
          },
        ],
      })

      const response = await request(app).get('/api/answers/stats')

      expect(response.status).toBe(200)
      expect(response.body.summary.totalAnswers).toBe(3)
      expect(response.body.summary.correctAnswers).toBe(2)
      expect(response.body.summary.accuracy).toBeCloseTo(66.67, 1)
      expect(response.body.daily).toHaveLength(2)
    })

    it('should filter by device type', async () => {
      const { questions } = await createMultipleTestQuestions(3)

      await testPrisma.answer.createMany({
        data: [
          {
            questionId: questions[0].id,
            isCorrect: true,
            deviceType: 'pc',
          },
          {
            questionId: questions[1].id,
            isCorrect: false,
            deviceType: 'mobile',
          },
        ],
      })

      const response = await request(app).get(
        '/api/answers/stats?deviceType=pc',
      )

      expect(response.status).toBe(200)
      expect(response.body.summary.totalAnswers).toBe(1)
      expect(response.body.summary.correctAnswers).toBe(1)
      expect(response.body.summary.accuracy).toBe(100)
    })

    it('should filter by category', async () => {
      const { category, questions } = await createMultipleTestQuestions(2)

      // Create another category
      const otherCategory = await testPrisma.category.create({
        data: { name: 'Other Category', description: 'Other' },
      })

      const otherQuestion = await testPrisma.question.create({
        data: {
          content: 'Other question',
          categoryId: otherCategory.id,
          difficulty: 1,
          choices: {
            create: [
              { content: 'Choice A', isCorrect: true },
              { content: 'Choice B', isCorrect: false },
            ],
          },
        },
      })

      await testPrisma.answer.createMany({
        data: [
          {
            questionId: questions[0].id,
            isCorrect: true,
          },
          {
            questionId: otherQuestion.id,
            isCorrect: false,
          },
        ],
      })

      const response = await request(app).get(
        `/api/answers/stats?categoryId=${category.id}`,
      )

      expect(response.status).toBe(200)
      expect(response.body.summary.totalAnswers).toBe(1)
      expect(response.body.summary.correctAnswers).toBe(1)
    })

    it('should filter by custom day period', async () => {
      const { questions } = await createMultipleTestQuestions(2)

      // Create old answer
      const oldDate = new Date()
      oldDate.setDate(oldDate.getDate() - 10)

      await testPrisma.answer.createMany({
        data: [
          {
            questionId: questions[0].id,
            isCorrect: true,
            createdAt: oldDate,
          },
          {
            questionId: questions[1].id,
            isCorrect: false,
          },
        ],
      })

      const response = await request(app).get('/api/answers/stats?days=5')

      expect(response.status).toBe(200)
      expect(response.body.summary.totalAnswers).toBe(1)
      expect(response.body.summary.period).toBe('5日間')
    })

    it('should calculate daily statistics correctly', async () => {
      const { questions } = await createMultipleTestQuestions(3)

      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]

      await testPrisma.answer.createMany({
        data: [
          {
            questionId: questions[0].id,
            isCorrect: true,
            timeSpent: 30,
            createdAt: today,
          },
          {
            questionId: questions[1].id,
            isCorrect: false,
            timeSpent: 60,
            createdAt: today,
          },
        ],
      })

      const response = await request(app).get('/api/answers/stats')

      expect(response.status).toBe(200)

      const todayStats = response.body.daily.find(
        (d: any) => d.date === todayStr,
      )
      expect(todayStats).toBeDefined()
      expect(todayStats.totalAnswers).toBe(2)
      expect(todayStats.correctAnswers).toBe(1)
      expect(todayStats.accuracy).toBe(50)
      expect(todayStats.averageTime).toBe(45)
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors gracefully in submitAnswer', async () => {
      // Disconnect to simulate error
      await testPrisma.$disconnect()

      const response = await request(app).post('/api/answers').send({
        questionId: 'test-id',
        choiceId: 'choice-id',
      })

      expect(response.status).toBe(500)
      expect(response.body.error).toBe('Internal server error')

      // Reconnect for other tests
      await testPrisma.$connect()
    })

    it('should handle invalid parameters in stats endpoint', async () => {
      const response = await request(app).get('/api/answers/stats?days=invalid')

      expect(response.status).toBe(200)
      // Should use default value
      expect(response.body.summary.period).toBe('7日間')
    })
  })
})
