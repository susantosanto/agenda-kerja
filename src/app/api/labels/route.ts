import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const communityId = searchParams.get("communityId")

  if (!communityId) {
    return NextResponse.json({ error: "Missing communityId" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const isMember = await prisma.communityMember.findFirst({
    where: { userId: user.id, communityId },
  })
  if (!isMember) {
    return NextResponse.json({ error: "Not a member" }, { status: 403 })
  }

  const labels = await prisma.label.findMany({
    where: { communityId },
    orderBy: { name: "asc" },
  })

  return NextResponse.json(labels)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const body = await request.json()
  const { name, color, communityId } = body

  if (!name || !communityId) {
    return NextResponse.json({ error: "Name and communityId are required" }, { status: 400 })
  }

  const community = await prisma.community.findUnique({
    where: { id: communityId },
    include: { members: true },
  })
  if (!community) {
    return NextResponse.json({ error: "Community not found" }, { status: 404 })
  }

  const isMember = community.members.some((m) => m.userId === user.id)
  if (!isMember) {
    return NextResponse.json({ error: "Not a member" }, { status: 403 })
  }

  const label = await prisma.label.create({
    data: {
      name,
      color,
      communityId,
    },
  })

  return NextResponse.json(label)
}
