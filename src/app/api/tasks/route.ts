import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/realtime"

export async function GET(request: Request) {
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

  const tasks = await prisma.task.findMany({
    include: {
      createdBy: { select: { id: true, name: true, email: true, image: true } },
      assignees: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
      subtasks: { orderBy: { order: "asc" } },
      labels: { include: { label: true } },
      comments: {
        include: { user: { select: { id: true, name: true, email: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 3,
      },
    },
    orderBy: [
      { isStarred: "desc" },
      { priority: "asc" },
      { order: "asc" },
    ],
  })

  // Map fields for frontend compatibility
  const mappedTasks = tasks.map(task => ({
    ...task,
    starred: task.isStarred,
    subtasks: task.subtasks.map(st => ({
      ...st,
      completed: st.isDone
    }))
  }))

  return NextResponse.json(mappedTasks)
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

  const body = await request.json()
  const { title, description, status, priority, startDate, dueDate, duration, isStarred, starred, assigneeIds, labelIds } = body

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 })
  }

  const lastTask = await prisma.task.findFirst({
    orderBy: { order: "desc" },
  })
  const order = (lastTask?.order || 0) + 1

  const task = await prisma.task.create({
    data: {
      title,
      description,
      status: status || "TODO",
      priority: priority || "P3",
      startDate: startDate ? new Date(startDate) : null,
      dueDate: dueDate ? new Date(dueDate) : null,
      duration,
      isStarred: isStarred || starred || false,
      order,
      createdById: user.id,
      assignees: assigneeIds?.length
        ? { create: assigneeIds.map((id: string) => ({ userId: id })) }
        : undefined,
      labels: labelIds?.length
        ? { create: labelIds.map((id: string) => ({ labelId: id })) }
        : undefined,
    },
    include: {
      createdBy: { select: { id: true, name: true, email: true, image: true } },
      assignees: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
      subtasks: { orderBy: { order: "asc" } },
      labels: { include: { label: true } },
    },
  })

  await prisma.activity.create({
    data: {
      type: "TASK_CREATED",
      details: `Task "${title}" created`,
      taskId: task.id,
      userId: user.id,
    },
  })

  // ✅ BROADCAST new task to ALL users EXCEPT sender (global notifications)
  const serverClient = createServerClient()
  serverClient.broadcastToAll(user.id, {
    type: "task-created",
    title: "Task Baru",
    body: `${user.name} membuat task baru: ${title}`,
    link: `/tasks/${task.id}`,
    senderId: user.id,
    senderName: user.name,
    senderImage: user.image,
    timestamp: new Date().toISOString(),
    metadata: {
      taskId: task.id,
    },
  })

  // ✅ BROADCAST to global tasks list channel (for users viewing all tasks)
  serverClient.broadcastToAllTasks(user.id, {
    type: "task-created",
    title: "Task Baru",
    body: `${user.name} membuat task baru: ${title}`,
    link: `/tasks/${task.id}`,
    senderId: user.id,
    senderName: user.name,
    senderImage: user.image,
    timestamp: new Date().toISOString(),
    metadata: {
      taskId: task.id,
    },
  })

  return NextResponse.json(task)
}
