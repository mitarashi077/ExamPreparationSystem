# Task 6.1.2 ブックマーク機能 - 並行開発対応サブタスク分解

**生成日時**: 2025-08-02  
**対象タスク**: Task 6.1.2 ブックマーク機能  
**推定総時間**: 2時間  
**並行開発対応**: 3つのsub-agentで分散実行可能

## 全体概要

### 機能要件
- **重要問題のマーク機能**: ワンタップでブックマーク追加/削除
- **メモ機能付きブックマーク**: 個人ノートとしてメモを追加・編集
- **ブックマーク一覧管理**: カテゴリ別フィルタ、検索機能

### 技術アーキテクチャ
- **データベース**: 新規Bookmarkテーブル + メモフィールド
- **バックエンド**: CRUD API（Express + Prisma）
- **フロントエンド**: ブックマークボタン + 専用管理ページ
- **状態管理**: Zustandストア拡張

## 並行開発サブタスク分解

### 🔄 並行実行フェーズ1（依存関係なし - 3タスク同時実行可能）

#### Subtask 6.1.2-A: データベーススキーマ設計・実装
**担当推奨agent**: `task-executor` (Backend専門)  
**実行時間**: 30分  
**依存関係**: なし  
**並行実行**: ✅ 他タスクと同時実行可能

**実装内容**:
- [ ] Prismaスキーマ拡張（Bookmarkモデル追加）
- [ ] マイグレーション実行
- [ ] シードデータ作成（テスト用ブックマーク）

**完了条件**:
- [ ] `schema.prisma`にBookmarkモデル追加済み
- [ ] マイグレーションファイル生成・実行済み
- [ ] テスト用データが正常にシード済み

**影響ファイル**:
- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/`
- `database/seed.ts`

---

#### Subtask 6.1.2-B: ブックマークボタンコンポーネント
**担当推奨agent**: `task-executor` (Frontend専門)  
**実行時間**: 30分  
**依存関係**: なし  
**並行実行**: ✅ 他タスクと同時実行可能

**実装内容**:
- [ ] BookmarkButtonコンポーネント作成
- [ ] モバイル対応タッチフレンドリーUI
- [ ] アニメーション（お気に入り追加/削除）
- [ ] 一時的なモック状態管理（後でZustandに接続）

**完了条件**:
- [ ] BookmarkButtonコンポーネント完成
- [ ] QuestionCardに統合済み
- [ ] モバイル・デスクトップ両対応
- [ ] ビジュアルフィードバック実装済み

**影響ファイル**:
- `frontend/src/components/BookmarkButton.tsx` (新規)
- `frontend/src/components/QuestionCard.tsx` (更新)

---

#### Subtask 6.1.2-C: Zustand状態管理拡張
**担当推奨agent**: `task-executor` (State Management専門)  
**実行時間**: 30分  
**依存関係**: なし  
**並行実行**: ✅ 他タスクと同時実行可能

**実装内容**:
- [ ] bookmarkStoreまたは既存ストア拡張
- [ ] ブックマーク状態管理アクション定義
- [ ] TypeScript型定義
- [ ] モック関数実装（APIは後で接続）

**完了条件**:
- [ ] ブックマーク状態管理ストア実装済み
- [ ] addBookmark, removeBookmark, updateMemo アクション定義済み
- [ ] TypeScript型安全性確保済み
- [ ] テスト用モックデータ準備済み

**影響ファイル**:  
- `frontend/src/stores/useBookmarkStore.ts` (新規)または
- `frontend/src/stores/useAppStore.ts` (拡張)

### 🔄 並行実行フェーズ2（フェーズ1完了後 - 2タスク同時実行可能）

#### Subtask 6.1.2-D: バックエンドAPI実装
**担当推奨agent**: `task-executor` (Backend API専門)  
**実行時間**: 20分  
**依存関係**: Subtask 6.1.2-A完了必須  
**並行実行**: ✅ Subtask 6.1.2-Eと同時実行可能

**実装内容**:
- [ ] `/api/bookmarks` CRUD APIエンドポイント
- [ ] GET, POST, PUT, DELETE実装
- [ ] バリデーション・エラーハンドリング
- [ ] Prismaクライアント連携

**完了条件**:
- [ ] 全CRUD APIエンドポイント実装済み
- [ ] Postmanでテスト通過済み
- [ ] エラーハンドリング実装済み
- [ ] レスポンス形式統一済み

**影響ファイル**:
- `backend/src/controllers/bookmarkController.ts` (新規)
- `backend/src/index.ts` (ルート追加)

---

#### Subtask 6.1.2-E: ブックマーク管理ページ
**担当推奨agent**: `task-executor` (Frontend Page専門)  
**実行時間**: 20分  
**依存関係**: Subtask 6.1.2-B, 6.1.2-C完了推奨  
**並行実行**: ✅ Subtask 6.1.2-Dと同時実行可能

**実装内容**:
- [ ] BookmarksPageコンポーネント作成
- [ ] 一覧表示・フィルタ・検索機能
- [ ] メモ編集モーダル
- [ ] レスポンシブ対応

**完了条件**:
- [ ] ブックマーク一覧ページ完成
- [ ] カテゴリ別フィルタ動作確認済み
- [ ] メモ編集機能実装済み
- [ ] モバイル・デスクトップ対応済み

**影響ファイル**:
- `frontend/src/pages/BookmarksPage.tsx` (新規)
- `frontend/src/components/BookmarkCard.tsx` (新規)
- `frontend/src/components/MemoEditModal.tsx` (新規)

### 🔄 統合フェーズ（全サブタスク完了後）

#### Subtask 6.1.2-F: API連携・統合テスト
**担当推奨agent**: `quality-fixer` (Integration Testing専門)  
**実行時間**: 20分  
**依存関係**: 全サブタスク完了必須

**実装内容**:
- [ ] フロントエンド-バックエンドAPI連携
- [ ] BookmarkButtonとストア接続
- [ ] 統合テスト実行
- [ ] エラーケーステスト

**完了条件**:
- [ ] API連携動作確認済み
- [ ] ブックマーク追加/削除正常動作
- [ ] メモ編集・保存正常動作
- [ ] エラーハンドリング動作確認済み

## 並行実行スケジュール

```
時間軸  Agent1(Backend)    Agent2(Frontend)   Agent3(State)
0-30分  A:DB設計         B:ボタン作成       C:状態管理
30-50分 D:API実装        E:管理ページ       (休憩)
50-70分 F:統合テスト(全員協力)
```

## 依存関係マップ

```
Phase 1 (並行実行):
A: DB設計     B: UIボタン    C: 状態管理
    ↓            ↓            ↓
