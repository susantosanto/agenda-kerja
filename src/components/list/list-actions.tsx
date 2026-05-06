"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MoreHorizontal, Edit, Pin, Archive, Trash2, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { ListFormModal } from "./list-form-modal"

interface ListActionsProps {
  list: {
    id: string
    name: string
    description: string | null
    color: string
    order: number
    archived: boolean
    pinned: boolean
    createdAt: Date
    updatedAt: Date
  }
  onAction: () => void
}

export function ListActions({ list, onAction }: ListActionsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleEdit = async (data: {
    name: string
    description?: string
    color: string
  }) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/lists/${list.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Gagal memperbarui list")
      }

      toast({
        title: "Berhasil",
        description: "List berhasil diperbarui",
      })
      setEditOpen(false)
      onAction()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/lists/${list.id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Gagal menghapus list")
      }

      toast({
        title: "Berhasil",
        description: "List berhasil dihapus",
      })
      setDeleteOpen(false)
      onAction()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleArchive = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/lists/${list.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: !list.archived }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Gagal mengubah status archive")
      }

      toast({
        title: "Berhasil",
        description: list.archived ? "List di-unarchive" : "List di-archive",
      })
      onAction()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTogglePin = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/lists/${list.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned: !list.pinned }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Gagal mengubah status pin")
      }

      toast({
        title: "Berhasil",
        description: list.pinned ? "List di-unpin" : "List di-pin",
      })
      onAction()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)} className="gap-2">
            <Edit className="h-4 w-4" />
            Edit List
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleTogglePin} className="gap-2">
            <Pin className="h-4 w-4" />
            {list.pinned ? "Unpin" : "Pin"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleArchive} className="gap-2">
            <Archive className="h-4 w-4" />
            {list.archived ? "Unarchive" : "Archive"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className="gap-2 text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Hapus List
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Modal */}
      <ListFormModal
        open={editOpen}
        onOpenChange={setEditOpen}
        onSubmit={handleEdit}
        defaultValues={{
          name: list.name,
          description: list.description || "",
          color: list.color,
        }}
        isSubmitting={isLoading}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus List?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. List &quot;{list.name}&quot; akan
              dihapus permanen beserta semua tugas di dalamnya.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
