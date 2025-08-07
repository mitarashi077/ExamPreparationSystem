# タスク: データベーススキーマ拡張

計画書: learning-progress-dashboard.md
全体設計書: _overview-learning-progress-dashboard.md
タスク番号: LPD-001
タスクサイズ: 小規模
想定ファイル数: 2
想定作業時間: 2時間
依存タスク: なし

## 全体における位置づけ
### プロジェクト全体の目的
学習進捗ダッシュボード機能により、学習者の進捗可視化とモチベーション向上を実現

### このタスクの役割
ダッシュボード機能に必要なデータモデルをデータベースに追加し、後続のAPI実装の基盤を構築

### 前タスクとの関連
- 前タスク: なし（プロジェクトの出発点）
- 引き継ぐ情報: 既存のデータベーススキーマ

### 後続タスクへの影響
- 後続タスク: LPD-002 (コアAPI エンドポイント)
- 提供する情報: ダッシュボード用のデータモデル（DashboardPreference, StudyGoal, Achievement）とAnswerモデルの拡張

## 概要
Prismaスキーマにダッシュボード機能で使用するデータモデルを追加し、データベースマイグレーションを実行する。

## 対象ファイル
- [ ] backend/prisma/schema.prisma
- [ ] backend/prisma/migrations/（新規マイグレーションファイル）

## 実装手順（TDD: Red-Green-Refactor）

### 1. **Red Phase - 失敗するテストを書く**
   - [ ] スキーマ変更前にPrisma generateを実行し、新しいモデルが存在しないことを確認
   - [ ] 新しいモデルにアクセスするテストコードを書き、コンパイルエラーを確認
   - [ ] マイグレーション前の状態でデータベース接続テストを実行

### 2. **Green Phase - 最小限の実装**
   - [ ] schema.prismaに以下のモデルを追加:
     ```prisma
     model DashboardPreference {
       id            String   @id @default(cuid())
       userId        String?  // Optional until user system implemented
       chartTypes    Json     // Preferred chart configurations
       defaultPeriod Int      @default(30)
       showComparison Boolean @default(false)
       createdAt     DateTime @default(now())
       updatedAt     DateTime @updatedAt
     }

     model StudyGoal {
       id           String   @id @default(cuid())
       userId       String?  // Optional until user system implemented
       targetType   String   // "daily_questions", "accuracy", "study_time"
       targetValue  Float    // Goal value
       currentValue Float    @default(0)
       period       String   // "daily", "weekly", "monthly"
       isActive     Boolean  @default(true)
       createdAt    DateTime @default(now())
       updatedAt    DateTime @updatedAt
     }

     model Achievement {
       id          String   @id @default(cuid())
       userId      String?  // Optional until user system implemented
       type        String   // "streak", "accuracy", "volume", "category_master"
       title       String
       description String
       iconName    String
       unlockedAt  DateTime @default(now())
     }
     ```
   - [ ] Answerモデルに以下のフィールドを追加:
     ```prisma
     model Answer {
       // ... existing fields
       sessionId       String?  // 学習セッションID
       confidenceLevel Int?     // 回答時の自信度 (1-5)
       // ... rest of existing fields
     }
     ```
   - [ ] データベースインデックスを追加:
     ```prisma
     // Answer model indexes for analytics
     @@index([createdAt])
     @@index([questionId, createdAt])
     @@index([sessionId])
     ```

### 3. **Refactor Phase - コード改善**
   - [ ] `npx prisma generate`を実行してTypeScript型を生成
   - [ ] `npx prisma migrate dev --name "add-dashboard-models"`でマイグレーション作成・実行
   - [ ] マイグレーションファイルの内容をレビューし、データ損失がないことを確認
   - [ ] 新しいモデルの型がTypeScriptで正しく利用できることを確認

## 完了条件
- [ ] Red Phase: 新しいモデル用のテストを作成し、存在しないことを確認済み
- [ ] Green Phase: すべてのダッシュボード用モデルがスキーマに追加済み
- [ ] Refactor Phase: マイグレーションが正常に実行され、TypeScript型が生成済み
- [ ] `npx prisma db push`が成功し、データベーススキーマが更新済み
- [ ] **注記**: 全体品質保証とコミット作成は品質保証工程で別途実施

## 注意事項
### 実装上の注意
- userIdはOptionalとし、将来のユーザーシステム実装時に対応
- Jsonフィールド（chartTypes）は初期値として空オブジェクト`{}`を想定
- インデックスは分析クエリのパフォーマンス向上のため必須
- 既存のAnswerモデルへの変更は新しいフィールド追加のみに限定

### 影響範囲の制御
- このタスクで変更してはいけない部分: 既存のテーブル構造とリレーション
- 影響が波及する可能性がある箇所: Answer型を使用している既存のAPI（sessionId, confidenceLevelは全てOptionalなので影響なし）

### 共通化の指針
- 他タスクと共通化すべき処理: データベース接続パターンは既存のPrismaクライアント使用方法に準拠
- 冗長実装を避けるための確認事項: 新しいモデルのフィールド命名は既存のモデルと一貫性を保つ