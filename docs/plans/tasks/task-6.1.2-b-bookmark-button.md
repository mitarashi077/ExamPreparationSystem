# タスク: ブックマーク機能 - ブックマークボタンコンポーネント

計画書: Task 6.1.2 ブックマーク機能
全体設計書: task-6.1.2-decomposition.md (.tmp配置)
タスク番号: 6.1.2-B
タスクサイズ: 小規模
想定ファイル数: 2
想定作業時間: 30分
依存タスク: なし
並行実行: ✅ 他の初期タスク（A, C）と同時実行可能
担当推奨エージェント: frontend-executor

## 全体における位置づけ
### プロジェクト全体の目的
ワンタップでブックマーク追加/削除、メモ機能付きブックマーク、カテゴリ別フィルタ・検索機能を備えた重要問題マーク機能の実装

### このタスクの役割
ユーザーが問題カードから直感的にブックマークを追加/削除できるUIコンポーネントを実装し、優れたユーザーエクスペリエンスを提供する

### 前タスクとの関連
- 前タスク: なし（初期フェーズタスク）
- 引き継ぐ情報: なし

### 後続タスクへの影響
- 後続タスク: 6.1.2-F（API連携・統合テスト）
- 提供する情報: BookmarkButtonコンポーネント、UI/UX設計パターン

## 概要
問題カード上に配置するブックマークボタンコンポーネントを作成し、モバイル対応のタッチフレンドリーなUIとビジュアルフィードバックを実装する。現段階では一時的なモック状態管理で動作確認を行う。

## 対象ファイル
- [ ] frontend/src/components/BookmarkButton.tsx（新規作成）
- [ ] frontend/src/components/QuestionCard.tsx（更新）

## 実装手順（TDD: Red-Green-Refactor）

### 1. **Red Phase - 失敗するテストを書く**
   - [ ] BookmarkButtonコンポーネントのレンダリングテスト作成
   - [ ] クリック時の状態変更テスト作成
   - [ ] アクセシビリティ属性テスト作成
   - [ ] テスト実行して失敗を確認：`npm test -- BookmarkButton.test.tsx`

### 2. **Green Phase - 最小限の実装**
   - [ ] BookmarkButtonコンポーネントの基本実装：
     ```tsx
     interface BookmarkButtonProps {
       questionId: number;
       isBookmarked?: boolean;
       onToggle?: (questionId: number, isBookmarked: boolean) => void;
     }
     
     export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
       questionId,
       isBookmarked = false,
       onToggle
     }) => {
       const [bookmarked, setBookmarked] = useState(isBookmarked);
       // 最小限の実装
     };
     ```
   - [ ] QuestionCardへの統合（基本配置のみ）
   - [ ] 追加したテストのみ実行して通ることを確認

### 3. **Refactor Phase - コード改善**
   - [ ] モバイル対応のタッチフレンドリーなスタイリング
   - [ ] アニメーション効果の追加（ハート/星アイコンの変化）
   - [ ] アクセシビリティ改善（ARIA属性、キーボード対応）
   - [ ] レスポンシブデザインの最適化
   - [ ] 追加したテストが引き続き通ることを確認

## 完了条件
- [ ] Red Phase: BookmarkButtonコンポーネントのテストを作成済み
- [ ] Green Phase: 最小限の実装でテストがパス
- [ ] Refactor Phase: モバイル対応・アニメーション実装済み、追加したテストが通る状態を維持
- [ ] 追加したコンポーネントテストのみが全てパス（全体テストは品質保証工程で実施）
- [ ] **注記**: 全体品質保証とコミット作成は品質保証工程で別途実施

## 注意事項
### 実装上の注意
- 現段階では一時的なローカル状態（useState）で動作確認を行う
- 後続タスクでZustandストアに接続するため、propsインターフェースは拡張可能に設計
- アイコンは既存のアイコンライブラリ（react-icons等）を活用
- タッチターゲットサイズは最小44px×44px以上を確保（モバイルアクセシビリティ）

### 影響範囲の制御
- このタスクで変更してはいけない部分: 既存QuestionCardの基本レイアウト構造
- 影響が波及する可能性がある箇所: QuestionCardのCSSスタイル、レスポンシブブレークポイント

### 共通化の指針
- 他タスクと共通化すべき処理: なし（UIコンポーネントは独立）
- 冗長実装を避けるための確認事項: 既存ボタンコンポーネントのスタイルパターンを参考に統一感を保つ