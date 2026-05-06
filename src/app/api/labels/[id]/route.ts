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

  const label = await prisma.label.findUnique({
    where: { id },
    include: { community: { include: { members: true } } },
  })
  if (!label) {
    return NextResponse.json({ error: "Label not found" }, { status: 404 })
  }

  const isMember = label.community.members.some((m) => m.userId === user.id)
  if (!isMember) {
    return NextResponse.json({ error: "Not a member" }, { status: 403 })
  }

  const body = await request.json()
  const { name, color } = body

  const updates: Record<string, unknown> = {}
  if (name !== undefined) updates.name = name
  if (color !== undefined) updates.color = color

  const updatedLabel = await prisma.label.update({
    where: { id },
    data: updates,
  })

  return NextResponse.json(updatedLabel)
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

  const label = await prisma.label.findUnique({
    where: { id },
    include: { community: { include: { members: true } } },
  })
  if (!label) {
    return NextResponse.json({ error: "Label not found" }, { status: 404 })
  }

  const isMember = label.community.members.some((m) => m.userId === user.id)
  if (!isMember) {
    return NextResponse.json({ error: "Not a member" }, { status: 403 })
  }

  await prisma.label.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
