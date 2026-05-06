"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { Loader2, Plus, X } from "lucide-react"

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
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const taskSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi").max(255),
  description: z.string().max(5000).optional().or(z.literal("")),
  priority: z.enum(["P1", "P2", "P3", "P4"]),
  startDate: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  duration: z.number().min(0).max(1440).optional().nullable(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
  assigneeIds: z.array(z.string()).default([]),
  labelIds: z.array(z.string()).default([]),
})

type TaskFormData = z.infer<typeof taskSchema>

interface TaskFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  listId?: string
  taskId?: string
  defaultValues?: Partial<TaskFormData>
  onSuccess?: () => void
}

interface Assignee {
  id: string
  name: string | null
  image: string | null
}

interface Label {
  id: string
  name: string
  color: string
}

export function TaskFormModal({
  open,
  onOpenChange,
  listId,
  taskId,
  defaultValues,
  onSuccess,
}: TaskFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [assignees, setAssignees] = useState<Assignee[]>([])
  const [labels, setLabels] = useState<Label[]>([])
  const [loadingData, setLoadingData] = useState(false)
  const [assigneeOpen, setAssigneeOpen] = useState(false)
  const [labelOpen, setLabelOpen] = useState(false)

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
      assigneeIds: [],
      labelIds: [],
      ...defaultValues,
    },
  })

  useEffect(() => {
    if (open) {
      fetchAssignees()
      fetchLabels()
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
          assigneeIds: [],
          labelIds: [],
        })
      }
    }
  }, [open, defaultValues, form])

  const fetchAssignees = async () => {
    setLoadingData(true)
    try {
      const res = await fetch("/api/members")
      if (!res.ok) throw new Error("Gagal fetch members")
      const data = await res.json()
      setAssignees(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingData(false)
    }
  }

  const fetchLabels = async () => {
    try {
      const res = await fetch("/api/labels")
      if (!res.ok) throw new Error("Gagal fetch labels")
      const data = await res.json()
      setLabels(data)
    } catch (error) {
      console.error(error)
    }
  }

  const onSubmit = async (data: TaskFormData) => {
    setIsSubmitting(true)
    try {
      const payload = {
        ...data,
        listId,
        startDate: data.startDate || null,
        dueDate: data.dueDate || null,
        duration: data.duration || null,
      }

      const url = taskId ? `/api/tasks/${taskId}` : "/api/tasks"
      const method = taskId ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Gagal menyimpan task")
      }

      toast({
        title: "Berhasil",
        description: taskId ? "Task diperbarui" : "Task dibuat",
      })

      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>
                {taskId ? "Edit Task" : "Buat Task Baru"}
              </DialogTitle>
              <DialogDescription>
                {taskId
                  ? "Perbarui detail task Anda."
                  : "Buat task baru dan tambahkan ke list."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Judul Task</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Buat landing page" {...field} />
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
                    <FormLabel>Deskripsi (Opsional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Deskripsi detail task..."
                        {...field}
                        value={field.value || ""}
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
                    <FormItem>
                      <FormLabel>Prioritas</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih prioritas" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="P1">P1 - Tinggi</SelectItem>
                          <SelectItem value="P2">P2 - Sedang</SelectItem>
                          <SelectItem value="P3">P3 - Rendah</SelectItem>
                          <SelectItem value="P4">P4 - Minimal</SelectItem>
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
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="TODO">To Do</SelectItem>
                          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                          <SelectItem value="DONE">Done</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Dates & Duration */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tanggal Mulai</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(e.target.value || null)
                          }
                        />
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
                      <FormLabel>Tanggal Jatuh Tempo</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(e.target.value || null)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Duration */}
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durasi (menit, opsional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="60"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Estimasi waktu diperlukan (dalam menit)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Assignees */}
              <FormField
                control={form.control}
                name="assigneeIds"
                render={() => (
                  <FormItem>
                    <FormLabel>Assignee (Opsional)</FormLabel>
                    <Popover open={assigneeOpen} onOpenChange={setAssigneeOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between"
                          >
                            {form.watch("assigneeIds").length > 0
                              ? `${form.watch("assigneeIds").length} dipilih`
                              : "Pilih assignee..."}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Cari member..." />
                          <CommandList>
                            <CommandEmpty>Tidak ada member.</CommandEmpty>
                            <CommandGroup>
                              {assignees.map((assignee) => (
                                <CommandItem
                                  key={assignee.id}
                                  onSelect={() => {
                                    const current = form.getValues("assigneeIds")
                                    const newSelection = current.includes(assignee.id)
                                      ? current.filter((id) => id !== assignee.id)
                                      : [...current, assignee.id]
                                    form.setValue("assigneeIds", newSelection)
                                  }}
                                >
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage src={assignee.image || ""} />
                                      <AvatarFallback className="text-xs">
                                        {getInitials(assignee.name || "U")}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span>{assignee.name}</span>
                                  </div>
                                  {form.watch("assigneeIds").includes(assignee.id) && (
                                    <Badge variant="secondary">✓</Badge>
                                  )}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {form.watch("assigneeIds").map((id) => {
                        const assignee = assignees.find((a) => a.id === id)
                        return assignee ? (
                          <Badge
                            key={id}
                            variant="secondary"
                            className="gap-1 cursor-pointer"
                            onClick={() => {
                              const current = form.getValues("assigneeIds")
                              form.setValue(
                                "assigneeIds",
                                current.filter((aid) => aid !== id)
                              )
                            }}
                          >
                            {assignee.name}
                            <X className="h-3 w-3" />
                          </Badge>
                        ) : null
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Labels */}
              <FormField
                control={form.control}
                name="labelIds"
                render={() => (
                  <FormItem>
                    <FormLabel>Labels (Opsional)</FormLabel>
                    <Popover open={labelOpen} onOpenChange={setLabelOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between"
                          >
                            {form.watch("labelIds").length > 0
                              ? `${form.watch("labelIds").length} dipilih`
                              : "Pilih label..."}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Cari label..." />
                          <CommandList>
                            <CommandEmpty>Tidak ada label.</CommandEmpty>
                            <CommandGroup>
                              {labels.map((label) => (
                                <CommandItem
                                  key={label.id}
                                  onSelect={() => {
                                    const current = form.getValues("labelIds")
                                    const newSelection = current.includes(label.id)
                                      ? current.filter((lid) => lid !== label.id)
                                      : [...current, label.id]
                                    form.setValue("labelIds", newSelection)
                                  }}
                                >
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="h-3 w-3 rounded-full"
                                      style={{ backgroundColor: label.color }}
                                    />
                                    <span>{label.name}</span>
                                  </div>
                                  {form.watch("labelIds").includes(label.id) && (
                                    <Badge variant="secondary">✓</Badge>
                                  )}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {form.watch("labelIds").map((id) => {
                        const label = labels.find((l) => l.id === id)
                        return label ? (
                          <Badge
                            key={id}
                            variant="outline"
                            className="gap-1 cursor-pointer"
                            style={{ borderColor: label.color, color: label.color }}
                            onClick={() => {
                              const current = form.getValues("labelIds")
                              form.setValue(
                                "labelIds",
                                current.filter((lid) => lid !== id)
                              )
                            }}
                          >
                            {label.name}
                            <X className="h-3 w-3" />
                          </Badge>
                        ) : null
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {taskId ? "Simpan Perubahan" : "Buat Task"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
