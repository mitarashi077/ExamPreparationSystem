# タスク: インタラクティブトレンドチャート

計画書: learning-progress-dashboard.md
全体設計書: _overview-learning-progress-dashboard.md
タスク番号: LPD-010
タスクサイズ: 中規模
想定ファイル数: 1
想定作業時間: 4時間
依存タスク: LPD-009

## 全体における位置づけ
### プロジェクト全体の目的
学習進捗ダッシュボード機能により、学習者の進捗可視化とモチベーション向上を実現

### このタスクの役割
時系列での学習進捗を視覚的に表示するインタラクティブなチャートコンポーネントを実装し、学習トレンドの分析を可能にする

### 前タスクとの関連
- 前タスク: LPD-009 (概要統計カード)
- 引き継ぐ情報: 統計表示の基本UIパターンとアニメーション手法

### 後続タスクへの影響
- 後続タスク: LPD-011 (分野別ヒートマップ)
- 提供する情報: チャートライブラリの使用パターンとインタラクティブ機能の実装方法

## 概要
Material-UI X-Chartsを使用して、学習進捗の時系列変化を表示するインタラクティブなラインチャートを実装する。

## 対象ファイル
- [ ] frontend/src/components/dashboard/TrendsChart.tsx

## 実装手順（TDD: Red-Green-Refactor）

### 1. **Red Phase - 失敗するテストを書く**
   - [ ] TrendsChartコンポーネントのレンダリングテストを作成し、存在しないことを確認
   - [ ] チャートデータ処理のテストを作成し、未実装であることを確認
   - [ ] インタラクティブ機能のテストを作成し、動作しないことを確認

### 2. **Green Phase - 最小限の実装**
   - [ ] TrendsChart.tsxに基本的なチャートコンポーネントを実装:
   ```tsx
   import React, { useState, useMemo } from 'react';
   import {
     Card,
     CardContent,
     Typography,
     Box,
     ToggleButtonGroup,
     ToggleButton,
     Skeleton,
     useTheme,
     useMediaQuery
   } from '@mui/material';
   import { LineChart } from '@mui/x-charts/LineChart';
   import { TrendDataPoint } from '../../stores/useDashboardStore';

   interface TrendsChartProps {
     data: TrendDataPoint[];
     loading?: boolean;
     height?: number;
     title?: string;
   }

   const TrendsChart: React.FC<TrendsChartProps> = ({
     data,
     loading = false,
     height = 300,
     title = '学習進捗トレンド'
   }) => {
     const theme = useTheme();
     const isMobile = useMediaQuery(theme.breakpoints.down('md'));
     
     const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
     const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['accuracy', 'volume']);

     // チャートデータの変換
     const chartData = useMemo(() => {
       if (!data || data.length === 0) return [];

       return data
         .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
         .map(item => ({
           date: new Date(item.date).getTime(),
           正答率: item.accuracy,
           回答数: item.questionsAnswered,
           学習時間: Math.round(item.studyTime / 60), // 分から時間に変換
           dateLabel: new Date(item.date).toLocaleDateString('ja-JP', {
             month: 'short',
             day: 'numeric'
           })
         }));
     }, [data]);

     // レスポンシブな設定
     const chartConfig = useMemo(() => ({
       height: isMobile ? 250 : height,
       margin: isMobile 
         ? { left: 40, right: 40, top: 40, bottom: 40 }
         : { left: 60, right: 60, top: 50, bottom: 50 }
     }), [isMobile, height]);

     if (loading) {
       return (
         <Card>
           <CardContent>
             <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
               <Skeleton variant="text" width="40%" height={32} />
               <Skeleton variant="rectangular" width={200} height={32} />
             </Box>
             <Skeleton variant="rectangular" height={chartConfig.height} />
           </CardContent>
         </Card>
       );
     }

     if (!data || data.length === 0) {
       return (
         <Card>
           <CardContent>
             <Typography variant="h6" gutterBottom>
               {title}
             </Typography>
             <Box 
               display="flex" 
               alignItems="center" 
               justifyContent="center" 
               height={chartConfig.height}
               color="text.secondary"
             >
               <Typography>
                 表示するデータがありません
               </Typography>
             </Box>
           </CardContent>
         </Card>
       );
     }

     return (
       <Card>
         <CardContent>
           {/* ヘッダー */}
           <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
             <Typography variant="h6" component="h2">
               {title}
             </Typography>
             <ToggleButtonGroup
               value={period}
               exclusive
               onChange={(_, value) => value && setPeriod(value)}
               size="small"
             >
               <ToggleButton value="7d">7日</ToggleButton>
               <ToggleButton value="30d">30日</ToggleButton>
               <ToggleButton value="90d">90日</ToggleButton>
             </ToggleButtonGroup>
           </Box>

           {/* チャート */}
           <LineChart
             dataset={chartData}
             xAxis={[{
               dataKey: 'date',
               scaleType: 'time',
               valueFormatter: (date) => new Date(date).toLocaleDateString('ja-JP', {
                 month: 'short',
                 day: 'numeric'
               })
             }]}
             series={[
               {
                 dataKey: '正答率',
                 label: '正答率 (%)',
                 color: theme.palette.primary.main,
                 curve: 'monotoneX'
               },
               {
                 dataKey: '回答数',
                 label: '回答数',
                 color: theme.palette.secondary.main,
                 yAxisKey: 'rightAxis'
               }
             ]}
             yAxis={[
               { 
                 id: 'leftAxis', 
                 min: 0, 
                 max: 100,
                 label: '正答率 (%)'
               },
               { 
                 id: 'rightAxis',
                 label: '回答数'
               }
             ]}
             height={chartConfig.height}
             margin={chartConfig.margin}
             slotProps={{
               legend: {
                 direction: 'row',
                 position: { vertical: 'top', horizontal: 'middle' },
                 padding: 0
               }
             }}
           />
         </CardContent>
       </Card>
     );
   };

   export default TrendsChart;
   ```

