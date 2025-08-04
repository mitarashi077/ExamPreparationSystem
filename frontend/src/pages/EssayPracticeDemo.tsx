import { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  Alert,
  Chip,
  Paper,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  School as SchoolIcon,
  Code as CodeIcon,
  Description as EssayIcon,
  CheckCircle as CheckIcon,
  Timer as TimerIcon,
} from '@mui/icons-material'
import EssayQuestionCard from '../components/EssayQuestionCard'
import { useQuestionStore } from '../stores/useQuestionStore'
import { useAppStore } from '../stores/useAppStore'

// サンプル記述式問題データ
const sampleEssayQuestions = [
  {
    id: 'essay-1',
    content: '組込みシステムにおけるリアルタイム処理の重要性について、以下の観点から説明してください。\n\n1. リアルタイム性の定義\n2. ハードリアルタイムとソフトリアルタイムの違い\n3. 実際の応用例（自動車制御システムなど）\n4. 実装時の考慮事項',
    questionType: 'essay' as const,
    difficulty: 3,
    year: 2024,
    session: '春期',
    categoryId: 'embedded-systems',
    choices: [],
    maxScore: 100,
    sampleAnswer: `# リアルタイム処理の重要性

## 1. リアルタイム性の定義

リアルタイム性とは、システムが**決められた時間内に必ず処理を完了する**ことを保証する特性です。

## 2. ハードリアルタイムとソフトリアルタイムの違い

### ハードリアルタイム
- 期限を絶対に守る必要がある
- 遅延が発生すると**システム全体の故障**を引き起こす
- 例：エアバッグ制御、ブレーキ制御

### ソフトリアルタイム
- 期限を守ることが望ましいが、多少の遅延は許容される
- 遅延によって**品質低下**が起こる
- 例：動画再生、音声通信

## 3. 実際の応用例

\`\`\`c
// 自動車のエンジン制御例
void engine_control_task(void) {
    while(1) {
        sensor_data = read_sensors();
        control_signal = calculate_control(sensor_data);
        output_control_signal(control_signal);
        
        // 1ms以内に処理完了が必要
        delay_until_next_cycle(1); // 1ms周期
    }
}
\`\`\`

## 4. 実装時の考慮事項

- **予測可能なタスクスケジューリング**
- **割り込み処理の最適化**
- **メモリ管理の確定性**
- **優先度設定の適切な設計**`,
    explanation: 'リアルタイム処理は組込みシステムの核心となる概念です。安全性や品質に直結するため、ハードウェアとソフトウェアの両面からの理解が重要です。'
  },
  {
    id: 'essay-2',
    content: 'マイクロコントローラーでのメモリ管理について、以下の点を含めて説明してください。\n\n1. RAMとROMの使い分け\n2. スタックとヒープの管理\n3. メモリリークの防止策\n4. 制約のある環境での最適化手法',
    questionType: 'essay' as const,
    difficulty: 4,
    year: 2024,
    session: '秋期',
    categoryId: 'embedded-programming',
    choices: [],
    maxScore: 80,
    sampleAnswer: `# マイクロコントローラーのメモリ管理

## 1. RAMとROMの使い分け

### ROM（Flash Memory）
- **プログラムコード**の格納
- **定数データ**の保存
- 書き込み回数に制限あり

### RAM
- **変数データ**の一時保存
- **スタック**と**ヒープ**領域
- 電源OFF時にデータ消失

\`\`\`c
// ROM（Flash）に配置
const char message[] = "Hello World";

// RAM（変数）に配置
int sensor_value;
char buffer[256];
\`\`\`

## 2. スタックとヒープの管理

### スタック管理
- **関数呼び出し**と**ローカル変数**
- **LIFO（後入れ先出し）**方式
- サイズが予測可能

### ヒープ管理
- 動的メモリ確保（malloc/free）
- **断片化**の問題
- 組込みでは**避けることが推奨**

## 3. メモリリークの防止策

\`\`\`c
// 悪い例：メモリリーク
void bad_function() {
    char *buffer = malloc(1024);
    // freeを忘れる → メモリリーク
}

// 良い例：適切な管理
void good_function() {
    char *buffer = malloc(1024);
    if (buffer != NULL) {
        // 処理
        free(buffer);
        buffer = NULL;
    }
}
\`\`\`

## 4. 制約のある環境での最適化

- **静的メモリ確保**の使用
- **メモリプール**の実装
- **データ構造の最適化**
- **コンパイル時メモリ配置**の工夫`,
    explanation: 'マイクロコントローラーでは限られたメモリを効率的に使用する必要があります。動的メモリ確保を避け、静的な管理を心がけることが重要です。'
  },
  {
    id: 'essay-3',
    content: '組込みシステムでの割り込み処理について、以下の内容で説明してください。\n\n1. 割り込みの種類と優先度\n2. 割り込みハンドラの実装原則\n3. 再入可能性の問題\n4. パフォーマンスへの影響と対策',
    questionType: 'essay' as const,
    difficulty: 4,
    year: 2023,
    session: '秋期',
    categoryId: 'embedded-systems',
    choices: [],
    maxScore: 90,
    sampleAnswer: `# 組込みシステムでの割り込み処理

## 1. 割り込みの種類と優先度

### 割り込みの種類
- **外部割り込み**：GPIO、タイマー
- **内部割り込み**：ADC完了、UART受信
- **システム割り込み**：Reset、NMI

### 優先度設定
\`\`\`c
// ARM Cortex-M での例
NVIC_SetPriority(TIMER_IRQn, 1);  // 高優先度
NVIC_SetPriority(UART_IRQn, 2);   // 中優先度
NVIC_SetPriority(GPIO_IRQn, 3);   // 低優先度
\`\`\`

## 2. 割り込みハンドラの実装原則

### 基本原則
- **短時間で処理完了**
- **最小限の処理のみ**
- **共有リソースへの注意**

\`\`\`c
// 良い例：短時間の処理
void TIMER_IRQHandler(void) {
    timer_flag = 1;  // フラグ設定のみ
    // メイン処理はメインループで実行
}

// 悪い例：長時間の処理
void BAD_IRQHandler(void) {
    printf("Interrupt occurred\\n");  // 時間がかかる
    complex_calculation();            // 複雑な処理
}
\`\`\`

## 3. 再入可能性の問題

### 問題の例
\`\`\`c
volatile int shared_counter = 0;

void increment_counter() {
    // 非原子的操作 → 問題発生の可能性
    shared_counter++;
}

// 解決策：割り込み禁止
void safe_increment() {
    __disable_irq();
    shared_counter++;
    __enable_irq();
}
\`\`\`

## 4. パフォーマンスへの影響と対策

### 影響
- **レスポンス性の低下**
- **タスクの実行時間増加**
- **システム全体の性能劣化**

### 対策
- **割り込み処理の最適化**
- **優先度の適切な設定**
- **バッファリング機構**の実装
- **遅延実行パターン**の活用`,
    explanation: '割り込み処理は組込みシステムの応答性を決定する重要な要素です。適切な設計により、リアルタイム性と安定性を両立できます。'
  }
]

