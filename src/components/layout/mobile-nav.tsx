"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { ListTodo, ShieldCheck, MessageSquare } from "lucide-react"

const navItems = [
  { name: "Tugas", href: "/dashboard/all-tasks", icon: ListTodo },
  { name: "Catatan", href: "/dashboard/notes", icon: ShieldCheck },
  { name: "Forum", href: "/dashboard/forum", icon: MessageSquare },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[60] border-t border-white/[0.03] bg-black/80 backdrop-blur-3xl shadow-[0_-4px_30px_rgba(0,0,0,0.5)]">
      {/* Active tab indicator line */}
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="flex items-center justify-around h-[68px] pb-2 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 py-1 px-4 rounded-2xl transition-all duration-300 min-w-[72px]",
                isActive
                  ? "text-white"
                  : "text-white/20 hover:text-white/40"
              )}
            >
              {/* Active background pill */}
              {isActive && (
                <div className="absolute inset-0 bg-white/10 rounded-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" />
              )}

              {/* Icon container */}
              <div className={cn(
                "relative flex items-center justify-center h-7 w-7 rounded-xl transition-all duration-300",
                isActive && "scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
              )}>
                <item.icon className="h-5 w-5 transition-all duration-300" />
              </div>

              {/* Label */}
              <span className={cn(
                "text-[9px] font-black uppercase tracking-widest transition-all duration-200",
                isActive
                  ? "text-white opacity-100"
                  : "text-white/20 opacity-80"
              )}>
                {item.name}
              </span>

              {/* Top accent line */}
              {isActive && (
                <div className="absolute -top-px left-1/2 -translate-x-1/2 h-[2px] w-8 rounded-full bg-white shadow-[0_0_10px_white]" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
