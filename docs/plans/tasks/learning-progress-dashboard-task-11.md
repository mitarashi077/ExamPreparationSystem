# タスク: 分野別パフォーマンスヒートマップ

計画書: learning-progress-dashboard.md
全体設計書: _overview-learning-progress-dashboard.md
タスク番号: LPD-011
タスクサイズ: 中規模
想定ファイル数: 1
想定作業時間: 4時間
依存タスク: LPD-010

## 全体における位置づけ
### プロジェクト全体の目的
学習進捗ダッシュボード機能により、学習者の進捗可視化とモチベーション向上を実現

### このタスクの役割
分野別の学習パフォーマンスを色分けで視覚的に表示するヒートマップコンポーネントを実装し、学習者の強み・弱点を把握しやすくする

### 前タスクとの関連
- 前タスク: LPD-010 (インタラクティブトレンドチャート)
- 引き継ぐ情報: チャートライブラリの使用パターンとインタラクティブ機能の実装方法

### 後続タスクへの影響
- 後続タスク: LPD-012 (達成記録システムUI)
- 提供する情報: グリッドレイアウトとタッチ対応インタラクション手法

## 概要
組み込みシステムの各分野（プロセッサ、メモリ、I/O、リアルタイムOS等）における正答率を色分けして表示するヒートマップを実装する。

## 対象ファイル
- [ ] frontend/src/components/dashboard/SubjectsHeatmap.tsx

## 実装手順（TDD: Red-Green-Refactor）

### 1. **Red Phase - 失敗するテストを書く**
   - [ ] SubjectsHeatmapコンポーネントのレンダリングテストを作成し、存在しないことを確認
   - [ ] パフォーマンス色分けのテストを作成し、色計算が未実装であることを確認
   - [ ] クリック・ドリルダウン機能のテストを作成し、動作しないことを確認

