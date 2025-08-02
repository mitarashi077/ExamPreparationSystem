# Embedded Systems Specialist Exam Preparation System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![PWA](https://img.shields.io/badge/PWA-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

A mobile-optimized learning system for efficient study support for the IPA Embedded Systems Specialist Examination.

**[日本語版README](README.ja.md)**

## 🎯 Project Overview

### Purpose
- Systematic learning support in accordance with the Embedded Systems Specialist Examination syllabus
- Multi-device learning experience on PC, smartphone, and tablet
- Efficient learning utilizing commuting time and other available moments

### Key Features
- 📱 **PWA Support** - App-like user experience with offline learning capabilities
- 🎯 **Subject-specific Practice** - Systematic question classification compliant with IPA syllabus
- 📊 **Heatmap Visualization** - Visual understanding of learning progress and weak areas
- 🚂 **Commute Learning Optimization** - Short-session focused mode with pause/resume functionality
- 📈 **Learning Analytics** - Detailed cross-device learning data analysis

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0 or higher
- npm 8.0 or higher

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/ExamPreparationSystem.git
cd ExamPreparationSystem

# Install all dependencies
npm run install:all

# Initialize database
npm run db:push
npm run db:generate

# Seed initial data
cd database && npm run seed
```

### Start Development Server
```bash
# Start both frontend (port 3003) and backend (port 3001)
npm run dev

# Individual startup is also possible
npm run dev:frontend  # Frontend only
npm run dev:backend   # Backend only
```

### Access
- **Frontend**: http://localhost:3003
- **Backend API**: http://localhost:3001
- **Prisma Studio**: `npm run db:studio`

### Mobile Access
Accessible from smartphones on the same network:
- **Smartphone**: http://[PC IP Address]:3003
- Example: http://192.168.0.126:3003

## 🏗️ Tech Stack

### Frontend
- **React 18** + **TypeScript** - Modern UI development
- **Material-UI (MUI)** - Responsive design components
- **Vite** - Fast build tool
- **PWA (Workbox)** - Offline support and app-like experience
- **Zustand** - Lightweight state management
- **React Router** - Client-side routing

### Backend
- **Node.js** + **Express** - RESTful API server
- **TypeScript** - Type-safe development
- **Prisma** - Type-safe ORM
- **SQLite** - Lightweight database (optimized for personal use)

### Development & Quality
- **ESLint** + **Prettier** - Code quality and formatting
- **Helmet** + **CORS** - Security measures
- **Morgan** - Logging

## 📂 Project Structure

```
ExamPreparationSystem/
├── frontend/                 # React PWA Frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── stores/         # Zustand stores
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── vite.config.ts      # Vite configuration
├── backend/                  # Express API Server
│   ├── src/
│   │   ├── controllers/    # API controllers
│   │   ├── routes/         # Route definitions
│   │   ├── models/         # Data models
│   │   ├── middleware/     # Express middleware
│   │   └── utils/          # Backend utilities
│   └── tsconfig.json       # TypeScript configuration
├── database/                 # Database related
│   ├── schema.prisma       # Prisma schema definition
│   ├── seed.ts            # Initial data
│   └── exam_prep.db       # SQLite database
└── docs/                    # Project documentation
```

## 🎮 Usage

### Basic Learning Flow
1. **Home Screen** - Overview of learning status
2. **Practice Problems** - Challenge subject-specific or random questions
3. **Progress Check** - Identify weak areas with heatmap
4. **Review** - Focus on incorrectly answered questions

### Mobile Optimization Features
- **Swipe Navigation**: Move between questions
- **Tap Controls**: Large buttons for answer selection
- **Pinch Zoom**: Detailed view of circuit and system diagrams
- **Offline Learning**: Practice questions without network connection

### Commute Learning Mode
- **Time-limited Mode**: 5, 10, 15-minute focused learning sessions
- **Pause/Resume**: Learning continuity for train transfers
- **Lightweight Data**: Optimized for low-bandwidth environments

## 📊 Data Structure

### Supported Exam Areas (IPA Syllabus Compliant)
- Computer Systems
- System Components
- Software (OS, RTOS, Firmware)
- Hardware (Processors, Memory, Peripherals)
- Human Interface
- Multimedia
- Database
- Network
- Security
- System Development Technology

### Learning Data Management
- Subject-specific accuracy rate recording
- Learning time tracking
- Device-specific learning pattern analysis
- Automatic accumulation of incorrect questions

## 🤖 Sub-Agent Architecture

This project uses specialized sub-agents for efficient development workflow with clear responsibility separation:

### Agent Workflow Stages
1. **Implementation Stage**: `task-executor`, `frontend-executor`, `backend-executor`
2. **Quality Check Stage**: `quality-fixer`
3. **Git Operations Stage**: `git-manager` (exclusive)
4. **Review Stage**: `document-reviewer`
5. **Approval Stage**: `technical-designer`

### Agent Responsibilities

#### Implementation Agents
- **`task-executor`**: General task execution and coordination
- **`frontend-executor`**: React/TypeScript frontend implementation
- **`backend-executor`**: Node.js/Express/Prisma backend implementation

#### Quality & Review Agents
- **`quality-fixer`**: Code quality, linting, type error fixes
- **`document-reviewer`**: Documentation review and improvement
- **`technical-designer`**: Technical design and architecture approval

#### Git Operations Agent
- **`git-manager`**: **Exclusive Git operations** (commits, branches, PRs, merges)
  - All other agents are **prohibited** from Git operations
  - Ensures atomic commits and proper workflow management
  - Handles branch protection and merge conflict resolution

### Workflow Protection Rules
- **Atomic Commits**: Maximum 3 files per commit (unless tightly coupled)
- **Responsibility Separation**: Each agent focuses on their specialization
- **Git Operation Restriction**: Only `git-manager` can perform Git operations
- **Manual Merge Control**: Auto-merge disabled for conflict prevention
- **Branch Protection**: Direct commits to `main` blocked, requires PR workflow

## 🔄 Development Workflow Examples

### Basic Feature Development Workflow

#### Step 1: Feature Branch Creation (via `git-manager`)
```bash
# Check current branch (avoid working on main)
git branch