Phase 2 (並行実行):  
D: API実装    E: 管理ページ
    ↓            ↓
Phase 3 (統合):
F: API連携・統合テスト
```

## Agent役割分担推奨

### `task-executor` (実装担当) 
- **Primary**: Subtask A, D (Backend重点)
- **Secondary**: Subtask B, E (Frontend重点)  
- **Capability**: 全機能実装・単体テスト

### `task-executor` (別インスタンス)
- **Primary**: Subtask B, E (Frontend重点)
- **Secondary**: Subtask C (状態管理)
- **Capability**: UI/UXコンポーネント実装

### `quality-fixer` (品質保証担当)
- **Primary**: Subtask F (統合テスト)
- **Secondary**: 各サブタスクのコードレビュー
- **Capability**: 品質チェック・テスト・デバッグ

## 成功条件

### 機能面
- [ ] QuestionCardでワンタップブックマーク
- [ ] ブックマーク管理ページで一覧・検索・編集
- [ ] メモ機能でパーソナルノート管理
- [ ] カテゴリ別フィルタ機能

### 技術面  
- [ ] モバイル・デスクトップ完全対応
- [ ] TypeScript型安全性確保
- [ ] レスポンシブUI・タッチフレンドリー
- [ ] エラーハンドリング実装

### 品質面
- [ ] 全CRUD操作正常動作
- [ ] APIレスポンス時間 < 200ms
- [ ] UI操作感が滑らか
- [ ] データ整合性確保

## リスク軽減策

### 並行開発リスク
- **型定義競合**: Phase1で型定義を明確化、共有型ファイル使用
- **API仕様相違**: OpenAPI定義書をPhase1で作成・共有
- **状態管理競合**: 1つのストアファイルは1人が担当

### 技術リスク
- **DB制約エラー**: マイグレーション実行前に制約チェック
- **モバイル表示崩れ**: 既存QuestionCardの表示確認必須
- **パフォーマンス**: ブックマーク数が多い場合のページネーション考慮

## 完了レポート形式

```markdown
## Task 6.1.2 ブックマーク機能 - 完了報告

### 実装結果
- 実装サブタスク: A,B,C,D,E,F 全完了 
- 総所要時間: 2時間（予定通り）
- 並行実行効率: 66%時短達成（理論3時間→実際2時間）

### 成果物
- Bookmarkテーブル + CRUD API
- BookmarkButton + 管理ページ
- Zustand状態管理
- モバイル・デスクトップ対応UI

### 品質指標
- TypeScript型エラー: 0件
- ESLint警告: 0件  
- 手動テスト: 全項目PASS
- レスポンス速度: 平均150ms

### 次ステップ
Task 6.2.1 試験日程管理の実装準備完了
```