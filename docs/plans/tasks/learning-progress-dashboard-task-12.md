# タスク: 達成記録システムUI

計画書: learning-progress-dashboard.md
全体設計書: _overview-learning-progress-dashboard.md
タスク番号: LPD-012
タスクサイズ: 中規模
想定ファイル数: 2
想定作業時間: 3時間
依存タスク: LPD-011

## 全体における位置づけ
### プロジェクト全体の目的
学習進捗ダッシュボード機能により、学習者の進捗可視化とモチベーション向上を実現

### このタスクの役割
学習者の達成記録（バッジ・アチーブメント）を表示し、リアルタイムで新しい達成を通知することで学習モチベーションを向上させる

### 前タスクとの関連
- 前タスク: LPD-011 (分野別パフォーマンスヒートマップ)
- 引き継ぐ情報: グリッドレイアウトとタッチ対応インタラクション手法

### 後続タスクへの影響
- 後続タスク: LPD-013 (学習目標管理)
- 提供する情報: リスト表示パターンとモーダル・通知システム

## 概要
学習者の達成記録を表示するリストコンポーネントとリアルタイム通知コンポーネントを実装し、学習継続のモチベーション向上を図る。

## 対象ファイル
- [ ] frontend/src/components/dashboard/AchievementsList.tsx
- [ ] frontend/src/components/dashboard/AchievementNotification.tsx

## 実装手順（TDD: Red-Green-Refactor）

### 1. **Red Phase - 失敗するテストを書く**
   - [ ] AchievementsListコンポーネントのレンダリングテストを作成し、存在しないことを確認
   - [ ] AchievementNotificationの表示テストを作成し、未実装であることを確認
   - [ ] リアルタイム通知機能のテストを作成し、動作しないことを確認

