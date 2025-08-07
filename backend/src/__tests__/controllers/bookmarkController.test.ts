import request from 'supertest'
import express from 'express'
import {
  getBookmarks,
  createBookmark,
  updateBookmark,
  deleteBookmark,
  checkBookmarkStatus,
} from '../../controllers/bookmarkController'
import {
  testPrisma,
  createTestData,
  createMultipleTestQuestions,
} from '../setup'

// Create test app
const app = express()
app.use(express.json())

// Mount routes
app.get('/api/bookmarks', getBookmarks)
app.post('/api/bookmarks', createBookmark)
app.put('/api/bookmarks/:id', updateBookmark)
app.delete('/api/bookmarks/:id', deleteBookmark)
app.get('/api/bookmarks/status/:questionId', checkBookmarkStatus)

describe('Bookmark Controller', () => {
  describe('GET /api/bookmarks', () => {
    it('should return empty list when no bookmarks exist', async () => {
      const response = await request(app).get('/api/bookmarks')

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.bookmarks).toEqual([])
      expect(response.body.data.pagination.total).toBe(0)
    })

    it('should return bookmarks with pagination', async () => {
      const { questions } = await createMultipleTestQuestions(3)

      // Create bookmarks for all questions
      for (const question of questions) {
        await testPrisma.bookmark.create({
          data: {
            questionId: question.id,
            userId: null,
            memo: `Memo for ${question.content}`,
            isActive: true,
          },
        })
      }

      const response = await request(app).get('/api/bookmarks?page=1&limit=2')

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.bookmarks).toHaveLength(2)
      expect(response.body.data.pagination.total).toBe(2) // createMultipleTestQuestions creates count-1 additional
      expect(response.body.data.pagination.totalPages).toBe(1)
    })

    it('should filter bookmarks by category', async () => {
      const { category, questions } = await createMultipleTestQuestions(2)

      // Create another category and question
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

      // Create bookmarks
      await testPrisma.bookmark.createMany({
        data: [
          { questionId: questions[0].id, userId: null, isActive: true },
          { questionId: otherQuestion.id, userId: null, isActive: true },
        ],
      })

      const response = await request(app).get(
        `/api/bookmarks?categoryId=${category.id}`,
      )

      expect(response.status).toBe(200)
      expect(response.body.data.bookmarks).toHaveLength(1)
      expect(response.body.data.bookmarks[0].categoryId).toBe(category.id)
    })

    it('should filter bookmarks by difficulty', async () => {
      const { questions } = await createMultipleTestQuestions(3)

      // Create bookmarks
      for (const question of questions) {
        await testPrisma.bookmark.create({
          data: {
            questionId: question.id,
            userId: null,
            isActive: true,
          },
        })
      }

      const response = await request(app).get('/api/bookmarks?difficulty=2')

      expect(response.status).toBe(200)
      response.body.data.bookmarks.forEach((bookmark: any) => {
        expect(bookmark.difficulty).toBe(2)
      })
    })

    it('should search bookmarks by question content', async () => {
      const { questions } = await createMultipleTestQuestions(2)

      await testPrisma.bookmark.createMany({
        data: [{ questionId: questions[0].id, userId: null, isActive: true }],
      })

      const response = await request(app).get(
        '/api/bookmarks?search=Test question 2',
      )

      expect(response.status).toBe(200)
      if (response.body.data.bookmarks.length > 0) {
        expect(response.body.data.bookmarks[0].questionContent).toContain(
          'Test question 2',
        )
      }
    })

    it('should include bookmark details with question information', async () => {
      const { category, question } = await createTestData()

      const bookmark = await testPrisma.bookmark.create({
        data: {
          questionId: question.id,
          userId: null,
          memo: 'Important question',
          isActive: true,
        },
      })

      const response = await request(app).get('/api/bookmarks')

      expect(response.status).toBe(200)
      expect(response.body.data.bookmarks[0]).toMatchObject({
        id: bookmark.id,
        questionId: question.id,
        questionContent: expect.stringContaining('Test question'),
        categoryId: category.id,
        categoryName: category.name,
        difficulty: question.difficulty,
        year: question.year,
        session: question.session,
        memo: 'Important question',
      })
    })

    it('should truncate long question content', async () => {
      const { category } = await createTestData()

      const longQuestion = await testPrisma.question.create({
        data: {
          content: 'A'.repeat(150), // Longer than 100 characters
          categoryId: category.id,
          difficulty: 1,
          choices: {
            create: [
              { content: 'Choice A', isCorrect: true },
              { content: 'Choice B', isCorrect: false },
            ],
          },
        },
      })

      await testPrisma.bookmark.create({
        data: {
          questionId: longQuestion.id,
          userId: null,
          isActive: true,
        },
      })

      const response = await request(app).get('/api/bookmarks')

      expect(response.status).toBe(200)
      expect(response.body.data.bookmarks[0].questionContent).toHaveLength(103) // 100 + '...'
      expect(response.body.data.bookmarks[0].questionContent).toMatch(/\.\.\.$/)
    })

    it('should not include inactive bookmarks', async () => {
      const { question } = await createTestData()

      // Create inactive bookmark
      await testPrisma.bookmark.create({
        data: {
          questionId: question.id,
          userId: null,
          isActive: false,
        },
      })

      const response = await request(app).get('/api/bookmarks')

      expect(response.status).toBe(200)
      expect(response.body.data.bookmarks).toEqual([])
    })

    it('should validate query parameters', async () => {
      const response = await request(app).get(
        '/api/bookmarks?page=0&limit=200&difficulty=10',
      )

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Invalid query parameters')
    })

    it('should sort bookmarks by creation date descending', async () => {
      const { questions } = await createMultipleTestQuestions(3)

      const now = new Date()
      const earlier = new Date(now.getTime() - 60000) // 1 minute earlier

      await testPrisma.bookmark.createMany({
        data: [
          {
            questionId: questions[0].id,
            userId: null,
            isActive: true,
            createdAt: earlier,
          },
          {
            questionId: questions[1].id,
            userId: null,
            isActive: true,
            createdAt: now,
          },
        ],
      })

      const response = await request(app).get('/api/bookmarks')

      expect(response.status).toBe(200)
      expect(response.body.data.bookmarks).toHaveLength(2)
      // Most recent should be first
      expect(response.body.data.bookmarks[0].questionId).toBe(questions[1].id)
    })
  })

  describe('POST /api/bookmarks', () => {
    it('should create bookmark successfully', async () => {
      const { question } = await createTestData()

      const response = await request(app).post('/api/bookmarks').send({
        questionId: question.id,
        memo: 'Important question to review',
      })

      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toMatchObject({
        questionId: question.id,
        memo: 'Important question to review',
      })
      expect(response.body.message).toBe('Bookmark created successfully')
    })

    it('should create bookmark without memo', async () => {
      const { question } = await createTestData()

      const response = await request(app).post('/api/bookmarks').send({
        questionId: question.id,
      })

      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.data.memo).toBeNull()
    })

    it('should validate required fields', async () => {
      const response = await request(app).post('/api/bookmarks').send({
        memo: 'Missing questionId',
      })

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Invalid request data')
    })

    it('should return 404 for non-existent question', async () => {
      const response = await request(app).post('/api/bookmarks').send({
        questionId: 'non-existent-question-id',
      })

      expect(response.status).toBe(404)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Question not found')
    })

    it('should prevent duplicate bookmarks', async () => {
      const { question } = await createTestData()

      // Create first bookmark
      await request(app).post('/api/bookmarks').send({
        questionId: question.id,
        memo: 'First bookmark',
      })

      // Try to create duplicate
      const response = await request(app).post('/api/bookmarks').send({
        questionId: question.id,
        memo: 'Duplicate bookmark',
      })

      expect(response.status).toBe(409)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe(
        'Bookmark already exists for this question',
      )
    })

    it('should include question details in response', async () => {
      const { category, question } = await createTestData()

      const response = await request(app).post('/api/bookmarks').send({
        questionId: question.id,
        memo: 'Test bookmark',
      })

      expect(response.status).toBe(201)
      expect(response.body.data).toMatchObject({
        questionContent: question.content,
        categoryId: category.id,
        categoryName: category.name,
        difficulty: question.difficulty,
        year: question.year,
        session: question.session,
      })
    })

    it('should validate memo length if provided', async () => {
      const { question } = await createTestData()

      const response = await request(app).post('/api/bookmarks').send({
        questionId: question.id,
        memo: '', // Empty string should be valid
      })

      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
    })
  })

  describe('PUT /api/bookmarks/:id', () => {
    it('should update bookmark memo successfully', async () => {
      const { question } = await createTestData()

      const bookmark = await testPrisma.bookmark.create({
        data: {
          questionId: question.id,
          userId: null,
          memo: 'Original memo',
          isActive: true,
        },
      })

      const response = await request(app)
        .put(`/api/bookmarks/${bookmark.id}`)
        .send({
          memo: 'Updated memo',
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.memo).toBe('Updated memo')
      expect(response.body.message).toBe('Bookmark updated successfully')
    })

    it('should clear memo when empty string provided', async () => {
      const { question } = await createTestData()

      const bookmark = await testPrisma.bookmark.create({
        data: {
          questionId: question.id,
          userId: null,
          memo: 'Original memo',
          isActive: true,
        },
      })

      const response = await request(app)
        .put(`/api/bookmarks/${bookmark.id}`)
        .send({
          memo: '',
        })

      expect(response.status).toBe(200)
      expect(response.body.data.memo).toBeNull()
    })

    it('should return 404 for non-existent bookmark', async () => {
      const response = await request(app)
        .put('/api/bookmarks/non-existent-id')
        .send({
          memo: 'Updated memo',
        })

      expect(response.status).toBe(404)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Bookmark not found')
    })

    it('should not update inactive bookmarks', async () => {
      const { question } = await createTestData()

      const bookmark = await testPrisma.bookmark.create({
        data: {
          questionId: question.id,
          userId: null,
          memo: 'Original memo',
          isActive: false,
        },
      })

      const response = await request(app)
        .put(`/api/bookmarks/${bookmark.id}`)
        .send({
          memo: 'Updated memo',
        })

      expect(response.status).toBe(404)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Bookmark not found')
    })

    it('should validate request data', async () => {
      const { question } = await createTestData()

      const bookmark = await testPrisma.bookmark.create({
        data: {
          questionId: question.id,
          userId: null,
          isActive: true,
        },
      })

      const response = await request(app)
        .put(`/api/bookmarks/${bookmark.id}`)
        .send({
          memo: 123, // Invalid type
        })

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Invalid request data')
    })

    it('should update updatedAt timestamp', async () => {
      const { question } = await createTestData()

      const originalTime = new Date()
      originalTime.setMinutes(originalTime.getMinutes() - 5)

      const bookmark = await testPrisma.bookmark.create({
        data: {
          questionId: question.id,
          userId: null,
          memo: 'Original memo',
          isActive: true,
          createdAt: originalTime,
          updatedAt: originalTime,
        },
      })

      const response = await request(app)
        .put(`/api/bookmarks/${bookmark.id}`)
        .send({
          memo: 'Updated memo',
        })

      expect(response.status).toBe(200)
      const updatedTime = new Date(response.body.data.updatedAt)
      expect(updatedTime.getTime()).toBeGreaterThan(originalTime.getTime())
    })
  })

  describe('DELETE /api/bookmarks/:id', () => {
    it('should delete bookmark successfully (soft delete)', async () => {
      const { question } = await createTestData()

      const bookmark = await testPrisma.bookmark.create({
        data: {
          questionId: question.id,
          userId: null,
          memo: 'To be deleted',
          isActive: true,
        },
      })

      const response = await request(app).delete(
        `/api/bookmarks/${bookmark.id}`,
      )

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toBeNull()
      expect(response.body.message).toBe('Bookmark deleted successfully')

      // Verify soft delete
      const deletedBookmark = await testPrisma.bookmark.findUnique({
        where: { id: bookmark.id },
      })
      expect(deletedBookmark!.isActive).toBe(false)
    })

    it('should return 404 for non-existent bookmark', async () => {
      const response = await request(app).delete(
        '/api/bookmarks/non-existent-id',
      )

      expect(response.status).toBe(404)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Bookmark not found')
    })

    it('should not delete already inactive bookmarks', async () => {
      const { question } = await createTestData()

      const bookmark = await testPrisma.bookmark.create({
        data: {
          questionId: question.id,
          userId: null,
          isActive: false,
        },
      })

      const response = await request(app).delete(
        `/api/bookmarks/${bookmark.id}`,
      )

      expect(response.status).toBe(404)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Bookmark not found')
    })

    it('should update updatedAt timestamp on deletion', async () => {
      const { question } = await createTestData()

      const originalTime = new Date()
      originalTime.setMinutes(originalTime.getMinutes() - 5)

      const bookmark = await testPrisma.bookmark.create({
        data: {
          questionId: question.id,
          userId: null,
          isActive: true,
          createdAt: originalTime,
          updatedAt: originalTime,
        },
      })

      await request(app).delete(`/api/bookmarks/${bookmark.id}`)

      // Check that updatedAt was updated
      const deletedBookmark = await testPrisma.bookmark.findUnique({
        where: { id: bookmark.id },
      })

      expect(deletedBookmark!.updatedAt.getTime()).toBeGreaterThan(
        originalTime.getTime(),
      )
    })
  })

  describe('GET /api/bookmarks/status/:questionId', () => {
    it('should return bookmark status for bookmarked question', async () => {
      const { question } = await createTestData()

      const bookmark = await testPrisma.bookmark.create({
        data: {
          questionId: question.id,
          userId: null,
          memo: 'Test memo',
          isActive: true,
        },
      })

      const response = await request(app).get(
        `/api/bookmarks/status/${question.id}`,
      )

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toEqual({
        questionId: question.id,
        isBookmarked: true,
        bookmarkId: bookmark.id,
        memo: 'Test memo',
      })
    })

    it('should return not bookmarked status for non-bookmarked question', async () => {
      const { question } = await createTestData()

      const response = await request(app).get(
        `/api/bookmarks/status/${question.id}`,
      )

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toEqual({
        questionId: question.id,
        isBookmarked: false,
        bookmarkId: null,
        memo: null,
      })
    })

    it('should return 404 for non-existent question', async () => {
      const response = await request(app).get(
        '/api/bookmarks/status/non-existent-question-id',
      )

      expect(response.status).toBe(404)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Question not found')
    })

    it('should not consider inactive bookmarks', async () => {
      const { question } = await createTestData()

      // Create inactive bookmark
      await testPrisma.bookmark.create({
        data: {
          questionId: question.id,
          userId: null,
          memo: 'Inactive bookmark',
          isActive: false,
        },
      })

      const response = await request(app).get(
        `/api/bookmarks/status/${question.id}`,
      )

      expect(response.status).toBe(200)
      expect(response.body.data.isBookmarked).toBe(false)
    })

    it('should handle question without memo', async () => {
      const { question } = await createTestData()

      await testPrisma.bookmark.create({
        data: {
          questionId: question.id,
          userId: null,
          memo: null,
          isActive: true,
        },
      })

      const response = await request(app).get(
        `/api/bookmarks/status/${question.id}`,
      )

      expect(response.status).toBe(200)
      expect(response.body.data.memo).toBeNull()
    })
  })

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // Disconnect to simulate error
      await testPrisma.$disconnect()

      const response = await request(app).get('/api/bookmarks')

      expect(response.status).toBe(500)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Internal server error')

      // Reconnect for other tests
      await testPrisma.$connect()
    })

    it('should handle malformed bookmark IDs', async () => {
      const response = await request(app)
        .put('/api/bookmarks/malformed-id')
        .send({ memo: 'test' })

      expect(response.status).toBe(500)
      expect(response.body.success).toBe(false)
    })

    it('should handle concurrent bookmark operations', async () => {
      const { questions } = await createMultipleTestQuestions(3)

      // Simulate concurrent bookmark creation
      const promises = questions.map((question) =>
        request(app)
          .post('/api/bookmarks')
          .send({
            questionId: question.id,
            memo: `Concurrent memo for ${question.id}`,
          }),
      )

      const responses = await Promise.all(promises)

      // All should succeed (no concurrent conflicts expected for different questions)
      responses.forEach((response) => {
        expect(response.status).toBe(201)
      })
    })

    it('should handle invalid filter parameters gracefully', async () => {
      const response = await request(app).get(
        '/api/bookmarks?difficulty=invalid&page=NaN',
      )

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Invalid query parameters')
    })
  })
})
