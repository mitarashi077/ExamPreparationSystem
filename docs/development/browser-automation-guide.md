# Browser Automation Guide

## 概要

Puppeteer MCPサーバーを導入して、webスクレイピングとE2Eテストの効率化を図ります。

## 導入したツール

### 1. Puppeteer MCP Server
- **目的**: webスクレイピング、E2Eテスト、ブラウザ自動化
- **設定**: `claude mcp add puppeteer`で追加済み
- **機能**: ページ操作、スクリーンショット、データ抽出

### 2. Playwright MCP Server（既存）
- **目的**: E2Eテスト、ブラウザテスト自動化
- **機能**: マルチブラウザテスト、テストコード生成

## 使用用途

### webスクレイピング
```javascript
// 例: 試験問題サイトからのデータ収集
const problems = await puppeteer.scrapeExamProblems('https://example.com/problems');
```

### E2Eテスト自動化
```javascript
// 例: ログイン→問題解答→結果確認の自動テスト
await puppeteer.testExamFlow();
```

### UI/UX検証
```javascript
// 例: レスポンシブデザインの確認
await puppeteer.testResponsiveDesign();
```

## Puppeteer vs Playwright

| 機能 | Puppeteer | Playwright |
|------|-----------|-----------|
| Chrome専用 | ✅ | ❌ |
| マルチブラウザ | ❌ | ✅ |
| 軽量 | ✅ | ❌ |
| テスト生成 | ❌ | ✅ |
| スクレイピング | ✅ | ⚠️ |

## 活用シーン

### 1. 試験問題収集
- 過去問サイトからの自動収集
- PDFからのテキスト抽出補助
- 問題形式の標準化

### 2. UI/UX改善
- ユーザー操作の自動テスト
- レスポンシブデザイン確認
- アクセシビリティ検証

### 3. 品質保証
- 回帰テストの自動化
- パフォーマンス測定
- エラー検出の自動化

## 次のステップ

1. **基本動作確認**: 簡単なスクレイピングテスト
2. **E2Eテスト構築**: 主要機能のテストシナリオ作成
3. **CI/CD統合**: 自動テスト実行の組み込み

これで開発効率とテスト品質が大幅に向上します！