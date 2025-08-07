import { useState } from 'react'
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Divider,
} from '@mui/material'
import { ArrowBack as BackIcon } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import EssayQuestionCard from '../components/EssayQuestionCard'
import { Question } from '../stores/useQuestionStore'

const EssayQuestionDemo = () => {
  const navigate = useNavigate()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  // サンプル記述式問題データ
  const essayQuestions: Question[] = [
    {
      id: 'essay-1',
      content:
        '【午後問題 問1】\n\nWebアプリケーションにおけるセキュリティ対策について、以下の観点から説明してください。\n\n1. XSS（Cross-Site Scripting）攻撃の概要と対策方法\n2. CSRF（Cross-Site Request Forgery）攻撃の概要と対策方法\n3. SQLインジェクション攻撃の概要と対策方法\n\n各攻撃手法について、具体的なコード例を含めて説明し、適切な対策を実装したコード例も併せて記述してください。',
      explanation:
        'Webアプリケーションの3大脅威について、実装レベルでの理解が求められます。',
      difficulty: 4,
      year: 2024,
      session: '春期',
      categoryId: 'security',
      choices: [],
      questionType: 'essay',
      maxScore: 100,
      sampleAnswer: `# Webアプリケーションセキュリティ対策

## 1. XSS（Cross-Site Scripting）攻撃

### 概要
XSS攻撃は、Webアプリケーションに悪意のあるスクリプトを埋め込み、ユーザーのブラウザで実行させる攻撃です。

### 攻撃例
\`\`\`html
<!-- 脆弱なコード例 -->
<div><?php echo $_GET['username']; ?></div>

<!-- 攻撃例 -->
/?username=<script>alert('XSS!')</script>
\`\`\`

### 対策
\`\`\`php
// 適切な対策
<div><?php echo htmlspecialchars($_GET['username'], ENT_QUOTES, 'UTF-8'); ?></div>
\`\`\`

## 2. CSRF（Cross-Site Request Forgery）攻撃

### 概要
ユーザーが意図しない操作を別のサイトから実行させる攻撃です。

### 攻撃例
\`\`\`html
<!-- 攻撃者のサイト -->
<form action="https://bank.example.com/transfer" method="POST">
  <input type="hidden" name="to" value="attacker">
  <input type="hidden" name="amount" value="1000000">
</form>
<script>document.forms[0].submit();</script>
\`\`\`

### 対策
\`\`\`php
// CSRFトークンの実装
session_start();
$token = bin2hex(random_bytes(32));
$_SESSION['csrf_token'] = $token;

// フォームにトークンを埋め込み
echo '<input type="hidden" name="csrf_token" value="' . $token . '">';

// 検証
if ($_POST['csrf_token'] !== $_SESSION['csrf_token']) {
    die('CSRF attack detected');
}
\`\`\`

## 3. SQLインジェクション攻撃

### 概要
SQLクエリに悪意のある文字列を埋め込み、データベースを不正に操作する攻撃です。

### 攻撃例
\`\`\`php
// 脆弱なコード例
$sql = "SELECT * FROM users WHERE username = '" . $_POST['username'] . "'";

// 攻撃例: username = "admin'; DROP TABLE users; --"
\`\`\`

### 対策
\`\`\`php
// プリペアドステートメントの使用
$stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
$stmt->execute([$_POST['username']]);
$user = $stmt->fetch();
\`\`\`

これらの対策を組み合わせることで、Webアプリケーションのセキュリティを大幅に向上させることができます。`,
    },
    {
      id: 'essay-2',
      content:
        '【午後問題 問2】\n\nデータベース設計において、正規化の重要性について説明してください。\n\n1. 第1正規形（1NF）から第3正規形（3NF）までの定義と意味\n2. 各正規形の具体例（テーブル設計例を含む）\n3. 正規化のメリットとデメリット\n4. 実際のシステム開発における正規化の適用指針\n\n具体的なテーブル設計例を用いて説明してください。',
      explanation:
        'データベース設計の基本である正規化について、実践的な理解が求められます。',
      difficulty: 3,
      year: 2024,
      session: '春期',
      categoryId: 'database',
      choices: [],
      questionType: 'essay',
      maxScore: 100,
      sampleAnswer: `# データベース正規化の重要性

## 正規化の定義

正規化とは、データベースの冗長性を排除し、整合性を保つためのテーブル設計手法です。

## 各正規形の説明

### 第1正規形（1NF）
**定義**: 各セルに原子値（分割不可能な値）のみを格納する

\`\`\`sql
-- 非正規形の例（NG）
CREATE TABLE orders_bad (
    order_id INT,
    customer_name VARCHAR(100),
    products VARCHAR(500)  -- "商品A,商品B,商品C" のような形式
);

-- 第1正規形（OK）
CREATE TABLE orders_1nf (
    order_id INT,
    customer_name VARCHAR(100),
    product_name VARCHAR(100)
);
\`\`\`

### 第2正規形（2NF）
**定義**: 1NFを満たし、非キー属性が主キー全体に完全関数従属する

\`\`\`sql
-- 1NFだが2NFでない例（NG）
CREATE TABLE order_details_bad (
    order_id INT,
    product_id INT,
    product_name VARCHAR(100),  -- product_idにのみ従属
    customer_name VARCHAR(100), -- order_idにのみ従属
    quantity INT,
    PRIMARY KEY (order_id, product_id)
);

-- 第2正規形に分割（OK）
CREATE TABLE orders_2nf (
    order_id INT PRIMARY KEY,
    customer_name VARCHAR(100)
);

CREATE TABLE products_2nf (
    product_id INT PRIMARY KEY,
    product_name VARCHAR(100)
);

CREATE TABLE order_details_2nf (
    order_id INT,
    product_id INT,
    quantity INT,
    PRIMARY KEY (order_id, product_id),
    FOREIGN KEY (order_id) REFERENCES orders_2nf(order_id),
    FOREIGN KEY (product_id) REFERENCES products_2nf(product_id)
);
\`\`\`

### 第3正規形（3NF）
**定義**: 2NFを満たし、非キー属性間に推移的関数従属がない

\`\`\`sql
-- 2NFだが3NFでない例（NG）
CREATE TABLE customers_bad (
    customer_id INT PRIMARY KEY,
    customer_name VARCHAR(100),
    postal_code VARCHAR(10),
    prefecture VARCHAR(50),  -- postal_codeから推移的に従属
    city VARCHAR(100)        -- postal_codeから推移的に従属
);

-- 第3正規形に分割（OK）
CREATE TABLE postal_codes (
    postal_code VARCHAR(10) PRIMARY KEY,
    prefecture VARCHAR(50),
    city VARCHAR(100)
);

CREATE TABLE customers_3nf (
    customer_id INT PRIMARY KEY,
    customer_name VARCHAR(100),
    postal_code VARCHAR(10),
    FOREIGN KEY (postal_code) REFERENCES postal_codes(postal_code)
);
\`\`\`

## メリット・デメリット

### メリット
1. **データ整合性の向上**: 冗長性排除により更新異常を防止
2. **保守性の向上**: 変更時の影響範囲を限定
3. **容量効率**: 重複データの削減

### デメリット
1. **性能への影響**: JOIN操作の増加
2. **複雑性の増加**: テーブル数の増加
3. **開発工数の増加**: 設計・実装コストの上昇

## 実際の適用指針

### 1. 基本方針
- OLTP系：3NF以上を目指す
- OLAP系：パフォーマンス重視で適度な非正規化を許容

### 2. パフォーマンスチューニング
\`\`\`sql
-- 頻繁に参照される項目は非正規化を検討
CREATE TABLE order_summary (
    order_id INT PRIMARY KEY,
    customer_id INT,
    customer_name VARCHAR(100), -- 非正規化（高速化のため）
    total_amount DECIMAL(10,2),
    order_date DATE
);
\`\`\`

### 3. 実装時の注意点
- ビジネスロジックの変更頻度を考慮
- アクセスパターンを分析して最適化ポイントを特定
- 段階的な正規化（必要に応じて非正規化）を実施

正規化は理論と実践のバランスが重要であり、システムの要件に応じて適切なレベルを選択することが肝要です。`,
    },
  ]

  const handleEssaySubmit = async (
    questionId: string,
    content: string,
    timeSpent: number,
  ) => {
    console.log('記述式回答送信:', { questionId, content, timeSpent })
    // 実際の実装では API 呼び出しを行う
    return {
      isCorrect: true,
      score: Math.floor(Math.random() * 30) + 70, // 70-100点のランダムスコア
      feedback:
        '良い回答です。具体的なコード例が含まれており、理解度が高いことが伺えます。',
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < essayQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      navigate('/')
    }
  }

  const currentQuestion = essayQuestions[currentQuestionIndex]

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/')}
          sx={{ mb: 2 }}
        >
          戻る
        </Button>

        <Typography variant="h4" component="h1" gutterBottom>
          記述式問題デモ
        </Typography>

        <Typography variant="body1" color="text.secondary" paragraph>
          午後試験対策用の記述式問題エディタのデモです。
          Markdown記法とコードハイライト機能をお試しください。
        </Typography>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          問題 {currentQuestionIndex + 1} / {essayQuestions.length}
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <EssayQuestionCard
          question={currentQuestion}
          onSubmit={handleEssaySubmit}
          onNextQuestion={handleNextQuestion}
          showTimer={true}
          timeLimit={60} // 60分
          showBookmark={true}
          categoryName="午後問題対策"
        />
      </Paper>

      <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          使用方法
        </Typography>
        <Typography variant="body2" component="div">
          <ul>
            <li>「エディタ」タブでMarkdown形式で回答を記述</li>
            <li>「プレビュー」タブで記述内容を確認</li>
            <li>コードブロックは言語名を指定（例：```javascript）</li>
            <li>下書き保存で途中保存が可能</li>
            <li>30秒ごとに自動下書き保存</li>
            <li>全画面表示でより広い編集エリアを利用可能</li>
          </ul>
        </Typography>
      </Box>
    </Container>
  )
}

export default EssayQuestionDemo
