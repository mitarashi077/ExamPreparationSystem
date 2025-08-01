import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import questionRoutes from './routes/questionRoutes'
import answerRoutes from './routes/answerRoutes'
import categoryRoutes from './routes/categoryRoutes'

const app = express()
const PORT = process.env.PORT || 3001

app.use(helmet())
app.use(cors())
app.use(morgan('combined'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

// API Routes
app.use('/api/questions', questionRoutes)
app.use('/api/answers', answerRoutes)
app.use('/api/categories', categoryRoutes)

// 404 handler
app.use('/api/*', (_req, res) => {
  res.status(404).json({ error: 'API endpoint not found' })
})

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/api/health`)
})