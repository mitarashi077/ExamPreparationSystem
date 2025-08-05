# タスク: モバイル最適化・レスポンシブデザイン

計画書: learning-progress-dashboard.md
全体設計書: _overview-learning-progress-dashboard.md
タスク番号: LPD-014
タスクサイズ: 中規模
想定ファイル数: 複数（全ダッシュボードコンポーネント）
想定作業時間: 3時間
依存タスク: LPD-008, LPD-009, LPD-010, LPD-011, LPD-012, LPD-013

## 全体における位置づけ
### プロジェクト全体の目的
学習進捗ダッシュボード機能により、学習者の進捗可視化とモチベーション向上を実現

### このタスクの役割
全ダッシュボードコンポーネントのモバイル最適化を実施し、あらゆるデバイスで快適な学習体験を提供する

### 前タスクとの関連
- 前タスク: LPD-008〜LPD-013 (全ダッシュボードコンポーネント)
- 引き継ぐ情報: 実装済みの全UIコンポーネントとその機能

### 後続タスクへの影響
- 後続タスク: LPD-015 (統合テスト・バグ修正)
- 提供する情報: モバイル最適化されたダッシュボード全体

## 概要
ダッシュボードの全コンポーネントでモバイルファーストのレスポンシブデザインを確実に実装し、タッチ操作の最適化とパフォーマンス向上を図る。

## 対象ファイル
- [ ] 全ダッシュボードコンポーネント（横断的改善）

## 実装手順（TDD: Red-Green-Refactor）

### 1. **Red Phase - 失敗するテストを書く**
   - [ ] モバイルビューポート（320px幅）でのレンダリングテストを作成し、レイアウト崩れを確認
   - [ ] タッチ操作のテストを作成し、タップ領域が不十分であることを確認
   - [ ] モバイルでのパフォーマンステストを作成し、最適化が不十分であることを確認

