# PR & Issue Management Guide

## Overview

This document outlines the automated and manual processes for managing Pull Requests and Issues in the ExamPreparationSystem project.

## Pull Request Configuration

### Auto-Assignment System

Every PR automatically receives:

#### **Reviewers**
- **Primary Reviewer**: `quality-fixer` (code quality, tests, standards)
- **Secondary Reviewer**: `technical-designer` (architecture, design decisions)
- **File-based Assignment**:
  - `frontend/` changes → Frontend specialist
  - `backend/` changes → Backend specialist
  - `docs/` changes → Documentation reviewer
  - `database/` changes → Database reviewer

#### **Assignees**
- **Auto-assigned**: PR author (responsibility for completion)
- **Additional**: Relevant team members based on file changes

#### **Labels**
- **Type Labels**: `enhancement`, `bug`, `documentation`, `maintenance`
- **Component Labels**: `frontend`, `backend`, `database`, `documentation`
- **Priority Labels**: `priority:critical`, `priority:high`, `priority:medium`, `priority:low`

#### **Projects**
- **Default**: `ExamPreparationSystem` project board
- **Auto-tracking**: Progress through development stages

#### **Milestone**
- **Auto-detection**: Based on version tags and release planning
- **Manual Override**: Available for specific release targeting

#### **Development**
- **Linked Issues**: Automatically detect `Closes #123`, `Fixes #456`
- **Branch Protection**: Prevent direct pushes to main/develop
- **Status Checks**: Required CI/CD passes before merge

## Issue Configuration

### Auto-Assignment System

Every Issue automatically receives:

#### **Assignees**
- **Bug Reports**: `issue-resolver` (automated investigation)
- **Feature Requests**: `technical-designer` (planning and design)
- **Questions**: `general-purpose` (support and guidance)
- **Auto-generated Issues**: `quality-fixer` (automated fixes)

#### **Labels**
- **Issue Type**: `bug`, `enhancement`, `question`, `auto-generated`
- **Status Labels**: `needs-investigation`, `needs-planning`, `needs-response`
- **Priority Labels**: `priority:critical`, `priority:high`, `priority:medium`, `priority:low`
- **Component Labels**: `frontend`, `backend`, `database`, `documentation`

#### **Projects**
- **Default**: `ExamPreparationSystem` project board
- **Automatic**: Added to relevant project columns based on type

#### **Milestone**
- **Bug Fixes**: Current patch release
- **Features**: Next minor/major release
- **Auto-detection**: Based on priority and complexity

## Issue Templates

### 🐛 Bug Report Template
```yaml
name: Bug Report
labels: ['bug', 'needs-investigation']
assignees: ['issue-resolver']
projects: ['ExamPreparationSystem']
```

**Includes**:
- Detailed reproduction steps
- Environment information
- Expected vs actual behavior
- Priority assessment
- Automatic triaging

### ✨ Feature Request Template
```yaml
name: Feature Request
labels: ['enhancement', 'needs-planning']
assignees: ['technical-designer']
projects: ['ExamPreparationSystem']
```

**Includes**:
- Problem statement and user stories
- Acceptance criteria
- Technical requirements
- Priority assessment
- Mockups/wireframes section

### ❓ Question Template
```yaml
name: Question
labels: ['question', 'needs-response']
assignees: ['general-purpose']
projects: ['ExamPreparationSystem']
```

**Includes**:
- Context and research done
- Environment details (if relevant)
- Links to documentation

## Workflow Automation

### PR Workflow
1. **Creation**: Auto-assign reviewers, labels, project
2. **Review**: Quality checks by assigned reviewers
3. **Approval**: Technical approval by `technical-designer`
4. **Merge**: Automated if all checks pass
5. **Cleanup**: Auto-delete feature branch

### Issue Workflow
1. **Creation**: Auto-assign based on template
2. **Triage**: Priority and component assignment
3. **Assignment**: Route to appropriate specialist
4. **Resolution**: Track progress through project board
5. **Closure**: Link to resolving PR

## Review Responsibilities

### Quality-Fixer (Primary Reviewer)
- Code quality and standards compliance
- Test coverage and reliability
- ESLint/TypeScript errors
- Performance considerations

### Technical-Designer (Approval Authority)
- Architecture and design decisions
- Integration compatibility
- Breaking changes assessment
- Documentation completeness

### Specialized Reviewers
- **Frontend**: UI/UX, responsive design, PWA compliance
- **Backend**: API design, database optimization, security
- **Database**: Schema changes, migration safety
- **Documentation**: Clarity, completeness, accuracy

## Project Board Integration

### PR Columns
1. **Draft** - Work in progress
2. **Ready for Review** - Awaiting reviewer assignment
3. **In Review** - Under active review
4. **Approved** - Ready to merge
5. **Merged** - Completed

### Issue Columns
1. **New** - Recently created, awaiting triage
2. **Triaged** - Assigned and prioritized
3. **In Progress** - Active development
4. **Testing** - Under verification
5. **Done** - Resolved and closed

## Automated Actions

### On PR Creation
- Assign reviewers based on file changes
- Add appropriate labels
- Set default assignee (author)
- Add to project board
- Link related issues

### On Issue Creation
- Parse template for auto-labeling
- Assign based on issue type
- Set priority from content analysis
- Add to project board
- Notify relevant team members

### On PR Merge
- Auto-close linked issues
- Update project board status
- Trigger deployment (if applicable)
- Create release notes entry

## Configuration Files

- `.github/ISSUE_TEMPLATE/` - Issue templates
- `.github/pull_request_template.md` - PR template
- `.github/workflows/auto-assign.yml` - Auto-assignment logic
- `.claude/settings.local.json` - Agent review assignments

This system ensures consistent, efficient handling of all PRs and Issues with appropriate oversight and automation.