# ADR-0004: 試験日程管理機能のアーキテクチャ設計

## ステータス
Proposed

## 作成日
2025-08-04

## 背景と解決すべき課題

### 課題
Task 6.2.1として、以下の試験日程管理機能を実装する必要がある：
- 試験日設定・カウントダウン表示機能
- 学習進捗ペース管理機能
- 日別・週別学習目標の自動計算
- モバイル最適化されたUI/UX

### 技術的制約
- 既存のBookmark、ReviewSystem、StudySessionとの統合
- SQLiteデータベースでの効率的なスケジュール管理
- React + Zustand の既存状態管理との統合
- モバイルファーストデザインとPWA対応
- 個人利用前提の軽量設計

### 解決すべき設計課題
1. 試験スケジュールデータの管理方法
2. 進捗ペース計算アルゴリズムの実装
3. カウントダウン表示とリアルタイム更新
4. 通知・アラート機能の統合
5. 既存学習データとの連携方法

## 検討した選択肢

### 案A: 統合型ExamScheduleテーブル設計

**概要**: 試験スケジュール、学習目標、進捗管理を統合したテーブル設計

**技術仕様**:
```sql
model ExamSchedule {
  id           String   @id @default(cuid())
  examName     String   // "エンベデッドシステムスペシャリスト 春期2025"
  examDate     DateTime
  targetScore  Int?     // 目標得点（午前Ⅰ・Ⅱ・午後Ⅰ）
  sessionType  String   // "spring", "autumn"
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  // 関連データ
  studyTargets StudyTarget[]
  studySessions StudySessionTarget[]
}

model StudyTarget {
  id           String   @id @default(cuid())
  scheduleId   String
  categoryId   String
  targetQuestions Int    // 目標問題数
  targetAccuracy  Float  // 目標正答率
  priority     Int      @default(1) // 1-5
  deadline     DateTime? // 分野別締切
  isCompleted  Boolean  @default(false)
  
  schedule     ExamSchedule @relation(fields: [scheduleId], references: [id])
  category     Category     @relation(fields: [categoryId], references: [id])
}
```

**利点**:
- 包括的なスケジュール管理
- 分野別目標設定が可能
- 詳細な進捗トラッキング
- 複数試験対応可能

**欠点**:
- 実装の複雑性が高い
- 初期設定が煩雑
- パフォーマンスへの影響

**工数**: 5日
**主なリスク**: 機能の複雑化、ユーザビリティの低下

### 案B: シンプルなExamDateテーブル設計

**概要**: 最小限の試験日管理機能に特化した軽量設計

