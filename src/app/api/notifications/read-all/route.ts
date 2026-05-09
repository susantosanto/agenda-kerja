// Mark all notifications as read API
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    })

    return NextResponse.json({
      success: true,
      count: result.count,
    })
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    return NextResponse.json(
      { error: "Failed to mark all as read" },
      { status: 500 }
    )
  }
}