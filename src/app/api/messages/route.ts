import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const cursor = searchParams.get("before")
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)

  try {
    const where = cursor ? { id: { lt: cursor } } : {}

    const messages = await prisma.chatMessage.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
    })

    const hasMore = messages.length > limit
    const result = hasMore ? messages.slice(0, limit) : messages
    const nextCursor = hasMore ? result[result.length - 1]?.id : null

    return NextResponse.json({
      messages: result.reverse(),
      hasMore,
      nextCursor,
    })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get user from database using the ID from session
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const { content } = await request.json()
  if (!content || !content.trim()) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 })
  }

  try {
    const message = await prisma.chatMessage.create({
      data: {
        content: content.trim(),
        userId: user.id,
        communityId: null,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error("Error creating message:", error)
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const messageId = searchParams.get("id")

  if (!messageId) {
    return NextResponse.json({ error: "Message ID is required" }, { status: 400 })
  }

  // Get user from database using the ID from session
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  try {
    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
    })

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    // Only the message author can delete
    if (message.userId !== user.id) {
      return NextResponse.json({ error: "You can only delete your own messages" }, { status: 403 })
    }

    await prisma.chatMessage.delete({
      where: { id: messageId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting message:", error)
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 }
    )
  }
}
