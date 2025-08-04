const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const sampleLongQuestions = [
  {
    content: 'ネットワークセキュリティと暗号化技術に関する総合問題',
    explanation: 'この問題では、現代のネットワークセキュリティにおける暗号化技術の役割と実装について包括的に理解することを目的としています。',
    difficulty: 4,
    year: 2024,
    session: '春期',
    questionType: 'long_form',
    hasImages: true,
    hasTables: true,
    hasCodeBlocks: true,
    readingTime: 15,
    sections: [
      {
        title: 'ネットワークセキュリティの概要',
        content: `# ネットワークセキュリティの基本概念

ネットワークセキュリティは、**コンピュータネットワーク**上でのデータの機密性、完全性、可用性を保護するための技術と手法の総称です。

## 主要な脅威

現代のネットワーク環境における主要な脅威には以下があります：

- **盗聴（Eavesdropping）**: 通信内容の不正な傍受
- **改ざん（Tampering）**: データの不正な変更
- **なりすまし（Spoofing）**: 正当なユーザーへの偽装
- **サービス拒否攻撃（DoS）**: システムの可用性への攻撃

これらの脅威から保護するため、様々なセキュリティ技術が開発されています。`,
        order: 1,
        sectionType: 'introduction',
        hasImage: false,
        hasTable: false,
        hasCode: false,
      },
      {
        title: '暗号化技術の基礎',
        content: `# 暗号化技術の基礎

暗号化技術は、データを第三者が理解できない形式に変換する技術です。

## 暗号化の種類

| 暗号化方式 | 特徴 | 用途例 |
|-----------|------|--------|
| 共通鍵暗号 | 暗号化・復号化に同一の鍵を使用 | ファイル暗号化、高速通信 |
| 公開鍵暗号 | 公開鍵と秘密鍵のペアを使用 | デジタル署名、鍵交換 |
| ハッシュ関数 | 一方向関数、固定長出力 | パスワード保存、完全性検証 |

## 代表的な暗号アルゴリズム

### AES (Advanced Encryption Standard)
\`\`\`python
from cryptography.fernet import Fernet

# 鍵の生成
key = Fernet.generate_key()
cipher_suite = Fernet(key)

# 暗号化
plaintext = b"Hello, World!"
ciphertext = cipher_suite.encrypt(plaintext)

# 復号化
decrypted_text = cipher_suite.decrypt(ciphertext)
print(decrypted_text.decode())  # "Hello, World!"
\`\`\`

![暗号化の概念図](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjlmOWY5IiBzdHJva2U9IiNkZGQiLz48dGV4dCB4PSI1MCUiIHk9IjMwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjMzMzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7mnZrmo4Dmg6Xjg4fjg7zjgr8g4oaSIOaaguWPt+WMlOOCouODq+OCtOODquOCuuODoTwvdGV4dD48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7mnpfopb/ljJbjgZXjgozjgZ/jg4fjg7zjgr88L3RleHQ+PHRleHQgeD0iNTAlIiB5PSI3MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+6KSH5Y+35YyW4oaSIOOCquODquOCuOODiuODq+ODh+ODvOOCvzwvdGV4dD48L3N2Zz4=)`,
        order: 2,
        sectionType: 'main',
        hasImage: true,
        hasTable: true,
        hasCode: true,
      },
      {
        title: 'SSL/TLS プロトコル',
        content: `# SSL/TLS プロトコル

**SSL (Secure Sockets Layer)** および **TLS (Transport Layer Security)** は、インターネット上での安全な通信を実現するプロトコルです。

## TLS ハンドシェイク手順

TLS通信の開始時には、以下の手順でハンドシェイクが行われます：

1. **Client Hello**: クライアントがサーバーに接続要求
2. **Server Hello**: サーバーが証明書とサーバー公開鍵を送信
3. **証明書検証**: クライアントがサーバー証明書を検証
4. **鍵交換**: 共通鍵の材料を安全に交換
5. **暗号化通信開始**: 生成した共通鍵で通信を暗号化

## 証明書の構造

デジタル証明書には以下の情報が含まれます：

\`\`\`text
Certificate:
    Data:
        Version: 3 (0x2)
        Serial Number: 12345678
        Signature Algorithm: sha256WithRSAEncryption
        Issuer: CN=Example CA, O=Example Org
        Validity:
            Not Before: Jan  1 00:00:00 2024 GMT
            Not After : Dec 31 23:59:59 2024 GMT
        Subject: CN=example.com, O=Example Company
        Subject Public Key Info:
            Public Key Algorithm: rsaEncryption
                RSA Public-Key: (2048 bit)
\`\`\`

## セキュリティ強度の比較

| プロトコル | 暗号スイート例 | セキュリティレベル |
|-----------|---------------|------------------|
| SSL 3.0 | RC4-MD5 | 低（非推奨） |
| TLS 1.2 | AES256-GCM-SHA384 | 高 |
| TLS 1.3 | CHACHA20-POLY1305 | 最高 |`,
        order: 3,
        sectionType: 'main',
        hasImage: false,
        hasTable: true,
        hasCode: true,
      },
      {
        title: 'まとめと今後の展望',
        content: `# まとめと今後の展望

本セクションでは、ネットワークセキュリティと暗号化技術について包括的に学習しました。

## 学習のポイント

1. **脅威の理解**: 現代のネットワーク環境における主要な脅威
2. **暗号化技術**: 共通鍵暗号、公開鍵暗号、ハッシュ関数の特徴
3. **プロトコル**: SSL/TLSの仕組みとセキュリティ強度

## 今後の技術動向

### 量子コンピュータへの対応
- **量子耐性暗号**: 量子コンピュータでも解読困難な暗号方式
- **移行計画**: 既存システムからの段階的な移行

### ゼロトラスト・セキュリティ
従来の境界防御から、「何も信頼しない」前提でのセキュリティモデルへの転換

これらの知識を基に、実際のシステム設計や運用に活用してください。`,
        order: 4,
        sectionType: 'conclusion',
        hasImage: false,
        hasTable: false,
        hasCode: false,
      },
    ],
    choices: [
      {
        content: 'AES暗号は共通鍵暗号であり、暗号化と復号化に同一の鍵を使用する',
        isCorrect: true,
      },
      {
        content: 'TLS 1.3はTLS 1.2よりもセキュリティレベルが低い',
        isCorrect: false,
      },
      {
        content: 'デジタル証明書は公開鍵暗号方式の一部として使用される',
        isCorrect: true,
      },
      {
        content: 'ハッシュ関数は双方向の暗号化を提供する',
        isCorrect: false,
      },
    ],
  },
  {
    content: 'データベース設計とパフォーマンス最適化',
    explanation: 'データベースの設計原則とパフォーマンス最適化手法について学習します。',
    difficulty: 3,
    year: 2024,
    session: '秋期',
    questionType: 'long_form',
    hasImages: false,
    hasTables: true,
    hasCodeBlocks: true,
    readingTime: 12,
    sections: [
      {
        title: 'データベース設計の基本原則',
        content: `# データベース設計の基本原則

データベース設計は、効率的でメンテナンス性の高いシステムを構築するための重要な工程です。

## 正規化

データベースの正規化は、データの冗長性を排除し、整合性を保つための手法です。

### 第1正規形（1NF）
- 各セルに単一の値のみを格納
- 繰り返しグループの排除

### 第2正規形（2NF）
- 1NFを満たし、部分関数従属を排除

### 第3正規形（3NF）
- 2NFを満たし、推移関数従属を排除

## エンティティ関係図（ER図）

エンティティ間の関係を図式化し、データベース構造を可視化します。`,
        order: 1,
        sectionType: 'introduction',
        hasImage: false,
        hasTable: false,
        hasCode: false,
      },
      {
        title: 'インデックス設計とクエリ最適化',
        content: `# インデックス設計とクエリ最適化

効率的なクエリ実行のためのインデックス設計と最適化手法について説明します。

## インデックスの種類

| インデックス種類 | 特徴 | 適用場面 |
|----------------|------|----------|
| B-Treeインデックス | 範囲検索に適している | WHERE, ORDER BY |
| ハッシュインデックス | 等価検索に最適 | 主キー検索 |
| 複合インデックス | 複数カラムの組み合わせ | 複数条件検索 |

## クエリ最適化の例

\`\`\`sql
-- 最適化前
SELECT * FROM orders 
WHERE customer_id = 123 
  AND order_date >= '2024-01-01';

-- インデックス追加
CREATE INDEX idx_customer_date ON orders(customer_id, order_date);

-- 実行計画の確認
EXPLAIN ANALYZE SELECT * FROM orders 
WHERE customer_id = 123 
  AND order_date >= '2024-01-01';
\`\`\`

効果的なインデックス設計により、クエリ実行時間を大幅に短縮できます。`,
        order: 2,
        sectionType: 'main',
        hasImage: false,
        hasTable: true,
        hasCode: true,
      },
    ],
    choices: [
      {
        content: '第3正規形は推移関数従属を排除した形式である',
        isCorrect: true,
      },
      {
        content: 'ハッシュインデックスは範囲検索に最適である',
        isCorrect: false,
      },
      {
        content: '複合インデックスは複数カラムでの検索に効果的である',
        isCorrect: true,
      },
      {
        content: 'インデックスは常にクエリ性能を向上させる',
        isCorrect: false,
      },
    ],
  },
]

