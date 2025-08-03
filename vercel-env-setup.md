# Vercel環境変数設定手順

## 1. Vercelダッシュボードにアクセス
https://vercel.com/dashboard

## 2. プロジェクトを開く
`exam-preparation-system` プロジェクトをクリック

## 3. Settings → Environment Variables
- Settings タブをクリック
- Environment Variables セクションを開く

## 4. 環境変数を追加

### DATABASE_URL
```
Name: DATABASE_URL
Value: [Neonから取得した接続文字列をペースト]
Environment: Production, Preview, Development (全てにチェック)
```

### NODE_ENV
```
Name: NODE_ENV
Value: production
Environment: Production (Productionのみにチェック)
```

## 5. 保存・再デプロイ
- Save ボタンをクリック
- 自動的に再デプロイが開始されます

## 6. 確認
- デプロイ完了後、APIヘルスチェックで動作確認