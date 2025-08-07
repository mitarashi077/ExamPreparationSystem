# タスク: 学習目標管理

計画書: learning-progress-dashboard.md
全体設計書: _overview-learning-progress-dashboard.md
タスク番号: LPD-013
タスクサイズ: 中規模
想定ファイル数: 2
想定作業時間: 4時間
依存タスク: LPD-012

## 全体における位置づけ
### プロジェクト全体の目的
学習進捗ダッシュボード機能により、学習者の進捗可視化とモチベーション向上を実現

### このタスクの役割
学習者が目標を設定・管理し、進捗を追跡できる機能を実装することで、計画的な学習を支援し継続的な学習習慣を促進する

### 前タスクとの関連
- 前タスク: LPD-012 (達成記録システムUI)
- 引き継ぐ情報: リスト表示パターンとモーダル・通知システム

### 後続タスクへの影響
- 後続タスク: LPD-014 (モバイル最適化)
- 提供する情報: フォーム処理パターンと目標管理UI構造

## 概要
学習目標の作成、編集、削除、進捗追跡を行うUIコンポーネントを実装し、学習者の目標達成をサポートする機能を提供する。

## 対象ファイル
- [ ] frontend/src/components/dashboard/GoalsSection.tsx
- [ ] frontend/src/components/dashboard/CreateGoalModal.tsx

## 実装手順（TDD: Red-Green-Refactor）

### 1. **Red Phase - 失敗するテストを書く**
   - [ ] GoalsSectionコンポーネントのレンダリングテストを作成し、存在しないことを確認
   - [ ] CreateGoalModalのフォーム機能テストを作成し、未実装であることを確認
   - [ ] 目標進捗計算のテストを作成し、計算機能が動作しないことを確認