### 2. **Green Phase - 最小限の実装**
   - [ ] 全コンポーネントの基本レスポンシブ対応:
   ```tsx
   // 共通のレスポンシブ設定フック
   import { useTheme, useMediaQuery } from '@mui/material';

   export const useResponsiveLayout = () => {
     const theme = useTheme();
     
     return {
       isMobile: useMediaQuery(theme.breakpoints.down('md')),
       isTablet: useMediaQuery(theme.breakpoints.between('md', 'lg')),
       isDesktop: useMediaQuery(theme.breakpoints.up('lg')),
       
       // グリッドの列数設定
       getGridCols: (mobile: number, tablet: number, desktop: number) => ({
         xs: mobile,
         md: tablet,
         lg: desktop
       }),
       
       // スペーシング設定
       getSpacing: () => ({
         mobile: 1,
         tablet: 2,
         desktop: 3
       }),
       
       // フォントサイズ設定
       getFontSizes: () => ({
         mobile: {
           h6: '1rem',
           body2: '0.8rem',
           caption: '0.7rem'
         },
         desktop: {
           h6: '1.25rem',
           body2: '0.875rem', 
           caption: '0.75rem'
         }
       })
     };
   };
   ```
   - [ ] DashboardPageのモバイル最適化:
   ```tsx
   // DashboardPage.tsx の更新
   const DashboardPage: React.FC = () => {
     const { isMobile, getGridCols, getSpacing } = useResponsiveLayout();
     const spacing = getSpacing();

     return (
       <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
         {/* モバイル用ヘッダー調整 */}
         <AppBar position="sticky" elevation={1}>
           <Toolbar sx={{ minHeight: isMobile ? 56 : 64 }}>
             <Typography 
               variant={isMobile ? "subtitle1" : "h6"} 
               component="h1" 
               sx={{ flexGrow: 1 }}
             >
               {isMobile ? "進捗" : "学習進捗ダッシュボード"}
             </Typography>
             
             <IconButton
               color="inherit"
               onClick={handleRefresh}
               disabled={isLoading}
               size={isMobile ? "small" : "medium"}
             >
               <RefreshIcon />
             </IconButton>
           </Toolbar>
         </AppBar>

         <Container 
           maxWidth="xl" 
           sx={{ 
             py: isMobile ? spacing.mobile : spacing.desktop,
             px: isMobile ? 1 : 3
           }}
         >
           {/* モバイル向けレイアウト調整 */}
           <Grid container spacing={isMobile ? spacing.mobile : spacing.desktop}>
             <Grid item xs={12} lg={8}>
               {/* モバイルでは概要を縦積み */}
               <Box sx={{ mb: spacing.mobile }}>
                 <OverviewCards 
                   data={overview} 
                   loading={loading.overview} 
                   mobileLayout={isMobile}
                 />
               </Box>

               <Box sx={{ mb: spacing.mobile }}>
                 <TrendsChart 
                   data={trends} 
                   loading={loading.trends}
                   height={isMobile ? 200 : 300}
                   mobileOptimized={isMobile}
                 />
               </Box>
             </Grid>

             <Grid item xs={12} lg={4}>
               {/* サイドバーコンテンツ */}
               <Box sx={{ mb: spacing.mobile }}>
                 <SubjectsHeatmap 
                   data={subjects} 
                   loading={loading.subjects}
                   mobileLayout={isMobile}
                 />
               </Box>
               
               {/* モバイルでは目標と達成記録を横並びに */}
               <Grid container spacing={spacing.mobile}>
                 <Grid item xs={12} sm={isMobile ? 6 : 12}>
                   <AchievementsList 
                     achievements={achievements}
                     loading={loading.achievements}
                     maxDisplay={isMobile ? 3 : 5}
                   />
                 </Grid>
                 <Grid item xs={12} sm={isMobile ? 6 : 12}>
                   <GoalsSection 
                     goals={goals}
                     loading={loading.goals}
                     compactMode={isMobile}
                   />
                 </Grid>
               </Grid>
             </Grid>
           </Grid>
         </Container>
       </Box>
     );
   };
   ```
   - [ ] 各コンポーネントのタッチ最適化:
   ```tsx
   // タッチフレンドリーなボタンサイズ
   const TouchOptimizedButton = styled(Button)(({ theme }) => ({
     minHeight: 44, // iOS推奨サイズ
     minWidth: 44,
     padding: theme.spacing(1.5),
     [theme.breakpoints.down('md')]: {
       minHeight: 48,
       minWidth: 48,
       padding: theme.spacing(2),
       fontSize: '0.875rem'
     }
   }));

   // タッチ最適化されたアイコンボタン
   const TouchOptimizedIconButton = styled(IconButton)(({ theme }) => ({
     padding: theme.spacing(1),
     [theme.breakpoints.down('md')]: {
       padding: theme.spacing(1.5),
       '& .MuiSvgIcon-root': {
         fontSize: '1.25rem'
       }
     }
   }));
   ```

