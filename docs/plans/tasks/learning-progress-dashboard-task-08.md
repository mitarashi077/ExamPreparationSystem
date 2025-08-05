# タスク: ダッシュボードページレイアウト

計画書: learning-progress-dashboard.md
全体設計書: _overview-learning-progress-dashboard.md
タスク番号: LPD-008
タスクサイズ: 中規模
想定ファイル数: 1
想定作業時間: 3時間
依存タスク: LPD-005, LPD-006

## 全体における位置づけ
### プロジェクト全体の目的
学習進捗ダッシュボード機能により、学習者の進捗可視化とモチベーション向上を実現

### このタスクの役割
ダッシュボード機能のメインページを実装し、各種コンポーネントを配置するレスポンシブなレイアウト基盤を構築する

### 前タスクとの関連
- 前タスク: LPD-005 (ダッシュボード状態管理), LPD-006 (API クライアント統合)
- 引き継ぐ情報: ダッシュボードストアとAPIクライアント機能

### 後続タスクへの影響
- 後続タスク: LPD-009 (概要統計カード), LPD-010 (インタラクティブトレンドチャート), LPD-011 (分野別ヒートマップ)
- 提供する情報: ダッシュボードの基本レイアウト構造とUIパターン

## 概要
ダッシュボードのメインページコンポーネントを実装し、モバイルファーストのレスポンシブデザインでコンテンツを配置する基盤を構築する。

## 対象ファイル
- [ ] frontend/src/pages/DashboardPage.tsx

## 実装手順（TDD: Red-Green-Refactor）

### 1. **Red Phase - 失敗するテストを書く**
   - [ ] ダッシュボードページのレンダリングテストを作成し、コンポーネントが存在しないことを確認
   - [ ] ルーティング統合テストを作成し、ページが表示されないことを確認
   - [ ] レスポンシブレイアウトテストを作成し、適切なレイアウトが表示されないことを確認