### 2. **Green Phase - 最小限の実装**
   - [ ] AchievementsList.tsxに達成記録リストを実装:
   ```tsx
   import React, { useState, useMemo } from 'react';
   import {
     Card,
     CardContent,
     Typography,
     List,
     ListItem,
     ListItemAvatar,
     ListItemText,
     Avatar,
     Box,
     Skeleton,
     Button,
     Dialog,
     DialogTitle,
     DialogContent,
     DialogActions,
     IconButton
   } from '@mui/material';
   import {
     EmojiEvents as TrophyIcon,
     LocalFire as FireIcon,
     School as SchoolIcon,
     Speed as SpeedIcon,
     Star as StarIcon,
     Close as CloseIcon
   } from '@mui/icons-material';
   import { formatDistanceToNow } from 'date-fns';
   import { ja } from 'date-fns/locale';
   import { Achievement } from '../../stores/useDashboardStore';

   interface AchievementsListProps {
     achievements: Achievement[];
     loading?: boolean;
     maxDisplay?: number;
     showViewAll?: boolean;
   }

   const AchievementsList: React.FC<AchievementsListProps> = ({
     achievements,
     loading = false,
     maxDisplay = 5,
     showViewAll = true
   }) => {
     const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
     const [showAll, setShowAll] = useState(false);

     // アイコンマッピング
     const getAchievementIcon = (type: string, iconName: string) => {
       const iconMap: Record<string, React.ReactElement> = {
         trophy: <TrophyIcon />,
         fire: <FireIcon />,
         school: <SchoolIcon />,
         speed: <SpeedIcon />,
         star: <StarIcon />
       };
       return iconMap[iconName] || iconMap.trophy;
     };

     // 表示用達成記録（最新順）
     const displayAchievements = useMemo(() => {
       const sorted = [...achievements].sort(
         (a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime()
       );
       return showAll ? sorted : sorted.slice(0, maxDisplay);
     }, [achievements, maxDisplay, showAll]);

     // サンプルデータ（実際のデータがない場合）
     const sampleAchievements: Achievement[] = [
       {
         id: '1',
         type: 'streak',
         title: '継続学習者',
         description: '7日連続で学習を行いました',
         iconName: 'fire',
         unlockedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
       },
       {
         id: '2',
         type: 'accuracy',
         title: '正確性マスター',
         description: '正答率90%以上を達成しました',
         iconName: 'trophy',
         unlockedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
       },
       {
         id: '3',
         type: 'volume',
         title: '問題解答王',
         description: '100問以上の問題に回答しました',
         iconName: 'star',
         unlockedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString()
       }
     ];

     const displayData = achievements.length > 0 ? displayAchievements : sampleAchievements;

     if (loading) {
       return (
         <Card>
           <CardContent>
             <Skeleton variant="text" width="60%" height={32} />
             {Array.from({ length: 3 }).map((_, i) => (
               <Box key={i} display="flex" alignItems="center" gap={2} mt={2}>
                 <Skeleton variant="circular" width={40} height={40} />
                 <Box flex={1}>
                   <Skeleton variant="text" width="80%" />
                   <Skeleton variant="text" width="60%" />
                 </Box>
               </Box>
             ))}
           </CardContent>
         </Card>
       );
     }

     return (
       <>
         <Card>
           <CardContent>
             <Typography variant="h6" component="h2" gutterBottom>
               最近の達成記録
             </Typography>

             {displayData.length === 0 ? (
               <Box
                 display="flex"
                 flexDirection="column"
                 alignItems="center"
                 justifyContent="center"
                 py={4}
                 color="text.secondary"
               >
                 <TrophyIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                 <Typography variant="body2" textAlign="center">
                   まだ達成記録がありません。<br />
                   学習を続けて最初のバッジを獲得しましょう！
                 </Typography>
               </Box>
             ) : (
               <>
                 <List>
                   {displayData.map((achievement) => (
                     <ListItem
                       key={achievement.id}
                       button
                       onClick={() => setSelectedAchievement(achievement)}
                       sx={{
                         borderRadius: 1,
                         mb: 1,
                         '&:hover': {
                           backgroundColor: 'action.hover'
                         }
                       }}
                     >
                       <ListItemAvatar>
                         <Avatar
                           sx={{
                             bgcolor: 'primary.main',
                             width: 48,
                             height: 48
                           }}
                         >
                           {getAchievementIcon(achievement.type, achievement.iconName)}
                         </Avatar>
                       </ListItemAvatar>
                       <ListItemText
                         primary={
                           <Box display="flex" alignItems="center" gap={1}>
                             <Typography variant="subtitle2" fontWeight="bold">
                               {achievement.title}
                             </Typography>
                             <Box
                               component="span"
                               sx={{
                                 backgroundColor: 'success.main',
                                 color: 'white',
                                 px: 1,
                                 py: 0.5,
                                 borderRadius: 1,
                                 fontSize: '0.7rem'
                               }}
                             >
                               NEW
                             </Box>
                           </Box>
                         }
                         secondary={
                           <Box>
                             <Typography variant="body2" color="text.secondary" mb={0.5}>
                               {achievement.description}
                             </Typography>
                             <Typography variant="caption" color="text.secondary">
                               {formatDistanceToNow(new Date(achievement.unlockedAt), {
                                 addSuffix: true,
                                 locale: ja
                               })}に獲得
                             </Typography>
                           </Box>
                         }
                       />
                     </ListItem>
                   ))}
                 </List>

                 {/* もっと見るボタン */}
                 {showViewAll && achievements.length > maxDisplay && !showAll && (
                   <Box textAlign="center" mt={2}>
                     <Button
                       variant="outlined"
                       size="small"
                       onClick={() => setShowAll(true)}
                     >
                       すべて表示 ({achievements.length}件)
                     </Button>
                   </Box>
                 )}
               </>
             )}
           </CardContent>
         </Card>

         {/* 達成記録詳細モーダル */}
         <AchievementDetailModal
           achievement={selectedAchievement}
           open={!!selectedAchievement}
           onClose={() => setSelectedAchievement(null)}
         />
       </>
     );
   };

   // 達成記録詳細モーダル
   interface AchievementDetailModalProps {
     achievement: Achievement | null;
     open: boolean;
     onClose: () => void;
   }

   const AchievementDetailModal: React.FC<AchievementDetailModalProps> = ({
     achievement,
     open,
     onClose
   }) => {
     if (!achievement) return null;

     const getAchievementIcon = (type: string, iconName: string) => {
       const iconMap: Record<string, React.ReactElement> = {
         trophy: <TrophyIcon />,
         fire: <FireIcon />,
         school: <SchoolIcon />,
         speed: <SpeedIcon />,
         star: <StarIcon />
       };
       return iconMap[iconName] || iconMap.trophy;
     };

     const unlockDate = new Date(achievement.unlockedAt).toLocaleDateString('ja-JP', {
       year: 'numeric',
       month: 'long',
       day: 'numeric'
     });

     return (
       <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
         <DialogTitle>
           <Box display="flex" justifyContent="space-between" alignItems="center">
             <Typography variant="h6">達成記録の詳細</Typography>
             <IconButton onClick={onClose} size="small">
               <CloseIcon />
             </IconButton>
           </Box>
         </DialogTitle>
         <DialogContent>
           <Box textAlign="center" py={2}>
             <Avatar
               sx={{
                 bgcolor: 'primary.main',
                 width: 80,
                 height: 80,
                 mx: 'auto',
                 mb: 2,
                 fontSize: '2rem'
               }}
             >
               {getAchievementIcon(achievement.type, achievement.iconName)}
             </Avatar>
             <Typography variant="h5" gutterBottom fontWeight="bold">
               {achievement.title}
             </Typography>
             <Typography variant="body1" color="text.secondary" mb={2}>
               {achievement.description}
             </Typography>
             <Typography variant="caption" color="text.secondary">
               {unlockDate}に獲得
             </Typography>
           </Box>
         </DialogContent>
         <DialogActions>
           <Button onClick={onClose} variant="contained" fullWidth>
             閉じる
           </Button>
         </DialogActions>
       </Dialog>
     );
   };

   export default AchievementsList;
   ```
   - [ ] AchievementNotification.tsxにリアルタイム通知を実装:
   ```tsx
   import React, { useEffect, useState } from 'react';
   import {
     Snackbar,
     Alert,
     AlertTitle,
     IconButton,
     Box,
     Avatar,
     Typography
   } from '@mui/material';
   import {
     Close as CloseIcon,
     EmojiEvents as EmojiEventsIcon
   } from '@mui/icons-material';
   import { Achievement } from '../../stores/useDashboardStore';

   interface AchievementNotificationProps {
     achievement: Achievement | null;
     onClose: () => void;
     autoHideDuration?: number;
   }

   const AchievementNotification: React.FC<AchievementNotificationProps> = ({
     achievement,
     onClose,
     autoHideDuration = 6000
   }) => {
     const [open, setOpen] = useState(false);

     useEffect(() => {
       if (achievement) {
         setOpen(true);
         
         // 自動非表示タイマー
         const timer = setTimeout(() => {
           setOpen(false);
           setTimeout(onClose, 300); // アニメーション待ち
         }, autoHideDuration);

         return () => clearTimeout(timer);
       }
     }, [achievement, onClose, autoHideDuration]);

     const handleClose = () => {
       setOpen(false);
       setTimeout(onClose, 300);
     };

     if (!achievement) return null;

     return (
       <Snackbar
         open={open}
         anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
         sx={{ 
           zIndex: 2000,
           '& .MuiSnackbarContent-root': {
             padding: 0
           }
         }}
       >
         <Alert
           severity="success"
           variant="filled"
           icon={false}
           sx={{
             minWidth: 320,
             alignItems: 'center',
             backgroundColor: 'primary.main',
             color: 'white'
           }}
           action={
             <IconButton
               color="inherit"
               size="small"
               onClick={handleClose}
               sx={{ color: 'white' }}
             >
               <CloseIcon fontSize="inherit" />
             </IconButton>
           }
         >
           <Box display="flex" alignItems="center" gap={2}>
             <Avatar
               sx={{
                 bgcolor: 'white',
                 color: 'primary.main',
                 width: 40,
                 height: 40
               }}
             >
               <EmojiEventsIcon />
             </Avatar>
             <Box flex={1}>
               <AlertTitle sx={{ mb: 0.5, color: 'white', fontWeight: 'bold' }}>
                 🎉 新しい達成記録！
               </AlertTitle>
               <Typography variant="subtitle2" sx={{ color: 'white', mb: 0.5 }}>
                 <strong>{achievement.title}</strong>
               </Typography>
               <Typography variant="caption" sx={{ color: 'white', opacity: 0.9 }}>
                 {achievement.description}
               </Typography>
             </Box>
           </Box>
         </Alert>
       </Snackbar>
     );
   };

   export default AchievementNotification;
   ```

