import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import questionRoutes from './routes/questionRoutes'
import answerRoutes from './routes/answerRoutes'
import categoryRoutes from './routes/categoryRoutes'
import reviewRoutes from './routes/reviewRoutes'
import bookmarkRoutes from './routes/bookmarkRoutes'

const app = express()
const PORT = process.env.PORT || 3001

app.use(helmet())
app.use(cors())
app.use(morgan('combined'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    environment: process.env.NODE_ENV,
    database_configured: !!process.env.DATABASE_URL,
    timestamp: new Date().toISOString(),
    version: '1.1.0'
  })
})

// Simple categories test
// Production seed endpoint
app.post('/api/seed-production', async (_req, res) => {
  try {
    console.log('🌱 Starting production database seed...');
    const { PrismaClient } = await import('@prisma/client');
    
    // Clean DATABASE_URL if it has psql prefix
    let cleanUrl = process.env.DATABASE_URL;
    if (cleanUrl?.startsWith("psql '") && cleanUrl.endsWith("'")) {
      cleanUrl = cleanUrl.slice(5, -1);
    }
    
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: cleanUrl
        }
      }
    });
    
    await prisma.$connect();
    
    // Check existing questions
    const existingQuestions = await prisma.question.findMany();
    console.log(`Existing questions: ${existingQuestions.length}`);
    
    if (existingQuestions.length > 0) {
      await prisma.$disconnect();
      return res.json({
        status: 'SKIPPED',
        message: 'Test data already exists',
        questionCount: existingQuestions.length
      });
    }
    
    // Get existing categories
    const categories = await prisma.category.findMany();
    console.log(`Found ${categories.length} categories`);
    
    if (categories.length === 0) {
      await prisma.$disconnect();
      return res.status(400).json({
        status: 'ERROR',
        message: 'No categories found. Please create categories first.'
      });
    }
    
    // Create test questions
    const sampleQuestions = await Promise.all([
      prisma.question.create({
        data: {
          content: 'エンベデッドシステムにおいて、リアルタイム性が重要な理由として、最も適切なものはどれか。',
          explanation: 'リアルタイム性は、決められた時間内に処理を完了することを保証する特性で、安全性や品質に直結します。',
          difficulty: 2,
          year: 2023,
          session: '秋期',
          categoryId: categories[0].id,
          choices: {
            create: [
              { content: '処理能力が向上するため', isCorrect: false },
              { content: '消費電力が削減されるため', isCorrect: false },
              { content: '決められた時間内に処理を完了する必要があるため', isCorrect: true },
              { content: 'メモリ使用量が削減されるため', isCorrect: false },
            ],
          },
        },
      }),
      prisma.question.create({
        data: {
          content: 'RTOS（Real-Time Operating System）の主な特徴として、適切でないものはどれか。',
          explanation: 'RTOSは確定的な応答時間を提供するため、タスクスケジューリングが予測可能である必要があります。',
          difficulty: 3,
          year: 2023,
          session: '春期',
          categoryId: categories.length > 2 ? categories[2].id : categories[0].id,
          choices: {
            create: [
              { content: '確定的な応答時間を提供する', isCorrect: false },
              { content: 'プリエンプティブなタスクスケジューリング', isCorrect: false },
              { content: '高いスループットを重視する', isCorrect: true },
              { content: '割り込み処理の高速化', isCorrect: false },
            ],
          },
        },
      }),
      prisma.question.create({
        data: {
          content: 'マイクロコントローラにおけるハーバードアーキテクチャの特徴はどれか。',
          explanation: 'ハーバードアーキテクチャは、プログラムメモリとデータメモリを物理的に分離したアーキテクチャです。',
          difficulty: 2,
          year: 2022,
          session: '秋期',
          categoryId: categories.length > 1 ? categories[1].id : categories[0].id,
          choices: {
            create: [
              { content: 'プログラムとデータが同じメモリ空間を共有する', isCorrect: false },
              { content: 'プログラムメモリとデータメモリが物理的に分離されている', isCorrect: true },
              { content: 'キャッシュメモリを必ず搭載している', isCorrect: false },
              { content: '仮想メモリ機能を提供する', isCorrect: false },
            ],
          },
        },
      }),
      prisma.question.create({
        data: {
          content: 'DMA（Direct Memory Access）コントローラの主な利点として、最も適切なものはどれか。',
          explanation: 'DMAはCPUを介さずにメモリと周辺機器間でデータ転送を行うため、CPUの負荷を軽減できます。',
          difficulty: 2,
          year: 2023,
          session: '春期',
          categoryId: categories.length > 1 ? categories[1].id : categories[0].id,
          choices: {
            create: [
              { content: 'メモリ容量が増加する', isCorrect: false },
              { content: 'CPUの処理負荷を軽減できる', isCorrect: true },
              { content: '消費電力が削減される', isCorrect: false },
              { content: 'クロック周波数を向上できる', isCorrect: false },
            ],
          },
        },
      }),
      prisma.question.create({
        data: {
          content: '組込みCプログラミングにおいて、volatile キーワードを使用する主な理由はどれか。',
          explanation: 'volatileキーワードは、変数がハードウェアや割り込みハンドラによって予期せず変更される可能性があることをコンパイラに通知します。',
          difficulty: 2,
          year: 2024,
          session: '春期',
          categoryId: categories.length > 2 ? categories[2].id : categories[0].id,
          choices: {
            create: [
              { content: 'メモリ使用量を削減するため', isCorrect: false },
              { content: 'コンパイラの最適化を抑制するため', isCorrect: true },
              { content: '実行速度を向上させるため', isCorrect: false },
              { content: 'スタックオーバーフローを防ぐため', isCorrect: false },
            ],
          },
        },
      }),
    ]);
    
    await prisma.$disconnect();
    
    res.json({
      status: 'SUCCESS',
      message: 'Production seed completed successfully',
      questionsCreated: sampleQuestions.length,
      categoriesUsed: categories.length
    });
    
  } catch (error) {
    console.error('❌ Production seed failed:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Production seed failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.get('/api/categories-test', async (_req, res) => {
  try {
    console.log('🔍 Categories test started...');
    const { PrismaClient } = await import('@prisma/client');
    
    // Clean DATABASE_URL if it has psql prefix
    let cleanUrl = process.env.DATABASE_URL;
    if (cleanUrl?.startsWith("psql '") && cleanUrl.endsWith("'")) {
      cleanUrl = cleanUrl.slice(5, -1);
      console.log('🧹 Cleaned DATABASE_URL from psql format');
    }
    
    console.log('📊 Creating Prisma client...');
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: cleanUrl
        }
      }
    });
    
    console.log('🔌 Connecting to database...');
    await prisma.$connect();
    console.log('✅ Connected successfully');
    
    console.log('📋 Fetching categories...');
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        description: true
      }
    });
    console.log(`📊 Found ${categories.length} categories:`, categories);
    
    await prisma.$disconnect();
    console.log('🔌 Disconnected from database');
    
    res.json({ 
      status: 'SUCCESS',
      message: 'Categories test completed',
      count: categories.length,
      categories: categories
    });
    
  } catch (error) {
    console.error('❌ Categories test failed:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack?.split('\n').slice(0, 5) : undefined,
      name: error instanceof Error ? error.constructor.name : 'Unknown'
    });
    
    res.status(500).json({ 
      status: 'ERROR',
      error: 'Categories test failed',
      debug: {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.constructor.name : 'Unknown'
      }
    });
  }
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
    let questionCount: number | string = 'N/A';
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

// Manual database migration endpoint
app.post('/api/db-migrate', async (_req, res) => {
  try {
    console.log('🚀 Starting manual database migration...');
    
    const { PrismaClient } = await import('@prisma/client');
    
    // Clean DATABASE_URL if needed
    let cleanUrl = process.env.DATABASE_URL;
    if (cleanUrl?.startsWith("psql '") && cleanUrl.endsWith("'")) {
      cleanUrl = cleanUrl.slice(5, -1);
    }
    
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: cleanUrl
        }
      }
    });
    
    await prisma.$connect();
    console.log('✅ Connected to database for migration');
    
    // Create tables using raw SQL (Prisma db push equivalent)
    const migrations = [
      // Categories table
      `CREATE TABLE IF NOT EXISTS "Category" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "parentId" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );`,
      
      // Questions table
      `CREATE TABLE IF NOT EXISTS "Question" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "content" TEXT NOT NULL,
        "explanation" TEXT,
        "difficulty" INTEGER NOT NULL DEFAULT 1,
        "year" INTEGER,
        "session" TEXT,
        "categoryId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );`,
      
      // Choices table
      `CREATE TABLE IF NOT EXISTS "Choice" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "content" TEXT NOT NULL,
        "isCorrect" BOOLEAN NOT NULL DEFAULT false,
        "questionId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );`,
      
      // Answers table
      `CREATE TABLE IF NOT EXISTS "Answer" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "isCorrect" BOOLEAN NOT NULL,
        "timeSpent" INTEGER,
        "deviceType" TEXT,
        "questionId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );`,
      
      // StudySession table
      `CREATE TABLE IF NOT EXISTS "StudySession" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "deviceType" TEXT,
        "duration" INTEGER,
        "score" DOUBLE PRECISION,
        "categoryId" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );`,
      
      // ReviewItem table
      `CREATE TABLE IF NOT EXISTS "ReviewItem" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "questionId" TEXT NOT NULL UNIQUE,
        "masteryLevel" INTEGER NOT NULL DEFAULT 0,
        "reviewCount" INTEGER NOT NULL DEFAULT 0,
        "lastReviewed" TIMESTAMP(3),
        "nextReview" TIMESTAMP(3) NOT NULL,
        "wrongCount" INTEGER NOT NULL DEFAULT 1,
        "correctStreak" INTEGER NOT NULL DEFAULT 0,
        "priority" INTEGER NOT NULL DEFAULT 1,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );`,
      
      // ReviewSession table
      `CREATE TABLE IF NOT EXISTS "ReviewSession" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "duration" INTEGER,
        "totalItems" INTEGER NOT NULL DEFAULT 0,
        "correctItems" INTEGER NOT NULL DEFAULT 0,
        "deviceType" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );`,
      
      // Bookmark table
      `CREATE TABLE IF NOT EXISTS "Bookmark" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "questionId" TEXT NOT NULL,
        "userId" TEXT,
        "memo" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );`,
      
      // Create unique constraint for Bookmark
      `CREATE UNIQUE INDEX IF NOT EXISTS "Bookmark_questionId_userId_key" ON "Bookmark"("questionId", "userId");`
    ];
    
    // Execute each migration
    const results = [];
    for (let i = 0; i < migrations.length; i++) {
      try {
        await prisma.$executeRawUnsafe(migrations[i]);
        results.push(`Migration ${i + 1}: SUCCESS`);
        console.log(`✅ Migration ${i + 1} completed`);
      } catch (error) {
        results.push(`Migration ${i + 1}: ERROR - ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.error(`❌ Migration ${i + 1} failed:`, error);
      }
    }
    
    // Insert initial data
    console.log('📊 Inserting initial data...');
    await prisma.$executeRawUnsafe(`
      INSERT INTO "Category" ("id", "name", "description", "createdAt", "updatedAt") 
      VALUES 
        ('cat1', 'エンベデッドシステム基礎', 'エンベデッドシステムの基本概念', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('cat2', 'ハードウェア設計', 'ハードウェア設計に関する問題', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('cat3', 'ソフトウェア設計', 'ソフトウェア設計とプログラミング', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT ("id") DO NOTHING;
    `);
    
    // Verify tables were created
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    await prisma.$disconnect();
    
    res.json({
      status: 'SUCCESS',
      message: 'Database migration completed successfully',
      results: results,
      tables_created: tables,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    res.status(500).json({
      status: 'ERROR',
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
})

// Manual Bookmark table creation endpoint
app.post('/api/create-bookmark-table', async (_req, res) => {
  try {
    console.log('🔖 Creating Bookmark table...');
    const { PrismaClient } = await import('@prisma/client');
    
    // Clean DATABASE_URL if it has psql prefix
    let cleanUrl = process.env.DATABASE_URL;
    if (cleanUrl?.startsWith("psql '") && cleanUrl.endsWith("'")) {
      cleanUrl = cleanUrl.slice(5, -1);
    }
    
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: cleanUrl
        }
      }
    });
    
    await prisma.$connect();
    console.log('✅ Connected to database');
    
    // Create Bookmark table
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Bookmark" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "questionId" TEXT NOT NULL,
          "userId" TEXT,
          "memo" TEXT,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE
        );
      `);
      
      // Create unique constraint for Bookmark
      await prisma.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "Bookmark_questionId_userId_key" ON "Bookmark"("questionId", "userId");
      `);
      
      console.log('✅ Bookmark table created successfully');
      
      // Verify table creation
      const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `;
      
      await prisma.$disconnect();
      
      res.json({
        status: 'SUCCESS',
        message: 'Bookmark table created successfully',
        tables: tables,
        timestamp: new Date().toISOString()
      });
      
    } catch (tableError) {
      console.error('❌ Bookmark table creation failed:', tableError);
      await prisma.$disconnect();
      
      res.status(500).json({
        status: 'ERROR',
        message: 'Bookmark table creation failed',
        error: tableError instanceof Error ? tableError.message : 'Unknown error'
      });
    }
    
  } catch (error) {
    console.error('❌ Bookmark table creation failed:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Bookmark table creation failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
})

// Bookmark table test endpoint
app.get('/api/bookmark-test', async (_req, res) => {
  try {
    console.log('🔖 Bookmark test started...');
    const { PrismaClient } = await import('@prisma/client');
    
    // Clean DATABASE_URL if it has psql prefix
    let cleanUrl = process.env.DATABASE_URL;
    if (cleanUrl?.startsWith("psql '") && cleanUrl.endsWith("'")) {
      cleanUrl = cleanUrl.slice(5, -1);
      console.log('🧹 Cleaned DATABASE_URL from psql format');
    }
    
    console.log('📊 Creating Prisma client...');
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: cleanUrl
        }
      }
    });
    
    console.log('🔌 Connecting to database...');
    await prisma.$connect();
    console.log('✅ Connected successfully');
    
    // Check if Bookmark table exists
    console.log('🔖 Checking Bookmark table...');
    try {
      const bookmarkCount = await prisma.bookmark.count();
      console.log(`📊 Found ${bookmarkCount} bookmarks`);
      
      // Try to fetch first few bookmarks
      const bookmarks = await prisma.bookmark.findMany({
        take: 3,
        include: {
          question: {
            select: {
              content: true,
              categoryId: true
            }
          }
        }
      });
      
      await prisma.$disconnect();
      console.log('🔌 Disconnected from database');
      
      res.json({ 
        status: 'SUCCESS',
        message: 'Bookmark test completed',
        bookmarkCount: bookmarkCount,
        sampleBookmarks: bookmarks,
        tableExists: true
      });
      
    } catch (tableError) {
      console.log('❌ Bookmark table test failed:', tableError);
      await prisma.$disconnect();
      
      res.json({ 
        status: 'TABLE_NOT_FOUND',
        message: 'Bookmark table does not exist',
        tableExists: false,
        error: tableError instanceof Error ? tableError.message : 'Unknown error'
      });
    }
    
  } catch (error) {
    console.error('❌ Bookmark test failed:', error);
    res.status(500).json({ 
      status: 'ERROR',
      error: 'Bookmark test failed',
      debug: {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.constructor.name : 'Unknown'
      }
    });
  }
})

// Simple SQL execution endpoint for bookmark table creation
app.post('/api/execute-sql', async (req, res) => {
  try {
    const { sql } = req.body;
    if (!sql) {
      return res.status(400).json({ error: 'SQL query required' });
    }
    
    const { PrismaClient } = await import('@prisma/client');
    
    // Clean DATABASE_URL if it has psql prefix
    let cleanUrl = process.env.DATABASE_URL;
    if (cleanUrl?.startsWith("psql '") && cleanUrl.endsWith("'")) {
      cleanUrl = cleanUrl.slice(5, -1);
    }
    
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: cleanUrl
        }
      }
    });
    
    await prisma.$connect();
    
    const result = await prisma.$executeRawUnsafe(sql);
    
    await prisma.$disconnect();
    
    res.json({
      status: 'SUCCESS',
      message: 'SQL executed successfully',
      result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('SQL execution failed:', error);
    res.status(500).json({
      status: 'ERROR',
      error: 'SQL execution failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
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
app.use((_err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // Unhandled error logged
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
