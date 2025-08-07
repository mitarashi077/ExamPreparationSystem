# タスク: API クライアント統合

計画書: learning-progress-dashboard.md
全体設計書: _overview-learning-progress-dashboard.md
タスク番号: LPD-006
タスクサイズ: 小規模
想定ファイル数: 1
想定作業時間: 2時間
依存タスク: LPD-002, LPD-005

## 全体における位置づけ
### プロジェクト全体の目的
学習進捗ダッシュボード機能により、学習者の進捗可視化とモチベーション向上を実現

### このタスクの役割
既存のAPIクライアントにダッシュボード用のエンドポイントメソッドを追加し、Zustandストアと連携してデータ取得を実現する

### 前タスクとの関連
- 前タスク: LPD-002 (コアダッシュボードAPI エンドポイント), LPD-005 (ダッシュボード状態管理)
- 引き継ぐ情報: APIエンドポイント仕様とダッシュボードストア構造

### 後続タスクへの影響
- 後続タスク: LPD-008 (ダッシュボードページレイアウト)
- 提供する情報: ダッシュボードデータ取得の完全な機能

## 概要
既存のAPIクライアントにダッシュボード専用のメソッドを追加し、LPD-005で作成したZustandストアと連携してデータ取得・状態更新を実現する。

## 対象ファイル
- [ ] frontend/src/utils/apiClient.ts

## 実装手順（TDD: Red-Green-Refactor）

### 1. **Red Phase - 失敗するテストを書く**
   - [ ] ダッシュボードAPI メソッドの呼び出しテストを作成し、存在しないことを確認
   - [ ] API応答の型チェックテストを作成し、型定義が不完全であることを確認
   - [ ] ストアとの連携テストを作成し、データが正しく更新されないことを確認

### 2. **Green Phase - 最小限の実装**
   - [ ] 既存のapiClient.tsにダッシュボード用のメソッドを追加:
   ```typescript
   import { 
     OverviewStats, 
     TrendDataPoint, 
     SubjectPerformance, 
     Achievement, 
     StudyGoal 
   } from '../stores/useDashboardStore';

   // API応答型定義
   interface OverviewResponse {
     stats: OverviewStats;
     lastUpdated: string;
   }

   interface TrendsResponse {
     data: TrendDataPoint[];
     period: { start: string; end: string };
   }

   interface CreateGoalRequest {
     targetType: string;
     targetValue: number;
     period: string;
   }

   // ダッシュボードAPI クライアント
   export const dashboardApi = {
     // 概要統計取得
     getOverview: async (period: string = '30d'): Promise<OverviewResponse> => {
       try {
         const response = await apiClient.get(`/dashboard/overview?period=${period}`);
         return response.data;
       } catch (error) {
         console.error('Failed to fetch overview:', error);
         throw error;
       }
     },

     // トレンドデータ取得
     getTrends: async (period: string = '30d', granularity: string = 'daily'): Promise<TrendsResponse> => {
       try {
         const response = await apiClient.get(`/dashboard/trends?period=${period}&granularity=${granularity}`);
         return response.data;
       } catch (error) {
         console.error('Failed to fetch trends:', error);
         throw error;
       }
     },

     // 分野別パフォーマンス取得
     getSubjects: async (): Promise<SubjectPerformance[]> => {
       try {
         const response = await apiClient.get('/dashboard/subjects');
         return response.data;
       } catch (error) {
         console.error('Failed to fetch subjects:', error);
         throw error;
       }
     },

     // 達成記録取得
     getAchievements: async (): Promise<Achievement[]> => {
       try {
         const response = await apiClient.get('/dashboard/achievements');
         return response.data;
       } catch (error) {
         console.error('Failed to fetch achievements:', error);
         throw error;
       }
     },

     // 学習目標作成
     createGoal: async (goal: CreateGoalRequest): Promise<StudyGoal> => {
       try {
         const response = await apiClient.post('/dashboard/goals', goal);
         return response.data;
       } catch (error) {
         console.error('Failed to create goal:', error);
         throw error;
       }
     },
   };
   ```
   - [ ] ダッシュボードストアの非同期アクションを実装:
   ```typescript
   // useDashboardStore.ts に追加
   import { dashboardApi } from '../utils/apiClient';

   // fetchOverview の実装を完成
   fetchOverview: async (period: string = '30d') => {
     const { setLoading, setError, setOverview } = get();
     setLoading('overview', true);
     setError(null);

     try {
       const response = await dashboardApi.getOverview(period);
       setOverview(response.stats);
     } catch (error) {
       const errorMessage = error instanceof Error ? error.message : 'Failed to fetch overview';
       setError(errorMessage);
       console.error('Overview fetch error:', error);
     } finally {
       setLoading('overview', false);
     }
   },

   // fetchTrends の実装を完成
   fetchTrends: async (period: string = '30d', granularity: string = 'daily') => {
     const { setLoading, setError, setTrends } = get();
     setLoading('trends', true);
     setError(null);

     try {
       const response = await dashboardApi.getTrends(period, granularity);
       setTrends(response.data);
     } catch (error) {
       const errorMessage = error instanceof Error ? error.message : 'Failed to fetch trends';
       setError(errorMessage);
       console.error('Trends fetch error:', error);
     } finally {
       setLoading('trends', false);
     }
   },

   // その他のfetchメソッドも同様に実装
   fetchSubjects: async () => {
     const { setLoading, setError, setSubjects } = get();
     setLoading('subjects', true);
     setError(null);

     try {
       const subjects = await dashboardApi.getSubjects();
       setSubjects(subjects);
     } catch (error) {
       const errorMessage = error instanceof Error ? error.message : 'Failed to fetch subjects';
       setError(errorMessage);
     } finally {
       setLoading('subjects', false);
     }
   },
   ```

