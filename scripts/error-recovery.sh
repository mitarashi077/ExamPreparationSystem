#!/bin/bash

# 🔧 Claude Code Integrated Error Recovery System
# Automatic recovery for Git state, build errors, and dependency issues

set -e

echo "🔧 Error Recovery System Started..."
echo "📍 Project: $(basename "$PWD")"
echo "📍 Current time: $(date)"
echo ""

# Function to display recovery options
show_recovery_options() {
    echo "🔧 Recovery Options Available:"
    echo "1) Continue current work (stash changes, stay on current branch)"
    echo "2) Switch to new task (stash changes, create new branch)"
    echo "3) Return to main (stash changes, checkout main)"
    echo "4) Discard all changes (⚠️ DESTRUCTIVE)"
    echo "5) View detailed git status"
    echo "6) Manual recovery (show commands only)"
    echo "7) Exit without changes"
    echo ""
}

# Function to analyze Git state
analyze_git_state() {
    echo "🔍 Analyzing Git State..."
    
    # Basic state verification
    if ! git status &> /dev/null; then
        echo "❌ Not a git repository"
        echo "💡 Run: git init"
        return 1
    fi
    
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    echo "📍 Current branch: $CURRENT_BRANCH"
    
    # Check for uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        echo "📝 Uncommitted changes found:"
        git status --short
        CHANGES_EXIST=true
    else
        echo "✅ Working directory is clean"
        CHANGES_EXIST=false
    fi
    
    # Check for untracked files
    UNTRACKED=$(git ls-files --others --exclude-standard)
    if [ -n "$UNTRACKED" ]; then
        echo "📄 Untracked files found:"
        echo "$UNTRACKED"
    fi
    
    # スタッシュ確認
    STASH_COUNT=$(git stash list | wc -l)
    if [ $STASH_COUNT -gt 0 ]; then
        echo "💾 $STASH_COUNT stash(es) available:"
        git stash list --oneline
    fi
    
    echo ""
}

# 依存関係問題分析
analyze_dependencies() {
    echo "📦 Analyzing Dependencies..."
    
    if [ -f "package.json" ]; then
        echo "📋 package.json found"
        
        # node_modules確認
        if [ ! -d "node_modules" ]; then
            echo "❌ node_modules missing"
            echo "💡 Fix: npm install"
        else
            echo "✅ node_modules exists"
        fi
        
        # package-lock.json確認
        if [ ! -f "package-lock.json" ] && [ ! -f "yarn.lock" ]; then
            echo "⚠️ No lock file found"
            echo "💡 Consider running: npm install"
        fi
        
        # 依存関係の問題確認
        if ! npm ls &> /dev/null; then
            echo "⚠️ Dependency issues detected"
            echo "💡 Fix: npm install --force"
        else
            echo "✅ Dependencies seem OK"
        fi
    else
        echo "⚠️ No package.json found"
    fi
    
    echo ""
}

# ビルドエラー分析
analyze_build_state() {
    echo "🏗️ Analyzing Build State..."
    
    if [ -f "package.json" ]; then
        # TypeScript確認
        if [ -f "tsconfig.json" ]; then
            echo "📋 TypeScript project detected"
            if ! npx tsc --noEmit &> /dev/null; then
                echo "❌ TypeScript compilation errors"
                echo "💡 Fix: Check type errors with: npx tsc --noEmit"
            else
                echo "✅ TypeScript compilation OK"
            fi
        fi
        
        # Build確認
        if npm run build &> /dev/null; then
            echo "✅ Build script available"
        else
            echo "⚠️ No build script or build failing"
        fi
    fi
    
    echo ""
}