async function seedLongQuestions() {
  console.log('長文問題のサンプルデータを追加中...')

  try {
    // まず、カテゴリを確認・作成
    let securityCategory = await prisma.category.findFirst({
      where: { name: '情報セキュリティ' }
    })

    if (!securityCategory) {
      securityCategory = await prisma.category.create({
        data: {
          name: '情報セキュリティ',
          description: 'ネットワークセキュリティ、暗号化技術など'
        }
      })
    }

    let databaseCategory = await prisma.category.findFirst({
      where: { name: 'データベース' }
    })

    if (!databaseCategory) {
      databaseCategory = await prisma.category.create({
        data: {
          name: 'データベース',
          description: 'データベース設計、SQL、最適化など'
        }
      })
    }

    // 長文問題を作成
    for (let i = 0; i < sampleLongQuestions.length; i++) {
      const questionData = sampleLongQuestions[i]
      const categoryId = i === 0 ? securityCategory.id : databaseCategory.id

      // まず Question を作成
      const question = await prisma.question.create({
        data: {
          content: questionData.content,
          explanation: questionData.explanation,
          difficulty: questionData.difficulty,
          year: questionData.year,
          session: questionData.session,
          questionType: questionData.questionType,
          hasImages: questionData.hasImages,
          hasTables: questionData.hasTables,
          hasCodeBlocks: questionData.hasCodeBlocks,
          readingTime: questionData.readingTime,
          categoryId,
        }
      })

      console.log(`問題「${question.content}」を作成しました (ID: ${question.id})`)

      // QuestionSection を作成
      for (const sectionData of questionData.sections) {
        await prisma.questionSection.create({
          data: {
            questionId: question.id,
            title: sectionData.title,
            content: sectionData.content,
            order: sectionData.order,
            sectionType: sectionData.sectionType,
            hasImage: sectionData.hasImage,
            hasTable: sectionData.hasTable,
            hasCode: sectionData.hasCode,
          }
        })
      }

      console.log(`  - ${questionData.sections.length}個のセクションを作成しました`)

      // Choice を作成
      for (const choiceData of questionData.choices) {
        await prisma.choice.create({
          data: {
            questionId: question.id,
            content: choiceData.content,
            isCorrect: choiceData.isCorrect,
          }
        })
      }

      console.log(`  - ${questionData.choices.length}個の選択肢を作成しました`)
    }

    console.log('✓ 長文問題のサンプルデータ追加が完了しました')

  } catch (error) {
    console.error('サンプルデータ追加中にエラーが発生しました:', error)
    throw error
  }
}

async function main() {
  await seedLongQuestions()
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })