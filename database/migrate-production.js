const { PrismaClient } = require('@prisma/client')

async function runMigrations() {
  // Neonの接続文字列（本番環境用）
  const DATABASE_URL = process.env.DATABASE_URL

  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is required')
    process.exit(1)
  }

  console.log('🚀 Starting database migration...')
  console.log(
    '📡 Connecting to:',
    DATABASE_URL.split('@')[1]?.split('/')[0] || 'database',
  )

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: DATABASE_URL,
      },
    },
  })

  try {
    // データベース接続テスト
    await prisma.$connect()
    console.log('✅ Database connection successful')

    // テーブル作成（手動スキーマ実行）
    console.log('📝 Creating database schema...')

    // Categories テーブル
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Category" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "parentId" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
      );
    `

    // Questions テーブル
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Question" (
        "id" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "explanation" TEXT,
        "difficulty" INTEGER NOT NULL DEFAULT 1,
        "year" INTEGER,
        "session" TEXT,
        "categoryId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
      );
    `

    // Choices テーブル
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Choice" (
        "id" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "isCorrect" BOOLEAN NOT NULL DEFAULT false,
        "questionId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Choice_pkey" PRIMARY KEY ("id")
      );
    `

    // Answers テーブル
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Answer" (
        "id" TEXT NOT NULL,
        "isCorrect" BOOLEAN NOT NULL,
        "timeSpent" INTEGER,
        "deviceType" TEXT,
        "questionId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
      );
    `

    // StudySession テーブル
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "StudySession" (
        "id" TEXT NOT NULL,
        "deviceType" TEXT,
        "duration" INTEGER,
        "score" DOUBLE PRECISION,
        "categoryId" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "StudySession_pkey" PRIMARY KEY ("id")
      );
    `

    // ReviewItem テーブル
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "ReviewItem" (
        "id" TEXT NOT NULL,
        "questionId" TEXT NOT NULL,
        "masteryLevel" INTEGER NOT NULL DEFAULT 0,
        "reviewCount" INTEGER NOT NULL DEFAULT 0,
        "lastReviewed" TIMESTAMP(3),
        "nextReview" TIMESTAMP(3) NOT NULL,
        "wrongCount" INTEGER NOT NULL DEFAULT 1,
        "correctStreak" INTEGER NOT NULL DEFAULT 0,
        "priority" INTEGER NOT NULL DEFAULT 1,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "ReviewItem_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "ReviewItem_questionId_key" UNIQUE ("questionId")
      );
    `

    // ReviewSession テーブル
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "ReviewSession" (
        "id" TEXT NOT NULL,
        "duration" INTEGER,
        "totalItems" INTEGER NOT NULL DEFAULT 0,
        "correctItems" INTEGER NOT NULL DEFAULT 0,
        "deviceType" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ReviewSession_pkey" PRIMARY KEY ("id")
      );
    `

    console.log('✅ Database schema created successfully')

    // 初期データ投入
    console.log('📊 Inserting initial data...')

    // サンプルカテゴリ
    await prisma.$executeRaw`
      INSERT INTO "Category" ("id", "name", "description", "createdAt", "updatedAt") 
      VALUES 
        ('cat1', 'エンベデッドシステム基礎', 'エンベデッドシステムの基本概念', NOW(), NOW()),
        ('cat2', 'ハードウェア設計', 'ハードウェア設計に関する問題', NOW(), NOW()),
        ('cat3', 'ソフトウェア設計', 'ソフトウェア設計とプログラミング', NOW(), NOW())
      ON CONFLICT ("id") DO NOTHING;
    `

    console.log('✅ Initial data inserted successfully')
    console.log('🎉 Database migration completed!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// 環境変数の設定確認
if (process.argv.includes('--check')) {
  console.log(
    'DATABASE_URL:',
    process.env.DATABASE_URL ? '✅ Set' : '❌ Not set',
  )
  process.exit(0)
}

runMigrations().catch(console.error)