**技術仕様**:
```sql
model ExamDate {
  id          String   @id @default(cuid())
  examName    String
  examDate    DateTime
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model DailyStudyGoal {
  id             String   @id @default(cuid())
  date           DateTime @unique
  targetQuestions Int     @default(10)
  actualQuestions Int     @default(0)
  targetTime     Int      @default(1800) // 30分 (秒)
  actualTime     Int      @default(0)
  isCompleted    Boolean  @default(false)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

**利点**:
- シンプルで理解しやすい
- 実装工数が少ない
- パフォーマンスが良好
- YAGNI原則に従った設計

**欠点**:
- 高度な分析機能が制限される
- 将来の拡張が困難
- 分野別管理ができない

**工数**: 2日
**主なリスク**: 機能不足による将来的な再設計

### 案C: モジュラー設計（段階的拡張対応）

**概要**: 基本機能から始めて段階的に拡張可能な設計

**技術仕様**:
```sql
model ExamSchedule {
  id          String   @id @default(cuid())
  examName    String
  examDate    DateTime
  description String?
  isActive    Boolean  @default(true)
  settings    String?  // JSON形式で拡張設定
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model StudyPlan {
  id           String   @id @default(cuid())
  scheduleId   String
  weeklyGoal   Int      @default(70) // 週間目標問題数
  dailyGoal    Int      @default(10) // 日間目標問題数
  studyTimeGoal Int     @default(1800) // 30分
  isAutoAdjust Boolean  @default(true) // 自動調整
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  schedule     ExamSchedule @relation(fields: [scheduleId], references: [id])
}

model StudyProgress {
  id              String   @id @default(cuid())
  date            DateTime @unique
  planId          String?
  questionsStudied Int     @default(0)
  timeSpent       Int      @default(0) // 秒
  accuracy        Float?   // 正答率
  notes           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  plan            StudyPlan? @relation(fields: [planId], references: [id])
}
```

**利点**:
- 段階的な機能拡張が可能
- 基本機能は軽量でシンプル
- 既存システムとの統合が容易
- 分析機能への拡張性

**欠点**:
- 設計の一貫性維持が必要
- 中程度の実装複雑性
- JSON設定の管理が必要

**工数**: 3日
**主なリスク**: 設計の複雑化、JSON設定の管理

## 比較マトリクス

| 評価軸 | 案A (統合型) | 案B (シンプル) | 案C (モジュラー) |
|--------|-------------|---------------|-----------------|
| 実装工数 | 5日 | 2日 | 3日 |
| 保守性 | 中 | 高 | 高 |
| 拡張性 | 高 | 低 | 高 |
| パフォーマンス | 低 | 高 | 中 |
| ユーザビリティ | 低 | 高 | 高 |
| MVP適合性 | 低 | 高 | 高 |
| 将来対応 | 高 | 低 | 高 |
| 実装リスク | 高 | 低 | 中 |

## 推奨案と根拠

### 推奨: 案C（モジュラー設計）

**主な理由**:
1. **MVP要件適合**: 基本的なカウントダウンと進捗管理機能を効率的に実装
2. **段階的拡張**: 将来のAI機能や高度分析への対応が可能
3. **既存統合**: BookmarkやReviewSystemとの自然な連携
4. **YAGNI準拠**: 現在必要な機能に集中しつつ拡張性を確保

**トレードオフ**:
- 案Bより若干複雑だが、将来の再設計コストを回避
- JSON設定の管理コストを受け入れて拡張性を確保
- 中程度の実装工数で高い価値を提供

**技術的判断理由**:
- 個人利用前提で複雑な権限管理不要
- モバイル最適化に必要な軽量性を維持
- 既存のZustand状態管理パターンとの一貫性

## 実装ガイドライン

### 1. データベース実装
```sql
-- 基本的な試験スケジュール管理
model ExamSchedule {
  id          String   @id @default(cuid())
  examName    String   // "エンベデッドシステムスペシャリスト"
  examDate    DateTime
  description String?
  isActive    Boolean  @default(true)
  settings    String?  // JSON: { notifications: true, reminderDays: [30, 7, 1] }
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  studyPlans  StudyPlan[]
}

-- 学習計画管理
model StudyPlan {
  id           String   @id @default(cuid())
  scheduleId   String
  weeklyGoal   Int      @default(70)  // 週間問題数目標
  dailyGoal    Int      @default(10)  // 日間問題数目標
  studyTimeGoal Int     @default(1800) // 30分 (秒)
  isAutoAdjust Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  schedule     ExamSchedule @relation(fields: [scheduleId], references: [id])
  progress     StudyProgress[]
}

-- 日別進捗記録
model StudyProgress {
  id              String   @id @default(cuid())
  date            DateTime @unique
  planId          String?
  questionsStudied Int     @default(0)
  timeSpent       Int      @default(0)
  accuracy        Float?
  notes           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  plan            StudyPlan? @relation(fields: [planId], references: [id])
}
```

### 2. API設計方針
- RESTful設計: `/api/exam-schedules/*`
- 既存パターン準拠: questionController.tsを参考
- レスポンス軽量化: モバイル対応の最適化

### 3. 状態管理設計
```typescript
interface ExamScheduleState {
  // データ
  currentSchedule: ExamSchedule | null
  studyPlan: StudyPlan | null
  dailyProgress: StudyProgress[]
  
  // 計算値
  daysRemaining: number
  weeklyProgress: number
  onTrackStatus: 'ahead' | 'on-track' | 'behind'
  
  // アクション
  setExamDate: (date: Date, name: string) => void
  updateDailyGoal: (goal: number) => void
  recordProgress: (questions: number, time: number) => void
}
```

### 4. UI/UX設計方針
- **カウントダウンWidget**: ホーム画面に常時表示
- **進捗ダッシュボード**: 日/週/月単位の可視化
- **設定画面**: 試験日・目標設定
- **通知機能**: PWA通知との統合

## 結果と期待される効果

### 期待される成果
1. **モチベーション向上**: 試験までの具体的な日数と進捗の可視化
2. **学習効率化**: 日々の目標設定による計画的学習
3. **進捗管理**: 遅れの早期発見とリカバリープラン提案
4. **モバイル学習**: 通勤時間でも手軽に進捗確認

### 成功指標
- 試験日設定・カウントダウン表示機能の実装完了
- 日別・週別進捗トラッキング機能の動作確認
- モバイル・デスクトップ両対応UI実装
- 既存学習データとの統合確認

## リスク対策

### 技術リスク
- **タイムゾーン管理**: ローカル時間での統一処理
- **パフォーマンス**: 進捗計算の最適化
- **データ整合性**: 既存StudySessionとの連携確認

### 運用リスク
- **目標設定**: 現実的な初期設定値の提供
- **通知頻度**: 過度な通知によるユーザー疲れ防止
- **データ移行**: 既存学習データの適切な統合

## 参考情報

### 既存実装との連携ポイント
- `StudySession`: 学習時間の自動記録連携
- `Answer`: 問題数カウントの自動更新
- `useAppStore`: デバイス別設定との統合
- `PWA通知`: 試験日リマインダー機能

### 将来拡張ポイント
- AI学習ペース最適化
- 分野別進捗分析
- 学習パターン分析
- ソーシャル機能（将来）