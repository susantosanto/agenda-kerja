# Design Spec: Transformasi Todo App Gaya Slack (Pendekatan Hybrid)
**Tanggal:** 2026-05-06
**Status:** Draft (Menunggu Review User)

## 1. Visi Produk
Mengubah aplikasi Todo List saat ini menjadi platform manajemen tugas komunitas yang memiliki pengalaman pengguna (UX) sangat mirip dengan Slack. Fokus utama tetap pada **Manajemen Todo**, namun dengan **Komunikasi** sebagai fitur pendamping yang kuat di setiap channel.

## 2. Arsitektur Data (Pendekatan Hybrid)
Kita akan menggunakan struktur database yang sudah ada namun mengoptimalkan cara aksesnya:
- **Community:** Bertindak sebagai "Workspace".
- **List:** Bertindak sebagai "Channel" (misal: `#general`, `#proyek-A`). Semua List di bawah Komunitas bersifat publik bagi semua anggota komunitas tersebut.
- **Task:** Unit tugas. Semua anggota komunitas dapat membuat, mengedit, dan menyelesaikan task dalam list mana pun di komunitas mereka.
- **Chat Messages:** Pesan obrolan yang terikat pada `communityId` dan `listId` (sebagai channel).

## 3. Desain Antarmuka (UI/UX)
Layout akan menggunakan pola 3-panel:
- **Panel 1 (Workspace Sidebar):** Daftar komunitas (ikon bulat).
- **Panel 2 (Navigation Sidebar):** 
  - Menu "Semua Tugas" (Unified View).
  - Daftar "Channels" (List).
  - Daftar Anggota.
- **Panel 3 (Main Content):** 
  - Header Channel dengan tab: `💬 Chat` dan `📋 Tasks`.
  - Area konten yang berganti sesuai tab yang dipilih.
- **Panel 4 (Right Detail/Thread):** Muncul saat task diklik untuk menampilkan detail dan thread chat khusus task tersebut.

## 4. Fitur Utama & Kolaborasi
- **Open Creation:** Tombol "Add Task" tersedia bagi semua anggota di setiap channel.
- **Dual Feed:** Pengguna bisa ngobrol santai di tab Chat, lalu beralih ke tab Tasks untuk bekerja.
- **Real-time Sync:** Polling setiap 5 detik untuk memastikan status task dan pesan chat sinkron di semua layar anggota.
- **Task Threading:** Setiap task memiliki kolom komentar sendiri yang berfungsi seperti thread di Slack.

## 5. Rencana Teknis
- **API Baru:** `GET /api/communities/[id]/tasks` untuk mengambil seluruh task dalam satu workspace.
- **Refaktor Sidebar:** Mengubah `sidebar.tsx` menjadi navigasi gaya channel.
- **Komponen Baru:** `TaskChatTabs.tsx` untuk mengelola perpindahan antara Chat dan Task list.
- **Integrasi Context:** Memastikan `currentCommunityId` dan `currentListId` dikelola secara global.

## 6. Kriteria Keberhasilan
- Pengguna merasa seperti sedang menggunakan Slack tetapi untuk mengelola tugas.
- Kolaborasi antar anggota berjalan mulus tanpa hambatan izin (permissions).
- Data sinkron antar anggota dalam waktu < 5 detik.
