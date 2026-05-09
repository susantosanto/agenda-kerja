"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Switch } from "@/components/ui/switch"
import { 
  Bell, 
  Palette, 
  ArrowRight,
  Download,
  Trash2,
  Lock
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

function SettingsItem({ title, desc, checked, onChange }: any) {
  return (
    <div className="flex items-center justify-between p-6 rounded-[2rem] bg-white/[0.01] shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)] hover:bg-white/[0.02] transition-all duration-500">
      <div className="space-y-1">
        <p className="font-bold text-sm text-white/80">{title}</p>
        <p className="text-[11px] text-white/20 font-bold uppercase tracking-widest">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [autoSave, setAutoSave] = useState(true)
  const [compactMode, setCompactMode] = useState(false)

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/10 selection:text-white overflow-x-hidden">
      {/* Cinematic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-white/[0.015] blur-[120px]" />
      </div>

      <main className="relative z-10 max-w-3xl mx-auto px-6 pt-12 pb-32">
        {/* Back Button */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-12">
          <button onClick={() => router.back()} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-white/20 hover:text-white transition-all">
            <ArrowRight className="h-3 w-3 rotate-180" />
            Kembali ke Workspace
          </button>
        </motion.div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
          <h1 className="text-5xl font-black tracking-tighter mb-4">Preferensi</h1>
          <p className="text-white/30 text-lg font-medium tracking-tight">Kustomisasi parameter sistem dan kendali data.</p>
        </motion.div>

        <div className="space-y-12">
          {/* Notifications Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 px-1">
              <Bell className="h-4 w-4 text-white/10" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Lansiran Sistem</h2>
            </div>
            <div className="grid gap-4">
              <SettingsItem title="Notifikasi Desktop" desc="Push Alert Real-time" checked={notifications} onChange={setNotifications} />
              <SettingsItem title="Email Ringkasan" desc="Protokol Laporan Berkala" checked={emailNotifications} onChange={setEmailNotifications} />
              <SettingsItem title="Suara Ambient" desc="Feedback Audio ASMR" checked={soundEnabled} onChange={setSoundEnabled} />
            </div>
          </section>

          {/* Appearance Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 px-1">
              <Palette className="h-4 w-4 text-white/10" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Estetika Visual</h2>
            </div>
            <div className="grid gap-4">
              <SettingsItem title="Mode Kompak" desc="Optimasi Densitas Layar" checked={compactMode} onChange={setCompactMode} />
              <SettingsItem title="Simpan Otomatis" desc="Sinkronisasi Instan" checked={autoSave} onChange={setAutoSave} />
            </div>
          </section>

          {/* Data & Security */}
          <section className="space-y-6 pt-6">
            <div className="flex items-center gap-3 px-1">
              <Lock className="h-4 w-4 text-white/10" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Kedaulatan Data</h2>
            </div>
            <div className="rounded-[2.5rem] bg-white/[0.01] p-3 shadow-2xl space-y-2">
              <button className="w-full flex items-center justify-between p-6 rounded-[2rem] hover:bg-white/[0.02] transition-all group">
                <div className="flex items-center gap-4 text-left">
                  <div className="h-10 w-10 rounded-xl bg-white/[0.03] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Download className="h-5 w-5 text-white/30" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Ekspor Data Workspace</p>
                    <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mt-1">Download Archive</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-white/10 group-hover:translate-x-1 group-hover:text-white transition-all" />
              </button>
              
              <button className="w-full flex items-center justify-between p-6 rounded-[2rem] hover:bg-red-500/5 transition-all group">
                <div className="flex items-center gap-4 text-left">
                  <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Trash2 className="h-5 w-5 text-red-500/50" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-red-500/80">Hapus Akun Permanen</p>
                    <p className="text-[10px] text-red-500/20 font-black uppercase tracking-widest mt-1">Terminate Session</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-red-500/10 group-hover:translate-x-1 group-hover:text-red-500 transition-all" />
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
