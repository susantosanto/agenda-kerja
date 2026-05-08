"use client"

import { TaskItem } from "./task-item"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { TaskFormModal } from "./task-form-modal"
import { useToast } from "@/components/ui/use-toast"

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
type GroupOption = "none" | "status" | "priority" | "assignee"

export function TaskList({ tasks, onTaskUpdated }: TaskListProps) {
  const { toast } = useToast()
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
  const [groupBy, setGroupBy] = useState<GroupOption>("none")

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

  const groupedTasks = groupBy === "none" ? { "": sortedTasks } : sortedTasks.reduce(
    (acc, task) => {
      let key: string
      switch (groupBy) {
        case "status":
          key = task.status
          break
        case "priority":
          key = task.priority
          break
        case "assignee":
          key = task.assignees[0]?.user.id || "unassigned"
          break
        default:
          key = ""
      }
      if (!acc[key]) acc[key] = []
      acc[key].push(task)
      return acc
    },
    {} as Record<string, typeof sortedTasks>
  )

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

  const handleDelete = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      })

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

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Premium Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-muted/30 p-4 rounded-2xl border border-border/50">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 rounded-xl hover:bg-background shadow-sm border border-border/50 font-semibold text-xs">
                Sort: {sortBy === "dueDate" ? "Date" : sortBy === "priority" ? "Priority" : sortBy === "title" ? "Name" : "Newest"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="rounded-xl border-border shadow-lg">
              <DropdownMenuItem onClick={() => setSortBy("dueDate")} className="rounded-lg">
                Due Date
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("priority")} className="rounded-lg">
                Priority
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("title")} className="rounded-lg">
                Title
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("createdAt")} className="rounded-lg">
                Recently Added
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 rounded-xl hover:bg-background shadow-sm border border-border/50 font-semibold text-xs">
                Group: {groupBy === "none" ? "Off" : groupBy === "status" ? "Status" : groupBy === "priority" ? "Priority" : "Assignee"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="rounded-xl border-border shadow-lg">
              <DropdownMenuItem onClick={() => setGroupBy("none")} className="rounded-lg">
                No Grouping
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setGroupBy("status")} className="rounded-lg">
                Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setGroupBy("priority")} className="rounded-lg">
                Priority
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setGroupBy("assignee")} className="rounded-lg">
                Assignee
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button onClick={() => setCreateTaskOpen(true)} size="sm" className="h-10 px-5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all active:scale-95">
          <Plus className="mr-2 h-4 w-4" />
          Create Task
        </Button>
      </div>

      {/* Task Groups - Premium Layout */}
      <div className="space-y-10">
        {Object.entries(groupedTasks).map(([groupName, groupTasks]) => (
          <div key={groupName} className="space-y-4">
            {groupBy !== "none" && (
              <div className="flex items-center gap-3">
                <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] bg-muted/50 px-3 py-1 rounded-full border border-border/50">
                  {groupName === "TODO"
                    ? "To Do"
                    : groupName === "IN_PROGRESS"
                    ? "In Progress"
                    : groupName === "DONE"
                    ? "Completed"
                    : groupName === "P1"
                    ? "Urgent"
                    : groupName === "P2"
                    ? "High"
                    : groupName === "P3"
                    ? "Medium"
                    : groupName === "P4"
                    ? "Low"
                    : groupName === "unassigned"
                    ? "Unassigned"
                    : groupName}
                </h3>
                <div className="h-px flex-1 bg-border/30" />
                <span className="text-[10px] font-bold text-muted-foreground/60">{groupTasks.length} tasks</span>
              </div>
            )}
            <div className="grid gap-3">
              {groupTasks.map((task, index) => (
                <div key={task.id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                  <TaskItem
                    task={task}
                    onToggleComplete={() => handleToggleComplete(task.id, task.status)}
                    onToggleStar={() => handleToggleStar(task.id, task.starred)}
                    onEdit={() => {
                      // Transform task to match editing state shape
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
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-border/50 p-20 text-center bg-muted/5 animate-fade-in">
          <div className="h-20 w-20 rounded-3xl bg-muted/50 flex items-center justify-center mb-6">
             <Plus className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <h4 className="text-xl font-bold text-foreground">No tasks found</h4>
          <p className="text-muted-foreground mt-2 max-w-xs">
            Start organizing your workflow by creating your first premium task.
          </p>
          <Button onClick={() => setCreateTaskOpen(true)} variant="outline" className="mt-8 rounded-xl border-2 font-bold px-8">
            Get Started
          </Button>
        </div>
      )}

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
