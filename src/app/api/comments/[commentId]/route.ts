import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { commentId } = await params
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { task: { include: { list: { include: { community: { include: { members: true } } } } } } },
  })
  if (!comment) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 })
  }

  // Only the comment author can edit
  if (comment.userId !== user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  const body = await request.json()
  const { content } = body

  if (!content) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 })
  }

  const updatedComment = await prisma.comment.update({
    where: { id: commentId },
    data: { content },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  })

  return NextResponse.json(updatedComment)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { commentId } = await params
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { task: { include: { list: { include: { community: { include: { members: true } } } } } } },
  })
  if (!comment) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 })
  }

  // Only the comment author can delete
  if (comment.userId !== user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  await prisma.comment.delete({ where: { id: commentId } })

  // Create activity for comment deletion
  await prisma.activity.create({
    data: {
      type: "COMMENT_DELETED",
      details: `Comment deleted`,
      taskId: comment.taskId,
      userId: user.id,
    },
  })

  return NextResponse.json({ success: true })
}
