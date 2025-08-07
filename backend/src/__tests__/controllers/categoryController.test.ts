import request from 'supertest'
import express from 'express'
import {
  getCategories,
  getCategoryStats,
} from '../../controllers/categoryController'
import {
  testPrisma,
  createTestData,
  createMultipleTestQuestions,
} from '../setup'

// Create test app
const app = express()
app.use(express.json())

// Mount routes
app.get('/api/categories', getCategories)
app.get('/api/categories/:id/stats', getCategoryStats)

describe('Category Controller', () => {
  describe('GET /api/categories', () => {
    it('should return empty array when no categories exist', async () => {
      const response = await request(app).get('/api/categories')

      expect(response.status).toBe(200)
      expect(response.body).toEqual([])
    })

    it('should return categories with basic statistics', async () => {
      const { category } = await createTestData()

      const response = await request(app).get('/api/categories')

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(1)
      expect(response.body[0]).toMatchObject({
        id: category.id,
        name: category.name,
        description: category.description,
        totalQuestions: 1,
        answeredQuestions: 0,
        accuracy: 0,
        progress: 0,
      })
    })

    it('should calculate answered questions correctly', async () => {
      const { category } = await createTestData()

      // Add answer to question
      await testPrisma.answer.create({
        data: {
          questionId: question.id,
          isCorrect: true,
          timeSpent: 30,
        },
      })

      const response = await request(app).get('/api/categories')

      expect(response.status).toBe(200)
      expect(response.body[0].answeredQuestions).toBe(1)
      expect(response.body[0].accuracy).toBe(100)
      expect(response.body[0].progress).toBe(100)
    })

    it('should calculate accuracy correctly with multiple answers', async () => {
      const { category, questions } = await createMultipleTestQuestions(3)

      // Add mixed correct/incorrect answers
      await testPrisma.answer.createMany({
        data: [
          { questionId: questions[0].id, isCorrect: true, timeSpent: 30 },
          { questionId: questions[0].id, isCorrect: false, timeSpent: 25 }, // Second answer to same question
          { questionId: questions[1].id, isCorrect: true, timeSpent: 35 },
          { questionId: questions[2].id, isCorrect: false, timeSpent: 40 },
        ],
      })

      const response = await request(app).get('/api/categories')

      expect(response.status).toBe(200)
      expect(response.body[0].totalQuestions).toBe(3)
      expect(response.body[0].answeredQuestions).toBe(3)
      expect(response.body[0].accuracy).toBe(50) // 2 correct out of 4 total answers
    })

    it('should sort categories by name', async () => {
      // Create categories in reverse alphabetical order
      await testPrisma.category.create({
        data: { name: 'Z Category', description: 'Last category' },
      })
      await testPrisma.category.create({
        data: { name: 'A Category', description: 'First category' },
      })

      const response = await request(app).get('/api/categories')

      expect(response.status).toBe(200)
      expect(response.body).toHaveLength(2)
      expect(response.body[0].name).toBe('A Category')
      expect(response.body[1].name).toBe('Z Category')
    })

    it('should handle categories with no questions', async () => {
      const category = await testPrisma.category.create({
        data: { name: 'Empty Category', description: 'No questions' },
      })

      const response = await request(app).get('/api/categories')

      expect(response.status).toBe(200)
      expect(response.body[0]).toMatchObject({
        id: category.id,
        name: category.name,
        totalQuestions: 0,
        answeredQuestions: 0,
        accuracy: 0,
        progress: 0,
      })
    })

    it('should include question count in response', async () => {
      const { category } = await createMultipleTestQuestions(5)

      const response = await request(app).get('/api/categories')

      expect(response.status).toBe(200)
      expect(response.body[0].totalQuestions).toBe(4) // createMultipleTestQuestions creates count-1 additional
    })
  })

  describe('GET /api/categories/:id/stats', () => {
    it('should return 404 for non-existent category', async () => {
      const response = await request(app).get(
        '/api/categories/non-existent-id/stats',
      )

      expect(response.status).toBe(404)
      expect(response.body.error).toBe('Category not found')
    })

    it('should return detailed category statistics', async () => {
      const { category } = await createTestData()

      // Add answers with different difficulties and times
      await testPrisma.answer.createMany({
        data: [
          { questionId: question.id, isCorrect: true, timeSpent: 30 },
          { questionId: question.id, isCorrect: false, timeSpent: 45 },
        ],
      })

      const response = await request(app).get(
        `/api/categories/${category.id}/stats`,
      )

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        category: {
          id: category.id,
          name: category.name,
          description: category.description,
        },
        summary: {
          totalQuestions: 1,
          answeredQuestions: 1,
          totalAnswers: 2,
          correctAnswers: 1,
          accuracy: 50,
          averageTime: 38, // (30 + 45) / 2 rounded
          progress: 100,
        },
        period: '30日間',
      })
    })

    it('should filter statistics by date period', async () => {
      const { category } = await createTestData()

      // Create old answer (outside period)
      const oldDate = new Date()
      oldDate.setDate(oldDate.getDate() - 40)

      await testPrisma.answer.create({
        data: {
          questionId: question.id,
          isCorrect: true,
          timeSpent: 30,
          createdAt: oldDate,
        },
      })

      // Create recent answer
      await testPrisma.answer.create({
        data: {
          questionId: question.id,
          isCorrect: false,
          timeSpent: 60,
        },
      })

      const response = await request(app).get(
        `/api/categories/${category.id}/stats?days=30`,
      )

      expect(response.status).toBe(200)
      expect(response.body.summary.totalAnswers).toBe(1) // Only recent answer
      expect(response.body.summary.correctAnswers).toBe(0)
      expect(response.body.summary.accuracy).toBe(0)
      expect(response.body.period).toBe('30日間')
    })

    it('should return difficulty statistics', async () => {
      const { category } = await createTestData()

      // Create questions with different difficulties
      const easyQuestion = await testPrisma.question.create({
        data: {
          content: 'Easy question',
          difficulty: 1,
          categoryId: category.id,
          choices: {
            create: [
              { content: 'A', isCorrect: true },
              { content: 'B', isCorrect: false },
            ],
          },
        },
      })

      const hardQuestion = await testPrisma.question.create({
        data: {
          content: 'Hard question',
          difficulty: 5,
          categoryId: category.id,
          choices: {
            create: [
              { content: 'A', isCorrect: true },
              { content: 'B', isCorrect: false },
            ],
          },
        },
      })

      // Add answers
      await testPrisma.answer.createMany({
        data: [
          { questionId: easyQuestion.id, isCorrect: true },
          { questionId: easyQuestion.id, isCorrect: true },
          { questionId: hardQuestion.id, isCorrect: false },
          { questionId: hardQuestion.id, isCorrect: true },
        ],
      })

      const response = await request(app).get(
        `/api/categories/${category.id}/stats`,
      )

      expect(response.status).toBe(200)
      expect(response.body.difficultyStats).toBeDefined()

      const level1Stats = response.body.difficultyStats.find(
        (d: any) => d.difficulty === 1,
      )
      const level5Stats = response.body.difficultyStats.find(
        (d: any) => d.difficulty === 5,
      )

      expect(level1Stats).toMatchObject({
        difficulty: 1,
        totalAnswers: 2,
        correctAnswers: 2,
        accuracy: 100,
      })

      expect(level5Stats).toMatchObject({
        difficulty: 5,
        totalAnswers: 2,
        correctAnswers: 1,
        accuracy: 50,
      })
    })

    it('should return daily trend data', async () => {
      const { category } = await createTestData()

      const today = new Date()
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      await testPrisma.answer.createMany({
        data: [
          { questionId: question.id, isCorrect: true, createdAt: today },
          { questionId: question.id, isCorrect: false, createdAt: today },
          { questionId: question.id, isCorrect: true, createdAt: yesterday },
        ],
      })

      const response = await request(app).get(
        `/api/categories/${category.id}/stats`,
      )

      expect(response.status).toBe(200)
      expect(response.body.dailyTrend).toHaveLength(2)

      const todayTrend = response.body.dailyTrend.find(
        (d: any) => d.date === today.toISOString().split('T')[0],
      )
      expect(todayTrend).toMatchObject({
        accuracy: 50,
        totalAnswers: 2,
      })

      const yesterdayTrend = response.body.dailyTrend.find(
        (d: any) => d.date === yesterday.toISOString().split('T')[0],
      )
      expect(yesterdayTrend).toMatchObject({
        accuracy: 100,
        totalAnswers: 1,
      })
    })

    it('should handle categories with no answers', async () => {
      const { category } = await createTestData()

      const response = await request(app).get(
        `/api/categories/${category.id}/stats`,
      )

      expect(response.status).toBe(200)
      expect(response.body.summary).toMatchObject({
        totalQuestions: 1,
        answeredQuestions: 0,
        totalAnswers: 0,
        correctAnswers: 0,
        accuracy: 0,
        averageTime: 0,
        progress: 0,
      })
      expect(response.body.difficultyStats).toEqual([])
      expect(response.body.dailyTrend).toEqual([])
    })

    it('should use custom date period parameter', async () => {
      const { category } = await createTestData()

      await testPrisma.answer.create({
        data: {
          questionId: question.id,
          isCorrect: true,
          timeSpent: 30,
        },
      })

      const response = await request(app).get(
        `/api/categories/${category.id}/stats?days=7`,
      )

      expect(response.status).toBe(200)
      expect(response.body.period).toBe('7日間')
    })

    it('should handle invalid date period parameter', async () => {
      const { category } = await createTestData()

      const response = await request(app).get(
        `/api/categories/${category.id}/stats?days=invalid`,
      )

      expect(response.status).toBe(200)
      expect(response.body.period).toBe('30日間') // Should use default
    })
  })

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully in getCategories', async () => {
      // Disconnect to simulate error
      await testPrisma.$disconnect()

      const response = await request(app).get('/api/categories')

      expect(response.status).toBe(500)
      expect(response.body.error).toBe('Internal server error')

      // Reconnect for other tests
      await testPrisma.$connect()
    })

    it('should handle database connection errors gracefully in getCategoryStats', async () => {
      const { category } = await createTestData()

      // Disconnect to simulate error
      await testPrisma.$disconnect()

      const response = await request(app).get(
        `/api/categories/${category.id}/stats`,
      )

      expect(response.status).toBe(500)
      expect(response.body.error).toBe('Internal server error')

      // Reconnect for other tests
      await testPrisma.$connect()
    })

    it('should handle malformed category ID', async () => {
      const response = await request(app).get(
        '/api/categories/malformed-uuid/stats',
      )

      // Should either return 404 or handle gracefully
      expect([404, 500]).toContain(response.status)
    })

    it('should handle concurrent database operations', async () => {
      const { category, questions } = await createMultipleTestQuestions(5)

      // Simulate concurrent answer submissions
      const promises = questions.map((question, index) =>
        testPrisma.answer.create({
          data: {
            questionId: question.id,
            isCorrect: index % 2 === 0,
            timeSpent: 30 + index * 5,
          },
        }),
      )

      await Promise.all(promises)

      const response = await request(app).get(
        `/api/categories/${category.id}/stats`,
      )

      expect(response.status).toBe(200)
      expect(response.body.summary.totalAnswers).toBe(4)
    })
  })
})
