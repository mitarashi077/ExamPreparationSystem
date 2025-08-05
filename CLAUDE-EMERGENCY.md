# 🚨 Emergency 3-Second Check

> **CRITICAL**: Execute this check immediately upon receiving new tasks

## Mandatory Steps for New Tasks

### **STEP 1**: Git Status Check
```bash
git status
```
**Verify**:
- Current branch name
- Uncommitted changes existence
- Working directory state

### **STEP 2**: Task Classification
Determine which category applies:

- [ ] **Continue current work** → Proceed immediately
- [ ] **New task** → Branch switch REQUIRED
- [ ] **Emergency fix** → Create hotfix branch
- [ ] **Documentation update** → Create docs branch

### **STEP 3**: For new tasks, execute mandatory:
```bash
# Save current changes (if any)
git stash push -m "Work in progress: $(date)"

# Switch to main branch
git checkout main

# Create new branch
git checkout -b feature/new-task-name
```

## 🎯 Branch Naming Standards

### **Required Patterns**
- `feature/task-description` - New features
- `fix/bug-description` - Bug fixes
- `docs/document-type` - Documentation
- `hotfix/critical-issue` - Emergency fixes

### **Examples**
```bash
git checkout -b feature/user-authentication
git checkout -b fix/login-validation-error
git checkout -b docs/api-documentation
git checkout -b hotfix/security-vulnerability
```

## ⚠️ When in Doubt

**Always switch branches (fail-safe approach)**

Reasoning:
- Prevents direct commits to main branch
- Maintains work separation and traceability
- Enables easy merge/rollback later
- Follows development best practices

## 🔥 Absolute Prohibitions

### **❌ NEVER DO**
- Direct commits to main branch
- Mixed-feature commits
- Work without branch verification
- Push untested code

### **✅ ALWAYS DO**
- Verify branch before starting work
- Make atomic commits
- Run quality checks before commit
- Use descriptive commit messages

## 🚀 Quick Recovery Commands

### **Wrong branch work recovery**
```bash
# Save changes
git stash push -m "Wrong branch work"

# Switch to correct branch
git checkout correct-branch-name

# Restore changes
git stash pop
```

### **Emergency cleanup**
```bash
# Check all changes
git status

# Discard unwanted changes
git checkout -- .

# Return to main
git checkout main
```

---

**🎯 If you're reading this, you forgot something. Re-read CLAUDE.md immediately.**