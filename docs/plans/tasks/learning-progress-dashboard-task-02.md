# タスク: コアダッシュボードAPI エンドポイント

計画書: learning-progress-dashboard.md
全体設計書: _overview-learning-progress-dashboard.md
タスク番号: LPD-002
タスクサイズ: 中規模
想定ファイル数: 2
想定作業時間: 4時間
依存タスク: LPD-001

## 全体における位置づけ
### プロジェクト全体の目的
学習進捗ダッシュボード機能により、学習者の進捗可視化とモチベーション向上を実現

### このタスクの役割
ダッシュボードで表示するデータを提供するREST APIエンドポイントを実装し、フロントエンドからのデータ取得を可能にする

### 前タスクとの関連
- 前タスク: LPD-001 (データベーススキーマ拡張)
- 引き継ぐ情報: ダッシュボード用のデータモデル（DashboardPreference, StudyGoal, Achievement）とAnswerモデルの拡張

### 後続タスクへの影響
- 後続タスク: LPD-003 (クエリ最適化), LPD-006 (API クライアント統合)
- 提供する情報: ダッシュボードデータ取得用のAPIエンドポイント群

## 概要
ダッシュボードで使用する統計データ、トレンド分析、分野別パフォーマンス、達成記録を取得するREST APIエンドポイントを実装する。

## 対象ファイル
- [ ] backend/src/controllers/dashboardController.ts
- [ ] backend/src/routes/dashboardRoutes.ts

## 実装手順（TDD: Red-Green-Refactor）

### 1. **Red Phase - 失敗するテストを書く**
   - [ ] 各APIエンドポイントへのリクエストテストを作成し、404エラーが返ることを確認
   - [ ] APIレスポンスの型定義テストを作成し、未定義エラーを確認
   - [ ] 不正なパラメータでのリクエストテストを作成し、適切にエラーハンドリングされないことを確認

### 2. **Green Phase - 最小限の実装**
   - [ ] dashboardController.tsに以下のエンドポイントを実装:
   ```typescript
   // GET /api/dashboard/overview
   export const getOverview = async (req: Request, res: Response) => {
     try {
       const period = req.query.period as string || '30d';
       
       // Basic stats calculation
       const stats = {
         totalStudyTime: 0, // minutes - 暫定値
         questionsAnswered: 0, // 暫定値 
         currentStreak: 0, // days - 暫定値
         averageAccuracy: 0, // percentage - 暫定値
         studyDaysInPeriod: 0, // 暫定値
         improvementRate: 0 // percentage change - 暫定値
       };
       
       res.json({
         stats,
         lastUpdated: new Date().toISOString()
       });
     } catch (error) {
       res.status(500).json({ error: 'Internal server error' });
     }
   };

   // GET /api/dashboard/trends
   export const getTrends = async (req: Request, res: Response) => {
     try {
       const period = req.query.period as string || '30d';
       const granularity = req.query.granularity as string || 'daily';
       
       res.json({
         data: [], // 暫定的に空配列
         period: { start: new Date().toISOString(), end: new Date().toISOString() }
       });
     } catch (error) {
       res.status(500).json({ error: 'Internal server error' });
     }
   };

   // GET /api/dashboard/subjects
   export const getSubjects = async (req: Request, res: Response) => {
     try {
       res.json([]); // 暫定的に空配列
     } catch (error) {
       res.status(500).json({ error: 'Internal server error' });
     }
   };

   // GET /api/dashboard/achievements
   export const getAchievements = async (req: Request, res: Response) => {
     try {
       res.json([]); // 暫定的に空配列
     } catch (error) {
       res.status(500).json({ error: 'Internal server error' });
     }
   };

   // POST /api/dashboard/goals
   export const createGoal = async (req: Request, res: Response) => {
     try {
       // Basic validation
       const { targetType, targetValue, period } = req.body;
       if (!targetType || !targetValue || !period) {
         return res.status(400).json({ error: 'Missing required fields' });
       }
       
       res.status(201).json({ id: 'temp-id', message: 'Goal created' });
     } catch (error) {
       res.status(500).json({ error: 'Internal server error' });
     }
   };
   ```
   - [ ] dashboardRoutes.tsにルート定義を追加:
   ```typescript
   import express from 'express';
   import { 
     getOverview, 
     getTrends, 
     getSubjects, 
     getAchievements, 
     createGoal 
   } from '../controllers/dashboardController';

   const router = express.Router();

   router.get('/overview', getOverview);
   router.get('/trends', getTrends);
   router.get('/subjects', getSubjects);
   router.get('/achievements', getAchievements);
   router.post('/goals', createGoal);

   export default router;
   ```

### 3. **Refactor Phase - コード改善**
   - [ ] TypeScript型定義を追加:
   ```typescript
   interface OverviewStats {
     totalStudyTime: number;
     questionsAnswered: number;
     currentStreak: number;
     averageAccuracy: number;
     studyDaysInPeriod: number;
     improvementRate: number;
   }

   interface OverviewResponse {
     stats: OverviewStats;
     lastUpdated: string;
   }

   interface TrendDataPoint {
     date: string;
     questionsAnswered: number;
     correctAnswers: number;
     accuracy: number;
     studyTime: number;
   }

   interface TrendsResponse {
     data: TrendDataPoint[];
     period: { start: string; end: string };
   }
   ```
   - [ ] Zodスキーマを使用した入力検証を追加
   - [ ] エラーハンドリングを改善し、適切なHTTPステータスコードを返す
   - [ ] 基本的なルートをメインアプリケーションに統合

## 完了条件
- [ ] Red Phase: 全エンドポイントに対する失敗テストを作成済み
- [ ] Green Phase: 5つの基本エンドポイントが実装済み、基本的なレスポンスを返す
- [ ] Refactor Phase: TypeScript型定義とエラーハンドリングが改善済み
- [ ] 全エンドポイントが適切なHTTPステータスコードを返すことを確認済み
- [ ] **注記**: 実際のデータベースクエリは LPD-003 で実装。ここでは基本的なエンドポイント構造のみ

## 注意事項
### 実装上の注意
- 初期実装では暫定的なレスポンスを返し、LPD-003でデータベースクエリを実装
- エラーハンドリングは本格的に実装し、ログ出力も含める
- API仕様は計画書のOpenAPI仕様に準拠
- レスポンス時間は現時点では考慮せず、LPD-003で最適化

### 影響範囲の制御
- このタスクで変更してはいけない部分: 既存のAPI エンドポイントとルーティング
- 影響が波及する可能性がある箇所: メインアプリケーションのルート設定（dashboard routes追加）

### 共通化の指針
- 他タスクと共通化すべき処理: エラーハンドリングパターンは既存のAPI実装に準拠
- 冗長実装を避けるための確認事項: 既存のコントローラーパターンと一貫性を保つ