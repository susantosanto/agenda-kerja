"use client"

import { useState } from "react"
import { format, isPast, isToday, isTomorrow } from "date-fns"
import { id } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, MoreHorizontal, Calendar, User, Tag, ChevronDown, ChevronRight } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { SubtaskItem } from "./subtask-item"
import { useToast } from "@/components/ui/use-toast"

interface TaskItemProps {
  task: {
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
  onToggleComplete?: () => void
  onToggleStar?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onSubtaskToggle?: (subtaskId: string, completed: boolean) => void
  onSubtaskUpdate?: (subtaskId: string, title: string) => void
  onSubtaskDelete?: (subtaskId: string) => void
  onSubtaskCreate?: (title: string) => void
}

const priorityColors = {
  P1: "bg-red-500 text-white",
  P2: "bg-orange-500 text-white",
  P3: "bg-blue-500 text-white",
  P4: "bg-gray-500 text-white",
}

const priorityLabels = {
  P1: "P1 - Tinggi",
  P2: "P2 - Sedang",
  P3: "P3 - Rendah",
  P4: "P4 - Minimal",
}

export function TaskItem({
  task,
  onToggleComplete,
  onToggleStar,
  onEdit,
  onDelete,
  onSubtaskToggle,
  onSubtaskUpdate,
  onSubtaskDelete,
  onSubtaskCreate,
}: TaskItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showSubtasks, setShowSubtasks] = useState(false)
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("")
  const [isAddingSubtask, setIsAddingSubtask] = useState(false)
  const { toast } = useToast()

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (date: Date | null) => {
    if (!date) return null
    if (isToday(date)) return " Hari ini"
    if (isTomorrow(date)) return " Besok"
    if (isPast(date) && task.status !== "DONE") return "Terlewat"
    return format(new Date(date), "d MMM", { locale: id })
  }

  const isOverdue =
    task.dueDate &&
    isPast(new Date(task.dueDate)) &&
    task.status !== "DONE"

  const completedSubtasks = task.subtasks.filter((s) => s.completed).length
  const totalSubtasks = task.subtasks.length

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return
    try {
      await onSubtaskCreate?.(newSubtaskTitle.trim())
      setNewSubtaskTitle("")
      setIsAddingSubtask(false)
      toast({
        title: "Berhasil",
        description: "Subtask ditambahkan",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menambahkan subtask",
        variant: "destructive",
      })
    }
  }

  return (
    <div
      className={cn(
        "group rounded-lg border bg-card p-4 transition-all hover:shadow-md",
        task.status === "DONE" && "opacity-60"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex gap-3">
        {/* Checkbox */}
        <button
          onClick={onToggleComplete}
          className={cn(
            "mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-colors",
            task.status === "DONE"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-muted-foreground/30 hover:border-primary"
          )}
        >
          {task.status === "DONE" && (
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 space-y-2">
          {/* Title & Star */}
          <div className="flex items-start justify-between gap-2">
            <h4
              className={cn(
                "text-sm font-medium",
                task.status === "DONE" && "line-through text-muted-foreground"
              )}
            >
              {task.title}
            </h4>
            <button
              onClick={onToggleStar}
              className={cn(
                "flex-shrink-0 transition-colors",
                isHovered || task.starred
                  ? task.starred
                    ? "text-yellow-500"
                    : "text-muted-foreground"
                  : "text-transparent"
              )}
            >
              <Star
                className="h-4 w-4"
                fill={task.starred ? "currentColor" : "none"}
              />
            </button>
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Subtasks toggle */}
          {totalSubtasks > 0 && (
            <button
              onClick={() => setShowSubtasks(!showSubtasks)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              {showSubtasks ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
              Subtasks: {completedSubtasks}/{totalSubtasks}
            </button>
          )}

          {/* Subtasks List */}
          {showSubtasks && totalSubtasks > 0 && (
            <div className="ml-4 space-y-1 border-l-2 border-muted pl-3">
              {task.subtasks.map((subtask) => (
                <SubtaskItem
                  key={subtask.id}
                  subtask={subtask}
                  onToggle={() => onSubtaskToggle?.(subtask.id, !subtask.completed)}
                  onUpdate={(title) => onSubtaskUpdate?.(subtask.id, title)}
                  onDelete={() => onSubtaskDelete?.(subtask.id)}
                />
              ))}
            </div>
          )}

          {/* Add Subtask Input */}
          {showSubtasks && (
            <div className="ml-4 flex items-center gap-2 border-l-2 border-muted pl-3">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddSubtask()
                }}
                placeholder="+ Tambah subtask"
                className="flex-1 text-sm border-none bg-transparent outline-none placeholder:text-muted-foreground"
              />
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-2"
                onClick={handleAddSubtask}
                disabled={!newSubtaskTitle.trim()}
              >
                +
              </Button>
            </div>
          )}

          {/* Meta: Due date, assignees, labels */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Due Date */}
            {task.dueDate && (
              <div
                className={cn(
                  "flex items-center gap-1",
                  isOverdue && "text-destructive font-medium"
                )}
              >
                <Calendar className="h-3 w-3" />
                <span>{formatDate(task.dueDate)}</span>
              </div>
            )}

            {/* Assignees */}
            {task.assignees.length > 0 && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3 text-muted-foreground" />
                <div className="flex -space-x-2">
                  {task.assignees.slice(0, 3).map((assignment) => (
                    <Avatar
                      key={assignment.user.id}
                      className="h-5 w-5 border-2 border-background"
                    >
                      <AvatarImage src={assignment.user.image || ""} />
                      <AvatarFallback className="text-[10px]">
                        {getInitials(assignment.user.name || "U")}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {task.assignees.length > 3 && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px]">
                      +{task.assignees.length - 3}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Labels */}
            {task.labels.length > 0 && (
              <div className="flex items-center gap-1">
                <Tag className="h-3 w-3 text-muted-foreground" />
                <div className="flex gap-1">
                  {task.labels.slice(0, 2).map(({ label }) => (
                    <Badge
                      key={label.id}
                      variant="outline"
                      className="px-1.5 py-0 text-[10px]"
                      style={{
                        borderColor: label.color,
                        color: label.color,
                      }}
                    >
                      {label.name}
                    </Badge>
                  ))}
                  {task.labels.length > 2 && (
                    <span className="text-xs text-muted-foreground">
                      +{task.labels.length - 2}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Priority Badge */}
            <Badge className={priorityColors[task.priority]} variant="secondary">
              {priorityLabels[task.priority]}
            </Badge>
          </div>
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShowSubtasks(!showSubtasks)} className="gap-2">
              {showSubtasks ? "Sembunyikan Subtasks" : "Tampilkan Subtasks"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onToggleComplete} className="gap-2">
              {task.status === "DONE" ? "Tandai Belum Selesai" : "Tandai Selesai"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onToggleStar} className="gap-2">
              {task.starred ? "Unstar" : "Star"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit} className="gap-2">
              Edit Task
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="gap-2 text-destructive"
            >
              Hapus Task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
