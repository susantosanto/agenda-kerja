import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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
        task: {
          include: {
            list: {
              include: {
                community: {
                  include: { members: true },
                },
              },
            },
          },
        },
      },
    })

    if (!subtask) {
      return NextResponse.json({ error: "Subtask tidak ditemukan" }, { status: 404 })
    }

    // Check membership
    const isMember = subtask.task.list?.community?.members?.some(
      (m) => m.userId === session.user.id
    ) ?? true
    if (!isMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const updated = await prisma.subtask.update({
      where: { id: subtaskId },
      data: {
        ...(title !== undefined && { title }),
        ...(completed !== undefined && { isDone: completed }),
      },
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
      include: {
        task: {
          include: {
            list: {
              include: {
                community: {
                  include: { members: true },
                },
              },
            },
          },
        },
      },
    })

    if (!subtask) {
      return NextResponse.json({ error: "Subtask tidak ditemukan" }, { status: 404 })
    }

    // Check membership
    const isMemberDelete = subtask.task.list?.community?.members?.some(
      (m) => m.userId === session.user.id
    ) ?? true
    if (!isMemberDelete) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.subtask.delete({
      where: { id: subtaskId },
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
