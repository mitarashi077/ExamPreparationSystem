# タスク: ダッシュボード状態管理

計画書: learning-progress-dashboard.md
全体設計書: _overview-learning-progress-dashboard.md
タスク番号: LPD-005
タスクサイズ: 小規模
想定ファイル数: 1
想定作業時間: 2時間
依存タスク: なし

## 全体における位置づけ
### プロジェクト全体の目的
学習進捗ダッシュボード機能により、学習者の進捗可視化とモチベーション向上を実現

### このタスクの役割
ダッシュボード専用のZustand状態管理ストアを実装し、フロントエンドでのデータ管理と画面更新の基盤を構築する

### 前タスクとの関連
- 前タスク: なし（フロントエンド実装の出発点）
- 引き継ぐ情報: 既存のアプリケーション状態管理パターン

### 後続タスクへの影響
- 後続タスク: LPD-006 (API クライアント統合), LPD-007 (WebSocket クライアント), LPD-008 (ダッシュボードページレイアウト)
- 提供する情報: ダッシュボード状態管理の構造とアクション

## 概要
Zustandを使用してダッシュボード専用の状態管理ストアを実装し、統計データ、フィルター設定、UI状態、ユーザー設定を一元管理する。

## 対象ファイル
- [ ] frontend/src/stores/useDashboardStore.ts

## 実装手順（TDD: Red-Green-Refactor）

### 1. **Red Phase - 失敗するテストを書く**
   - [ ] ダッシュボードストアのimportテストを作成し、存在しないことを確認
   - [ ] 状態の初期値取得テストを作成し、未定義エラーを確認
   - [ ] アクション実行テストを作成し、機能が未実装であることを確認

### 2. **Green Phase - 最小限の実装**
   - [ ] 基本的なダッシュボードストアを実装:
   ```typescript
   import { create } from 'zustand';
   import { persist } from 'zustand/middleware';

   // 型定義
   export interface OverviewStats {
     totalStudyTime: number;
     questionsAnswered: number;
     currentStreak: number;
     averageAccuracy: number;
     studyDaysInPeriod: number;
     improvementRate: number;
   }

   export interface TrendDataPoint {
     date: string;
     questionsAnswered: number;
     correctAnswers: number;
     accuracy: number;
     studyTime: number;
   }

   export interface SubjectPerformance {
     categoryId: string;
     categoryName: string;
     averageAccuracy: number;
     questionsAnswered: number;
     lastAnswered: string;
   }

   export interface Achievement {
     id: string;
     type: string;
     title: string;
     description: string;
     iconName: string;
     unlockedAt: string;
   }

   export interface StudyGoal {
     id: string;
     targetType: string;
     targetValue: number;
     currentValue: number;
     period: string;
     isActive: boolean;
     createdAt: string;
   }

   export interface DashboardFilters {
     period: '7d' | '30d' | '90d';
     subjects: string[];
     difficulty: number[];
   }

   export interface DashboardPreferences {
     chartTypes: Record<string, string>;
     defaultPeriod: number;
     showComparison: boolean;
   }

   interface DashboardState {
     // データ状態
     overview: OverviewStats | null;
     trends: TrendDataPoint[];
     subjects: SubjectPerformance[];
     achievements: Achievement[];
     goals: StudyGoal[];
     
     // UI状態
     loading: {
       overview: boolean;
       trends: boolean;
       subjects: boolean;
       achievements: boolean;
       goals: boolean;
     };
     
     error: string | null;
     
     // フィルターと設定
     filters: DashboardFilters;
     preferences: DashboardPreferences;
     
     // アクション
     setOverview: (overview: OverviewStats) => void;
     setTrends: (trends: TrendDataPoint[]) => void;
     setSubjects: (subjects: SubjectPerformance[]) => void;
     setAchievements: (achievements: Achievement[]) => void;
     setGoals: (goals: StudyGoal[]) => void;
     setLoading: (key: keyof DashboardState['loading'], loading: boolean) => void;
     setError: (error: string | null) => void;
     updateFilters: (filters: Partial<DashboardFilters>) => void;
     updatePreferences: (preferences: Partial<DashboardPreferences>) => void;
     resetState: () => void;
   }

   export const useDashboardStore = create<DashboardState>()(
     persist(
       (set, get) => ({
         // 初期状態
         overview: null,
         trends: [],
         subjects: [],
         achievements: [],
         goals: [],
         
         loading: {
           overview: false,
           trends: false,
           subjects: false,
           achievements: false,
           goals: false,
         },
         
         error: null,
         
         filters: {
           period: '30d',
           subjects: [],
           difficulty: [],
         },
         
         preferences: {
           chartTypes: {},
           defaultPeriod: 30,
           showComparison: false,
         },
         
         // アクション
         setOverview: (overview) => set({ overview }),
         setTrends: (trends) => set({ trends }),
         setSubjects: (subjects) => set({ subjects }),
         setAchievements: (achievements) => set({ achievements }),
         setGoals: (goals) => set({ goals }),
         
         setLoading: (key, loading) => 
           set((state) => ({
             loading: { ...state.loading, [key]: loading }
           })),
         
         setError: (error) => set({ error }),
         
         updateFilters: (newFilters) =>
           set((state) => ({
             filters: { ...state.filters, ...newFilters }
           })),
         
         updatePreferences: (newPreferences) =>
           set((state) => ({
             preferences: { ...state.preferences, ...newPreferences }
           })),
         
         resetState: () => set({
           overview: null,
           trends: [],
           subjects: [],
           achievements: [],
           goals: [],
           error: null,
         }),
       }),
       {
         name: 'dashboard-store',
         // 設定とフィルターのみ永続化（データはAPIから取得）
         partialize: (state) => ({
           filters: state.filters,
           preferences: state.preferences,
         }),
       }
     )
   );
   ```

