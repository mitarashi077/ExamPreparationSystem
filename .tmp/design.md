# 技術設計書 - エンベデッドスペシャリスト学習システム（個人利用版）

## 1. システムアーキテクチャ

### 1.1 MVP全体構成（個人利用最適化）
```
Frontend (React + TypeScript)
    ⬇ HTTP/REST API
Backend (Node.js + Express)
    ⬇ SQL
Local Database (SQLite)
    ⬇ File System
Static Assets (問題・図表データ)
```

### 1.2 アーキテクチャ方針
- **設計原則**: シンプル・軽量・拡張可能
- **マルチデバイス対応**: レスポンシブデザイン + PWA対応
- **データ管理**: ローカル優先（SQLite + ファイルシステム）+ 同期機能
- **認証**: シンプルなローカル認証（単一ユーザー）
- **拡張性**: 段階的機能追加に対応した設計

## 2. MVP技術スタック（優先度別）

### 2.1 Frontend - MVP Core 🔴 **High** ✅ **実装完了**
- **Framework**: ✅ React 18 - 実装済み
- **Language**: ✅ TypeScript - 実装済み  
- **Build Tool**: ✅ Vite - 実装済み
- **State Management**: ✅ Zustand（軽量状態管理） - 実装済み
- **Routing**: ✅ React Router v6 - 実装済み
- **UI Framework**: ✅ Material-UI v5（レスポンシブ対応） - 実装済み
- **HTTP Client**: ✅ Axios - 実装済み
- **Chart Library**: 🟡 Recharts（ヒートマップ用） - Phase 2 実装予定
- **PWA対応**: ✅ Service Worker + Workbox - 実装済み

### 2.2 Backend - MVP Core 🔴 **High** ✅ **実装完了**
- **Runtime**: ✅ Node.js 18+ - 実装済み
- **Framework**: ✅ Express.js（軽量構成） - 実装済み
- **Language**: ✅ TypeScript - 実装済み
- **ORM**: ✅ Prisma（SQLite対応） - 実装済み
- **Validation**: ✅ Zod - 実装済み
- **API Style**: ✅ RESTful API - 実装済み
- **File Handling**: 🟡 Multer（画像・図表アップロード） - Phase 2 実装予定

### 2.3 Database - MVP Local 🔴 **High** ✅ **実装完了**
- **Primary DB**: ✅ SQLite（ローカル・軽量） - 実装済み
- **Migration**: ✅ Prisma Migrate - 実装済み
- **Backup**: 🟡 ファイルベースバックアップ - Phase 2 実装予定
- **Data Files**: ✅ JSON + 静的ファイル（問題データ） - 実装済み
- **同期対応**: 🟡 複数デバイス間でのデータ同期機能（Phase 2）

### 2.4 開発・テスト環境 🟡 **Medium**
- **Package Manager**: npm/pnpm
- **Linting**: ESLint + Prettier
- **Testing**: Jest（基本テストのみ）
- **Dev Server**: Vite Dev Server + Nodemon
- **Version Control**: Git

## 3. MVP データベース設計（SQLite最適化）

### 3.1 MVP簡素化エンティティ設計

```sql
-- 単一ユーザー前提：User テーブル不要

-- IPAシラバス準拠分野
Categories {
  id: INTEGER PRIMARY KEY
  name: TEXT NOT NULL              -- "組込みシステム開発技術"
  parent_id: INTEGER               -- 階層構造対応
  syllabus_code: TEXT              -- IPAシラバスコード
  order_index: INTEGER
}

-- 問題（午前・午後対応）
Questions {
  id: INTEGER PRIMARY KEY
  category_id: INTEGER REFERENCES Categories(id)
  exam_section: TEXT               -- "morning1", "morning2", "afternoon1", "afternoon2"
  question_text: TEXT NOT NULL
  question_type: TEXT              -- "multiple_choice", "essay"
  year: INTEGER
  season: TEXT                     -- "spring", "autumn"
  question_number: TEXT
  image_path: TEXT                 -- ローカル画像パス
  difficulty: INTEGER              -- 1-5
  created_at: DATETIME DEFAULT CURRENT_TIMESTAMP
}

-- 選択肢（午前問題用）
Choices {
  id: INTEGER PRIMARY KEY
  question_id: INTEGER REFERENCES Questions(id)
  choice_text: TEXT NOT NULL
  is_correct: BOOLEAN DEFAULT FALSE
  order_index: INTEGER
  explanation: TEXT
}

-- 回答履歴（個人学習記録）
AnswerHistory {
  id: INTEGER PRIMARY KEY
  question_id: INTEGER REFERENCES Questions(id)
  selected_choice_id: INTEGER      -- 選択肢問題の場合
  user_answer: TEXT                -- 記述問題の場合
  is_correct: BOOLEAN
  answered_at: DATETIME DEFAULT CURRENT_TIMESTAMP
  time_spent: INTEGER              -- 秒
  review_flag: BOOLEAN DEFAULT FALSE
}

-- 学習進捗（ヒートマップ用）
StudyProgress {
  id: INTEGER PRIMARY KEY
  category_id: INTEGER REFERENCES Categories(id)
  total_attempts: INTEGER DEFAULT 0
  correct_attempts: INTEGER DEFAULT 0
  accuracy_rate: REAL              -- 正答率
  last_studied: DATETIME
  study_time_total: INTEGER        -- 総学習時間（秒）
  updated_at: DATETIME DEFAULT CURRENT_TIMESTAMP
}

-- 設定（個人設定）
Settings {
  key: TEXT PRIMARY KEY
  value: TEXT
  updated_at: DATETIME DEFAULT CURRENT_TIMESTAMP
}
```

### 3.2 SQLite最適化インデックス
```sql
-- MVPパフォーマンス最適化
CREATE INDEX idx_questions_category_section ON Questions (category_id, exam_section);
CREATE INDEX idx_questions_year_season ON Questions (year, season);
CREATE INDEX idx_answer_history_question ON AnswerHistory (question_id);
CREATE INDEX idx_answer_history_date ON AnswerHistory (answered_at);
CREATE INDEX idx_study_progress_category ON StudyProgress (category_id);
CREATE INDEX idx_choices_question ON Choices (question_id);
```

## 4. MVP API設計（個人利用最適化）

### 4.1 分野・問題API 🔴 **High** ✅ **実装済み**
```
GET /api/categories                  # ✅ IPA分野一覧 - 実装済み
GET /api/categories/:id              # ✅ 分野詳細取得 - 実装済み

GET /api/questions                   # ✅ 問題一覧（フィルタ付き）- 実装済み
  ?mode=practice&categoryId=1&difficulty=medium&limit=10
GET /api/questions/:id               # ✅ 問題詳細 - 実装済み
POST /api/questions/practice         # ✅ 練習問題取得 - 実装済み
  { mode, categoryId, difficulty, count }
```

### 4.2 回答・学習記録API 🔴 **High** ✅ **実装済み**
```
POST /api/answers                    # ✅ 回答提出 - 実装済み
  { questionId, selectedChoiceId, timeSpent, isCorrect }

GET /api/answers/history             # ✅ 回答履歴 - 実装済み
  ?questionId=1&limit=50

GET /api/answers/progress            # ✅ 学習進捗取得 - 実装済み
```

### 4.3 進捗・統計API 🔴 **High** 🟡 **部分実装**
```
GET /api/progress                    # ✅ 全体進捗 - 基本実装済み
GET /api/progress/categories         # 🟡 分野別進捗 - Phase 2 で詳細実装予定
GET /api/progress/heatmap            # 🟡 ヒートマップデータ - Phase 2 実装予定

GET /api/statistics/daily            # 🟡 日別統計 - Phase 2 実装予定
GET /api/statistics/category/:id     # 🟡 分野別詳細統計 - Phase 2 実装予定
```

