# タスク: ブックマーク機能 - データベーススキーマ設計・実装

計画書: Task 6.1.2 ブックマーク機能
全体設計書: task-6.1.2-decomposition.md (.tmp配置)
タスク番号: 6.1.2-A
タスクサイズ: 小規模
想定ファイル数: 3
想定作業時間: 30分
依存タスク: なし
並行実行: ✅ 他の初期タスク（B, C）と同時実行可能
担当推奨エージェント: backend-executor

## 全体における位置づけ
### プロジェクト全体の目的
ワンタップでブックマーク追加/削除、メモ機能付きブックマーク、カテゴリ別フィルタ・検索機能を備えた重要問題マーク機能の実装

### このタスクの役割
ブックマーク機能の基盤となるデータベーススキーマを設計・実装し、後続のAPI実装とフロントエンド開発の土台を提供する

### 前タスクとの関連
- 前タスク: なし（初期フェーズタスク）
- 引き継ぐ情報: なし

### 後続タスクへの影響
- 後続タスク: 6.1.2-D（バックエンドAPI実装）
- 提供する情報: Bookmarkモデル定義、テーブル設計、サンプルデータ

## 概要
ブックマーク機能に必要なデータベーススキーマを設計し、Prismaマイグレーションを実行してBookmarkテーブルを作成する。メモ機能とカテゴリ管理に対応した設計とする。

## 対象ファイル
- [ ] backend/prisma/schema.prisma
- [ ] backend/prisma/migrations/（新規マイグレーションファイル）
- [ ] database/seed.ts

## 実装手順（TDD: Red-Green-Refactor）

### 1. **Red Phase - 失敗するテストを書く**
   - [ ] スキーマ検証テスト作成：Bookmarkモデルが定義されていることをテスト
   - [ ] 制約検証テスト作成：必須フィールド、外部キー制約のテスト
   - [ ] テスト実行して失敗を確認：`npm test -- --testNamePattern="bookmark.*schema"`

### 2. **Green Phase - 最小限の実装**
   - [ ] schema.prismaにBookmarkモデルを追加：
     ```prisma
     model Bookmark {
       id          Int      @id @default(autoincrement())
       userId      Int
       questionId  Int
       memo        String?  // メモ機能
       category    String?  // カテゴリ分類
       createdAt   DateTime @default(now())
       updatedAt   DateTime @updatedAt
     
       user        User     @relation(fields: [userId], references: [id])
       question    Question @relation(fields: [questionId], references: [id])
     
       @@unique([userId, questionId]) // 同一ユーザー・問題の重複防止
       @@map("bookmarks")
     }
     ```
   - [ ] マイグレーション生成・実行：`npx prisma migrate dev --name add_bookmark_table`
   - [ ] 追加したテストのみ実行して通ることを確認

### 3. **Refactor Phase - コード改善**
   - [ ] スキーマの最適化：インデックス追加、制約見直し
   - [ ] seed.tsにテスト用ブックマークデータを追加
   - [ ] データベース整合性確認：`npx prisma db push`
   - [ ] 追加したテストが引き続き通ることを確認

## 完了条件
- [ ] Red Phase: Bookmarkモデル定義検証テストを作成済み
- [ ] Green Phase: 最小限のBookmarkモデルでテストがパス
- [ ] Refactor Phase: 最適化されたスキーマが完成し、追加したテストが通る状態を維持
- [ ] 追加したスキーマテストのみが全てパス（全体テストは品質保証工程で実施）
- [ ] **注記**: 全体品質保証とコミット作成は品質保証工程で別途実施

## 注意事項
### 実装上の注意
- 既存のUserモデル、Questionモデルとの外部キー制約を正しく設定すること
- ユニーク制約で同一ユーザー・問題の重複ブックマークを防ぐこと
- メモフィールドはオプショナル（nullable）とすること
- カテゴリフィールドは将来の拡張を考慮してstring型で設計

### 影響範囲の制御
- このタスクで変更してはいけない部分: 既存のUserモデル、Questionモデル定義
- 影響が波及する可能性がある箇所: Prismaクライアントの型生成（後続タスクで活用）

### 共通化の指針
- 他タスクと共通化すべき処理: なし（データベーススキーマは独立）
- 冗長実装を避けるための確認事項: 既存テーブルとの命名規則統一