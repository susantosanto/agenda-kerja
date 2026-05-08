"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Shield, Key, Camera, ArrowRight, Check } from "lucide-react"
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
          <h1 className="text-3xl font-black tracking-tight">Account Settings</h1>
          <p className="text-muted-foreground mt-2">Kelola informasi akun dan preferensi Anda</p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="rounded-2xl border-border/60 bg-card/40 backdrop-blur-sm overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
            <div className="relative">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Profil</CardTitle>
                    <CardDescription>Informasi profil akun Anda</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <Avatar className="h-20 w-20 ring-4 ring-border shadow-xl">
                      <AvatarImage src={session?.user?.image || ""} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-purple-500 text-white font-bold text-2xl">
                        {getInitials(session?.user?.name || "U")}
                      </AvatarFallback>
                    </Avatar>
                    <button className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary border-4 border-background flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                      <Camera className="h-3.5 w-3.5 text-white" />
                    </button>
                  </div>
                  <div>
                    <Button variant="outline" size="sm" className="rounded-lg font-medium">
                      Ubah Foto
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">JPG, PNG atau GIF. Maksimal 2MB.</p>
                  </div>
                </div>

                {/* Form */}
                <div className="grid gap-5 pt-2">
                  <div className="space-y-2.5">
                    <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                      Nama Lengkap
                    </Label>
                    <Input 
                      id="name" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      className="rounded-xl h-12 bg-muted/30 border-border/60 focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-2.5">
                    <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                      Email
                    </Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      className="rounded-xl h-12 bg-muted/30 border-border/60 focus:border-primary/50 transition-colors"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleSave}
                  className="w-full h-12 rounded-xl font-bold bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 shadow-lg shadow-primary/20 transition-all"
                >
                  {saved ? (
                    <span className="flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      Tersimpan!
                    </span>
                  ) : (
                    "Simpan Perubahan"
                  )}
                </Button>
              </CardContent>
            </div>
          </Card>
        </motion.div>

        {/* Security Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6"
        >
          <Card className="rounded-2xl border-border/60 bg-card/40 backdrop-blur-sm overflow-hidden">
            <div className="relative">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <Shield className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Keamanan</CardTitle>
                    <CardDescription>Pengaturan keamanan akun</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-border/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <Key className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-semibold text-sm">Password</p>
                      <p className="text-xs text-muted-foreground">Terakhir diubah: Belum pernah</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-lg font-medium">
                    Ubah Password
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-border/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-semibold text-sm">Verifikasi Email</p>
                      <p className="text-xs text-muted-foreground">
                        {session?.user?.email ? "Terverifikasi" : "Belum verifikasi"}
                      </p>
                    </div>
                  </div>
                  {session?.user?.email && (
                    <div className="flex items-center gap-1.5">
                      <Check className="h-4 w-4 text-emerald-500" />
                      <span className="text-xs font-medium text-emerald-500">Verified</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </div>
          </Card>
        </motion.div>

        {/* Account Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6"
        >
          <Card className="rounded-2xl border-border/60 bg-card/40 backdrop-blur-sm overflow-hidden">
            <div className="relative">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <User className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Informasi Akun</CardTitle>
                    <CardDescription>Detail akun Anda</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-border/50">
                    <span className="text-sm text-muted-foreground">ID User</span>
                    <span className="text-sm font-mono text-muted-foreground/70">
                      {session?.user?.id?.slice(0, 8) || "N/A"}...
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-border/50">
                    <span className="text-sm text-muted-foreground">Provider</span>
                    <span className="text-sm font-medium">Google OAuth</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-500">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      Premium Active
                    </span>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