### 2. **Green Phase - 最小限の実装**
   - [ ] SubjectsHeatmap.tsxに基本的なヒートマップコンポーネントを実装:
   ```tsx
   import React, { useMemo } from 'react';
   import {
     Card,
     CardContent,
     Typography,
     Grid,
     Paper,
     Box,
     Skeleton,
     useTheme,
     useMediaQuery
   } from '@mui/material';
   import { SubjectPerformance } from '../../stores/useDashboardStore';

   interface SubjectsHeatmapProps {
     data: SubjectPerformance[];
     loading?: boolean;
     onSubjectClick?: (subject: SubjectPerformance) => void;
     title?: string;
   }

   const SubjectsHeatmap: React.FC<SubjectsHeatmapProps> = ({
     data,
     loading = false,
     onSubjectClick,
     title = '分野別習熟度'
   }) => {
     const theme = useTheme();
     const isMobile = useMediaQuery(theme.breakpoints.down('md'));

     // パフォーマンスレベルに応じた色を計算
     const getColorForAccuracy = (accuracy: number) => {
       if (accuracy >= 80) return theme.palette.success.main;
       if (accuracy >= 60) return theme.palette.warning.main;
       if (accuracy >= 40) return theme.palette.error.light;
       return theme.palette.error.main;
     };

     // レスポンシブなグリッド列数
     const gridCols = isMobile ? 2 : 4;

     // サンプルデータ（実際のデータがない場合の表示用）
     const sampleSubjects = [
       { categoryId: '1', categoryName: 'プロセッサ', averageAccuracy: 75, questionsAnswered: 45, lastAnswered: '2024-01-15' },
       { categoryId: '2', categoryName: 'メモリ', averageAccuracy: 82, questionsAnswered: 38, lastAnswered: '2024-01-14' },
       { categoryId: '3', categoryName: 'I/O', averageAccuracy: 68, questionsAnswered: 29, lastAnswered: '2024-01-13' },
       { categoryId: '4', categoryName: 'リアルタイムOS', averageAccuracy: 91, questionsAnswered: 22, lastAnswered: '2024-01-12' },
       { categoryId: '5', categoryName: '開発環境', averageAccuracy: 55, questionsAnswered: 18, lastAnswered: '2024-01-11' },
       { categoryId: '6', categoryName: 'ハードウェア', averageAccuracy: 73, questionsAnswered: 31, lastAnswered: '2024-01-10' },
       { categoryId: '7', categoryName: 'ソフトウェア', averageAccuracy: 87, questionsAnswered: 42, lastAnswered: '2024-01-09' },
       { categoryId: '8', categoryName: 'システム統合', averageAccuracy: 62, questionsAnswered: 26, lastAnswered: '2024-01-08' }
     ];

     const displayData = data.length > 0 ? data : sampleSubjects;

     if (loading) {
       return (
         <Card>
           <CardContent>
             <Skeleton variant="text" width="60%" height={32} />
             <Grid container spacing={1} mt={1}>
               {Array.from({ length: 8 }).map((_, i) => (
                 <Grid item xs={6} md={3} key={i}>
                   <Skeleton variant="rectangular" height={80} />
                 </Grid>
               ))}
             </Grid>
           </CardContent>
         </Card>
       );
     }

     return (
       <Card>
         <CardContent>
           <Typography variant="h6" component="h2" gutterBottom>
             {title}
           </Typography>

           <Grid container spacing={1} mb={2}>
             {displayData.map((subject) => (
               <Grid item xs={6} md={3} key={subject.categoryId}>
                 <Paper
                   sx={{
                     p: 2,
                     backgroundColor: getColorForAccuracy(subject.averageAccuracy),
                     color: 'white',
                     cursor: onSubjectClick ? 'pointer' : 'default',
                     minHeight: 80,
                     display: 'flex',
                     flexDirection: 'column',
                     justifyContent: 'center',
                     alignItems: 'center',
                     textAlign: 'center',
                     transition: 'all 0.2s ease',
                     '&:hover': onSubjectClick ? {
                       opacity: 0.9,
                       transform: 'scale(1.02)',
                       boxShadow: theme.shadows[4]
                     } : {},
                     '&:active': onSubjectClick ? {
                       transform: 'scale(0.98)'
                     } : {}
                   }}
                   onClick={() => onSubjectClick?.(subject)}
                   role={onSubjectClick ? "button" : undefined}
                   tabIndex={onSubjectClick ? 0 : -1}
                   onKeyPress={(e) => {
                     if (onSubjectClick && (e.key === 'Enter' || e.key === ' ')) {
                       e.preventDefault();
                       onSubjectClick(subject);
                     }
                   }}
                   aria-label={`${subject.categoryName}: 正答率${subject.averageAccuracy}%`}
                 >
                   <Typography 
                     variant="caption" 
                     fontWeight="bold" 
                     mb={0.5}
                     sx={{ 
                       fontSize: isMobile ? '0.7rem' : '0.75rem',
                       lineHeight: 1.2
                     }}
                   >
                     {subject.categoryName}
                   </Typography>
                   <Typography 
                     variant="h6" 
                     fontWeight="bold"
                     sx={{ fontSize: isMobile ? '1rem' : '1.25rem' }}
                   >
                     {Math.round(subject.averageAccuracy)}%
                   </Typography>
                   <Typography 
                     variant="caption" 
                     sx={{ 
                       opacity: 0.9,
                       fontSize: '0.65rem'
                     }}
                   >
                     {subject.questionsAnswered}問
                   </Typography>
                 </Paper>
               </Grid>
             ))}
           </Grid>

           {/* 凡例 */}
           <PerformanceLegend />
         </CardContent>
       </Card>
     );
   };

   // 凡例コンポーネント
   const PerformanceLegend: React.FC = () => {
     const theme = useTheme();
     
     const legendItems = [
       { color: theme.palette.success.main, label: '優秀', range: '80%+' },
       { color: theme.palette.warning.main, label: '良好', range: '60-79%' },
       { color: theme.palette.error.light, label: '要改善', range: '40-59%' },
       { color: theme.palette.error.main, label: '要強化', range: '~39%' }
     ];

     return (
       <Box display="flex" justifyContent="center" gap={1} flexWrap="wrap">
         {legendItems.map((item, index) => (
           <Box key={index} display="flex" alignItems="center" gap={0.5}>
             <Box
               width={16}
               height={16}
               bgcolor={item.color}
               borderRadius={1}
             />
             <Typography variant="caption" color="text.secondary">
               {item.label} ({item.range})
             </Typography>
           </Box>
         ))}
       </Box>
     );
   };

   export default SubjectsHeatmap;
   ```