# If on main, create feature branch immediately
git checkout -b feature/add-bookmark-system

# Pull latest changes
git pull origin main
```

#### Step 2: Implementation (via specialized agents)
```bash
# Backend API implementation (backend-executor)
# Files: backend/src/controllers/bookmarkController.ts
git add backend/src/controllers/bookmarkController.ts
git commit -m "feat: add bookmark API controller"

# Database schema update (backend-executor)
# Files: database/schema.prisma
git add database/schema.prisma
git commit -m "feat: add bookmark table schema"

# Frontend component implementation (frontend-executor)
# Files: frontend/src/components/BookmarkButton.tsx
git add frontend/src/components/BookmarkButton.tsx
git commit -m "feat: add bookmark button component"

# Frontend integration (frontend-executor)
# Files: frontend/src/pages/PracticePage.tsx
git add frontend/src/pages/PracticePage.tsx
git commit -m "feat: integrate bookmark functionality"
```

#### Step 3: Quality Assurance (via `quality-fixer`)
```bash
# Lint and type checking
npm run lint
npm run type-check

# Fix any issues found
git add .
git commit -m "fix: resolve lint and type errors"
```

#### Step 4: Documentation (via `document-reviewer`)
```bash
# Update API documentation
git add docs/api/bookmarks.md
git commit -m "docs: add bookmark API documentation"

# Update README if needed
git add README.md
git commit -m "docs: update README with bookmark feature"
```

#### Step 5: PR Creation & Review (via `git-manager`)
```bash
# Push feature branch
git push -u origin feature/add-bookmark-system

# Create PR using GitHub CLI
gh pr create --title "feat: add bookmark system" --body "$(cat <<'EOF'
## Summary
- Add bookmark functionality for practice questions
- Backend API implementation with Prisma
- Frontend component integration with Material-UI

## Test plan
- [ ] Test bookmark creation/deletion
- [ ] Test persistence across sessions
- [ ] Test mobile responsiveness

🤖 Generated with [Claude Code](https://claude.ai/code)
EOF
)"
```

### Agent-Based Development Process

#### When to Use Each Agent

**🎯 task-executor**
- General task coordination
- Cross-cutting concerns implementation
- Integration testing

Example:
```bash
# Use for general features affecting multiple layers
@task-executor "Implement user authentication system"
```

**⚛️ frontend-executor**  
- React component development
- TypeScript frontend logic
- Material-UI integration
- PWA features

Example:
```bash
# Use for frontend-specific tasks
@frontend-executor "Create responsive navigation menu with Material-UI"
```

**🚀 backend-executor**
- Node.js/Express API development
- Prisma database operations
- Backend TypeScript logic

Example:
```bash
# Use for backend-specific tasks
@backend-executor "Implement RESTful API for user management"
```

**🔧 quality-fixer**
- ESLint/Prettier fixes
- TypeScript type errors
- Code quality improvements

Example:
```bash
# Use after implementation for quality assurance
@quality-fixer "Fix all linting and type errors in the codebase"
```

**📋 document-reviewer**
- Documentation review and improvement
- README updates  
- API documentation

Example:
```bash
# Use for documentation tasks
@document-reviewer "Review and improve API documentation"
```

**📦 git-manager** (🔥 Exclusive Git Operations 🔥)
- All commit operations
- Branch management
- PR creation and management
- Merge conflict resolution

Example:
```bash
# Use for ALL git operations
@git-manager "Create atomic commits for the bookmark feature and open PR"
```

#### Agent Switching Best Practices

**✅ DO:**
```bash
# Correct agent usage for each specialization
@backend-executor "Implement user API"     # Backend work
@git-manager "Commit and push changes"    # Git operations
@frontend-executor "Create login form"    # Frontend work
@quality-fixer "Fix lint errors"          # Quality assurance
```

**❌ DON'T:**
```bash
# Wrong agent usage - mixing responsibilities
@backend-executor "Implement API and commit changes"  # ❌ No Git access
@frontend-executor "Create component and push"        # ❌ No Git access
@quality-fixer "Fix errors, commit and deploy"        # ❌ No Git access
```

### Troubleshooting Common Issues

#### Issue 1: Agent Permission Errors
```bash
# Problem: backend-executor trying to use git commands
Error: Agent backend-executor is not allowed to perform git operations

