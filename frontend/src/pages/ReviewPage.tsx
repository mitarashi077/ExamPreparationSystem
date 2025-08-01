import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  LinearProgress,
  Alert,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  useTheme,
  useMediaQuery,
  Fab,
  Badge
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  PlayArrow as PlayArrowIcon,
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { useReviewApi } from '../hooks/useReviewApi';
import QuestionCard from '../components/QuestionCard';

interface ReviewQuestion {
  id: string;
  questionId: string;
  question: {
    id: string;
    content: string;
    explanation?: string;
    difficulty: number;
    category: {
      name: string;
    };
    choices: Array<{
      id: string;
      content: string;
      isCorrect: boolean;
    }>;
  };
  masteryLevel: number;
  reviewCount: number;
  nextReview: string;
  wrongCount: number;
  correctStreak: number;
  priority: number;
  isActive: boolean;
}

const ReviewPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [currentView, setCurrentView] = useState<'overview' | 'practice' | 'stats'>('overview');
  const [reviewQuestions, setReviewQuestions] = useState<ReviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [schedule, setSchedule] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStats, setSessionStats] = useState({
    totalItems: 0,
    correctItems: 0,
    startTime: Date.now()
  });
  const [showResults, setShowResults] = useState(false);
  
  const {
    loading,
    error,
    getReviewQuestions,
    getReviewSchedule,
    startReviewSession,
    endReviewSession,
    submitReviewAnswer,
    getReviewStats,
    clearError
  } = useReviewApi();

  // 初期データの読み込み
  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      const scheduleData = await getReviewSchedule();
      setSchedule(scheduleData);
    } catch (err) {
      console.error('スケジュール読み込みエラー:', err);
    }
  };

  // 復習セッションの開始
  const handleStartReview = async (priority: number = 1) => {
    try {
      clearError();
      
      // セッション開始
      const session = await startReviewSession();
      setSessionId(session.sessionId);
      setSessionStats({
        totalItems: 0,
        correctItems: 0,
        startTime: Date.now()
      });

      // 復習問題を取得
      const questionsData = await getReviewQuestions(10, priority);
      if (questionsData.questions && questionsData.questions.length > 0) {
        setReviewQuestions(questionsData.questions);
        setCurrentQuestionIndex(0);
        setCurrentView('practice');
      } else {
        alert('復習する問題がありません。すべて習得済みです！');
      }
    } catch (err) {
      console.error('復習開始エラー:', err);
    }
  };

  // 問題への回答処理
  const handleAnswerSubmit = async (questionId: string, choiceId: string, timeSpent: number) => {
    try {
      const result = await submitReviewAnswer(questionId, choiceId, timeSpent);
      
      // セッション統計の更新
      setSessionStats(prev => ({
        ...prev,
        totalItems: prev.totalItems + 1,
        correctItems: prev.correctItems + (result.isCorrect ? 1 : 0)
      }));

      // 次の問題に進むか、セッション終了
      if (currentQuestionIndex < reviewQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        await handleEndSession();
      }
      
      return result;
    } catch (err) {
      console.error('回答送信エラー:', err);
      throw err;
    }
  };

  // セッション終了処理
  const handleEndSession = async () => {
    if (!sessionId) return;

    try {
      const duration = Math.floor((Date.now() - sessionStats.startTime) / 1000);
      const result = await endReviewSession(
        sessionId,
        duration,
        sessionStats.totalItems,
        sessionStats.correctItems
      );
      
      setShowResults(true);
      setCurrentView('overview');
      setSessionId(null);
      
      // スケジュールを再読み込み
      await loadSchedule();
    } catch (err) {
      console.error('セッション終了エラー:', err);
    }
  };

  // 習熟度レベルの表示
  const getMasteryLevelColor = (level: number) => {
    const colors = ['#f44336', '#ff9800', '#ffeb3b', '#8bc34a', '#4caf50', '#2e7d32'];
    return colors[level] || colors[0];
  };

  const getMasteryLevelText = (level: number) => {
    const texts = ['未習得', '初級', '中級下', '中級上', '上級', '完全習得'];
    return texts[level] || texts[0];
  };

  // 概要画面の表示
  const renderOverview = () => (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          間違い問題復習
        </Typography>

        {schedule && (
          <Box sx={{ mb: 4 }}>
            <Grid container spacing={3}>
              {/* 今日の復習 */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <ScheduleIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6">今日の復習</Typography>
                    </Box>
                    <Typography variant="h3" component="div" color="primary" gutterBottom>
                      {schedule.schedule.today}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      問題
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      推定時間: {schedule.recommendations.estimatedTimeMinutes}分
                    </Typography>
                    
                    {schedule.schedule.today > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Button
                          variant="contained"
                          fullWidth
                          startIcon={<PlayArrowIcon />}
                          onClick={() => handleStartReview(1)}
                          size="large"
                        >
                          復習を開始
                        </Button>
                        {schedule.recommendations.urgentItems > 0 && (
                          <Button
                            variant="outlined"
                            color="error"
                            fullWidth
                            sx={{ mt: 1 }}
                            startIcon={<ErrorIcon />}
                            onClick={() => handleStartReview(4)}
                          >
                            緊急復習 ({schedule.recommendations.urgentItems}問)
                          </Button>
                        )}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* 復習スケジュール */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <TrendingUpIcon color="secondary" sx={{ mr: 1 }} />
                      <Typography variant="h6">復習スケジュール</Typography>
                    </Box>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <Badge badgeContent={schedule.schedule.today} color="primary">
                            <AssignmentIcon />
                          </Badge>
                        </ListItemIcon>
                        <ListItemText 
                          primary="今日" 
                          secondary={`${schedule.schedule.today}問`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Badge badgeContent={schedule.schedule.tomorrow} color="secondary">
                            <AssignmentIcon />
                          </Badge>
                        </ListItemIcon>
                        <ListItemText 
                          primary="明日" 
                          secondary={`${schedule.schedule.tomorrow}問`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Badge badgeContent={schedule.schedule.thisWeek} color="info">
                            <AssignmentIcon />
                          </Badge>
                        </ListItemIcon>
                        <ListItemText 
                          primary="今週中" 
                          secondary={`${schedule.schedule.thisWeek}問`}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* 習熟度分布 */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      習熟度分布
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                      {[0, 1, 2, 3, 4, 5].map(level => {
                        const count = schedule.masteryDistribution[`level${level}`] || 0;
                        return (
                          <Chip
                            key={level}
                            label={`${getMasteryLevelText(level)}: ${count}問`}
                            sx={{ 
                              backgroundColor: getMasteryLevelColor(level),
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          />
                        );
                      })}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* 統計表示ボタン */}
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<AssessmentIcon />}
            onClick={() => setCurrentView('stats')}
          >
            復習統計を見る
          </Button>
        </Box>
      </Box>
    </Container>
  );

  // 復習練習画面の表示
  const renderPractice = () => {
    const currentQuestion = reviewQuestions[currentQuestionIndex];
    if (!currentQuestion) return null;

    return (
      <Container maxWidth="md">
        <Box sx={{ py: 2 }}>
          {/* 進捗表示 */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2">
                問題 {currentQuestionIndex + 1} / {reviewQuestions.length}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  size="small"
                  label={`習熟度: ${getMasteryLevelText(currentQuestion.masteryLevel)}`}
                  sx={{ 
                    backgroundColor: getMasteryLevelColor(currentQuestion.masteryLevel),
                    color: 'white'
                  }}
                />
                <Chip
                  size="small"
                  label={`優先度: ${currentQuestion.priority}`}
                  color={currentQuestion.priority >= 4 ? 'error' : 'default'}
                />
              </Box>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={(currentQuestionIndex / reviewQuestions.length) * 100}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>

          {/* 問題表示 */}
          <QuestionCard
            question={currentQuestion.question}
            onAnswer={handleAnswerSubmit}
            showExplanation={true}
            reviewMode={true}
          />

          {/* セッション統計 */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                セッション統計: {sessionStats.correctItems}/{sessionStats.totalItems} 正解
                {sessionStats.totalItems > 0 && (
                  <span> (正答率: {Math.round((sessionStats.correctItems / sessionStats.totalItems) * 100)}%)</span>
                )}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Container>
    );
  };

  // 統計画面の表示
  const renderStats = () => (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Typography variant="h5" gutterBottom>
          復習統計
        </Typography>
        <Button
          variant="outlined"
          onClick={() => setCurrentView('overview')}
          sx={{ mb: 3 }}
        >
          概要に戻る
        </Button>
        {/* 統計詳細は今後実装 */}
        <Alert severity="info">
          復習統計の詳細表示は今後実装予定です。
        </Alert>
      </Box>
    </Container>
  );

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && <LinearProgress />}

      {/* 結果ダイアログ */}
      <Dialog open={showResults} onClose={() => setShowResults(false)}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircleIcon color="success" sx={{ mr: 1 }} />
            復習セッション完了
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            お疲れさまでした！
          </Typography>
          <Typography variant="body2" color="text.secondary">
            正解数: {sessionStats.correctItems}/{sessionStats.totalItems}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            正答率: {sessionStats.totalItems > 0 ? Math.round((sessionStats.correctItems / sessionStats.totalItems) * 100) : 0}%
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResults(false)}>閉じる</Button>
        </DialogActions>
      </Dialog>

      {/* メインコンテンツ */}
      {currentView === 'overview' && renderOverview()}
      {currentView === 'practice' && renderPractice()}
      {currentView === 'stats' && renderStats()}

      {/* フローティングアクションボタン（モバイル用） */}
      {isMobile && currentView === 'overview' && schedule?.schedule.today > 0 && (
        <Fab
          color="primary"
          aria-label="start review"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => handleStartReview(1)}
        >
          <PlayArrowIcon />
        </Fab>
      )}
    </Box>
  );
};

export default ReviewPage;