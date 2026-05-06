import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const communityId = searchParams.get("communityId")
  const listId = searchParams.get("listId")

  if (!communityId && !listId) {
    return NextResponse.json({ error: "Missing communityId or listId" }, { status: 400 })
  }

  let where = {}
  if (listId) where = { id: listId }
  else if (communityId) where = { communityId }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const isMember = await prisma.communityMember.findFirst({
    where: { userId: user.id, community: { id: communityId || undefined } },
  })
  if (!isMember) {
    return NextResponse.json({ error: "Not a member" }, { status: 403 })
  }

  const tasks = await prisma.task.findMany({
    where: {
      list: where,
    },
    include: {
      createdBy: { select: { id: true, name: true, email: true, image: true } },
      assignees: { include: { user: { select: { id: true, name: true, email: true, image: true } } },
      subtasks: { orderBy: { order: "asc" } },
      labels: { include: { label: true } },
      comments: {
        include: { user: { select: { id: true, name: true, image: true } } },
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

  return NextResponse.json(tasks)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const body = await request.json()
  const { title, description, listId, status, priority, startDate, dueDate, duration, assigneeIds, labelIds } = body

  if (!title || !listId) {
    return NextResponse.json({ error: "Title and listId are required" }, { status: 400 })
  }

  const list = await prisma.list.findUnique({
    where: { id: listId },
    include: { community: { include: { members: true } } },
  })
  if (!list) {
    return NextResponse.json({ error: "List not found" }, { status: 404 })
  }

  const member = list.community.members.find((m) => m.userId === user.id)
  if (!member) {
    return NextResponse.json({ error: "Not a member" }, { status: 403 })
  }

  const lastTask = await prisma.task.findFirst({
    where: { listId },
    orderBy: { order: "desc" },
  })
  const order = (lastTask?.order || 0) + 1

  const task = await prisma.task.create({
    data: {
      title,
      description,
      listId,
      status: status || "TODO",
      priority: priority || "P3",
      startDate: startDate ? new Date(startDate) : null,
      dueDate: dueDate ? new Date(dueDate) : null,
      duration,
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
      assignees: { include: { user: { select: { id: true, name: true, email: true, image: true } } },
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

  return NextResponse.json(task)
}

// No PATCH/DELETE here - they are in [taskId]/route.ts

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const body = await request.json()
  const { id, title, description, status, priority, startDate, dueDate, duration, isStarred, assigneeIds, labelIds } = body

  if (!id) {
    return NextResponse.json({ error: "Task ID is required" }, { status: 400 })
  }

  const existingTask = await prisma.task.findUnique({
    where: { id },
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
    // Delete existing assignees and create new ones
    await prisma.taskAssignee.deleteMany({ where: { taskId: id } })
    if (assigneeIds.length > 0) {
      updates.assignees = {
        create: assigneeIds.map((userId: string) => ({ userId })),
      }
    }
  }

  // Handle labels
  if (labelIds !== undefined) {
    // Delete existing labels and create new ones
    await prisma.taskLabel.deleteMany({ where: { taskId: id } })
    if (labelIds.length > 0) {
      updates.labels = {
        create: labelIds.map((labelId: string) => ({ labelId })),
      }
    }
  }

  const task = await prisma.task.update({
    where: { id },
    data: updates,
    include: {
      createdBy: { select: { id: true, name: true, email: true, image: true } },
      assignees: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
      subtasks: { orderBy: { order: "asc" } },
      labels: { include: { label: true } },
    },
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

  const task = await prisma.task.update({
    where: { id },
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
      taskId: task.id,
      userId: user.id,
    },
  })

  return NextResponse.json(task)
}

export async function DELETE(request: Request) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "Task ID is required" }, { status: 400 })
  }

  await prisma.task.delete({ where: { id } })

  return NextResponse.json({ success: true })
}