### 3. **Refactor Phase - コード改善**
   - [ ] 達成記録の種類別アイコンとスタイルを改善:
   ```tsx
   const getAchievementStyle = (type: string) => {
     const styles = {
       streak: { 
         color: '#FF6B35', 
         bgGradient: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
         icon: <FireIcon />
       },
       accuracy: { 
         color: '#4CAF50', 
         bgGradient: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)',
         icon: <TrophyIcon />
       },
       volume: { 
         color: '#2196F3', 
         bgGradient: 'linear-gradient(135deg, #2196F3 0%, #03DAC6 100%)',
         icon: <StarIcon />
       },
       category_master: { 
         color: '#9C27B0', 
         bgGradient: 'linear-gradient(135deg, #9C27B0 0%, #E91E63 100%)',
         icon: <SchoolIcon />
       }
     };
     return styles[type as keyof typeof styles] || styles.accuracy;
   };
   ```
   - [ ] 通知のアニメーション効果を追加:
   ```tsx
   import { useSpring, animated } from 'react-spring';

   const AnimatedAlert = animated(Alert);

   const AchievementNotification: React.FC<AchievementNotificationProps> = ({ ... }) => {
     const slideInAnimation = useSpring({
       from: { transform: 'translateY(-100px)', opacity: 0 },
       to: { 
         transform: open ? 'translateY(0px)' : 'translateY(-100px)', 
         opacity: open ? 1 : 0 
       },
       config: { tension: 280, friction: 30 }
     });

     const pulseAnimation = useSpring({
       from: { transform: 'scale(1)' },
       to: async (next) => {
         await next({ transform: 'scale(1.05)' });
         await next({ transform: 'scale(1)' });
       },
       loop: true,
       config: { duration: 2000 }
     });

     return (
       <Snackbar open={open} /* ... */>
         <AnimatedAlert style={slideInAnimation} /* ... */>
           <Box display="flex" alignItems="center" gap={2}>
             <animated.div style={pulseAnimation}>
               <Avatar /* ... */>
                 <EmojiEventsIcon />
               </Avatar>
             </animated.div>
             {/* コンテンツ */}
           </Box>
         </AnimatedAlert>
       </Snackbar>
     );
   };
   ```
   - [ ] プログレスバー付き達成記録を追加:
   ```tsx
   interface ProgressAchievement extends Achievement {
     progress?: {
       current: number;
       target: number;
       unit: string;
     };
   }

   const AchievementProgressBar: React.FC<{
     progress: ProgressAchievement['progress'];
   }> = ({ progress }) => {
     if (!progress) return null;

     const percentage = Math.min((progress.current / progress.target) * 100, 100);

     return (
       <Box mt={1}>
         <Box display="flex" justifyContent="space-between" mb={0.5}>
           <Typography variant="caption">進捗</Typography>
           <Typography variant="caption">
             {progress.current}/{progress.target} {progress.unit}
           </Typography>
         </Box>
         <LinearProgress 
           variant="determinate" 
           value={percentage} 
           sx={{ height: 6, borderRadius: 3 }}
         />
       </Box>
     );
   };
   ```
   - [ ] 音効果とバイブレーション機能を追加:
   ```tsx
   const playAchievementSound = () => {
     // Web Audio API を使用した音効果
     const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
     const oscillator = audioContext.createOscillator();
     const gainNode = audioContext.createGain();

     oscillator.connect(gainNode);
     gainNode.connect(audioContext.destination);

     oscillator.frequency.setValueAtTime(587.33, audioContext.currentTime); // D5
     oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
     oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5

     gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
     gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

     oscillator.start(audioContext.currentTime);
     oscillator.stop(audioContext.currentTime + 0.5);
   };

   const triggerVibration = () => {
     if ('vibrate' in navigator) {
       navigator.vibrate([100, 50, 100]);
     }
   };

   // 通知表示時に実行
   useEffect(() => {
     if (achievement && open) {
       playAchievementSound();
       triggerVibration();
     }
   }, [achievement, open]);
   ```

