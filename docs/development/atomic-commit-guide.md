# Atomic Commit Guide

## Overview

This guide enforces atomic commits to ensure clean, reviewable, and revertible git history. Every commit must represent exactly one logical change.

## What is an Atomic Commit?

An atomic commit is a commit that:
- ✅ **Contains exactly one logical change**
- ✅ **Can be reverted independently without breaking other features**
- ✅ **Has a clear, single purpose**
- ✅ **Passes all tests and quality checks**

## Atomic Commit Rules

### 🔥 **MANDATORY Rules**

#### 1. **One Change Type Per Commit**
- ❌ **NEVER mix**: frontend + backend + documentation
- ✅ **ALWAYS separate**: each file type gets its own commit

#### 2. **File Count Limits**
- ❌ **NEVER commit more than 3 files** unless tightly coupled
- ✅ **PREFER 1-2 files per commit**
- ✅ **Exception**: Tightly coupled files (e.g., Component + CSS + Test)

#### 3. **Specific File Staging**
- ❌ **NEVER use**: `git add .` or `git add -A`
- ✅ **ALWAYS use**: `git add <specific-file-path>`
- ✅ **REVIEW**: `git diff --cached` before commit

#### 4. **Logical Sequence**
Follow this implementation order:
1. **Database/Schema changes**
2. **Backend API implementation**
3. **Frontend implementation**
4. **Documentation updates**
5. **Test additions**
6. **Configuration changes**

## Commit Message Standards

### Format
```
type: brief description (max 50 chars)

Detailed explanation of WHY this change was made
(wrap at 72 characters)

- Specific change 1
- Specific change 2
- Specific change 3
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests
- `chore`: Maintenance tasks, dependency updates

## Examples

### ✅ **GOOD Atomic Commits**

```bash
# Sequence for adding bookmark feature
git add backend/models/bookmark.js
git commit -m "feat: add Bookmark model with validation"

git add backend/routes/bookmarks.js
git commit -m "feat: add bookmark CRUD API endpoints"

git add frontend/components/BookmarkButton.tsx
git commit -m "feat: add bookmark button component"

git add frontend/pages/BookmarksPage.tsx
git commit -m "feat: add bookmarks management page"

git add docs/api/bookmarks.md
git commit -m "docs: add bookmark API documentation"
```

### ❌ **BAD Non-Atomic Commits**

```bash
# DON'T DO THIS - Too many changes at once
git add .
git commit -m "feat: complete bookmark system"
# Changes: 15 files, backend + frontend + docs + tests
```

## Enforcement Mechanisms

### 1. **Pre-commit Hook**
```bash
#!/bin/sh
# Check file count in staged changes
staged_files=$(git diff --cached --name-only | wc -l)
if [ $staged_files -gt 3 ]; then
    echo "❌ ERROR: Too many files staged ($staged_files)"
    echo "✅ SOLUTION: Split into atomic commits"
    echo "📝 GUIDE: docs/development/atomic-commit-guide.md"
    exit 1
fi
```

### 2. **Agent Instructions**
All development agents must:
- Stage only relevant files for their specific change
- Never use `git add .` or `git add -A`
- Create commits immediately after completing atomic units
- Follow the logical implementation sequence

### 3. **PR Review Requirements**
- PRs with non-atomic commits will be rejected
- Reviewers must verify commit atomicity
- Force-push to fix commit history is required

## Tools and Commands

### Staging Specific Files
```bash
# Good: Stage specific files only
git add src/components/BookmarkButton.tsx
git add src/components/BookmarkButton.css

# Bad: Stage everything
git add .
```

### Reviewing Changes Before Commit
```bash
# Check what will be committed
git diff --cached

# Check file list
git diff --cached --name-only

# Interactive staging for partial changes
git add -p <file>
```

### Splitting Large Changes
```bash
# Reset if you accidentally staged too much
git reset HEAD

# Stage files one by one
git add file1.js
git commit -m "feat: implement feature A"

git add file2.js
git commit -m "feat: implement feature B"
```

## Benefits of Atomic Commits

### 🔍 **Better Code Review**
- Reviewers can focus on one change at a time
- Easier to understand the purpose of each change
- Faster review process

### 🐛 **Easier Debugging**
- `git bisect` works effectively
- Can revert specific changes without affecting others
- Clear history of what changed when

### 🔄 **Safer Refactoring**
- Individual commits can be reverted safely
- Cherry-picking specific changes between branches
- Reduced merge conflicts

### 📊 **Better Project Tracking**
- Accurate commit statistics
- Clear feature completion tracking
- Better understanding of development velocity

## Common Anti-Patterns to Avoid

### ❌ **The "Everything" Commit**
```bash
git add .
git commit -m "feat: implement entire booking system"
# 47 files changed, 2,847 insertions(+), 123 deletions(-)
```

### ❌ **The "Mixed Concerns" Commit**
```bash
git commit -m "feat: add booking API and fix CSS and update docs"
# backend/api.js, frontend/styles.css, docs/readme.md
```

### ❌ **The "WIP" Commit**
```bash
git commit -m "WIP: working on stuff"
# Unclear what was actually implemented
```

### ❌ **The "Fix Everything" Commit**
```bash
git commit -m "fix: various bugs and improvements"
# Multiple unrelated fixes in one commit
```

## Automation Integration

This atomic commit policy is enforced through:
- ✅ **Pre-commit hooks** preventing large commits
- ✅ **Agent instructions** for automated commits
- ✅ **PR review requirements** checking commit history
- ✅ **Documentation** providing clear guidelines

Following these rules ensures maintainable, reviewable, and professional git history that supports long-term project success.