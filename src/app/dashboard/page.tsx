"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { 
  Plus, 
  Users, 
  ListTodo, 
  Calendar,
  Settings,
  LogOut,
  Search,
  Bell,
  MoreVertical,
  ChevronRight,
  Star
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Community {
  id: string
  name: string
  description?: string
  _count: { lists: number }
  members: { user: { id: string; name: string; image?: string } }[]
}

async function fetchCommunities() {
  const res = await fetch("/api/communities")
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  
  if (status === "unauthenticated") {
    redirect("/signin")
  }

  const { data: communities, isLoading } = useQuery({
    queryKey: ["communities"],
    queryFn: fetchCommunities,
    enabled: !!session,
  })

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
              <ListTodo className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl hidden sm:block">AGENDA KERJA OPS GUGUS KH. ZAENAL MUSTOFA</span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Bell className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 w-9 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session?.user?.image || ""} />
                    <AvatarFallback>
                      {session?.user?.name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">{session?.user?.name}</span>
                    <span className="text-xs text-muted-foreground">{session?.user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Communities</h1>
            <p className="text-muted-foreground mt-1">Manage your collaborative task lists</p>
          </div>
          <Button className="hidden sm:flex">
            <Plus className="h-4 w-4 mr-2" />
            New Community
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* My Tasks Card */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900">
                  <ListTodo className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="font-semibold">My Tasks</p>
                  <p className="text-xs text-muted-foreground">Tasks assigned to you</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Today Card */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900">
                  <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="font-semibold">Today</p>
                  <p className="text-xs text-muted-foreground">Due today</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Starred Card */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900">
                  <Star className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="font-semibold">Starred</p>
                  <p className="text-xs text-muted-foreground">Important tasks</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invite Card */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                  <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-semibold">Invite</p>
                  <p className="text-xs text-muted-foreground">Join community</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Communities Grid */}
        {communities?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {communities.map((community: Community) => (
              <Card key={community.id} className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                        <span className="text-xl text-white font-bold">
                          {community.name[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <CardTitle className="text-lg">{community.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {community._count.lists} lists
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {community.members.slice(0, 4).map((member, i) => (
                        <Avatar key={i} className="h-7 w-7 border-2 border-card">
                          <AvatarImage src={member.user.image} />
                          <AvatarFallback className="text-xs">
                            {member.user.name?.[0] || "?"}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {community.members.length > 4 && (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs border-2 border-card">
                          +{community.members.length - 4}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mx-auto mb-4">
              <Users className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No communities yet</h3>
            <p className="text-muted-foreground mb-6">Create your first community to start collaborating</p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Community
            </Button>
          </div>
        )}

        {/* Mobile FAB */}
        <Button className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl shadow-indigo-500/30 sm:hidden">
          <Plus className="h-6 w-6" />
        </Button>
      </main>
    </div>
  )
}