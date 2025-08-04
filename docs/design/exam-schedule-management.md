# Task 6.2.1: 試験日程管理機能 設計書

**作成日**: 2025-08-04  
**対象**: エンベデッドシステムスペシャリスト試験学習支援システム  
**機能**: 試験日程管理・学習ペース管理機能

## 1. 機能概要

### 1.1 主要機能
- **試験日設定**: 春期・秋期試験日の登録・管理
- **カウントダウン表示**: 残り日数・時間のリアルタイム表示
- **学習ペース管理**: 目標に対する進捗状況の可視化
- **スケジュール最適化**: 自動学習計画生成・調整

### 1.2 ユーザー価値
- 試験まで残り時間の明確な把握
- 学習ペースの客観的評価
- 計画的な学習進行のサポート

## 2. データベース設計

### 2.1 ExamSchedule テーブル
```prisma
model ExamSchedule {
  id          String   @id @default(cuid())
  examType    String   // "spring" | "autumn" | "special"
  examDate    DateTime
  targetScore Int?     // 目標点数（オプション）
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  studyTargets StudyTarget[]
  
  @@index([examDate, isActive])
}

model StudyTarget {
  id             String   @id @default(cuid())
  examScheduleId String
  categoryId     String?  // カテゴリ別目標（オプション）
  targetType     String   // "daily" | "weekly" | "total"
  targetValue    Int      // 目標値（問題数・時間など）
  currentValue   Int      @default(0)
  unit          String   // "questions" | "minutes" | "sessions"
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relations
  examSchedule ExamSchedule @relation(fields: [examScheduleId], references: [id], onDelete: Cascade)
  category     Category?    @relation(fields: [categoryId], references: [id])
  
  @@index([examScheduleId])
}
```

### 2.2 既存テーブルとの関係
- **StudySession**: 学習セッション記録との連携
- **Bookmark**: ブックマーク機能との統合
- **ReviewItem**: 復習システムとの連携

## 3. API設計

### 3.1 エンドポイント一覧
```typescript
// 試験スケジュール管理
GET    /api/exam-schedules          // 試験スケジュール一覧
POST   /api/exam-schedules          // 新規試験スケジュール登録
PUT    /api/exam-schedules/:id      // 試験スケジュール更新
DELETE /api/exam-schedules/:id      // 試験スケジュール削除

// 学習目標管理
GET    /api/study-targets/:scheduleId  // 学習目標一覧
POST   /api/study-targets              // 学習目標作成
PUT    /api/study-targets/:id          // 学習目標更新
DELETE /api/study-targets/:id          // 学習目標削除

// 進捗管理
GET    /api/progress/:scheduleId       // 進捗状況取得
POST   /api/progress/:scheduleId/update // 進捗更新
```

### 3.2 レスポンス形式
```typescript
interface ExamScheduleResponse {
  id: string
  examType: 'spring' | 'autumn' | 'special'
  examDate: string // ISO date string
  targetScore?: number
  daysRemaining: number
  hoursRemaining: number
  studyTargets: StudyTarget[]
  progressSummary: {
    overallProgress: number // 0-100
    onTrack: boolean
    dailyTarget: number
    weeklyTarget: number
  }
}
```

## 4. フロントエンド設計

### 4.1 コンポーネント構成
```
ExamSchedulePage/
├── ExamScheduleHeader (試験情報・カウントダウン)
├── CountdownWidget (残り時間表示)
├── ProgressDashboard (進捗ダッシュボード)
├── StudyTargetCard (学習目標カード)
├── ScheduleCalendar (学習カレンダー)
└── ExamSettingsModal (試験設定モーダル)
```

### 4.2 状態管理 (Zustand)
```typescript
interface ExamScheduleStore {
  // State
  currentSchedule: ExamSchedule | null
  studyTargets: StudyTarget[]
  progressData: ProgressData
  countdown: CountdownData
  
  // Actions
  setExamSchedule: (schedule: ExamScheduleInput) => Promise<void>
  updateProgress: (progress: ProgressUpdate) => Promise<void>
  getCountdown: () => CountdownData
  generateStudyPlan: () => Promise<StudyPlan>
  
  // Real-time updates
  startCountdownTimer: () => void
  stopCountdownTimer: () => void
}
```

### 4.3 UI/UX設計

#### 4.3.1 カウントダウン表示
- **メインダッシュボード**: 大きなカウントダウンウィジェット
- **ヘッダー**: コンパクトなカウンター（全ページ共通）
- **プログレスバー**: 学習進捗の視覚化

#### 4.3.2 モバイル最適化
- **カードベースレイアウト**: スワイプ可能な情報カード
- **タッチフレンドリー**: 44px以上のタップターゲット
- **ワンハンド操作**: 画面下部メインアクション配置

## 5. 統合設計

### 5.1 既存システムとの連携

#### 5.1.1 ブックマーク連携
- ブックマーク問題の優先学習スケジューリング
- 重要問題の進捗重み付け

#### 5.1.2 復習システム連携
- 間違い問題の復習スケジュール最適化
- 復習間隔の試験日程考慮調整

#### 5.1.3 問題演習連携
- 日別・週別の問題演習目標設定
- カテゴリ別学習バランス管理

### 5.2 通知システム
- **リマインダー**: 学習時間・目標達成アラート
- **モチベーション**: 進捗褒章・励ましメッセージ
- **警告**: 遅れアラート・追い上げ提案

## 6. 実装フェーズ

### Phase 1: 基本機能 (1時間)
- ExamSchedule データベーステーブル作成
- 基本API実装（CRUD操作）
- カウントダウン表示コンポーネント

### Phase 2: 進捗管理 (1時間)
- StudyTarget テーブル・API実装
- 進捗ダッシュボード作成
- 学習ペース計算ロジック

### Phase 3: 統合・最適化 (30分)
- 既存システムとの連携
- リアルタイム更新実装
- モバイル最適化

## 7. 技術仕様

### 7.1 技術スタック
- **Database**: Prisma + PostgreSQL/SQLite
- **Backend**: Express.js + TypeScript
- **Frontend**: React + TypeScript + Material-UI
- **State**: Zustand
- **Date Handling**: date-fns

### 7.2 パフォーマンス要件
- カウントダウン更新: 1秒間隔
- 進捗データ取得: <500ms
- UI応答性: <100ms

### 7.3 セキュリティ考慮
- 入力値検証（日付・数値）
- SQL インジェクション対策
- XSS対策

## 8. テスト戦略

### 8.1 単体テスト
- カウントダウン計算ロジック
- 進捗計算アルゴリズム
- API エンドポイント

### 8.2 統合テスト
- システム間連携動作
- リアルタイム更新機能
- データ整合性

### 8.3 UI/UXテスト
- モバイル操作性
- レスポンシブデザイン
- アクセシビリティ

---

**推定開発時間**: 2.5時間  
**優先度**: 高（学習計画の基盤機能）  
**依存関係**: 既存のブックマーク・復習システム