### 2. **Green Phase - 最小限の実装**
   - [ ] DashboardPage.tsxに基本的なページ構造を実装:
   ```tsx
   import React, { useEffect } from 'react';
   import {
     Box,
     Grid,
     Container,
     Typography,
     Alert,
     CircularProgress,
     AppBar,
     Toolbar,
     IconButton,
     Breadcrumbs,
     Link
   } from '@mui/material';
   import {
     Home as HomeIcon,
     Refresh as RefreshIcon,
     Settings as SettingsIcon
   } from '@mui/icons-material';
   import { useDashboardStore } from '../stores/useDashboardStore';
   import { useRealtimeUpdates } from '../hooks/useRealtimeUpdates';

   const DashboardPage: React.FC = () => {
     const {
       overview,
       trends,
       subjects,
       achievements,
       goals,
       loading,
       error,
       fetchOverview,
       fetchTrends,
       fetchSubjects,
       fetchAchievements,
       resetState
     } = useDashboardStore();

     const { connected, connecting, error: wsError } = useRealtimeUpdates({
       enabled: true,
       autoReconnect: true
     });

     // 初期データ取得
     useEffect(() => {
       const loadDashboardData = async () => {
         try {
           await Promise.all([
             fetchOverview('30d'),
             fetchTrends('30d', 'daily'),
             fetchSubjects(),
             fetchAchievements()
           ]);
         } catch (error) {
           console.error('Failed to load dashboard data:', error);
         }
       };

       loadDashboardData();
     }, [fetchOverview, fetchTrends, fetchSubjects, fetchAchievements]);

     // データ再読み込み
     const handleRefresh = () => {
       resetState();
       fetchOverview('30d');
       fetchTrends('30d', 'daily');
       fetchSubjects();
       fetchAchievements();
     };

     // ローディング状態
     const isLoading = loading.overview || loading.trends || loading.subjects || loading.achievements;

     return (
       <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
         {/* ヘッダー */}
         <AppBar position="sticky" elevation={1}>
           <Toolbar>
             <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
               学習進捗ダッシュボード
             </Typography>
             
             <IconButton
               color="inherit"
               onClick={handleRefresh}
               disabled={isLoading}
               aria-label="データを更新"
             >
               <RefreshIcon />
             </IconButton>
             
             <IconButton color="inherit" aria-label="設定">
               <SettingsIcon />
             </IconButton>
           </Toolbar>
         </AppBar>

         <Container maxWidth="xl" sx={{ py: 3 }}>
           {/* パンくずリスト */}
           <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
             <Link
               underline="hover"
               sx={{ display: 'flex', alignItems: 'center' }}
               color="inherit"
               href="/"
             >
               <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
               ホーム
             </Link>
             <Typography
               sx={{ display: 'flex', alignItems: 'center' }}
               color="text.primary"
             >
               ダッシュボード
             </Typography>
           </Breadcrumbs>

           {/* 接続状態インジケーター */}
           <ConnectionStatusIndicator
             connected={connected}
             connecting={connecting}
             error={wsError}
           />

           {/* エラー表示 */}
           {error && (
             <Alert severity="error" sx={{ mb: 2 }} onClose={() => resetState()}>
               データの取得に失敗しました: {error}
             </Alert>
           )}

           {/* メインコンテンツ */}
           {isLoading ? (
             <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
               <CircularProgress size={60} />
               <Typography variant="h6" sx={{ ml: 2 }}>
                 データを読み込み中...
               </Typography>
             </Box>
           ) : (
             <Grid container spacing={3}>
               {/* 左側：メイン統計とチャート */}
               <Grid item xs={12} lg={8}>
                 {/* 概要統計カード - LPD-009 で実装 */}
                 <Box sx={{ mb: 3 }}>
                   <Typography variant="h5" gutterBottom>
                     学習概要
                   </Typography>
                   <Box sx={{ 
                     bgcolor: 'background.paper', 
                     p: 2, 
                     borderRadius: 1,
                     border: '2px dashed',
                     borderColor: 'grey.300',
                     textAlign: 'center'
                   }}>
                     <Typography color="text.secondary">
                       概要統計カード（LPD-009で実装予定）
                     </Typography>
                   </Box>
                 </Box>

                 {/* トレンドチャート - LPD-010 で実装 */}
                 <Box sx={{ mb: 3 }}>
                   <Typography variant="h5" gutterBottom>
                     学習進捗トレンド
                   </Typography>
                   <Box sx={{ 
                     bgcolor: 'background.paper', 
                     p: 2, 
                     borderRadius: 1,
                     border: '2px dashed',
                     borderColor: 'grey.300',
                     textAlign: 'center',
                     minHeight: 300
                   }}>
                     <Typography color="text.secondary">
                       インタラクティブトレンドチャート（LPD-010で実装予定）
                     </Typography>
                   </Box>
                 </Box>
               </Grid>

               {/* 右側：分野別パフォーマンスと達成記録 */}
               <Grid item xs={12} lg={4}>
                 {/* 分野別ヒートマップ - LPD-011 で実装 */}
                 <Box sx={{ mb: 3 }}>
                   <Typography variant="h6" gutterBottom>
                     分野別習熟度
                   </Typography>
                   <Box sx={{ 
                     bgcolor: 'background.paper', 
                     p: 2, 
                     borderRadius: 1,
                     border: '2px dashed',
                     borderColor: 'grey.300',
                     textAlign: 'center',
                     minHeight: 200
                   }}>
                     <Typography color="text.secondary">
                       分野別ヒートマップ（LPD-011で実装予定）
                     </Typography>
                   </Box>
                 </Box>

                 {/* 達成記録 - LPD-012 で実装 */}
                 <Box sx={{ mb: 3 }}>
                   <Typography variant="h6" gutterBottom>
                     達成記録
                   </Typography>
                   <Box sx={{ 
                     bgcolor: 'background.paper', 
                     p: 2, 
                     borderRadius: 1,
                     border: '2px dashed',
                     borderColor: 'grey.300',
                     textAlign: 'center',
                     minHeight: 200
                   }}>
                     <Typography color="text.secondary">
                       達成記録リスト（LPD-012で実装予定）
                     </Typography>
                   </Box>
                 </Box>

                 {/* 学習目標 - LPD-013 で実装 */}
                 <Box>
                   <Typography variant="h6" gutterBottom>
                     学習目標
                   </Typography>
                   <Box sx={{ 
                     bgcolor: 'background.paper', 
                     p: 2, 
                     borderRadius: 1,
                     border: '2px dashed',
                     borderColor: 'grey.300',
                     textAlign: 'center',
                     minHeight: 150
                   }}>
                     <Typography color="text.secondary">
                       学習目標管理（LPD-013で実装予定）
                     </Typography>
                   </Box>
                 </Box>
               </Grid>
             </Grid>
           )}
         </Container>
       </Box>
     );
   };

   export default DashboardPage;
   ```
   - [ ] 接続状態インジケーターコンポーネントを実装:
   ```tsx
   interface ConnectionStatusIndicatorProps {
     connected: boolean;
     connecting: boolean;
     error: string | null;
   }

   const ConnectionStatusIndicator: React.FC<ConnectionStatusIndicatorProps> = ({
     connected,
     connecting,
     error
   }) => {
     if (connecting) {
       return (
         <Alert severity="info" sx={{ mb: 2 }}>
           リアルタイム更新に接続中...
         </Alert>
       );
     }

     if (error) {
       return (
         <Alert severity="warning" sx={{ mb: 2 }}>
           リアルタイム更新が無効です。データは手動更新されます。
         </Alert>
       );
     }

     if (connected) {
       return (
         <Alert severity="success" sx={{ mb: 2 }}>
           ✅ リアルタイム更新が有効です
         </Alert>
       );
     }

     return null;
   };
   ```

### 3. **Refactor Phase - コード改善**
   - [ ] レスポンシブデザインを改善:
   ```tsx
   // モバイル最適化
   const theme = useTheme();
   const isMobile = useMediaQuery(theme.breakpoints.down('md'));

   // レスポンシブなレイアウト調整
   <Grid container spacing={isMobile ? 2 : 3}>
     <Grid item xs={12} lg={8}>
       {/* メインコンテンツ */}
     </Grid>
     <Grid item xs={12} lg={4}>
       {/* サイドバーコンテンツ */}
     </Grid>
   </Grid>
   ```
   - [ ] アクセシビリティを改善:
   ```tsx
   // ARIA ラベルとスクリーンリーダー対応
   <main role="main" aria-label="学習進捗ダッシュボード">
     <section aria-labelledby="overview-heading">
       <Typography id="overview-heading" variant="h5" gutterBottom>
         学習概要
       </Typography>
       {/* 内容 */}
     </section>
     
     <section aria-labelledby="trends-heading">
       <Typography id="trends-heading" variant="h5" gutterBottom>
         学習進捗トレンド
       </Typography>
       {/* 内容 */}
     </section>
   </main>
   ```
   - [ ] パフォーマンス最適化:
   ```tsx
   // React.memo でコンポーネントの最適化
   const DashboardPage = React.memo(() => {
     // コンポーネント実装
   });

   // useMemo でコストが高い計算をメモ化
   const dashboardStats = useMemo(() => {
     if (!overview) return null;
     return {
       totalQuestions: overview.questionsAnswered,
       accuracy: overview.averageAccuracy,
       studyTime: overview.totalStudyTime
     };
   }, [overview]);
   ```
   - [ ] エラーバウンダリを追加:
   ```tsx
   import { ErrorBoundary } from 'react-error-boundary';

   const ErrorFallback = ({ error, resetErrorBoundary }: any) => (
     <Alert severity="error" action={
       <Button color="inherit" size="small" onClick={resetErrorBoundary}>
         再試行
       </Button>
     }>
       ダッシュボードの読み込み中にエラーが発生しました: {error.message}
     </Alert>
   );

   // ページをエラーバウンダリでラップ
   <ErrorBoundary FallbackComponent={ErrorFallback}>
     <DashboardPage />
   </ErrorBoundary>
   ```

## 完了条件
- [ ] Red Phase: ダッシュボードページの失敗テストを作成し、未実装状態を確認済み
- [ ] Green Phase: 基本的なページレイアウトが実装され、プレースホルダーが表示される
- [ ] Refactor Phase: レスポンシブデザイン、アクセシビリティ、パフォーマンス最適化が実装済み
- [ ] ページが320px幅以上のすべてのデバイスで適切に表示されることを確認済み
- [ ] データ取得の初期処理が正常に動作することを確認済み
- [ ] **注記**: 実際のコンポーネント表示は後続タスクで実装

## 注意事項
### 実装上の注意
- モバイルファーストのアプローチで、小さい画面から大きい画面への対応
- プレースホルダーは後続タスクで実装される実際のコンポーネントと置き換え可能な設計
- データ取得エラー時の適切なフォールバック表示
- WebSocket接続状態に応じたUX調整

### 影響範囲の制御
- このタスクで変更してはいけない部分: 既存のページコンポーネントとルーティング
- 影響が波及する可能性がある箇所: アプリケーションのルーティング設定（新しいページ追加）

### 共通化の指針
- 他タスクと共通化すべき処理: レイアウトパターンは他のページでも再利用可能
- 冗長実装を避けるための確認事項: 既存のページレイアウトパターンとの一貫性を保つ