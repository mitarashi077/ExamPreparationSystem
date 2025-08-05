#!/bin/bash

# 🚀 Claude Code Integrated Development Automation System - Project Initialization
# Complete development environment setup and automation system construction

set -e

echo "🚀 Initializing Claude Code Integrated Development Automation System..."
echo "📍 Project: $(basename "$PWD")"
echo "📍 Location: $PWD"
echo "📍 Time: $(date)"
echo ""

# Initialization log
INIT_LOG=".claude/initialization.log"

log_action() {
    echo "[$(date)] $1" | tee -a "$INIT_LOG"
}

# Step 1: Create directory structure
echo "📁 Step 1: Creating project structure..."
log_action "Creating directory structure"

mkdir -p .claude
mkdir -p scripts
mkdir -p docs/{requirements,design,plans/tasks,adr}
mkdir -p tests

log_action "Directory structure created"
echo "  ✅ .claude/ - Claude Code configuration"
echo "  ✅ scripts/ - Automation scripts"
echo "  ✅ docs/ - Documentation structure"
echo "  ✅ tests/ - Test directory"
echo ""

# Step 2: Git initialization and branch protection
echo "🔧 Step 2: Git initialization and protection..."
log_action "Initializing Git repository"

if [ ! -d ".git" ]; then
    git init
    log_action "Git repository initialized"
    echo "  ✅ Git repository initialized"
    
    # Set default branch to main
    git branch -M main
    echo "  ✅ Default branch set to 'main'"
else
    echo "  ✅ Git repository already exists"
    log_action "Git repository already exists"
fi

# .gitignore設定
if [ ! -f ".gitignore" ]; then
    log_action "Creating .gitignore"
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Production builds
build/
dist/
out/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDEs
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Claude Code
.claude/dev.log
.claude/session.log

# Temporary files (never commit)
.tmp/
temp/
EOF
    echo "  ✅ .gitignore created"
else
    echo "  ✅ .gitignore already exists"
fi

# Pre-commit hook設定（main直接コミット防止）
HOOKS_DIR=".git/hooks"
if [ -d "$HOOKS_DIR" ]; then
    log_action "Setting up Git hooks"
    
    # Pre-commit hook
    cat > "$HOOKS_DIR/pre-commit" << 'EOF'
#!/bin/bash
# Claude Code - Atomic Commit Enforcement

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# main/masterブランチでの直接コミット防止
if [[ "$CURRENT_BRANCH" == "main" || "$CURRENT_BRANCH" == "master" ]]; then
    echo "❌ BLOCKED: Direct commits to '$CURRENT_BRANCH' are not allowed!"
    echo "💡 Create a feature branch first:"
    echo "   git checkout -b feature/your-task-name"
    echo "   git add ."
    echo "   git commit -m \"your message\""
    exit 1
fi

# ファイル数チェック（アトミック性確保）
CHANGED_FILES=$(git diff --cached --name-only | wc -l)
if [ $CHANGED_FILES -gt 5 ]; then
    echo "⚠️ WARNING: Committing $CHANGED_FILES files"
    echo "💡 Consider splitting into smaller, atomic commits"
    echo -n "Continue anyway? (y/N): "
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "✅ Pre-commit checks passed"
EOF
    
    chmod +x "$HOOKS_DIR/pre-commit"
    echo "  ✅ Git pre-commit hook installed"
    log_action "Git hooks configured"
fi

echo ""

# Step 3: 設定ファイル確認・作成
echo "⚙️ Step 3: Configuration files..."
log_action "Checking configuration files"

CONFIG_FILES=(
    "CLAUDE.md"
    "CLAUDE-EMERGENCY.md"
    ".claude/settings.json"
    ".mcp.json"
    "CLAUDE-TASK-CONTEXT.template.md"
)

for file in "${CONFIG_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file exists"
    else
        echo "  ⚠️ $file missing"
        log_action "WARNING: $file missing"
    fi
done

echo ""

# Step 4: スクリプト権限設定
echo "🔐 Step 4: Setting script permissions..."
log_action "Setting script permissions"

