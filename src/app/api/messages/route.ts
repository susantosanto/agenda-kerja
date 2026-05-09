import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/realtime"

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

  const { content, imageUrl } = await request.json()
  if (!content?.trim() && !imageUrl) {
    return NextResponse.json({ error: "Content or image is required" }, { status: 400 })
  }

  try {
    const message = await prisma.chatMessage.create({
      data: {
        content: content?.trim() || "",
        imageUrl: imageUrl || null,
        userId: user.id,
        communityId: null,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    })

    const senderId = session.user.id
    const senderName = session.user.name || user.name || "User"
    const senderImage = session.user.image || user.image || undefined

    // ✅ BROADCAST ke SEMUA user KECUALI pengirim (global notification)
    createServerClient().broadcastToAll(senderId, {
      type: "chat-message",
      title: "Pesan Baru",
      body: `${senderName}: ${content?.trim()?.slice(0, 50) || "mengirim gambar"}`,
      link: "/dashboard/forum",
      senderId,
      senderName,
      senderImage,
      timestamp: new Date().toISOString(),
      metadata: {
        messageId: message.id,
        message: {
          id: message.id,
          content: message.content,
          imageUrl: message.imageUrl,
          createdAt: message.createdAt,
          user: {
            id: user.id,
            name: user.name,
            image: user.image,
            email: user.email
          }
        }
      },
    })

    // Simpan notification ke database untuk SEMUA user KECUALI pengirim
    const allUsers = await prisma.user.findMany({
      where: { id: { not: session.user.id } },
      select: { id: true },
    })

    if (allUsers.length > 0) {
      const notificationData = allUsers.map((u) => ({
        userId: u.id,
        type: "CHAT_MESSAGE" as const,
        title: "Pesan Baru",
        body: `${senderName}: ${content?.trim()?.slice(0, 100) || "mengirim gambar"}`,
        link: "/dashboard/forum",
        metadata: {
          messageId: message.id,
          senderName,
        },
      }))

      await prisma.notification.createMany({
        data: notificationData,
      })
    }

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

    // ✅ BROADCAST deletion ke SEMUA user
    const senderId = session.user.id
    createServerClient().broadcastToAll(senderId, {
      type: "chat-message-deleted",
      title: "Pesan Dihapus",
      body: "Sebuah pesan telah dihapus",
      senderId,
      timestamp: new Date().toISOString(),
      metadata: {
        messageId,
      },
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
