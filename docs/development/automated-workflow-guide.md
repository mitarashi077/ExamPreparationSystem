# Automated Workflow Guide

## Overview

This guide describes the fully automated development workflow that prevents "commit and forget" scenarios by ensuring every change goes through proper PR review processes.

## Automated Workflow Steps

### 1. After Commit Hook (`after-commit`)

**Trigger**: Every git commit on feature branches (not main/develop)

**Actions**:
- ✅ **Detect Branch Type**: Skip if on protected branches (main/develop)
- 📝 **Extract Commit Info**: Get commit message for PR title
- 🚀 **Auto-Create PR**: Create PR with standardized format
- 👥 **Assign Reviewers**: Automatically assign quality-fixer + technical-designer
- 🏷️ **Add Labels**: Apply `auto-generated` label
- 📊 **Link to Project**: Add to ExamPreparationSystem project board

**Example Output**:
```
[Auto-PR Hook] Creating PR from feature branch...
✅ PR created: https://github.com/mitarashi077/ExamPreparationSystem/pull/8
🔄 Triggering automated review process...
```

### 2. After PR Creation Hook (`after-pr-creation`)

**Trigger**: Immediately after PR is created

**Actions**:
- 🔍 **Identify PR**: Detect newly created PR number
- ⚙️ **Assign Primary Reviewer**: quality-fixer for code quality review
- 🏗️ **Assign Approval Authority**: technical-designer for final approval
- 🏷️ **Smart Labeling**: Add labels based on file changes
- 📋 **Project Integration**: Update project board status

**Example Output**:
```
🔍 Starting automated review for PR #8
⚙️ Assigning quality-fixer for initial review...
🏗️ Assigning technical-designer for approval...
🏷️ Adding labels based on changes...
✅ PR review process initiated
```

## Review Process Flow

### Phase 1: Initial Review (quality-fixer)
- **Code Quality**: ESLint, Prettier, TypeScript compliance
- **Test Coverage**: Verify tests exist and pass
- **Security**: Check for vulnerabilities and best practices
- **Performance**: Identify potential performance issues
- **Documentation**: Ensure code is properly documented

### Phase 2: Technical Approval (technical-designer)
- **Architecture**: Review design decisions and patterns
- **Integration**: Assess impact on existing systems
- **Breaking Changes**: Identify and document any breaking changes
- **Documentation**: Verify technical documentation is complete
- **Final Approval**: Give go/no-go decision for merge

### Phase 3: Automated Actions
- **Merge**: Auto-merge if all reviews approve
- **Cleanup**: Delete feature branch after merge
- **Notifications**: Update all stakeholders
- **Project Board**: Move to "Done" column

## Hook Configuration

### Commit Hook Settings
```json
{
  "after-commit": {
    "trigger": "feature branches only",
    "creates": "PR with reviewers",
    "assigns": ["quality-fixer", "technical-designer"],
    "labels": ["auto-generated"],
    "project": "ExamPreparationSystem"
  }
}
```

### PR Creation Hook Settings
```json
{
  "after-pr-creation": {
    "trigger": "new PR detection",
    "enhances": "reviewer assignments",
    "adds": "smart labels",
    "integrates": "project board"
  }
}
```

## Prevented Anti-Patterns

### ❌ Before (Manual Process)
1. Developer commits code
2. Forgets to create PR
3. Code sits in feature branch
4. No review happens
5. Quality issues accumulate
6. Integration problems arise

### ✅ After (Automated Process)
1. Developer commits code
2. **Hook automatically creates PR**
3. **Hook assigns reviewers**
4. **quality-fixer reviews code quality**
5. **technical-designer approves design**
6. **Automated merge with notifications**

## Benefits

### 🚀 **Zero Forgotten PRs**
- Every commit on feature branch triggers PR creation
- No manual PR creation required
- Consistent PR format and metadata

### 👥 **Consistent Review Process**
- Always assigns the same specialized reviewers
- Ensures both code quality and architectural review
- Maintains review standards across all changes

### 📊 **Project Tracking**
- All PRs automatically added to project board
- Progress visible in real-time
- Milestone and label management automated

### 🔄 **Faster Feedback Loop**
- Immediate PR creation after commit
- Reviewers notified instantly
- Shorter time between code writing and review

## Customization Options

### Branch Protection
- Configure which branches trigger auto-PR
- Set different reviewers for different branch patterns
- Customize PR templates based on branch naming

### Reviewer Assignment
- Modify reviewer list in `.claude/settings.local.json`
- Add conditional logic for different file types
- Configure fallback reviewers

### Label Management
- Customize auto-generated labels
- Add smart labeling based on file changes
- Configure priority detection

## Troubleshooting

### Common Issues

1. **PR Creation Fails**
   - Check GitHub CLI authentication
   - Verify repository permissions
   - Ensure branch exists on remote

2. **Reviewer Assignment Fails**
   - Verify reviewer usernames exist
   - Check repository collaborator permissions
   - Ensure reviewers have appropriate access levels

3. **Hook Not Triggering**
   - Verify Claude Code configuration reload
   - Check hook syntax in settings file
   - Confirm PowerShell execution permissions

### Debug Commands
```powershell
# Test GitHub CLI connection
gh auth status

# List recent PRs
gh pr list --limit 5

# Check repository permissions
gh repo view --json permissions
```

## Integration with Existing Workflow

This automated system works seamlessly with:
- ✅ **Existing git-manager agent** for complex git operations
- ✅ **quality-fixer agent** for automated code improvements
- ✅ **technical-designer agent** for architecture decisions
- ✅ **Issue management system** for bug tracking
- ✅ **Project board integration** for progress tracking

The automation enhances rather than replaces the specialist agent system, ensuring every code change receives appropriate review and approval before reaching the main branch.