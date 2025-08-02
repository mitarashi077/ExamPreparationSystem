# Issue Resolution Workflow

## 概要

自動生成されたIssueが放置されないよう、**自動解決サイクル**を構築しています。

## 自動Issue解決フロー

### 1. Issue作成（Hooks）
```
エラー発生 → Hook実行 → Issue自動作成 → ラベル付与
```

### 2. Issue検出・解決（issue-resolver）
```
定期チェック → Issue分析 → 解決方法決定 → 自動修正実行
```

### 3. 解決完了・クローズ
```
修正確認 → テスト実行 → Issue更新 → 自動クローズ
```

## Issue解決マトリクス

| 問題タイプ | 自動解決 | 解決手段 | 時間 |
|-----------|---------|---------|------|
| ESLintエラー | ✅ | quality-fixer | 即座 |
| フォーマット | ✅ | prettier | 即座 |
| 基本型エラー | ✅ | quality-fixer | ~5分 |
| ビルドエラー | ✅ | quality-fixer | ~10分 |
| テスト失敗 | 🔍 | 調査→修正 | ~30分 |
| ロジックバグ | 👤 | 人間引き継ぎ | 手動 |

## Hook統合

### Error Hook → Issue作成
```powershell
# エラー検出時に自動実行
gh issue create --title "🐛 Error: $component" --label "auto-generated,bug"
```

### IssueResolution Hook → 自動解決
```powershell
# quality-fixer実行時に自動解決チェック
gh issue list --label "auto-generated" --state open
```

## 解決不可能な場合の対応

### 1. エスカレーション
- **複雑な問題**: `needs-human-review`ラベル追加
- **セキュリティ**: `security,urgent`ラベル追加
- **設計問題**: `architecture-review`ラベル追加

### 2. 人間への通知
```typescript
// 解決不可能な場合
await addIssueComment(issueNumber, `
🚨 自動解決に失敗しました。手動での対応が必要です。

**問題**: ${problemDescription}
**推奨アクション**: ${recommendedAction}
**担当者**: @${assignee}
`);
```

## メトリクス・改善

### 追跡指標
- **自動解決率**: 85%以上を目標
- **解決時間**: 平均30分以内
- **再発率**: 10%以下

### 継続改善
1. **解決パターン学習**: 成功した解決方法を記録
2. **予防策提案**: 同様問題の再発防止
3. **プロセス改善**: より効率的な解決方法の開発

## 実装済み機能

### ✅ 自動Issue作成
- エラー発生時の即座Issue作成
- 適切なラベル・メタデータ付与
- GitHub通知との連携

### ✅ Issue解決Hook
- quality-fixer実行時の自動チェック
- 解決可能Issue의 검출
- 自動解決プロセスの開始

### ✅ issue-resolverエージェント
- Issue분析과 분류
- 자동 해결 로직
- 해결 불가능한 경우 에스컬레이션

## 효과

1. **Issue 방치 방지**: 100% 자동 추적・해결 시도
2. **개발 효율 향상**: 품질 문제의 즉시 해결
3. **지속적 개선**: 문제 패턴 학습과 예방
4. **투명성**: 모든 문제가 Issue로 기록・추적