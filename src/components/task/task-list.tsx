"use client"

import { useState } from "react"
import { TaskItem } from "./task-item"
import { Button } from "@/components/ui/button"
import { 
  Plus, 
  Loader2, 
  LayoutGrid,
  List,
  SortAsc,
  SlidersHorizontal,
  Sparkles,
  Target,
  CalendarDays,
  CheckCircle2,
  Clock,
  Flame,
  AlertCircle,
  TrendingUp,
  Minus,
  ArrowDown
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TaskFormModal } from "./task-form-modal"
import { useToast } from "@/components/ui/use-toast"
import { useQueryClient } from "@tanstack/react-query"

interface TaskListProps {
  tasks: Array<{
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
  }>
  onTaskUpdated?: () => void
}

type SortOption = "dueDate" | "priority" | "title" | "createdAt"
type ViewMode = "list" | "grid"
type GroupOption = "none" | "status" | "priority"

const statusGroups = {
  TODO: { label: "To Do", icon: Clock, color: "text-slate-500", bg: "bg-slate-500/10" },
  IN_PROGRESS: { label: "In Progress", icon: Flame, color: "text-amber-500", bg: "bg-amber-500/10" },
  DONE: { label: "Completed", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" }
}

const priorityGroups = {
  P1: { label: "Urgent", icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30" },
  P2: { label: "High", icon: TrendingUp, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/30" },
  P3: { label: "Medium", icon: Minus, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/30" },
  P4: { label: "Low", icon: ArrowDown, color: "text-slate-500", bg: "bg-slate-500/10", border: "border-slate-500/30" }
}

export function TaskList({ tasks, onTaskUpdated }: TaskListProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [createTaskOpen, setCreateTaskOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<{
    id: string
    title: string
    description?: string | null
    priority: "P1" | "P2" | "P3" | "P4"
    startDate: Date | null
    dueDate: Date | null
    duration: number | null
    assigneeIds: string[]
    labelIds: string[]
    status: "TODO" | "IN_PROGRESS" | "DONE"
  } | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>("dueDate")
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [groupBy, setGroupBy] = useState<GroupOption>("status")

  const sortedTasks = [...tasks].sort((a, b) => {
    switch (sortBy) {
      case "dueDate":
        if (!a.dueDate && !b.dueDate) return 0
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      case "priority":
        const priorityOrder = { P1: 0, P2: 1, P3: 2, P4: 3 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      case "title":
        return a.title.localeCompare(b.title)
      case "createdAt":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      default:
        return 0
    }
  })

  const groupedTasks = groupBy === "none" 
    ? { "": sortedTasks } 
    : sortedTasks.reduce((acc, task) => {
        const key = groupBy === "status" ? task.status : task.priority
        if (!acc[key]) acc[key] = []
        acc[key].push(task)
        return acc
      }, {} as Record<string, typeof sortedTasks>)

  const handleToggleComplete = async (taskId: string, currentStatus: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: currentStatus === "DONE" ? "TODO" : "DONE",
        }),
      })
      if (!res.ok) throw new Error("Gagal update status")
      onTaskUpdated?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mengubah status task",
        variant: "destructive",
      })
    }
  }

  const handleToggleStar = async (taskId: string, currentStar: boolean) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ starred: !currentStar }),
      })
      if (!res.ok) throw new Error("Gagal update star")
      onTaskUpdated?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mengubah status star",
        variant: "destructive",
      })
    }
  }

  const handlePrefetchTask = async (taskId: string) => {
    await queryClient.prefetchQuery({
      queryKey: ["task", taskId],
      queryFn: async () => {
        const res = await fetch(`/api/tasks/${taskId}`)
        if (!res.ok) throw new Error()
        return res.json()
      },
      staleTime: 5 * 60 * 1000,
    })
    await queryClient.prefetchQuery({
      queryKey: ["task-comments", taskId],
      queryFn: async () => {
        const res = await fetch(`/api/tasks/${taskId}/comments`)
        if (!res.ok) throw new Error()
        return res.json()
      },
      staleTime: 5 * 60 * 1000,
    })
    await queryClient.prefetchQuery({
      queryKey: ["task-activity", taskId],
      queryFn: async () => {
        const res = await fetch(`/api/tasks/${taskId}/activity`)
        if (!res.ok) throw new Error()
        return res.json()
      },
      staleTime: 5 * 60 * 1000,
    })
  }

  const handleDelete = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Gagal hapus task")
      toast({ title: "Berhasil", description: "Task dihapus" })
      onTaskUpdated?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus task",
        variant: "destructive",
      })
    }
  }

  const completedCount = tasks.filter(t => t.status === "DONE").length
  const inProgressCount = tasks.filter(t => t.status === "IN_PROGRESS").length
  const pendingCount = tasks.filter(t => t.status === "TODO").length

  return (
    <div className="min-h-screen bg-black selection:bg-white/10 selection:text-white">
      {/* ─── PREMIUM TOOLBAR ─── */}
      <div className="sticky top-0 z-30 bg-black/60 backdrop-blur-3xl border-b border-white/[0.02]">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          
          {/* Brand/View Title - Minimalist */}
          <div className="flex items-center gap-3">
            <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Agenda Kerja</span>
          </div>

          {/* Controls - Icon Only for Mobile */}
          <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-2xl border border-white/[0.02]">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/5">
                  <SortAsc className="h-4 w-4 text-white/60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-[1.5rem] border-white/5 bg-zinc-950/98 backdrop-blur-3xl p-2 shadow-2xl">
                <DropdownMenuItem onClick={() => setSortBy("dueDate")} className="rounded-xl px-3 py-2.5">
                  <CalendarDays className="mr-3 h-4 w-4 text-white/40" />
                  <span className="text-sm font-bold">Urutkan Tenggat</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("priority")} className="rounded-xl px-3 py-2.5">
                  <Flame className="mr-3 h-4 w-4 text-white/40" />
                  <span className="text-sm font-bold">Urutkan Prioritas</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="h-4 w-px bg-white/[0.05] mx-1" />

            <button
              onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
              className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-white/5 transition-all text-white/60"
            >
              {viewMode === "list" ? <LayoutGrid className="h-4 w-4" /> : <List className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* ─── TASK FEED ─── */}
      <div className="max-w-6xl mx-auto px-4 pt-8 pb-32">
          {tasks.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-16 sm:py-24 text-center animate-in fade-in slide-in-from-top-4 duration-500"
            >
              <div className="relative mb-6 sm:mb-8">
                <div className="absolute inset-0 bg-white/5 rounded-full blur-3xl scale-150" />
                <div className="relative h-16 w-16 sm:h-24 sm:w-24 rounded-2xl sm:rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center">
                  <div className="text-4xl sm:text-6xl grayscale opacity-20 group-hover:opacity-100 transition-all duration-500">✨</div>
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-white/90 tracking-tight">Agenda Anda bersih</h3>
                <p className="text-xs text-white/30 max-w-[280px] mx-auto leading-relaxed font-bold uppercase tracking-widest">
                  Nikmati ketenangan ini.
                </p>
              </div>
              <Button 
                onClick={() => onTaskUpdated?.()}
                variant="outline"
                className="h-12 px-8 rounded-xl bg-white/[0.02] border-zinc-800 text-white hover:bg-white hover:text-black transition-all duration-300 font-bold"
              >
                Perbarui Daftar
              </Button>

            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-300">
              {Object.entries(groupedTasks).map(([groupKey, groupTasks]) => {
                const groupConfig = groupBy === "status" 
                  ? statusGroups[groupKey as keyof typeof statusGroups]
                  : groupBy === "priority"
                  ? priorityGroups[groupKey as keyof typeof priorityGroups]
                  : null

                return (
                  <div
                    key={groupKey || "all"}
                    className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
                  >
                    {/* Group Header - High End Minimalist */}
                    {groupBy !== "none" && groupConfig && (
                      <div className="flex items-center justify-between pb-2 px-1">
                        <div className="flex items-center gap-3">
                          <span className={cn("text-xs font-black uppercase tracking-[0.3em]", groupConfig.color)}>{groupConfig.label}</span>
                          <span className="h-1 w-1 rounded-full bg-white/10" />
                          <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{groupTasks.length} Tugas</span>
                        </div>
                      </div>
                    )}

                    {/* Tasks */}
                    <div className={cn(
                      viewMode === "grid" 
                        ? "grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
                        : "space-y-2 sm:space-y-3"
                    )}>
                      {groupTasks.map((task) => (
                        <div
                          key={task.id}
                          className="animate-in fade-in slide-in-from-bottom-2 duration-200"
                        >
                          <TaskItem
                            task={task}
                            onToggleComplete={() => handleToggleComplete(task.id, task.status)}
                            onToggleStar={() => handleToggleStar(task.id, task.starred)}
                            onEdit={() => {
                              setEditingTask({
                                id: task.id,
                                title: task.title,
                                description: task.description,
                                priority: task.priority,
                                startDate: task.startDate,
                                dueDate: task.dueDate,
                                duration: task.duration,
                                assigneeIds: task.assignees?.map((a) => a.user.id) || [],
                                labelIds: task.labels?.map((l) => l.label.id) || [],
                                status: task.status,
                              })
                            }}
                            onDelete={() => handleDelete(task.id)}
                            onPrefetch={() => handlePrefetchTask(task.id)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
      </div>

      {/* ─── FLOATING ACTION BUTTON — SUPER PREMIUM ─── */}
      <button
        onClick={() => setCreateTaskOpen(true)}
        className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-[55] group"
        aria-label="Create New Task"
      >
        {/* Outer glow — subtle by default, intensifies on hover */}
        <div className="absolute -inset-4 rounded-full bg-white/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        {/* Pulse ring — gentle heartbeat */}
        <div className="absolute inset-0 rounded-full bg-white/10 animate-pulse opacity-30 group-hover:opacity-0 transition-opacity duration-500" />
        
        {/* Button body */}
        <div className="relative h-14 w-14 md:h-16 md:w-16 rounded-full bg-white flex items-center justify-center shadow-2xl group-hover:shadow-zinc-800/10 ring-1 ring-zinc-800/20 group-hover:scale-110 active:scale-95 transition-all duration-300 ease-out">
          {/* Inner depth overlay */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/5 via-transparent to-white/10 pointer-events-none" />
          
          {/* Plus icon */}
          <Plus className="h-6 w-6 md:h-7 md:w-7 text-black drop-shadow-sm relative z-10 group-hover:rotate-90 transition-transform duration-300 ease-out" />
        </div>

        {/* Tooltip label — desktop only */}
        <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 hidden md:block px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-200 whitespace-nowrap">
          New Task
        </span>
      </button>

      {/* Create Task Modal */}
      <TaskFormModal
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
        onSuccess={() => {
          setCreateTaskOpen(false)
          onTaskUpdated?.()
        }}
      />

      {/* Edit Task Modal */}
      {editingTask && (
        <TaskFormModal
          open={!!editingTask}
          onOpenChange={(open) => {
            if (!open) setEditingTask(null)
          }}
          taskId={editingTask.id}
          defaultValues={{
            title: editingTask.title,
            description: editingTask.description || "",
            priority: editingTask.priority,
            startDate: editingTask.startDate ? editingTask.startDate.toISOString().split('T')[0] + 'T' + editingTask.startDate.toTimeString().slice(0,5) : null,
            dueDate: editingTask.dueDate ? editingTask.dueDate.toISOString().split('T')[0] + 'T' + editingTask.dueDate.toTimeString().slice(0,5) : null,
            duration: editingTask.duration,
            status: editingTask.status,
          }}
          onSuccess={() => {
            setEditingTask(null)
            onTaskUpdated?.()
          }}
        />
      )}
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
