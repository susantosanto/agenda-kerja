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
          <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/20 to-transparent" />
            <Zap className="h-5 w-5 text-white relative z-10" />
          </div>
          <div>
            <h1 className="text-lg font-black text-sidebar-foreground tracking-tight leading-none">
              ZENITH<span className="text-primary">CORE</span>
            </h1>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.15em] leading-none mt-1">Workspace Intelligence</p>
          </div>
        </Link>
      </div>

      <div className="px-5 mb-3">
        <div className="h-px bg-border/50 w-full" />
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
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-sidebar-primary/10 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className={cn("h-4 w-4", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
              <span className="flex-1 text-left">{item.name}</span>
              {isActive && (
                <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground/60" />
              )}
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
        <div className="pt-2 border-t border-border/10">
          <div className="flex items-center justify-between opacity-40 hover:opacity-100 transition-all duration-500 cursor-default group px-1">
            <div className="flex items-center gap-2">
              <div className="h-px w-4 bg-gradient-to-r from-muted-foreground/40 to-transparent" />
              <span className="text-[7px] font-bold text-muted-foreground uppercase tracking-[0.35em]">System</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-2.5 w-2.5 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-black tracking-[0.15em] text-muted-foreground/80 group-hover:text-primary transition-colors">
                SANTO X/CODE
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
