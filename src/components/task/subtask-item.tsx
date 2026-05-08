"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"

interface SubtaskItemProps {
  subtask: {
    id: string
    title: string
    completed: boolean
  }
  onToggle: () => void
  onUpdate: (title: string) => void
  onDelete: () => void
}

export function SubtaskItem({ subtask, onToggle, onUpdate, onDelete }: SubtaskItemProps) {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(subtask.title)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!editTitle.trim()) {
      toast({
        title: "Error",
        description: "Judul subtask tidak boleh kosong",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      await onUpdate(editTitle.trim())
      setIsEditing(false)
      toast({
        title: "Berhasil",
        description: "Subtask diperbarui",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memperbarui subtask",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      setEditTitle(subtask.title)
      setIsEditing(false)
    }
  }

  return (
    <div className="group flex items-center gap-3 rounded-lg p-2 hover:bg-muted/40 transition-all duration-200">
      {/* Premium Checkbox */}
      <button
        onClick={onToggle}
        className={cn(
          "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-lg border-2 transition-all duration-300",
          subtask.completed
            ? "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/30"
            : "border-muted-foreground/30 bg-background hover:border-primary hover:scale-110"
        )}
      >
        {subtask.completed && (
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      
      {isEditing ? (
        <div className="flex flex-1 items-center gap-2">
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            autoFocus
            className="h-8 text-sm rounded-lg border-border/60 focus:border-primary focus:ring-primary/20"
          />
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 hover:bg-emerald-500/10"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span className="text-emerald-600 font-bold text-sm">✓</span>
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 hover:bg-destructive/10"
            onClick={() => {
              setEditTitle(subtask.title)
              setIsEditing(false)
            }}
          >
            <span className="text-muted-foreground font-medium text-sm">✕</span>
          </Button>
        </div>
      ) : (
        <>
          <span
            className={cn(
              "flex-1 text-sm font-medium transition-all",
              subtask.completed 
                ? "line-through text-muted-foreground/50 decoration-emerald-500/50" 
                : "text-foreground"
            )}
          >
            {subtask.title}
          </span>
          {/* Action buttons - visible on hover */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-200 -mr-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
              onClick={onDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

import { cn } from "@/lib/utils"
