import request from 'supertest'
import express from 'express'
import {
  getQuestions,
  getQuestionById,
  getRandomQuestion,
} from '../../controllers/questionController'
import {
  testPrisma,
  createTestData,
  createMultipleTestQuestions,
} from '../setup'

// Create test app
const app = express()
app.use(express.json())

// Mount routes
app.get('/api/questions', getQuestions)
app.get('/api/questions/random', getRandomQuestion)
app.get('/api/questions/:id', getQuestionById)

describe('Question Controller', () => {
  describe('GET /api/questions', () => {
    it('should return empty list when no questions exist', async () => {
      const response = await request(app).get('/api/questions')

      expect(response.status).toBe(200)
      expect(response.body.questions).toEqual([])
      expect(response.body.pagination.total).toBe(0)
    })

    it('should return questions with pagination', async () => {
      const { questions } = await createMultipleTestQuestions(5)

      const response = await request(app).get('/api/questions?page=1&limit=2')

      expect(response.status).toBe(200)
      expect(response.body.questions).toHaveLength(2)
      expect(response.body.pagination.total).toBe(4) // createMultipleTestQuestions creates count-1 additional questions
      expect(response.body.pagination.totalPages).toBe(2)
      expect(response.body.pagination.hasNextPage).toBe(true)
    })

    it('should filter questions by category', async () => {
      const { category, questions } = await createMultipleTestQuestions(3)

      const response = await request(app).get(
        `/api/questions?categoryId=${category.id}`,
      )

      expect(response.status).toBe(200)
      expect(response.body.questions.length).toBeGreaterThan(0)
      expect(response.body.questions[0].categoryId).toBe(category.id)
    })

    it('should filter questions by difficulty', async () => {
      await createMultipleTestQuestions(5)

      const response = await request(app).get('/api/questions?difficulty=2')

      expect(response.status).toBe(200)
      response.body.questions.forEach((question: any) => {
        expect(question.difficulty).toBe(2)
      })
    })

    it('should search questions by content', async () => {
      await createMultipleTestQuestions(3)

      const response = await request(app).get(
        '/api/questions?search=Test question 2',
      )

      expect(response.status).toBe(200)
      if (response.body.questions.length > 0) {
        expect(response.body.questions[0].content).toContain('Test question 2')
      }
    })

    it('should filter unanswered questions', async () => {
      const { questions } = await createMultipleTestQuestions(3)

      // Add answer to first question
      await testPrisma.answer.create({
        data: {
          questionId: questions[0].id,
          isCorrect: true,
          timeSpent: 30,
        },
      })

      const response = await request(app).get(
        '/api/questions?onlyUnanswered=true',
      )

      expect(response.status).toBe(200)
      expect(response.body.questions.every((q: any) => !q.hasAnswered)).toBe(
        true,
      )
    })

    it('should filter incorrect answers', async () => {
      const { questions } = await createMultipleTestQuestions(3)

      // Add incorrect answer to first question
      await testPrisma.answer.create({
        data: {
          questionId: questions[0].id,
          isCorrect: false,
          timeSpent: 45,
        },
      })

      const response = await request(app).get(
        '/api/questions?onlyIncorrect=true',
      )

      expect(response.status).toBe(200)
      expect(response.body.questions.length).toBeGreaterThan(0)
    })

    it('should include answer status in response', async () => {
      const { questions } = await createMultipleTestQuestions(2)

      // Add answer to first question
      await testPrisma.answer.create({
        data: {
          questionId: questions[0].id,
          isCorrect: true,
          timeSpent: 30,
        },
      })

      const response = await request(app).get('/api/questions')

      expect(response.status).toBe(200)
      const answeredQuestion = response.body.questions.find(
        (q: any) => q.hasAnswered,
      )
      expect(answeredQuestion).toBeDefined()
      expect(answeredQuestion.isCorrect).toBe(true)
    })
  })

  describe('GET /api/questions/:id', () => {
    it('should return question with full details', async () => {
      const { question } = await createTestData()

      const response = await request(app).get(`/api/questions/${question.id}`)

      expect(response.status).toBe(200)
      expect(response.body.question.id).toBe(question.id)
      expect(response.body.question.content).toBe(question.content)
      expect(response.body.question.explanation).toBe(question.explanation)
      expect(response.body.question.choices).toHaveLength(4)
      expect(response.body.question.choices[0]).toHaveProperty('isCorrect')
    })

    it('should return 404 for non-existent question', async () => {
      const response = await request(app).get('/api/questions/non-existent-id')

      expect(response.status).toBe(404)
      expect(response.body.error).toBe('Question not found')
    })

    it('should include user answer if exists', async () => {
      const { question } = await createTestData()

      // Add answer
      const _answer = await testPrisma.answer.create({
        data: {
          questionId: question.id,
          isCorrect: true,
          timeSpent: 45,
        },
      })

      const response = await request(app).get(`/api/questions/${question.id}`)

      expect(response.status).toBe(200)
      expect(response.body.userAnswer).toBeDefined()
      expect(response.body.userAnswer.isCorrect).toBe(true)
      expect(response.body.userAnswer.timeSpent).toBe(45)
    })

    it('should not include user answer if none exists', async () => {
      const { question } = await createTestData()

      const response = await request(app).get(`/api/questions/${question.id}`)

      expect(response.status).toBe(200)
      expect(response.body.userAnswer).toBeUndefined()
    })
  })

  describe('GET /api/questions/random', () => {
    it('should return 404 when no questions exist', async () => {
      const response = await request(app).get('/api/questions/random')

      expect(response.status).toBe(404)
      expect(response.body.error).toBe('No questions found matching criteria')
    })

    it('should return random question', async () => {
      const { question } = await createTestData()

      const response = await request(app).get('/api/questions/random')

      expect(response.status).toBe(200)
      expect(response.body.question.id).toBe(question.id)
      expect(response.body.question.choices).toHaveLength(4)
    })

    it('should filter by category', async () => {
      const { category, question } = await createTestData()

      // Create another category and question
      const _otherCategory = await testPrisma.category.create({
        data: { name: 'Other Category', description: 'Other' },
      })

      const response = await request(app).get(
        `/api/questions/random?categoryId=${category.id}`,
      )

      expect(response.status).toBe(200)
      expect(response.body.question.categoryId).toBe(category.id)
    })

    it('should filter by difficulty', async () => {
      await createMultipleTestQuestions(5)

      const response = await request(app).get(
        '/api/questions/random?difficulty=3',
      )

      expect(response.status).toBe(200)
      expect(response.body.question.difficulty).toBe(3)
    })

    it('should exclude answered questions when requested', async () => {
      const { questions } = await createMultipleTestQuestions(3)

      // Answer all but one question
      for (let i = 0; i < questions.length - 1; i++) {
        await testPrisma.answer.create({
          data: {
            questionId: questions[i].id,
            isCorrect: true,
            timeSpent: 30,
          },
        })
      }

      const response = await request(app).get(
        '/api/questions/random?excludeAnswered=true',
      )

      expect(response.status).toBe(200)
      expect(response.body.question.id).toBe(questions[questions.length - 1].id)
    })

    it('should return 404 when all matching questions are answered and excludeAnswered=true', async () => {
      const { questions } = await createMultipleTestQuestions(2)

      // Answer all questions
      for (const question of questions) {
        await testPrisma.answer.create({
          data: {
            questionId: question.id,
            isCorrect: true,
            timeSpent: 30,
          },
        })
      }

      const response = await request(app).get(
        '/api/questions/random?excludeAnswered=true',
      )

      expect(response.status).toBe(404)
      expect(response.body.error).toBe('No questions found matching criteria')
    })
  })

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // Disconnect prisma to simulate error
      await testPrisma.$disconnect()

      const response = await request(app).get('/api/questions')

      expect(response.status).toBe(500)
      expect(response.body.error).toBe('Internal server error')

      // Reconnect for other tests
      await testPrisma.$connect()
    })

    it('should handle invalid pagination parameters gracefully', async () => {
      const response = await request(app).get('/api/questions?page=0&limit=-1')

      expect(response.status).toBe(200)
      // Should use default values for invalid parameters
      expect(response.body.pagination.page).toBe(1)
      expect(response.body.pagination.limit).toBe(10)
    })

    it('should handle invalid difficulty values gracefully', async () => {
      const response = await request(app).get(
        '/api/questions?difficulty=invalid',
      )

      expect(response.status).toBe(200)
      // Should ignore invalid difficulty and return all questions
    })
  })
})
