// Notifications API - GET list, POST create, PATCH mark read
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const cursor = searchParams.get("before")
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50)
  const unreadOnly = searchParams.get("unread") === "true"

  try {
    const where: Record<string, unknown> = {
      userId: session.user.id,
    }

    if (unreadOnly) {
      where.isRead = false
    }

    if (cursor) {
      where.id = { lt: cursor }
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit + 1,
    })

    const hasMore = notifications.length > limit
    const result = hasMore ? notifications.slice(0, limit) : notifications
    const nextCursor = hasMore ? result[result.length - 1]?.id : null

    // Get unread count
    const unreadCount = await prisma.notification.count({
      where: {
        userId: session.user.id,
        isRead: false,
      },
    })

    return NextResponse.json({
      notifications: result,
      unreadCount,
      hasMore,
      nextCursor,
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    )
  }
}

// POST - Create notification (called from other API routes)
export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const forUserId = searchParams.get("userId")

  // Allow internal calls (from other API routes) with userId param
  // Or require auth for direct calls
  let session = await auth()
  const isInternal = !!forUserId

  if (!isInternal && !session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { userId, type, title, body: notifBody, link, metadata } = body

    const targetUserId = userId || (isInternal ? forUserId : session!.user!.id)

    if (!targetUserId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    if (!type || !title) {
      return NextResponse.json({ error: "Type and title required" }, { status: 400 })
    }

    const notification = await prisma.notification.create({
      data: {
        userId: targetUserId,
        type,
        title,
        body: notifBody,
        link,
        metadata,
      },
    })

    return NextResponse.json(notification, { status: 201 })
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    )
  }
}