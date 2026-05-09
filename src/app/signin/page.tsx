"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { Loader2, ChevronRight, Zap, Lock, Mail, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { PremiumLoader } from "@/components/ui/premium-loader"

function SignInForm() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { toast } = useToast()

  const error = searchParams.get("error")

  useEffect(() => {
    if (error === "CredentialsSignin") {
      toast({
        title: "Login Gagal",
        description: "Email atau password salah.",
        variant: "destructive",
      })
    }
  }, [error, toast])

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard/all-tasks")
    }
  }, [status, router])

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      if (session) {
        await signOut({ redirect: false })
      }
      await signIn("google", { callbackUrl: "/dashboard/all-tasks" })
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signIn("credentials", {
        email,
        password,
        callbackUrl: "/dashboard/all-tasks",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat login.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex relative overflow-hidden bg-black font-sans selection:bg-white/10 selection:text-white">
      
      {/* --- BACKGROUND ENGINE --- */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] bg-white/[0.03] rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-white/[0.02] rounded-full blur-[100px]" />
        
        <div className="absolute inset-0 opacity-[0.02]" 
          style={{ 
            backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`,
            backgroundSize: '100px 100px',
            transform: 'perspective(1200px) rotateX(60deg) translateY(-100px) scale(2)',
            maskImage: 'radial-gradient(ellipse at center, black, transparent 80%)'
          }} 
        />
      </div>

      {/* --- LEFT HERO --- */}
      <div className="hidden lg:flex absolute left-24 top-0 bottom-0 z-20 flex-col justify-center max-w-2xl animate-in fade-in slide-in-from-left-10 duration-1000">
        <div className="space-y-8">
          <div className="flex items-center gap-3 mb-4 animate-fade-in">
             <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-2xl shadow-white/10">
                <Zap className="h-6 w-6 text-black" />
             </div>
             <span className="text-sm font-black text-white uppercase tracking-[0.4em]">Zenith Core</span>
          </div>
          <h1 className="text-8xl font-black tracking-[-0.05em] text-white leading-[1.05]">
            Ruang Kerja<br />
            <span className="text-white/20">Produktivitas</span><br />
            <span className="text-white">Next Gen</span>
          </h1>
          <div className="h-1 w-32 bg-white/20 rounded-full" />
          <p className="text-white/40 text-xl font-medium leading-relaxed max-w-md pt-4">
            Ruang kerja eksklusif untuk komunitas operator modern. Performa premium bertemu desain elegan.
          </p>
        </div>
      </div>

      {/* --- RIGHT PANEL --- */}
      <div className="relative z-30 ml-auto w-full lg:w-[550px] h-screen flex flex-col bg-black/60 backdrop-blur-3xl border-l border-zinc-800/50 shadow-[-100px_0_100px_rgba(0,0,0,0.5)]">
        
        <div className="p-16 pb-0 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse shadow-[0_0_10px_white]" />
            <span className="text-[9px] font-bold text-white/40 uppercase tracking-[0.4em]">Quantum Auth</span>
          </div>
          <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">v2026.1.0</span>
        </div>

        <div className="flex-1 flex flex-col justify-center px-12 lg:px-20">
          <div className="mb-12">
            <h2 className="text-4xl font-black tracking-tighter text-white leading-tight mb-3">
              Akses <span className="text-white/40">Elite</span>
            </h2>
            <p className="text-white/40 text-sm font-medium">Masukkan kredensial Anda untuk mengakses sistem.</p>
          </div>

          <form onSubmit={handleEmailSignIn} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] uppercase tracking-widest font-black text-white/30 ml-1">Identitas Pengenal</Label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-white transition-colors" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="agen@zenith.core" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-14 bg-white/[0.01] border-zinc-800/50 rounded-full focus-visible:ring-1 focus-visible:ring-zinc-700 text-white placeholder:text-white/10 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <Label htmlFor="password" className="text-[10px] uppercase tracking-widest font-black text-white/30">Kunci Keamanan</Label>
                <button type="button" className="text-[10px] font-bold text-white/60 hover:text-white transition-colors uppercase tracking-widest">Lupa?</button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-white transition-colors" />
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 h-14 bg-white/[0.01] border-zinc-800/50 rounded-full focus-visible:ring-1 focus-visible:ring-zinc-700 text-white placeholder:text-white/10 transition-all font-medium"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full h-14 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full font-black shadow-2xl transition-all active:scale-95 disabled:opacity-50 group"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                <span className="flex items-center gap-2">
                  INISIALISASI SESI <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          <div className="py-10 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/5" />
            <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Quantum Bridge</span>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full h-14 flex items-center justify-center gap-4 bg-white/[0.02] hover:bg-white/[0.05] text-white border border-zinc-800/50 shadow-sm transition-all duration-300 rounded-full group active:scale-[0.98] disabled:opacity-50"
          >
            <div className="bg-white rounded-full p-1.5 group-hover:scale-110 transition-transform duration-300 grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100">
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.96 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.38 8.55 1 10.22 1 12s.38 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.96 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </div>
            <span className="font-bold text-[10px] tracking-[0.2em] uppercase text-white/40 group-hover:text-white">Masuk dengan Akun Google</span>
          </button>
        </div>

        <div className="p-16 pt-0">
          <div className="pt-10 border-t border-zinc-800/50 flex flex-col items-center">
            <div className="flex flex-col items-center opacity-30 hover:opacity-100 transition-opacity duration-700 cursor-default">
              <span className="text-[7px] uppercase tracking-[0.6em] text-white/40 font-black mb-2">Architectural Engineering</span>
              <div className="flex items-center gap-3">
                <div className="h-px w-6 bg-white/20" />
                <span className="text-[10px] tracking-[0.4em] text-white font-light">
                  SANTO <span className="text-white font-black">X/CODE</span>
                </span>
                <div className="h-px w-6 bg-white/20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<PremiumLoader fullScreen size="xl" text="Memuat..." />}>
      <SignInForm />
    </Suspense>
  )
}
