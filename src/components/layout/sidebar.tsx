"use client"

import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Plus,
  ListTodo,
  Calendar,
  Users,
  Settings,
  ChevronRight,
  Star,
  Home
} from "lucide-react"

interface Community {
  id: string
  name: string
  color?: string
}

interface SidebarProps {
  communities: Community[]
  currentCommunityId?: string
  onSelectCommunity?: (id: string) => void
  onCreateCommunity?: () => void
}

export function Sidebar({
  communities,
  currentCommunityId,
  onSelectCommunity,
  onCreateCommunity
}: SidebarProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  const navigation = [
    { name: "My Tasks", href: "/dashboard?filter=my-tasks", icon: ListTodo },
    { name: "Today", href: "/dashboard?filter=today", icon: Calendar },
    { name: "Starred", href: "/dashboard?filter=starred", icon: Star },
  ]

  return (
    <aside className="hidden md:flex flex-col w-64 bg-card border-r h-[calc(100vh-4rem)] sticky top-16">
      {/* Quick Actions */}
      <div className="p-4 space-y-2">
        <Button
          onClick={onCreateCommunity}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Community
        </Button>
      </div>

      {/* Navigation */}
      <nav className="px-3 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <button
              key={item.name}
              onClick={() => router.push(item.href)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </button>
          )
        })}
      </nav>

      {/* Divider */}
      <div className="mx-3 my-4 border-t" />

      {/* Communities */}
      <div className="flex-1 overflow-y-auto px-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Communities
          </span>
        </div>
        <div className="space-y-1">
          {communities.map((community) => (
            <button
              key={community.id}
              onClick={() => onSelectCommunity?.(community.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                currentCommunityId === community.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <div
                className="h-5 w-5 rounded-sm"
                style={{ backgroundColor: community.color || "#6366f1" }}
              />
              <span className="truncate">{community.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={session?.user?.image || ""} />
            <AvatarFallback>
              {session?.user?.name?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {session?.user?.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {session?.user?.email}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
