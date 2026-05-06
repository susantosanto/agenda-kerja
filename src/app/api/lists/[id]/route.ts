import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const list = await prisma.list.findUnique({
    where: { id },
    include: { community: { include: { members: true } } },
  })
  if (!list) {
    return NextResponse.json({ error: "List not found" }, { status: 404 })
  }

  const isMember = list.community.members.some((m) => m.userId === user.id)
  if (!isMember) {
    return NextResponse.json({ error: "Not a member" }, { status: 403 })
  }

  const body = await request.json()
  const { name, description, color, isArchived, isPinned } = body

  const updates: Record<string, unknown> = {}
  if (name !== undefined) updates.name = name
  if (description !== undefined) updates.description = description
  if (color !== undefined) updates.color = color
  if (isArchived !== undefined) updates.isArchived = isArchived
  if (isPinned !== undefined) updates.isPinned = isPinned

  const updatedList = await prisma.list.update({
    where: { id },
    data: updates,
    include: {
      _count: { select: { tasks: true } },
    },
  })

  return NextResponse.json(updatedList)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const list = await prisma.list.findUnique({
    where: { id },
    include: { community: { include: { members: true } } },
  })
  if (!list) {
    return NextResponse.json({ error: "List not found" }, { status: 404 })
  }

  const isOwner = list.community.ownerId === user.id
  const isMember = list.community.members.some((m) => m.userId === user.id)
  if (!isMember) {
    return NextResponse.json({ error: "Not a member" }, { status: 403 })
  }

  // Only owner can delete lists
  if (!isOwner) {
    return NextResponse.json({ error: "Only owner can delete lists" }, { status: 403 })
  }

  await prisma.list.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
