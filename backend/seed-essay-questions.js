// 記述式問題のシード用スクリプト
const { PrismaClient } = require('@prisma/client');

// Clean DATABASE_URL if it has psql prefix
let cleanUrl = process.env.DATABASE_URL;
if (cleanUrl?.startsWith("psql '") && cleanUrl.endsWith("'")) {
  cleanUrl = cleanUrl.slice(5, -1);
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: cleanUrl
    }
  }
});

const sampleEssayQuestions = [
  {
    content: `組込みシステムにおけるリアルタイム処理の重要性について、以下の観点から説明してください。

1. リアルタイム性の定義
2. ハードリアルタイムとソフトリアルタイムの違い
3. 実際の応用例（自動車制御システムなど）
4. 実装時の考慮事項`,
    explanation: 'リアルタイム処理は組込みシステムの核心となる概念です。安全性や品質に直結するため、ハードウェアとソフトウェアの両面からの理解が重要です。',
    difficulty: 3,
    year: 2024,
    session: '春期',
    questionType: 'essay',
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
- **優先度設定の適切な設計**`
  },
  {
    content: `マイクロコントローラーでのメモリ管理について、以下の点を含めて説明してください。

1. RAMとROMの使い分け
2. スタックとヒープの管理
3. メモリリークの防止策
4. 制約のある環境での最適化手法`,
    explanation: 'マイクロコントローラーでは限られたメモリを効率的に使用する必要があります。動的メモリ確保を避け、静的な管理を心がけることが重要です。',
    difficulty: 4,
    year: 2024,
    session: '秋期',
    questionType: 'essay',
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
- **コンパイル時メモリ配置**の工夫`
  },
  {
    content: `組込みシステムでの割り込み処理について、以下の内容で説明してください。

1. 割り込みの種類と優先度
2. 割り込みハンドラの実装原則
3. 再入可能性の問題
4. パフォーマンスへの影響と対策`,
    explanation: '割り込み処理は組込みシステムの応答性を決定する重要な要素です。適切な設計により、リアルタイム性と安定性を両立できます。',
    difficulty: 4,
    year: 2023,
    session: '秋期',
    questionType: 'essay',
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
- **遅延実行パターン**の活用`
  }
];

async function seedEssayQuestions() {
  try {
    console.log('🌱 Starting essay questions seed...');
    
    await prisma.$connect();
    console.log('✅ Connected to database');
    
    // Get existing categories
    const categories = await prisma.category.findMany();
    console.log(`📊 Found ${categories.length} categories`);
    
    if (categories.length === 0) {
      console.log('❌ No categories found. Creating default categories...');
      
      // Create default categories for essay questions
      await prisma.category.createMany({
        data: [
          {
            id: 'embedded-systems',
            name: 'エンベデッドシステム基礎',
            description: 'エンベデッドシステムの基本概念と設計原則'
          },
          {
            id: 'embedded-programming',
            name: 'エンベデッドプログラミング',
            description: 'C言語を用いたエンベデッドシステム開発'
          },
          {
            id: 'realtime-systems',
            name: 'リアルタイムシステム',
            description: 'リアルタイム処理とスケジューリング'
          }
        ]
      });
      
      console.log('✅ Created default categories');
    }
    
    // Create essay questions
    const createdQuestions = [];
    const categoryIds = ['embedded-systems', 'embedded-programming', 'realtime-systems'];
    
    for (let i = 0; i < sampleEssayQuestions.length; i++) {
      const question = sampleEssayQuestions[i];
      const categoryId = categoryIds[i % categoryIds.length];
      
      const createdQuestion = await prisma.question.create({
        data: {
          ...question,
          categoryId: categoryId
        }
      });
      
      createdQuestions.push(createdQuestion);
      console.log(`✅ Created essay question ${i + 1}: ${createdQuestion.id}`);
    }
    
    await prisma.$disconnect();
    
    console.log(`🎉 Successfully created ${createdQuestions.length} essay questions`);
    return createdQuestions;
    
  } catch (error) {
    console.error('❌ Essay questions seed failed:', error);
    await prisma.$disconnect();
    throw error;
  }
}

// Run the seed function if this script is executed directly
if (require.main === module) {
  seedEssayQuestions()
    .then(() => {
      console.log('✅ Essay questions seed completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Essay questions seed failed:', error);
      process.exit(1);
    });
}

module.exports = { seedEssayQuestions };