"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format, isPast, isToday, isTomorrow } from "date-fns"
import { id } from "date-fns/locale"
import { Avatar as UIAvatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, MoreHorizontal, Trash2, Edit, CheckCircle2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
  onPrefetch?: () => void
}

const priorityDotColors = {
  P1: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]",
  P2: "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]",
  P3: "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]",
  P4: "bg-zinc-600",
}

const priorityLabels = {
  P1: "Sangat Penting",
  P2: "Penting",
  P3: "Normal",
  P4: "Rendah",
}

export function TaskItem({
  task,
  onToggleComplete,
  onToggleStar,
  onEdit,
  onDelete,
  onPrefetch,
}: TaskItemProps) {
  const router = useRouter()

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('[role="menu"]') || target.closest('input')) return
    router.push(`/tasks/${task.id}`)
  }

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
  }

  const formatDate = (date: Date | null) => {
    if (!date) return null
    const d = new Date(date)
    if (isToday(d)) return "Hari Ini"
    if (isTomorrow(d)) return "Besok"
    if (isPast(d) && task.status !== "DONE") return "Terlambat"
    return format(d, "d MMM", { locale: id })
  }

  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== "DONE"

  return (
    <div
      className={cn(
        "group relative rounded-[2rem] bg-white/[0.01] shadow-[0_4px_30px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.01)] p-7 transition-all duration-700 hover:bg-white/[0.02] hover:shadow-[0_20px_50px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.03)] cursor-pointer overflow-hidden",
        task.status === "DONE" ? "opacity-20" : "opacity-100"
      )}
      onClick={handleCardClick}
      onMouseEnter={() => onPrefetch?.()}
    >
      <div className="flex gap-5">
        {/* Checkbox - Ultra Refined */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleComplete?.(); }}
          className={cn(
            "mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border transition-all duration-500",
            task.status === "DONE"
              ? "border-emerald-500 bg-emerald-500 text-black"
              : "border-white/10 bg-white/[0.02] hover:border-white/30"
          )}
        >
          {task.status === "DONE" && <CheckCircle2 className="h-3 w-3" strokeWidth={4} />}
        </button>

        {/* Content */}
        <div className="flex-1 space-y-4 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <h4 className={cn("text-[16px] font-black tracking-tight text-white leading-tight transition-all duration-500", task.status === "DONE" && "text-white/20 font-medium line-through")}>
              {task.title}
            </h4>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleStar?.(); }}
              className={cn("flex-shrink-0 transition-all duration-500 mt-0.5", task.starred ? "text-amber-400 scale-125" : "text-white/5 hover:text-white/20")}
            >
              <Star className="h-4 w-4" fill={task.starred ? "currentColor" : "none"} />
            </button>
          </div>

          {task.description && (
            <p className={cn("text-[13px] leading-relaxed line-clamp-2 transition-colors duration-500 font-medium", task.status === "DONE" ? "text-white/5" : "text-white/30")}>
              {task.description}
            </p>
          )}

          {/* Meta: Black Uppercase Precision */}
          <div className="flex items-center gap-4 pt-2 text-[10px] font-black uppercase tracking-[0.3em] text-white/10">
            <span className="flex items-center gap-2 shrink-0">
              <span className={cn("h-1 w-1 rounded-full", priorityDotColors[task.priority])} />
              <span className="group-hover:text-white/30 transition-colors duration-500">{priorityLabels[task.priority]}</span>
            </span>

            {task.dueDate && (
              <>
                <span className="h-0.5 w-0.5 rounded-full bg-white/5" />
                <span className={cn("shrink-0", isOverdue ? "text-red-500/50" : "group-hover:text-white/30 transition-colors duration-500")}>
                  {formatDate(task.dueDate)}
                </span>
              </>
            )}

            <div className="flex-1" />

            {task.assignees.length > 0 && (
              <div className="flex -space-x-2">
                {task.assignees.slice(0, 3).map((assignment) => (
                  <UIAvatar key={assignment.user.id} className="h-6 w-6 border-2 border-black ring-1 ring-white/5">
                    <AvatarImage src={assignment.user.image || ""} />
                    <AvatarFallback className="bg-zinc-900 text-white text-[6px] font-black">{getInitials(assignment.user.name || "U")}</AvatarFallback>
                  </UIAvatar>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions - Minimalist */}
        <div className="flex flex-col justify-start">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500 bg-white/5 hover:bg-white/10">
                <MoreHorizontal className="h-4 w-4 text-white/40" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-[1.5rem] border-white/5 bg-zinc-950/98 backdrop-blur-3xl p-2 shadow-2xl">
              <DropdownMenuItem onClick={onEdit} className="rounded-xl px-3 py-2.5 cursor-pointer focus:bg-white/5 group transition-colors">
                <Edit className="mr-3 h-4 w-4 text-white/40 group-hover:text-white" />
                <span className="text-sm font-bold text-white/70 group-hover:text-white">Ubah Tugas</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/5 my-1" />
              <DropdownMenuItem onClick={onDelete} className="rounded-xl px-3 py-2.5 cursor-pointer focus:bg-red-500/10 text-red-400 font-bold">
                <Trash2 className="mr-3 h-4 w-4" />
                <span className="text-sm">Hapus</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
