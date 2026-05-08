import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const notes = await prisma.note.findMany({
      where: { userId: session.user.id },
      orderBy: [
        { isPinned: "desc" },
        { updatedAt: "desc" }
      ]
    })
    return NextResponse.json(notes)
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { title, content, color } = await request.json()
    const note = await prisma.note.create({
      data: {
        title,
        content,
        color,
        userId: session.user.id
      }
    })
    return NextResponse.json(note)
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
