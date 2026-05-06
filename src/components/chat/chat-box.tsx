"use client"

import { useEffect, useRef, useState } from "react"
import { format, formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"
import { Send, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

interface ChatBoxProps {
  communityId: string
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

export function ChatBox({ communityId }: ChatBoxProps) {
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMessages()
    // Polling every 5 seconds for new messages
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [communityId])

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const fetchMessages = async (cursor?: number) => {
    try {
      const url = cursor
        ? `/api/communities/${communityId}/messages?before=${cursor}&limit=50`
        : `/api/communities/${communityId}/messages?limit=50`

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
      const res = await fetch(`/api/communities/${communityId}/messages`, {
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

      toast({
        title: "Berhasil",
        description: "Pesan terkirim",
      })
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

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex h-96 flex-col rounded-lg border bg-card">
      {/* Header */}
      <div className="border-b px-4 py-3">
        <h3 className="font-semibold">Chat Komunitas</h3>
        <p className="text-xs text-muted-foreground">
          Percakapan umum untuk semua anggota
        </p>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center text-muted-foreground">
            <p>Belum ada pesan. Mulai percakapan!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.user.id === "self" && "flex-row-reverse"
                )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={message.user.image || ""} />
                  <AvatarFallback className="text-xs">
                    {getInitials(message.user.name || "U")}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    "flex max-w-[70%] flex-col gap-1 rounded-lg px-3 py-2",
                    message.user.id === "self"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">
                      {message.user.name || "Anonim"}
                    </span>
                    <span className="text-xs opacity-70">
                      {formatDistanceToNow(new Date(message.createdAt), {
                        addSuffix: true,
                        locale: id,
                      })}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      {/* Load More */}
      {hasMore && (
        <div className="border-t p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={loadMore}
            className="w-full text-xs"
          >
            Muat pesan lama
          </Button>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSend} className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ketik pesan..."
            className="min-h-[60px] max-h-[120px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                handleSend(e)
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            disabled={sending || !newMessage.trim()}
            className="h-[60px] w-[60px]"
          >
            {sending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
