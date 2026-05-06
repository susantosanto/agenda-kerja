"use client"

import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Plus,
  ListTodo,
  Calendar,
  Star,
  Home,
  ChevronLeft
} from "lucide-react"

interface MobileNavProps {
  currentView?: string
  onNavigate?: (view: string) => void
}

export function MobileNav({ currentView, onNavigate }: MobileNavProps) {
  const router = useRouter()
  const pathname = usePathname()

  const navigation = [
    { name: "Home", href: "/dashboard", icon: Home, view: "home" },
    { name: "My Tasks", href: "/dashboard?filter=my-tasks", icon: ListTodo, view: "my-tasks" },
    { name: "Today", href: "/dashboard?filter=today", icon: Calendar, view: "today" },
    { name: "Starred", href: "/dashboard?filter=starred", icon: Star, view: "starred" },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t">
      <div className="flex items-center justify-around h-16">
        {navigation.map((item) => {
          const isActive = pathname === item.href || currentView === item.view
          return (
            <button
              key={item.name}
              onClick={() => {
                onNavigate?.(item.view)
                router.push(item.href)
              }}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.name}</span>
            </button>
          )
        })}
        <Button
          size="icon"
          className="flex flex-col items-center justify-center flex-1 h-full gap-1 bg-transparent hover:bg-accent text-primary"
        >
          <Plus className="h-5 w-5" />
          <span className="text-xs">Add</span>
        </Button>
      </div>
    </nav>
  )
}
