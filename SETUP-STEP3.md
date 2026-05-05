# 🚀 Step 3: Environment Variables & Run
## Setup Lengkap untuk Menjalankan Aplikasi

---

## 📝 Langkah 3.1: Buat File .env

Buat file baru di `D:\project\todolist\.env` (tanpa .example):

```env
# ===========================================
# DATABASE ( dari Step 2 )
# ===========================================
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# ===========================================
# NEXTAUTH (Generate dengan membuka terminal: openssl rand -base64 32)
# ===========================================
NEXTAUTH_SECRET="ganti-dengan-hasil-generate-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# ===========================================
# GOOGLE OAUTH ( dari Step 1 )
# ===========================================
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

---

## 🔐 Cara Generate NEXTAUTH_SECRET

Buka **PowerShell** dan jalankan:

```powershell
openssl rand -base64 32
```

**Copy hasil** nya dan paste di `NEXTAUTH_SECRET=`

---

## 🚀 Langkah 3.2: Install Dependencies

 Buka **PowerShell** dan jalankan:

```powershell
cd D:\project\todolist
npm install
```

Tunggu sampai selesai (~2-5 menit tergantung internet)

---

## 🗄️ Langkah 3.3: Setup Database

Setelah npm install selesai, jalankan:

```powershell
cd D:\project\todolist
npx prisma generate
npx prisma db push
```

---

## ▶️ Langkah 3.4: Run Development

```powershell
cd D:\project\todolist
npm run dev
```

Buka browser dan akses: `http://localhost:3000`

---

## 📋 Checklist Final

| Step | Status | Catatan |
|------|--------|--------|
| 3.1 Buat .env | [ ] | |
| 3.1 Generate Secret | [ ] | |
| 3.2 npm install | [ ] | |
| 3.3 prisma generate | [ ] | |
| 3.3 prisma db push | [ ] | |
| 3.4 npm run dev | [ ] | |

---

## 🎉 Selamat!

Jika semua berjalan, aplikasi bisa diakses di `http://localhost:3000`

Mau sign in harusnya langsung bisa dengan Google OAuth yang sudah di-setup!

---

## 💬 Jika Stuck

Chat aja kalau ada error - kasih tau pesan error nya apa!