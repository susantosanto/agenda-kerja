# 🚀 Step 1: Google OAuth Setup
## Panduan Mendapatkan Google Client ID & Client Secret

### Langkah 1.1: Buka Google Cloud Console
Buka browser dan akses:
```
https://console.cloud.google.com/
```

---

### Langkah 1.2: Buat Project Baru
1. Klik dropdown **"Select a project"** di bagian atas
2. Klik **"New Project"**
3. Isi nama project: `agenda-kerja-gugus`
4. Klik **"Create"**

---

### Langkah 1.3: Aktifkan API
1. Di sidebar kiri, arahkan ke **APIs & Services** → **Library**
2. Cari **"Identity-Aware Proxy"** 
3. Klik **Enable** (jika diperlukan)

---

### Langkah 1.4: Buat OAuth Credentials
1. Di sidebar kiri, klik **APIs & Services** → **Credentials**
2. Klik **"Create Credentials"** → **OAuth client ID**
3. Configuration:
   - **Application type**: Web application
   - **Name**: Agenda Kerja OAuth
4. Klik **Create**

---

### Langkah 1.5: Atur Redirect URIs
1. Setelah dibuat, klik pada credential yang baru
2. Di bagian **"Authorized redirect URIs"**, klik **"Add URI"**
3. Isi:
   - `http://localhost:3000/api/auth/callback/google`
   - (nanti akan diganti URL production)
4. Klik **Save**

---

### Langkah 1.6: Ambil Credential
1. Refresh halaman credentials
2. Klik pada credential yang dibuat
3. **Copy**:
   - **Client ID** → simpan di tempat aman
   - **Client secret** → simpan di tempat aman

---

## 📋 Checklist Setup Google OAuth

| Step | Status | Catatan |
|------|--------|--------|
| 1.2 Buat Project | [ ] | |
| 1.3 Aktifkan API | [ ] | |
| 1.4 Buat OAuth Client | [ ] | |
| 1.5 Atur Redirect URIs | [ ] | |
| 1.6 Ambil Credential | [ ] | Client ID: ___________ |
| | | Client Secret: ___________ |

---

## ⚠️ Penting!

Setelah selesai Step 1, lanjut ke **Step 2: Database Setup** untuk mendapatkan `DATABASE_URL`.