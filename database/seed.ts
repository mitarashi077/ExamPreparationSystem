import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 データベースシードを開始します...')

  // カテゴリの作成（IPAシラバス準拠）
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
  ])

  // サンプル問題の作成
  const sampleQuestions = await Promise.all([
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
  ])

  console.log(`✅ ${categories.length}個のカテゴリを作成しました`)
  console.log(`✅ ${sampleQuestions.length}個のサンプル問題を作成しました`)
  console.log('🎉 データベースシードが完了しました！')
}

main()
  .catch((e) => {
    console.error('❌ シード実行中にエラーが発生しました:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })