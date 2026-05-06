"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { CommunitySelector } from "@/components/layout/community-selector"
import { CommunityHeader } from "@/components/community/community-header"
import { CommunityMembers } from "@/components/community/community-members"
import { ListCard } from "@/components/list/list-card"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { id } from "date-fns/locale"

const listSchema = z.object({
  name: z.string().min(1, "Nama list wajib diisi").max(100),
  description: z.string().max(255).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Warna harus hex valid"),
})

type ListFormData = z.infer<typeof listSchema>

interface Community {
  id: string
  name: string
  description: string | null
  inviteCode: string
  ownerId: string
  createdAt: Date
  updatedAt: Date
}

interface Member {
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  }
  role: "OWNER" | "ADMIN" | "MEMBER"
}

interface List {
  id: string
  name: string
  description: string | null
  color: string
  order: number
  archived: boolean
  pinned: boolean
  createdAt: Date
  updatedAt: Date
  _count: {
    tasks: number
  }
}

export default function CommunityDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()

  const communityId = params.communityId as string

  const [community, setCommunity] = useState<Community | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [lists, setLists] = useState<List[]>([])
  const [loading, setLoading] = useState(true)
  const [createListOpen, setCreateListOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ListFormData>({
    resolver: zodResolver(listSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#6366f1",
    },
  })

  useEffect(() => {
    fetchCommunity()
    fetchMembers()
    fetchLists()
  }, [communityId])

  const fetchCommunity = async () => {
    try {
      const res = await fetch(`/api/communities/${communityId}`)
      if (!res.ok) throw new Error("Gagal memuat community")
      const data = await res.json()
      setCommunity(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat data community",
        variant: "destructive",
      })
    }
  }

  const fetchMembers = async () => {
    try {
      const res = await fetch(`/api/communities/${communityId}/members`)
      if (!res.ok) throw new Error("Gagal memuat members")
      const data = await res.json()
      setMembers(data)
    } catch (error) {
      console.error(error)
    }
  }

  const fetchLists = async () => {
    try {
      const res = await fetch(`/api/lists?communityId=${communityId}`)
      if (!res.ok) throw new Error("Gagal memuat lists")
      const data = await res.json()
      setLists(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat lists",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: ListFormData) => {
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          communityId,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Gagal membuat list")
      }

      toast({
        title: "Berhasil",
        description: "List berhasil dibuat",
      })

      setCreateListOpen(false)
      reset()
      fetchLists()
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!community) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Community tidak ditemukan</p>
      </div>
    )
  }

  const isOwner = community.ownerId === session?.user?.id

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:pl-72">
          <div className="mx-auto max-w-6xl space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <button
                onClick={() => router.push("/dashboard")}
                className="hover:text-foreground"
              >
                Dashboard
              </button>
              <span>/</span>
              <span className="text-foreground">{community.name}</span>
            </div>

            {/* Community Header */}
            <CommunityHeader community={community} isOwner={isOwner} />

            {/* Members & Create List */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Members Section */}
              <div className="lg:col-span-1">
                <CommunityMembers members={members} />
              </div>

              {/* Create List Button */}
              <div className="lg:col-span-2">
                <Button onClick={() => setCreateListOpen(true)} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Buat List Baru
                </Button>
              </div>
            </div>

            {/* Lists Grid */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight">Lists</h2>
              {lists.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
                  <p className="text-muted-foreground">
                    Belum ada list. Buat list pertama Anda!
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {lists.map((list) => (
                    <ListCard key={list.id} list={list} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <MobileNav />
      <Dialog open={createListOpen} onOpenChange={setCreateListOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Buat List Baru</DialogTitle>
              <DialogDescription>
                Buat list baru untuk mengatur tugas Anda.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama List</Label>
                <Input
                  id="name"
                  placeholder="Contoh: Proyek Website"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi (Opsional)</Label>
                <Textarea
                  id="description"
                  placeholder="Deskripsi singkat..."
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Warna</Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    type="color"
                    {...register("color")}
                    className="h-10 w-20"
                  />
                  <Input
                    {...register("color")}
                    placeholder="#6366f1"
                    className="flex-1"
                  />
                </div>
                {errors.color && (
                  <p className="text-sm text-destructive">{errors.color.message}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateListOpen(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Buat List
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
