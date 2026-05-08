import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { createServerClient } from "@/lib/realtime"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const taskId = searchParams.get("taskId")

  if (!taskId) {
    return NextResponse.json({ error: "taskId is required" }, { status: 400 })
  }

  const stream = new ReadableStream({
    start(controller) {
      createServerClient().subscribe(taskId, controller)

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
        createServerClient().unsubscribe(taskId)
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