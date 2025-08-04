-- CreateTable
CREATE TABLE "QuestionSection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "sectionType" TEXT NOT NULL DEFAULT 'main',
    "hasImage" BOOLEAN NOT NULL DEFAULT false,
    "hasTable" BOOLEAN NOT NULL DEFAULT false,
    "hasCode" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "QuestionSection_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Question" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "explanation" TEXT,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "year" INTEGER,
    "session" TEXT,
    "categoryId" TEXT NOT NULL,
    "questionType" TEXT NOT NULL DEFAULT 'multiple_choice',
    "maxScore" INTEGER,
    "sampleAnswer" TEXT,
    "hasImages" BOOLEAN NOT NULL DEFAULT false,
    "hasTables" BOOLEAN NOT NULL DEFAULT false,
    "hasCodeBlocks" BOOLEAN NOT NULL DEFAULT false,
    "readingTime" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Question_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Question" ("categoryId", "content", "createdAt", "difficulty", "explanation", "id", "maxScore", "questionType", "sampleAnswer", "session", "updatedAt", "year") SELECT "categoryId", "content", "createdAt", "difficulty", "explanation", "id", "maxScore", "questionType", "sampleAnswer", "session", "updatedAt", "year" FROM "Question";
DROP TABLE "Question";
ALTER TABLE "new_Question" RENAME TO "Question";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "QuestionSection_questionId_order_idx" ON "QuestionSection"("questionId", "order");
