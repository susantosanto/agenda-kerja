"use client"

import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Plus,
  ListTodo,
  Settings,
  ChevronRight,
  MessageSquare,
  ShieldCheck,
  Zap,
  Sparkles,
} from "lucide-react"

interface SidebarProps {}

export function Sidebar({}: SidebarProps) {
  const { data: session } = useSession()
  const pathname = usePathname()

  const navigation = [
    { name: "Semua Tugas", href: "/dashboard/all-tasks", icon: ListTodo },
    { name: "Catatan", href: "/dashboard/notes", icon: ShieldCheck },
    { name: "Forum Diskusi", href: "/dashboard/forum", icon: MessageSquare },
  ]

  return (
    <div className="flex flex-col w-full h-full bg-sidebar-background md:bg-transparent">
      {/* APP BRANDING - SUPER PREMIUM */}
      <div className="p-5 pb-4">
        <Link 
          href="/dashboard/all-tasks"
          className="flex items-center gap-3 group cursor-pointer"
        >
          <div className="relative h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-xl shadow-white/5 group-hover:scale-105 transition-transform duration-300">
            <Zap className="h-5 w-5 text-black relative z-10" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white tracking-tight leading-none">
              ZENITH<span className="text-primary">CORE</span>
            </h1>
            <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.15em] leading-none mt-1">Kecerdasan Ruang Kerja</p>

          </div>
        </Link>
      </div>

      <div className="px-5 mb-3">
        <div className="h-px bg-white/[0.03] w-full" />
      </div>

      {/* Navigation - Premium Spacing with Prefetch */}
      <nav className="px-2.5 space-y-0.5">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              prefetch={true}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-300 relative group",
                isActive
                  ? "bg-white/10 text-white font-black shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                  : "text-white/40 hover:bg-white/[0.03] hover:text-white/80"
              )}
            >
              {/* Active Indicator Bar */}
              {isActive && (
                <div className="absolute left-0 w-1 h-4 bg-white rounded-full shadow-[0_0_8px_white]" />
              )}
              
              <item.icon className={cn("h-4 w-4 transition-colors", isActive ? "text-white" : "text-white/40 group-hover:text-white/60")} />
              <span className="flex-1 text-left tracking-tight">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* FOOTER - Premium Minimal */}
      <div className="mt-auto p-3 space-y-2">
        {/* User Profile - Compact Premium */}
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-sidebar-primary/5 transition-colors cursor-pointer group">
          <Avatar className="h-8 w-8 ring-2 ring-border group-hover:ring-primary/30 transition-all">
            <AvatarImage src={session?.user?.image || ""} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-[10px]">
              {session?.user?.name?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-sidebar-foreground truncate">
              {session?.user?.name}
            </p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium">
              Premium
            </p>
          </div>
          <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
        </div>

        {/* ARCHITECT SIGNATURE - SANTO X/CODE */}
        <div className="pt-2 border-t border-white/[0.03]">
          <div className="flex items-center justify-between opacity-20 hover:opacity-100 transition-all duration-700 cursor-default group px-1">
            <div className="flex items-center gap-2">
              <div className="h-px w-4 bg-white/20" />
              <span className="text-[7px] font-bold text-white/40 uppercase tracking-[0.35em]">System</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-2.5 w-2.5 text-white/60 group-hover:text-white transition-colors" />
              <span className="text-[9px] font-black tracking-[0.15em] text-white/40 group-hover:text-white transition-colors">
                SANTO X/CODE
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
