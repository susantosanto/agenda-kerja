import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createServerClient } from "@/lib/realtime"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { taskId } = await params
  const { searchParams } = new URL(request.url)
  const taskIdFilter = searchParams.get("taskId")

  const comments = await prisma.comment.findMany({
    where: taskIdFilter ? { taskId: taskIdFilter } : { task: { id: taskId } },
    include: {
      user: { select: { id: true, name: true, image: true } },
      task: { select: { title: true } },
    },
    orderBy: { createdAt: "asc" },
  })

  return NextResponse.json(comments)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { taskId } = await params
  const body = await request.json()
  const { content, imageUrl } = body

  if (!content?.trim() && !imageUrl) {
    return NextResponse.json({ error: "Content or image is required" }, { status: 400 })
  }

  // Get task info for notification
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { title: true },
  })

  const comment = await prisma.comment.create({
    data: {
      content: content?.trim() || "",
      imageUrl: imageUrl || null,
      taskId,
      userId: session.user.id,
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  })

  // Create activity log
  await prisma.activity.create({
    data: {
      type: "COMMENT_ADDED",
      details: "mengomentari task ini",
      taskId,
      userId: session.user.id,
    },
  })

  // ✅ BROADCAST ke SEMUA user KECUALI pengirim - SAMA SEPERTI CHAT (yang работа)!
  const senderId = session.user.id
  const senderName = session.user.name || "User"
  const senderImage = session.user.image || null

  // Get single server client instance
  const serverClient = createServerClient()

  // ✅ BROADCAST ke SEMUA user KECUALI pengirim (global notification + realtime UI)
  // Sama seperti chat yang работа!
  serverClient.broadcastToAll(senderId, {
    type: "comment-added",
    title: "Komentar Baru",
    body: `${senderName} mengomentari: ${task?.title || "Task"}`,
    link: `/tasks/${taskId}`,
    senderId,
    senderName,
    senderImage,
    timestamp: new Date().toISOString(),
    metadata: {
      taskId,
      commentId: comment.id,
      comment: {
        id: comment.id,
        content: comment.content,
        imageUrl: comment.imageUrl,
        createdAt: comment.createdAt,
        user: {
          id: session.user.id,
          name: session.user.name,
          image: session.user.image,
        },
      },
    },
  })

  // ✅ BROADCAST ke subscriber TASK SPESIFIK (untuk update UI instan di task-detail)
  // Dengan singleton fix, ini seharusnya sekarang работа!
  serverClient.broadcastToTask(taskId, "comment-added", {
    title: "Komentar Baru",
    body: `${senderName} menambahkan komentar`,
    senderId,
    data: {
      comment: {
        id: comment.id,
        content: comment.content,
        imageUrl: comment.imageUrl,
        createdAt: comment.createdAt,
        user: {
          id: session.user.id,
          name: session.user.name,
          image: session.user.image,
        },
      },
    }
  }, senderId)

  console.log("[COMMENTS] Broadcast via broadcastToAll AND broadcastToTask:", { taskId, senderId })

  // Simpan notification ke database untuk SEMUA user KECUALI pengirim
  // Ambil semua user lain untuk notifikasi
  const sender = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true },
  })

  // Get all users except sender for notifications  
  const allUsers = await prisma.user.findMany({
    where: {
      id: { not: session.user.id },
    },
    select: { id: true },
  })

  // Create notifications for all users (bulk insert for performance)
  if (allUsers.length > 0) {
    const notificationData = allUsers.map((user) => ({
      userId: user.id,
      type: "COMMENT_ADDED" as const,
      title: "Komentar Baru",
      body: `${senderName} mengomentari: ${task?.title || "Task"}`,
      link: `/tasks/${taskId}`,
      metadata: {
        taskId,
        commentId: comment.id,
        senderName,
      },
    }))

    // Bulk insert (batch for performance)
    await prisma.notification.createMany({
      data: notificationData,
    })
  }

  return NextResponse.json(comment, { status: 201 })
}