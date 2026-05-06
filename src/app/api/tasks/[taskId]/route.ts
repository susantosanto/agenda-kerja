import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET /api/tasks/[taskId]
export async function GET(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const taskId = params.taskId

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      list: {
        include: {
          community: {
            include: { members: true },
          },
        },
      },
      createdBy: { select: { id: true, name: true, email: true, image: true } },
      assignees: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
      subtasks: { orderBy: { order: "asc" } },
      labels: { include: { label: true } },
      comments: {
        include: { user: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  })

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 })
  }

  // Check membership
  const isMember = task.list.community.members.some(
    (m) => m.userId === user.id
  )
  if (!isMember) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  return NextResponse.json(task)
}

// PATCH /api/tasks/[taskId]
export async function PATCH(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const taskId = params.taskId
  const body = await request.json()
  const { title, description, status, priority, startDate, dueDate, duration, isStarred, assigneeIds, labelIds } = body

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const existingTask = await prisma.task.findUnique({
    where: { id: taskId },
    include: { list: { include: { community: true } } },
  })
  if (!existingTask) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 })
  }

  // Verify membership
  const member = await prisma.communityMember.findFirst({
    where: {
      userId: user.id,
      communityId: existingTask.list.communityId,
    },
  })
  if (!member) {
    return NextResponse.json({ error: "Not a member" }, { status: 403 })
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

  await prisma.activity.create({
    data: {
      type: "TASK_UPDATED",
      details: `Task updated`,
      taskId,
      userId: user.id,
    },
  })

  return NextResponse.json(task)
}

// DELETE /api/tasks/[taskId]
export async function DELETE(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const taskId = params.taskId

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { list: { include: { community: { include: { members: true } } } } },
  })

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 })
  }

  // Check membership (any member can delete for now)
  const isMember = task.list.community.members.some(
    (m) => m.userId === user.id
  )
  if (!isMember) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await prisma.task.delete({ where: { id: taskId } })

  return NextResponse.json({ success: true })
}
