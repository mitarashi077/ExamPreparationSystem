# ADR-0003: Vercelデプロイメントアーキテクチャ設計

## ステータス
Proposed

## 作成日
2025-08-02

## 背景と解決すべき課題

### 課題
エンベデッドシステムスペシャリスト試験対策学習システムのVercel本番デプロイメントアーキテクチャを設計する必要がある。

### 現状システム構成
- **フロントエンド**: React + Vite + Material-UI + PWA + Zustand
- **バックエンド**: Node.js + Express + TypeScript + Prisma
- **データベース**: SQLite (開発) → PostgreSQL (本番想定)
- **要件**: マルチデバイス対応PWA、レスポンシブ、オフライン学習機能

### 技術的制約
- モノレポ構成 (frontend/backend分離)
- PWA対応必須 (ServiceWorker、Cache API活用)
- PostgreSQL移行対応
- Vercelの制約 (関数実行時間制限、ファイルサイズ制限等)

### 解決すべき設計課題
1. フロントエンド・バックエンド統合デプロイ戦略
2. SQLite → PostgreSQL移行とPrisma設定
3. PWAオフライン機能のVercel最適化
4. 環境変数とセキュリティ設定管理
5. パフォーマンス最適化とキャッシュ戦略

## 検討した選択肢

### 案A: Vercel Functions統合デプロイ
**概要**: フロントエンドとバックエンドをVercel内で統合、APIをVercel Functionsに移行

**技術仕様**:
```typescript
// api/questions/route.ts (Vercel Functions)
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET(request: NextRequest) {
  const prisma = new PrismaClient()
  const questions = await prisma.question.findMany()
  return NextResponse.json(questions)
}
```

**デプロイ構成**:
```
Project Root
├── frontend/ (静的ファイル生成)
├── api/ (Vercel Functions)
├── prisma/ (PostgreSQL schema)
└── vercel.json
```

**利点**:
- 単一プラットフォームでの管理
- Vercelの最適化（Edge Functions、CDN）を最大活用
- 自動スケーリングとパフォーマンス最適化
- 環境変数の一元管理

**欠点**:
- 既存Express APIの大幅な書き換えが必要
- Vercel Functions制約（実行時間10秒、ペイロードサイズ制限）
- 複雑なAPIロジックの制限
- ベンダーロックイン

**工数**: 5日
**主なリスク**: API書き換え作業の複雑性、Vercel制約による機能制限

### 案B: フロントエンド特化デプロイ + 外部バックエンド
**概要**: Vercelでフロントエンドのみをデプロイ、バックエンドは別プラットフォーム（Railway、Render等）

**技術仕様**:
```typescript
// frontend/src/config/api.ts
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://exam-prep-api.railway.app'
  : 'http://localhost:3001'

export const apiClient = axios.create({
  baseURL: API_BASE_URL
})
```

**デプロイ構成**:
```
Vercel: Static Frontend + PWA
Railway: Express API + PostgreSQL
```

**利点**:
- 既存Express APIをそのまま活用
- バックエンドの柔軟性確保（複雑なロジック対応）
- フロントエンドのVercel最適化活用
- プラットフォーム分離によるリスク分散

**欠点**:
- 複数プラットフォーム管理の複雑性
- CORS設定とセキュリティ考慮事項
- 別々の監視・ログ管理が必要
- コスト増加の可能性

**工数**: 3日
**主なリスク**: プラットフォーム間連携、CORS問題、セキュリティ設定

### 案C: ハイブリッド デプロイ (段階的移行)
**概要**: 初期はフロントエンド特化、段階的にVercel Functionsに移行

**技術仕様**:
```typescript
// Phase 1: External API
// Phase 2: 軽量API (認証、設定) → Vercel Functions
// Phase 3: 重いAPI → 外部保持、軽量API → Vercel Functions

// 段階的API分離例
export const apiConfig = {
  auth: '/api/auth', // Vercel Functions
  questions: process.env.EXTERNAL_API_URL + '/questions' // External
}
```

**利点**:
- リスク分散とスムーズな移行
- 段階的最適化でベストプラクティス確立
- 各APIの特性に応じた最適プラットフォーム選択

**欠点**:
- 移行期間中の複雑性増大
- 段階的開発工数の増加
- APIエンドポイント管理の複雑化

**工数**: 7日（段階的実装）
**主なリスク**: 移行期間中の複雑性、一貫性の維持

## 比較マトリクス

| 評価軸 | 案A (Vercel統合) | 案B (フロント特化) | 案C (ハイブリッド) |
|--------|------------------|-------------------|-------------------|
| 実装工数 | 5日 | 3日 | 7日 |
| 保守性 | 高 | 中 | 中 |
| パフォーマンス | 高 | 高 | 高 |
| スケーラビリティ | 高 | 中 | 高 |
| 既存コード活用 | 低 | 高 | 中 |
| ベンダーロックイン | 高 | 低 | 中 |
| 管理複雑性 | 低 | 中 | 高 |
| コスト効率 | 高 | 中 | 中 |
| 移行リスク | 高 | 低 | 中 |

## 推奨案と根拠

### 推奨: 案B（フロントエンド特化デプロイ + 外部バックエンド）

