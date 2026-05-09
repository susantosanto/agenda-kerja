// Global Realtime SSE - broadcast ke SEMUA user
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { createServerClient, RealtimeEvent } from "@/lib/realtime"

export const dynamic = "force-dynamic"

// GET /api/realtime/global - Untuk semua user (global notifications)
export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id

  const stream = new ReadableStream({
    start(controller) {
      // Subscribe user ke global notifications
      createServerClient().subscribeUser(userId, controller)

      const heartbeat = setInterval(() => {
        try {
          const encoder = new TextEncoder()
          controller.enqueue(encoder.encode(`: heartbeat\n\n`))
        } catch (e) {
          clearInterval(heartbeat)
        }
      }, 30000)

      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat)
        createServerClient().unsubscribeUser(userId)
        try {
          controller.close()
        } catch (e) {
          // Already closed
        }
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  })
}