# Task Plan - Transformasi Slack-Style
**Fitur:** Kolaborasi Komunitas Gaya Slack (Hybrid Approach)
**Status:** In Progress
**Target Selesai:** 2026-05-10

## 📋 Daftar Tugas (Implementation Plan)

### Fase 1: Dasar Layout & Navigasi
- [ ] **Task 1: Refaktor Layout Utama (SlackLayout)**
  - Buat `src/components/layout/slack-layout.tsx` (3-panel)
  - Update `src/app/dashboard/layout.tsx`
- [ ] **Task 2: Navigasi Channel & Unified View**
  - Refaktor `sidebar.tsx` menjadi navigasi Channel (#)
  - Tambahkan menu "Semua Tugas"
  - Implementasi URL state untuk filter channel

### Fase 2: Fitur Dual Feed (Chat + Tasks)
- [ ] **Task 3: Komponen ChannelView & Tab Switcher**
  - Buat `channel-view.tsx` dengan Radix UI Tabs
  - Integrasi `ChatBox` dan `TaskList` dalam satu view
- [ ] **Task 4: Panel Detail & Threading Tugas**
  - Buat `task-thread-pane.tsx` (Panel kanan)
  - Update `TaskItem` untuk trigger pembukaan panel thread

### Fase 3: Backend & Data Sync
- [ ] **Task 5: API Unified Community Tasks**
  - Buat `GET /api/communities/[id]/all-tasks/route.ts`
  - Update frontend untuk mengonsumsi API terpadu
- [ ] **Task 6: Sinkronisasi Polling Final**
  - Pastikan chat dan task list sinkron untuk semua anggota komunitas (polling 5s)

---
*Rencana ini disusun berdasarkan Design Spec 2026-05-06.*
