import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { taskId } = await params
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

  const isMember = task.list.community.members.some((m) => m.userId === user.id)
  if (!isMember) {
    return NextResponse.json({ error: "Not a member" }, { status: 403 })
  }

  const body = await request.json()
  const { content } = body

  if (!content) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 })
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      taskId,
      userId: user.id,
    },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  })

  // Create activity for comment
  await prisma.activity.create({
    data: {
      type: "COMMENT_ADDED",
      details: `Commented on task`,
      taskId,
      userId: user.id,
    },
  })

  return NextResponse.json(comment)
}
