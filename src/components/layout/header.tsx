"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, Settings, User, Menu, Search, Bell, Zap, Info } from "lucide-react"
import { NotificationCenter } from "@/components/notification/notification-center"

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { data: session } = useSession()
  const router = useRouter()

  const handleSignOut = async () => {
    // Clear nextauth cookies first
    const cookies = document.cookie.split(";")
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i]
      const eqPos = cookie.indexOf("=")
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
      if (name.trim().includes("nextauth")) {
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/"
      }
    }
    await signOut({ redirectTo: "/signin" })
  }

  return (
    <header className="sticky top-0 z-40 bg-black/60 backdrop-blur-3xl shrink-0 shadow-[0_1px_20px_rgba(0,0,0,0.4)]">
      <div className="px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* MOBILE MENU TRIGGER - Premium */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden h-9 w-9 rounded-lg hover:bg-muted/50 transition-colors"
            onClick={onMenuClick}
          >
            <Menu className="h-4 w-4 text-muted-foreground" />
          </Button>

          {/* System Status - Minimal */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.12em] hidden sm:inline">Active</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Actions - Hidden on mobile */}
          <div className="hidden sm:flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-muted/50">
              <Search className="h-4 w-4 text-muted-foreground" />
            </Button>
            {/* ✅ Notification Bell dengan Badge - Real-time */}
            <NotificationCenter />
          </div>
          
          <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

          {/* User Menu - Premium Compact */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-0.5 rounded-xl hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2 pl-1 pr-2 py-0.5">
                  <Avatar className="h-8 w-8 ring-2 ring-border">
                    <AvatarImage src={session?.user?.image || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-[10px]">
                      {session?.user?.name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:flex flex-col items-start">
                    <span className="text-xs font-semibold text-foreground">{session?.user?.name?.split(' ')[0]}</span>
                    <span className="text-[9px] text-muted-foreground font-medium">Premium</span>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 rounded-[1.5rem] border-white/5 bg-zinc-950/98 backdrop-blur-3xl shadow-2xl p-2">
              <DropdownMenuLabel className="px-3 py-3">
                <div className="flex flex-col space-y-0.5">
                  <span className="font-black text-sm tracking-tight text-white">{session?.user?.name}</span>
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{session?.user?.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/5 my-1" />
              <DropdownMenuItem 
                className="rounded-xl px-3 py-2.5 cursor-pointer focus:bg-white/5 group transition-colors"
                onClick={() => router.push("/dashboard/about")}
              >
                <Info className="mr-3 h-4 w-4 text-white/40 group-hover:text-white" />
                <span className="text-sm font-bold text-white/70 group-hover:text-white">About Us</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="rounded-xl px-3 py-2.5 cursor-pointer focus:bg-white/5 group transition-colors"
                onClick={() => router.push("/dashboard/profile")}
              >
                <User className="mr-3 h-4 w-4 text-white/40 group-hover:text-white" />
                <span className="text-sm font-bold text-white/70 group-hover:text-white">Account Setting</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="rounded-xl px-3 py-2.5 cursor-pointer focus:bg-white/5 group transition-colors"
                onClick={() => router.push("/dashboard/settings")}
              >
                <Settings className="mr-3 h-4 w-4 text-white/40 group-hover:text-white" />
                <span className="text-sm font-bold text-white/70 group-hover:text-white">Preferences</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/5 my-1" />
              <DropdownMenuItem onClick={handleSignOut} className="rounded-xl px-3 py-2.5 cursor-pointer focus:bg-red-500/10 text-red-400 font-bold">
                <LogOut className="mr-3 h-4 w-4" />
                <span className="text-sm">Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
