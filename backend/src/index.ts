import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import questionRoutes from './routes/questionRoutes'
import answerRoutes from './routes/answerRoutes'
import categoryRoutes from './routes/categoryRoutes'
import reviewRoutes from './routes/reviewRoutes'

const app = express()
const PORT = process.env.PORT || 3001

app.use(helmet())
app.use(cors())
app.use(morgan('combined'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

// API Routes
app.use('/questions', questionRoutes)
app.use('/answers', answerRoutes)
app.use('/categories', categoryRoutes)
app.use('/review', reviewRoutes)

// 404 handler
app.use('*', (_req, res) => {
  res.status(404).json({ error: 'API endpoint not found' })
})

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// Export for Vercel serverless
export default app

// Local development server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
    console.log(`Health check: http://localhost:${PORT}/api/health`)
  })
}