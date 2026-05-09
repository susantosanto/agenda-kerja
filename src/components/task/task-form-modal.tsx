"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, X } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useQueryClient, useMutation } from "@tanstack/react-query"

const taskSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi").max(255),
  description: z.string().max(5000).optional().or(z.literal("")),
  priority: z.enum(["P1", "P2", "P3", "P4"]),
  startDate: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  duration: z.number().min(0).max(1440).optional().nullable(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
})

type TaskFormData = z.infer<typeof taskSchema>

interface TaskFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  taskId?: string
  defaultValues?: Partial<TaskFormData>
  onSuccess?: () => void
}

export function TaskFormModal({
  open,
  onOpenChange,
  taskId,
  defaultValues,
  onSuccess,
}: TaskFormModalProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "P3",
      startDate: null,
      dueDate: null,
      duration: null,
      status: "TODO",
      ...defaultValues,
    },
  })

  const createTaskMutation = useMutation({
    mutationFn: async (data: TaskFormData) => {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Gagal menyimpan tugas")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-tasks-view"] })
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      onOpenChange(false)
      onSuccess?.()
    }
  })

  const updateTaskMutation = useMutation({
    mutationFn: async (data: TaskFormData) => {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Gagal memperbarui tugas")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-tasks-view"] })
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      onOpenChange(false)
      onSuccess?.()
    }
  })

  useEffect(() => {
    if (open) {
      form.reset(defaultValues || {
        title: "",
        description: "",
        priority: "P3",
        startDate: null,
        dueDate: null,
        duration: null,
        status: "TODO",
      })
    }
  }, [open, defaultValues, form])

  const onSubmit = async (data: TaskFormData) => {
    setIsSubmitting(true)
    const mutation = taskId ? updateTaskMutation : createTaskMutation
    mutation.mutate(data, {
      onSettled: () => setIsSubmitting(false)
    })
  }

  const isLoading = isSubmitting || createTaskMutation.isPending || updateTaskMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl w-[95vw] sm:w-full bg-zinc-950 border border-zinc-800/50 shadow-2xl rounded-2xl p-0 overflow-hidden flex flex-col max-h-[85vh]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/30 shrink-0">
              <DialogTitle className="text-sm font-medium text-zinc-300 tracking-tight">
                {taskId ? "Ubah Tugas" : "Tugas Baru"}
              </DialogTitle>
              <button 
                type="button" 
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 flex items-center justify-center rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/50 transition-all duration-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 space-y-5 py-6 scrollbar-hide">
              {/* Judul Tugas */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-medium text-zinc-400">Judul tugas</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="contoh: Menyusun laporan bulanan" 
                        {...field} 
                        className="h-11 text-sm rounded-xl" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Detail Strategis */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-medium text-zinc-400">Detail strategis</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="deskripsi tugas..." 
                        {...field} 
                        value={field.value || ""} 
                        className="min-h-[120px] text-sm rounded-xl" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Priority & Status */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-medium text-zinc-400">Prioritas</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11 text-sm rounded-xl">
                            <SelectValue placeholder="Pilih" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-zinc-800/50 bg-zinc-900 text-white">
                          <SelectItem value="P1" className="text-sm text-red-400">P1 — Sangat Penting</SelectItem>
                          <SelectItem value="P2" className="text-sm text-orange-400">P2 — Penting</SelectItem>
                          <SelectItem value="P3" className="text-sm text-blue-400">P3 — Normal</SelectItem>
                          <SelectItem value="P4" className="text-sm text-zinc-500">P4 — Rendah</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-medium text-zinc-400">Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11 text-sm rounded-xl">
                            <SelectValue placeholder="Pilih" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-zinc-800/50 bg-zinc-900 text-white">
                          <SelectItem value="TODO" className="text-sm text-zinc-300">Belum Dimulai</SelectItem>
                          <SelectItem value="IN_PROGRESS" className="text-sm text-amber-400">Sedang Dikerjakan</SelectItem>
                          <SelectItem value="DONE" className="text-sm text-emerald-400">Selesai</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-medium text-zinc-400">Mulai</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type="date" 
                            className="h-11 text-sm rounded-xl [color-scheme:dark]" 
                            {...field} 
                            value={field.value || ""} 
                            onChange={(e) => field.onChange(e.target.value || null)} 
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-medium text-zinc-400">Selesai</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type="date" 
                            className="h-11 text-sm rounded-xl [color-scheme:dark]" 
                            {...field} 
                            value={field.value || ""} 
                            onChange={(e) => field.onChange(e.target.value || null)} 
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-800/30 shrink-0">
              <button 
                type="button" 
                onClick={() => onOpenChange(false)} 
                disabled={isLoading}
                className="px-5 py-2.5 text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors duration-200"
              >
                Batal
              </button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="h-11 px-6 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-xl border border-zinc-700/50 shadow-sm active:scale-[0.97] transition-all duration-200"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {taskId ? "Simpan" : "Buat Tugas"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
