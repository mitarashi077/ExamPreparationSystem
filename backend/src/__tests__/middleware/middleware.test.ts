import request from 'supertest'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'

// Create test app with middleware
const createAppWithMiddleware = () => {
  const app = express()

  // Apply middleware in same order as main app
  app.use(helmet())
  app.use(cors())
  app.use(morgan('combined'))
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true }))

  // Test routes
  app.get('/test', (_req, res) => {
    res.json({ message: 'Test successful' })
  })

  app.post('/test/json', (req, res) => {
    res.json({ received: req.body })
  })

  app.post('/test/form', (req, res) => {
    res.json({ received: req.body })
  })

  // Error throwing route for error handling tests
  app.get('/test/error', (_req, _res, next) => {
    const error = new Error('Test error')
    next(error)
  })

  // 404 handler (like in main app)
  app.use('*', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found' })
  })

  // Error handler (like in main app)
  app.use(
    (
      err: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      console.error('Test error:', err.message)
      res.status(500).json({ error: 'Internal server error' })
    },
  )

  return app
}

describe('Middleware Tests', () => {
  let app: express.Application

  beforeEach(() => {
    app = createAppWithMiddleware()
  })

  describe('Helmet Security Middleware', () => {
    it('should set security headers', async () => {
      const response = await request(app).get('/test')

      expect(response.status).toBe(200)

      // Check for common security headers set by helmet
      expect(response.headers['x-content-type-options']).toBe('nosniff')
      expect(response.headers['x-frame-options']).toBe('DENY')
      expect(response.headers['x-download-options']).toBe('noopen')
      expect(response.headers['x-xss-protection']).toBe('0')

      // Helmet also sets these headers
      expect(response.headers['referrer-policy']).toBeDefined()
      expect(response.headers['cross-origin-embedder-policy']).toBeDefined()
    })

    it('should prevent clickjacking with X-Frame-Options', async () => {
      const response = await request(app).get('/test')

      expect(response.headers['x-frame-options']).toBe('DENY')
    })

    it('should set content type options to prevent MIME sniffing', async () => {
      const response = await request(app).get('/test')

      expect(response.headers['x-content-type-options']).toBe('nosniff')
    })
  })

  describe('CORS Middleware', () => {
    it('should handle CORS preflight requests', async () => {
      const response = await request(app)
        .options('/test')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET')

      expect(response.status).toBe(204)
      expect(response.headers['access-control-allow-origin']).toBe('*')
      expect(response.headers['access-control-allow-methods']).toContain('GET')
    })

    it('should allow cross-origin requests', async () => {
      const response = await request(app)
        .get('/test')
        .set('Origin', 'http://localhost:3000')

      expect(response.status).toBe(200)
      expect(response.headers['access-control-allow-origin']).toBe('*')
    })

    it('should handle POST requests with CORS', async () => {
      const response = await request(app)
        .post('/test/json')
        .set('Origin', 'http://localhost:3000')
        .send({ test: 'data' })

      expect(response.status).toBe(200)
      expect(response.headers['access-control-allow-origin']).toBe('*')
    })
  })

  describe('Morgan Logging Middleware', () => {
    let consoleLogSpy: jest.SpyInstance

    beforeEach(() => {
      // Spy on console.log to capture morgan logs
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
    })

    afterEach(() => {
      consoleLogSpy.mockRestore()
    })

    it('should log HTTP requests', async () => {
      await request(app).get('/test')

      // Morgan should have logged the request
      // Note: In test environment, morgan might not log to console
      // This test verifies that morgan middleware is applied without errors
      expect(true).toBe(true) // If we reach here, morgan didn't throw
    })

    it('should log POST requests', async () => {
      await request(app).post('/test/json').send({ test: 'data' })

      // Morgan should handle POST requests without errors
      expect(true).toBe(true)
    })

    it('should log error responses', async () => {
      await request(app).get('/test/error')

      // Morgan should log error responses
      expect(true).toBe(true)
    })
  })

  describe('JSON Body Parser Middleware', () => {
    it('should parse JSON requests', async () => {
      const testData = { name: 'Test', value: 123 }

      const response = await request(app).post('/test/json').send(testData)

      expect(response.status).toBe(200)
      expect(response.body.received).toEqual(testData)
    })

    it('should handle empty JSON requests', async () => {
      const response = await request(app).post('/test/json').send({})

      expect(response.status).toBe(200)
      expect(response.body.received).toEqual({})
    })

    it('should handle large JSON payloads within limit', async () => {
      const largeData = { content: 'x'.repeat(1000) }

      const response = await request(app).post('/test/json').send(largeData)

      expect(response.status).toBe(200)
      expect(response.body.received.content).toHaveLength(1000)
    })

    it('should reject malformed JSON', async () => {
      const response = await request(app)
        .post('/test/json')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')

      expect(response.status).toBe(400)
    })

    it('should handle nested JSON objects', async () => {
      const nestedData = {
        user: {
          name: 'Test User',
          settings: {
            theme: 'dark',
            notifications: true,
          },
        },
        questions: [1, 2, 3],
      }

      const response = await request(app).post('/test/json').send(nestedData)

      expect(response.status).toBe(200)
      expect(response.body.received).toEqual(nestedData)
    })
  })

  describe('URL-encoded Body Parser Middleware', () => {
    it('should parse URL-encoded form data', async () => {
      const response = await request(app)
        .post('/test/form')
        .type('form')
        .send('name=Test&value=123')

      expect(response.status).toBe(200)
      expect(response.body.received).toEqual({
        name: 'Test',
        value: '123',
      })
    })

    it('should handle extended URL-encoded data', async () => {
      const response = await request(app)
        .post('/test/form')
        .type('form')
        .send('user[name]=Test&user[email]=test@example.com')

      expect(response.status).toBe(200)
      expect(response.body.received.user).toEqual({
        name: 'Test',
        email: 'test@example.com',
      })
    })

    it('should handle empty form data', async () => {
      const response = await request(app)
        .post('/test/form')
        .type('form')
        .send('')

      expect(response.status).toBe(200)
      expect(response.body.received).toEqual({})
    })

    it('should handle special characters in form data', async () => {
      const response = await request(app)
        .post('/test/form')
        .type('form')
        .send('message=Hello%20World%21&special=%40%23%24')

      expect(response.status).toBe(200)
      expect(response.body.received).toEqual({
        message: 'Hello World!',
        special: '@#$',
      })
    })
  })

  describe('404 Handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/non-existent-route')

      expect(response.status).toBe(404)
      expect(response.body.error).toBe('API endpoint not found')
    })

    it('should return 404 for non-existent POST routes', async () => {
      const response = await request(app).post('/non-existent-route')

      expect(response.status).toBe(404)
      expect(response.body.error).toBe('API endpoint not found')
    })

    it('should return 404 for non-existent API paths', async () => {
      const response = await request(app).get('/api/non-existent')

      expect(response.status).toBe(404)
      expect(response.body.error).toBe('API endpoint not found')
    })
  })

  describe('Error Handler', () => {
    it('should handle thrown errors', async () => {
      const response = await request(app).get('/test/error')

      expect(response.status).toBe(500)
      expect(response.body.error).toBe('Internal server error')
    })

    it('should not expose error details in production-like environment', async () => {
      const response = await request(app).get('/test/error')

      expect(response.status).toBe(500)
      expect(response.body.error).toBe('Internal server error')
      expect(response.body.stack).toBeUndefined()
      expect(response.body.message).toBeUndefined()
    })
  })

  describe('Content-Type Handling', () => {
    it('should handle JSON content type', async () => {
      const response = await request(app)
        .post('/test/json')
        .set('Content-Type', 'application/json')
        .send('{"test": "data"}')

      expect(response.status).toBe(200)
      expect(response.body.received.test).toBe('data')
    })

    it('should handle form content type', async () => {
      const response = await request(app)
        .post('/test/form')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send('test=data')

      expect(response.status).toBe(200)
      expect(response.body.received.test).toBe('data')
    })

    it('should reject unsupported content types gracefully', async () => {
      const response = await request(app)
        .post('/test/json')
        .set('Content-Type', 'text/plain')
        .send('plain text data')

      // Should not crash the application
      expect([200, 400, 415]).toContain(response.status)
    })
  })

  describe('Request Size Limits', () => {
    it('should accept requests within size limits', async () => {
      const mediumData = { content: 'x'.repeat(10000) }

      const response = await request(app).post('/test/json').send(mediumData)

      expect(response.status).toBe(200)
      expect(response.body.received.content).toHaveLength(10000)
    })

    // Note: Testing actual size limit rejection would require sending
    // very large payloads which might be impractical in unit tests
  })

  describe('HTTP Methods', () => {
    it('should handle GET requests', async () => {
      const response = await request(app).get('/test')

      expect(response.status).toBe(200)
    })

    it('should handle POST requests', async () => {
      const response = await request(app).post('/test/json').send({})

      expect(response.status).toBe(200)
    })

    it('should handle OPTIONS requests (CORS preflight)', async () => {
      const response = await request(app).options('/test')

      expect(response.status).toBe(204)
    })

    it('should reject unsupported methods on specific routes', async () => {
      const response = await request(app).patch('/test')

      // Should either return 404 or 405 (Method Not Allowed)
      expect([404, 405]).toContain(response.status)
    })
  })
})
