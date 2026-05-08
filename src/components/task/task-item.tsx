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
  onPrefetch?: () => void
}

const priorityColors = {
  P1: "bg-gradient-to-r from-red-500/20 to-red-600/10 text-red-600 border-red-300/50 shadow-sm shadow-red-100/50",
  P2: "bg-gradient-to-r from-orange-500/20 to-orange-600/10 text-orange-600 border-orange-300/50 shadow-sm shadow-orange-100/50",
  P3: "bg-gradient-to-r from-blue-500/20 to-blue-600/10 text-blue-600 border-blue-300/50 shadow-sm shadow-blue-100/50",
  P4: "bg-gradient-to-r from-slate-500/20 to-slate-600/10 text-slate-600 border-slate-300/50 shadow-sm shadow-slate-100/50",
}

const priorityLabels = {
  P1: "Urgent",
  P2: "High",
  P3: "Medium",
  P4: "Low",
}

const statusStyles = {
  TODO: "border-border/50",
  IN_PROGRESS: "border-amber-500/20 bg-gradient-to-r from-amber-500/[0.02] to-transparent",
  DONE: "border-emerald-500/20 bg-gradient-to-r from-emerald-500/[0.02] to-transparent opacity-75",
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
        "group relative rounded-2xl border bg-card p-4 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-0.5 cursor-pointer overflow-hidden",
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/5 before:via-transparent before:to-purple-500/5 before:opacity-0 before:transition-opacity hover:before:opacity-100",
        statusStyles[task.status]
      )}
      onClick={handleCardClick}
      onMouseEnter={() => {
        setIsHovered(true)
        // Prefetch task detail data for instant load
        onPrefetch?.()
      }}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex gap-4">
        {/* Checkbox - Premium Style with animated ring */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleComplete?.()
          }}
          className={cn(
            "mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-xl border-2 transition-all duration-300 relative",
            task.status === "DONE"
              ? "border-primary bg-primary text-primary-foreground scale-95 shadow-lg shadow-primary/30"
              : "border-muted-foreground/30 bg-background hover:border-primary hover:scale-110 hover:shadow-lg hover:shadow-primary/20"
          )}
        >
          {task.status === "DONE" ? (
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <div className={cn(
              "h-2 w-2 rounded-full bg-primary/30 transition-all duration-300",
              isHovered && "scale-150 bg-primary"
            )} />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 space-y-3">
          {/* Title & Star */}
          <div className="flex items-start justify-between gap-3">
            <h4
              className={cn(
                "text-[15px] font-bold tracking-tight text-foreground transition-all leading-snug",
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
                "flex-shrink-0 transition-all duration-300 mt-0.5",
                isHovered || task.starred
                  ? task.starred
                    ? "text-amber-400 scale-110 drop-shadow-lg"
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
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {/* Priority Badge - Always show first with glow effect */}
            <Badge 
              className={cn(
                "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all",
                priorityColors[task.priority],
                isHovered && task.priority === "P1" && "shadow-lg shadow-red-200/50",
                isHovered && task.priority === "P2" && "shadow-lg shadow-orange-200/50",
                isHovered && task.priority === "P3" && "shadow-lg shadow-blue-200/50"
              )} 
              variant="secondary"
            >
              {priorityLabels[task.priority]}
            </Badge>

            {/* Due Date - Enhanced with icon */}
            {task.dueDate && (
              <div
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold tracking-tight transition-all",
                  isOverdue 
                    ? "bg-destructive/10 border-destructive/30 text-destructive" 
                    : "bg-muted/40 border-border/60 text-muted-foreground hover:bg-muted/60"
                )}
              >
                <Calendar className={cn("h-3 w-3", isOverdue && "text-destructive")} />
                <span>{formatDate(task.dueDate)}</span>
              </div>
            )}

            {/* Subtasks Count - Interactive */}
            {totalSubtasks > 0 && (
              <button
                onClick={() => setShowSubtasks(!showSubtasks)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold tracking-tight transition-all",
                  showSubtasks 
                    ? "bg-primary/10 border-primary/30 text-primary" 
                    : "bg-muted/40 border-border/60 text-muted-foreground hover:bg-muted/60"
                )}
              >
                {showSubtasks ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
                <span>{completedSubtasks}/{totalSubtasks} subtasks</span>
              </button>
            )}

            <div className="flex-1" />

            {/* Labels & Assignees Grouped Right */}
            <div className="flex items-center gap-3">
              {/* Labels - Show as colored dots with tooltip */}
              {task.labels.length > 0 && (
                <div className="flex items-center gap-1.5">
                  {task.labels.slice(0, 3).map(({ label }) => (
                    <div
                      key={label.id}
                      className="h-2.5 w-2.5 rounded-full shadow-md ring-1 ring-white/50 transition-transform hover:scale-125 cursor-pointer"
                      title={label.name}
                      style={{ backgroundColor: label.color }}
                    />
                  ))}
                  {task.labels.length > 3 && (
                    <span className="text-[10px] text-muted-foreground font-medium">
                      +{task.labels.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Assignees - Stacked Avatars */}
              {task.assignees.length > 0 && (
                <div className="flex -space-x-2 hover:-space-x-1 transition-all duration-300">
                  {task.assignees.slice(0, 3).map((assignment, i) => (
                    <UIAvatar
                      key={assignment.user.id}
                      className={cn(
                        "h-7 w-7 border-2 border-background shadow-md transition-all",
                        isHovered && "hover:scale-110 hover:z-10"
                      )}
                      style={{ zIndex: 3 - i }}
                    >
                      <AvatarImage src={assignment.user.image || ""} />
                      <AvatarFallback className="text-[9px] font-black bg-gradient-to-br from-primary/20 to-purple-500/20 text-primary">
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
            <div 
              className="mt-4 ml-2 space-y-2 border-l-2 border-primary/20 pl-4 py-2 rounded-r-lg bg-gradient-to-r from-primary/5 to-transparent" 
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
              <div className="pt-2 border-t border-border/30 mt-3">
                <input
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddSubtask()
                  }}
                  placeholder="Add a subtask..."
                  className="w-full text-sm font-medium border-none bg-transparent outline-none placeholder:text-muted-foreground/50 py-1.5 px-2 rounded-lg hover:bg-muted/30 transition-colors"
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
                  "h-9 w-9 rounded-xl hover:bg-muted transition-all duration-300 hover:scale-105 opacity-60 hover:opacity-100 shadow-sm"
                )}
              >
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
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
