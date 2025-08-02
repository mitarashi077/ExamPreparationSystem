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