"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { 
  Star, 
  Calendar, 
  Clock, 
  MoreVertical, 
  CheckCircle2, 
  Circle,
  AlertCircle,
  Trash2,
  Edit3,
  MessageSquare
} from "lucide-react"
import { format, isToday, isTomorrow, isPast } from "date-fns"
import { id } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge, badgeVariants } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  startDate?: string
  dueDate?: string
  duration?: number
  isStarred: boolean
  order: number
  createdBy: { id: string; name?: string; image?: string }
  assignees: { user: { id: string; name?: string; image?: string } }[]
  subtasks: { id: string; title: string; isDone: boolean }[]
  labels: { label: { id: string; name: string; color: string } }[]
}

interface TaskItemProps {
  task: Task
  onEdit?: (task: Task) => void
}

const priorityConfig = {
  P1: { label: "P1", color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100", icon: AlertCircle },
  P2: { label: "P2", color: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-100", icon: AlertCircle },
  P3: { label: "P3", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100", icon: Circle },
  P4: { label: "P4", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300", icon: Circle },
}

export function TaskItem({ task, onEdit }: TaskItemProps) {
  const queryClient = useQueryClient()
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== "DONE"
  const isDueToday = task.dueDate && isToday(new Date(task.dueDate))
  const isDueTomorrow = task.dueDate && isTomorrow(new Date(task.dueDate))

  const toggleComplete = useMutation({
    mutationFn: async () => {
      const newStatus = task.status === "DONE" ? "TODO" : "DONE"
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task.id, status: newStatus }),
      })
      if (!res.ok) throw new Error("Failed to update task")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
    },
  })

  const toggleStar = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task.id, isStarred: !task.isStarred }),
      })
      if (!res.ok) throw new Error("Failed to update task")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
    },
  })

  const deleteTask = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/tasks?id=${task.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete task")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
    },
  })

  const priority = priorityConfig[task.priority as keyof typeof priorityConfig]
  const PriorityIcon = priority.icon

  const completedSubtasks = task.subtasks?.filter((s) => s.isDone).length || 0
  const totalSubtasks = task.subtasks?.length || 0
  const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0

  return (
    <div
      className={cn(
        "group relative rounded-xl border bg-card p-4 transition-all duration-200",
        "hover:shadow-lg hover:border-primary/20",
        task.status === "DONE" && "opacity-60"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => toggleComplete.mutate()}
          disabled={toggleComplete.isPending}
          className={cn(
            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200",
            task.status === "DONE"
              ? "border-emerald-500 bg-emerald-500 text-white"
              : "border-slate-300 dark:border-slate-600 hover:border-primary"
          )}
        >
          {task.status === "DONE" && <CheckCircle2 className="h-3.5 w-3.5" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4
              className={cn(
                "font-medium leading-tight",
                task.status === "DONE" && "line-through text-muted-foreground"
              )}
            >
              {task.title}
            </h4>
            <button
              onClick={() => toggleStar.mutate()}
              className={cn(
                "shrink-0 transition-colors",
                task.isStarred
                  ? "text-amber-500"
                  : "text-slate-300 dark:text-slate-600 hover:text-amber-500"
              )}
            >
              <Star className={cn("h-4 w-4", task.isStarred && "fill-current")} />
            </button>
          </div>

          {/* Description */}
          {task.description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Meta */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {/* Priority */}
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
                priority.color
              )}
            >
              <PriorityIcon className="h-3 w-3" />
              {priority.label}
            </span>

            {/* Due Date */}
            {task.dueDate && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-xs",
                  isOverdue && "text-red-600 dark:text-red-400",
                  isDueToday && "text-amber-600 dark:text-amber-400"
                )}
              >
                <Calendar className="h-3 w-3" />
                {isDueToday
                  ? "Today"
                  : isDueTomorrow
                  ? "Tomorrow"
                  : format(new Date(task.dueDate), "MMM d", { locale: id })}
              </span>
            )}

            {/* Duration */}
            {task.duration && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {task.duration}m
              </span>
            )}

            {/* Subtasks */}
            {totalSubtasks > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3 w-3" />
                {completedSubtasks}/{totalSubtasks}
              </span>
            )}

            {/* Labels */}
            {task.labels?.map(({ label }) => (
              <span
                key={label.id}
                className="inline-flex items-center rounded-full px-2 py-0.5 text-xs"
                style={{ backgroundColor: label.color + "20", color: label.color }}
              >
                {label.name}
              </span>
            ))}
          </div>

          {/* Progress Bar */}
          {progress > 0 && progress < 100 && (
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Assignees */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex -space-x-2">
              {task.assignees?.slice(0, 3).map(({ user }) => (
                <Avatar key={user.id} className="h-6 w-6 border-2 border-card">
                  <AvatarImage src={user.image} />
                  <AvatarFallback className="text-[10px]">
                    {user.name?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(task)}>
                <Edit3 className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem>
                <MessageSquare className="mr-2 h-4 w-4" />
                Comments
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => deleteTask.mutate()}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}