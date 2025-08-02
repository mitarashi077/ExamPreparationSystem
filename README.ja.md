# エンベデッドシステムスペシャリスト試験対策システム

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![PWA](https://img.shields.io/badge/PWA-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

IPAエンベデッドシステムスペシャリスト試験の効率的な学習を支援する、個人利用向けのモバイル対応学習システムです。

**[English README](README.md)**

## 🎯 プロジェクト概要

### 目的
- エンベデッドシステムスペシャリスト試験のシラバスに準拠した体系的学習支援
- PC・スマートフォン・タブレットでのマルチデバイス学習体験
- 通勤時間などの隙間時間を活用した効率的な学習

### 主要機能
- 📱 **PWA対応** - アプリのようなユーザー体験とオフライン学習
- 🎯 **分野別問題演習** - IPAシラバス準拠の体系的な問題分類
- 📊 **ヒートマップ可視化** - 学習進捗と弱点分野の視覚的把握
- 🚂 **通勤学習特化** - 短時間集中モードと中断・再開機能
- 📈 **学習分析** - デバイス横断での詳細な学習データ分析

## 🚀 クイックスタート

### 前提条件
- Node.js 18.0以上
- npm 8.0以上

### インストール
```bash
# リポジトリのクローン
git clone https://github.com/your-username/ExamPreparationSystem.git
cd ExamPreparationSystem

# 全依存関係のインストール
npm run install:all

# データベースの初期化
npm run db:push
npm run db:generate

# 初期データの投入
cd database && npm run seed
```

### 開発サーバーの起動
```bash
# フロントエンド（port 3003）とバックエンド（port 3001）を同時起動
npm run dev

# 個別起動も可能
npm run dev:frontend  # フロントエンドのみ
npm run dev:backend   # バックエンドのみ
```

### アクセス
- **フロントエンド**: http://localhost:3003
- **バックエンドAPI**: http://localhost:3001
- **Prisma Studio**: `npm run db:studio`

### モバイルアクセス
同一ネットワーク上のスマートフォンからアクセス可能：
- **スマートフォン**: http://[PCのIPアドレス]:3003
- 例: http://192.168.0.126:3003

## 🏗️ 技術スタック

### フロントエンド
- **React 18** + **TypeScript** - モダンなUI開発
- **Material-UI (MUI)** - レスポンシブデザインコンポーネント
- **Vite** - 高速ビルドツール
- **PWA (Workbox)** - オフライン対応とアプリライク体験
- **Zustand** - 軽量状態管理
- **React Router** - クライアントサイドルーティング

### バックエンド
- **Node.js** + **Express** - RESTful API サーバー
- **TypeScript** - 型安全な開発
- **Prisma** - 型安全なORM
- **SQLite** - 軽量データベース（個人利用最適化）

### 開発・品質管理
- **ESLint** + **Prettier** - コード品質とフォーマット
- **Helmet** + **CORS** - セキュリティ対策
- **Morgan** - ログ管理

## 📂 プロジェクト構造

```
ExamPreparationSystem/
├── frontend/                 # React PWA フロントエンド
│   ├── src/
│   │   ├── components/      # 再利用可能コンポーネント
│   │   ├── pages/          # ページコンポーネント
│   │   ├── hooks/          # カスタムフック
│   │   ├── stores/         # Zustand ストア
│   │   ├── types/          # TypeScript 型定義
│   │   └── utils/          # ユーティリティ関数
│   ├── public/             # 静的アセット
│   └── vite.config.ts      # Vite設定
├── backend/                  # Express API サーバー
│   ├── src/
│   │   ├── controllers/    # API コントローラー
│   │   ├── routes/         # ルーティング定義
│   │   ├── models/         # データモデル
│   │   ├── middleware/     # Express ミドルウェア
│   │   └── utils/          # バックエンドユーティリティ
│   └── tsconfig.json       # TypeScript設定
├── database/                 # データベース関連
│   ├── schema.prisma       # Prismaスキーマ定義
│   ├── seed.ts            # 初期データ
│   └── exam_prep.db       # SQLiteデータベース
└── docs/                    # プロジェクト文書
```

## 🎮 使用方法

### 基本的な学習フロー
1. **ホーム画面** - 学習状況の概要確認
2. **問題演習** - 分野別またはランダム問題に挑戦
3. **進捗確認** - ヒートマップで弱点分野を把握
4. **復習** - 間違えた問題を重点的に学習

### モバイル最適化機能
- **スワイプ操作**: 問題間の移動
- **タップ操作**: 大型ボタンによる選択肢回答
- **ピンチズーム**: 回路図・システム図の詳細確認
- **オフライン学習**: ネットワーク不要での問題演習

### 通勤学習モード
- **時間制限モード**: 5分・10分・15分の短時間集中学習
- **中断・再開**: 電車の乗り継ぎに対応した学習継続
- **軽量データ**: 低通信環境での最適化

## 📊 データ構造

### 対応試験分野（IPAシラバス準拠）
- コンピュータシステム
- システム構成要素  
- ソフトウェア（OS、RTOS、ファームウェア）
- ハードウェア（プロセッサ、メモリ、周辺機器）
- ヒューマンインタフェース
- マルチメディア
- データベース
- ネットワーク
- セキュリティ
- システム開発技術

### 学習データ管理
- 分野別正答率の記録
- 学習時間トラッキング
- デバイス別学習パターン分析
- 間違い問題の自動蓄積

## 🛠️ 開発コマンド

```bash
# 開発
npm run dev                 # 開発サーバー起動
npm run dev:frontend       # フロントエンドのみ
npm run dev:backend        # バックエンドのみ

# ビルド
npm run build              # 全体ビルド
npm run build:frontend     # フロントエンドビルド
npm run build:backend      # バックエンドビルド

# データベース
npm run db:generate        # Prismaクライアント生成
npm run db:push           # スキーマをデータベースに反映
npm run db:studio         # Prisma Studio起動
cd database && npm run seed # 初期データ投入

# コード品質
npm run lint              # 全体リント
npm run lint:frontend     # フロントエンドリント
npm run lint:backend      # バックエンドリント
```

## 🗺️ 開発ロードマップ

### Phase 1: MVP基盤構築 ✅ 完了
- [x] プロジェクト構造作成
- [x] PWA・モバイル対応セットアップ
- [x] データベース設計・初期化
- [x] 基本的なレスポンシブUI

### Phase 2: 問題演習システム ✅ 完了
- [x] 問題管理API実装
- [x] モバイル最適化問題表示
- [x] 回答処理・進捗記録
- [x] タッチ対応UI実装
- [x] スマートフォン対応レスポンシブデザイン

### Phase 3: ヒートマップ・進捗可視化 📋 予定
- [ ] タッチ対応ヒートマップ
- [ ] モバイルダッシュボード
- [ ] 通勤学習特化進捗管理

### Phase 4: 高度機能 🔮 将来
- [ ] AI採点システム
- [ ] 適応型出題
- [ ] 3D可視化

## 🤝 貢献方法

このプロジェクトは個人学習目的で開発されていますが、改善提案やバグ報告は歓迎します。

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルをご覧ください。

## 🙏 謝辞

- [IPA（情報処理推進機構）](https://www.ipa.go.jp/) - 試験要綱・シラバスの提供
- [Material-UI](https://mui.com/) - 美しいUIコンポーネント
- [Prisma](https://www.prisma.io/) - 型安全なデータベースアクセス

## 📞 サポート

問題や質問がある場合は、[Issues](https://github.com/your-username/ExamPreparationSystem/issues) でお知らせください。

---

**⚡ エンベデッドシステムスペシャリスト試験合格を目指して、効率的な学習を！**