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
  listId?: string
  onTaskUpdated?: () => void
}

type SortOption = "dueDate" | "priority" | "title" | "createdAt"
type GroupOption = "none" | "status" | "priority" | "assignee"

export function TaskList({ tasks, listId, onTaskUpdated }: TaskListProps) {
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
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Urutkan: {sortBy === "dueDate" ? "Tanggal" : sortBy === "priority" ? "Prioritas" : sortBy === "title" ? "Nama" : "Terbaru"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortBy("dueDate")}>
                Tanggal Jatuh Tempo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("priority")}>
                Prioritas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("title")}>
                Nama
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("createdAt")}>
                Terbaru
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Kelompokkan: {groupBy === "none" ? "Tidak" : groupBy === "status" ? "Status" : groupBy === "priority" ? "Prioritas" : "Assignee"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setGroupBy("none")}>
                Tidak
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setGroupBy("status")}>
                Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setGroupBy("priority")}>
                Prioritas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setGroupBy("assignee")}>
                Assignee
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button onClick={() => setCreateTaskOpen(true)} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Task
        </Button>
      </div>

      {/* Task Groups */}
      {Object.entries(groupedTasks).map(([groupName, groupTasks]) => (
        <div key={groupName} className="space-y-3">
          {groupBy !== "none" && (
            <h3 className="text-sm font-semibold text-muted-foreground">
              {groupName === "TODO"
                ? "To Do"
                : groupName === "IN_PROGRESS"
                ? "In Progress"
                : groupName === "DONE"
                ? "Selesai"
                : groupName === "P1"
                ? "Prioritas Tinggi"
                : groupName === "P2"
                ? "Prioritas Sedang"
                : groupName === "P3"
                ? "Prioritas Rendah"
                : groupName === "P4"
                ? "Prioritas Minimal"
                : groupName === "unassigned"
                ? "Belum Ditugaskan"
                : groupName}
            </h3>
          )}
          <div className="space-y-3">
            {groupTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={() => handleToggleComplete(task.id, task.status)}
                onToggleStar={() => handleToggleStar(task.id, task.starred)}
                onEdit={() => setEditingTask(task)}
                onDelete={() => handleDelete(task.id)}
              />
            ))}
          </div>
        </div>
      ))}

      {tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">
            Belum ada task. Buat task pertama!
          </p>
        </div>
      )}

      {/* Create Task Modal */}
      <TaskFormModal
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
        listId={listId}
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
          listId={listId}
          taskId={editingTask.id}
          defaultValues={{
            title: editingTask.title,
            description: editingTask.description || "",
            priority: editingTask.priority,
            startDate: editingTask.startDate,
            dueDate: editingTask.dueDate,
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
