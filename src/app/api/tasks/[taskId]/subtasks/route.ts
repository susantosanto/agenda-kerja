import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

// POST /api/tasks/[taskId]/subtasks
export async function POST(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const taskId = params.taskId
  const body = await request.json()
  const { title } = body

  if (!title || typeof title !== "string") {
    return NextResponse.json(
      { error: "Judul subtask wajib diisi" },
      { status: 400 }
    )
  }

  try {
    // Verify task exists and user has access
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
      },
    })

    if (!task) {
      return NextResponse.json({ error: "Task tidak ditemukan" }, { status: 404 })
    }

    // Check membership
    const isMember = task.list.community.members.some(
      (m) => m.userId === session.user.id
    )
    if (!isMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const subtask = await prisma.subtask.create({
      data: {
        title,
        taskId,
      },
    })

    return NextResponse.json(subtask, { status: 201 })
  } catch (error) {
    console.error("Error creating subtask:", error)
    return NextResponse.json(
      { error: "Gagal membuat subtask" },
      { status: 500 }
    )
  }
}