### 3. **Refactor Phase - コード改善**
   - [ ] インタラクティブ機能を追加:
   ```tsx
   // メトリクス選択機能
   const [availableMetrics] = useState([
     { key: 'accuracy', label: '正答率', color: theme.palette.primary.main },
     { key: 'volume', label: '回答数', color: theme.palette.secondary.main },
     { key: 'time', label: '学習時間', color: theme.palette.info.main }
   ]);

   const MetricSelector: React.FC = () => (
     <Box mb={2}>
       <Typography variant="subtitle2" gutterBottom>
         表示する指標
       </Typography>
       <ToggleButtonGroup
         value={selectedMetrics}
         onChange={(_, value) => setSelectedMetrics(value)}
         size="small"
         sx={{ flexWrap: 'wrap' }}
       >
         {availableMetrics.map(metric => (
           <ToggleButton key={metric.key} value={metric.key}>
             <Box display="flex" alignItems="center" gap={0.5}>
               <Box
                 width={12}
                 height={12}
                 borderRadius="50%"
                 bgcolor={metric.color}
               />
               {metric.label}
             </Box>
           </ToggleButton>
         ))}
       </ToggleButtonGroup>
     </Box>
   );
   ```
   - [ ] カスタムツールチップを追加:
   ```tsx
   const CustomTooltip: React.FC<{ payload?: any; label?: any; active?: boolean }> = ({
     payload,
     label,
     active
   }) => {
     if (!active || !payload || !payload.length) return null;

     const date = new Date(label).toLocaleDateString('ja-JP', {
       year: 'numeric',
       month: 'long',
       day: 'numeric'
     });

     return (
       <Card sx={{ p: 1, boxShadow: theme.shadows[8] }}>
         <Typography variant="subtitle2" gutterBottom>
           {date}
         </Typography>
         {payload.map((entry: any, index: number) => (
           <Box key={index} display="flex" alignItems="center" gap={1}>
             <Box
               width={8}
               height={8}
               borderRadius="50%"
               bgcolor={entry.color}
             />
             <Typography variant="body2">
               {entry.dataKey}: {entry.value}
               {entry.dataKey === '正答率' && '%'}
               {entry.dataKey === '学習時間' && '時間'}
             </Typography>
           </Box>
         ))}
       </Card>
     );
   };
   ```
   - [ ] ズーム・パン機能を追加:
   ```tsx
   const [zoomLevel, setZoomLevel] = useState(1);
   const [panOffset, setPanOffset] = useState(0);

   const ZoomControls: React.FC = () => (
     <Box display="flex" gap={1} mb={1}>
       <Button
         size="small"
         variant="outlined"
         onClick={() => setZoomLevel(prev => Math.min(prev * 1.5, 5))}
         disabled={zoomLevel >= 5}
       >
         拡大
       </Button>
       <Button
         size="small"
         variant="outlined"
         onClick={() => setZoomLevel(prev => Math.max(prev / 1.5, 1))}
         disabled={zoomLevel <= 1}
       >
         縮小
       </Button>
       <Button
         size="small"
         variant="outlined"
         onClick={() => {
           setZoomLevel(1);
           setPanOffset(0);
         }}
       >
         リセット
       </Button>
     </Box>
   );
   ```
   - [ ] データエクスポート機能を追加:
   ```tsx
   const handleExportData = () => {
     const csvData = data.map(item => ({
       日付: new Date(item.date).toLocaleDateString('ja-JP'),
       正答率: item.accuracy,
       回答数: item.questionsAnswered,
       学習時間: Math.round(item.studyTime / 60)
     }));

     const csv = [
       Object.keys(csvData[0]).join(','),
       ...csvData.map(row => Object.values(row).join(','))
     ].join('\n');

     const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
     const link = document.createElement('a');
     link.href = URL.createObjectURL(blob);
     link.download = `学習進捗_${new Date().toISOString().split('T')[0]}.csv`;
     link.click();
   };

   const ExportButton: React.FC = () => (
     <IconButton
       size="small"
       onClick={handleExportData}
       title="データをCSVで出力"
     >
       <DownloadIcon />
     </IconButton>
   );
   ```
   - [ ] パフォーマンス最適化:
   ```tsx
   // React.memo でコンポーネントを最適化
   export default React.memo(TrendsChart);

   // 大量データでのサンプリング
   const sampledData = useMemo(() => {
     if (data.length <= 100) return data;
     
     const sampleRate = Math.ceil(data.length / 100);
     return data.filter((_, index) => index % sampleRate === 0);
   }, [data]);
   ```

