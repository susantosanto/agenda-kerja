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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[60] border-t border-border/50 bg-background/95 backdrop-blur-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      {/* Active tab indicator line */}
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="flex items-center justify-around h-[68px] pb-2 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 py-1 px-4 rounded-2xl transition-all duration-200 min-w-[72px]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground/50 hover:text-muted-foreground"
              )}
            >
              {/* Active background */}
              {isActive && (
                <div className="absolute inset-0 bg-primary/8 rounded-2xl" />
              )}

              {/* Icon container */}
              <div className={cn(
                "relative flex items-center justify-center h-7 w-7 rounded-xl transition-all duration-300",
                isActive && "scale-110"
              )}>
                <item.icon className={cn(
                  "h-5 w-5 transition-all duration-300",
                  isActive && "drop-shadow-sm"
                )} />
              </div>

              {/* Label */}
              <span className={cn(
                "text-[9px] font-bold tracking-tight transition-all duration-200",
                isActive
                  ? "text-primary opacity-100"
                  : "text-muted-foreground/60 opacity-80"
              )}>
                {item.name}
              </span>

              {/* Active dot */}
              {isActive && (
                <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 h-1 w-5 rounded-full bg-gradient-to-r from-primary/80 to-primary shadow-sm shadow-primary/30" />
              )}
            </Link>
          )
        })}
      </div>

    </nav>
  )
}
