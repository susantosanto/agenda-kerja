"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { 
  Settings, 
  Bell, 
  Palette, 
  Database,
  Clock,
  Globe,
  ArrowRight,
  Download,
  Trash2
} from "lucide-react"
import { useState } from "react"

export default function SettingsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [autoSave, setAutoSave] = useState(true)
  const [compactMode, setCompactMode] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      </div>

      <div className="relative max-w-3xl mx-auto px-6 pt-8 pb-16">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            Kembali
          </Button>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-black tracking-tight">Preferences</h1>
          <p className="text-muted-foreground mt-2">Kelola preferensi dan pengaturan aplikasi</p>
        </motion.div>

        {/* Notifications Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="rounded-2xl border-border/60 bg-card/40 backdrop-blur-sm overflow-hidden mb-5">
            <div className="relative">
              <CardHeader className="pb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Notifikasi</CardTitle>
                    <CardDescription>Pengaturan notifikasi dan pengingat</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-border/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-semibold text-sm">Notifikasi Desktop</p>
                      <p className="text-xs text-muted-foreground">Tampilkan notifikasi di desktop</p>
                    </div>
                  </div>
                  <Switch checked={notifications} onCheckedChange={setNotifications} />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-border/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-semibold text-sm">Notifikasi Email</p>
                      <p className="text-xs text-muted-foreground">Kirim notifikasi via email</p>
                    </div>
                  </div>
                  <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-border/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-semibold text-sm">Sound</p>
                      <p className="text-xs text-muted-foreground">Mainkan suara saat notifikasi</p>
                    </div>
                  </div>
                  <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
                </div>
              </CardContent>
            </div>
          </Card>
        </motion.div>

        {/* Appearance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <Card className="rounded-2xl border-border/60 bg-card/40 backdrop-blur-sm overflow-hidden mb-5">
            <div className="relative">
              <CardHeader className="pb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <Palette className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Tampilan</CardTitle>
                    <CardDescription>Pengaturan tampilan aplikasi</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-border/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <Palette className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-semibold text-sm">Mode Compact</p>
                      <p className="text-xs text-muted-foreground">Tampilkan lebih banyak konten</p>
                    </div>
                  </div>
                  <Switch checked={compactMode} onCheckedChange={setCompactMode} />
                </div>
              </CardContent>
            </div>
          </Card>
        </motion.div>

        {/* General Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="rounded-2xl border-border/60 bg-card/40 backdrop-blur-sm overflow-hidden mb-5">
            <div className="relative">
              <CardHeader className="pb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <Settings className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Umum</CardTitle>
                    <CardDescription>Pengaturan umum aplikasi</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-border/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-semibold text-sm">Auto-Save</p>
                      <p className="text-xs text-muted-foreground">Simpan otomatis perubahan</p>
                    </div>
                  </div>
                  <Switch checked={autoSave} onCheckedChange={setAutoSave} />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-border/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-semibold text-sm">Zona Waktu</p>
                      <p className="text-xs text-muted-foreground">Asia/Jakarta (GMT+7)</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-lg font-medium">
                    Ubah
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-border/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-semibold text-sm">Bahasa</p>
                      <p className="text-xs text-muted-foreground">Bahasa Indonesia</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-lg font-medium">
                    Ubah
                  </Button>
                </div>
              </CardContent>
            </div>
          </Card>
        </motion.div>

        {/* Data & Privacy Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          <Card className="rounded-2xl border-border/60 bg-card/40 backdrop-blur-sm overflow-hidden">
            <div className="relative">
              <CardHeader className="pb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                    <Database className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Data & Privasi</CardTitle>
                    <CardDescription>Kelola data dan privasi Anda</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-border/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <Download className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-semibold text-sm">Export Data</p>
                      <p className="text-xs text-muted-foreground">Download semua data Anda</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-lg font-medium">
                    Export
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/5 border border-red-500/20 hover:border-red-500/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <Trash2 className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="font-semibold text-sm text-red-500">Hapus Akun</p>
                      <p className="text-xs text-muted-foreground">Hapus akun dan semua data</p>
                    </div>
                  </div>
                  <Button variant="destructive" size="sm" className="rounded-lg font-medium">
                    Hapus
                  </Button>
                </div>
              </CardContent>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
