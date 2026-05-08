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

interface ChatBoxProps {
  // Global chat - no community or task association
}

interface Message {
  id: string
  content: string
  createdAt: Date
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  }
}

export function ChatBox(_props: ChatBoxProps = {}) {
  const { toast } = useToast()
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMessages()
    // Polling every 5 seconds for new messages
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const fetchMessages = async (cursor?: number) => {
    try {
      const url = cursor
        ? `/api/messages?before=${cursor}&limit=50`
        : `/api/messages?limit=50`

      const res = await fetch(url)
      if (!res.ok) throw new Error("Gagal memuat pesan")

      const data = await res.json()
      if (!cursor) {
        setMessages(data.messages)
      } else {
        setMessages((prev) => [...prev, ...data.messages])
      }
      setHasMore(data.hasMore)
      setNextCursor(data.nextCursor)
    } catch (error) {
      console.error("Failed to fetch messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = () => {
    if (hasMore && nextCursor) {
      fetchMessages(nextCursor)
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    const content = newMessage.trim()
    setNewMessage("")
    setSending(true)

    // Optimistic update
    const tempId = `temp-${Date.now()}`
    const optimisticMessage: Message = {
      id: tempId,
      content,
      createdAt: new Date(),
      user: {
        id: "self",
        name: "You",
        email: "",
        image: null,
      },
    }
    setMessages((prev) => [...prev, optimisticMessage])

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Gagal mengirim pesan")
      }

      const savedMessage = await res.json()
      // Replace optimistic with real
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? savedMessage : m))
      )
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
    } finally {
      setSending(false)
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

  const handleDelete = async (messageId: string) => {
    if (deleting) return
    setDeleting(messageId)

    try {
      const res = await fetch(`/api/messages?id=${messageId}`, { method: "DELETE" })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Gagal menghapus pesan")
      }
      setMessages((prev) => prev.filter((m) => m.id !== messageId))
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setDeleting(null)
    }
  }

  const isOwnMessage = (message: Message) => {
    return message.user.id === session?.user?.id
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-background relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] pointer-events-none" />

      {/* Header - Premium Minimal */}
      <div className="border-b border-border/50 px-6 py-4 flex items-center justify-between shrink-0 bg-background/50 backdrop-blur-md relative z-10">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
          <h3 className="font-black text-xs uppercase tracking-[0.2em] text-foreground/80">Forum Diskusi</h3>
        </div>
        <span className="text-[10px] font-bold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md border border-border/50">
          {messages.length} messages
        </span>
      </div>

      {/* Messages - Premium Spacing */}
      <ScrollArea className="flex-1 px-4 relative z-10" ref={scrollRef}>
        <div className="py-6 space-y-8">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
              <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-semibold text-foreground/60">No messages yet</p>
              <p className="text-xs text-muted-foreground mt-1">Be the first to start the conversation.</p>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-4 group transition-all duration-300 animate-slide-up",
                    isOwnMessage(message) && "flex-row-reverse"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Avatar className="h-9 w-9 shrink-0 ring-2 ring-background shadow-sm">
                    <AvatarImage src={message.user.image || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary font-black text-[10px]">
                      {getInitials(message.user.name || "U")}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      "flex max-w-[80%] flex-col gap-1.5",
                      isOwnMessage(message) ? "items-end" : "items-start"
                    )}
                  >
                    <div className="flex items-center gap-2 px-1">
                      <span className="text-xs font-black text-foreground/80">
                        {isOwnMessage(message) ? "You" : message.user.name || "Anonim"}
                      </span>
                      <span className="text-[10px] font-medium text-muted-foreground/60">
                        {formatDistanceToNow(new Date(message.createdAt), {
                          addSuffix: true,
                          locale: id,
                        })}
                      </span>
                      {isOwnMessage(message) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-muted-foreground/50 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDelete(message.id)}
                          disabled={deleting === message.id}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2.5 shadow-sm text-sm border transition-all duration-300",
                        isOwnMessage(message)
                          ? "bg-primary text-primary-foreground border-primary/20 rounded-tr-none hover:shadow-primary/10"
                          : "bg-card text-card-foreground border-border/50 rounded-tl-none hover:bg-muted/30"
                      )}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} className="h-4" />
            </>
          )}
        </div>
      </ScrollArea>

      {/* Input - Premium Floating Style */}
      <div className="p-4 relative z-10">
        <form onSubmit={handleSend} className="relative group">
          <div className="absolute inset-0 bg-primary/5 rounded-[1.5rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-end gap-2 bg-card/50 backdrop-blur-xl border border-border/50 rounded-[1.5rem] p-2 pr-3 focus-within:border-primary/50 transition-all duration-300 shadow-sm focus-within:shadow-lg focus-within:shadow-primary/5">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="min-h-[44px] max-h-[200px] resize-none border-none bg-transparent focus-visible:ring-0 px-4 py-3 text-sm font-medium"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSend(e)
                }
              }}
            />
            <Button
              type="submit"
              size="icon"
              disabled={sending || !newMessage.trim()}
              className="h-10 w-10 shrink-0 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 active:scale-90 transition-all"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
