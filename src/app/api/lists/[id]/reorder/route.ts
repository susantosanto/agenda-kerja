import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(
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

  // Only owner can reorder lists
  if (!isOwner) {
    return NextResponse.json({ error: "Only owner can reorder lists" }, { status: 403 })
  }

  const body = await request.json()
  const { newOrder } = body

  if (typeof newOrder !== "number") {
    return NextResponse.json({ error: "newOrder is required" }, { status: 400 })
  }

  // Update the list order
  await prisma.list.update({
    where: { id },
    data: { order: newOrder },
  })

  // Reorder all lists in the community
  const allLists = await prisma.list.findMany({
    where: { communityId: list.communityId },
    orderBy: { order: "asc" },
  })

  // Renumber all lists based on new order
  for (let i = 0; i < allLists.length; i++) {
    await prisma.list.update({
      where: { id: allLists[i].id },
      data: { order: i },
    })
  }

  return NextResponse.json({ success: true })
}
