# Issue Management Guidelines

## 概要

開発中に問題が発生した際は、自動的にGitHub Issueを作成して追跡・解決する仕組みを導入しています。

## 自動Issue作成の仕組み

### トリガー条件

以下の状況で自動的にIssueが作成されます：

1. **エージェント実行エラー**
   - Sub-agentの実行失敗
   - Tool使用時のエラー
   - 予期しない例外

2. **ビルド・テストエラー**
   - TypeScriptコンパイルエラー
   - ESLintエラー（重要度: high以上）
   - テスト失敗

3. **品質チェックエラー**
   - 品質基準未達
   - セキュリティ問題検出
   - パフォーマンス劣化

### Issue作成フォーマット

```
🐛 [Auto-Generated] Error in {component}: {error_summary}

## 🚨 Error Details

**Component**: {component}
**Error Type**: {error_type}
**Timestamp**: {timestamp}

### Error Message
```
{error_message}
```

### Context
{context}

### Steps to Reproduce
{steps}

### Expected Behavior
{expected}

### Additional Information
- Agent: {agent}
- Task: {task}
- Branch: {branch}

---
*This issue was automatically created by the development system.*
```

## Issue対応フロー

### 1. 自動検出・作成
- システムがエラーを検出
- 自動的にIssueを作成
- `bug`, `auto-generated`ラベルを付与

### 2. 優先度判定
- **Critical**: システム停止、データ損失
- **High**: 機能不全、セキュリティ問題
- **Medium**: 部分的な問題、パフォーマンス劣化
- **Low**: 軽微な不具合、改善提案

### 3. 担当者アサイン
- **general-purpose agent**: 初期調査・分析
- **専門agent**: 該当領域の詳細調査・修正
- **quality-fixer**: 品質関連問題の修正

### 4. 解決プロセス
1. **調査**: 原因分析・再現確認
2. **修正**: コード修正・テスト
3. **検証**: 修正内容の動作確認
4. **クローズ**: Issue解決・記録

## ラベル管理

### 自動付与ラベル
- `bug`: バグ・エラー
- `auto-generated`: 自動生成
- `high-priority`: 緊急度高
- `needs-investigation`: 調査必要

### 手動追加ラベル
- `frontend`: フロントエンド関連
- `backend`: バックエンド関連
- `database`: データベース関連
- `security`: セキュリティ関連
- `performance`: パフォーマンス関連

## 問題予防策

### コード品質
- 定期的な`quality-fixer`実行
- コミット前の自動チェック
- 継続的インテグレーション

### 監視体制
- エラーログの自動監視
- パフォーマンス指標の追跡
- ユーザーフィードバックの収集

### 改善サイクル
- Issue分析による再発防止
- 開発プロセスの継続改善
- ツール・設定の最適化

## エージェント連携

### Issue作成時
```typescript
// エラー検出例
if (error) {
  await createIssue({
    title: `🐛 [Auto-Generated] Error in ${component}: ${errorSummary}`,
    labels: ['bug', 'auto-generated'],
    assignee: 'general-purpose',
    priority: determinePriority(error)
  });
}
```

### Issue解決時
```typescript
// 解決完了例
await closeIssue({
  issueNumber: issueId,
  closingComment: `Fixed by PR #${prNumber}. Verified working correctly.`,
  relatedPR: prNumber
});
```

## 効果

1. **迅速な問題対応**: 自動検出により対応時間短縮
2. **問題の見える化**: 全ての問題がIssueとして記録
3. **再発防止**: 解決プロセスの標準化
4. **品質向上**: 継続的な問題分析・改善