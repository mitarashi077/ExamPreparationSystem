# タスク: ブックマーク機能 - Zustand状態管理拡張

計画書: Task 6.1.2 ブックマーク機能
全体設計書: task-6.1.2-decomposition.md (.tmp配置)
タスク番号: 6.1.2-C
タスクサイズ: 小規模
想定ファイル数: 2
想定作業時間: 30分
依存タスク: なし
並行実行: ✅ 他の初期タスク（A, B）と同時実行可能
担当推奨エージェント: task-executor

## 全体における位置づけ
### プロジェクト全体の目的
ワンタップでブックマーク追加/削除、メモ機能付きブックマーク、カテゴリ別フィルタ・検索機能を備えた重要問題マーク機能の実装

### このタスクの役割
ブックマーク機能の状態管理を担当し、フロントエンド全体でブックマーク状態を一元管理できる仕組みを提供する

### 前タスクとの関連
- 前タスク: なし（初期フェーズタスク）
- 引き継ぐ情報: なし

### 後続タスクへの影響
- 後続タスク: 6.1.2-E（ブックマーク管理ページ）、6.1.2-F（API連携・統合テスト）
- 提供する情報: ブックマーク状態管理ストア、アクション定義、TypeScript型定義

## 概要
Zustandを使用してブックマーク機能の状態管理ストアを実装する。ブックマークの追加/削除、メモ編集、カテゴリ管理のアクションを定義し、TypeScript型安全性を確保する。現段階ではモック関数で動作確認を行う。

## 対象ファイル
- [x] frontend/src/stores/useBookmarkStore.ts（新規作成）
- [x] frontend/src/types/bookmark.ts（新規作成）

## 実装手順（TDD: Red-Green-Refactor）

### 1. **Red Phase - 失敗するテストを書く**
   - [x] ブックマーク状態管理ストアの基本動作テスト作成
   - [x] addBookmark, removeBookmark, updateMemo アクションのテスト作成
   - [x] 状態の永続化と復元のテスト作成
   - [x] テスト実行して失敗を確認：`npm test -- useBookmarkStore.test.ts`

### 2. **Green Phase - 最小限の実装**
   - [x] TypeScript型定義の作成：
     ```typescript
     export interface Bookmark {
       id: number;
       questionId: number;
       userId: number;
       memo?: string;
       category?: string;
       createdAt: string;
       updatedAt: string;
     }
     
     export interface BookmarkStore {
       bookmarks: Bookmark[];
       addBookmark: (questionId: number) => void;
       removeBookmark: (questionId: number) => void;
       updateMemo: (questionId: number, memo: string) => void;
       isBookmarked: (questionId: number) => boolean;
     }
     ```
   - [x] Zustandストアの基本実装（モック関数）
   - [x] 追加したテストのみ実行して通ることを確認

### 3. **Refactor Phase - コード改善**
   - [x] ローカルストレージ連携の実装（永続化）
   - [x] カテゴリ管理機能の追加
   - [x] フィルタリング・検索機能のサポート
   - [x] エラーハンドリングの実装
   - [x] 追加したテストが引き続き通ることを確認

## 完了条件
- [x] Red Phase: ブックマーク状態管理の動作テストを作成済み
- [x] Green Phase: 最小限のストア実装でテストがパス
- [x] Refactor Phase: 永続化・カテゴリ管理実装済み、追加したテストが通る状態を維持
- [x] 追加した状態管理テストのみが全てパス（全体テストは品質保証工程で実施）
- [x] **注記**: 全体品質保証とコミット作成は品質保証工程で別途実施

## 注意事項
### 実装上の注意
- 現段階ではモック関数で動作確認を行う（実際のAPI通信は後続タスクで実装）
- ローカルストレージとの同期を実装してオフライン対応を考慮
- TypeScript型定義はバックエンドのPrismaモデルと整合性を保つ
- Zustandのmiddleware（persist）を活用してデータ永続化を実現

### 影響範囲の制御
- このタスクで変更してはいけない部分: 既存の他ストア（userStore等）の設計
- 影響が波及する可能性がある箇所: グローバルな状態管理パターン、型定義の共有

### 共通化の指針
- 他タスクと共通化すべき処理: TypeScript型定義（bookmark.ts）は他タスクで共用
- 冗長実装を避けるための確認事項: 既存ストアの命名規則・構造パターンを参考に統一