### 2. **Green Phase - 最小限の実装**
   - [ ] GoalsSection.tsxに目標管理セクションを実装:
   ```tsx
   import React, { useState } from 'react';
   import {
     Card,
     CardContent,
     Typography,
     Box,
     Button,
     LinearProgress,
     IconButton,
     Chip,
     List,
     ListItem,
     ListItemText,
     ListItemSecondaryAction,
     Skeleton
   } from '@mui/material';
   import {
     Add as AddIcon,
     Edit as EditIcon,
     Delete as DeleteIcon,
     Flag as FlagIcon,
     CheckCircle as CheckCircleIcon
   } from '@mui/icons-material';
   import { StudyGoal } from '../../stores/useDashboardStore';
   import CreateGoalModal from './CreateGoalModal';

   interface GoalsSectionProps {
     goals: StudyGoal[];
     onCreateGoal: (goal: CreateGoalRequest) => Promise<void>;
     onUpdateGoal: (id: string, updates: Partial<StudyGoal>) => Promise<void>;
     onDeleteGoal: (id: string) => Promise<void>;
     loading?: boolean;
   }

   interface CreateGoalRequest {
     targetType: string;
     targetValue: number;
     period: string;
   }

   const GoalsSection: React.FC<GoalsSectionProps> = ({
     goals,
     onCreateGoal,
     onUpdateGoal,
     onDeleteGoal,
     loading = false
   }) => {
     const [createModalOpen, setCreateModalOpen] = useState(false);
     const [editingGoal, setEditingGoal] = useState<StudyGoal | null>(null);

     // アクティブな目標のみ表示
     const activeGoals = goals.filter(goal => goal.isActive);

     // サンプル目標（実際のデータがない場合）
     const sampleGoals: StudyGoal[] = [
       {
         id: '1',
         targetType: 'daily_questions',
         targetValue: 10,
         currentValue: 7,
         period: 'daily',
         isActive: true,
         createdAt: new Date().toISOString()
       },
       {
         id: '2',
         targetType: 'weekly_accuracy',
         targetValue: 80,
         currentValue: 75,
         period: 'weekly',
         isActive: true,
         createdAt: new Date().toISOString()
       }
     ];

     const displayGoals = goals.length > 0 ? activeGoals : sampleGoals;

     if (loading) {
       return (
         <Card>
           <CardContent>
             <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
               <Skeleton variant="text" width="40%" height={32} />
               <Skeleton variant="rectangular" width={100} height={32} />
             </Box>
             {Array.from({ length: 2 }).map((_, i) => (
               <Box key={i} mb={2}>
                 <Skeleton variant="text" width="80%" />
                 <Skeleton variant="rectangular" height={8} />
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
             <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
               <Typography variant="h6" component="h2">
                 学習目標
               </Typography>
               <Button
                 variant="contained"
                 size="small"
                 startIcon={<AddIcon />}
                 onClick={() => setCreateModalOpen(true)}
               >
                 目標設定
               </Button>
             </Box>

             {displayGoals.length === 0 ? (
               <Box
                 display="flex"
                 flexDirection="column"
                 alignItems="center"
                 justifyContent="center"
                 py={4}
                 color="text.secondary"
               >
                 <FlagIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                 <Typography variant="body2" textAlign="center">
                   学習目標を設定して、<br />
                   効率的な学習を始めましょう！
                 </Typography>
               </Box>
             ) : (
               <List>
                 {displayGoals.map(goal => (
                   <GoalCard
                     key={goal.id}
                     goal={goal}
                     onEdit={() => setEditingGoal(goal)}
                     onDelete={() => onDeleteGoal(goal.id)}
                   />
                 ))}
               </List>
             )}
           </CardContent>
         </Card>

         {/* 目標作成モーダル */}
         <CreateGoalModal
           open={createModalOpen}
           onClose={() => setCreateModalOpen(false)}
           onSubmit={onCreateGoal}
         />

         {/* 目標編集モーダル */}
         <EditGoalModal
           goal={editingGoal}
           open={!!editingGoal}
           onClose={() => setEditingGoal(null)}
           onSubmit={(updates) => editingGoal && onUpdateGoal(editingGoal.id, updates)}
         />
       </>
     );
   };

   // 個別目標カードコンポーネント
   interface GoalCardProps {
     goal: StudyGoal;
     onEdit: () => void;
     onDelete: () => void;
   }

   const GoalCard: React.FC<GoalCardProps> = ({ goal, onEdit, onDelete }) => {
     const progress = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
     const isCompleted = progress >= 100;

     // 目標の説明テキスト生成
     const getGoalDescription = (goal: StudyGoal) => {
       switch (goal.targetType) {
         case 'daily_questions':
           return `1日${goal.targetValue}問解答`;
         case 'weekly_accuracy':
           return `週間正答率${goal.targetValue}%以上`;
         case 'monthly_time':
           return `月間学習時間${goal.targetValue}時間`;
         case 'streak_days':
           return `${goal.targetValue}日連続学習`;
         default:
           return `目標値: ${goal.targetValue}`;
       }
     };

     // 単位の取得
     const getUnit = (targetType: string) => {
       switch (targetType) {
         case 'daily_questions':
           return '問';
         case 'weekly_accuracy':
           return '%';
         case 'monthly_time':
           return '時間';
         case 'streak_days':
           return '日';
         default:
           return '';
       }
     };

     return (
       <ListItem
         sx={{
           mb: 2,
           border: 1,
           borderColor: 'divider',
           borderRadius: 1,
           flexDirection: 'column',
           alignItems: 'stretch',
           p: 2
         }}
       >
         <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
           <Box flex={1}>
             <Box display="flex" alignItems="center" gap={1} mb={0.5}>
               <Typography variant="subtitle2" fontWeight="medium">
                 {getGoalDescription(goal)}
               </Typography>
               {isCompleted && (
                 <Chip
                   size="small"
                   icon={<CheckCircleIcon />}
                   label="達成"
                   color="success"
                   variant="filled"
                 />
               )}
             </Box>
             <Typography variant="caption" color="text.secondary">
               期間: {goal.period === 'daily' ? '毎日' : goal.period === 'weekly' ? '毎週' : '毎月'}
             </Typography>
           </Box>

           <Box display="flex" gap={0.5}>
             <IconButton size="small" onClick={onEdit} title="編集">
               <EditIcon fontSize="small" />
             </IconButton>
             <IconButton size="small" onClick={onDelete} color="error" title="削除">
               <DeleteIcon fontSize="small" />
             </IconButton>
           </Box>
         </Box>

         {/* 進捗バー */}
         <Box mb={1}>
           <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
             <Typography variant="body2" color="text.secondary">
               進捗
             </Typography>
             <Typography variant="body2" color="text.secondary">
               {goal.currentValue} / {goal.targetValue} {getUnit(goal.targetType)}
             </Typography>
           </Box>
           <LinearProgress
             variant="determinate"
             value={progress}
             sx={{
               height: 8,
               borderRadius: 4,
               backgroundColor: 'grey.200',
               '& .MuiLinearProgress-bar': {
                 borderRadius: 4,
                 backgroundColor: isCompleted ? 'success.main' : 'primary.main'
               }
             }}
           />
           <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
             <Typography variant="caption" color="text.secondary">
               0%
             </Typography>
             <Typography
               variant="caption"
               color={isCompleted ? 'success.main' : 'primary.main'}
               fontWeight="medium"
             >
               {Math.round(progress)}%
             </Typography>
             <Typography variant="caption" color="text.secondary">
               100%
             </Typography>
           </Box>
         </Box>
       </ListItem>
     );
   };

   export default GoalsSection;
   ```
   - [ ] CreateGoalModal.tsxに目標作成モーダルを実装:
   ```tsx
   import React, { useState } from 'react';
   import {
     Dialog,
     DialogTitle,
     DialogContent,
     DialogActions,
     Button,
     TextField,
     FormControl,
     InputLabel,
     Select,
     MenuItem,
     Box,
     Typography,
     IconButton,
     Alert
   } from '@mui/material';
   import { Close as CloseIcon } from '@mui/icons-material';

   interface CreateGoalModalProps {
     open: boolean;
     onClose: () => void;
     onSubmit: (goal: CreateGoalRequest) => Promise<void>;
   }

   interface CreateGoalRequest {
     targetType: string;
     targetValue: number;
     period: string;
   }

   const CreateGoalModal: React.FC<CreateGoalModalProps> = ({
     open,
     onClose,
     onSubmit
   }) => {
     const [formData, setFormData] = useState<CreateGoalRequest>({
       targetType: 'daily_questions',
       targetValue: 10,
       period: 'daily'
     });
     const [errors, setErrors] = useState<Record<string, string>>({});
     const [submitting, setSubmitting] = useState(false);

     // 目標タイプの選択肢
     const goalTypes = [
       { value: 'daily_questions', label: '1日の問題解答数', unit: '問', defaultValue: 10 },
       { value: 'weekly_accuracy', label: '週間正答率', unit: '%', defaultValue: 80 },
       { value: 'monthly_time', label: '月間学習時間', unit: '時間', defaultValue: 20 },
       { value: 'streak_days', label: '連続学習日数', unit: '日', defaultValue: 7 }
     ];

     // 期間の選択肢
     const periods = [
       { value: 'daily', label: '毎日' },
       { value: 'weekly', label: '毎週' },
       { value: 'monthly', label: '毎月' }
     ];

     // フォームバリデーション
     const validateForm = () => {
       const newErrors: Record<string, string> = {};

       if (!formData.targetType) {
         newErrors.targetType = '目標の種類を選択してください';
       }

       if (!formData.targetValue || formData.targetValue <= 0) {
         newErrors.targetValue = '目標値は1以上の数値を入力してください';
       }

       if (formData.targetType === 'weekly_accuracy' && formData.targetValue > 100) {
         newErrors.targetValue = '正答率は100%以下で設定してください';
       }

       if (!formData.period) {
         newErrors.period = '期間を選択してください';
       }

       setErrors(newErrors);
       return Object.keys(newErrors).length === 0;
     };

     // フォーム送信
     const handleSubmit = async () => {
       if (!validateForm()) return;

       setSubmitting(true);
       try {
         await onSubmit(formData);
         handleClose();
       } catch (error) {
         console.error('Failed to create goal:', error);
         setErrors({ submit: '目標の作成に失敗しました' });
       } finally {
         setSubmitting(false);
       }
     };

     // モーダルを閉じる
     const handleClose = () => {
       setFormData({
         targetType: 'daily_questions',
         targetValue: 10,
         period: 'daily'
       });
       setErrors({});
       setSubmitting(false);
       onClose();
     };

     // 目標タイプ変更時のデフォルト値設定
     const handleGoalTypeChange = (targetType: string) => {
       const goalType = goalTypes.find(type => type.value === targetType);
       setFormData(prev => ({
         ...prev,
         targetType,
         targetValue: goalType?.defaultValue || 10
       }));
     };

     const selectedGoalType = goalTypes.find(type => type.value === formData.targetType);

     return (
       <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
         <DialogTitle>
           <Box display="flex" justifyContent="space-between" alignItems="center">
             <Typography variant="h6">新しい学習目標を設定</Typography>
             <IconButton onClick={handleClose} size="small">
               <CloseIcon />
             </IconButton>
           </Box>
         </DialogTitle>

         <DialogContent>
           {errors.submit && (
             <Alert severity="error" sx={{ mb: 2 }}>
               {errors.submit}
             </Alert>
           )}

           <Box component="form" sx={{ pt: 1 }}>
             {/* 目標の種類 */}
             <FormControl fullWidth margin="normal" error={!!errors.targetType}>
               <InputLabel>目標の種類</InputLabel>
               <Select
                 value={formData.targetType}
                 label="目標の種類"
                 onChange={(e) => handleGoalTypeChange(e.target.value)}
               >
                 {goalTypes.map(type => (
                   <MenuItem key={type.value} value={type.value}>
                     {type.label}
                   </MenuItem>
                 ))}
               </Select>
               {errors.targetType && (
                 <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                   {errors.targetType}
                 </Typography>
               )}
             </FormControl>

             {/* 目標値 */}
             <TextField
               fullWidth
               margin="normal"
               label={`目標値 (${selectedGoalType?.unit})`}
               type="number"
               value={formData.targetValue}
               onChange={(e) => setFormData(prev => ({
                 ...prev,
                 targetValue: parseInt(e.target.value) || 0
               }))}
               error={!!errors.targetValue}
               helperText={errors.targetValue}
               inputProps={{
                 min: 1,
                 max: formData.targetType === 'weekly_accuracy' ? 100 : undefined
               }}
             />

             {/* 期間 */}
             <FormControl fullWidth margin="normal" error={!!errors.period}>
               <InputLabel>期間</InputLabel>
               <Select
                 value={formData.period}
                 label="期間"
                 onChange={(e) => setFormData(prev => ({
                   ...prev,
                   period: e.target.value
                 }))}
               >
                 {periods.map(period => (
                   <MenuItem key={period.value} value={period.value}>
                     {period.label}
                   </MenuItem>
                 ))}
               </Select>
               {errors.period && (
                 <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                   {errors.period}
                 </Typography>
               )}
             </FormControl>

             {/* プレビュー */}
             <Box
               sx={{
                 mt: 2,
                 p: 2,
                 bgcolor: 'grey.50',
                 borderRadius: 1,
                 border: 1,
                 borderColor: 'grey.200'
               }}
             >
               <Typography variant="subtitle2" gutterBottom>
                 プレビュー
               </Typography>
               <Typography variant="body2" color="text.secondary">
                 {selectedGoalType?.label}: {formData.targetValue}{selectedGoalType?.unit} / {periods.find(p => p.value === formData.period)?.label}
               </Typography>
             </Box>
           </Box>
         </DialogContent>

         <DialogActions sx={{ p: 3 }}>
           <Button onClick={handleClose} disabled={submitting}>
             キャンセル
           </Button>
           <Button
             variant="contained"
             onClick={handleSubmit}
             disabled={submitting}
           >
             {submitting ? '作成中...' : '目標を作成'}
           </Button>
         </DialogActions>
       </Dialog>
     );
   };

   // 目標編集モーダル（CreateGoalModalを拡張）
   interface EditGoalModalProps {
     goal: StudyGoal | null;
     open: boolean;
     onClose: () => void;
     onSubmit: (updates: Partial<StudyGoal>) => Promise<void>;
   }

   const EditGoalModal: React.FC<EditGoalModalProps> = ({
     goal,
     open,
     onClose,
     onSubmit
   }) => {
     // 編集用の実装は CreateGoalModal と同様の構造
     // goal の初期値を設定し、更新処理を行う
     return null; // 基本実装のプレースホルダー
   };

   export default CreateGoalModal;
   export { EditGoalModal };
   ```

