-- CreateTable
CREATE TABLE "EssayAnswer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "timeSpent" INTEGER,
    "deviceType" TEXT,
    "isDraft" BOOLEAN NOT NULL DEFAULT false,
    "score" INTEGER,
    "feedback" TEXT,
    "questionId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EssayAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExamSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "examType" TEXT NOT NULL,
    "examDate" DATETIME NOT NULL,
    "targetScore" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "StudyTarget" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "examScheduleId" TEXT NOT NULL,
    "categoryId" TEXT,
    "targetType" TEXT NOT NULL,
    "targetValue" INTEGER NOT NULL,
    "currentValue" INTEGER NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StudyTarget_examScheduleId_fkey" FOREIGN KEY ("examScheduleId") REFERENCES "ExamSchedule" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StudyTarget_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Question_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Question" ("categoryId", "content", "createdAt", "difficulty", "explanation", "id", "session", "updatedAt", "year") SELECT "categoryId", "content", "createdAt", "difficulty", "explanation", "id", "session", "updatedAt", "year" FROM "Question";
DROP TABLE "Question";
ALTER TABLE "new_Question" RENAME TO "Question";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "EssayAnswer_questionId_isDraft_idx" ON "EssayAnswer"("questionId", "isDraft");

-- CreateIndex
CREATE INDEX "ExamSchedule_examDate_isActive_idx" ON "ExamSchedule"("examDate", "isActive");

-- CreateIndex
CREATE INDEX "StudyTarget_examScheduleId_idx" ON "StudyTarget"("examScheduleId");
