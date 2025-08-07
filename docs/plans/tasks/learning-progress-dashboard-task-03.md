# タスク: 分析クエリ最適化

計画書: learning-progress-dashboard.md
全体設計書: _overview-learning-progress-dashboard.md
タスク番号: LPD-003
タスクサイズ: 中規模
想定ファイル数: 1
想定作業時間: 3時間
依存タスク: LPD-002

## 全体における位置づけ
### プロジェクト全体の目的
学習進捗ダッシュボード機能により、学習者の進捗可視化とモチベーション向上を実現

### このタスクの役割
ダッシュボードAPIエンドポイントに実際のデータベースクエリ機能を実装し、パフォーマンス要件を満たす最適化を行う

### 前タスクとの関連
- 前タスク: LPD-002 (コアダッシュボードAPI エンドポイント)
- 引き継ぐ情報: 基本的なAPIエンドポイント構造と型定義

### 後続タスクへの影響
- 後続タスク: LPD-006 (API クライアント統合)、LPD-004 (WebSocket インフラ)
- 提供する情報: 最適化されたデータ取得機能とパフォーマンス基準

## 概要
LPD-002で作成したAPIエンドポイントに実際のデータベースクエリを実装し、分析用の最適化クエリとキャッシュ機能を追加する。

## 対象ファイル
- [ ] backend/src/controllers/dashboardController.ts

## 実装手順（TDD: Red-Green-Refactor）

### 1. **Red Phase - 失敗するテストを書く**
   - [ ] 大量データ（1000件以上の回答データ）でのレスポンス時間テストを作成し、現在の実装では遅いことを確認
   - [ ] 複雑な期間指定（90日間）でのメモリ使用量テストを作成し、最適化されていないことを確認
   - [ ] 並行リクエスト（10件同時）でのパフォーマンステストを作成し、問題があることを確認

### 2. **Green Phase - 最小限の実装**
   - [ ] getOverviewに実際のデータベースクエリを実装:
   ```typescript
   export const getOverview = async (req: Request, res: Response) => {
     try {
       const period = req.query.period as string || '30d';
       const daysCount = parsePeriodToDays(period);
       const startDate = new Date();
       startDate.setDate(startDate.getDate() - daysCount);

       // 最適化された統計クエリ
       const totalAnswers = await prisma.answer.count({
         where: { createdAt: { gte: startDate } }
       });

       const accuracyData = await prisma.answer.aggregate({
         where: { createdAt: { gte: startDate } },
         _avg: { isCorrect: true },
         _sum: { timeSpent: true }
       });

       const stats = {
         totalStudyTime: Math.round((accuracyData._sum.timeSpent || 0) / 60),
         questionsAnswered: totalAnswers,
         currentStreak: await calculateCurrentStreak(),
         averageAccuracy: Math.round((accuracyData._avg.isCorrect || 0) * 100),
         studyDaysInPeriod: await calculateStudyDays(startDate),
         improvementRate: await calculateImprovementRate(period)
       };

       res.json({
         stats,
         lastUpdated: new Date().toISOString()
       });
     } catch (error) {
       console.error('Overview query error:', error);
       res.status(500).json({ error: 'Internal server error' });
     }
   };
   ```
   - [ ] getTrendsに最適化されたクエリを実装:
   ```typescript
   export const getTrends = async (req: Request, res: Response) => {
     try {
       const period = req.query.period as string || '30d';
       const granularity = req.query.granularity as string || 'daily';
       
       // Raw SQLを使用した最適化クエリ
       const trendsData = await prisma.$queryRaw`
         SELECT 
           DATE(createdAt) as date,
           COUNT(*) as total_answers,
           SUM(CASE WHEN isCorrect THEN 1 ELSE 0 END) as correct_answers,
           AVG(timeSpent) as avg_time,
           COUNT(DISTINCT questionId) as unique_questions
         FROM Answer 
         WHERE createdAt >= DATE('now', '-${period}')
         GROUP BY DATE(createdAt)
         ORDER BY date DESC
         LIMIT 100
       `;

       const formattedData = trendsData.map(item => ({
         date: item.date,
         questionsAnswered: Number(item.total_answers),
         correctAnswers: Number(item.correct_answers),
         accuracy: Math.round((Number(item.correct_answers) / Number(item.total_answers)) * 100),
         studyTime: Math.round(Number(item.avg_time) / 60)
       }));

       res.json({
         data: formattedData,
         period: { 
           start: new Date(Date.now() - parsePeriodToDays(period) * 24 * 60 * 60 * 1000).toISOString(),
           end: new Date().toISOString() 
         }
       });
     } catch (error) {
       console.error('Trends query error:', error);
       res.status(500).json({ error: 'Internal server error' });
     }
   };
   ```
   - [ ] 基本的なヘルパー関数を実装:
   ```typescript
   const parsePeriodToDays = (period: string): number => {
     switch (period) {
       case '7d': return 7;
       case '30d': return 30;
       case '90d': return 90;
       case 'all': return 365; // 最大1年
       default: return 30;
     }
   };

   const calculateCurrentStreak = async (): Promise<number> => {
     // 基本的な連続学習日数計算
     return 0; // 暫定実装
   };

   const calculateStudyDays = async (startDate: Date): Promise<number> => {
     const studyDays = await prisma.answer.groupBy({
       by: ['createdAt'],
       where: { createdAt: { gte: startDate } },
       _count: true
     });
     return studyDays.length;
   };

   const calculateImprovementRate = async (period: string): Promise<number> => {
     // 基本的な改善率計算
     return 0; // 暫定実装
   };
   ```

### 3. **Refactor Phase - コード改善**
   - [ ] パフォーマンス最適化を実装:
     - メモリ効率的なクエリに変更
     - 結果のページネーション追加
     - 適切なインデックス活用の確認
   - [ ] 基本的なキャッシュ機能を追加:
   ```typescript
   const cache = new Map<string, { data: any; timestamp: number }>();
   const CACHE_TTL = 5 * 60 * 1000; // 5分

   const getCachedData = (key: string) => {
     const cached = cache.get(key);
     if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
       return cached.data;
     }
     return null;
   };

   const setCachedData = (key: string, data: any) => {
     cache.set(key, { data, timestamp: Date.now() });
   };
   ```
   - [ ] エラーハンドリングとログ出力を改善
   - [ ] データベースクエリのパフォーマンス測定を追加

## 完了条件
- [ ] Red Phase: パフォーマンステストを作成し、最適化前の問題を確認済み
- [ ] Green Phase: 実際のデータベースクエリが実装され、正しいデータを返すことを確認済み
- [ ] Refactor Phase: パフォーマンス最適化とキャッシュ機能が実装済み
- [ ] 概要エンドポイントのレスポンス時間が200ms以内であることを確認済み
- [ ] トレンドエンドポイントの90日データ取得が500ms以内であることを確認済み
- [ ] **注記**: 高度な最適化は本番運用で必要に応じて追加

## 注意事項
### 実装上の注意
- Raw SQLクエリを使用する場合はSQLインジェクション対策を徹底
- キャッシュはメモリベースの簡単な実装から開始、本格運用時にRedis等を検討
- データベースインデックスの効果を測定し、必要に応じてスキーマ調整を提案
- 大量データでの動作確認は開発環境でのみ実施

### 影響範囲の制御
- このタスクで変更してはいけない部分: APIエンドポイントの署名と基本的な応答形式
- 影響が波及する可能性がある箇所: データベースの負荷（クエリ最適化により改善される想定）

### 共通化の指針
- 他タスクと共通化すべき処理: キャッシュ機能は将来的に他のAPIでも利用可能な設計
- 冗長実装を避けるための確認事項: ヘルパー関数は再利用可能な形で実装