### 4.4 設定・データ管理API 🟡 **Medium**
```
GET /api/settings                    # 個人設定取得
PUT /api/settings                    # 設定更新

POST /api/data/export                # データエクスポート
POST /api/data/import                # データインポート
```

## 5. MVP フロントエンド設計

### 5.1 MVP コンポーネント構成（モバイル対応）✅ **実装済み**
```
App 🔴 ✅ 実装完了
├── ResponsiveLayout ✅         # PC・スマホ対応レイアウト実装済み
│   ├── HeaderBar ✅           # レスポンシブヘッダー実装
│   ├── NavigationDrawer ✅     # ハンバーガーメニュー実装
│   └── BottomNavigation 🟡     # 今後実装予定
├── Router ✅                   # React Router v6 実装済み
└── Pages
    ├── DashboardPage ✅ 🔴      # メインダッシュボード実装完了
    │   ├── ProgressOverview ✅ # 学習概要カード実装
    │   ├── StudyModeSelector ✅ # 学習モード選択実装
    │   └── RecentActivity 🟡   # 今後実装予定
    |
    ├── StudyPages ✅ 🔴
    │   ├── PracticePage ✅      # 問題表示・回答機能実装完了
    │   │   ├── スワイプ操作 ✅   # タッチ最適化完了
    │   │   ├── 大型ボタン ✅    # モバイル最適化完了
    │   │   └── API統合 ✅      # バックエンド連携完了
    │   ├── CategorySelector ✅  # 分野選択機能実装
    │   └── DifficultySelector ✅ # 難易度選択実装
    |
    ├── ProgressPage 🟡 🔴      # 基本統計実装、ヒートマップは今後実装
    │   ├── BasicStats ✅       # 基本進捗表示実装
    │   ├── HeatmapView 🟡      # Phase 2 で実装予定
    │   └── WeakPointAnalysis 🟡 # Phase 2 で実装予定
    |
    └── SettingsPage 🟡         # Phase 2 で実装予定
        └── SyncSettings 🟡      # Phase 2 で実装予定
```

### 5.1.1 モバイル最適化UI要件 🔴 **High**
- **タッチ操作**: スワイプで問題切り替え、ピンチズームで図表拡大
- **縦画面最適化**: 問題文・選択肢・図表の縦スクロール配置
- **大きなタップ領域**: 選択肢ボタン、ナビゲーション要素の大型化
- **フォントサイズ**: 電車内でも読みやすい適切なフォントサイズ

### 5.2 MVP Zustand 状態管理
```typescript
// シンプルな状態管理設計
interface AppStore {
  // 問題・学習状態 🔴
  questions: {
    current: Question | null;
    list: Question[];
    filters: QuestionFilters;
    loading: boolean;
  };
  
  // 進捗・統計状態 🔴
  progress: {
    categories: CategoryProgress[];
    heatmapData: HeatmapData;
    dailyStats: DailyStats[];
    loading: boolean;
  };
  
  // UI状態 🔴
  ui: {
    sidebarOpen: boolean;
    currentPage: string;
    theme: 'light' | 'dark';
    isMobile: boolean;
    bottomNavVisible: boolean;
  };
  
  // アクション
  actions: {
    loadQuestions: (filters: QuestionFilters) => Promise<void>;
    submitAnswer: (answer: AnswerData) => Promise<void>;
    updateProgress: () => Promise<void>;
    loadHeatmapData: () => Promise<void>;
  };
}

// 型定義（MVP用簡素化）
interface Question {
  id: number;
  category_id: number;
  exam_section: string;
  question_text: string;
  question_type: 'multiple_choice' | 'essay';
  choices?: Choice[];
  image_path?: string;
  year: number;
  season: string;
}

interface CategoryProgress {
  category_id: number;
  category_name: string;
  total_attempts: number;
  correct_attempts: number;
  accuracy_rate: number;
  last_studied: string;
}

interface HeatmapData {
  categories: Array<{
    id: number;
    name: string;
    accuracy: number;
    attempts: number;
    color_intensity: number; // 0-1
  }>;
}
```

