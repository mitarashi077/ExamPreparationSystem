# タスク: 概要統計カード

計画書: learning-progress-dashboard.md
全体設計書: _overview-learning-progress-dashboard.md
タスク番号: LPD-009
タスクサイズ: 小規模
想定ファイル数: 2
想定作業時間: 2時間
依存タスク: LPD-008

## 全体における位置づけ
### プロジェクト全体の目的
学習進捗ダッシュボード機能により、学習者の進捗可視化とモチベーション向上を実現

### このタスクの役割
学習統計の概要を表示するカードコンポーネントを実装し、ユーザーが一目で学習状況を把握できるUIを提供する

### 前タスクとの関連
- 前タスク: LPD-008 (ダッシュボードページレイアウト)
- 引き継ぐ情報: ダッシュボードページの基本レイアウト構造とUIパターン

### 後続タスクへの影響
- 後続タスク: LPD-010 (インタラクティブトレンドチャート)
- 提供する情報: 統計表示の基本UIパターンとアニメーション手法

## 概要
学習統計（総学習時間、総回答数、平均正答率、現在の連続学習日数）を視覚的に表示するカードコンポーネントを実装する。

## 対象ファイル
- [ ] frontend/src/components/dashboard/StatCard.tsx
- [ ] frontend/src/components/dashboard/OverviewCards.tsx

## 実装手順（TDD: Red-Green-Refactor）

### 1. **Red Phase - 失敗するテストを書く**
   - [ ] StatCardコンポーネントのレンダリングテストを作成し、存在しないことを確認
   - [ ] 数値フォーマット機能のテストを作成し、未実装であることを確認
   - [ ] アニメーション機能のテストを作成し、動作しないことを確認

