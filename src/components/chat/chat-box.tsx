"use client"

import { useEffect, useRef, useState } from "react"
import { format, formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"
import { Send, Loader2, MessageSquare, Trash2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { ClipboardImage } from "@/components/ui/clipboard-image"
import { addEventListener, removeEventListener, RealtimeEvent } from "@/lib/realtime"

interface Message {
  id: string
  content: string
  imageUrl?: string | null
  createdAt: Date
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  }
}

interface ImageAttachment {
  id: string
  url: string
  preview: string
}

export function ChatBox() {
  const { toast } = useToast()
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [attachedImages, setAttachedImages] = useState<ImageAttachment[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMessages()
    
    const handleNewMessage = (event: RealtimeEvent) => {
      if (event.type === "chat-message" && event.metadata?.message) {
        const msg = event.metadata.message as Message
        if (msg.user.id === session?.user?.id) return
        setMessages((prev) => prev.some(m => m.id === msg.id) ? prev : [...prev, msg])
      }
    }

    const handleDeleteMessage = (event: RealtimeEvent) => {
      if (event.type === "chat-message-deleted" && event.metadata?.messageId) {
        const deletedId = event.metadata.messageId as string
        setMessages((prev) => prev.filter(m => m.id !== deletedId))
      }
    }

    addEventListener("chat-message", handleNewMessage)
    addEventListener("chat-message-deleted", handleDeleteMessage)
    
    return () => {
      removeEventListener("chat-message", handleNewMessage)
      removeEventListener("chat-message-deleted", handleDeleteMessage)
    }
  }, [session?.user?.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/messages?limit=50")
      if (!res.ok) throw new Error()
      const data = await res.json()
      setMessages(data.messages)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!newMessage.trim() && attachedImages.length === 0) || sending) return

    const content = newMessage.trim()
    const imageUrl = attachedImages.length > 0 ? attachedImages[0].url : null
    setNewMessage("")
    setAttachedImages([])
    setSending(true)

    const tempId = `temp-${Date.now()}`
    const optimisticMessage: Message = {
      id: tempId,
      content,
      imageUrl,
      createdAt: new Date(),
      user: { id: session?.user?.id || "self", name: "Anda", email: "", image: session?.user?.image || null },
    }
    setMessages((prev) => [...prev, optimisticMessage])

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, imageUrl }),
      })
      if (!res.ok) throw new Error()
      const saved = await res.json()
      setMessages((prev) => prev.map((m) => (m.id === tempId ? saved : m)))
    } catch (error) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
      toast({ title: "Error", description: "Gagal mengirim pesan", variant: "destructive" })
    } finally {
      setSending(false)
    }
  }

  const handleDelete = async (messageId: string) => {
    if (deleting) return
    setDeleting(messageId)
    try {
      const res = await fetch(`/api/messages?id=${messageId}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setMessages((prev) => prev.filter((m) => m.id !== messageId))
    } catch (error) {
      toast({ title: "Error", description: "Gagal menghapus pesan", variant: "destructive" })
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
  }

  return (
    <div className="flex h-full flex-col bg-black relative overflow-hidden">
      <div className="border-b border-zinc-800/30 px-6 py-4 flex items-center justify-between shrink-0 bg-black/40 backdrop-blur-xl z-10">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
          <h3 className="font-black text-xs uppercase tracking-[0.2em] text-white/80">Forum Diskusi</h3>
        </div>
      </div>

      <ScrollArea className="flex-1 px-6 z-10">
        <div className="py-8 space-y-8">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <MessageSquare className="h-12 w-12 text-white/5 mb-4" />
              <p className="text-sm font-bold text-white/20 uppercase tracking-widest">Belum ada percakapan</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={cn("flex gap-4 group transition-all", message.user.id === session?.user?.id && "flex-row-reverse")}>
                <Avatar className="h-9 w-9 shrink-0 border border-white/5">
                  <AvatarImage src={message.user.image || ""} />
                  <AvatarFallback className="bg-zinc-900 text-white font-black text-[10px]">{message.user.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div className={cn("flex max-w-[80%] flex-col gap-1.5", message.user.id === session?.user?.id ? "items-end" : "items-start")}>
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-wider">{message.user.id === session?.user?.id ? "Anda" : message.user.name}</span>
                    {message.user.id === session?.user?.id && (
                      <button onClick={() => handleDelete(message.id)} className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-500 transition-all"><Trash2 className="h-3 w-3" /></button>
                    )}
                  </div>
                  <div className={cn("rounded-[1.5rem] px-5 py-3 text-sm transition-all shadow-2xl", message.user.id === session?.user?.id ? "bg-zinc-800 text-white rounded-tr-none border-t border-white/5" : "bg-white/[0.02] text-white rounded-tl-none border border-white/[0.01]")}>
                    {message.imageUrl && <img src={message.imageUrl} alt="Attachment" className="mb-3 max-w-full rounded-2xl border border-white/5" />}
                    <p className="leading-relaxed break-words">{message.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} className="h-4" />
        </div>
      </ScrollArea>

      <div className="p-6 shrink-0 z-10 bg-black/20 backdrop-blur-md border-t border-zinc-800/30">
        <ClipboardImage onImagesChange={setAttachedImages} disabled={sending} className="mb-4" />
        <form onSubmit={handleSend} className="relative group max-w-4xl mx-auto">
          <div className="relative flex items-end gap-3 bg-[#0a0a0b] rounded-[2rem] p-3 pl-5 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8),0_1px_1px_rgba(255,255,255,0.02)] focus-within:shadow-[inset_0_2px_15px_rgba(0,0,0,1),0_1px_2px_rgba(255,255,255,0.04)] transition-all duration-500">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Ketik pesan premium..."
              className="min-h-[48px] max-h-[200px] resize-none border-none bg-transparent focus-visible:ring-0 px-4 py-4 text-sm font-medium text-white/80 placeholder:text-white/5"
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
            />
            <Button type="submit" size="icon" disabled={sending || (!newMessage.trim() && attachedImages.length === 0)} className="h-11 w-11 shrink-0 rounded-full bg-white text-black hover:bg-zinc-200 transition-all mb-1">
              {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </div>
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/10 mt-4 text-center">Ctrl+V untuk menempel tangkapan layar</p>
        </form>
      </div>
    </div>
  )
}