### 5.3 MVP ルーティング（単純化）
```typescript
// 認証不要のシンプルルーティング
const routes = [
  { path: '/', element: <DashboardPage /> },           // メインダッシュボード
  { path: '/study', element: <QuestionListPage /> },    // 問題一覧
  { path: '/study/question/:id', element: <QuestionPage /> }, // 問題表示
  { path: '/study/review', element: <ReviewPage /> },   // 復習
  { path: '/progress', element: <ProgressPage /> },     // 進捗・統計
  { path: '/settings', element: <SettingsPage /> },     // 設定
];

// URLパラメータ例
// /study?category=1&section=morning1&year=2023
// /study/question/123
// /progress?view=heatmap
```

## 6. MVP セキュリティ（個人利用簡素化）

### 6.1 認証システム 🟡 **Medium**
- **シンプル認証**: 初回起動時の簡単セットアップ
- **セッション管理**: localStorage ベースの簡単セッション
- **マルチユーザー不要**: 複雑な認可システムは省略

### 6.2 データ保護 🔴 **High**
- **ローカルデータ保護**: SQLite ファイルの適切な管理
- **バックアップ**: 自動バックアップ機能
- **入力バリデーション**: Zod による基本的な入力チェック

### 6.3 API セキュリティ 🟡 **Medium**
- **CORS設定**: ローカル開発用設定
- **基本ヘッダー**: helmet.js の基本設定
- **レートリミット**: 個人利用のため簡素化

## 7. MVP パフォーマンス最適化

### 7.1 フロントエンド最適化 🟡 **Medium**
- **基本最適化**: Viteのデフォルト最適化
- **画像最適化**: 適切なサイズ・形式の画像使用
- **遅延読み込み**: 重いコンポーネントの遅延読み込み

### 7.2 バックエンド最適化 🔴 **High**
- **SQLite最適化**: 適切なインデックス設定
- **クエリ最適化**: N+1問題を避けるクエリ設計
- **メモリ管理**: シンプルなメモリキャッシュ

### 7.3 ローカルキャッシュ戦略 🔴 **High**
```
静的アセット → ファイルシステム + ブラウザキャッシュ
APIレスポンス → メモリキャッシュ (TTL: 5-30min)
データベース → SQLiteの物理最適化
```

## 8. MVP モニタリング（簡素化）

### 8.1 シンプルログ 🟡 **Medium**
```typescript
// 最小限のログ設計
interface SimpleLog {
  timestamp: string;
  level: 'error' | 'info' | 'debug';
  message: string;
  data?: Record<string, any>;
}

// コンソール + ファイル出力
const logger = {
  error: (message: string, data?: any) => void,
  info: (message: string, data?: any) => void,
  debug: (message: string, data?: any) => void,
};
```

### 8.2 基本メトリクス 🔴 **High**
- **学習メトリクス**: 問題解答数、正答率、学習時間
- **システムメトリクス**: レスポンス時間、エラー発生
- **ユーザビリティ**: クリックイベント、ページ滞在時間

## 9. MVP デプロイ・開発環境

### 9.1 ローカル開発環境 🔴 **High** ✅ **実装済み**
```bash
# 実装済み開発セットアップ
npm install                    # 依存関係インストール完了
npm run dev:frontend          # フロント開発サーバー（ポート3003）
npm run dev:backend           # バックエンド開発サーバー（ポート3001）

# 実機テスト完了済み
# PCからのアクセス: http://localhost:3003
# スマホからのアクセス: http://[PCのIPアドレス]:3003
# プロキシ設定: frontend/vite.config.ts で API を backend:3001 へ転送
```

### 9.2 ビルド・デプロイ 🟡 **Medium**
```bash
# プロダクションビルド（将来）
npm run build                 # フロントエンドビルド
npm run build:backend         # バックエンドビルド
npm start                     # 本番環境起動
```

### 9.3 個人利用配布 🔵 **Low**
```bash
# 将来的な配布方法
# 1. Electron アプリ化
# 2. Docker コンテナ化
# 3. ローカルサーバー化
```

