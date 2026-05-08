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
    <div className="min-h-screen bg-background">
      {/* Premium Header */}
      <div className="bg-transparent">
        <div className="max-w-6xl mx-auto px-6 pt-6 pb-4">
          {/* Stats Bar - Mobile First (no scroll) */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="flex items-center gap-1.5 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl bg-slate-500/10 border border-slate-500/20">
              <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-500 shrink-0" />
              <div className="min-w-0">
                <span className="text-sm sm:text-base font-black text-slate-500 tabular-nums">{pendingCount}</span>
                <span className="text-[9px] sm:text-[10px] font-semibold text-slate-500/70 ml-1">Pending</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Flame className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-500 shrink-0" />
              <div className="min-w-0">
                <span className="text-sm sm:text-base font-black text-amber-500 tabular-nums">{inProgressCount}</span>
                <span className="text-[9px] sm:text-[10px] font-semibold text-amber-500/70 ml-1">Progress</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-500 shrink-0" />
              <div className="min-w-0">
                <span className="text-sm sm:text-base font-black text-emerald-500 tabular-nums">{completedCount}</span>
                <span className="text-[9px] sm:text-[10px] font-semibold text-emerald-500/70 ml-1">Selesai</span>
              </div>
            </div>
          </div>

          {/* Toolbar - Mobile First */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 flex-1 min-w-0">
              {/* Sort */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 sm:h-9 rounded-lg sm:rounded-xl border-border/60 bg-muted/30 hover:bg-muted/50 font-medium text-[11px] sm:text-xs gap-1.5 px-2.5 sm:px-3">
                    <SortAsc className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="hidden xs:inline">Sort</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="rounded-xl border-border/60 bg-card/95 backdrop-blur-sm shadow-xl p-1 min-w-[160px]">
                  <DropdownMenuItem onClick={() => setSortBy("dueDate")} className={cn("rounded-lg text-sm", sortBy === "dueDate" && "bg-primary/10 text-primary")}>
                    <CalendarDays className="mr-2 h-4 w-4" />
                    Due Date
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("priority")} className={cn("rounded-lg text-sm", sortBy === "priority" && "bg-primary/10 text-primary")}>
                    <Flame className="mr-2 h-4 w-4" />
                    Priority
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("title")} className={cn("rounded-lg text-sm", sortBy === "title" && "bg-primary/10 text-primary")}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Title
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("createdAt")} className={cn("rounded-lg text-sm", sortBy === "createdAt" && "bg-primary/10 text-primary")}>
                    <Clock className="mr-2 h-4 w-4" />
                    Recently Added
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Group */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 sm:h-9 rounded-lg sm:rounded-xl border-border/60 bg-muted/30 hover:bg-muted/50 font-medium text-[11px] sm:text-xs gap-1.5 px-2.5 sm:px-3">
                    <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                    {groupBy === "none" ? "Group" : groupBy === "status" ? "Status" : "Priority"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="rounded-xl border-border/60 bg-card/95 backdrop-blur-sm shadow-xl p-1 min-w-[160px]">
                  <DropdownMenuItem onClick={() => setGroupBy("none")} className={cn("rounded-lg text-sm", groupBy === "none" && "bg-primary/10 text-primary")}>
                    No Grouping
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setGroupBy("status")} className={cn("rounded-lg text-sm", groupBy === "status" && "bg-primary/10 text-primary")}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Group by Status
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setGroupBy("priority")} className={cn("rounded-lg text-sm", groupBy === "priority" && "bg-primary/10 text-primary")}>
                    <Flame className="mr-2 h-4 w-4" />
                    Group by Priority
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/30 border border-border/50 shrink-0">
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-1.5 sm:p-2 rounded-lg transition-all",
                  viewMode === "list" ? "bg-background shadow-md" : "hover:bg-muted/50"
                )}
                title="List view"
              >
                <List className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", viewMode === "list" ? "text-primary" : "text-muted-foreground")} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-1.5 sm:p-2 rounded-lg transition-all",
                  viewMode === "grid" ? "bg-background shadow-md" : "hover:bg-muted/50"
                )}
                title="Grid view"
              >
                <LayoutGrid className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", viewMode === "grid" ? "text-primary" : "text-muted-foreground")} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Task List - Mobile First */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-20">
          {tasks.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-16 sm:py-24 text-center animate-in fade-in slide-in-from-top-4 duration-500"
            >
              <div className="relative mb-6 sm:mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full blur-3xl scale-150" />
                <div className="relative h-16 w-16 sm:h-24 sm:w-24 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 flex items-center justify-center">
                  <Target className="h-7 w-7 sm:h-10 sm:w-10 text-primary/50" />
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">No tasks yet</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-md">
                Start organizing your work by creating your first task.
              </p>
              <Button 
                onClick={() => setCreateTaskOpen(true)}
                className="h-12 px-8 rounded-xl bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 text-white font-bold shadow-lg shadow-primary/25"
              >
                <Plus className="mr-2 h-5 w-5" />
                Create First Task
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
                    {/* Group Header - Mobile First */}
                    {groupBy !== "none" && groupConfig && (
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className={cn("flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl", groupConfig.bg)}>
                          <groupConfig.icon className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", groupConfig.color)} />
                          <span className={cn("text-xs sm:text-sm font-bold", groupConfig.color)}>{groupConfig.label}</span>
                        </div>
                        <div className="flex-1 h-px bg-gradient-to-r from-border/50 to-transparent" />
                        <span className="text-[10px] sm:text-xs font-medium text-muted-foreground/60">{groupTasks.length} tasks</span>
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
        <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-primary/30 to-purple-600/30 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        {/* Pulse ring — gentle heartbeat */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-purple-600/20 animate-pulse opacity-30 group-hover:opacity-0 transition-opacity duration-500" />
        
        {/* Button body */}
        <div className="relative h-14 w-14 md:h-16 md:w-16 rounded-full bg-gradient-to-br from-primary via-primary to-purple-600 flex items-center justify-center shadow-xl shadow-primary/30 ring-1 ring-white/20 group-hover:shadow-2xl group-hover:shadow-primary/50 group-hover:scale-110 active:scale-95 transition-all duration-300 ease-out">
          {/* Inner depth overlay */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/20 via-transparent to-white/20 pointer-events-none" />
          
          {/* Plus icon */}
          <Plus className="h-6 w-6 md:h-7 md:w-7 text-white drop-shadow-sm relative z-10 group-hover:rotate-90 transition-transform duration-300 ease-out" />
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