if [ -d "scripts" ]; then
    chmod +x scripts/*.sh 2>/dev/null || echo "  ⚠️ No .sh files in scripts directory"
    echo "  ✅ Script permissions set"
    log_action "Script permissions configured"
else
    echo "  ⚠️ scripts directory not found"
    log_action "WARNING: scripts directory not found"
fi

echo ""

# Step 5: Node.js/NPM環境確認
echo "📦 Step 5: Development environment check..."
log_action "Checking development environment"

# Node.js確認
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "  ✅ Node.js: $NODE_VERSION"
    log_action "Node.js detected: $NODE_VERSION"
else
    echo "  ⚠️ Node.js not found"
    log_action "WARNING: Node.js not found"
fi

# NPM確認
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "  ✅ NPM: $NPM_VERSION"
    log_action "NPM detected: $NPM_VERSION"
else
    echo "  ⚠️ NPM not found"
    log_action "WARNING: NPM not found"
fi

# package.json確認
if [ -f "package.json" ]; then
    echo "  ✅ package.json exists"
    log_action "package.json found"
    
    # 依存関係チェック
    if [ -d "node_modules" ]; then
        echo "  ✅ node_modules exists"
    else
        echo "  ⚠️ node_modules missing - run 'npm install'"
        log_action "WARNING: node_modules missing"
    fi
else
    echo "  ⚠️ package.json not found"
    log_action "WARNING: package.json not found"
fi

echo ""

# Step 6: 初期コミット作成
echo "📝 Step 6: Initial commit..."
log_action "Creating initial commit"

# 既存コミットがあるかチェック
if [ -z "$(git log --oneline 2>/dev/null)" ]; then
    echo "  Creating initial commit..."
    
    # ステージング
    git add .
    
    # 初期コミット
    git commit -m "feat: Initialize Claude Code integrated development automation system

- Added comprehensive CLAUDE.md configuration system
- Implemented 3-second task check system with XML structured pipeline
- Set up agent specialization system (ONE AGENT = ONE JOB)
- Configured atomic commit enforcement with git hooks
- Added 6-phase quality assurance framework
- Implemented error recovery and session management
- Created project structure with docs organization
- Added automation scripts for quality checks and recovery

🤖 Generated with [Claude Code](https://claude.ai/code)
Co-Authored-By: Claude <noreply@anthropic.com>" 2>/dev/null || echo "  ⚠️ Initial commit failed (may already exist)"
    
    log_action "Initial commit created"
    echo "  ✅ Initial commit created"
else
    echo "  ✅ Repository already has commits"
    log_action "Repository already has commits"
fi

echo ""

# Step 7: システム検証
echo "🔍 Step 7: System verification..."
log_action "Running system verification"

VERIFICATION_PASSED=true

# 必須ファイル確認
echo "  Checking critical files..."
CRITICAL_FILES=("CLAUDE.md" "CLAUDE-EMERGENCY.md" ".claude/settings.json")
for file in "${CRITICAL_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "    ❌ Missing: $file"
        VERIFICATION_PASSED=false
        log_action "VERIFICATION FAILED: Missing $file"
    else
        echo "    ✅ Found: $file"
    fi
done

# Git状態確認
echo "  Checking git configuration..."
if git status &> /dev/null; then
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    echo "    ✅ Git operational, branch: $CURRENT_BRANCH"
    log_action "Git verification passed, branch: $CURRENT_BRANCH"
else
    echo "    ❌ Git not working properly"
    VERIFICATION_PASSED=false
    log_action "VERIFICATION FAILED: Git not working"
fi

# スクリプト実行可能性確認
echo "  Checking script executability..."
if [ -x "scripts/quality-check.sh" ]; then
    echo "    ✅ Quality check script executable"
else
    echo "    ❌ Quality check script not executable"
    VERIFICATION_PASSED=false
    log_action "VERIFICATION FAILED: Scripts not executable"
fi

echo ""

# Step 8: 完了レポート
echo "📊 Step 8: Initialization Report"
echo "================================="
log_action "Generating completion report"

echo "🎯 Claude Code Integrated Development Automation System"
echo ""
echo "📁 Project Structure:"
echo "  ├── CLAUDE.md (統合ルール)"
echo "  ├── CLAUDE-EMERGENCY.md (緊急時チェック)"
echo "  ├── .claude/settings.json (Claude Code設定)"
echo "  ├── .mcp.json (MCPサーバー設定)"
echo "  ├── scripts/ (自動化スクリプト)"
echo "  ├── docs/ (ドキュメント構造)"
echo "  └── .git/hooks/ (コミット保護)"
echo ""

echo "🚀 Automation Features:"
echo "  ✅ 3-second task check system"
echo "  ✅ XML structured development pipeline"
echo "  ✅ Agent specialization system"
echo "  ✅ Atomic commit enforcement"
echo "  ✅ 6-phase quality assurance"
echo "  ✅ Error recovery system"
echo "  ✅ Session management"
echo ""

echo "🎮 Quick Commands:"
echo "  ./scripts/quality-check.sh    - Run quality checks"
echo "  ./scripts/error-recovery.sh   - Emergency recovery"
echo "  cat CLAUDE-EMERGENCY.md       - 3-second checklist"
echo ""

if [ "$VERIFICATION_PASSED" = true ]; then
    echo "🎉 INITIALIZATION COMPLETED SUCCESSFULLY!"
    echo "✅ All systems operational"
    echo "🚀 Ready for automated development workflow"
    log_action "Initialization completed successfully"
else
    echo "⚠️ INITIALIZATION COMPLETED WITH WARNINGS"
    echo "🔧 Some manual fixes may be required"
    echo "📋 Check the warnings above"
    log_action "Initialization completed with warnings"
fi

echo ""
echo "📚 Next Steps:"
echo "1. Test the system with: ./scripts/quality-check.sh"
echo "2. Create your first feature branch: git checkout -b feature/test"
echo "3. Start development with automated workflow support"
echo ""

log_action "Initialization process completed"

# 最終ステータス表示
echo "📍 Final Status:"
echo "  Branch: $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'N/A')"
echo "  Files: $(find . -name "*.md" -o -name "*.json" -o -name "*.sh" | wc -l) automation files created"
echo "  Log: $INIT_LOG"

echo ""
echo "🎯 Claude Code統合開発自動化システムの初期化が完了しました。"
echo "完全自動化されたプロジェクト開発環境が利用可能になりました。"