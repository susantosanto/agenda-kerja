"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format, isPast, isToday, isTomorrow } from "date-fns"
import { id } from "date-fns/locale"
import { Avatar as UIAvatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, MoreHorizontal } from "lucide-react"
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
  onPrefetch?: () => void
}

const priorityDotColors = {
  P1: "bg-red-500",
  P2: "bg-orange-500",
  P3: "bg-blue-500",
  P4: "bg-slate-400",
}

const priorityLabels = {
  P1: "Urgent",
  P2: "High",
  P3: "Medium",
  P4: "Low",
}

const statusStyles = {
  TODO: "border-transparent",
  IN_PROGRESS: "border-l-2 border-l-amber-500/40",
  DONE: "opacity-60",
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
  onPrefetch,
}: TaskItemProps) {
  const router = useRouter()
  const [showSubtasks, setShowSubtasks] = useState(false)
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("")
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
    // Navigate to detail page - use shallow routing for speed
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
        "group relative rounded-lg sm:rounded-xl bg-card border border-border/40 p-3 sm:p-4 transition-all duration-200 hover:shadow-md hover:shadow-primary/5 cursor-pointer overflow-hidden",
        statusStyles[task.status]
      )}
      onClick={handleCardClick}
      onMouseEnter={() => onPrefetch?.()}
    >
      <div className="flex gap-2 sm:gap-4">
        {/* Checkbox - Thin refined style */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleComplete?.()
          }}
          className={cn(
            "mt-0.5 flex h-5 w-5 sm:h-5 sm:w-5 flex-shrink-0 items-center justify-center rounded border transition-all duration-200",
            task.status === "DONE"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-muted-foreground/30 bg-transparent hover:border-primary/60"
          )}
        >
          {task.status === "DONE" ? (
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : null}
        </button>

        {/* Content */}
        <div className="flex-1 space-y-2 sm:space-y-3 min-w-0">
          {/* Title & Star - Mobile First */}
          <div className="flex items-start justify-between gap-2">
            <h4
              className={cn(
                "text-[14px] sm:text-[15px] font-bold tracking-tight text-foreground transition-all leading-snug line-clamp-2",
                task.status === "DONE" && "line-through text-muted-foreground/50 font-medium decoration-emerald-500/50"
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
                "flex-shrink-0 transition-all duration-200 mt-0.5",
                task.starred
                  ? "text-amber-400"
                  : "text-muted-foreground/20 hover:text-amber-400/60"
              )}
            >
              <Star
                className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                fill={task.starred ? "currentColor" : "none"}
              />
            </button>
          </div>

          {/* Description */}
          {task.description && (
            <p className={cn(
              "text-[13px] sm:text-sm leading-relaxed line-clamp-2",
              task.status === "DONE" ? "text-muted-foreground/40" : "text-muted-foreground"
            )}>
              {task.description}
            </p>
          )}

          {/* Meta: Premium minimalis with dot separators */}
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 pt-0.5 text-xs text-muted-foreground">
            {/* Priority: colored dot + label */}
            <span className="flex items-center gap-1 shrink-0">
              <span className={cn("h-1.5 w-1.5 rounded-full", priorityDotColors[task.priority])} />
              <span>{priorityLabels[task.priority]}</span>
            </span>

            {/* Due Date */}
            {task.dueDate && (
              <>
                <span className="text-muted-foreground/20 select-none">·</span>
                <span className={cn("shrink-0", isOverdue && "text-destructive font-medium")}>
                  {formatDate(task.dueDate)}
                </span>
              </>
            )}

            {/* Subtasks count */}
            {totalSubtasks > 0 && (
              <>
                <span className="text-muted-foreground/20 select-none">·</span>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowSubtasks(!showSubtasks) }}
                  className={cn(
                    "hover:text-foreground transition-colors shrink-0",
                    showSubtasks && "text-foreground"
                  )}
                >
                  {completedSubtasks}/{totalSubtasks}
                </button>
              </>
            )}

            {/* Spacer untuk push labels + avatars ke kanan */}
            {(task.labels.length > 0 || task.assignees.length > 0) && (
              <span className="flex-1 min-w-[4px]" />
            )}

            {/* Labels sebagai tiny colored dots */}
            {task.labels.length > 0 && (
              <div className="flex items-center gap-1">
                {task.labels.slice(0, 3).map(({ label }) => (
                  <div
                    key={label.id}
                    className="h-1.5 w-1.5 rounded-full"
                    title={label.name}
                    style={{ backgroundColor: label.color }}
                  />
                ))}
              </div>
            )}

            {/* Assignees - Small stacked avatars */}
            {task.assignees.length > 0 && (
              <div className="flex -space-x-1">
                {task.assignees.slice(0, 2).map((assignment, i) => (
                  <UIAvatar
                    key={assignment.user.id}
                    className="h-4 w-4 border border-background"
                  >
                    <AvatarImage src={assignment.user.image || ""} />
                    <AvatarFallback className="text-[6px] font-bold bg-muted text-muted-foreground">
                      {getInitials(assignment.user.name || "U")}
                    </AvatarFallback>
                  </UIAvatar>
                ))}
                {task.assignees.length > 2 && (
                  <div className="h-4 w-4 rounded-full border border-background bg-muted flex items-center justify-center">
                    <span className="text-[6px] font-bold text-muted-foreground">
                      +{task.assignees.length - 2}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Subtasks List - Minimal style */}
          {showSubtasks && totalSubtasks > 0 && (
            <div 
              className="mt-2 ml-1 space-y-1 border-l border-primary/20 pl-3 py-1" 
              onClick={(e) => e.stopPropagation()}
            >
              {task.subtasks.map((subtask) => (
                <SubtaskItem
                  key={subtask.id}
                  subtask={subtask}
                  onToggle={() => onSubtaskToggle?.(subtask.id, !subtask.completed)}
                  onUpdate={(title) => onSubtaskUpdate?.(subtask.id, title)}
                  onDelete={() => onSubtaskDelete?.(subtask.id)}
                />
              ))}
              {/* Add subtask input */}
              <div className="pt-1.5 border-t border-border/20 mt-2">
                <input
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddSubtask()
                  }}
                  placeholder="Add a subtask..."
                  className="w-full text-xs font-medium border-none bg-transparent outline-none placeholder:text-muted-foreground/40 py-1 px-1 rounded-md hover:bg-muted/20 transition-colors"
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions Dropdown - Premium floating menu */}
        <div className="flex flex-col justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-7 w-7 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl hover:bg-muted transition-all duration-300 opacity-60 hover:opacity-100"
                )}
              >
                <MoreHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl border-border/60 bg-card/95 backdrop-blur-sm shadow-2xl shadow-primary/5 p-2 w-56">
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); router.push(`/tasks/${task.id}`) }} 
                className="rounded-xl gap-2.5 text-sm font-medium cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
              >
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setShowSubtasks(!showSubtasks)} 
                className="rounded-xl gap-2.5 text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors"
              >
                {showSubtasks ? "Hide Subtasks" : "Show Subtasks"}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); onToggleComplete?.() }} 
                className="rounded-xl gap-2.5 text-sm font-medium hover:bg-emerald-500/10 hover:text-emerald-600 transition-colors"
              >
                {task.status === "DONE" ? "Mark as Active" : "Mark as Done"}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); onToggleStar?.() }} 
                className="rounded-xl gap-2.5 text-sm font-medium hover:bg-amber-500/10 hover:text-amber-600 transition-colors"
              >
                {task.starred ? "Remove Star" : "Add Star"}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); onEdit?.() }} 
                className="rounded-xl gap-2.5 text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors"
              >
                Edit Task Details
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/50 my-2" />
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); onDelete?.() }}
                className="rounded-xl gap-2.5 text-sm font-bold text-destructive/80 hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 transition-colors"
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
