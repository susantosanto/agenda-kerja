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
    <div className="group flex items-center gap-2 rounded-md p-2 hover:bg-muted/50">
      <Checkbox
        checked={subtask.completed}
        onCheckedChange={onToggle}
        className="h-4 w-4"
      />
      {isEditing ? (
        <div className="flex flex-1 items-center gap-2">
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            autoFocus
            className="h-8 text-sm"
          />
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span className="text-green-600">✓</span>
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => {
              setEditTitle(subtask.title)
              setIsEditing(false)
            }}
          >
            ✕
          </Button>
        </div>
      ) : (
        <>
          <span
            className={cn(
              "flex-1 text-sm",
              subtask.completed && "line-through text-muted-foreground"
            )}
          >
            {subtask.title}
          </span>
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-3 w-3" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

import { cn } from "@/lib/utils"
