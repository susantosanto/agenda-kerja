// Real-time notification system using Server-Sent Events (SSE)
// Supports desktop notifications (browser) and sound alerts
// Broadcast to ALL users (multi-user notification like Discord/WhatsApp)

// Event types for real-time updates
export type RealtimeEventType = 
  | "comment-added"
  | "task-updated"
  | "task-created"
  | "subtask-updated"
  | "mention"
  | "chat-message"
  | "chat-message-deleted"
  | "task-assigned"
  | "global-notification"

export interface RealtimeEvent {
  id?: string
  type: RealtimeEventType
  title: string
  body: string
  link?: string
  senderId?: string
  senderName?: string
  senderImage?: string
  timestamp: string
  metadata?: Record<string, unknown>
}

// Notification type mapping
export const NOTIFICATION_TYPES = {
  "comment-added": { icon: "💬", title: "Komentar Baru" },
  "chat-message": { icon: "💭", title: "Pesan Baru" },
  "task-assigned": { icon: "📋", title: "Task Ditugaskan" },
  "task-updated": { icon: "✏️", title: "Task Diperbarui" },
  "task-created": { icon: "✨", title: "Task Baru" },
  "mention": { icon: "@", title: "Disebut" },
  "global-notification": { icon: "🔔", title: "Notifikasi" },
} as const

// Notification sound presets
export const SOUND_PRESETS = {
  comment: { frequency: 800, duration: 150, type: "sine" as OscillatorType },
  chat: { frequency: 600, duration: 200, type: "sine" as OscillatorType },
  task: { frequency: 700, duration: 180, type: "sine" as OscillatorType },
  mention: { frequency: 900, duration: 250, type: "sine" as OscillatorType },
}

// Type for event listeners
type EventListener = (event: RealtimeEvent) => void

class RealtimeServer {
  private listeners: Map<string, Set<EventListener>> = new Map()
  // Map userId to Set of controllers for user-specific subscriptions
  private userSubscriptions: Map<string, Set<ReadableStreamDefaultController>> = new Map()
  // Global subscriptions (all users get these)
  private globalSubscriptions: Set<ReadableStreamDefaultController> = new Map()
  // Legacy task subscriptions (for backwards compatibility)
  // Key: taskId, Value: Map<userId, controller>
  private taskSubscriptions: Map<string, Map<string, ReadableStreamDefaultController>> = new Map()
  // All tasks subscriptions (for all-tasks page)
  private allTasksSubscriptions: Map<string, Set<ReadableStreamDefaultController>> = new Map()

