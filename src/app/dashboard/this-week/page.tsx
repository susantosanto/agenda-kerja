"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { TaskList } from "@/components/task/task-list"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, Clock } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

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
  list: { id: string; name: string; color: string }
  assignees: Array<{ user: { id: string; name: string | null; image: string | null } }>
  labels: Array<{ label: { id: string; name: string; color: string } }>
  subtasks: Array<{ id: string; title: string; completed: boolean }>
}

export default function ThisWeekPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks/filtered?filter=this-week")
      if (!res.ok) throw new Error("Gagal memuat tasks")
      const data = await res.json()
      setTasks(data)
    } catch (error) {
      toast({ title: "Error", description: "Gagal memuat data tasks", variant: "destructive" })
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:pl-72">
          <div className="mx-auto max-w-6xl space-y-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <button onClick={() => router.push("/dashboard")} className="hover:text-foreground">Dashboard</button>
              <span>/</span>
              <span className="text-foreground">Minggu Ini</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Minggu Ini</h1>
                <p className="text-sm text-muted-foreground">Tugas yang jatuh tempo minggu ini</p>
              </div>
            </div>
            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
                <Clock className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">Tidak ada tugas minggu ini</p>
              </div>
            ) : (
              <TaskList tasks={tasks} onTaskUpdated={fetchTasks} />
            )}
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  )
}