### 3. **Refactor Phase - コード改善**
   - [ ] パフォーマンス最適化の実装:
   ```tsx
   // モバイル用のデータ最適化フック
   const useMobileDataOptimization = () => {
     const [isLowBandwidth, setIsLowBandwidth] = useState(false);
     const [reducedMotion, setReducedMotion] = useState(false);

     useEffect(() => {
       // 接続タイプの検出
       if ('connection' in navigator) {
         const connection = (navigator as any).connection;
         setIsLowBandwidth(
           connection.effectiveType === '2g' || 
           connection.effectiveType === 'slow-2g'
         );
       }

       // モーション設定の検出
       const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
       setReducedMotion(mediaQuery.matches);
       
       const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
       mediaQuery.addListener(handler);
       return () => mediaQuery.removeListener(handler);
     }, []);

     return {
       shouldReduceAnimations: reducedMotion || isLowBandwidth,
       shouldLimitDataFetch: isLowBandwidth,
       updateInterval: isLowBandwidth ? 60000 : 30000,
       chartSampleRate: isLowBandwidth ? 0.5 : 1
     };
   };
   ```
   - [ ] レスポンシブチャート最適化:
   ```tsx
   // TrendsChart のモバイル最適化
   const TrendsChart: React.FC<TrendsChartProps> = ({ 
     data, 
     loading, 
     height, 
     mobileOptimized 
   }) => {
     const { shouldReduceAnimations, chartSampleRate } = useMobileDataOptimization();
     
     const optimizedData = useMemo(() => {
       if (!mobileOptimized || chartSampleRate === 1) return data;
       
       // モバイルでデータをサンプリング
       const sampleRate = Math.ceil(data.length * chartSampleRate);
       return data.filter((_, index) => index % sampleRate === 0);
     }, [data, mobileOptimized, chartSampleRate]);

     const chartConfig = useMemo(() => ({
       height: mobileOptimized ? 200 : height || 300,
       margin: mobileOptimized 
         ? { left: 30, right: 30, top: 20, bottom: 30 }
         : { left: 60, right: 60, top: 50, bottom: 50 },
       animations: !shouldReduceAnimations,
       // モバイルでは簡略化されたツールチップ
       tooltip: mobileOptimized ? {
         format: 'compact'
       } : undefined
     }), [mobileOptimized, height, shouldReduceAnimations]);

     return (
       <Card>
         <CardContent>
           {/* モバイル用の簡略化されたヘッダー */}
           <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
             <Typography 
               variant={mobileOptimized ? "subtitle1" : "h6"} 
               component="h2"
             >
               {mobileOptimized ? "トレンド" : "学習進捗トレンド"}
             </Typography>
             
             <ToggleButtonGroup
               value={period}
               exclusive
               onChange={(_, value) => value && setPeriod(value)}
               size="small"
               sx={{
                 '& .MuiToggleButton-root': {
                   fontSize: mobileOptimized ? '0.7rem' : '0.875rem',
                   padding: mobileOptimized ? '4px 8px' : '6px 12px'
                 }
               }}
             >
               <ToggleButton value="7d">7日</ToggleButton>
               <ToggleButton value="30d">30日</ToggleButton>
               {!mobileOptimized && <ToggleButton value="90d">90日</ToggleButton>}
             </ToggleButtonGroup>
           </Box>

           <LineChart
             dataset={optimizedData}
             height={chartConfig.height}
             margin={chartConfig.margin}
             // その他の設定...
           />
         </CardContent>
       </Card>
     );
   };
   ```
   - [ ] ヒートマップのタッチ最適化:
   ```tsx
   // SubjectsHeatmap のタッチ最適化
   const SubjectsHeatmap: React.FC<SubjectsHeatmapProps> = ({ 
     data, 
     loading, 
     mobileLayout 
   }) => {
     const [touchedItem, setTouchedItem] = useState<string | null>(null);

     const handleTouchStart = (subjectId: string) => {
       setTouchedItem(subjectId);
       // タッチフィードバック
       if ('vibrate' in navigator) {
         navigator.vibrate(10);
       }
     };

     const handleTouchEnd = () => {
       setTimeout(() => setTouchedItem(null), 150);
     };

     return (
       <Card>
         <CardContent>
           <Typography 
             variant={mobileLayout ? "subtitle1" : "h6"} 
             component="h2" 
             gutterBottom
           >
             {mobileLayout ? "分野別" : "分野別習熟度"}
           </Typography>

           <Grid container spacing={mobileLayout ? 0.5 : 1} mb={2}>
             {data.map((subject) => (
               <Grid item xs={6} md={3} key={subject.categoryId}>
                 <Paper
                   sx={{
                     p: mobileLayout ? 1.5 : 2,
                     backgroundColor: getColorForAccuracy(subject.averageAccuracy),
                     color: 'white',
                     cursor: 'pointer',
                     minHeight: mobileLayout ? 60 : 80,
                     display: 'flex',
                     flexDirection: 'column',
                     justifyContent: 'center',
                     alignItems: 'center',
                     textAlign: 'center',
                     transition: 'all 0.2s ease',
                     transform: touchedItem === subject.categoryId ? 'scale(0.95)' : 'scale(1)',
                     boxShadow: touchedItem === subject.categoryId ? 2 : 1,
                     // タッチ領域の確保
                     touchAction: 'manipulation',
                     userSelect: 'none',
                     WebkitTapHighlightColor: 'transparent'
                   }}
                   onTouchStart={() => handleTouchStart(subject.categoryId)}
                   onTouchEnd={handleTouchEnd}
                   onClick={() => onSubjectClick?.(subject)}
                 >
                   <Typography 
                     variant="caption" 
                     fontWeight="bold" 
                     mb={0.5}
                     sx={{ 
                       fontSize: mobileLayout ? '0.65rem' : '0.75rem',
                       lineHeight: 1.2
                     }}
                   >
                     {mobileLayout 
                       ? subject.categoryName.substring(0, 6) + (subject.categoryName.length > 6 ? '...' : '')
                       : subject.categoryName
                     }
                   </Typography>
                   <Typography 
                     variant={mobileLayout ? "body2" : "h6"} 
                     fontWeight="bold"
                   >
                     {Math.round(subject.averageAccuracy)}%
                   </Typography>
                 </Paper>
               </Grid>
             ))}
           </Grid>

           {/* モバイル用の簡略化された凡例 */}
           {mobileLayout ? (
             <Box display="flex" justifyContent="center" gap={1}>
               <Box display="flex" alignItems="center" gap={0.5}>
                 <Box width={12} height={12} bgcolor="success.main" borderRadius={1} />
                 <Typography variant="caption">良</Typography>
               </Box>
               <Box display="flex" alignItems="center" gap={0.5}>
                 <Box width={12} height={12} bgcolor="warning.main" borderRadius={1} />
                 <Typography variant="caption">普</Typography>
               </Box>
               <Box display="flex" alignItems="center" gap={0.5}>
                 <Box width={12} height={12} bgcolor="error.main" borderRadius={1} />
                 <Typography variant="caption">要</Typography>
               </Box>
             </Box>
           ) : (
             <PerformanceLegend />
           )}
         </CardContent>
       </Card>
     );
   };
   ```
   - [ ] PWAサポートの強化:
   ```tsx
   // オフライン対応とキャッシュ戦略
   const usePWAOptimizations = () => {
     const [isOnline, setIsOnline] = useState(navigator.onLine);
     const [installPrompt, setInstallPrompt] = useState<any>(null);

     useEffect(() => {
       const handleOnline = () => setIsOnline(true);
       const handleOffline = () => setIsOnline(false);
       
       window.addEventListener('online', handleOnline);
       window.addEventListener('offline', handleOffline);
       
       // PWAインストールプロンプト
       const handleBeforeInstallPrompt = (e: Event) => {
         e.preventDefault();
         setInstallPrompt(e);
       };
       
       window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

       return () => {
         window.removeEventListener('online', handleOnline);
         window.removeEventListener('offline', handleOffline);
         window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
       };
     }, []);

     const promptInstall = async () => {
       if (installPrompt) {
         installPrompt.prompt();
         const result = await installPrompt.userChoice;
         if (result.outcome === 'accepted') {
           setInstallPrompt(null);
         }
       }
     };

     return {
       isOnline,
       canInstall: !!installPrompt,
       promptInstall
     };
   };
   ```

## 完了条件
- [ ] Red Phase: モバイル最適化の失敗テストを作成し、未最適化状態を確認済み
- [ ] Green Phase: 全コンポーネントが320px幅以上で適切に表示される
- [ ] Refactor Phase: パフォーマンス最適化、タッチ最適化、PWAサポートが実装済み
- [ ] タッチ操作が44px以上のタップ領域で快適に動作することを確認済み
- [ ] 3G回線での読み込み時間が3秒以内であることを確認済み
- [ ] **注記**: 実際のデバイステストは LPD-015 で実施

## 注意事項
### 実装上の注意
- iOS SafariとAndroid Chromeでの挙動差異を考慮した実装
- タッチ操作のフィードバック（視覚・触覚）を適切に実装
- バッテリー消費を考慮したアニメーションとCPU使用量の最適化
- ネットワーク環境に応じた動的な品質調整

### 影響範囲の制御
- このタスクで変更してはいけない部分: 各コンポーネントの基本機能とデータ構造
- 影響が波及する可能性がある箇所: 全ダッシュボードコンポーネント（意図的な最適化）

### 共通化の指針
- 他タスクと共通化すべき処理: レスポンシブフックとモバイル最適化パターンは他の機能でも再利用
- 冗長実装を避けるための確認事項: 全コンポーネントで統一されたモバイル対応パターンを適用