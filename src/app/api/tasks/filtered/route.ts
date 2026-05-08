import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { endOfDay, startOfDay, startOfWeek, endOfWeek } from "date-fns"

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filter = searchParams.get("filter") // my-tasks, today, this-week, overdue, starred, high-priority

    const today = new Date()
    const userId = session.user.id

    let whereClause: any = {}

    switch (filter) {
      case "all":
        // No additional where clause - return all tasks in communities user is member of
        break

      case "my-tasks":
        whereClause.assignees = {
          some: { userId },
        }
        break

      case "today":
        whereClause.dueDate = {
          gte: startOfDay(today),
          lte: endOfDay(today),
        }
        break

      case "this-week":
        whereClause.dueDate = {
          gte: startOfWeek(today, { weekStartsOn: 1 }),
          lte: endOfWeek(today, { weekStartsOn: 1 }),
        }
        break

      case "overdue":
        whereClause.dueDate = {
          lt: startOfDay(today),
        }
        whereClause.status = { not: "DONE" }
        break

      case "starred":
        whereClause.isStarred = true
        break

      case "high-priority":
        whereClause.priority = { in: ["P1", "P2"] }
        break

      default:
        return NextResponse.json(
          { message: "Invalid filter" },
          { status: 400 }
        )
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      orderBy: [
        { isStarred: "desc" },
        { priority: "asc" },
        { dueDate: "asc" },
      ],
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
        subtasks: true,
      },
    })

    // Map database fields to frontend field names
    const mappedTasks = tasks.map(task => ({
      ...task,
      starred: task.isStarred,
      subtasks: task.subtasks.map(st => ({
        ...st,
        completed: st.isDone
      }))
    }))

    return NextResponse.json(mappedTasks)
  } catch (error) {
    console.error("Error fetching filtered tasks:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}