  // Legacy subscribe for task-specific events - now tracks userId
  subscribe(taskId: string, userId: string, controller: ReadableStreamDefaultController) {
    console.log("[SUBSCRIBE] User subscribing to task:", { taskId, userId })
    console.log("[SUBSCRIBE] Controller type:", typeof controller)
    
    if (!this.taskSubscriptions.has(taskId)) {
      this.taskSubscriptions.set(taskId, new Map())
    }
    // Use userId as key, controller as value
    this.taskSubscriptions.get(taskId)!.set(userId, controller)
    
    console.log(`[SUBSCRIBE] Task ${taskId} subscribers:`, Array.from(this.taskSubscriptions.get(taskId)!.entries()))
    
    // Send initial connection message
    const encoder = new TextEncoder()
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "connected", taskId })}\n\n`))
  }

  // Legacy unsubscribe - needs both taskId and userId
  unsubscribe(taskId: string, userId: string) {
    const taskMap = this.taskSubscriptions.get(taskId)
    if (taskMap) {
      taskMap.delete(userId)
      if (taskMap.size === 0) {
        this.taskSubscriptions.delete(taskId)
      }
    }
  }

  // Subscribe user to their personal notifications
  subscribeUser(userId: string, controller: ReadableStreamDefaultController) {
    console.log("[subscribeUser] User subscribing to global:", userId)
    if (!this.userSubscriptions.has(userId)) {
      this.userSubscriptions.set(userId, new Set())
    }
    this.userSubscriptions.get(userId)!.add(controller)
    console.log("[subscribeUser] userSubscriptions now:", Array.from(this.userSubscriptions.keys()))
    
    // Send initial connection message
    const encoder = new TextEncoder()
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "connected", userId })}\n\n`))
  }

  // Unsubscribe user
  unsubscribeUser(userId: string) {
    this.userSubscriptions.delete(userId)
  }

  // Subscribe user to all tasks updates
  subscribeAllTasks(userId: string, controller: ReadableStreamDefaultController) {
    if (!this.allTasksSubscriptions.has(userId)) {
      this.allTasksSubscriptions.set(userId, new Set())
    }
    this.allTasksSubscriptions.get(userId)!.add(controller)
    
    const encoder = new TextEncoder()
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "connected", channel: "all-tasks" })}\n\n`))
  }

  // Unsubscribe from all tasks
  unsubscribeAllTasks(userId: string) {
    this.allTasksSubscriptions.delete(userId)
  }

  // Broadcast to all users EXCEPT the sender (multi-user broadcast)
  broadcastToAll(excludeUserId: string | null, event: RealtimeEvent) {
    console.log("[broadcastToAll] START - excludeUserId:", excludeUserId)
    console.log("[broadcastToAll] globalSubscriptions size:", this.globalSubscriptions.size)
    console.log("[broadcastToAll] userSubscriptions size:", this.userSubscriptions.size)
    
    const encoder = new TextEncoder()
    const message = `data: ${JSON.stringify(event)}\n\n`
    const encoded = encoder.encode(message)

    // Send to global subscribers
    let sentToGlobal = 0
    this.globalSubscriptions.forEach((controller) => {
      try {
        controller.enqueue(encoded)
        sentToGlobal++
      } catch (e) {
        // Client disconnected
      }
    })
    console.log("[broadcastToAll] Sent to global:", sentToGlobal)

    // Also send to user-specific subscriptions
    let sentToUsers = 0
    this.userSubscriptions.forEach((controllers, userId) => {
      // Skip the sender
      if (userId === excludeUserId) return
      
      controllers.forEach((controller) => {
        try {
          controller.enqueue(encoded)
          sentToUsers++
        } catch (e) {
          // Client disconnected
        }
      })
    })
    console.log("[broadcastToAll] Sent to users:", sentToUsers)

    // Also call local listeners
    const listeners = this.listeners.get(event.type) || new Set()
    listeners.forEach((listener) => listener(event))
  }

  // Broadcast to task subscribers (exclude sender if provided)
  broadcast(type: RealtimeEventType, data: any, excludeUserId?: string) {
    const event: RealtimeEvent = {
      type,
      title: data.title || "Update",
      body: data.body || "",
      link: data.link,
      timestamp: new Date().toISOString(),
      metadata: data.data || {},
      senderId: data.senderId,
    }

    const encoder = new TextEncoder()
    const message = `data: ${JSON.stringify(event)}\n\n`
    const encoded = encoder.encode(message)

    // Send to ALL task subscribers, EXCEPT sender
    console.log("[BROADCAST] Sending to task subscribers:", {
      totalTaskSubscriptions: this.taskSubscriptions.size,
      excludeUserId
    })
    this.taskSubscriptions.forEach((userMap, taskId) => {
      console.log(`[BROADCAST] Task ${taskId} has ${userMap.size} subscribers`)
      userMap.forEach((controller, subscribedUserId) => {
        // Skip sender
        if (excludeUserId && subscribedUserId === excludeUserId) return
        
        try {
          controller.enqueue(encoded)
        } catch (e) {
          // Client disconnected
        }
      })
    })
  }

  // Broadcast to specific task ONLY, exclude sender
  broadcastToTask(taskId: string, type: RealtimeEventType, data: any, excludeUserId?: string) {
    console.log("[broadcastToTask] START - taskId:", taskId, "type:", type)
    console.log("[broadcastToTask] Subscriptions Map:", Object.fromEntries(this.taskSubscriptions))
    console.log("[broadcastToTask] Has taskId:", this.taskSubscriptions.has(taskId))
    
    const event: RealtimeEvent = {
      type,
      title: data.title || "Update",
      body: data.body || "",
      link: data.link,
      timestamp: new Date().toISOString(),
      // Put the data in metadata for client to find as data.metadata.comment
      metadata: data.data || {},
    }
    
    // Add data directly to metadata for easier access on client
    if (data.data) {
      event.metadata = { ...event.metadata, ...data.data }
    }
    
    console.log("[broadcastToTask] Event to send:", JSON.stringify(event).substring(0, 300))

    const encoder = new TextEncoder()
    const message = `data: ${JSON.stringify(event)}\n\n`
    const encoded = encoder.encode(message)

    // Send to specific taskId subscribers ONLY, exclude sender
    const userMap = this.taskSubscriptions.get(taskId)
    console.log(`[broadcastToTask] Found subscribers:`, userMap ? Array.from(userMap.keys()) : "NONE")
    console.log(`[broadcastToTask] Exclude userId:`, excludeUserId)
    
    if (userMap) {
      // JavaScript Map.forEach gives (value, key) NOT (key, value)!
      // So we need to swap: first param is controller, second is userId
      userMap.forEach((controllerOrUserId, userIdOrController) => {
        // Try to detect which is which
        const isController = controllerOrUserId && typeof controllerOrUserId.enqueue === 'function'
        const subscribedUserId = isController ? userIdOrController : controllerOrUserId
        const controller = isController ? controllerOrUserId : userIdOrController
        
        console.log(`[broadcastToTask] Checking subscriber:`, subscribedUserId, "isController:", isController)
        console.log(`[broadcastToTask] Exclude userId:`, excludeUserId, "match:", excludeUserId === subscribedUserId)
        
        if (excludeUserId && subscribedUserId === excludeUserId) {
          console.log(`[broadcastToTask] Skipping sender (matches)`)
          return
        }
        
        try {
          if (controller && controller.enqueue) {
            controller.enqueue(encoded)
            console.log(`[broadcastToTask] ✅ SENT to user: ${subscribedUserId}`)
          } else {
            console.log(`[broadcastToTask] ❌ Invalid controller for:`, subscribedUserId)
          }
        } catch (e) {
          console.log(`[broadcastToTask] Error sending to:`, subscribedUserId, e)
        }
      })
    }
  }

  // Broadcast to all tasks page subscribers
  broadcastToAllTasks(excludeUserId: string | null, event: RealtimeEvent) {
    console.log("[broadcastToAllTasks] Sending:", { type: event.type, excludeUserId })
    
    const encoder = new TextEncoder()
    const message = `data: ${JSON.stringify(event)}\n\n`
    const encoded = encoder.encode(message)

    this.allTasksSubscriptions.forEach((controllers, subscribedUserId) => {
      if (excludeUserId && subscribedUserId === excludeUserId) return
      
      controllers.forEach((controller) => {
        try {
          controller.enqueue(encoded)
        } catch (e) {
          // Client disconnected
        }
      })
    })
  }

  // Get total connected users count
  getConnectedCount(): number {
    let count = 0
    this.userSubscriptions.forEach((controllers) => {
      count += controllers.size
    })
    return count + this.globalSubscriptions.size
  }
}

// Singleton instance using globalThis for Next.js persistence
declare global {
  var realtimeServer: RealtimeServer | undefined
}

export function createServerClient(): RealtimeServer {
  if (!global.realtimeServer) {
    console.log("[RealtimeServer] Creating NEW global instance")
    global.realtimeServer = new RealtimeServer()
  }
  return global.realtimeServer
}

// ============ CLIENT-SIDE FUNCTIONS ============

// Play notification sound using Web Audio API
export function playNotificationSound(type: keyof typeof SOUND_PRESETS = "comment") {
  try {
    const preset = SOUND_PRESETS[type]
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = preset.frequency
    oscillator.type = preset.type

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + preset.duration / 1000)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + preset.duration / 1000)
  } catch (e) {
    console.error("Failed to play notification sound:", e)
  }
}

// Request browser notification permission
export function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission()
  }
}

// Show browser notification
export function showBrowserNotification(title: string, body: string, link?: string) {
  if ("Notification" in window && Notification.permission === "granted") {
    const notification = new Notification(title, {
      body,
      icon: "/favicon.ico",
      tag: "zenith-notification",
    })

    if (link) {
      notification.onclick = () => {
        window.open(link, "_blank")
        notification.close()
      }
    }

    setTimeout(() => notification.close(), 5000)
  }
}

// Add event listener
export function addEventListener(type: string, listener: EventListener) {
  const server = createServerClient()
  if (!server.listeners.has(type)) {
    server.listeners.set(type, new Set())
  }
  server.listeners.get(type)!.add(listener)
}

// Remove event listener
export function removeEventListener(type: string, listener: EventListener) {
  const server = createServerClient()
  const listeners = server.listeners.get(type)
  if (listeners) {
    listeners.delete(listener)
  }
}

// Dispatch event locally (on client side)
export function dispatchRealtimeEvent(event: RealtimeEvent) {
  const server = createServerClient()
  const listeners = server.listeners.get(event.type)
  if (listeners) {
    listeners.forEach((listener) => listener(event))
  }
}

// Client-side connection for global notifications
export function createGlobalRealtimeClient() {
  let eventSource: EventSource | null = null
  let reconnectTimeout: NodeJS.Timeout | null = null
  
  function connect(callbacks: {
    onNotification?: (event: RealtimeEvent) => void
    onError?: (error: Event) => void
    onConnect?: () => void
  }) {
    // Close existing connection
    if (eventSource) {
      eventSource.close()
    }
    
    // Don't reconnect if already connecting
    if (eventSource?.readyState === EventSource.CONNECTING) {
      return
    }

    eventSource = new EventSource(`/api/realtime/global`)

    eventSource.onopen = () => {
      callbacks.onConnect?.()
    }

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        if (data.type === "connected") {
          return
        }

        callbacks.onNotification?.(data)
      } catch (e) {
        console.error("Failed to parse SSE message:", e)
      }
    }

    eventSource.onerror = (error) => {
      console.error("SSE error:", error)
      callbacks.onError?.(error)
      
      // Attempt reconnect after 5 seconds
      if (eventSource?.readyState === EventSource.CLOSED) {
        reconnectTimeout = setTimeout(() => {
          connect(callbacks)
        }, 5000)
      }
    }
  }

  function disconnect() {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout)
      reconnectTimeout = null
    }
    if (eventSource) {
      eventSource.close()
      eventSource = null
    }
  }

  return { connect, disconnect }
}

// Legacy compatibility - keeps task-specific subscriptions working
export function createRealtimeClient() {
  const eventSource: Map<string, EventSource> = new Map()

  function connect(taskId: string, callbacks: {
    onCommentAdded?: (comment: any) => void
    onCommentDeleted?: (commentId: string) => void
    onTaskUpdated?: (task: any) => void
    onChatMessage?: (message: any) => void
    onTaskAssigned?: (data: any) => void
    onMention?: (data: any) => void
    onError?: (error: Event) => void
  }) {
    if (eventSource.has(taskId)) {
      return
    }

    const source = new EventSource(`/api/realtime?taskId=${taskId}`, {
      withCredentials: true,
    })
    eventSource.set(taskId, source)

    // Debug: Track connection state
    source.onopen = () => {
      console.log("[SSE] Connection opened for task:", taskId)
    }

    source.onmessage = (event) => {
      console.log("[SSE] Received message:", event.data)
      try {
        const data = JSON.parse(event.data)
        console.log("[SSE] Type:", data.type)
        
        if (data.type === "comment-added") {
          // Priority order based on how broadcastToTask sends data
          const payload = 
            data.metadata?.comment ||    // { metadata: { comment: {...} } } <- THIS IS WHERE SERVER SENDS IT
            data.data?.comment ||        // { data: { comment: {...} }
            data.comment ||        // { comment: {...} }
            null
          
          console.log("[SSE] comment payload:", payload ? JSON.stringify(payload).substring(0, 150) : "NOT FOUND")
          
          if (payload) {
            console.log("[SSE] Calling onCommentAdded")
            callbacks.onCommentAdded?.(payload)
            playNotificationSound("comment")
            showBrowserNotification(
              "Komentar Baru",
              `${payload.user?.name || 'User'} menambahkan komentar`,
              data.link
            )
          } else {
            console.log("[SSE] Debug - full data keys:", Object.keys(data))
          }
          return
        }
        
        switch (data.type) {
          case "chat-message":
            callbacks.onChatMessage?.(data.data)
            playNotificationSound("chat")
            showBrowserNotification(
              "Pesan Baru",
              `${data.data.senderName || 'User'} mengirim pesan`,
              data.data.link
            )
            break
          case "task-assigned":
            callbacks.onTaskAssigned?.(data.data)
            playNotificationSound("task")
            showBrowserNotification(
              "Task Ditugaskan",
              `${data.data.senderName || 'User'} menugaskan task kepada Anda`,
              data.data.taskId
            )
            break
          case "task-updated":
            callbacks.onTaskUpdated?.(data.data)
            break
          case "mention":
            callbacks.onMention?.(data.data)
            playNotificationSound("mention")
            showBrowserNotification(
              "Anda Disebut",
              `${data.data.user?.name || 'User'} menyebut Anda`,
              data.data.taskId
            )
            break
          case "comment-deleted":
            // Call the callback with deleted comment ID
            const deletedCommentId = data.data?.commentId || data.metadata?.commentId
            console.log("[SSE] comment-deleted:", deletedCommentId)
            if (deletedCommentId) {
              callbacks.onCommentDeleted?.(deletedCommentId)
            }
            break
        }
      } catch (e) {
        console.error("Failed to parse SSE message:", e)
      }
    }

    source.onerror = (error) => {
      console.error("SSE error:", error)
      callbacks.onError?.(error)
      
      // Attempt reconnect after 5 seconds
      if (source?.readyState === EventSource.CLOSED) {
        setTimeout(() => {
          connect(callbacks)
        }, 5000)
      }
    }
  }

  function disconnect(taskId: string) {
    const source = eventSource.get(taskId)
    if (source) {
      source.close()
      eventSource.delete(taskId)
    }
  }

  return { connect, disconnect }
}