### 3. **Refactor Phase - コード改善**
   - [ ] 非同期アクションを追加:
   ```typescript
   // APIとの連携用アクション（LPD-006で詳細実装）
   fetchOverview: async (period: string) => {
     const { setLoading, setError, setOverview } = get();
     setLoading('overview', true);
     setError(null);
     
     try {
       // API呼び出しプレースホルダー
       // 実際の実装は LPD-006 で行う
       console.log(`Fetching overview for period: ${period}`);
     } catch (error) {
       setError(error instanceof Error ? error.message : 'Unknown error');
     } finally {
       setLoading('overview', false);
     }
   },

   fetchTrends: async (period: string, granularity: string = 'daily') => {
     const { setLoading, setError, setTrends } = get();
     setLoading('trends', true);
     setError(null);
     
     try {
       console.log(`Fetching trends for period: ${period}, granularity: ${granularity}`);
     } catch (error) {
       setError(error instanceof Error ? error.message : 'Unknown error');
     } finally {
       setLoading('trends', false);
     }
   },
   ```
   - [ ] 計算プロパティ（セレクター）を追加:
   ```typescript
   // ストアの外部に計算関数を定義
   export const dashboardSelectors = {
     getFilteredTrends: (state: DashboardState) => {
       const { trends, filters } = state;
       // フィルター適用ロジック（簡易版）
       return trends;
     },
     
     getTotalStats: (state: DashboardState) => {
       const { overview } = state;
       if (!overview) return null;
       
       return {
         totalQuestions: overview.questionsAnswered,
         totalTime: overview.totalStudyTime,
         averageAccuracy: overview.averageAccuracy,
       };
     },
     
     getActiveGoals: (state: DashboardState) => {
       return state.goals.filter(goal => goal.isActive);
     },
   };
   ```
   - [ ] TypeScript型の改善とエクスポート整理
   - [ ] 状態の検証機能を追加（開発時のデバッグ用）

## 完了条件
- [ ] Red Phase: ダッシュボードストア関連の失敗テストを作成済み
- [ ] Green Phase: 基本的な状態管理機能が実装され、データの保存・取得が可能
- [ ] Refactor Phase: 非同期アクションと計算プロパティが追加済み
- [ ] 設定とフィルターがlocalStorageに永続化されることを確認済み
- [ ] TypeScriptの型チェックがエラーなしで通ることを確認済み
- [ ] **注記**: 実際のAPI連携は LPD-006 で実装

## 注意事項
### 実装上の注意
- 永続化は設定とフィルターのみ行い、実データはAPIから毎回取得
- エラー状態の管理を適切に行い、UI側で適切に表示できるようにする
- 状態の更新は必ずイミュータブルに行う
- パフォーマンスを考慮し、不要な再レンダリングを避ける設計

### 影響範囲の制御
- このタスクで変更してはいけない部分: 既存の状態管理ストア（アプリケーション全体の状態）
- 影響が波及する可能性がある箇所: なし（新規ストアのため独立）

### 共通化の指針
- 他タスクと共通化すべき処理: エラーハンドリングパターンは既存のストア実装に準拠
- 冗長実装を避けるための確認事項: 型定義は後続タスクで再利用される前提で設計