## 10. 開発フェーズ別設計指針

### Phase 1: MVP (1-2ヶ月) 🔴 ✅ **実装完了 - 2025年1月**
- **基本機能**: ✅ 問題演習システム、進捗記録、レスポンシブUI実装完了
- **モバイル対応**: ✅ PC・スマートフォン完全対応、タッチ操作最適化完了
- **実装コンポーネント**: 
  - ✅ PracticePage（問題演習）- スワイプ操作、タッチ最適化UI
  - ✅ Dashboard（ダッシュボード）- 進捗概要、学習統計
  - ✅ Mobile-first レスポンシブレイアウト
  - ✅ PWA設定（Service Worker、マニフェスト）
- **技術実装**:
  - ✅ React 18 + TypeScript + Vite
  - ✅ Zustand状態管理
  - ✅ Material-UI v5 レスポンシブコンポーネント
  - ✅ Node.js + Express バックエンド
  - ✅ SQLite + Prisma ORM
- **実機動作確認**: ✅ スマートフォン・PC クロスデバイス動作確認完了
- **API実装**: ✅ 問題取得、回答送信、進捗管理の基本API動作確認済み

#### 実装コンポーネント詳細

##### **PracticePage コンポーネント** ✅
- **ファイル**: `frontend/src/pages/PracticePage.tsx`
- **機能**: 問題表示、回答受付、結果表示
- **モバイル最適化**:
  - スワイプ操作で問題切り替え
  - 大型タップボタン
  - 縦スクロールレイアウト
- **状態管理**: Zustand で問題データ、進捗管理
- **API連携**: 問題取得、回答送信実装済み

##### **Dashboard コンポーネント** ✅
- **ファイル**: `frontend/src/components/Dashboard.tsx`
- **機能**: 学習概要、進捗表示、モード選択
- **モバイル最適化**:
  - カード式レイアウト
  - タッチフレンドリーなUI
  - レスポンシブグリッド

##### **PWA機能** ✅
- **Service Worker**: オフラインキャッシュ実装
- **マニフェスト**: `public/manifest.json` 設定完了
- **アイコン**: PWAアイコン設定完了
- **インストール可能**: スマートフォンでアプリインストール対応

##### **バックエンドAPI** ✅
- **ファイル**: `backend/src/index.ts`
- **ポート設定**: 3001 (プロキシ設定でフロントエンドと連携)
- **実装API**:
  - `GET /api/categories` - 分野一覧
  - `GET /api/questions` - 問題取得
  - `POST /api/answers` - 回答送信
  - `GET /api/progress` - 進捗取得
- **データベース**: SQLite + Prisma ORM 実装完了

##### **プロキシ設定** ✅
- **ファイル**: `frontend/vite.config.ts`
- **設定**: フロントエンド(3003) から バックエンド(3001) へのプロキシ
- **クロスオリジン**: CORS設定完了
- **モバイルアクセス**: PCのIPアドレス経由でスマートフォンアクセス対応

##### **バグ修正成果** ✅
- **無限ループ解決**: PracticePage.tsx の useEffect 依存関係最適化
- **ポート競合解決**: バックエンドポートを 3002 から 3001 へ変更
- **Service Workerエラー解決**: PWA設定の簡素化と最適化
- **コンポーネントマウント問題解決**: SwipeablePages ラッパーの除去

### Phase 2: マルチデバイス強化 (2-3ヶ月) 🟡 **計画中**
- **デバイス同期**: PC・スマホ間の学習データ同期
- **高度UI**: インタラクティブ図表、スワイプ操作、ピンチズーム
- **通勤学習最適化**: 短時間学習モード、中断・再開機能
- **データインポート**: 過去問データの一括インポート

### Phase 3: AI統合・高度化 (3-6ヶ月) 🔵
- **AI採点機能**: 午後Ⅱ論文のAI採点システム
- **学習分析AI**: 個人最適化学習推奨システム
- **高度可視化**: 3D回路図、動的シミュレーション