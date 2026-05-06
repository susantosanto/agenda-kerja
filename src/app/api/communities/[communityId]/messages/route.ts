import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET /api/communities/[communityId]/messages
export async function GET(
  request: Request,
  { params }: { params: { communityId: string } }
) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const communityId = params.communityId

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  // Verify membership
  const isMember = await prisma.communityMember.findFirst({
    where: { userId: user.id, communityId },
  })
  if (!isMember) {
    return NextResponse.json({ error: "Not a member" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get("limit") || "50")
  const before = searchParams.get("before") // timestamp untuk pagination

  const where: any = { communityId }
  if (before) {
    where.createdAt = { lt: new Date(parseInt(before)) }
  }

  const messages = await prisma.chatMessage.findMany({
    where,
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit + 1, // +1 untuk cek apakah ada more
  })

  const hasMore = messages.length > limit
  const data = hasMore ? messages.slice(0, -1) : messages

  return NextResponse.json({
    messages: data.reverse(), // oldest first for display
    hasMore,
    nextCursor: hasMore ? data[data.length - 1]?.createdAt.getTime() : null,
  })
}

// POST /api/communities/[communityId]/messages
export async function POST(
  request: Request,
  { params }: { params: { communityId: string } }
) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const communityId = params.communityId
  const body = await request.json()
  const { content } = body

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json(
      { error: "Content is required" },
      { status: 400 }
    )
  }

  if (content.length > 2000) {
    return NextResponse.json(
      { error: "Message too long (max 2000 characters)" },
      { status: 400 }
    )
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  // Verify membership
  const isMember = await prisma.communityMember.findFirst({
    where: { userId: user.id, communityId },
  })
  if (!isMember) {
    return NextResponse.json({ error: "Not a member" }, { status: 403 })
  }

  const message = await prisma.chatMessage.create({
    data: {
      content: content.trim(),
      communityId,
      userId: user.id,
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true },
      },
    },
  })

  // Could trigger WebSocket broadcast here in future

  return NextResponse.json(message, { status: 201 })
}