### 3. **Refactor Phase - コード改善**
   - [ ] 目標の自動進捗更新機能を追加:
   ```tsx
   // 目標進捗の自動計算フック
   const useGoalProgress = (goals: StudyGoal[]) => {
     const { overview, trends } = useDashboardStore();
     
     return useMemo(() => {
       return goals.map(goal => {
         let currentValue = goal.currentValue;
         
         switch (goal.targetType) {
           case 'daily_questions':
             // 今日の回答数を計算
             const today = new Date().toDateString();
             const todayTrend = trends.find(t => 
               new Date(t.date).toDateString() === today
             );
             currentValue = todayTrend?.questionsAnswered || 0;
             break;
             
           case 'weekly_accuracy':
             // 週間正答率を計算
             const weeklyAccuracy = calculateWeeklyAccuracy(trends);
             currentValue = weeklyAccuracy;
             break;
             
           // 他の目標タイプも同様に計算
         }
         
         return { ...goal, currentValue };
       });
     }, [goals, overview, trends]);
   };
   ```
   - [ ] 目標達成時の通知機能を追加:
   ```tsx
   const GoalAchievementNotification: React.FC<{
     achievedGoal: StudyGoal | null;
     onClose: () => void;
   }> = ({ achievedGoal, onClose }) => {
     const [open, setOpen] = useState(false);

     useEffect(() => {
       if (achievedGoal) {
         setOpen(true);
         const timer = setTimeout(() => {
           setOpen(false);
           setTimeout(onClose, 300);
         }, 5000);
         return () => clearTimeout(timer);
       }
     }, [achievedGoal, onClose]);

     return (
       <Snackbar open={open} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
         <Alert severity="success" variant="filled">
           <AlertTitle>🎯 目標達成！</AlertTitle>
           <strong>{getGoalDescription(achievedGoal)}</strong>を達成しました！
         </Alert>
       </Snackbar>
     );
   };
   ```
   - [ ] 目標の推奨設定機能を追加:
   ```tsx
   const RecommendedGoals: React.FC<{
     onSelectGoal: (goal: CreateGoalRequest) => void;
   }> = ({ onSelectGoal }) => {
     const { overview } = useDashboardStore();
     
     const recommendations = useMemo(() => {
       const currentAccuracy = overview?.averageAccuracy || 0;
       const currentQuestions = overview?.questionsAnswered || 0;
       
       return [
         {
           targetType: 'daily_questions',
           targetValue: Math.max(5, Math.ceil(currentQuestions / 30)),
           period: 'daily',
           reason: '現在の学習ペースに基づく推奨値'
         },
         {
           targetType: 'weekly_accuracy',
           targetValue: Math.min(100, currentAccuracy + 10),
           period: 'weekly',
           reason: '現在の正答率より10%向上を目指す'
         }
       ];
     }, [overview]);

     return (
       <Box mt={2}>
         <Typography variant="subtitle2" gutterBottom>
           おすすめの目標設定
         </Typography>
         {recommendations.map((rec, index) => (
           <Button
             key={index}
             variant="outlined"
             size="small"
             onClick={() => onSelectGoal(rec)}
             sx={{ mr: 1, mb: 1 }}
           >
             {getGoalTypeLabel(rec.targetType)}: {rec.targetValue}
           </Button>
         ))}
       </Box>
     );
   };
   ```
   - [ ] 目標の統計とレポート機能を追加:
   ```tsx
   const GoalStatistics: React.FC<{ goals: StudyGoal[] }> = ({ goals }) => {
     const stats = useMemo(() => {
       const totalGoals = goals.length;
       const achievedGoals = goals.filter(g => g.currentValue >= g.targetValue).length;
       const achievementRate = totalGoals > 0 ? (achievedGoals / totalGoals) * 100 : 0;
       
       return {
         totalGoals,
         achievedGoals,
         achievementRate: Math.round(achievementRate),
         inProgress: totalGoals - achievedGoals
       };
     }, [goals]);

     return (
       <Box display="flex" gap={2} mb={2}>
         <Chip label={`総目標数: ${stats.totalGoals}`} variant="outlined" />
         <Chip 
           label={`達成: ${stats.achievedGoals}`} 
           color="success" 
           variant="outlined" 
         />
         <Chip 
           label={`達成率: ${stats.achievementRate}%`} 
           color="primary" 
           variant="outlined" 
         />
       </Box>
     );
   };
   ```

