"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"

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
      <DialogContent className="max-w-2xl w-[95vw] sm:w-full bg-black border-zinc-800/30 shadow-2xl rounded-[2.5rem] p-0 overflow-hidden flex flex-col max-h-[90vh]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full overflow-hidden">
            <DialogHeader className="px-8 pt-8 pb-6 bg-white/[0.01] shrink-0 border-b border-zinc-800/20">
              <DialogTitle className="text-3xl font-black tracking-tighter text-white">
                {taskId ? "Ubah Tugas" : "Buat Tugas Baru"}
              </DialogTitle>
              <DialogDescription className="text-white/20 font-bold uppercase tracking-widest text-[9px] mt-2">
                {taskId ? "Sinkronisasi alur kerja premium" : "Inisialisasi tugas baru"}
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-8 space-y-8 py-8 scrollbar-hide">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10 ml-2">Judul Tugas</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Menyusun laporan bulanan" {...field} className="h-14 text-base font-black tracking-tight" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10 ml-2">Detail Strategis</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Detail informasi tugas..." {...field} value={field.value || ""} className="min-h-[160px]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10 ml-2">Tingkat Prioritas</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-14 font-black">
                            <SelectValue placeholder="Pilih" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-[1.5rem] border-zinc-800/50 bg-zinc-950 text-white">
                          <SelectItem value="P1" className="font-bold text-red-500">P1 - Sangat Penting</SelectItem>
                          <SelectItem value="P2" className="font-bold text-orange-500">P2 - Penting</SelectItem>
                          <SelectItem value="P3" className="font-bold text-blue-500">P3 - Normal</SelectItem>
                          <SelectItem value="P4" className="font-bold text-zinc-500">P4 - Rendah</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10 ml-2">Status Tugas</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-14 font-black">
                            <SelectValue placeholder="Pilih" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-[1.5rem] border-zinc-800/50 bg-zinc-950 text-white">
                          <SelectItem value="TODO" className="font-bold">Belum Dimulai</SelectItem>
                          <SelectItem value="IN_PROGRESS" className="font-bold text-amber-500">Sedang Dikerjakan</SelectItem>
                          <SelectItem value="DONE" className="font-bold text-emerald-500">Selesai</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pb-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10 ml-2">Waktu Dimulai</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type="datetime-local" className="h-14 font-black pr-12" {...field} value={field.value || ""} onChange={(e) => field.onChange(e.target.value || null)} />
                          <Calendar className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/10 pointer-events-none" />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10 ml-2">Tenggat Akhir</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type="datetime-local" className="h-14 font-black pr-12 text-red-500" {...field} value={field.value || ""} onChange={(e) => field.onChange(e.target.value || null)} />
                          <Calendar className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500/20 pointer-events-none" />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="px-8 pb-10 pt-4 bg-white/[0.01] shrink-0 flex flex-col items-center gap-6 border-t border-zinc-800/20">
              <div className="flex flex-col-reverse sm:flex-row items-center justify-center gap-6 w-full max-w-md mx-auto">
                <button type="button" onClick={() => onOpenChange(false)} disabled={isLoading} className="w-full sm:w-auto px-8 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 hover:text-white transition-all duration-300">
                  Batalkan
                </button>
                
                <Button type="submit" disabled={isLoading} className="w-full sm:w-64 h-14 bg-zinc-800 text-white font-black rounded-full border-t border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] hover:bg-zinc-700 active:scale-95 transition-all duration-500">
                  {isLoading ? <Loader2 className="mr-3 h-5 w-5 animate-spin" /> : null}
                  {taskId ? "SIMPAN PERUBAHAN" : "INISIALISASI TUGAS"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
