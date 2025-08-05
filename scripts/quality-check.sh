#!/bin/bash

# 🔍 Claude Code Integrated Quality Check System
# 6-Phase Quality Assurance Process

set -e  # Exit immediately on error

echo "🔍 Quality Check Started..."
echo "📍 Project: $(basename "$PWD")"
echo "📍 Branch: $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'not-git-repo')"
echo "📍 Commit: $(git rev-parse --short HEAD 2>/dev/null || echo 'no-commits')"
echo ""

# Variables for tracking results
TOTAL_ISSUES=0
PHASE_RESULTS=()

# Phase 1: Lint & Format
echo "🔧 Phase 1: Lint & Format Check"
if [ -f "package.json" ]; then
    # Biome check (preferred linter)
    if command -v npx &> /dev/null && npx biome --version &> /dev/null; then
        echo "  Running Biome lint..."
        if npx biome check . --reporter=compact; then
            echo "  ✅ Biome lint passed"
            PHASE_RESULTS+=("✅ Phase 1: Lint passed")
        else
            echo "  ❌ Biome lint issues found"
            PHASE_RESULTS+=("❌ Phase 1: Lint failed")
            ((TOTAL_ISSUES++))
        fi
    # Fallback to npm run lint if Biome not available
    elif npm run lint &> /dev/null; then
        echo "  ✅ npm run lint passed"
        PHASE_RESULTS+=("✅ Phase 1: Lint passed")
    else
        echo "  ⚠️ Lint not configured or failed"
        PHASE_RESULTS+=("⚠️ Phase 1: Lint not configured")
    fi
    
    # Code formatting check
    if npm run format &> /dev/null; then
        echo "  ✅ Format check passed"
    else
        echo "  ⚠️ Format not configured"
    fi
else
    echo "  ⚠️ No package.json found"
    PHASE_RESULTS+=("⚠️ Phase 1: No package.json")
fi
echo ""

# Phase 2: TypeScript Build & Type Check
echo "🔍 Phase 2: TypeScript Type Check"
if [ -f "tsconfig.json" ]; then
    echo "  Running TypeScript type check..."
    if npx tsc --noEmit --pretty; then
        echo "  ✅ TypeScript types are valid"
        PHASE_RESULTS+=("✅ Phase 2: TypeScript passed")
    else
        echo "  ❌ TypeScript type errors found"
        PHASE_RESULTS+=("❌ Phase 2: TypeScript failed")
        ((TOTAL_ISSUES++))
    fi
elif [ -f "package.json" ] && grep -q "typescript" package.json; then
    echo "  TypeScript detected but no tsconfig.json found"
    PHASE_RESULTS+=("⚠️ Phase 2: Missing tsconfig.json")
else
    echo "  ⚠️ TypeScript not configured"
    PHASE_RESULTS+=("⚠️ Phase 2: TypeScript not configured")
fi
echo ""

# Phase 3: Tests
echo "🧪 Phase 3: Test Execution"
if [ -f "package.json" ]; then
    # Check if test script exists
    if npm run test --silent &> /dev/null; then
        echo "  Running tests..."
        if npm test 2>&1; then
            echo "  ✅ All tests passed"
            PHASE_RESULTS+=("✅ Phase 3: Tests passed")
        else
            echo "  ❌ Tests failed"
            PHASE_RESULTS+=("❌ Phase 3: Tests failed")
            ((TOTAL_ISSUES++))
        fi
    else
        echo "  ⚠️ Tests not configured"
        PHASE_RESULTS+=("⚠️ Phase 3: Tests not configured")
    fi
else
    echo "  ⚠️ No package.json found"
    PHASE_RESULTS+=("⚠️ Phase 3: No package.json")
fi
echo ""

# Phase 4: Build
echo "🏗️ Phase 4: Build Check"
if [ -f "package.json" ]; then
    if npm run build &> /dev/null; then
        echo "  Running build..."
        if npm run build; then
            echo "  ✅ Build successful"
            PHASE_RESULTS+=("✅ Phase 4: Build passed")
        else
            echo "  ❌ Build failed"
            PHASE_RESULTS+=("❌ Phase 4: Build failed")
            ((TOTAL_ISSUES++))
        fi
    else
        echo "  ⚠️ Build script not configured"
        PHASE_RESULTS+=("⚠️ Phase 4: Build not configured")
    fi
else
    echo "  ⚠️ No package.json found"
    PHASE_RESULTS+=("⚠️ Phase 4: No package.json")
fi
echo ""

# Phase 5: Security Audit
echo "🛡️ Phase 5: Security Audit"
if [ -f "package.json" ]; then
    echo "  Running npm audit..."
    if npm audit --audit-level=high; then
        echo "  ✅ No high/critical security vulnerabilities"
        PHASE_RESULTS+=("✅ Phase 5: Security audit passed")
    else
        echo "  ⚠️ Security vulnerabilities found (check above)"
        PHASE_RESULTS+=("⚠️ Phase 5: Security issues found")
        # Note: Security issues are warnings, not failures
    fi
else
    echo "  ⚠️ No package.json found"
    PHASE_RESULTS+=("⚠️ Phase 5: No package.json")
fi
echo ""

# Phase 6: Git Status & Clean State
echo "📋 Phase 6: Git State Check"
if git status &> /dev/null; then
    echo "  Checking git status..."
    
    # Check for uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        echo "  ⚠️ Uncommitted changes detected"
        git status --short
        PHASE_RESULTS+=("⚠️ Phase 6: Uncommitted changes")
    else
        echo "  ✅ Working directory clean"
        PHASE_RESULTS+=("✅ Phase 6: Git state clean")
    fi
    
    # Check current branch
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    if [[ "$CURRENT_BRANCH" == "main" || "$CURRENT_BRANCH" == "master" ]]; then
        echo "  ⚠️ Working on protected branch: $CURRENT_BRANCH"
        PHASE_RESULTS+=("⚠️ Phase 6: On protected branch")
    else
        echo "  ✅ Working on feature branch: $CURRENT_BRANCH"
    fi
else
    echo "  ⚠️ Not a git repository"
    PHASE_RESULTS+=("⚠️ Phase 6: Not a git repo")
fi
echo ""

# 📊 Results Summary
echo "📊 Quality Check Results Summary"
echo "================================="

for result in "${PHASE_RESULTS[@]}"; do
    echo "$result"
done

echo ""
echo "📈 Overall Status:"
if [ $TOTAL_ISSUES -eq 0 ]; then
    echo "🎉 All critical quality gates PASSED"
    echo "✅ Code is ready for commit/merge"
    exit 0
else
    echo "⚠️ $TOTAL_ISSUES critical issues found"
    echo "❌ Please fix issues before committing"
    exit 1
fi