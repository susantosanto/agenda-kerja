"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useNotificationStore, AppNotification } from "@/hooks/use-notification-store"
import { NOTIFICATION_TYPES, SOUND_PRESETS, playNotificationSound, showBrowserNotification } from "@/lib/realtime"

interface NotificationToastProps {
  position?: "top-right" | "bottom-right" | "top-left" | "bottom-left"
  maxVisible?: number
 }

export function NotificationToast({
  position = "bottom-right",
  maxVisible = 3,
}: NotificationToastProps) {
  const [visibleToasts, setVisibleToasts] = useState<AppNotification[]>([])
  const { notifications, soundEnabled, desktopNotificationsEnabled, markAsRead } = useNotificationStore()
  // Track which notifications we've already processed sound for
  const [playedSoundForIds, setPlayedSoundForIds] = useState<Set<string>>(new Set())
  // Track initialization - don't play sound on initial mount for existing notifications
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize: populate playedSoundForIds with existing unread notifications
  // to prevent playing sound for notifications that were already shown
  useEffect(() => {
    if (!isInitialized && notifications.length > 0) {
      const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id)
      setPlayedSoundForIds(new Set(unreadIds))
      setIsInitialized(true)
    }
  }, [notifications, isInitialized])

  // Show toasts when new notifications arrive (only for NEW notifications after init)
  useEffect(() => {
    // Skip if not initialized yet or no notifications
    if (!isInitialized || notifications.length === 0) return

    // Get the newest unread notification
    const latestUnread = notifications.find(n => !n.isRead)
    if (!latestUnread) return

    // Skip if already shown as toast
    const alreadyVisible = visibleToasts.some(t => t.id === latestUnread.id)
    if (alreadyVisible) return

    // Skip if already played sound for this notification
    if (playedSoundForIds.has(latestUnread.id)) return

    // Add to visible toasts (limit to maxVisible)
    setVisibleToasts((prev) => {
      const newToasts = [latestUnread, ...prev].slice(0, maxVisible)
      return newToasts
    })

    // Play sound dan skip if already played for this ID
    if (soundEnabled && !playedSoundForIds.has(latestUnread.id)) {
      const soundType = latestUnread.type === "CHAT_MESSAGE" ? "chat" : "comment"
      playNotificationSound(soundType)
      setPlayedSoundForIds(prev => new Set([...prev, latestUnread.id]))
    }

    // Show desktop notification
    if (desktopNotificationsEnabled) {
      showBrowserNotification(
        latestUnread.title,
        latestUnread.body,
        latestUnread.link
      )
    }

    // Auto remove after 5 seconds
    const timer = setTimeout(() => {
      setVisibleToasts((prev) => prev.filter((n) => n.id !== latestUnread.id))
    }, 5000)

    return () => clearTimeout(timer)
  }, [notifications, visibleToasts, playedSoundForIds, isInitialized, maxVisible, soundEnabled, desktopNotificationsEnabled])

  const removeToast = (id: string) => {
    setVisibleToasts((prev) => prev.filter((n) => n.id !== id))
  }

  const handleToastClick = async (notification: AppNotification) => {
    // Mark as read immediately to prevent re-triggering sound on page reload
    await markAsRead(notification.id)
    
    if (notification.link) {
      window.location.href = notification.link
    }
    removeToast(notification.id)
  }

  const positionClasses = {
    "top-right": "top-4 right-4",
    "bottom-right": "bottom-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-left": "bottom-4 left-4",
  }

  if (visibleToasts.length === 0) return null

  return (
    <div
      className={cn(
        "fixed z-[9999] flex flex-col-reverse gap-2 p-4",
        positionClasses[position]
      )}
      style={{ pointerEvents: "none" }}
    >
      <AnimatePresence>
        {visibleToasts.map((toast, index) => {
          const typeConfig = NOTIFICATION_TYPES[toast.type as keyof typeof NOTIFICATION_TYPES]
          
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="pointer-events-auto w-72 rounded-xl border bg-background/95 backdrop-blur-sm shadow-lg"
              style={{ pointerEvents: "auto" }}
              onClick={() => handleToastClick(toast)}
            >
              <div className="flex items-start gap-3 p-3">
                {/* Icon */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-xl">{typeConfig?.icon || "🔔"}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">
                      {toast.title}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0 -mr-1 -mt-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeToast(toast.id)
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  {toast.body && (
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {toast.body}
                    </p>
                  )}
                  {toast.senderName && (
                    <p className="mt-1 text-[10px] text-muted-foreground/60">
                      oleh {toast.senderName}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}