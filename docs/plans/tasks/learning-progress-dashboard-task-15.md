# タスク: 統合テスト・バグ修正

計画書: learning-progress-dashboard.md
全体設計書: _overview-learning-progress-dashboard.md
タスク番号: LPD-015
タスクサイズ: 中規模
想定ファイル数: 複数（テストファイル、バグ修正）
想定作業時間: 4時間
依存タスク: 全ての前タスク（LPD-001〜LPD-014）

## 全体における位置づけ
### プロジェクト全体の目的
学習進捗ダッシュボード機能により、学習者の進捗可視化とモチベーション向上を実現

### このタスクの役割
ダッシュボード機能全体の統合テストを実施し、発見されたバグを修正して品質を保証する

### 前タスクとの関連
- 前タスク: 全ての実装タスク（LPD-001〜LPD-014）
- 引き継ぐ情報: 完全実装されたダッシュボード機能

### 後続タスクへの影響
- 後続タスク: なし（最終工程）
- 提供する情報: 品質保証されたダッシュボード機能

## 概要
End-to-Endテスト、統合テスト、パフォーマンステスト、アクセシビリティテストを実施し、発見された問題を修正してプロダクション品質を達成する。

## 対象ファイル
- [ ] テストファイル群（新規作成）
- [ ] バグ修正（既存ファイルの修正）

## 実装手順（TDD: Red-Green-Refactor）

### 1. **Red Phase - 失敗するテストを書く**
   - [ ] 統合テストスイートを作成し、現在の実装では一部のテストが失敗することを確認
   - [ ] パフォーマンステストを作成し、目標値を満たしていない項目を特定
   - [ ] アクセシビリティテストを作成し、WCAG準拠でない箇所を発見