**主な理由**:
1. **既存アーキテクチャ活用**: Express APIの書き換え不要で迅速なデプロイ実現
2. **PWA最適化**: Vercelの静的ファイル配信とEdge CDNでPWAパフォーマンス最大化
3. **リスク最小化**: 段階的移行ではなく、確実にデプロイできる手法
4. **柔軟性確保**: 将来的なVercel Functions移行の選択肢を保持

**トレードオフ**:
- プラットフォーム管理の複雑性を受け入れる
- CORS設定とセキュリティ設定の追加作業を許容
- 若干のコスト増加を受け入れる

**技術的判断理由**:
- 個人利用システムのため、超高速デプロイよりも安定性を重視
- PWA機能（オフライン対応）がメイン要件のため、フロントエンド最適化を優先
- MVP段階では既存アーキテクチャの保持が重要

## 実装ガイドライン

### 1. フロントエンド Vercel 設定

```json
// vercel.json
{
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/dist",
  "devCommand": "cd frontend && npm run dev",
  "installCommand": "npm install && cd frontend && npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://exam-prep-api.railway.app/api/$1"
    }
  ],
  "headers": [
    {
      "source": "/service-worker.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ]
}
```

### 2. PWA Vite設定最適化

```typescript
// frontend/vite.config.ts
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/exam-prep-api\.railway\.app\/api\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24時間
              }
            }
          }
        ]
      },
      manifest: {
        name: 'エンベデッドシステムスペシャリスト試験対策',
        short_name: 'ES試験対策',
        description: '試験対策学習システム',
        theme_color: '#1976d2',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  build: {
    sourcemap: false, // 本番では無効化
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material']
        }
      }
    }
  }
})
```

### 3. バックエンド Railway 設定

```dockerfile
# Dockerfile (backend用)
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend/ .
COPY database/ ./database/
RUN npx prisma generate
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

```json
// railway.json
{
  "build": {
    "builder": "dockerfile",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "never"
  }
}
```

### 4. データベース PostgreSQL 移行

```typescript
// database/schema.prisma (本番用)
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 環境変数設定例
// DATABASE_URL="postgresql://username:password@host:5432/database?schema=public"
```

### 5. 環境変数設定

```typescript
// frontend/.env.production
VITE_API_BASE_URL=https://exam-prep-api.railway.app
VITE_APP_NAME=エンベデッドシステムスペシャリスト試験対策

// backend/.env.production  
DATABASE_URL=postgresql://...
FRONTEND_URL=https://exam-prep.vercel.app
NODE_ENV=production
PORT=3001
```

### 6. セキュリティ設定

```typescript
// backend/src/middleware/cors.ts
const corsOptions = {
  origin: [
    'https://exam-prep.vercel.app',
    'http://localhost:3003' // 開発環境
  ],
  credentials: true,
  optionsSuccessStatus: 200
}
```

## パフォーマンス最適化戦略

### 1. フロントエンド最適化
- **コード分割**: React.lazy + Suspense での動的インポート
- **画像最適化**: WebPフォーマット対応、適切なサイズ調整
- **バンドル最適化**: Tree shaking、Dead code elimination

### 2. PWAキャッシュ戦略
- **App Shell**: 即座にロード可能なUI骨格のキャッシュ
- **API Cache**: ネットワークファースト + 24時間キャッシュ
- **Static Cache**: CSS/JS/画像の長期キャッシュ

### 3. データベース最適化
- **インデックス設定**: 頻繁なクエリへの適切なインデックス
- **コネクションプール**: Prismaの接続最適化

## 結果と期待される効果

### 期待される成果
1. **高速なPWA体験**: Vercel Edge CDNによる世界規模の高速配信
2. **オフライン学習**: ServiceWorkerによる完全なオフライン問題演習
3. **安定したAPI**: Railway上でのスケーラブルなバックエンド
4. **簡単なメンテナンス**: 既存コードベースの保持による保守性

### 成功指標
- **初期ロード時間**: 3秒以内（PWA App Shell）
- **API応答時間**: 500ms以内（地理的距離考慮）
- **オフライン機能**: 完全な問題演習機能の動作
- **Lighthouse PWAスコア**: 90点以上

## リスク対策

### 技術リスク
- **CORS問題**: 本番環境での詳細なCORS設定テスト実施
- **環境変数管理**: Vercel/Railway両プラットフォームでの適切な設定確認
- **データベース移行**: SQLite → PostgreSQL移行時のデータ整合性確保

### 運用リスク
- **プラットフォーム障害**: Vercel/Railway双方の SLA 確認と障害時対応準備
- **コスト管理**: 使用量監視とアラート設定
- **セキュリティ**: HTTPS化、適切なCORS設定、環境変数保護

## 参考情報

### Vercel設定関連
- [Vercel Configuration](https://vercel.com/docs/project-configuration)
- [PWA with Vite](https://vite-pwa-org.netlify.app/)
- [Vercel Rewrites](https://vercel.com/docs/edge-network/rewrites)

### Railway設定関連
- [Railway Deployment](https://docs.railway.app/deploy/deployments)
- [Railway Environment Variables](https://docs.railway.app/develop/variables)

### PWA最適化
- [Workbox Runtime Caching](https://developers.google.com/web/tools/workbox/guides/route-requests)
- [PWA Manifest Generator](https://www.simicart.com/manifest-generator.html/)