### 3. **Refactor Phase - コード改善**
   - [ ] 詳細情報ツールチップを追加:
   ```tsx
   import { Tooltip } from '@mui/material';

   const SubjectTile: React.FC<{
     subject: SubjectPerformance;
     onClick?: () => void;
   }> = ({ subject, onClick }) => {
     const theme = useTheme();
     const lastAnsweredDate = new Date(subject.lastAnswered).toLocaleDateString('ja-JP');

     return (
       <Tooltip
         title={
           <Box>
             <Typography variant="subtitle2" gutterBottom>
               {subject.categoryName}
             </Typography>
             <Typography variant="caption" display="block">
               正答率: {Math.round(subject.averageAccuracy)}%
             </Typography>
             <Typography variant="caption" display="block">
               回答数: {subject.questionsAnswered}問
             </Typography>
             <Typography variant="caption" display="block">
               最終回答: {lastAnsweredDate}
             </Typography>
           </Box>
         }
         placement="top"
         arrow
       >
         <Paper
           sx={{
             // Paper styling...
           }}
           onClick={onClick}
         >
           {/* Content */}
         </Paper>
       </Tooltip>
     );
   };
   ```
   - [ ] アニメーション効果を追加:
   ```tsx
   import { useSpring, animated } from 'react-spring';

   const AnimatedHeatmapTile: React.FC<{
     subject: SubjectPerformance;
     index: number;
   }> = ({ subject, index }) => {
     const springProps = useSpring({
       from: { opacity: 0, transform: 'scale(0.8)' },
       to: { opacity: 1, transform: 'scale(1)' },
       delay: index * 100, // ずらしアニメーション
       config: { tension: 280, friction: 60 }
     });

     return (
       <animated.div style={springProps}>
         <SubjectTile subject={subject} />
       </animated.div>
     );
   };
   ```
   - [ ] フィルター機能を追加:
   ```tsx
   const [performanceFilter, setPerformanceFilter] = useState<'all' | 'excellent' | 'good' | 'needs-improvement'>('all');

   const filteredData = useMemo(() => {
     switch (performanceFilter) {
       case 'excellent':
         return displayData.filter(s => s.averageAccuracy >= 80);
       case 'good':
         return displayData.filter(s => s.averageAccuracy >= 60 && s.averageAccuracy < 80);
       case 'needs-improvement':
         return displayData.filter(s => s.averageAccuracy < 60);
       default:
         return displayData;
     }
   }, [displayData, performanceFilter]);

   const FilterButtons: React.FC = () => (
     <Box display="flex" gap={1} mb={2} flexWrap="wrap">
       <Button
         size="small"
         variant={performanceFilter === 'all' ? 'contained' : 'outlined'}
         onClick={() => setPerformanceFilter('all')}
       >
         すべて
       </Button>
       <Button
         size="small"
         variant={performanceFilter === 'excellent' ? 'contained' : 'outlined'}
         onClick={() => setPerformanceFilter('excellent')}
         color="success"
       >
         優秀
       </Button>
       <Button
         size="small"
         variant={performanceFilter === 'good' ? 'contained' : 'outlined'}
         onClick={() => setPerformanceFilter('good')}
         color="warning"
       >
         良好
       </Button>
       <Button
         size="small"
         variant={performanceFilter === 'needs-improvement' ? 'contained' : 'outlined'}
         onClick={() => setPerformanceFilter('needs-improvement')}
         color="error"
       >
         要改善
       </Button>
     </Box>
   );
   ```
   - [ ] ソート機能を追加:
   ```tsx
   const [sortBy, setSortBy] = useState<'accuracy' | 'questions' | 'recent'>('accuracy');

   const sortedData = useMemo(() => {
     const sorted = [...filteredData];
     switch (sortBy) {
       case 'accuracy':
         return sorted.sort((a, b) => b.averageAccuracy - a.averageAccuracy);
       case 'questions':
         return sorted.sort((a, b) => b.questionsAnswered - a.questionsAnswered);
       case 'recent':
         return sorted.sort((a, b) => new Date(b.lastAnswered).getTime() - new Date(a.lastAnswered).getTime());
       default:
         return sorted;
     }
   }, [filteredData, sortBy]);

   const SortSelect: React.FC = () => (
     <FormControl size="small" sx={{ minWidth: 120 }}>
       <InputLabel>並び順</InputLabel>
       <Select
         value={sortBy}
         label="並び順"
         onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
       >
         <MenuItem value="accuracy">正答率順</MenuItem>
         <MenuItem value="questions">問題数順</MenuItem>
         <MenuItem value="recent">最新順</MenuItem>
       </Select>
     </FormControl>
   );
   ```
   - [ ] エクスポート機能を追加:
   ```tsx
   const handleExportData = () => {
     const csvData = displayData.map(subject => ({
       分野: subject.categoryName,
       正答率: `${subject.averageAccuracy}%`,
       回答数: `${subject.questionsAnswered}問`,
       最終回答日: new Date(subject.lastAnswered).toLocaleDateString('ja-JP')
     }));

     const csv = [
       Object.keys(csvData[0]).join(','),
       ...csvData.map(row => Object.values(row).join(','))
     ].join('\n');

     const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
     const link = document.createElement('a');
     link.href = URL.createObjectURL(blob);
     link.download = `分野別パフォーマンス_${new Date().toISOString().split('T')[0]}.csv`;
     link.click();
   };
   ```

## 完了条件
- [ ] Red Phase: ヒートマップの失敗テストを作成し、未実装状態を確認済み
- [ ] Green Phase: 分野別パフォーマンスが色分けされて表示され、クリック可能
- [ ] Refactor Phase: ツールチップ、アニメーション、フィルター、ソート機能が実装済み
- [ ] モバイルデバイスで2列、デスクトップで4列のレスポンシブ表示が確認済み
- [ ] 色覚に配慮した色選択と凡例表記が適切に設定されていることを確認済み
- [ ] **注記**: 実際の分野データ連携は backend APIとの統合で実装

## 注意事項
### 実装上の注意
- 色の判別が困難なユーザーのため、数値表示と凡例を必ず併用
- タッチデバイスでのタップ操作を考慮し、十分なタップ領域を確保
- アニメーションはパフォーマンスに配慮し、必要に応じて無効化オプション
- データがない場合のサンプル表示で実装イメージを伝える

### 影響範囲の制御
- このタスクで変更してはいけない部分: ダッシュボードページの基本レイアウト
- 影響が波及する可能性がある箇所: LPD-008のプレースホルダー（意図的な置き換え）

### 共通化の指針
- 他タスクと共通化すべき処理: パフォーマンス色分け機能は他の評価表示でも再利用可能
- 冗長実装を避けるための確認事項: グリッドレイアウトパターンは他のカード表示でも利用