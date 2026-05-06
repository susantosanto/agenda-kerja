"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { TaskList } from "@/components/task/task-list"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, LayoutGrid, List, Calendar, Clock } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

type ViewMode = "list" | "kanban" | "calendar" | "timeline"

interface List {
  id: string
  name: string
  description: string | null
  color: string
  order: number
  archived: boolean
  pinned: boolean
}

interface Task {
  id: string
  title: string
  description: string | null
  status: "TODO" | "IN_PROGRESS" | "DONE"
  priority: "P1" | "P2" | "P3" | "P4"
  startDate: Date | null
  dueDate: Date | null
  duration: number | null
  starred: boolean
  createdAt: Date
  updatedAt: Date
  assignees: Array<{
    user: {
      id: string
      name: string | null
      image: string | null
    }
  }>
  labels: Array<{
    label: {
      id: string
      name: string
      color: string
    }
  }>
  subtasks: Array<{
    id: string
    title: string
    completed: boolean
  }>
}

export default function ListDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()

  const listId = params.listId as string

  const [list, setList] = useState<List | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>("list")

  useEffect(() => {
    fetchList()
    fetchTasks()
  }, [listId])

  const fetchList = async () => {
    try {
      const res = await fetch(`/api/lists/${listId}`)
      if (!res.ok) throw new Error("Gagal memuat list")
      const data = await res.json()
      setList(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat data list",
        variant: "destructive",
      })
    }
  }

  const fetchTasks = async () => {
    try {
      const res = await fetch(`/api/lists/${listId}/tasks`)
      if (!res.ok) throw new Error("Gagal memuat tasks")
      const data = await res.json()
      setTasks(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!list) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">List tidak ditemukan</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:pl-72">
          <div className="mx-auto max-w-6xl space-y-6">
            {/* Breadcrumb & Header */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <button
                onClick={() => router.push(`/dashboard/communities/${listId.substring(0, 8)}`)}
                className="hover:text-foreground"
              >
                Dashboard
              </button>
              <span>/</span>
              <span className="text-foreground">{list.name}</span>
            </div>

            {/* List Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div
                  className="h-6 w-6 rounded"
                  style={{ backgroundColor: list.color }}
                />
                <h1 className="text-2xl font-bold tracking-tight">{list.name}</h1>
                {list.pinned && (
                  <span className="text-xs text-muted-foreground">📌</span>
                )}
              </div>

              {/* View Switcher */}
              <div className="flex items-center gap-1 rounded-md border p-1">
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "kanban" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("kanban")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "calendar" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("calendar")}
                >
                  <Calendar className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "timeline" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("timeline")}
                >
                  <Clock className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Task Content */}
            {viewMode === "list" && (
              <TaskList tasks={tasks} listId={listId} onTaskUpdated={fetchTasks} />
            )}

            {viewMode === "kanban" && (
              <div className="rounded-lg border bg-muted/50 p-8 text-center">
                <LayoutGrid className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Kanban Board</h3>
                <p className="text-muted-foreground">
                  Coming soon! Install @dnd-kit untuk mengaktifkan drag-and-drop.
                </p>
              </div>
            )}

            {viewMode === "calendar" && (
              <div className="rounded-lg border bg-muted/50 p-8 text-center">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Calendar View</h3>
                <p className="text-muted-foreground">
                  Coming soon! Gunakan date-fns untuk menampilkan calendar.
                </p>
              </div>
            )}

            {viewMode === "timeline" && (
              <div className="rounded-lg border bg-muted/50 p-8 text-center">
                <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Timeline View</h3>
                <p className="text-muted-foreground">
                  Coming soon! Implementasi Gantt chart.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  )
}