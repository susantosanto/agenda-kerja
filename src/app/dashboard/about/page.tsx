"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Sparkles, 
  Zap, 
  Shield, 
  ArrowRight,
  Star,
  Cpu,
  Globe,
  Bot,
  Workflow,
  Target,
  Lightbulb,
  CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

function PremiumCard({ icon: Icon, title, description }: any) {
  return (
    <motion.div
      variants={fadeInUp}
      className="group relative rounded-[2rem] bg-white/[0.01] p-8 shadow-[0_4px_30px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.02)] transition-all duration-700 hover:bg-white/[0.03] hover:shadow-[0_8px_40px_rgba(0,0,0,0.7)]"
    >
      <div className="mb-6 h-12 w-12 rounded-2xl bg-white/[0.03] flex items-center justify-center text-white/40 group-hover:text-white group-hover:scale-110 transition-all duration-500">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mb-3 text-lg font-black text-white tracking-tight uppercase">{title}</h3>
      <p className="text-sm text-white/30 leading-relaxed font-medium">{description}</p>
    </motion.div>
  )
}

export default function AboutPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden selection:bg-white/10 selection:text-white">
      {/* Cinematic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-white/[0.02] rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-white/[0.01] rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.15]" 
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            mixBlendMode: 'overlay'
          }} 
        />
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-32">
        {/* Header Navigation */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-20">
          <button onClick={() => router.back()} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-white/20 hover:text-white transition-all">
            <ArrowRight className="h-4 w-4 rotate-180" />
            Kembali ke Workspace
          </button>
        </motion.div>

        {/* Hero Section */}
        <div className="mb-32 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] shadow-inner mb-8">
            <Sparkles className="h-3 w-3 text-white/40" />
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40">Visi Masa Depan 2026</span>
          </motion.div>
          
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-7xl md:text-8xl lg:text-9xl font-black tracking-[-0.06em] leading-none mb-10">
            ZENITH<span className="text-white/20">CORE</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl md:text-2xl text-white/40 max-w-2xl mx-auto leading-relaxed font-medium tracking-tight">
            Mendefinisikan ulang standar produktivitas melalui arsitektur perangkat lunak yang presisi dan elegan.
          </motion.p>
        </div>

        {/* Core Pillars */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid md:grid-cols-3 gap-8 mb-40">
          <PremiumCard icon={Zap} title="Sinkronisasi Instan" description="Pertukaran data real-time dengan latensi sub-milidetik untuk kolaborasi tanpa batas." />
          <PremiumCard icon={Shield} title="Keamanan Elite" description="Protokol enkripsi militer yang menjaga integritas data Anda tetap privat dan aman." />
          <PremiumCard icon={Bot} title="Kecerdasan AI" description="Asisten cerdas yang memahami konteks pekerjaan Anda untuk otomasi tingkat lanjut." />
        </motion.div>

        {/* Footer Signature */}
        <footer className="pt-20 border-t border-white/[0.03] flex flex-col md:flex-row items-center justify-between gap-10 opacity-30 hover:opacity-100 transition-opacity duration-1000">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center">
              <Zap className="h-6 w-6 text-black" />
            </div>
            <div>
              <p className="font-black tracking-widest uppercase text-xs text-white">Zenith Core System</p>
              <p className="text-[10px] font-bold text-white/40">v2026.1.0 Protocol</p>
            </div>
          </div>

          <div className="text-center md:text-right">
            <p className="text-[8px] font-black uppercase tracking-[0.6em] text-white/20 mb-2">Architectural Engineering By</p>
            <p className="text-sm font-black tracking-[0.2em] text-white uppercase">Santo X/Code</p>
          </div>
        </footer>
      </main>
    </div>
  )
}
