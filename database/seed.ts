import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 データベースシードを開始します...')

  // カテゴリの作成（IPAシラバス準拠 + Phase 5専門分野）
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'コンピュータシステム',
        description: 'コンピュータシステム全般の知識',
      },
    }),
    prisma.category.create({
      data: {
        name: 'システム構成要素',
        description: 'システムアーキテクチャとハードウェア',
      },
    }),
    prisma.category.create({
      data: {
        name: 'ソフトウェア',
        description: 'OS、ファームウェア、リアルタイムシステム',
      },
    }),
    prisma.category.create({
      data: {
        name: 'ハードウェア',
        description: 'プロセッサ、メモリ、周辺機器',
      },
    }),
    prisma.category.create({
      data: {
        name: 'ヒューマンインタフェース',
        description: 'ユーザビリティ、アクセシビリティ',
      },
    }),
    prisma.category.create({
      data: {
        name: 'マルチメディア',
        description: '画像、音声、動画処理',
      },
    }),
    prisma.category.create({
      data: {
        name: 'データベース',
        description: 'データベース設計と管理',
      },
    }),
    prisma.category.create({
      data: {
        name: 'ネットワーク',
        description: 'ネットワーク技術と通信プロトコル',
      },
    }),
    prisma.category.create({
      data: {
        name: 'セキュリティ',
        description: '情報セキュリティ対策',
      },
    }),
    prisma.category.create({
      data: {
        name: 'システム開発技術',
        description: 'システム開発手法とプロジェクト管理',
      },
    }),
    // Phase 5: 専門分野対応カテゴリ
    prisma.category.create({
      data: {
        name: '組込みハードウェア設計',
        description: 'マイコン、回路設計、センサー・アクチュエータ技術',
      },
    }),
    prisma.category.create({
      data: {
        name: 'リアルタイムシステム',
        description: 'RTOS、タスク管理、スケジューリング技術',
      },
    }),
    prisma.category.create({
      data: {
        name: '組込みソフトウェア開発',
        description: 'C/C++プログラミング、デバッグ、テスト技術',
      },
    }),
  ])

  // サンプル問題の作成（既存問題 + Phase 5専門問題）
  const sampleQuestions = await Promise.all([
    // 既存問題
    prisma.question.create({
      data: {
        content: 'エンベデッドシステムにおいて、リアルタイム性が重要な理由として、最も適切なものはどれか。',
        explanation: 'リアルタイム性は、決められた時間内に処理を完了することを保証する特性で、安全性や品質に直結します。',
        difficulty: 2,
        year: 2023,
        session: '秋期',
        categoryId: categories[2].id, // ソフトウェア
        choices: {
          create: [
            { content: '処理能力が向上するため', isCorrect: false },
            { content: '消費電力が削減されるため', isCorrect: false },
            { content: '決められた時間内に処理を完了する必要があるため', isCorrect: true },
            { content: 'メモリ使用量が削減されるため', isCorrect: false },
          ],
        },
      },
    }),
    prisma.question.create({
      data: {
        content: 'RTOS（Real-Time Operating System）の主な特徴として、適切でないものはどれか。',
        explanation: 'RTOSは確定的な応答時間を提供するため、タスクスケジューリングが予測可能である必要があります。',
        difficulty: 3,
        year: 2023,
        session: '春期',
        categoryId: categories[2].id, // ソフトウェア
        choices: {
          create: [
            { content: '確定的な応答時間を提供する', isCorrect: false },
            { content: 'プリエンプティブなタスクスケジューリング', isCorrect: false },
            { content: '高いスループットを重視する', isCorrect: true },
            { content: '割り込み処理の高速化', isCorrect: false },
          ],
        },
      },
    }),
    prisma.question.create({
      data: {
        content: 'マイクロコントローラにおけるハーバードアーキテクチャの特徴はどれか。',
        explanation: 'ハーバードアーキテクチャは、プログラムメモリとデータメモリを物理的に分離したアーキテクチャです。',
        difficulty: 2,
        year: 2022,
        session: '秋期',
        categoryId: categories[3].id, // ハードウェア
        choices: {
          create: [
            { content: 'プログラムとデータが同じメモリ空間を共有する', isCorrect: false },
            { content: 'プログラムメモリとデータメモリが物理的に分離されている', isCorrect: true },
            { content: 'キャッシュメモリを必ず搭載している', isCorrect: false },
            { content: '仮想メモリ機能を提供する', isCorrect: false },
          ],
        },
      },
    }),

    // Phase 5: 組込みハードウェア設計問題
    prisma.question.create({
      data: {
        content: 'ARM Cortex-MマイクロコントローラにおけるNVIC（Nested Vectored Interrupt Controller）の機能として、最も適切なものはどれか。',
        explanation: 'NVICは割り込み要求の優先度管理、ネスト処理、ベクタテーブル管理を行う重要なコンポーネントです。',
        difficulty: 3,
        year: 2024,
        session: '春期',
        categoryId: categories[10].id, // 組込みハードウェア設計
        choices: {
          create: [
            { content: 'メモリ管理ユニットの制御', isCorrect: false },
            { content: '割り込み優先度管理とネスト処理', isCorrect: true },
            { content: 'クロック信号の生成と分配', isCorrect: false },
            { content: 'デバッグインターフェースの提供', isCorrect: false },
          ],
        },
      },
    }),
    prisma.question.create({
      data: {
        content: 'A/D変換器のサンプリング定理（ナイキスト定理）について、正しい記述はどれか。',
        explanation: 'サンプリング定理により、信号を正確に復元するには、最高周波数成分の2倍以上のサンプリング周波数が必要です。',
        difficulty: 2,
        year: 2024,
        session: '秋期',
        categoryId: categories[10].id, // 組込みハードウェア設計
        choices: {
          create: [
            { content: 'サンプリング周波数は信号の最高周波数と同じでよい', isCorrect: false },
            { content: 'サンプリング周波数は信号の最高周波数の2倍以上必要', isCorrect: true },
            { content: 'サンプリング周波数は信号の最高周波数の半分でよい', isCorrect: false },
            { content: 'サンプリング周波数は量子化ビット数に依存する', isCorrect: false },
          ],
        },
      },
    }),
    prisma.question.create({
      data: {
        content: 'DMA（Direct Memory Access）コントローラの主な利点として、最も適切なものはどれか。',
        explanation: 'DMAはCPUを介さずにメモリと周辺機器間でデータ転送を行うため、CPUの負荷を軽減できます。',
        difficulty: 2,
        year: 2023,
        session: '春期',
        categoryId: categories[10].id, // 組込みハードウェア設計
        choices: {
          create: [
            { content: 'メモリ容量が増加する', isCorrect: false },
            { content: 'CPUの処理負荷を軽減できる', isCorrect: true },
            { content: '消費電力が削減される', isCorrect: false },
            { content: 'クロック周波数を向上できる', isCorrect: false },
          ],
        },
      },
    }),
    prisma.question.create({
      data: {
        content: 'PWM（Pulse Width Modulation）制御において、デューティ比50%の信号の特徴はどれか。',
        explanation: 'デューティ比50%は、1周期中でHigh状態とLow状態が同じ時間であることを意味します。',
        difficulty: 2,
        year: 2023,
        session: '秋期',
        categoryId: categories[10].id, // 組込みハードウェア設計
        choices: {
          create: [
            { content: '常にHigh状態を維持する', isCorrect: false },
            { content: 'High状態とLow状態の時間が等しい', isCorrect: true },
            { content: 'Low状態の時間がHigh状態の2倍', isCorrect: false },
            { content: '周波数が固定される', isCorrect: false },
          ],
        },
      },
    }),
    prisma.question.create({
      data: {
        content: 'I2C通信における「アクノリッジ（ACK）」信号の役割として、正しいものはどれか。',
        explanation: 'ACK信号は受信側が正常にデータを受信したことを送信側に知らせるための確認信号です。',
        difficulty: 2,
        year: 2024,
        session: '春期',
        categoryId: categories[10].id, // 組込みハードウェア設計
        choices: {
          create: [
            { content: '通信開始の合図', isCorrect: false },
            { content: 'データ受信の確認', isCorrect: true },
            { content: 'エラー発生の通知', isCorrect: false },
            { content: '通信終了の合図', isCorrect: false },
          ],
        },
      },
    }),

    // Phase 5: リアルタイムシステム問題
    prisma.question.create({
      data: {
        content: 'リアルタイムシステムにおけるRate Monotonic Scheduling（RMS）アルゴリズムの特徴はどれか。',
        explanation: 'RMSは周期の短いタスクに高い優先度を割り当てる固定優先度スケジューリングアルゴリズムです。',
        difficulty: 3,
        year: 2024,
        session: '春期',
        categoryId: categories[11].id, // リアルタイムシステム
        choices: {
          create: [
            { content: '実行時間の短いタスクに高い優先度を与える', isCorrect: false },
            { content: '周期の短いタスクに高い優先度を与える', isCorrect: true },
            { content: 'デッドラインの近いタスクに高い優先度を与える', isCorrect: false },
            { content: '優先度を動的に変更する', isCorrect: false },
          ],
        },
      },
    }),
    prisma.question.create({
      data: {
        content: 'セマフォ（Semaphore）を使用した排他制御において、「二進セマフォ」の特徴はどれか。',
        explanation: '二進セマフォは0と1の値のみを取り、ミューテックスとして排他制御に使用されます。',
        difficulty: 2,
        year: 2023,
        session: '秋期',
        categoryId: categories[11].id, // リアルタイムシステム
        choices: {
          create: [
            { content: '複数のリソースを管理できる', isCorrect: false },
            { content: '0と1の値のみを取る', isCorrect: true },
            { content: '優先度継承機能がある', isCorrect: false },
            { content: 'タイムアウト機能が必須', isCorrect: false },
          ],
        },
      },
    }),
    prisma.question.create({
      data: {
        content: 'RTOSにおけるタスク間通信で、メッセージキューの利点として最も適切なものはどれか。',
        explanation: 'メッセージキューは非同期通信を可能にし、送信側と受信側のタイミングを分離できます。',
        difficulty: 2,
        year: 2024,
        session: '秋期',
        categoryId: categories[11].id, // リアルタイムシステム
        choices: {
          create: [
            { content: 'メモリ使用量が最小になる', isCorrect: false },
            { content: '非同期通信が可能になる', isCorrect: true },
            { content: '処理速度が最も高速', isCorrect: false },
            { content: 'エラー処理が不要になる', isCorrect: false },
          ],
        },
      },
    }),
    prisma.question.create({
      data: {
        content: '優先度逆転問題を解決する手法として、最も効果的なものはどれか。',
        explanation: '優先度継承は低優先度タスクが高優先度タスクのリソースを保持している間、一時的に優先度を継承する手法です。',
        difficulty: 3,
        year: 2023,
        session: '春期',
        categoryId: categories[11].id, // リアルタイムシステム
        choices: {
          create: [
            { content: 'タイムスライシングの導入', isCorrect: false },
            { content: '優先度継承プロトコル', isCorrect: true },
            { content: 'ラウンドロビンスケジューリング', isCorrect: false },
            { content: 'デッドラインモノトニック', isCorrect: false },
          ],
        },
      },
    }),

    // Phase 5: リアルタイムシステム分野 - 追加問題（Task 5.1.2）
    prisma.question.create({
      data: {
        content: 'EDF（Earliest Deadline First）スケジューリングアルゴリズムの特徴として、正しいものはどれか。',
        explanation: 'EDFは動的優先度スケジューリングで、デッドラインが最も近いタスクに最高優先度を与える最適なアルゴリズムです。',
        difficulty: 3,
        year: 2024,
        session: '春期',
        categoryId: categories[11].id, // リアルタイムシステム
        choices: {
          create: [
            { content: '固定優先度を使用する', isCorrect: false },
            { content: 'デッドラインが最も近いタスクに最高優先度を与える', isCorrect: true },
            { content: '実行時間の短いタスクを優先する', isCorrect: false },
            { content: '周期の長いタスクを優先する', isCorrect: false },
          ],
        },
      },
    }),
    prisma.question.create({
      data: {
        content: 'RTOSにおけるミューテックス（Mutex）の特徴として、適切でないものはどれか。',
        explanation: 'ミューテックスは所有権の概念があり、ロックしたタスクのみがアンロックできる排他制御機構です。',
        difficulty: 2,
        year: 2024,
        session: '秋期',
        categoryId: categories[11].id, // リアルタイムシステム
        choices: {
          create: [
            { content: '所有権の概念がある', isCorrect: false },
            { content: '優先度継承をサポートする', isCorrect: false },
            { content: '複数のタスクが同時にロックできる', isCorrect: true },
            { content: 'デッドロック検出機能を持つ場合がある', isCorrect: false },
          ],
        },
      },
    }),
    prisma.question.create({
      data: {
        content: 'リアルタイムシステムにおける割り込みレイテンシを最小化する手法として、最も効果的なものはどれか。',
        explanation: '割り込み禁止区間を最小化することで、高優先度割り込みの応答性を向上させることができます。',
        difficulty: 3,
        year: 2023,
        session: '春期',
        categoryId: categories[11].id, // リアルタイムシステム
        choices: {
          create: [
            { content: 'CPUクロック周波数の向上', isCorrect: false },
            { content: '割り込み禁止区間の最小化', isCorrect: true },
            { content: 'キャッシュメモリサイズの増加', isCorrect: false },
            { content: 'DMAコントローラの活用', isCorrect: false },
          ],
        },
      },
    }),
    prisma.question.create({
      data: {
        content: 'μITRON仕様におけるタスク管理機能で、「待ち状態」から「実行可能状態」への遷移条件として正しいものはどれか。',
        explanation: 'μITRONでは、待ち状態のタスクが待ち解除条件を満たすと実行可能状態に遷移します。',
        difficulty: 2,
        year: 2023,
        session: '秋期',
        categoryId: categories[11].id, // リアルタイムシステム
        choices: {
          create: [
            { content: 'CPU時間の割り当て', isCorrect: false },
            { content: '待ち解除条件の成立', isCorrect: true },
            { content: '優先度の変更', isCorrect: false },
            { content: 'メモリの確保', isCorrect: false },
          ],
        },
      },
    }),

    // Phase 5: 組込みソフトウェア開発問題
    prisma.question.create({
      data: {
        content: '組込みCプログラミングにおいて、volatile キーワードを使用する主な理由はどれか。',
        explanation: 'volatileキーワードは、変数がハードウェアや割り込みハンドラによって予期せず変更される可能性があることをコンパイラに通知します。',
        difficulty: 2,
        year: 2024,
        session: '春期',
        categoryId: categories[12].id, // 組込みソフトウェア開発
        choices: {
          create: [
            { content: 'メモリ使用量を削減するため', isCorrect: false },
            { content: 'コンパイラの最適化を抑制するため', isCorrect: true },
            { content: '実行速度を向上させるため', isCorrect: false },
            { content: 'スタックオーバーフローを防ぐため', isCorrect: false },
          ],
        },
      },
    }),
    prisma.question.create({
      data: {
        content: '組込みシステムにおけるスタックオーバーフロー対策として、最も効果的なものはどれか。',
        explanation: 'スタック使用量の静的解析により、設計段階でスタックサイズの妥当性を検証できます。',
        difficulty: 3,
        year: 2023,
        session: '秋期',
        categoryId: categories[12].id, // 組込みソフトウェア開発
        choices: {
          create: [
            { content: 'ヒープメモリの活用', isCorrect: false },
            { content: 'スタック使用量の静的解析', isCorrect: true },
            { content: '割り込み処理の高速化', isCorrect: false },
            { content: 'グローバル変数の増加', isCorrect: false },
          ],
        },
      },
    }),
    prisma.question.create({
      data: {
        content: 'JTAG（Joint Test Action Group）デバッガの主な機能として、適切でないものはどれか。',
        explanation: 'JTAGは主にデバッグ機能を提供しますが、リアルタイム性能の向上は直接的な機能ではありません。',
        difficulty: 2,
        year: 2024,
        session: '秋期',
        categoryId: categories[12].id, // 組込みソフトウェア開発
        choices: {
          create: [
            { content: 'プロセッサの実行制御', isCorrect: false },
            { content: 'メモリ・レジスタの読み書き', isCorrect: false },
            { content: 'ブレークポイントの設定', isCorrect: false },
            { content: 'リアルタイム性能の向上', isCorrect: true },
          ],
        },
      },
    }),
    prisma.question.create({
      data: {
        content: '組込みソフトウェアの単体テストにおいて、スタブ（stub）の役割として正しいものはどれか。',
        explanation: 'スタブは被テストモジュールが呼び出す下位モジュールの代替実装で、テスト環境を構築するために使用されます。',
        difficulty: 2,
        year: 2023,
        session: '春期',
        categoryId: categories[12].id, // 組込みソフトウェア開発
        choices: {
          create: [
            { content: '上位モジュールの代替実装', isCorrect: false },
            { content: '下位モジュールの代替実装', isCorrect: true },
            { content: 'テストデータの生成', isCorrect: false },
            { content: 'カバレッジの測定', isCorrect: false },
          ],
        },
      },
    }),
    prisma.question.create({
      data: {
        content: '組込みシステムにおけるコードレビューで重点的にチェックすべき項目として、最も重要なものはどれか。',
        explanation: '組込みシステムでは限られたリソース内で動作するため、メモリリークやバッファオーバーフローなどのリソース管理が特に重要です。',
        difficulty: 2,
        year: 2024,
        session: '春期',
        categoryId: categories[12].id, // 組込みソフトウェア開発
        choices: {
          create: [
            { content: 'コーディングスタイルの統一', isCorrect: false },
            { content: 'リソース管理の適切性', isCorrect: true },
            { content: 'コメントの充実度', isCorrect: false },
            { content: '処理の高速化', isCorrect: false },
          ],
        },
      },
    }),

    // Phase 5: 組込みソフトウェア開発 - 追加問題（Task 5.1.3完了用）
    prisma.question.create({
      data: {
        content: 'C言語において、組込みシステムでのメモリ管理で適切でない手法はどれか。',
        explanation: '組込みシステムでは、動的メモリ割り当て（malloc/free）はメモリ断片化やメモリリークのリスクがあるため、通常は避けられます。',
        difficulty: 2,
        year: 2024,
        session: '秋期',
        categoryId: categories[12].id, // 組込みソフトウェア開発
        choices: {
          create: [
            { content: '静的配列の使用', isCorrect: false },
            { content: 'スタック領域の活用', isCorrect: false },
            { content: '動的メモリ割り当ての多用', isCorrect: true },
            { content: 'グローバル変数による領域確保', isCorrect: false },
          ],
        },
      },
    }),
    prisma.question.create({
      data: {
        content: '組込みC++における例外処理について、一般的な制約として正しいものはどれか。',
        explanation: '組込みシステムでは、例外処理のオーバーヘッドや予測できない実行時間のため、例外処理を無効にすることが多い。',
        difficulty: 3,
        year: 2023,
        session: '春期',
        categoryId: categories[12].id, // 組込みソフトウェア開発
        choices: {
          create: [
            { content: '例外処理は必須機能である', isCorrect: false },
            { content: '例外処理を無効にすることが多い', isCorrect: true },
            { content: '例外処理にメモリオーバーヘッドはない', isCorrect: false },
            { content: 'リアルタイム性に影響しない', isCorrect: false },
          ],
        },
      },
    }),
    prisma.question.create({
      data: {
        content: '組込みソフトウェアのデバッグにおいて、ICE（In-Circuit Emulator）の特徴として適切でないものはどれか。',
        explanation: 'ICEは実際のハードウェア上でデバッグを行うため、ソフトウェアシミュレーションではなく実機環境でのデバッグが特徴です。',
        difficulty: 3,
        year: 2024,
        session: '春期',
        categoryId: categories[12].id, // 組込みソフトウェア開発
        choices: {
          create: [
            { content: '実機上でのデバッグが可能', isCorrect: false },
            { content: 'ハードウェアの動作も観測できる', isCorrect: false },
            { content: 'ソフトウェアシミュレーション環境', isCorrect: true },
            { content: 'リアルタイムデバッグをサポート', isCorrect: false },
          ],
        },
      },
    }),
  ])
  console.log(`✅ ${sampleQuestions.length}個のサンプル問題を作成しました`)
  console.log('📝 Phase 5 Task 5.1.1: 組込みハードウェア設計分野に5問追加完了')
  console.log('📝 Phase 5 Task 5.1.2: リアルタイムシステム分野に8問追加完了')
  console.log('📝 Phase 5 Task 5.1.3: 組込みソフトウェア開発分野に8問追加完了')
  console.log('🎉 Phase 5専門分野対応完了 - データベースシードが完了しました！')
}

main()
  .catch((e) => {
    console.error('❌ シード実行中にエラーが発生しました:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })