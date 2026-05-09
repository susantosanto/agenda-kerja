"use client"

import { useEffect, useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"
import { 
  Bell, 
  BellOff, 
  Check, 
  CheckCheck, 
  Trash2, 
  Loader2,
  MessageSquare,
  UserPlus,
  Send,
  Settings
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useNotificationStore, AppNotification } from "@/hooks/use-notification-store"
import { NOTIFICATION_TYPES, dispatchRealtimeEvent } from "@/lib/realtime"
import { useToast } from "@/components/ui/use-toast"

const NOTIFICATION_ICONS: Record<string, string> = {
  COMMENT_ADDED: "💬",
  CHAT_MESSAGE: "💭",
  TASK_ASSIGNED: "📋",
  TASK_STATUS_CHANGED: "✏️",
}

interface NotificationCenterProps {
  className?: string
}

export function NotificationCenter({ className }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  const {
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    soundEnabled,
    desktopNotificationsEnabled,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    addNotification,
    setConnected,
  } = useNotificationStore()

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Connect to global realtime on mount
  useEffect(() => {
    let eventSource: EventSource | null = null

    const connect = async () => {
      try {
        eventSource = new EventSource("/api/realtime/global", {
          withCredentials: true
        })

        eventSource.onopen = () => {
          console.log("SSE Connected")
          setConnected(true)
        }

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            console.log("[NotificationCenter] Raw event received:", JSON.stringify(data).substring(0, 200))
            console.log("[NotificationCenter] Event type:", data.type)
            console.log("[NotificationCenter] Metadata:", data.metadata)
            
            if (data.type === "connected") {
              console.log("SSE handshake done")
              return
            }

            // Add notification to store (untuk badge count & toast)
            addNotification(data)

            // ✅ Dispatch event to local listeners (e.g. ChatBox)
            dispatchRealtimeEvent(data)

            // 🚀 AUTO-REFRESH: When comment-added, refresh comments query for all tasks
            if (data.type === "comment-added") {
              const taskId = data.metadata?.taskId || data.taskId
              console.log("[NotificationCenter] comment-added taskId:", taskId)
              console.log("[NotificationCenter] Full metadata for debug:", data.metadata)
              
              if (taskId) {
                // Invalidate specific task comments - use exact key
                queryClient.invalidateQueries({ queryKey: ["task-comments", taskId] })
                console.log("[NotificationCenter] ✅ Invalidated task-comments:", taskId)
              } else {
                console.log("[NotificationCenter] ❌ NO taskId found in event!")
              }
              // Also refresh all comments queries
              queryClient.invalidateQueries({ queryKey: ["task-comments"] })
            }
            
            // 🚀 AUTO-REFRESH: Chat Messages
            if (data.type === "chat-message") {
              queryClient.invalidateQueries({ queryKey: ["messages"] })
            }
            
            // 🚀 AUTO-REFRESH: When comment-deleted, also refresh
            if (data.type === "comment-deleted") {
              const taskId = data.metadata?.taskId
              if (taskId) {
                queryClient.invalidateQueries({ queryKey: ["task-comments", taskId] })
              }
              queryClient.invalidateQueries({ queryKey: ["task-comments"] })
            }

            // Toast sudah ditangani oleh NotificationToast di providers.tsx
            // Tidak perlu panggil toast() di sini lagi

          } catch (e) {
            console.error("Failed to parse notification:", e)
          }
        }

        eventSource.onerror = (error) => {
          console.error("SSE error:", error)
          setConnected(false)
          // Reconnect after 5 seconds
          if (eventSource) {
            eventSource.close()
            eventSource = null
          }
          setTimeout(connect, 5000)
        }
      } catch (error) {
        console.error("Failed to connect to realtime:", error)
        // Retry after 5 seconds
        setTimeout(connect, 5000)
      }
    }

    // Delay connection slightly to ensure session is ready
    const timer = setTimeout(connect, 1000)

    return () => {
      clearTimeout(timer)
      if (eventSource) {
        eventSource.close()
      }
    }
  }, [addNotification, setConnected, toast])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleNotificationClick = async (notification: AppNotification) => {
    // Mark as read
    if (!notification.isRead) {
      await markAsRead(notification.id)
    }

    // Navigate if there's a link
    if (notification.link) {
      window.location.href = notification.link
    }

    setIsOpen(false)
  }

  const getNotificationIcon = (type: string) => {
    return NOTIFICATION_ICONS[type] || "🔔"
  }

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {/* Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "relative rounded-xl hover:bg-muted/50 transition-colors",
          isOpen && "bg-muted"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : isConnected ? (
          <Bell className="h-5 w-5 text-muted-foreground" />
        ) : (
          <BellOff className="h-5 w-5 text-muted-foreground/50" />
        )}
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        
        {/* Connection Status */}
        <span 
          className={cn(
            "absolute bottom-0 right-0 h-2 w-2 rounded-full border-2 border-background",
            isConnected ? "bg-emerald-500" : "bg-muted-foreground/30"
          )} 
        />
      </Button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 w-80 rounded-xl border bg-background shadow-xl animate-in fade-in slide-in-from-top-2">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm">Notifikasi</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-500">
                  {unreadCount} baru
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[10px] text-muted-foreground hover:text-foreground"
                onClick={() => markAllAsRead()}
              >
                <CheckCheck className="mr-1 h-3 w-3" />
                Tandai dibaca
              </Button>
            )}
          </div>

          {/* Notification List */}
          <ScrollArea className="max-h-96">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="h-12 w-12 text-muted-foreground/20 mb-3" />
                <p className="text-sm text-muted-foreground">Belum ada notifikasi</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Notifikasi akan muncul di sini
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    className={cn(
                      "flex w items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 focus:bg-muted/50 focus:outline-none",
                      !notification.isRead && "bg-muted/20"
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {/* Icon */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                      <span className="text-lg">
                        {getNotificationIcon(notification.type)}
                      </span>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={cn(
                          "truncate text-sm font-medium",
                          !notification.isRead && "font-semibold"
                        )}>
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                        )}
                      </div>
                      {notification.body && (
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {notification.body}
                        </p>
                      )}
                      <p className="mt-1 text-[10px] text-muted-foreground/60">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                          locale: id,
                        })}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          <div className="border-t px-4 py-2">
            <Button
              variant="ghost"
              className="w-full justify-center text-xs text-muted-foreground"
              onClick={() => {
                window.location.href = "/dashboard/notifications"
                setIsOpen(false)
              }}
            >
              Lihat semua notifikasi
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}