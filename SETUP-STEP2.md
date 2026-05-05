# 🚀 Step 2: Database Setup (Vercel Postgres / Neon)
## Panduan Mendapatkan DATABASE_URL

### Opsi 2A: Vercel Postgres (Recommended)

#### Langkah 2A.1: Buka Vercel
```
https://vercel.com/
```

#### Langkah 2A.2: Login/Sign Up
- Login dengan GitHub account atau buat baru

#### Langkah 2A.3: Buat Database
1. Dari Dashboard, klik **"Storage"** di sidebar
2. Klik **"Create Database"** → **PostgreSQL**
3. Konfigurasi:
   - **Database Name**: `agenda_kerja`
   - **Region**: Singapore (terdekat)
4. Klik **Create**

#### Langkah 2A.4: Ambil Connection String
1. Klik pada database yang dibuat
2. Di tab **".env"** atau **"Connection"**
3. Copy **DATABASE_URL** yang tersedia
   ```
   postgresql://user:password@host:5432/database?schema=public
   ```

---

### Opsi 2B: Neon (Alternative Free Tier)

#### Langkah 2B.1: Buka Neon
```
https://neon.tech/
```

#### Langkah 2B.2: Sign Up
- Login dengan GitHub

#### Langkah 2B.3: Buat Project
1. Klik **"Create Project"**
2. Nama: `agenda-kerja`
3. Region: Singapore

#### Langkah 2B.4: Ambil Connection String
1. Di Dashboard, klik **"Connection Details"**
2. Pilih **Pooler** (atau direct)
3. Copy connection string

---

## 📋 Checklist Setup Database

| Step | Status | Catatan |
|------|--------|--------|
| 2A.1 / 2B.1 Buka Website | [ ] | |
| 2A.2 / 2B.2 Login/Sign Up | [ ] | |
| 2A.3 / 2B.3 Buat Database | [ ] | |
| 2A.4 / 2B.4 Ambil URL | [ ] | DATABASE_URL: ___________ |

---

## 🔗 Setelah Dapat DATABASE_URL

Buka file `.env` di folder project:

```bash
D:\project\todolist\.env
```

Edit dan isi:
```env
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
```

---

## ⚠️ Penting!

Setelah selesai Step 2, lanjut ke **Step 3: Environment Variables & Run**.