## 完了条件
- [ ] Red Phase: 達成記録システムの失敗テストを作成し、未実装状態を確認済み
- [ ] Green Phase: 達成記録リストとリアルタイム通知が基本的に動作する
- [ ] Refactor Phase: アニメーション、音効果、プログレス表示が実装済み
- [ ] モーダル表示で達成記録の詳細が確認できることを確認済み
- [ ] リアルタイム通知が適切なタイミングで表示・非表示されることを確認済み
- [ ] **注記**: 実際の達成判定ロジックはバックエンドとの統合で実装

## 注意事項
### 実装上の注意
- 音効果とバイブレーションはユーザー設定で無効化可能にする
- 通知の表示時間は適切に設定し、長すぎて邪魔にならないよう配慮
- アクセシビリティを考慮し、スクリーンリーダーでも達成内容が理解できるよう実装
- アニメーションは軽量化し、低スペックデバイスでも快適に動作するよう最適化

### 影響範囲の制御
- このタスクで変更してはいけない部分: ダッシュボードページの基本レイアウト
- 影響が波及する可能性がある箇所: LPD-008のプレースホルダー（意図的な置き換え）

### 共通化の指針
- 他タスクと共通化すべき処理: 通知システムは他の機能でも再利用可能
- 冗長実装を避けるための確認事項: アイコンとスタイルのマッピング機能は汎用的に設計