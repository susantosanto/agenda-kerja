"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2 } from "lucide-react"

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

const listSchema = z.object({
  name: z.string().min(1, "Nama list wajib diisi").max(100),
  description: z.string().max(255).optional().or(z.literal("")),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Warna harus hex valid"),
})

type ListFormData = z.infer<typeof listSchema>

interface ListFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: ListFormData) => Promise<void>
  defaultValues?: Partial<ListFormData>
  isSubmitting?: boolean
}

export function ListFormModal({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  isSubmitting = false,
}: ListFormModalProps) {
  const form = useForm<ListFormData>({
    resolver: zodResolver(listSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#6366f1",
      ...defaultValues,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        name: "",
        description: "",
        color: "#6366f1",
        ...defaultValues,
      })
    }
  }, [open, defaultValues, form])

  const handleSubmit = async (data: ListFormData) => {
    await onSubmit(data)
    if (!isSubmitting) {
      form.reset()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <DialogHeader>
              <DialogTitle>
                {defaultValues?.name ? "Edit List" : "Buat List Baru"}
              </DialogTitle>
              <DialogDescription>
                {defaultValues?.name
                  ? "Perbarui detail list Anda."
                  : "Buat list baru untuk mengatur tugas Anda."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama List</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Proyek Website" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi (Opsional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Deskripsi singkat..."
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Warna</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          {...field}
                          className="h-10 w-20 cursor-pointer"
                        />
                        <Input
                          placeholder="#6366f1"
                          {...field}
                          className="flex-1"
                        />
                      </div>
                    </FormControl>
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
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {defaultValues?.name ? "Simpan Perubahan" : "Buat List"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
