import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/realtime"
import { revalidatePath } from "next/cache"

// GET /api/tasks/[taskId]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { taskId } = await params

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      createdBy: { select: { id: true, name: true, email: true, image: true } },
      assignees: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
      subtasks: { orderBy: { order: "asc" } },
      labels: { include: { label: true } },
      comments: {
        include: { user: { select: { id: true, name: true, email: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  })

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 })
  }

  // Map fields for frontend
  const mappedTask = {
    ...task,
    starred: task.isStarred,
    subtasks: task.subtasks.map(st => ({
      ...st,
      completed: st.isDone
    }))
  }

  return NextResponse.json(mappedTask)
}

// PATCH /api/tasks/[taskId]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { taskId } = await params
  const body = await request.json()
  const { title, description, status, priority, startDate, dueDate, duration, isStarred, starred, assigneeIds, labelIds } = body

  // Get existing task for comparison
  const existingTask = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      assignees: { select: { userId: true } },
    },
  })
  if (!existingTask) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 })
  }

  // Get task title for notifications
  const taskInfo = await prisma.task.findUnique({
    where: { id: taskId },
    select: { title: true },
  })

  const updates: Record<string, unknown> = {}
  if (title !== undefined) updates.title = title
  if (description !== undefined) updates.description = description
  if (status !== undefined) updates.status = status
  if (priority !== undefined) updates.priority = priority
  if (startDate !== undefined) updates.startDate = startDate ? new Date(startDate) : null
  if (dueDate !== undefined) updates.dueDate = dueDate ? new Date(dueDate) : null
  if (duration !== undefined) updates.duration = duration
  
  if (isStarred !== undefined) updates.isStarred = isStarred
  else if (starred !== undefined) updates.isStarred = starred

  // Track old assignees
  const oldAssigneeIds = existingTask.assignees.map(a => a.userId)
  let newAssigneeIds: string[] = []

  // Handle assignees
  if (assigneeIds !== undefined) {
    await prisma.taskAssignee.deleteMany({ where: { taskId } })
    newAssigneeIds = assigneeIds
    if (assigneeIds.length > 0) {
      updates.assignees = {
        create: assigneeIds.map((userId: string) => ({ userId })),
      }
    }
  } else {
    newAssigneeIds = oldAssigneeIds
  }

  // Handle labels
  if (labelIds !== undefined) {
    await prisma.taskLabel.deleteMany({ where: { taskId } })
    if (labelIds.length > 0) {
      updates.labels = {
        create: labelIds.map((labelId: string) => ({ labelId })),
      }
    }
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data: updates,
    include: {
      createdBy: { select: { id: true, name: true, email: true, image: true } },
      assignees: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
      subtasks: { orderBy: { order: "asc" } },
      labels: { include: { label: true } },
    },
  })

  // ✅ BROADCAST TASK ASSIGNMENT ke user yang BARU di-assign
  if (assigneeIds !== undefined) {
    // Find newly added assignees (not in old list)
    const newlyAssignedIds = newAssigneeIds.filter(id => !oldAssigneeIds.includes(id))
    
    if (newlyAssignedIds.length > 0) {
      const senderId = session.user.id
      const senderName = session.user.name || "User"
      
      // Broadcast realtime notification
      createServerClient().broadcastToAll(senderId, {
        type: "task-assigned",
        title: "Task Ditugaskan",
        body: `${senderName} menugaskan: ${taskInfo?.title || "Task"}`,
        link: `/tasks/${taskId}`,
        senderId,
        senderName,
        senderImage: session.user.image || null,
        timestamp: new Date().toISOString(),
        metadata: {
          taskId,
          assignedTo: newlyAssignedIds,
        },
      })

      // Create database notifications untuk assignee baru
      const notificationData = newlyAssignedIds.map((userId) => ({
        userId,
        type: "TASK_ASSIGNED" as const,
        title: "Task Ditugaskan",
        body: `${senderName} menugaskan: ${taskInfo?.title || "Task"}`,
        link: `/tasks/${taskId}`,
        metadata: {
          taskId,
          senderName,
        },
      }))

      await prisma.notification.createMany({
        data: notificationData,
      })
    }
  }

  // ✅ BROADCAST juga ke semua user lain (task diupdate)
  const allUsers = await prisma.user.findMany({
    where: { id: { not: session.user.id } },
    select: { id: true },
  })

  if (allUsers.length > 0) {
    const senderId = session.user.id
    const senderName = session.user.name || "User"

    // Broadcast realtime (skip assignees - already notified above)
    createServerClient().broadcastToAll(senderId, {
      type: "task-updated",
      title: "Task Diperbarui",
      body: `${senderName} memperbarui: ${taskInfo?.title || "Task"}`,
      link: `/tasks/${taskId}`,
      senderId,
      senderName,
      senderImage: session.user.image || null,
      timestamp: new Date().toISOString(),
      metadata: { taskId },
    })

    // Create DB notifications for other users
    const notificationData = allUsers.map((u) => ({
      userId: u.id,
      type: "TASK_STATUS_CHANGED" as const,
      title: "Task Diperbarui",
      body: `${senderName} memperbarui: ${taskInfo?.title || "Task"}`,
      link: `/tasks/${taskId}`,
      metadata: { taskId, senderName },
    }))

    await prisma.notification.createMany({
      data: notificationData,
    })
  }

  // ✅ BROADCAST ke all-tasks page untuk refresh UI
  createServerClient().broadcastToAllTasks(session.user.id, {
    type: "task-updated",
    title: "Task Diperbarui",
    body: `${session.user.name || "User"} memperbarui: ${taskInfo?.title || "Task"}`,
    link: `/tasks/${taskId}`,
    senderId: session.user.id,
    senderName: session.user.name || "User",
    senderImage: session.user.image,
    timestamp: new Date().toISOString(),
    metadata: { taskId },
  })

  return NextResponse.json(task)
}

// DELETE /api/tasks/[taskId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { taskId } = await params

  const task = await prisma.task.findUnique({
    where: { id: taskId },
  })

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  // Delete the task
  await prisma.task.delete({ where: { id: taskId } })

  // BROADCAST to all other users
  const serverClient = createServerClient()
  const senderId = session.user.id
  const senderName = user?.name || "User"
  
  // Global notification
  serverClient.broadcastToAll(senderId, {
    type: "task-deleted",
    title: "Task Dihapus",
    body: `${senderName} menghapus task: ${task.title}`,
    link: "/dashboard/all-tasks",
    senderId,
    senderName,
    senderImage: user?.image,
    timestamp: new Date().toISOString(),
    metadata: {
      deletedTaskId: taskId,
      taskTitle: task.title,
    },
  })
    
  // Refresh all-tasks page
  serverClient.broadcastToAllTasks(senderId, {
    type: "task-deleted",
    title: "Task Dihapus",
    body: `${senderName} menghapus task: ${task.title}`,
    link: "/dashboard/all-tasks",
    senderId,
    senderName,
    senderImage: user?.image,
    timestamp: new Date().toISOString(),
    metadata: {
      deletedTaskId: taskId,
      taskTitle: task.title,
    },
  })

  return NextResponse.json({ success: true })
}
