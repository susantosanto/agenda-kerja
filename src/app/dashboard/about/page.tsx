"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  Zap, 
  Shield, 
  Heart,
  ArrowRight,
  Star,
  Cpu,
  Database,
  Globe,
  Bot,
  Workflow,
  Award,
  Users,
  Target,
  Lightbulb,
  Infinity,
  Gauge,
  Sparkle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } }
}

// Feature Card
function FeatureCard({ icon: Icon, title, description, delay = 0 }: { icon: any; title: string; description: string; delay?: number }) {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <motion.div
      variants={fadeInUp}
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`
        absolute inset-0 rounded-3xl transition-all duration-500
        ${isHovered ? 'bg-gradient-to-br from-primary/10 via-purple-500/5 to-transparent opacity-100 blur-xl' : 'opacity-0 blur-2xl'}
      `} />
      <div className="relative h-full rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm p-7 transition-all duration-500 hover:border-primary/40 hover:bg-card/60 hover:shadow-lg hover:shadow-primary/5">
        <div className="mb-5">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-purple-500/10 border border-primary/20">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
        <h3 className="mb-2.5 text-lg font-bold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </motion.div>
  )
}

// Tech Badge
function TechBadge({ name, delay = 0 }: { name: string; delay?: number }) {
  return (
    <motion.span
      variants={fadeInUp}
      className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-4 py-2 text-sm font-medium backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-primary/5"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
      {name}
    </motion.span>
  )
}

// Architecture Layer
function ArchitectureLayer({ icon: Icon, label, desc, color, index }: { icon: any; label: string; desc: string; color: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15 }}
      className="flex items-center gap-4 rounded-xl border border-border/60 bg-card/40 p-4 backdrop-blur-sm transition-all duration-300 hover:border-border/80"
    >
      <div className={`p-2.5 rounded-lg bg-gradient-to-br ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="font-semibold text-sm">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </motion.div>
  )
}

export default function AboutPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[600px] bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[400px] bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-6">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto mb-6"
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

        {/* System Architect Credit - Small */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center gap-2 opacity-40 hover:opacity-70 transition-opacity">
            <span className="text-[9px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">System Architect</span>
            <span className="text-primary text-xs">•</span>
            <span className="text-[9px] font-black tracking-[0.2em] bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">SANTO X/CODE</span>
          </div>
        </motion.div>

        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
              <Sparkle className="h-3 w-3" />
              Workspace Intelligence
            </span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6"
          >
            <span className="bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-transparent">
              ZENITH<span className="text-primary">CORE</span>
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Sistem manajemen tugas premium yang powerful dan intuitif. 
            Dirancang untuk produktivitas tinggi dengan antarmuka yang bersih dan modern.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center justify-center gap-4"
          >
            <Button size="lg" className="h-12 px-8 rounded-xl font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
              Mulai Sekarang
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="ghost" className="h-12 px-6 rounded-xl font-medium">
              Pelajari Lebih
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-14"
          >
            <motion.div variants={scaleIn} className="mb-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Features
              </span>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-muted-foreground max-w-xl mx-auto">
              Tool lengkap untuk mengelola tugas, kolaborasi tim, dan meningkatkan produktivitas workspace Anda.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            <FeatureCard 
              icon={Zap}
              title="Real-Time Sync"
              description="Data tersinkronisasi secara instan di semua perangkat Anda."
            />
            <FeatureCard 
              icon={Shield}
              title="Secure & Private"
              description="Enkripsi end-to-end dengan keamanan data terbaik."
            />
            <FeatureCard 
              icon={Bot}
              title="AI Assistant"
              description="Bantuan cerdas untuk mengoptimalkan alur kerja Anda."
            />
            <FeatureCard 
              icon={Workflow}
              title="Workflow Automation"
              description="Otomatisasi tugas repetitif dengan mudah."
            />
            <FeatureCard 
              icon={Gauge}
              title="Lightning Fast"
              description="Performa tinggi dengan loading waktu nyata."
            />
            <FeatureCard 
              icon={Infinity}
              title="Scalable"
              description="Tumbuh bersama kebutuhan tim Anda."
            />
          </motion.div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            {/* Tech Badges */}
            <motion.div variants={fadeInUp}>
              <h3 className="text-2xl font-bold mb-6">Built With</h3>
              <div className="flex flex-wrap gap-3">
                <TechBadge name="Next.js 15" />
                <TechBadge name="TypeScript" />
                <TechBadge name="Tailwind CSS" />
                <TechBadge name="Prisma ORM" />
                <TechBadge name="PostgreSQL" />
                <TechBadge name="NextAuth.js" />
                <TechBadge name="TanStack Query" />
                <TechBadge name="Framer Motion" />
                <TechBadge name="Zod" />
                <TechBadge name="Lucide Icons" />
              </div>
            </motion.div>

            {/* Architecture */}
            <motion.div variants={scaleIn}>
              <div className="rounded-2xl border border-border/60 bg-card/30 backdrop-blur-sm p-6">
                <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  System Architecture
                </h3>
                <div className="space-y-3">
                  <ArchitectureLayer 
                    icon={Globe}
                    label="Presentation"
                    desc="Next.js App Router + React 19"
                    color="from-blue-500 to-blue-600"
                    index={0}
                  />
                  <ArchitectureLayer 
                    icon={Zap}
                    label="API Layer"
                    desc="Next.js API Routes + REST"
                    color="from-purple-500 to-purple-600"
                    index={1}
                  />
                  <ArchitectureLayer 
                    icon={Database}
                    label="Data Layer"
                    desc="PostgreSQL + Prisma ORM"
                    color="from-emerald-500 to-emerald-600"
                    index={2}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl font-bold mb-4">
              Our Values
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {[
              { icon: Lightbulb, title: "Innovation", desc: "Continuously evolving" },
              { icon: Target, title: "Precision", desc: "Attention to detail" },
              { icon: Heart, title: "Passion", desc: "Built with dedication" },
              { icon: Star, title: "Quality", desc: "No compromises" },
            ].map((value, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="text-center p-5 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 mb-4">
                  <value.icon className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-bold mb-1">{value.title}</h4>
                <p className="text-sm text-muted-foreground">{value.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden"
          >
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-purple-600" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
            
            {/* Content */}
            <div className="relative px-8 py-16 text-center text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Siap Memulai?
              </h2>
              <p className="text-white/80 mb-8 max-w-md mx-auto">
                Tingkatkan produktivitas Anda dengan sistem manajemen tugas yang modern.
              </p>
              <Button size="lg" className="h-12 px-8 rounded-xl font-bold bg-white text-primary hover:bg-white/90 shadow-xl">
                Mulai Sekarang
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

          {/* Footer - Architect Credit */}
          <footer className="relative py-12 px-6 border-t border-border/50">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                {/* App Branding */}
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold">ZENITH<span className="text-primary">CORE</span></p>
                    <p className="text-xs text-muted-foreground">Workspace Intelligence</p>
                  </div>
                </div>

            {/* Architect Credit */}
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm">
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">System Architect</p>
                <p className="font-bold text-sm bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                  Santo X/Code
                </p>
              </div>
              <div className="h-8 w-px bg-border mx-1" />
              <div className="flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 text-primary" />
                <Star className="h-3.5 w-3.5 text-primary" />
                <Star className="h-3.5 w-3.5 text-primary" />
              </div>
            </div>

            {/* Copyright */}
            <p className="text-xs text-muted-foreground">
              © 2026 ZENITHCORE. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
