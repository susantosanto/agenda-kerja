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
  const { content } = body

  if (!content?.trim()) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 })
  }

  const comment = await prisma.comment.create({
    data: {
      content: content.trim(),
      taskId,
      userId: session.user.id,
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  })

  await prisma.activity.create({
    data: {
      type: "COMMENT_ADDED",
      details: "mengomentari task ini",
      taskId,
      userId: session.user.id,
    },
  })

  createServerClient().broadcast("comment-added", {
    taskId,
    comment,
  })

  return NextResponse.json(comment, { status: 201 })
}