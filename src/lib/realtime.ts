// Real-time notification system using Server-Sent Events (SSE)
// Supports desktop notifications (browser) and sound alerts

// Event types for real-time updates
export type RealtimeEventType = 
  | "comment-added"
  | "task-updated"
  | "task-created"
  | "subtask-updated"
  | "mention"

export interface RealtimeEvent {
  type: RealtimeEventType
  taskId: string
  data: any
  timestamp: string
}

// EventEmitter for server-side broadcasting
type EventListener = (event: RealtimeEvent) => void

class RealtimeServer {
  private listeners: Map<string, Set<EventListener>> = new Map()
  private sseClients: Map<string, ReadableStreamDefaultController> = new Map()

  subscribe(taskId: string, controller: ReadableStreamDefaultController) {
    this.sseClients.set(taskId, controller)
    
    // Send initial connection message
    const encoder = new TextEncoder()
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "connected", taskId })}\n\n`))
  }

  unsubscribe(taskId: string) {
    this.sseClients.delete(taskId)
  }

  broadcast(type: RealtimeEventType, data: any) {
    const event: RealtimeEvent = {
      type,
      taskId: data.taskId,
      data,
      timestamp: new Date().toISOString(),
    }

    const encoder = new TextEncoder()
    const message = `data: ${JSON.stringify(event)}\n\n`
    const encoded = encoder.encode(message)

    // Send to all subscribed clients
    this.sseClients.forEach((controller) => {
      try {
        controller.enqueue(encoded)
      } catch (e) {
        // Client disconnected, will be cleaned up
      }
    })

    // Also call local listeners
    const listeners = this.listeners.get(type) || new Set()
    listeners.forEach((listener) => listener(event))
  }
}

// Singleton instance
let serverInstance: RealtimeServer | null = null

export function createServerClient(): RealtimeServer {
  if (!serverInstance) {
    serverInstance = new RealtimeServer()
  }
  return serverInstance
}

// Client-side hook for subscribing to real-time events
export function createRealtimeClient() {
  const eventSource: Map<string, EventSource> = new Map()

  function connect(taskId: string, callbacks: {
    onCommentAdded?: (comment: any) => void
    onTaskUpdated?: (task: any) => void
    onMention?: (data: any) => void
    onError?: (error: Event) => void
  }) {
    // Don't reconnect if already connected
    if (eventSource.has(taskId)) {
      return
    }

    const source = new EventSource(`/api/realtime?taskId=${taskId}`)
    eventSource.set(taskId, source)

    source.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        switch (data.type) {
          case "comment-added":
            callbacks.onCommentAdded?.(data.data.comment)
            // Play notification sound
            playNotificationSound("comment")
            showBrowserNotification(
              "Komentar Baru",
              `${data.data.comment.user.name} menambahkan komentar`,
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
              `${data.data.user.name} menyebut Anda di task`,
              data.data.taskId
            )
            break
        }
      } catch (e) {
        console.error("Failed to parse realtime event:", e)
      }
    }

    source.onerror = (error) => {
      console.error("SSE error:", error)
      callbacks.onError?.(error)
      // Don't auto-reconnect to prevent infinite loops
    }
  }

  function disconnect(taskId: string) {
    const source = eventSource.get(taskId)
    if (source) {
      source.close()
      eventSource.delete(taskId)
    }
  }

  function disconnectAll() {
    eventSource.forEach((source) => source.close())
    eventSource.clear()
  }

  return { connect, disconnect, disconnectAll }
}

// Notification sound URLs (using Web Audio API for reliability)
export async function playNotificationSound(type: "comment" | "mention" | "task") {
  // Create notification sound using Web Audio API
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    
    // Create oscillator for notification sound
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    // Different tones for different notification types
    if (type === "mention") {
      // Higher pitch for mentions
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1)
    } else {
      // Standard notification sound
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1)
    }
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.3)
  } catch (e) {
    console.error("Failed to play notification sound:", e)
  }
}

// Browser notification API
export async function showBrowserNotification(
  title: string,
  body: string,
  taskId?: string
) {
  // Check if browser supports notifications
  if (!("Notification" in window)) {
    return
  }

  // Check permission
  if (Notification.permission === "granted") {
    createNotification(title, body, taskId)
  } else if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission()
    if (permission === "granted") {
      createNotification(title, body, taskId)
    }
  }
}

function createNotification(title: string, body: string, taskId?: string) {
  const notification = new Notification(title, {
    body,
    icon: "/favicon.ico",
    tag: taskId || "todolist",
    requireInteraction: false,
    silent: false, // Allow sound
  })

  // Click to open task
  notification.onclick = () => {
    window.focus()
    if (taskId) {
      window.location.href = `/tasks/${taskId}`
    }
    notification.close()
  }

  // Auto close after 5 seconds
  setTimeout(() => notification.close(), 5000)
}

// Request notification permission on app load
export async function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    await Notification.requestPermission()
  }
}

// Vibrate for mobile (if supported)
export function vibrateDevice(pattern: number | number[] = 200) {
  if ("vibrate" in navigator) {
    navigator.vibrate(pattern)
  }
}