## 完了条件
- [ ] Red Phase: 目標管理システムの失敗テストを作成し、未実装状態を確認済み
- [ ] Green Phase: 目標の作成、表示、進捗追跡の基本機能が動作する
- [ ] Refactor Phase: 自動進捗更新、達成通知、推奨設定、統計機能が実装済み
- [ ] フォームバリデーションが適切に動作し、不正な値での目標作成を防ぐことを確認済み
- [ ] 目標進捗が視覚的に分かりやすく表示されることを確認済み
- [ ] **注記**: 実際の進捗計算はデータソースとの統合で精密化

## 注意事項
### 実装上の注意
- 目標値の設定は現実的な範囲に制限し、ユーザーの挫折を防ぐ
- 進捗の更新頻度は適切に調整し、システム負荷を考慮
- 長期間の目標と短期間の目標のバランスを考慮した設計
- 目標達成時の適切なフィードバックでユーザーモチベーションを維持

### 影響範囲の制御
- このタスクで変更してはいけない部分: ダッシュボードページの基本レイアウト
- 影響が波及する可能性がある箇所: LPD-008のプレースホルダー（意図的な置き換え）

### 共通化の指針
- 他タスクと共通化すべき処理: フォームバリデーション機能は他のフォームでも再利用可能
- 冗長実装を避けるための確認事項: 進捗計算ロジックは他の進捗表示でも活用