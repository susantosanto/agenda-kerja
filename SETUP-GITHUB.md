# 🚀 GitHub Integration
## Push Project ke GitHub

---

## 📋 Langkah 1: Buat GitHub Repository

1. Buka **https://github.com/new**
2. Isi detail:
   - **Repository name**: `agenda-kerja-gugus`
   - **Description**: "Aplikasi Todo List Kolaboratif - AGENDA KERJA OPS GUGUS KH. ZAENAL MUSTOFA"
   - **Public** / **Private** (pilih sesuai preferensi)
3. Klik **"Create repository"**

---

## 📋 Langkah 2: Initialize Git & Push

Buka **PowerShell** dan jalankan:

```powershell
# 1. Masuk ke folder project
cd D:\project\todolist

# 2. Initialize Git (jika belum ada)
git init

# 3. Set branch ke main
git branch -M main

# 4. Add all files
git add .

# 5. First commit
git commit -m "Initial commit: Agenda Kerja Gugus Kh. Zaenal Mustofa"

# 6. Set remote (ganti URL sesuai repo GitHub Anda)
git remote add origin https://github.com/YOUR_USERNAME/agenda-kerja-gugus.git

# 7. Push ke GitHub
git push -u origin main
```

---

## 📋 Checklist GitHub Integration

| Step | Status | Catatan |
|------|--------|--------|
| 1. Buat Repo | [ ] | URL: https://github.com/________/________ |
| 2. Git Init | [ ] | |
| 2. Add Files | [ ] | |
| 2. First Commit | [ ] | |
| 2. Set Remote | [ ] | |
| 2. Push | [ ] | |

---

## ⚠️ Catatan Penting!

**SEBELUM PUSH** - Pastikan file `.env` sudah di-gitignore:

File `.env` tidak boleh di-commit ke GitHub karena berisi sensitive data!

Cek file `.gitignore` ada di project atau buat baru:

```bash
# Cek apakah ada .gitignore
Get-Item D:\project\todolist\.gitignore
```

Kalau belum ada, buat baru dengan isi:

```env
# Dependencies
node_modules/
.pnp
.pnp.js

# Build
.next/
out/
build/
dist/

# Testing
coverage/

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local
.vercel/

# OS
.DS_Store
Thumbs.db
```

---

## 🎉 Selesai!

Setelah push berhasil, repository GitHub Anda siap untuk di-connect ke Vercel!

Mau lanjut buat GitHub repo dulu ketik URL nya是多少?