# 自動回復実行
auto_recovery() {
    local option=$1
    
    case $option in
        1)
            echo "🔄 Continuing current work..."
            if [ "$CHANGES_EXIST" = true ]; then
                echo "💾 Stashing current changes..."
                git stash push -m "Auto-stash for continuation: $(date)"
            fi
            echo "✅ Ready to continue on branch: $CURRENT_BRANCH"
            ;;
        2)
            echo "🔄 Switching to new task..."
            if [ "$CHANGES_EXIST" = true ]; then
                echo "💾 Stashing current changes..."
                git stash push -m "Auto-stash before new task: $(date)"
            fi
            
            echo -n "Enter new branch name (feature/task-name): "
            read NEW_BRANCH
            
            if [ -n "$NEW_BRANCH" ]; then
                git checkout main 2>/dev/null || git checkout master 2>/dev/null || echo "Main branch not found"
                git checkout -b "$NEW_BRANCH"
                echo "✅ Switched to new branch: $NEW_BRANCH"
            else
                echo "❌ Branch name required"
                return 1
            fi
            ;;
        3)
            echo "🔄 Returning to main..."
            if [ "$CHANGES_EXIST" = true ]; then
                echo "💾 Stashing current changes..."
                git stash push -m "Auto-stash before main: $(date)"
            fi
            git checkout main 2>/dev/null || git checkout master 2>/dev/null
            echo "✅ Returned to main branch"
            ;;
        4)
            echo "⚠️ DESTRUCTIVE: Discarding all changes..."
            echo -n "Are you sure? Type 'yes' to confirm: "
            read CONFIRM
            if [ "$CONFIRM" = "yes" ]; then
                git checkout -- .
                git clean -fd
                echo "✅ All changes discarded"
            else
                echo "❌ Operation cancelled"
            fi
            ;;
        5)
            echo "📋 Detailed Git Status:"
            git status
            git log --oneline -5
            ;;
        6)
            echo "🛠️ Manual Recovery Commands:"
            echo ""
            echo "# Save current work:"
            echo "git stash push -m 'Manual backup'"
            echo ""
            echo "# Switch branches:"
            echo "git checkout main"
            echo "git checkout -b feature/new-task"
            echo ""
            echo "# Restore work:"
            echo "git stash pop"
            echo ""
            echo "# Fix dependencies:"
            echo "npm install --force"
            echo ""
            echo "# Fix build issues:"
            echo "npm run build"
            echo "npx tsc --noEmit"
            ;;
        7)
            echo "👋 Exiting without changes"
            exit 0
            ;;
        *)
            echo "❌ Invalid option: $option"
            return 1
            ;;
    esac
}

# 依存関係自動修復
fix_dependencies() {
    echo "🔧 Attempting to fix dependencies..."
    
    if [ -f "package.json" ]; then
        echo "📦 Running npm install..."
        if npm install; then
            echo "✅ Dependencies installed successfully"
        else
            echo "⚠️ npm install failed, trying with --force..."
            if npm install --force; then
                echo "✅ Dependencies installed with --force"
            else
                echo "❌ Dependency installation failed"
                echo "💡 Manual action required"
                return 1
            fi
        fi
        
        # Audit確認
        echo "🛡️ Running security audit..."
        npm audit --audit-level=high || echo "⚠️ Security vulnerabilities found"
    fi
}

# ビルド自動修復
fix_build_issues() {
    echo "🔧 Attempting to fix build issues..."
    
    if [ -f "tsconfig.json" ]; then
        echo "🔍 Checking TypeScript issues..."
        npx tsc --noEmit --pretty || echo "❌ TypeScript errors need manual fixing"
    fi
    
    if [ -f "package.json" ] && npm run build &> /dev/null; then
        echo "🏗️ Attempting build..."
        if npm run build; then
            echo "✅ Build successful"
        else
            echo "❌ Build failed - manual intervention required"
            return 1
        fi
    fi
}

# メイン実行フロー
main() {
    # 分析フェーズ
    analyze_git_state
    analyze_dependencies  
    analyze_build_state
    
    # インタラクティブ回復
    if [ $# -eq 0 ]; then
        show_recovery_options
        echo -n "Select option (1-7): "
        read OPTION
        auto_recovery $OPTION
    else
        # 非インタラクティブモード
        auto_recovery $1
    fi
    
    # 追加修復オプション
    echo ""
    echo -n "🔧 Attempt automatic dependency/build fixes? (y/n): "
    read FIX_OPTION
    
    if [ "$FIX_OPTION" = "y" ] || [ "$FIX_OPTION" = "Y" ]; then
        fix_dependencies
        fix_build_issues
    fi
    
    echo ""
    echo "🎉 Error recovery completed!"
    echo "📋 Final status:"
    git status --short 2>/dev/null || echo "Git status unavailable"
}

# スクリプト実行
main "$@"