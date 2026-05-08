import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

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

  const existingTask = await prisma.task.findUnique({
    where: { id: taskId },
  })
  if (!existingTask) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 })
  }

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

  // Handle assignees
  if (assigneeIds !== undefined) {
    await prisma.taskAssignee.deleteMany({ where: { taskId } })
    if (assigneeIds.length > 0) {
      updates.assignees = {
        create: assigneeIds.map((userId: string) => ({ userId })),
      }
    }
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

  await prisma.task.delete({ where: { id: taskId } })

  return NextResponse.json({ success: true })
}
