import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ listId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { listId } = await params

    // Check membership
    const list = await prisma.list.findUnique({
      where: { id: listId },
      include: {
        community: {
          include: {
            members: {
              where: { userId: session.user.id },
            },
          },
        },
      },
    })

    if (!list) {
      return NextResponse.json({ message: "List not found" }, { status: 404 })
    }

    if (list.community.members.length === 0) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 })
    }

    // Fetch tasks for this list
    const tasks = await prisma.task.findMany({
      where: { listId },
      orderBy: { order: "asc" },
      include: {
        assignees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        labels: {
          include: {
            label: true,
          },
        },
        subtasks: {
          orderBy: { order: "asc" },
        },
      },
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}