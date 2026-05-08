"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, X, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
  const router = useRouter()
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

  // Optimistic create mutation
  const createTaskMutation = useMutation({
    mutationFn: async (data: TaskFormData) => {
      const payload = {
        ...data,
        startDate: data.startDate || null,
        dueDate: data.dueDate || null,
        duration: data.duration || null,
      }
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || error.message || "Gagal menyimpan task")
      }
      return res.json()
    },
    onMutate: async (data) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["all-tasks-view"] })
      await queryClient.cancelQueries({ queryKey: ["tasks"] })

      // Snapshot previous values
      const previousTasksView = queryClient.getQueryData(["all-tasks-view"])
      const previousTasks = queryClient.getQueryData(["tasks"])

      // Optimistically add new task
      const optimisticTask = {
        id: `temp-${Date.now()}`,
        title: data.title,
        description: data.description || null,
        status: data.status || "TODO",
        priority: data.priority || "P3",
        startDate: data.startDate ? new Date(data.startDate) : null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        duration: data.duration || null,
        starred: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        assignees: [],
        labels: [],
        subtasks: [],
      }

      queryClient.setQueryData(["all-tasks-view"], (old: any[]) => {
        const newData = old ? [...old] : []
        // Add at the beginning
        newData.unshift(optimisticTask)
        return newData
      })
      queryClient.setQueryData(["tasks"], (old: any[]) => {
        const newData = old ? [...old] : []
        newData.unshift(optimisticTask)
        return newData
      })

      return { previousTasksView, previousTasks }
    },
    onError: (err, data, context) => {
      // Rollback on error
      if (context?.previousTasksView) {
        queryClient.setQueryData(["all-tasks-view"], context.previousTasksView)
      }
      if (context?.previousTasks) {
        queryClient.setQueryData(["tasks"], context.previousTasks)
      }
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Gagal membuat task",
        variant: "destructive",
      })
    },
    onSuccess: (savedTask, variables, context) => {
      // Replace optimistic task with real one
      queryClient.setQueryData(["all-tasks-view"], (old: any[]) => {
        if (!old) return [savedTask]
        return old.map((t) => (t.id.startsWith("temp-") ? savedTask : t))
      })
      queryClient.setQueryData(["tasks"], (old: any[]) => {
        if (!old) return [savedTask]
        return old.map((t) => (t.id.startsWith("temp-") ? savedTask : t))
      })
      
      // Instant feedback - no delay
      onOpenChange(false)
      onSuccess?.()
    },
    onSettled: () => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["all-tasks-view"] })
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
    },
  })

  // Optimistic update mutation
  const updateTaskMutation = useMutation({
    mutationFn: async (data: TaskFormData) => {
      const payload = {
        ...data,
        startDate: data.startDate || null,
        dueDate: data.dueDate || null,
        duration: data.duration || null,
      }
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || error.message || "Gagal menyimpan task")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-tasks-view"] })
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Gagal memperbarui task",
        variant: "destructive",
      })
    },
  })

  useEffect(() => {
    if (open) {
      if (defaultValues) {
        form.reset({
          ...defaultValues,
          startDate: defaultValues.startDate || null,
          dueDate: defaultValues.dueDate || null,
          duration: defaultValues.duration || null,
        })
      } else {
        form.reset({
          title: "",
          description: "",
          priority: "P3",
          startDate: null,
          dueDate: null,
          duration: null,
          status: "TODO",
        })
      }
    }
  }, [open, defaultValues, form])

  const onSubmit = async (data: TaskFormData) => {
    if (taskId) {
      setIsSubmitting(true)
      updateTaskMutation.mutate(data, {
        onSettled: () => setIsSubmitting(false),
      })
    } else {
      // Create - use optimistic mutation
      setIsSubmitting(true)
      createTaskMutation.mutate(data, {
        onSettled: () => setIsSubmitting(false),
      })
    }
  }

  const isLoading = createTaskMutation.isPending || updateTaskMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border shadow-2xl rounded-3xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader className="border-b border-border/50 pb-4">
              <DialogTitle className="text-2xl font-black tracking-tight text-foreground">
                {taskId ? "Ubah Tugas" : "Buat Tugas Baru"}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground font-medium">
                {taskId
                  ? "Perbarui detail rencana tugas Anda."
                  : "Tambahkan tugas baru ke dalam agenda kerja."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-6">
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Judul Tugas</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Contoh: Menyusun laporan bulanan" 
                        {...field} 
                        className="h-12 bg-muted/30 border-border/50 rounded-xl focus-visible:ring-primary/20 text-base font-bold"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Deskripsi (Opsional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detail informasi tugas..."
                        {...field}
                        value={field.value || ""}
                        className="resize-none min-h-[120px] bg-muted/30 border-border/50 rounded-xl focus-visible:ring-primary/20 text-sm font-medium leading-relaxed"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Priority & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Prioritas</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 bg-muted/30 border-border/50 rounded-xl focus:ring-primary/20 font-bold">
                            <SelectValue placeholder="Pilih prioritas" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-border">
                          <SelectItem value="P1" className="font-bold text-red-500">P1 - Sangat Penting</SelectItem>
                          <SelectItem value="P2" className="font-bold text-orange-500">P2 - Penting</SelectItem>
                          <SelectItem value="P3" className="font-bold text-blue-500">P3 - Normal</SelectItem>
                          <SelectItem value="P4" className="font-bold text-slate-500">P4 - Rendah</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 bg-muted/30 border-border/50 rounded-xl focus:ring-primary/20 font-bold">
                            <SelectValue placeholder="Pilih status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-border font-bold">
                          <SelectItem value="TODO">Belum Dimulai</SelectItem>
                          <SelectItem value="IN_PROGRESS">Sedang Dikerjakan</SelectItem>
                          <SelectItem value="DONE">Selesai</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Tanggal Mulai</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="datetime-local"
                            className="h-12 bg-muted/30 border-border/50 rounded-xl focus-visible:ring-primary/20 font-bold pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-inner-spin-button]:hidden"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(e.target.value || null)
                            }
                          />
                          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/60 pointer-events-none" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Tenggat Waktu</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="datetime-local"
                            className="h-12 bg-muted/30 border-border/50 rounded-xl focus-visible:ring-primary/20 font-bold text-primary pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-inner-spin-button]:hidden"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(e.target.value || null)
                            }
                          />
                          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary pointer-events-none" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <DialogFooter className="border-t border-border/50 pt-6 gap-3 sm:gap-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="font-bold text-muted-foreground hover:bg-muted"
              >
                Batal
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90 text-white font-black px-10 rounded-xl shadow-xl shadow-primary/20 active:scale-95 transition-all h-12">
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : null}
                {taskId ? "Simpan Perubahan" : "Buat Tugas Sekarang"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
