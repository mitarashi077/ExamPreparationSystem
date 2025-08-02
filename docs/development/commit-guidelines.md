# Commit Guidelines

## Commit Message Convention

This project adopts commit messages that emphasize **WHY** (reasoning) over what was changed.

### Basic Format

```
<type>: <subject>

<body>

<footer>
```

### Type (Change Category)

| Type | Description | Example |
|------|------|-----|
| `feat` | New feature | Bookmark feature, authentication |
| `fix` | Bug fix | API error fix, UI display issue |
| `docs` | Documentation only changes | README update, API specification |
| `style` | Changes that don't affect code meaning | Formatting, whitespace |
| `refactor` | Code change that neither fixes bug nor adds feature | Structure improvement, optimization |
| `test` | Adding missing tests or correcting existing tests | Unit tests, integration tests |
| `chore` | Changes to build process or tools | Dependency updates, configuration changes |
| `perf` | Performance improvement | Query optimization, rendering improvement |
| `ci` | Changes to CI configuration files and scripts | GitHub Actions, build configuration |
| `revert` | Revert previous commit | Reverting buggy commit |

### Subject（件名）

- **50文字以内**で変更内容を要約
- **現在形、命令形**で記述（"add" not "added" or "adds"）
- **最初の文字は小文字**
- **末尾にピリオドは不要**

### Body（本文）

**WHYを重視した詳細説明**：

- **変更の理由・背景・影響**を説明
- **「何をしたか」ではなく「なぜしたか」**を重視
- **72文字で改行**
- 複数の変更がある場合は**箇条書き**で整理

### Footer（フッター）

関連するIssueやタスク番号：

- `Closes #123` - Issueをクローズ
- `Refs #456` - Issue参照
- `Task 6.1.2` - タスク番号

## 良い例

```
feat: add bookmark functionality to exam questions

ユーザーが重要な問題を後で見返せるように、ブックマーク機能を追加。
学習効率向上のため、間違えた問題と合わせて復習できる仕組みを提供。

- BookmarkモデルとAPI実装
- フロントエンドのブックマーク状態管理  
- 既存の問題一覧画面にブックマークボタン追加

Task 6.1.2
```

## 悪い例

```
fix: fixed bug

バグを修正した
```

## コミットテンプレートの使用

```bash
# テンプレートが自動適用されます
git commit

# テンプレートを手動で適用
git config commit.template .gitmessage
```

## 自動コミットの場合

Hookによる自動コミットの場合も、可能な限りこの形式に従います：

```
chore: auto-commit after agent work - 2024-08-02 14:30:00

エージェント作業完了後の自動コミット。
開発フローの効率化とやりっぱなし防止のため。

- YAMLフロントマター修正
- settings.local.json更新
```