## 完了条件
- [ ] Red Phase: トレンドチャートの失敗テストを作成し、未実装状態を確認済み
- [ ] Green Phase: 基本的なラインチャートが表示され、時系列データが正しく描画される
- [ ] Refactor Phase: インタラクティブ機能、カスタムツールチップ、エクスポート機能が実装済み
- [ ] チャートがモバイルデバイスで適切にレスポンシブ表示されることを確認済み
- [ ] 大量データ（100件以上）でも滑らかに動作することを確認済み
- [ ] **注記**: 期間フィルター機能はストアとの連携でフル実装

## 注意事項
### 実装上の注意
- Material-UI X-Chartsのバージョン互換性を確認し、安定版を使用
- チャートのレンダリングパフォーマンスを考慮し、必要に応じてデータサンプリング
- 色覚に配慮した色選択と、アイコン・パターンでの情報伝達併用
- タッチデバイスでのズーム・パン操作の快適性を確保

### 影響範囲の制御
- このタスクで変更してはいけない部分: ダッシュボードページの基本レイアウト
- 影響が波及する可能性がある箇所: LPD-008のプレースホルダー（意図的な置き換え）

### 共通化の指針
- 他タスクと共通化すべき処理: チャートの基本設定とレスポンシブ対応は他のチャートでも再利用
- 冗長実装を避けるための確認事項: データフォーマット処理とツールチップ機能は汎用化