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
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

// Database connection test
app.get('/api/db-test', async (_req, res) => {
  try {
    const { PrismaClient } = await import('@prisma/client');
    
    // Clean DATABASE_URL if it has psql prefix
    let cleanUrl = process.env.DATABASE_URL;
    if (cleanUrl?.startsWith("psql '") && cleanUrl.endsWith("'")) {
      cleanUrl = cleanUrl.slice(5, -1); // Remove "psql '" from start and "'" from end
      console.log('🧹 Cleaned DATABASE_URL from psql format');
    }
    
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: cleanUrl
        }
      }
    });
    
    // Check environment variables
    const databaseUrl = process.env.DATABASE_URL;
    const nodeEnv = process.env.NODE_ENV;
    
    console.log('Database connection test started...');
    console.log('NODE_ENV:', nodeEnv);
    console.log('DATABASE_URL exists:', !!databaseUrl);
    
    // Test basic connection
    await prisma.$connect();
    console.log('Prisma connection successful');
    
    // Test simple database query first
    const simpleQuery = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Simple query result:', simpleQuery);
    
    // Test if tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    console.log('Existing tables:', tables);
    
    // Only try question count if Question table exists
    let questionCount = 'N/A';
    try {
      questionCount = await prisma.question.count();
      console.log('Question count:', questionCount);
    } catch (error) {
      console.log('Question table not found, this is expected on first run');
      questionCount = 'Table not found (first run)';
    }
    
    res.json({ 
      status: 'OK', 
      message: 'Database connected successfully',
      debug_info: {
        database_url_set: !!databaseUrl,
        database_url_prefix: databaseUrl ? databaseUrl.substring(0, 20) + '...' : 'Not set',
        node_env: nodeEnv || 'Not set',
        prisma_version: '5.x',
        question_count: questionCount,
        existing_tables: tables,
        simple_query: simpleQuery,
        connection_test: 'PASSED',
        timestamp: new Date().toISOString()
      }
    });
    
    await prisma.$disconnect();
    console.log('Prisma disconnected successfully');
  } catch (error) {
    console.error('Database connection test failed:', error);
    
    res.status(500).json({ 
      status: 'ERROR',
      error: 'Database connection failed',
      debug_info: {
        database_url_set: !!process.env.DATABASE_URL,
        database_url_prefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + '...' : 'Not set',
        node_env: process.env.NODE_ENV || 'Not set',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        error_name: error instanceof Error ? error.constructor.name : 'Unknown',
        error_stack: error instanceof Error ? error.stack?.split('\n').slice(0, 5) : undefined,
        timestamp: new Date().toISOString()
      }
    });
  }
})

// API Routes
app.use('/api/questions', questionRoutes)
app.use('/api/answers', answerRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/review', reviewRoutes)

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