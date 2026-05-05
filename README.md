# AGENDA KERJA OPS GUGUS KH. ZAENAL MUSTOFA

Aplikasi Todo List Kolaboratif untuk komunitas pendidikan.

## ✨ Fitur

- 🔐 Login dengan Google OAuth
- 👥 Kolaborasi Tim (5-10 anggota)
- 📋 Task Management dengan Tanggal Mulai & Akhir
- ⭐ Priority Levels (P1-P4)
- 📅 Multiple Views (List, Kanban, Calendar)
- 🏷️ Labels & Tags
- 💬 Comments & Diskusi
- 📱 Responsive Design (Mobile + Desktop)

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui
- **Auth**: NextAuth.js (Google OAuth)
- **Database**: PostgreSQL (Prisma ORM)
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL Database
- Google Cloud Console Project

### Installation

```bash
# Install dependencies
npm install

# Setup Environment
cp .env.example .env
# Edit .env dengan credential Anda

# Generate Prisma Client
npx prisma generate

# Push schema ke database
npx prisma db push

# Run development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## 📖 Setup Guide

Lihat folder setup untuk panduan lengkap:

- `SETUP-STEP1.md` - Google OAuth Setup
- `SETUP-STEP2.md` - Database Setup  
- `SETUP-STEP3.md` - Environment & Run
- `SETUP-GITHUB.md` - GitHub Integration

## 📁 Project Structure

```
src/
├── app/           # Next.js App Router
├── components/     # React Components
│   ├── ui/        # UI Components
│   └── task/      # Task Components
├── lib/           # Utilities
├── types/         # TypeScript Types
└── hooks/          # Zustand Stores
prisma/
└── schema.prisma  # Database Schema
```

## 📜 License

MIT License

---

Made with ❤️ for SD Negeri Pasirhalang