### 2. **Green Phase - 最小限の実装**
   - [ ] StatCard.tsxに基本的なカードコンポーネントを実装:
   ```tsx
   import React, { useMemo } from 'react';
   import {
     Card,
     CardContent,
     Typography,
     Box,
     Skeleton,
     useTheme
   } from '@mui/material';
   import {
     TrendingUp as TrendingUpIcon,
     Schedule as ScheduleIcon,
     Quiz as QuizIcon,
     CheckCircle as CheckCircleIcon,
     LocalFire as LocalFireIcon
   } from '@mui/icons-material';

   export interface StatCardProps {
     title: string;
     value: number | string;
     change?: number; // percentage change
     format: 'number' | 'percentage' | 'time' | 'streak';
     loading?: boolean;
     onClick?: () => void;
     icon?: React.ReactNode;
   }

   const StatCard: React.FC<StatCardProps> = ({
     title,
     value,
     change,
     format,
     loading = false,
     onClick,
     icon
   }) => {
     const theme = useTheme();

     // 値のフォーマット
     const formattedValue = useMemo(() => {
       if (loading) return '--';

       switch (format) {
         case 'percentage':
           return `${value}%`;
         case 'time':
           const hours = Math.floor(Number(value) / 60);
           const minutes = Number(value) % 60;
           if (hours > 0) {
             return `${hours}時間${minutes}分`;
           }
           return `${minutes}分`;
         case 'streak':
           return `${value}日連続`;
         case 'number':
         default:
           return Number(value).toLocaleString();
       }
     }, [value, format, loading]);

     // アイコンの選択
     const defaultIcon = useMemo(() => {
       switch (format) {
         case 'time':
           return <ScheduleIcon />;
         case 'percentage':
           return <CheckCircleIcon />;
         case 'streak':
           return <LocalFireIcon />;
         case 'number':
         default:
           return <QuizIcon />;
       }
     }, [format]);

     // 変化率の色
     const changeColor = useMemo(() => {
       if (change === undefined) return 'text.secondary';
       return change >= 0 ? 'success.main' : 'error.main';
     }, [change]);

     if (loading) {
       return (
         <Card sx={{ height: '100%' }}>
           <CardContent>
             <Box display="flex" alignItems="center" gap={1} mb={2}>
               <Skeleton variant="circular" width={24} height={24} />
               <Skeleton variant="text" width="60%" height={20} />
             </Box>
             <Skeleton variant="text" width="40%" height={32} />
             <Skeleton variant="text" width="30%" height={16} />
           </CardContent>
         </Card>
       );
     }

     return (
       <Card
         sx={{
           height: '100%',
           cursor: onClick ? 'pointer' : 'default',
           transition: 'all 0.2s ease',
           '&:hover': onClick
             ? {
                 transform: 'translateY(-2px)',
                 boxShadow: theme.shadows[4]
               }
             : {}
         }}
         onClick={onClick}
       >
         <CardContent>
           {/* ヘッダー：アイコンとタイトル */}
           <Box display="flex" alignItems="center" gap={1} mb={2}>
             <Box color="primary.main">
               {icon || defaultIcon}
             </Box>
             <Typography variant="subtitle2" color="text.secondary">
               {title}
             </Typography>
           </Box>

           {/* メイン値 */}
           <Typography variant="h4" component="div" fontWeight="bold" mb={1}>
             {formattedValue}
           </Typography>

           {/* 変化率表示 */}
           {change !== undefined && (
             <Box display="flex" alignItems="center" gap={0.5}>
               <TrendingUpIcon
                 sx={{
                   fontSize: 16,
                   color: changeColor,
                   transform: change < 0 ? 'rotate(180deg)' : 'none'
                 }}
               />
               <Typography variant="caption" color={changeColor}>
                 {change >= 0 ? '+' : ''}{change.toFixed(1)}%
               </Typography>
               <Typography variant="caption" color="text.secondary">
                 前期比
               </Typography>
             </Box>
           )}
         </CardContent>
       </Card>
     );
   };

   export default StatCard;
   ```
   - [ ] OverviewCards.tsxにカードコンテナを実装:
   ```tsx
   import React from 'react';
   import { Grid, Box } from '@mui/material';
   import StatCard from './StatCard';
   import { OverviewStats } from '../../stores/useDashboardStore';

   interface OverviewCardsProps {
     data: OverviewStats | null;
     loading?: boolean;
     onCardClick?: (cardType: string) => void;
   }

   const OverviewCards: React.FC<OverviewCardsProps> = ({
     data,
     loading = false,
     onCardClick
   }) => {
     const cards = [
       {
         key: 'studyTime',
         title: '総学習時間',
         value: data?.totalStudyTime || 0,
         change: data?.improvementRate,
         format: 'time' as const,
         onClick: () => onCardClick?.('studyTime')
       },
       {
         key: 'questionsAnswered',
         title: '総回答数',
         value: data?.questionsAnswered || 0,
         format: 'number' as const,
         onClick: () => onCardClick?.('questionsAnswered')
       },
       {
         key: 'averageAccuracy',
         title: '平均正答率',
         value: data?.averageAccuracy || 0,
         change: data?.improvementRate,
         format: 'percentage' as const,
         onClick: () => onCardClick?.('averageAccuracy')
       },
       {
         key: 'currentStreak',
         title: '連続学習日数',
         value: data?.currentStreak || 0,
         format: 'streak' as const,
         onClick: () => onCardClick?.('currentStreak')
       }
     ];

     return (
       <Box>
         <Grid container spacing={3}>
           {cards.map((card) => (
             <Grid item xs={12} sm={6} md={3} key={card.key}>
               <StatCard
                 title={card.title}
                 value={card.value}
                 change={card.change}
                 format={card.format}
                 loading={loading}
                 onClick={card.onClick}
               />
             </Grid>
           ))}
         </Grid>
       </Box>
     );
   };

   export default OverviewCards;
   ```