### 2. **Green Phase - 最小限の実装**
   - [ ] End-to-Endテストスイートの実装:
   ```typescript
   // tests/e2e/dashboard.spec.ts
   import { test, expect } from '@playwright/test';

   test.describe('Dashboard Integration', () => {
     test.beforeEach(async ({ page }) => {
       await page.goto('/dashboard');
     });

     test('displays dashboard components correctly', async ({ page }) => {
       // ページ読み込み確認
       await expect(page.locator('[data-testid="dashboard-page"]')).toBeVisible();
       
       // 主要コンポーネントの表示確認
       await expect(page.locator('[data-testid="overview-cards"]')).toBeVisible();
       await expect(page.locator('[data-testid="trends-chart"]')).toBeVisible();
       await expect(page.locator('[data-testid="subjects-heatmap"]')).toBeVisible();
       await expect(page.locator('[data-testid="achievements-list"]')).toBeVisible();
       await expect(page.locator('[data-testid="goals-section"]')).toBeVisible();
     });

     test('real-time updates work correctly', async ({ page, context }) => {
       // ダッシュボードを開く
       await page.goto('/dashboard');
       await expect(page.locator('[data-testid="overview-cards"]')).toBeVisible();
       
       // 初期値を記録
       const initialAnswersText = await page.locator('[data-testid="total-answers"]').textContent();
       
       // 別タブで問題を解答
       const questionPage = await context.newPage();
       await questionPage.goto('/practice');
       
       // 問題回答のシミュレーション（実際のAPIがある場合）
       if (await questionPage.locator('[data-testid="question-container"]').isVisible()) {
         await questionPage.click('[data-testid="answer-choice-0"]');
         await questionPage.click('[data-testid="submit-answer"]');
         
         // ダッシュボードの更新を確認（リアルタイム）
         await page.waitForTimeout(2000); // WebSocket更新待ち
         const updatedAnswersText = await page.locator('[data-testid="total-answers"]').textContent();
         expect(updatedAnswersText).not.toBe(initialAnswersText);
       }
     });

     test('works offline and syncs when back online', async ({ page, context }) => {
       await page.goto('/dashboard');
       
       // オフライン化
       await context.setOffline(true);
       await page.reload();
       
       // オフライン表示の確認
       await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
       await expect(page.locator('[data-testid="overview-cards"]')).toBeVisible();
       
       // オンライン復帰
       await context.setOffline(false);
       await page.waitForSelector('[data-testid="offline-indicator"]', { state: 'hidden' });
       
       // 同期確認
       await expect(page.locator('[data-testid="connection-status"]')).toContainText('リアルタイム更新有効');
     });

     test('mobile responsive design', async ({ page }) => {
       // モバイルビューポートに設定
       await page.setViewportSize({ width: 375, height: 667 });
       await page.goto('/dashboard');
       
       // モバイルレイアウトの確認
       await expect(page.locator('[data-testid="overview-cards"]')).toBeVisible();
       
       // カードが縦積みになっていることを確認
       const cards = page.locator('[data-testid="stat-card"]');
       const cardCount = await cards.count();
       
       for (let i = 0; i < cardCount; i++) {
         const card = cards.nth(i);
         const box = await card.boundingBox();
         expect(box?.width).toBeLessThan(400); // モバイル幅に収まっている
       }
       
       // チャートの高さがモバイル用に調整されていることを確認
       const chart = page.locator('[data-testid="trends-chart"]');
       const chartBox = await chart.boundingBox();
       expect(chartBox?.height).toBeLessThan(250); // モバイル用の高さ
     });

     test('goal creation and management flow', async ({ page }) => {
       // 目標作成ボタンクリック
       await page.click('[data-testid="create-goal-button"]');
       await expect(page.locator('[data-testid="create-goal-modal"]')).toBeVisible();
       
       // フォーム入力
       await page.selectOption('[data-testid="goal-type-select"]', 'daily_questions');
       await page.fill('[data-testid="goal-value-input"]', '15');
       await page.selectOption('[data-testid="goal-period-select"]', 'daily');
       
       // 目標作成
       await page.click('[data-testid="create-goal-submit"]');
       await expect(page.locator('[data-testid="create-goal-modal"]')).not.toBeVisible();
       
       // 作成した目標が表示されることを確認
       await expect(page.locator('[data-testid="goal-item"]')).toContainText('1日15問解答');
     });
   });
   ```
   - [ ] パフォーマンステストの実装:
   ```typescript
   // tests/performance/dashboard.spec.ts
   import { test, expect } from '@playwright/test';

   test.describe('Dashboard Performance', () => {
     test('loads within performance budget', async ({ page }) => {
       const startTime = Date.now();
       
       await page.goto('/dashboard');
       await page.waitForSelector('[data-testid="overview-cards"]');
       
       const loadTime = Date.now() - startTime;
       expect(loadTime).toBeLessThan(3000); // 3秒以内の読み込み
       
       // Core Web Vitals の測定
       const metrics = await page.evaluate(() => {
         return new Promise((resolve) => {
           new PerformanceObserver((list) => {
             const entries = list.getEntries();
             const metrics = {
               FCP: 0,
               LCP: 0,
               CLS: 0
             };
             
             entries.forEach((entry) => {
               if (entry.name === 'first-contentful-paint') {
                 metrics.FCP = entry.startTime;
               }
               if (entry.entryType === 'largest-contentful-paint') {
                 metrics.LCP = entry.startTime;
               }
             });
             
             resolve(metrics);
           }).observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
         });
       });
       
       expect(metrics.FCP).toBeLessThan(2000); // First Contentful Paint < 2s
       expect(metrics.LCP).toBeLessThan(2500); // Largest Contentful Paint < 2.5s
     });

     test('handles large datasets without performance degradation', async ({ page }) => {
       // 大量データでのテスト（モックデータを使用）
       await page.route('/api/dashboard/trends*', (route) => {
         const largeDataset = Array.from({ length: 365 }, (_, i) => ({
           date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
           questionsAnswered: Math.floor(Math.random() * 50) + 10,
           correctAnswers: Math.floor(Math.random() * 40) + 5,
           accuracy: Math.floor(Math.random() * 40) + 60,
           studyTime: Math.floor(Math.random() * 120) + 30
         }));
         
         route.fulfill({
           json: { data: largeDataset, period: { start: '2023-01-01', end: '2024-01-01' } }
         });
       });
       
       const startTime = Date.now();
       await page.goto('/dashboard');
       await page.waitForSelector('[data-testid="trends-chart"]');
       
       const renderTime = Date.now() - startTime;
       expect(renderTime).toBeLessThan(5000); // 5秒以内でレンダリング完了
       
       // メモリ使用量の確認
       const memoryUsage = await page.evaluate(() => (performance as any).memory?.usedJSHeapSize);
       if (memoryUsage) {
         expect(memoryUsage).toBeLessThan(50 * 1024 * 1024); // 50MB以下
       }
     });

     test('WebSocket performance', async ({ page }) => {
       let latencySum = 0;
       let messageCount = 0;
       
       page.on('websocket', ws => {
         ws.on('framereceived', event => {
           if (event.payload.includes('pong')) {
             const timestamp = JSON.parse(event.payload).timestamp;
             const latency = Date.now() - timestamp;
             latencySum += latency;
             messageCount++;
           }
         });
       });
       
       await page.goto('/dashboard');
       await page.waitForTimeout(10000); // 10秒待機してping/pong測定
       
       if (messageCount > 0) {
         const averageLatency = latencySum / messageCount;
         expect(averageLatency).toBeLessThan(100); // 平均レイテンシ100ms以下
       }
     });
   });
   ```
   - [ ] アクセシビリティテストの実装:
   ```typescript
   // tests/accessibility/dashboard.spec.ts
   import { test, expect } from '@playwright/test';
   import AxeBuilder from '@axe-core/playwright';

   test.describe('Dashboard Accessibility', () => {
     test('meets WCAG 2.1 AA standards', async ({ page }) => {
       await page.goto('/dashboard');
       await page.waitForSelector('[data-testid="overview-cards"]');
       
       const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
       
       expect(accessibilityScanResults.violations).toEqual([]);
     });

     test('keyboard navigation works correctly', async ({ page }) => {
       await page.goto('/dashboard');
       
       // キーボードナビゲーションのテスト
       await page.keyboard.press('Tab');
       let focusedElement = await page.locator(':focus').getAttribute('data-testid');
       expect(focusedElement).toBe('refresh-button');
       
       await page.keyboard.press('Tab');
       focusedElement = await page.locator(':focus').getAttribute('data-testid');
       expect(focusedElement).toBe('settings-button');
       
       // Enterキーでの操作確認
       await page.focus('[data-testid="create-goal-button"]');
       await page.keyboard.press('Enter');
       await expect(page.locator('[data-testid="create-goal-modal"]')).toBeVisible();
     });

     test('screen reader compatibility', async ({ page }) => {
       await page.goto('/dashboard');
       
       // ARIA ラベルの確認
       const overviewSection = page.locator('[data-testid="overview-cards"]');
       await expect(overviewSection).toHaveAttribute('aria-label');
       
       // ヘッダー構造の確認
       const headings = page.locator('h1, h2, h3, h4, h5, h6');
       const headingCount = await headings.count();
       expect(headingCount).toBeGreaterThan(0);
       
       // 各統計カードのアクセシブルな説明
       const statCards = page.locator('[data-testid="stat-card"]');
       const cardCount = await statCards.count();
       
       for (let i = 0; i < cardCount; i++) {
         const card = statCards.nth(i);
         await expect(card).toHaveAttribute('aria-label');
       }
     });

     test('color contrast meets requirements', async ({ page }) => {
       await page.goto('/dashboard');
       
       // 主要な色のコントラスト比をチェック
       const textElements = page.locator('h1, h2, h3, p, span').first();
       const styles = await textElements.evaluate((el) => {
         const computed = window.getComputedStyle(el);
         return {
           color: computed.color,
           backgroundColor: computed.backgroundColor
         };
       });
       
       // コントラスト比の計算は複雑なので、axeツールに委ねる
       const results = await new AxeBuilder({ page })
         .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
         .analyze();
       
       const colorContrastViolations = results.violations.filter(
         v => v.id === 'color-contrast'
       );
       expect(colorContrastViolations).toHaveLength(0);
     });
   });
   ```

