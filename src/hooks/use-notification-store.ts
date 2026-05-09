"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { RealtimeEvent } from "@/lib/realtime"

export type NotificationType = 
  | "COMMENT_ADDED"
  | "TASK_ASSIGNED"
  | "CHAT_MESSAGE"
  | "TASK_STATUS_CHANGED"

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  body: string
  link?: string
  isRead: boolean
  senderId?: string
  senderName?: string
  senderImage?: string
  createdAt: string
  metadata?: Record<string, unknown>
}

interface NotificationStore {
  // State
  notifications: AppNotification[]
  unreadCount: number
  isLoading: boolean
  isConnected: boolean
  soundEnabled: boolean
  desktopNotificationsEnabled: boolean
  
  // Actions
  setNotifications: (notifications: AppNotification[]) => void
  addNotification: (notification: RealtimeEvent) => void
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  fetchNotifications: () => Promise<void>
  setConnected: (connected: boolean) => void
  setSoundEnabled: (enabled: boolean) => void
  setDesktopNotificationsEnabled: (enabled: boolean) => void
  clearAll: () => void
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      isConnected: false,
      soundEnabled: true,
      desktopNotificationsEnabled: true,

      setNotifications: (notifications, merge = false) => {
        set(state => {
          // If merge=true, merge dengan notifications yang sudah ada (dari SSE)
          // Jika merge=false, replace semua (initial load)
          let mergedNotifications: AppNotification[]
          
          if (merge && state.notifications.length > 0) {
            // Merge: tambahkan notification baru yang belum ada
            const existingIds = new Set(state.notifications.map(n => n.id))
            const newOnly = notifications.filter(n => !existingIds.has(n.id))
            mergedNotifications = [...newOnly, ...state.notifications]
          } else {
            mergedNotifications = notifications
          }
          
          const unreadCount = mergedNotifications.filter(n => !n.isRead).length
          return { notifications: mergedNotifications, unreadCount }
        })
      },

      addNotification: (event: RealtimeEvent) => {
        const notification: AppNotification = {
          id: event.id || `notif-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          type: event.type as NotificationType,
          title: event.title,
          body: event.body,
          link: event.link,
          isRead: false,
          senderId: event.senderId,
          senderName: event.senderName,
          senderImage: event.senderImage,
          createdAt: event.timestamp,
          metadata: event.metadata,
        }

        set(state => {
          // Prevent duplicates by checking if ID already exists
          const existingIds = new Set(state.notifications.map(n => n.id))
          if (existingIds.has(notification.id)) {
            return state
          }
          
          const newNotifications = [notification, ...state.notifications]
          // Keep only last 50
          const trimmed = newNotifications.slice(0, 50)
          return {
            notifications: trimmed,
            unreadCount: trimmed.filter(n => !n.isRead).length,
          }
        })
      },

      markAsRead: async (id: string) => {
        try {
          await fetch(`/api/notifications/${id}`, { method: "PATCH" })
          set(state => ({
            notifications: state.notifications.map(n =>
              n.id === id ? { ...n, isRead: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
          }))
        } catch (error) {
          console.error("Failed to mark notification as read:", error)
        }
      },

      markAllAsRead: async () => {
        try {
          await fetch("/api/notifications/read-all", { method: "POST" })
          set(state => ({
            notifications: state.notifications.map(n => ({ ...n, isRead: true })),
            unreadCount: 0,
          }))
        } catch (error) {
          console.error("Failed to mark all as read:", error)
        }
      },

      deleteNotification: async (id: string) => {
        try {
          await fetch(`/api/notifications/${id}`, { method: "DELETE" })
          set(state => {
            const deleted = state.notifications.find(n => n.id === id)
            const newUnreadCount = deleted && !deleted.isRead
              ? state.unreadCount - 1
              : state.unreadCount
            return {
              notifications: state.notifications.filter(n => n.id !== id),
              unreadCount: Math.max(0, newUnreadCount),
            }
          })
        } catch (error) {
          console.error("Failed to delete notification:", error)
        }
      },

      fetchNotifications: async () => {
        set({ isLoading: true })
        try {
          const res = await fetch("/api/notifications?limit=50")
          if (res.ok) {
            const data = await res.json()
            // Merge dengan notifications yang sudah ada (dari SSE), jangan duplicate
            set(state => {
              const existingIds = new Set(state.notifications.map(n => n.id))
              const apiNotifications = data.notifications.filter((n: AppNotification) => !existingIds.has(n.id))
              const mergedNotifications = [...apiNotifications, ...state.notifications]
              const unreadCount = mergedNotifications.filter(n => !n.isRead).length
              return {
                notifications: mergedNotifications,
                unreadCount,
                isLoading: false,
              }
            })
          } else {
            set({ isLoading: false })
          }
        } catch (error) {
          console.error("Failed to fetch notifications:", error)
          set({ isLoading: false })
        }
      },

      setConnected: (connected: boolean) => {
        set({ isConnected: connected })
      },

      setSoundEnabled: (enabled: boolean) => {
        set({ soundEnabled: enabled })
      },

      setDesktopNotificationsEnabled: (enabled: boolean) => {
        set({ desktopNotificationsEnabled: enabled })
      },

      clearAll: () => {
        set({ notifications: [], unreadCount: 0 })
      },
    }),
    {
      name: "notification-store",
      partialize: (state) => ({
        soundEnabled: state.soundEnabled,
        desktopNotificationsEnabled: state.desktopNotificationsEnabled,
      }),
    }
  )
)