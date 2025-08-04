import { useState } from 'react'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Alert,
  Chip,
} from '@mui/material'
import { ArrowBack as BackIcon } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import LongQuestionDisplay from '../components/LongQuestionDisplay'
import { LongFormQuestion } from '../types/longQuestion'

const LongQuestionDemo = () => {
  const navigate = useNavigate()
  const [showDemo, setShowDemo] = useState(false)

  // サンプル長文問題データ
  const sampleLongQuestion: LongFormQuestion = {
    id: 'long-question-demo-1',
    content: 'ネットワークセキュリティと暗号化技術に関する総合問題',
    explanation: 'この問題では、現代のネットワークセキュリティにおける暗号化技術の役割と実装について包括的に理解することを目的としています。',
    difficulty: 4,
    year: 2024,
    session: '春期',
    categoryId: 'security',
    questionType: 'long_form',
    maxScore: 100,
    hasImages: true,
    hasTables: true,
    hasCodeBlocks: true,
    readingTime: 15,
    sections: [
      {
        id: 'intro-1',
        questionId: 'long-question-demo-1',
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'crypto-basics',
        questionId: 'long-question-demo-1',
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'ssl-tls',
        questionId: 'long-question-demo-1',
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'practical-impl',
        questionId: 'long-question-demo-1',
        title: '実装とベストプラクティス',
        content: `# 実装とベストプラクティス

ネットワークセキュリティの実装には、技術的な知識だけでなく、運用面での配慮も重要です。

## セキュリティ設計の原則

### 多層防御 (Defense in Depth)
- **ネットワーク層**: ファイアウォール、IDS/IPS
- **アプリケーション層**: WAF、入力検証
- **データ層**: 暗号化、アクセス制御

### 最小権限の原則
ユーザーやシステムには、業務に必要な最小限の権限のみを付与します。

## 実装例：Webアプリケーションのセキュリティ

\`\`\`javascript
// HTTPS強制リダイレクト
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https') {
    res.redirect(\`https://\${req.header('host')}\${req.url}\`);
  } else {
    next();
  }
});

// セキュリティヘッダーの設定
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});
\`\`\`

## 監査とコンプライアンス

セキュリティ実装の効果を継続的に評価するため、以下の活動が重要です：

- **脆弱性診断**: 定期的なペネトレーションテスト
- **ログ監視**: セキュリティインシデントの早期発見
- **教育研修**: 従業員のセキュリティ意識向上`,
        order: 4,
        sectionType: 'main',
        hasImage: false,
        hasTable: false,
        hasCode: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'conclusion',
        questionId: 'long-question-demo-1',
        title: 'まとめと今後の展望',
        content: `# まとめと今後の展望

本セクションでは、ネットワークセキュリティと暗号化技術について包括的に学習しました。

## 学習のポイント

1. **脅威の理解**: 現代のネットワーク環境における主要な脅威
2. **暗号化技術**: 共通鍵暗号、公開鍵暗号、ハッシュ関数の特徴
3. **プロトコル**: SSL/TLSの仕組みとセキュリティ強度
4. **実装**: 実際のシステムでのセキュリティ実装例

## 今後の技術動向

### 量子コンピュータへの対応
- **量子耐性暗号**: 量子コンピュータでも解読困難な暗号方式
- **移行計画**: 既存システムからの段階的な移行

### ゼロトラスト・セキュリティ
従来の境界防御から、「何も信頼しない」前提でのセキュリティモデルへの転換

これらの知識を基に、実際のシステム設計や運用に活用してください。`,
        order: 5,
        sectionType: 'conclusion',
        hasImage: false,
        hasTable: false,
        hasCode: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    choices: [
      {
        id: 'choice-1',
        content: 'AES暗号は共通鍵暗号であり、暗号化と復号化に同一の鍵を使用する',
        isCorrect: true,
      },
      {
        id: 'choice-2',
        content: 'TLS 1.3はTLS 1.2よりもセキュリティレベルが低い',
        isCorrect: false,
      },
      {
        id: 'choice-3',
        content: 'デジタル証明書は公開鍵暗号方式の一部として使用される',
        isCorrect: true,
      },
      {
        id: 'choice-4',
        content: 'ハッシュ関数は双方向の暗号化を提供する',
        isCorrect: false,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const handleSectionRead = (sectionId: string) => {
    console.log('Section read:', sectionId)
  }

  const handleSectionBookmark = (sectionId: string, note?: string) => {
    console.log('Section bookmarked:', sectionId, note)
  }

  const handleAnswer = async (questionId: string, choiceId: string, timeSpent: number) => {
    console.log('Answer submitted:', { questionId, choiceId, timeSpent })
    return { isCorrect: choiceId === 'choice-1' || choiceId === 'choice-3' }
  }

  const handleNextQuestion = () => {
    console.log('Next question requested')
    navigate('/practice')
  }

  if (!showDemo) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate('/practice')}
            sx={{ mb: 2 }}
          >
            問題練習に戻る
          </Button>
        </Box>

        <Card>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              長文問題表示機能デモ
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body1" gutterBottom>
                <strong>実装された機能：</strong>
              </Typography>
              <Box sx={{ ml: 2 }}>
                <Typography variant="body2" component="li">
                  セクション式の長文問題表示
                </Typography>
                <Typography variant="body2" component="li">
                  ナビゲーションサイドバーによる目次機能
                </Typography>
                <Typography variant="body2" component="li">
                  画像・表・コードブロックの適切な表示
                </Typography>
                <Typography variant="body2" component="li">
                  読了進捗の追跡と表示
                </Typography>
                <Typography variant="body2" component="li">
                  セクション別ブックマーク機能
                </Typography>
                <Typography variant="body2" component="li">
                  モバイル対応のレスポンシブ表示
                </Typography>
                <Typography variant="body2" component="li">
                  タッチフレンドリーなナビゲーション
                </Typography>
              </Box>
            </Alert>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                サンプル問題の特徴：
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Chip label="画像含む" color="primary" variant="outlined" />
                <Chip label="表含む" color="primary" variant="outlined" />
                <Chip label="コード含む" color="primary" variant="outlined" />
                <Chip label="5セクション" color="secondary" variant="outlined" />
                <Chip label="約15分" color="info" variant="outlined" />
                <Chip label="難易度4" color="warning" variant="outlined" />
              </Box>
              
              <Typography variant="body1" color="text.secondary">
                ネットワークセキュリティと暗号化技術について、導入から実装まで段階的に学習できる長文問題です。
                画像、表、コードブロックなど多様なコンテンツを含み、実際の午後問題に近い構成になっています。
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={() => setShowDemo(true)}
              sx={{ py: 2 }}
            >
              長文問題デモを開始
            </Button>
          </CardContent>
        </Card>
      </Container>
    )
  }

  return (
    <LongQuestionDisplay
      question={sampleLongQuestion}
      onAnswer={handleAnswer}
      onNextQuestion={handleNextQuestion}
      onSectionRead={handleSectionRead}
      onBookmarkSection={handleSectionBookmark}
      showTimer={true}
      timeLimit={30}
      reviewMode={false}
      showExplanation={false}
      showBookmark={true}
      categoryName="情報セキュリティ"
    />
  )
}

export default LongQuestionDemo