### 3. **Refactor Phase - コード改善**
   - [ ] 発見されたバグの修正:
   ```typescript
   // よくある統合バグの修正例

   // Bug Fix 1: WebSocket接続の安定性向上
   const useRealtimeUpdates = (options: UseRealtimeUpdatesOptions = {}) => {
     // 接続リトライロジックの改善
     const [reconnectAttempts, setReconnectAttempts] = useState(0);
     const maxReconnectAttempts = 5;
     
     const connect = useCallback(() => {
       if (reconnectAttempts >= maxReconnectAttempts) {
         console.warn('Max reconnection attempts reached, falling back to polling');
         startPollingFallback();
         return;
       }
       
       // 指数バックオフでリトライ間隔を増加
       const backoffDelay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
       
       setTimeout(() => {
         // 実際の接続処理
         establishConnection();
       }, backoffDelay);
     }, [reconnectAttempts]);
   };

   // Bug Fix 2: メモリリークの修正
   useEffect(() => {
     const intervals = [];
     const timeouts = [];
     
     // インターバルの適切な管理
     const pingInterval = setInterval(() => {
       if (socket?.connected) {
         socket.emit('ping', Date.now());
       }
     }, 30000);
     intervals.push(pingInterval);
     
     return () => {
       // すべてのタイマーをクリーンアップ
       intervals.forEach(clearInterval);
       timeouts.forEach(clearTimeout);
       socket?.disconnect();
     };
   }, [socket]);

   // Bug Fix 3: チャートのレンダリング問題修正
   const TrendsChart: React.FC<TrendsChartProps> = ({ data, loading }) => {
     const [chartReady, setChartReady] = useState(false);
     
     // データが空または不正な場合の適切な処理
     const sanitizedData = useMemo(() => {
       if (!data || !Array.isArray(data)) return [];
       
       return data
         .filter(item => item && typeof item.date === 'string' && !isNaN(item.accuracy))
         .map(item => ({
           ...item,
           date: new Date(item.date).getTime(),
           accuracy: Math.max(0, Math.min(100, item.accuracy)) // 0-100の範囲に制限
         }));
     }, [data]);
     
     // チャートの再レンダリング制御
     useEffect(() => {
       if (sanitizedData.length > 0 && !loading) {
         setChartReady(true);
       }
     }, [sanitizedData, loading]);
     
     if (!chartReady) {
       return <ChartSkeleton />;
     }
     
     return (
       <ErrorBoundary fallback={<ChartErrorFallback />}>
         <LineChart dataset={sanitizedData} /* ... */ />
       </ErrorBoundary>
     );
   };

   // Bug Fix 4: フォームバリデーションの改善
   const validateGoalForm = (formData: CreateGoalRequest): ValidationErrors => {
     const errors: ValidationErrors = {};
     
     // より厳密なバリデーション
     if (!formData.targetType || !['daily_questions', 'weekly_accuracy', 'monthly_time', 'streak_days'].includes(formData.targetType)) {
       errors.targetType = '有効な目標タイプを選択してください';
     }
     
     if (!formData.targetValue || !Number.isInteger(formData.targetValue) || formData.targetValue <= 0) {
       errors.targetValue = '目標値は1以上の整数を入力してください';
     }
     
     // 目標タイプ別の追加バリデーション
     if (formData.targetType === 'weekly_accuracy' && formData.targetValue > 100) {
       errors.targetValue = '正答率は100%以下で設定してください';
     }
     
     if (formData.targetType === 'daily_questions' && formData.targetValue > 100) {
       errors.targetValue = '1日の目標問題数は100問以下で設定してください';
     }
     
     return errors;
   };
   ```
   - [ ] エラーハンドリングの強化:
   ```typescript
   // グローバルエラーハンドリング
   const DashboardErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
     return (
       <ErrorBoundary
         FallbackComponent={DashboardError}
         onError={(error, errorInfo) => {
           console.error('Dashboard Error:', error, errorInfo);
           // エラー報告サービスに送信（例：Sentry）
           if (window.gtag) {
             window.gtag('event', 'exception', {
               description: error.message,
               fatal: false
             });
           }
         }}
       >
         {children}
       </ErrorBoundary>
     );
   };

   const DashboardError: React.FC<{ error: Error; resetErrorBoundary: () => void }> = ({ 
     error, 
     resetErrorBoundary 
   }) => (
     <Box textAlign="center" py={4}>
       <Typography variant="h6" gutterBottom>
         ダッシュボードの読み込み中にエラーが発生しました
       </Typography>
       <Typography variant="body2" color="text.secondary" mb={2}>
         {error.message}
       </Typography>
       <Button variant="contained" onClick={resetErrorBoundary}>
         再読み込み
       </Button>
     </Box>
   );
   ```
   - [ ] パフォーマンス最適化の追加:
   ```typescript
   // 重いコンポーネントの遅延読み込み
   const TrendsChart = React.lazy(() => import('./TrendsChart'));
   const SubjectsHeatmap = React.lazy(() => import('./SubjectsHeatmap'));
   
   const DashboardPage: React.FC = () => {
     return (
       <Suspense fallback={<ChartSkeleton />}>
         <TrendsChart data={trends} loading={loading.trends} />
       </Suspense>
     );
   };

   // 画像の最適化
   const OptimizedImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
     const [imageLoaded, setImageLoaded] = useState(false);
     
     return (
       <Box position="relative">
         {!imageLoaded && <Skeleton variant="rectangular" width="100%" height={200} />}
         <img
           src={src}
           alt={alt}
           loading="lazy"
           onLoad={() => setImageLoaded(true)}
           style={{ display: imageLoaded ? 'block' : 'none' }}
         />
       </Box>
     );
   };
   ```

## 完了条件
- [ ] Red Phase: 包括的な統合テストスイートを作成し、現在の問題点を特定済み
- [ ] Green Phase: 基本的な統合テストが全て通り、主要なバグが修正済み
- [ ] Refactor Phase: パフォーマンス、アクセシビリティ、エラーハンドリングが強化済み
- [ ] 全E2Eテストが通り、クロスブラウザ互換性が確認済み
- [ ] Lighthouse スコア：Performance > 80, Accessibility > 90, Best Practices > 90
- [ ] **注記**: プロダクション環境での最終動作確認が完了済み

## 注意事項
### 実装上の注意
- テストは実際のユーザーシナリオに基づいて作成
- パフォーマンステストは様々なデバイス・ネットワーク環境を考慮
- アクセシビリティテストは実際のスクリーンリーダーでも検証
- バグ修正時は根本原因を特定し、類似問題の予防も考慮

### 影響範囲の制御
- このタスクで変更してはいけない部分: コア機能の仕様と基本設計
- 影響が波及する可能性がある箇所: バグ修正により既存の動作が変更される場合

### 共通化の指針
- 他タスクと共通化すべき処理: エラーハンドリングとテストユーティリティは他の機能でも再利用
- 冗長実装を避けるための確認事項: テストコードの重複を排除し、共通テストヘルパーを活用