# Solution: Switch to git-manager
@git-manager "Commit the backend changes made by backend-executor"
```

#### Issue 2: Atomic Commit Violations
```bash
# Problem: Too many files in one commit
git status
# Shows: 15 files changed

# Solution: Split into logical commits
git add backend/src/controllers/userController.ts
git commit -m "feat: add user controller"

git add frontend/src/components/UserProfile.tsx
git commit -m "feat: add user profile component"

git add docs/api/users.md
git commit -m "docs: add user API documentation"
```

#### Issue 3: Branch Protection Violations
```bash
# Problem: Trying to commit directly to main
git branch
# Shows: * main

# Solution: Create feature branch first
git checkout -b feature/your-feature-name
# Now implement and commit
```

#### Issue 4: Agent Specialization Confusion
```bash
# Problem: Using wrong agent for the task

# Frontend tasks → Use frontend-executor
@frontend-executor "Create Material-UI dashboard component"

# Backend tasks → Use backend-executor  
@backend-executor "Implement Prisma database queries"

# Git operations → Use git-manager (ONLY)
@git-manager "Create PR with atomic commits"

# Quality issues → Use quality-fixer
@quality-fixer "Resolve ESLint warnings and TypeScript errors"

# Documentation → Use document-reviewer
@document-reviewer "Review and improve technical documentation"
```

#### Issue 5: Development Workflow Optimization

**For Small Changes (< 1 hour):**
```bash
@task-executor "Quick bug fix for login validation"
@git-manager "Commit and push the fix"
```

**For Medium Features (1-3 hours):**
```bash
@frontend-executor "Implement responsive header component"
@backend-executor "Create corresponding API endpoints"  
@quality-fixer "Ensure code quality compliance"
@git-manager "Create atomic commits and PR"
```

**For Large Features (> 3 hours):**
```bash
@workflow-orchestrator "Implement complete user management system with frontend, backend, and documentation"
# This will automatically coordinate multiple agents
```

## 🛠️ Development Commands

```bash
# Development
npm run dev                 # Start development server
npm run dev:frontend       # Frontend only
npm run dev:backend        # Backend only

# Build
npm run build              # Full build
npm run build:frontend     # Frontend build
npm run build:backend      # Backend build

# Database
npm run db:generate        # Generate Prisma client
npm run db:push           # Apply schema to database
npm run db:studio         # Start Prisma Studio
cd database && npm run seed # Seed initial data

# Code Quality
npm run lint              # Full lint
npm run lint:frontend     # Frontend lint
npm run lint:backend      # Backend lint
```

## 🗺️ Development Roadmap

### Phase 1: MVP Foundation ✅ Complete
- [x] Project structure setup
- [x] PWA & mobile support setup
- [x] Database design & initialization
- [x] Basic responsive UI

### Phase 2: Practice System ✅ Complete
- [x] Question management API implementation
- [x] Mobile-optimized question display
- [x] Answer processing & progress recording
- [x] Touch-enabled UI implementation
- [x] Smartphone-responsive design

### Phase 3: Heatmap & Progress Visualization 📋 Planned
- [ ] Touch-enabled heatmap
- [ ] Mobile dashboard
- [ ] Commute learning specialized progress management

### Phase 4: Advanced Features 🔮 Future
- [ ] AI scoring system
- [ ] Adaptive questioning
- [ ] 3D visualization

## 🤝 Contributing

This project is developed for personal learning purposes, but improvement suggestions and bug reports are welcome.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is released under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [IPA (Information-technology Promotion Agency)](https://www.ipa.go.jp/) - Exam guidelines and syllabus
- [Material-UI](https://mui.com/) - Beautiful UI components
- [Prisma](https://www.prisma.io/) - Type-safe database access

## 📞 Support

If you have any issues or questions, please let us know at [Issues](https://github.com/your-username/ExamPreparationSystem/issues).

---

**⚡ Aim for success in the Embedded Systems Specialist Examination with efficient learning!**