### 3. **Refactor Phase - コード改善**
   - [ ] エラーハンドリングを改善:
   ```typescript
   // 共通エラーハンドリング関数
   const handleApiError = (error: unknown, context: string) => {
     if (error instanceof Error) {
       // APIエラー応答の構造化されたエラー情報を取得
       const apiError = (error as any).response?.data?.error || error.message;
       return `${context}: ${apiError}`;
     }
     return `${context}: Unknown error occurred`;
   };
   ```
   - [ ] キャッシュ機能を追加:
   ```typescript
   // 簡易的なキャッシュメカニズム
   interface CacheEntry<T> {
     data: T;
     timestamp: number;
     ttl: number; // Time to live in milliseconds
   }

   const cache = new Map<string, CacheEntry<any>>();

   const getCachedData = <T>(key: string): T | null => {
     const entry = cache.get(key);
     if (entry && Date.now() - entry.timestamp < entry.ttl) {
       return entry.data;
     }
     cache.delete(key);
     return null;
   };

   const setCachedData = <T>(key: string, data: T, ttl: number = 5 * 60 * 1000) => {
     cache.set(key, { data, timestamp: Date.now(), ttl });
   };

   // キャッシュ付きAPI呼び出し例
   getOverviewCached: async (period: string = '30d'): Promise<OverviewResponse> => {
     const cacheKey = `overview-${period}`;
     const cachedData = getCachedData<OverviewResponse>(cacheKey);
     
     if (cachedData) {
       return cachedData;
     }

     const data = await dashboardApi.getOverview(period);
     setCachedData(cacheKey, data);
     return data;
   },
   ```
   - [ ] リトライ機能を追加:
   ```typescript
   const withRetry = async <T>(
     fn: () => Promise<T>, 
     maxRetries: number = 3, 
     delayMs: number = 1000
   ): Promise<T> => {
     for (let attempt = 1; attempt <= maxRetries; attempt++) {
       try {
         return await fn();
       } catch (error) {
         if (attempt === maxRetries) {
           throw error;
         }
         
         // 指数バックオフ
         const delay = delayMs * Math.pow(2, attempt - 1);
         await new Promise(resolve => setTimeout(resolve, delay));
       }
     }
     throw new Error('Max retries exceeded');
   };
   ```
   - [ ] TypeScript型の厳密化とエクスポート整理

## 完了条件
- [ ] Red Phase: API連携の失敗テストを作成し、機能が未実装であることを確認済み
- [ ] Green Phase: 全ダッシュボードAPIメソッドが実装され、ストアと正しく連携する
- [ ] Refactor Phase: エラーハンドリング、キャッシュ、リトライ機能が実装済み
- [ ] ダッシュボードストアの非同期アクションが正常に動作することを確認済み
- [ ] API呼び出しエラー時に適切なエラーメッセージがストアに設定されることを確認済み
- [ ] **注記**: 実際のAPIからのデータ取得テストは LPD-008 のページ実装で確認

## 注意事項
### 実装上の注意
- 既存のapiClientの構造とパターンに従い、一貫性を保つ
- エラーレスポンスの構造は既存APIと統一する
- キャッシュのTTL（生存時間）は適切に設定し、古いデータを避ける
- 型定義はストアの型定義と完全に一致させる

### 影響範囲の制御
- このタスクで変更してはいけない部分: apiClientの基本構造と既存のメソッド
- 影響が波及する可能性がある箇所: ダッシュボードストアの非同期アクション（意図的な変更）

### 共通化の指針
- 他タスクと共通化すべき処理: エラーハンドリングとキャッシュ機能は他のAPI呼び出しでも利用可能
- 冗長実装を避けるための確認事項: 既存のAPIクライアントパターンを最大限再利用