### 3. **Refactor Phase - コード改善**
   - [ ] アニメーション機能を追加:
   ```tsx
   import { useSpring, animated } from 'react-spring';

   // 数値カウントアニメーション
   const AnimatedValue: React.FC<{ 
     value: number; 
     format: StatCardProps['format'];
     duration?: number;
   }> = ({ value, format, duration = 1000 }) => {
     const { number } = useSpring({
       from: { number: 0 },
       number: value,
       delay: 200,
       config: { duration }
     });

     return (
       <animated.span>
         {number.to(n => {
           const rounded = Math.floor(n);
           switch (format) {
             case 'percentage':
               return `${rounded}%`;
             case 'time':
               const hours = Math.floor(rounded / 60);
               const minutes = rounded % 60;
               return hours > 0 ? `${hours}時間${minutes}分` : `${minutes}分`;
             case 'streak':
               return `${rounded}日連続`;
             default:
               return rounded.toLocaleString();
           }
         })}
       </animated.span>
     );
   };
   ```
   - [ ] ホバー効果とクリック効果を改善:
   ```tsx
   const [isPressed, setIsPressed] = useState(false);

   const cardStyle = {
     height: '100%',
     cursor: onClick ? 'pointer' : 'default',
     transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
     transform: isPressed ? 'scale(0.98)' : 'scale(1)',
     '&:hover': onClick ? {
       transform: 'translateY(-4px)',
       boxShadow: theme.shadows[8]
     } : {}
   };

   const handleMouseDown = () => onClick && setIsPressed(true);
   const handleMouseUp = () => setIsPressed(false);
   const handleMouseLeave = () => setIsPressed(false);
   ```
   - [ ] アクセシビリティを改善:
   ```tsx
   <Card
     sx={cardStyle}
     onClick={onClick}
     onMouseDown={handleMouseDown}
     onMouseUp={handleMouseUp}
     onMouseLeave={handleMouseLeave}
     role={onClick ? "button" : undefined}
     tabIndex={onClick ? 0 : -1}
     onKeyPress={(e) => {
       if (onClick && (e.key === 'Enter' || e.key === ' ')) {
         e.preventDefault();
         onClick();
       }
     }}
     aria-label={`${title}: ${formattedValue}${change !== undefined ? `, 前期比${change}%` : ''}`}
   >
   ```
   - [ ] エラー状態の表示を追加:
   ```tsx
   interface StatCardProps extends BaseStatCardProps {
     error?: string;
   }

   // エラー状態のレンダリング
   if (error) {
     return (
       <Card sx={{ height: '100%' }}>
         <CardContent>
           <Box display="flex" alignItems="center" gap={1} mb={2}>
             <ErrorIcon color="error" />
             <Typography variant="subtitle2" color="error">
               データ取得エラー
             </Typography>
           </Box>
           <Typography variant="caption" color="text.secondary">
             {error}
           </Typography>
         </CardContent>
       </Card>
     );
   }
   ```

## 完了条件
- [ ] Red Phase: 統計カードの失敗テストを作成し、未実装状態を確認済み
- [ ] Green Phase: 基本的な統計カード表示機能が実装され、4つの主要統計が表示される
- [ ] Refactor Phase: アニメーション、ホバー効果、アクセシビリティが実装済み
- [ ] カードがレスポンシブに配置され、モバイルで縦一列、デスクトップで横並びになることを確認済み
- [ ] 数値が適切にフォーマットされて表示されることを確認済み
- [ ] **注記**: クリック時のドリルダウン機能は後続タスクで詳細実装

## 注意事項
### 実装上の注意
- 数値アニメーションはパフォーマンスに配慮し、必要最小限に留める
- カードのクリック領域は十分な大きさを確保（最小44px × 44px）
- 色覚に配慮した色選択（アイコンと色の組み合わせで情報を伝える）
- 長い数値や時間表記でもレイアウトが崩れないよう配慮

### 影響範囲の制御
- このタスクで変更してはいけない部分: ダッシュボードページの基本レイアウト
- 影響が波及する可能性がある箇所: LPD-008のプレースホルダー（意図的な置き換え）

### 共通化の指針
- 他タスクと共通化すべき処理: StatCardコンポーネントは他の統計表示でも再利用可能
- 冗長実装を避けるための確認事項: 数値フォーマット機能は汎用的に設計し、他のコンポーネントでも利用可能