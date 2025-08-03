# 本番環境デプロイガイド

## ✅ 完了済み
- Vercel初回デプロイ成功
- PWAアイコン設定
- GitHub自動デプロイ連携

## 🔄 次のステップ

### 1. データベース設定（PostgreSQL）

#### Neon PostgreSQL（推奨）
1. [Neon Console](https://console.neon.tech/)でプロジェクト作成
2. 接続文字列を取得
3. Vercelで環境変数設定

#### 環境変数設定
```bash
# Vercel Dashboard → Settings → Environment Variables
DATABASE_URL=postgresql://user:password@host:5432/exam_prep_db?sslmode=require
NODE_ENV=production
```

### 2. Prismaマイグレーション実行

```bash
# ローカルでマイグレーションファイル作成
npx prisma migrate dev --name init --schema=database/schema-production.prisma

# 本番環境でマイグレーション実行
npx prisma migrate deploy
```

### 3. 動作確認

#### APIエンドポイント
- Health Check: `https://your-app.vercel.app/api/health`
- Categories: `https://your-app.vercel.app/api/categories`
- Questions: `https://your-app.vercel.app/api/questions`

#### テスト手順
1. フロントエンド表示確認
2. API接続確認
3. データベース操作確認
4. PWA機能確認

### 4. 監視・ログ設定

#### Vercel機能
- Function Logs監視
- Analytics有効化
- Error Tracking

### 5. セキュリティ設定

- CORS設定確認
- CSP (Content Security Policy)
- Rate Limiting（将来実装）

## 🚨 注意事項

- SQLite → PostgreSQL移行時のデータ型差異に注意
- Prismaスキーマの環境別管理
- 環境変数の適切な設定

## 📋 チェックリスト

- [ ] PostgreSQLデータベース作成
- [ ] 環境変数設定
- [ ] Prismaマイグレーション実行
- [ ] API動作確認
- [ ] フロントエンド・バックエンド統合テスト
- [ ] PWA機能確認
- [ ] 監視設定