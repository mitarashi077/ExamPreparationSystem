# ADR-0001: ブックマーク機能のアーキテクチャ設計

## ステータス
Proposed

## 作成日
2025-08-02

## 背景と解決すべき課題

### 課題
Task 6.1.2として、以下のブックマーク機能を実装する必要がある：
- 重要問題のマーク機能
- メモ機能付きブックマーク
- 既存の復習機能との統合

### 技術的制約
- 既存の復習機能（ReviewItem）との重複を避ける
- SQLiteデータベースでの効率的なデータ管理
- React + Zustand の既存状態管理との統合
- モバイル対応UI設計

### 解決すべき設計課題
1. ブックマークデータの管理方法
2. メモ機能の実装アプローチ
3. 既存復習機能との統合方法
4. UI/UXの配置とナビゲーション設計

## 検討した選択肢

### 案A: 独立したBookmarkテーブル設計

**概要**: 復習機能とは完全に独立したBookmarkテーブルを作成

**技術仕様**:
```sql
model Bookmark {
  id         String   @id @default(cuid())
  questionId String
  question   Question @relation(fields: [questionId], references: [id])
  memo       String?  // メモ機能
  tags       String?  // JSON形式でタグ管理
  priority   Int      @default(1) // 重要度 1-5
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  @@unique([questionId]) // 1問につき1ブックマーク
}
```

**利点**:
- 復習機能との責務分離が明確
- シンプルなデータ構造
- 将来的な機能拡張が容易（タグ、分類など）
- 復習機能に影響を与えない

**欠点**:
- データの重複可能性（問題が復習リストとブックマーク両方に存在）
- APIエンドポイントの増加
- 状態管理の複雑化

**工数**: 3日
**主なリスク**: データ同期の複雑性

### 案B: ReviewItemテーブル拡張

**概要**: 既存のReviewItemテーブルにブックマーク機能を統合

**技術仕様**:
```sql
model ReviewItem {
  // 既存フィールド
  id            String   @id @default(cuid())
  questionId    String
  masteryLevel  Int      @default(0)
  // ... 既存フィールド
  
  // 新規追加フィールド
  isBookmarked  Boolean  @default(false)
  bookmarkMemo  String?
  bookmarkTags  String?  // JSON形式
  bookmarkPriority Int?  // ブックマーク優先度
}
```

**利点**:
- 既存テーブル活用でデータ統合
- APIの複雑化を最小限に抑制
- 復習とブックマークの連携が自然

**欠点**:
- 復習機能の責務が曖昧になる
- ブックマークのみ（復習なし）の問題管理が複雑
- 既存の復習ロジックへの影響リスク
- テーブル設計の混在

**工数**: 2日
**主なリスク**: 既存復習機能への影響、データ整合性

### 案C: ハイブリッド設計（独立テーブル + 関連管理）

**概要**: 独立したBookmarkテーブル + Review連携テーブル

**技術仕様**:
```sql
model Bookmark {
  id         String   @id @default(cuid())
  questionId String
  question   Question @relation(fields: [questionId], references: [id])
  memo       String?
  tags       String?
  priority   Int      @default(1)
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  @@unique([questionId])
}

// 復習とブックマークの関連管理
model StudyItemRelation {
  id           String     @id @default(cuid())
  questionId   String
  bookmarkId   String?
  reviewItemId String?
  studyType    String     // "bookmark", "review", "both"
  
  @@unique([questionId])
}
```

**利点**:
- 責務分離とデータ統合の両立
- 柔軟な関連性管理
- 統一されたUI表示が可能

**欠点**:
- テーブル数の増加
- 複雑なクエリが必要
- 実装工数の増大

**工数**: 4日
**主なリスク**: 設計の複雑化、パフォーマンス

## 比較マトリクス

| 評価軸 | 案A (独立設計) | 案B (拡張設計) | 案C (ハイブリッド) |
|--------|----------------|----------------|-------------------|
| 実装工数 | 3日 | 2日 | 4日 |
| 保守性 | 高 | 中 | 中 |
| 拡張性 | 高 | 低 | 高 |
| 既存機能への影響 | 低 | 高 | 低 |
| データ整合性 | 中 | 低 | 高 |
| パフォーマンス | 高 | 高 | 中 |
| 責務分離 | 高 | 低 | 高 |
| 実装リスク | 低 | 中 | 高 |

## 推奨案と根拠

### 推奨: 案A（独立したBookmarkテーブル設計）

**主な理由**:
1. **責務分離の明確性**: 復習機能（間違い問題の自動管理）とブックマーク機能（手動マーク）の責務が明確
2. **既存機能への影響最小化**: 実装済みの復習機能に一切影響を与えない
3. **将来的な拡張性**: タグ機能、カテゴリ分類、共有機能などの追加が容易
4. **並行開発対応**: 復習機能担当agentとの作業競合が発生しない

**トレードオフ**:
- データ重複の可能性を受け入れる
- APIエンドポイントの増加を受け入れる
- 統合表示UIで若干の複雑性を許容

**技術的判断理由**:
- MVP段階での安全性を重視（既存機能への影響なし）
- YAGNI原則に従い、現在必要な機能に集中
- 個人利用前提のため、パフォーマンス影響は許容可能

## 実装ガイドライン

### 1. データベース実装
```sql
model Bookmark {
  id         String   @id @default(cuid())
  questionId String
  question   Question @relation(fields: [questionId], references: [id])
  memo       String?
  priority   Int      @default(1) // 1-5段階
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  @@unique([questionId])
}
```

### 2. API設計方針
- RESTful設計に従う
- 既存のreviewRoutes.tsを参考に bookmarkRoutes.ts を作成
- エンドポイント: `/api/bookmarks/*`

### 3. 状態管理設計
- useBookmarkStore.ts を新規作成
- 既存のuseQuestionStore.tsとは独立
- persist設定でローカル保存対応

### 4. UI/UX設計方針
- QuestionCardコンポーネントにブックマークボタン追加
- 新規ページ: BookmarkPage を作成
- Material-UIのBookmarkIcon使用

## 結果と期待される効果

### 期待される成果
1. **機能分離**: 復習（自動）とブックマーク（手動）の明確な使い分け
2. **学習効率向上**: 重要問題への迅速なアクセス
3. **メモ機能**: 個人的な学習ノートとしての活用
4. **拡張性確保**: 将来のタグ機能等への対応準備

### 成功指標
- 既存復習機能への影響ゼロ
- ブックマーク機能の基本操作（追加・削除・編集・一覧）の実装完了
- モバイル・デスクトップ両対応UI実装

## リスク対策

### 技術リスク
- **データ重複管理**: 統合表示UIでの適切な重複排除ロジック実装
- **状態同期**: ブックマーク操作後の関連状態更新の確実な実行

### 運用リスク
- **ユーザビリティ**: 復習機能との使い分けの明確な説明UI実装
- **データ整合性**: 問題削除時のブックマーク自動削除（外部キー制約）

## 参考情報

### 既存実装との連携ポイント
- `QuestionCard.tsx`: ブックマークボタン追加箇所
- `PrismaClient`: 新しいBookmarkモデルの統合
- `Material-UI`: 一貫したデザインシステム利用

### 並行開発での担当分離
- **バックエンド担当**: Bookmark model, controller, routes実装
- **フロントエンド担当**: BookmarkStore, BookmarkPage, UI統合実装
- **統合担当**: API連携テスト、E2Eテスト実装