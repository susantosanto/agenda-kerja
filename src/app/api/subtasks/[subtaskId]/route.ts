import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createServerClient } from "@/lib/realtime"

// PATCH /api/subtasks/[subtaskId]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ subtaskId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { subtaskId } = await params
  const body = await request.json()
  const { title, completed } = body

  try {
    const subtask = await prisma.subtask.findUnique({
      where: { id: subtaskId },
      include: {
        task: true
      },
    })

    if (!subtask) {
      return NextResponse.json({ error: "Subtask tidak ditemukan" }, { status: 404 })
    }

    const updated = await prisma.subtask.update({
      where: { id: subtaskId },
      data: {
        ...(title !== undefined && { title }),
        ...(completed !== undefined && { isDone: completed }),
      },
    })

    // ✅ BROADCAST REALTIME
    const taskId = subtask.taskId
    const senderId = session.user.id
    const serverClient = createServerClient()

    // 1. Broadcast ke subscriber task spesifik (untuk update UI di task-detail)
    serverClient.broadcastToTask(taskId, "subtask-updated", {
      title: "Subtask Diperbarui",
      body: `Subtask "${updated.title}" ${updated.isDone ? "selesai" : "diperbarui"}`,
      senderId,
      data: {
        subtaskId,
        taskId,
        completed: updated.isDone,
        title: updated.title
      }
    }, senderId)

    // 2. Broadcast ke all-tasks (untuk update progres bar di list)
    serverClient.broadcastToAllTasks(senderId, {
      type: "task-updated",
      title: "Task Diperbarui",
      body: `Progres task diperbarui`,
      link: `/tasks/${taskId}`,
      senderId,
      senderName: session.user.name || "User",
      timestamp: new Date().toISOString(),
      metadata: { taskId }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating subtask:", error)
    return NextResponse.json(
      { error: "Gagal memperbarui subtask" },
      { status: 500 }
    )
  }
}

// DELETE /api/subtasks/[subtaskId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ subtaskId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { subtaskId } = await params

  try {
    const subtask = await prisma.subtask.findUnique({
      where: { id: subtaskId },
    })

    if (!subtask) {
      return NextResponse.json({ error: "Subtask tidak ditemukan" }, { status: 404 })
    }

    const taskId = subtask.taskId

    await prisma.subtask.delete({
      where: { id: subtaskId },
    })

    // ✅ BROADCAST REALTIME
    const senderId = session.user.id
    const serverClient = createServerClient()

    // 1. Broadcast ke subscriber task spesifik
    serverClient.broadcastToTask(taskId, "subtask-updated", {
      title: "Subtask Dihapus",
      body: `Subtask dihapus`,
      senderId,
      data: {
        subtaskId,
        taskId,
        deleted: true
      }
    }, senderId)

    // 2. Broadcast ke all-tasks
    serverClient.broadcastToAllTasks(senderId, {
      type: "task-updated",
      title: "Task Diperbarui",
      body: `Progres task diperbarui`,
      link: `/tasks/${taskId}`,
      senderId,
      senderName: session.user.name || "User",
      timestamp: new Date().toISOString(),
      metadata: { taskId }
    })

    return NextResponse.json({ message: "Subtask dihapus" })
  } catch (error) {
    console.error("Error deleting subtask:", error)
    return NextResponse.json(
      { error: "Gagal menghapus subtask" },
      { status: 500 }
    )
  }
}