const EssayPracticeDemo = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isQuestionStarted, setIsQuestionStarted] = useState(false)
  const [completedQuestions, setCompletedQuestions] = useState<Set<number>>(new Set())
  
  const { setCurrentQuestion, resetQuestion } = useQuestionStore()
  const { deviceType } = useAppStore()
  
  const currentQuestion = sampleEssayQuestions[currentQuestionIndex]
  
  useEffect(() => {
    // 初期化時に最初の問題をセット
    if (currentQuestion) {
      setCurrentQuestion(currentQuestion)
    }
  }, [currentQuestion, setCurrentQuestion])
  
  const handleStartQuestion = () => {
    setIsQuestionStarted(true)
    if (currentQuestion) {
      setCurrentQuestion(currentQuestion)
    }
  }
  
  const handleEssaySubmit = async (questionId: string, content: string, timeSpent: number) => {
    try {
      // 実際のAPIコールをシミュレート
      console.log('記述式回答提出:', { questionId, content, timeSpent })
      
      // 完了問題として追加
      setCompletedQuestions(prev => new Set([...prev, currentQuestionIndex]))
      
      // 結果表示のための遅延
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return {
        id: `answer-${questionId}`,
        content,
        timeSpent,
        message: '記述式回答を提出しました'
      }
    } catch (error) {
      console.error('Essay submission error:', error)
      throw error
    }
  }
  
  const handleNextQuestion = () => {
    const nextIndex = (currentQuestionIndex + 1) % sampleEssayQuestions.length
    setCurrentQuestionIndex(nextIndex)
    setIsQuestionStarted(false)
    resetQuestion()
  }
  
  const handleQuestionSelect = (index: number) => {
    setCurrentQuestionIndex(index)
    setIsQuestionStarted(false)
    resetQuestion()
  }
  
  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1: case 2: return 'success'
      case 3: return 'warning'
      case 4: case 5: return 'error'
      default: return 'default'
    }
  }
  
  if (!isQuestionStarted) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Box textAlign="center" mb={4}>
          <EssayIcon 
            sx={{ 
              fontSize: { xs: 48, md: 64 }, 
              color: 'primary.main', 
              mb: 2 
            }} 
          />
          <Typography variant="h4" component="h1" gutterBottom>
            記述式問題エディタ デモ
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" mb={3}>
            情報処理技術者試験の記述式問題（午後Ⅰ・午後Ⅱ対応）を体験してください
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
            <Typography variant="body2" component="div">
              <strong>記述式エディタの特徴：</strong>
              <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
                <li>Markdown形式でのリッチテキスト編集</li>
                <li>コードブロックのシンタックスハイライト</li>
                <li>リアルタイムプレビュー機能</li>
                <li>自動下書き保存（30秒間隔）</li>
                <li>レスポンシブ対応（PC・タブレット・スマートフォン）</li>
                <li>全画面表示モードでの集中編集</li>
              </ul>
            </Typography>
          </Alert>
        </Box>
        
        <Grid container spacing={3}>
          {sampleEssayQuestions.map((question, index) => (
            <Grid item xs={12} md={6} lg={4} key={question.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4,
                  },
                  border: currentQuestionIndex === index ? 2 : 0,
                  borderColor: 'primary.main',
                }}
                onClick={() => handleQuestionSelect(index)}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Chip
                      label={`問題 ${index + 1}`}
                      color={currentQuestionIndex === index ? 'primary' : 'default'}
                      variant={currentQuestionIndex === index ? 'filled' : 'outlined'}
                    />
                    <Box display="flex" alignItems="center" gap={1}>
                      {completedQuestions.has(index) && (
                        <CheckIcon color="success" fontSize="small" />
                      )}
                      <Chip
                        size="small"
                        label={`難易度 ${question.difficulty}`}
                        color={getDifficultyColor(question.difficulty) as any}
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                  
                  <Typography variant="h6" gutterBottom sx={{ 
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: 1.4,
                    height: '4.2em'
                  }}>
                    {question.content.split('\n')[0]}
                  </Typography>
                  
                  <Box display="flex" alignItems="center" gap={1} mt={2}>
                    <SchoolIcon fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      {question.year}年{question.session} • 配点: {question.maxScore}点
                    </Typography>
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                    <Chip
                      icon={<CodeIcon />}
                      label="記述式"
                      size="small"
                      color="secondary"
                      variant="filled"
                    />
                    <Typography variant="caption" color="primary">
                      クリックして選択
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        <Paper elevation={2} sx={{ mt: 4, p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            選択中: 問題 {currentQuestionIndex + 1}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {currentQuestion.content.split('\n')[0]}...
          </Typography>
          
          <Box display="flex" alignItems="center" justifyContent="center" gap={2} mb={3}>
            <Chip 
              icon={<TimerIcon />}
              label="制限時間なし" 
              color="info" 
              variant="outlined" 
            />
            <Chip 
              label={`配点: ${currentQuestion.maxScore}点`}
              color="primary" 
              variant="outlined" 
            />
            <Chip 
              label={`難易度: ${currentQuestion.difficulty}`}
              color={getDifficultyColor(currentQuestion.difficulty) as any}
              variant="outlined" 
            />
          </Box>
          
          <Button
            variant="contained"
            size="large"
            onClick={handleStartQuestion}
            startIcon={<EssayIcon />}
            sx={{ minWidth: 200 }}
          >
            問題を開始
          </Button>
        </Paper>
      </Container>
    )
  }
  
  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Box mb={2}>
        <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="h6">
                問題 {currentQuestionIndex + 1} / {sampleEssayQuestions.length}
              </Typography>
              <Chip 
                label="記述式" 
                color="secondary" 
                variant="filled" 
                size="small"
              />
              <Chip 
                label={`${currentQuestion.maxScore}点`}
                color="primary" 
                variant="outlined" 
                size="small"
              />
            </Box>
            
            <Box display="flex" alignItems="center" gap={1}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setIsQuestionStarted(false)}
              >
                問題選択に戻る
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
      
      <EssayQuestionCard
        question={currentQuestion}
        onSubmit={handleEssaySubmit}
        onNextQuestion={handleNextQuestion}
        showTimer={true}
        showBookmark={true}
        categoryName="情報処理技術者試験"
      />
      
      {/* 操作ヒント（モバイル用） */}
      {isMobile && (
        <Paper elevation={1} sx={{ mt: 2, p: 2, bgcolor: 'background.paper' }}>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            <strong>操作ヒント:</strong>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            • エディタとプレビューをタブで切り替え可能<br/>
            • 全画面ボタンで集中執筆モード<br/>
            • 30秒ごとに自動で下書き保存<br/>
            • Markdownでコードブロックも記述可能
          </Typography>
        </Paper>
      )}
    </Container>
  )
}

export default EssayPracticeDemo