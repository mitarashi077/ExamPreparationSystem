// 本番環境用シードスクリプト
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

async function main() {
  console.log('🌱 本番環境データベースシードを開始します...');

  // 既存のカテゴリをチェック
  const existingCategories = await prisma.category.findMany();
  console.log(`既存カテゴリ数: ${existingCategories.length}`);

  // 既存の問題をチェック
  const existingQuestions = await prisma.question.findMany();
  console.log(`既存問題数: ${existingQuestions.length}`);

  if (existingQuestions.length > 0) {
    console.log('✅ 既に問題データが存在します。スキップします。');
    return;
  }

  // カテゴリIDを取得（既存の3つのカテゴリを使用）
  let categories = existingCategories;
  
  if (categories.length === 0) {
    console.log('カテゴリが存在しないため、基本カテゴリを作成します...');
    categories = await Promise.all([
      prisma.category.create({
        data: {
          name: 'エンベデッドシステム基礎',
          description: 'エンベデッドシステムの基本概念',
        },
      }),
      prisma.category.create({
        data: {
          name: 'ハードウェア設計',
          description: 'ハードウェア設計に関する問題',
        },
      }),
      prisma.category.create({
        data: {
          name: 'ソフトウェア設計',
          description: 'ソフトウェア設計とプログラミング',
        },
      }),
    ]);
  }

  // テスト問題の作成
  const sampleQuestions = await Promise.all([
    prisma.question.create({
      data: {
        content: 'エンベデッドシステムにおいて、リアルタイム性が重要な理由として、最も適切なものはどれか。',
        explanation: 'リアルタイム性は、決められた時間内に処理を完了することを保証する特性で、安全性や品質に直結します。',
        difficulty: 2,
        year: 2023,
        session: '秋期',
        categoryId: categories[0].id,
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
        categoryId: categories[2].id,
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
        categoryId: categories[1].id,
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
    prisma.question.create({
      data: {
        content: 'DMA（Direct Memory Access）コントローラの主な利点として、最も適切なものはどれか。',
        explanation: 'DMAはCPUを介さずにメモリと周辺機器間でデータ転送を行うため、CPUの負荷を軽減できます。',
        difficulty: 2,
        year: 2023,
        session: '春期',
        categoryId: categories[1].id,
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
        content: '組込みCプログラミングにおいて、volatile キーワードを使用する主な理由はどれか。',
        explanation: 'volatileキーワードは、変数がハードウェアや割り込みハンドラによって予期せず変更される可能性があることをコンパイラに通知します。',
        difficulty: 2,
        year: 2024,
        session: '春期',
        categoryId: categories[2].id,
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
  ]);

  console.log(`✅ ${sampleQuestions.length}個のテスト問題を作成しました`);
  console.log('🎉 本番環境データベースシード完了！');
}

main()
  .catch((e) => {
    console.error('❌ シード実行中にエラーが発生しました:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });