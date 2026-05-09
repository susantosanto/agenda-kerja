"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Shield, Camera, ArrowRight, Check, Key } from "lucide-react"
import { useState } from "react"

export default function ProfilePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [name, setName] = useState(session?.user?.name || "")
  const [email, setEmail] = useState(session?.user?.email || "")
  const [saved, setSaved] = useState(false)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/10 selection:text-white">
      {/* Background Effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-white/[0.02] blur-[120px]" />
      </div>

      <div className="relative max-w-3xl mx-auto px-6 pt-12 pb-32">
        {/* Back Button */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-12">
          <button onClick={() => router.back()} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-white/20 hover:text-white transition-all">
            <ArrowRight className="h-4 w-4 rotate-180" />
            Kembali ke Workspace
          </button>
        </motion.div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
          <h1 className="text-5xl font-black tracking-tighter mb-4">Pengaturan Akun</h1>
          <p className="text-white/30 text-lg font-medium tracking-tight">Kelola identitas digital dan otentikasi keamanan Anda.</p>
        </motion.div>

        <div className="space-y-10">
          {/* Profile Section */}
          <section className="space-y-8 rounded-[2.5rem] bg-white/[0.015] p-10 shadow-2xl shadow-black">
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div className="relative group">
                <Avatar className="h-32 w-32 ring-1 ring-white/10 shadow-2xl transition-all duration-500 group-hover:scale-105">
                  <AvatarImage src={session?.user?.image || ""} />
                  <AvatarFallback className="bg-zinc-900 text-white font-black text-4xl">
                    {getInitials(session?.user?.name || "U")}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute bottom-1 right-1 h-10 w-10 rounded-full bg-white text-black border-4 border-black flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div className="text-center sm:text-left space-y-2">
                <h3 className="text-2xl font-black tracking-tight">{session?.user?.name}</h3>
                <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] flex items-center justify-center sm:justify-start gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_emerald]" />
                  Akses Premium Aktif
                </p>
              </div>
            </div>

            <div className="grid gap-8 pt-4">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 ml-2">Identitas Lengkap</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="h-14 font-black tracking-tight" />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 ml-2">Alamat Elektronik</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} className="h-14 font-black tracking-tight" />
              </div>
            </div>

            <Button 
              onClick={handleSave}
              className="w-full h-14 bg-zinc-800 text-white font-black rounded-2xl border-t border-white/10 shadow-2xl hover:bg-zinc-700 transition-all duration-500"
            >
              {saved ? (
                <span className="flex items-center gap-2">
                  <Check className="h-5 w-5" />
                  SINKRONISASI BERHASIL
                </span>
              ) : (
                "SIMPAN PERUBAHAN"
              )}
            </Button>
          </section>

          {/* Security & System Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-8 rounded-[2rem] bg-white/[0.01] shadow-xl space-y-6">
              <div className="flex items-center gap-3">
                <Key className="h-4 w-4 text-white/20" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Keamanan</h2>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-white/[0.02]">
                  <span className="text-xs text-white/40 font-bold uppercase">Password</span>
                  <button className="text-xs font-black text-white/80 hover:text-white transition-colors">UBAH</button>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs text-white/40 font-bold uppercase">2FA Status</span>
                  <span className="text-[10px] font-black text-white/20">NON-AKTIF</span>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-[2rem] bg-white/[0.01] shadow-xl space-y-6">
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-white/20" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Sistem</h2>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-white/[0.02]">
                  <span className="text-xs text-white/40 font-bold uppercase">ID Sesi</span>
                  <span className="text-[10px] font-mono text-white/20 tracking-tighter">{session?.user?.id?.slice(0, 12)}...</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs text-white/40 font-bold uppercase">Provider</span>
                  <span className="text-[10px] font-black text-white/60">GOOGLE CLOUD</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
