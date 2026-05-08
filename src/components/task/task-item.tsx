"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format, isPast, isToday, isTomorrow } from "date-fns"
import { id } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Avatar as UIAvatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  onDetailClick?: (taskId: string) => void
}

const priorityColors = {
  P1: "bg-red-500/10 text-red-600 border-red-200 shadow-sm shadow-red-100",
  P2: "bg-orange-500/10 text-orange-600 border-orange-200 shadow-sm shadow-orange-100",
  P3: "bg-blue-500/10 text-blue-600 border-blue-200 shadow-sm shadow-blue-100",
  P4: "bg-slate-500/10 text-slate-600 border-slate-200 shadow-sm shadow-slate-100",
}

const priorityLabels = {
  P1: "Urgent",
  P2: "High",
  P3: "Medium",
  P4: "Low",
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
  onDetailClick,
}: TaskItemProps) {
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)
  const [showSubtasks, setShowSubtasks] = useState(false)
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("")
  const [isAddingSubtask, setIsAddingSubtask] = useState(false)
  const { toast } = useToast()

  // Navigate to task detail when clicking on the card
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on interactive elements
    const target = e.target as HTMLElement
    if (
      target.closest('button') ||
      target.closest('[role="menu"]') ||
      target.closest('input') ||
      target.closest('textarea')
    ) {
      return
    }
    // Navigate to detail page
    router.push(`/tasks/${task.id}`)
    onDetailClick?.(task.id)
  }

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
    if (isToday(date)) return "Today"
    if (isTomorrow(date)) return "Tomorrow"
    if (isPast(date) && task.status !== "DONE") return "Overdue"
    return format(new Date(date), "MMM d", { locale: id })
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
        title: "Success",
        description: "Subtask added",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add subtask",
        variant: "destructive",
      })
    }
  }

  return (
    <div
      className={cn(
        "group relative rounded-2xl border border-border/50 bg-card p-4 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 cursor-pointer",
        task.status === "DONE" && "bg-muted/30 border-transparent"
      )}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex gap-4">
        {/* Checkbox - Premium Style */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleComplete?.()
          }}
          className={cn(
            "mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-lg border-2 transition-all duration-300",
            task.status === "DONE"
              ? "border-primary bg-primary text-primary-foreground scale-95"
              : "border-muted-foreground/20 bg-background hover:border-primary hover:scale-105"
          )}
        >
          {task.status === "DONE" && (
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={4}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 space-y-3">
          {/* Title & Star */}
          <div className="flex items-start justify-between gap-2">
            <h4
              className={cn(
                "text-[15px] font-bold tracking-tight text-foreground transition-all",
                task.status === "DONE" && "line-through text-muted-foreground/60 font-medium"
              )}
            >
              {task.title}
            </h4>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleStar?.()
              }}
              className={cn(
                "flex-shrink-0 transition-all duration-300",
                isHovered || task.starred
                  ? task.starred
                    ? "text-amber-400 scale-110"
                    : "text-muted-foreground/40 hover:text-amber-400 hover:scale-110"
                  : "opacity-0"
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
            <p className={cn(
              "text-sm leading-relaxed line-clamp-2",
              task.status === "DONE" ? "text-muted-foreground/40" : "text-muted-foreground"
            )}>
              {task.description}
            </p>
          )}

          {/* Meta: Priority, Due date, assignees, labels */}
          <div className="flex flex-wrap items-center gap-4 pt-1">
            {/* Priority Badge - Always show first */}
            <Badge className={cn("px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border transition-all", priorityColors[task.priority])} variant="secondary">
              {priorityLabels[task.priority]}
            </Badge>

            {/* Due Date */}
            {task.dueDate && (
              <div
                className={cn(
                  "flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted/50 border border-border/50 text-[10px] font-bold uppercase tracking-tight",
                  isOverdue ? "text-destructive border-destructive/20 bg-destructive/5" : "text-muted-foreground"
                )}
              >
                <Calendar className="h-3 w-3" />
                <span>{formatDate(task.dueDate)}</span>
              </div>
            )}

            {/* Subtasks Count */}
            {totalSubtasks > 0 && (
              <button
                onClick={() => setShowSubtasks(!showSubtasks)}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted/50 border border-border/50 text-[10px] font-bold uppercase tracking-tight text-muted-foreground hover:bg-muted transition-colors"
              >
                {showSubtasks ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
                Tasks: {completedSubtasks}/{totalSubtasks}
              </button>
            )}

            <div className="flex-1" />

            {/* Labels & Assignees Grouped Right */}
            <div className="flex items-center gap-3">
              {/* Labels */}
              {task.labels.length > 0 && (
                <div className="flex gap-1.5">
                  {task.labels.slice(0, 2).map(({ label }) => (
                    <div
                      key={label.id}
                      className="h-2 w-2 rounded-full shadow-sm"
                      title={label.name}
                      style={{ backgroundColor: label.color }}
                    />
                  ))}
                </div>
              )}

              {/* Assignees */}
              {task.assignees.length > 0 && (
                <div className="flex -space-x-1.5 hover:space-x-0.5 transition-all duration-300">
                  {task.assignees.slice(0, 3).map((assignment) => (
                    <UIAvatar
                      key={assignment.user.id}
                      className="h-6 w-6 border-2 border-background ring-1 ring-border/50 shadow-sm"
                    >
                      <AvatarImage src={assignment.user.image || ""} />
                      <AvatarFallback className="text-[8px] font-black bg-primary/5 text-primary">
                        {getInitials(assignment.user.name || "U")}
                      </AvatarFallback>
                    </UIAvatar>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Subtasks List - Premium Embedded Style */}
          {showSubtasks && totalSubtasks > 0 && (
            <div className="mt-4 ml-2 space-y-2 border-l-2 border-primary/10 pl-4 py-1 animate-scale-in" onClick={(e) => e.stopPropagation()}>
              {task.subtasks.map((subtask) => (
                <SubtaskItem
                  key={subtask.id}
                  subtask={subtask}
                  onToggle={() => onSubtaskToggle?.(subtask.id, !subtask.completed)}
                  onUpdate={(title) => onSubtaskUpdate?.(subtask.id, title)}
                  onDelete={() => onSubtaskDelete?.(subtask.id)}
                />
              ))}
              <div className="pt-1">
                <input
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddSubtask()
                  }}
                  placeholder="+ Add subtask..."
                  className="w-full text-xs font-medium border-none bg-transparent outline-none placeholder:text-muted-foreground/50 py-1"
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions Dropdown */}
        <div className="flex flex-col justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-lg hover:bg-muted transition-all",
                  isHovered ? "opacity-100" : "opacity-0"
                )}
              >
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border-border shadow-2xl p-1.5 w-48">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/tasks/${task.id}`) }} className="rounded-lg gap-2 text-xs font-medium cursor-pointer">
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowSubtasks(!showSubtasks)} className="rounded-lg gap-2 text-xs font-medium">
                {showSubtasks ? "Hide Subtasks" : "Show Subtasks"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onToggleComplete?.() }} className="rounded-lg gap-2 text-xs font-medium">
                {task.status === "DONE" ? "Mark as Active" : "Mark as Done"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onToggleStar?.() }} className="rounded-lg gap-2 text-xs font-medium">
                {task.starred ? "Remove Star" : "Add Star"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.() }} className="rounded-lg gap-2 text-xs font-medium">
                Edit Task Details
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); onDelete?.() }}
                className="rounded-lg gap-2 text-xs font-bold text-destructive focus:bg-destructive/5"
              >
                Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
