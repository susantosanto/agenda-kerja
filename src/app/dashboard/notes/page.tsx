"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { SlackLayout } from "@/components/layout/slack-layout"
import { Sidebar } from "@/components/layout/sidebar"
import { 
  Loader2, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Trash2, 
  Pin, 
  PinOff,
  StickyNote,
  Clock,
  ArrowLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"
import { cn } from "@/lib/utils"

async function fetchNotes() {
  const res = await fetch("/api/notes")
  if (!res.ok) throw new Error("Gagal memuat catatan")
  return res.json()
}



export default function NotesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<any>(null)
  const [noteTitle, setNoteTitle] = useState("")
  const [noteContent, setNoteContent] = useState("")

  

  const { data: notes, isLoading, refetch } = useQuery({
    queryKey: ["notes"],
    queryFn: fetchNotes,
    enabled: !!session,
  })

  const createMutation = useMutation({
    mutationFn: async (newNote: any) => {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNote),
      })
      if (!res.ok) throw new Error("Gagal membuat catatan")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] })
      setIsModalOpen(false)
      resetForm()
      toast({ title: "Berhasil", description: "Catatan baru telah disimpan" })
    }
  })

  const updateMutation = useMutation({
    mutationFn: async (updatedNote: any) => {
      const res = await fetch(`/api/notes/${updatedNote.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedNote),
      })
      if (!res.ok) throw new Error("Gagal memperbarui catatan")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] })
      setIsModalOpen(false)
      resetForm()
      toast({ title: "Berhasil", description: "Catatan telah diperbarui" })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Gagal menghapus catatan")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] })
      toast({ title: "Berhasil", description: "Catatan telah dihapus" })
    }
  })

  const togglePinMutation = useMutation({
    mutationFn: async ({ id, isPinned }: { id: string; isPinned: boolean }) => {
      const res = await fetch(`/api/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: !isPinned }),
      })
      if (!res.ok) throw new Error("Gagal mengubah status pin")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] })
    }
  })

  const resetForm = () => {
    setEditingNote(null)
    setNoteTitle("")
    setNoteContent("")
  }

  const handleOpenCreate = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const handleOpenEdit = (note: any) => {
    setEditingNote(note)
    setNoteTitle(note.title)
    setNoteContent(note.content)
    setIsModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!noteTitle.trim() || !noteContent.trim()) return

    if (editingNote) {
      updateMutation.mutate({ id: editingNote.id, title: noteTitle, content: noteContent })
    } else {
      createMutation.mutate({ title: noteTitle, content: noteContent })
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium animate-pulse tracking-widest uppercase text-[10px]">Menyiapkan Arsip Catatan...</p>
      </div>
    )
  }

  if (status === "unauthenticated") {
    router.push("/signin")
    return null
  }

  const filteredNotes = notes?.filter((n: any) => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const pinnedNotes = filteredNotes.filter((n: any) => n.isPinned)
  const regularNotes = filteredNotes.filter((n: any) => !n.isPinned)

  return (
    <SlackLayout 
      sidebar={<Sidebar />}
    >
      <div className="flex flex-col h-full bg-background overflow-hidden relative">
        {/* Abstract background light effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/5 blur-[120px] pointer-events-none z-0" />
        
        <main className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 relative z-10">
          
          {/* PREMIUM HEADER */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(124,58,237,0.4)]" />
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Vault Intelligence</span>
              </div>
              <h1 className="text-5xl font-black tracking-tighter text-foreground leading-none">
                Catatan <span className="text-primary">Eksklusif</span>
              </h1>
              <p className="text-muted-foreground mt-4 text-lg font-medium tracking-tight">
                Simpan ide, instruksi, dan dokumentasi penting secara aman.
              </p>
            </div>

            <div className="flex items-center gap-3">
               <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    placeholder="Cari catatan..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full md:w-[300px] h-11 bg-muted/30 border-border/50 rounded-xl focus-visible:ring-primary/20"
                  />
               </div>
               <Button onClick={handleOpenCreate} className="h-11 px-6 bg-primary text-primary-foreground font-black rounded-xl shadow-xl shadow-primary/20 active:scale-95 transition-all">
                  <Plus className="mr-2 h-5 w-5" />
                  Baru
               </Button>
            </div>
          </div>

          <div className="h-px bg-border/50 w-full" />

          {/* GRID LAYOUT FOR NOTES */}
          <div className="space-y-10 pb-20">
            {/* PINNED SECTION */}
            {pinnedNotes.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-[0.2em]">
                  <Pin className="h-3 w-3" />
                  Sangat Penting
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pinnedNotes.map((note: any) => (
                    <NoteCard 
                      key={note.id} 
                      note={note} 
                      onEdit={() => handleOpenEdit(note)} 
                      onDelete={() => deleteMutation.mutate(note.id)}
                      onTogglePin={() => togglePinMutation.mutate({ id: note.id, isPinned: note.isPinned })}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ALL NOTES SECTION */}
            <div className="space-y-4">
               <div className="flex items-center gap-2 text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">
                  <StickyNote className="h-3 w-3" />
                  Semua Catatan
                </div>
              {filteredNotes.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-border/50 p-20 text-center bg-muted/5">
                   <div className="h-20 w-20 rounded-3xl bg-muted/20 flex items-center justify-center mb-6">
                      <StickyNote className="h-10 w-10 text-muted-foreground/30" />
                   </div>
                   <h3 className="text-xl font-bold">Belum ada catatan</h3>
                   <p className="text-muted-foreground mt-2 max-w-xs">Mulai dokumentasikan rencana kerja Anda sekarang untuk efisiensi maksimal.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularNotes.map((note: any) => (
                    <NoteCard 
                      key={note.id} 
                      note={note} 
                      onEdit={() => handleOpenEdit(note)} 
                      onDelete={() => deleteMutation.mutate(note.id)}
                      onTogglePin={() => togglePinMutation.mutate({ id: note.id, isPinned: note.isPinned })}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* CREATE/EDIT MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl bg-card border-border shadow-2xl rounded-3xl p-0 overflow-hidden">
          <form onSubmit={handleSubmit}>
            <DialogHeader className="p-8 pb-4 border-b border-border/50">
              <DialogTitle className="text-2xl font-black tracking-tight">
                {editingNote ? "Perbarui Catatan" : "Catatan Baru"}
              </DialogTitle>
            </DialogHeader>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Judul Catatan</label>
                <Input 
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Misal: Prosedur Operasional Standar v1"
                  className="h-14 bg-muted/30 border-border/50 rounded-2xl text-lg font-bold focus-visible:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Konten / Isi</label>
                <Textarea 
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Ketik detail catatan Anda di sini..."
                  className="min-h-[300px] bg-muted/30 border-border/50 rounded-2xl text-base leading-relaxed focus-visible:ring-primary/20 p-6"
                />
              </div>
            </div>
            <DialogFooter className="p-8 pt-0 border-t border-border/50 flex justify-between items-center bg-muted/5">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="font-bold text-muted-foreground">Batal</Button>
              <Button type="submit" className="h-12 px-10 bg-primary text-primary-foreground font-black rounded-xl shadow-xl shadow-primary/20">
                {editingNote ? "Simpan Perubahan" : "Simpan Catatan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </SlackLayout>
  )
}

function NoteCard({ note, onEdit, onDelete, onTogglePin }: any) {
  return (
    <Card className="group bg-card/40 backdrop-blur-sm border-border/50 rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/30 transition-all duration-500 relative">
      <CardContent className="p-7 space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                <StickyNote className="h-5 w-5" />
             </div>
             <div>
                <h3 className="font-bold text-lg leading-tight line-clamp-1">{note.title}</h3>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-wider">
                   <Clock className="h-3 w-3" />
                   {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true, locale: id })}
                </div>
             </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border-border w-40 p-1.5">
              <DropdownMenuItem onClick={onEdit} className="rounded-lg font-medium cursor-pointer">Ubah Detail</DropdownMenuItem>
              <DropdownMenuItem onClick={onTogglePin} className="rounded-lg font-medium cursor-pointer">
                {note.isPinned ? "Lepas Pin" : "Sematkan Catatan"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="rounded-lg font-bold text-destructive focus:bg-destructive/10 cursor-pointer">Hapus</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-4 h-[80px]">
          {note.content}
        </p>

        <div className="pt-2 flex items-center justify-between border-t border-border/20">
           <button onClick={onEdit} className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
              Buka Selengkapnya
           </button>
           {note.isPinned && (
             <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <Pin className="h-3.5 w-3.5 fill-current" />
             </div>
           )}
        </div>
      </CardContent>
    </Card>
  )
}
