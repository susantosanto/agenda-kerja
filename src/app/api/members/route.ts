import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET /api/members?communityId=
export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const communityId = searchParams.get("communityId")

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  // If communityId provided, verify membership
  if (communityId) {
    const isMember = await prisma.communityMember.findFirst({
      where: { userId: user.id, communityId },
    })
    if (!isMember) {
      return NextResponse.json({ error: "Not a member" }, { status: 403 })
    }

    // Return members of that community
    const members = await prisma.communityMember.findMany({
      where: { communityId },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    })

    return NextResponse.json(
      members.map((m) => m.user)
    )
  }

  // Without communityId, return all users (or could be all members of all communities user belongs to)
  const memberships = await prisma.communityMember.findMany({
    where: { userId: user.id },
    include: {
      community: {
        include: {
          members: {
            include: { user: { select: { id: true, name: true, email: true, image: true } } },
          },
        },
      },
    },
  })

  // Collect all unique users from all communities
  const userSet = new Set<string>()
  const result: Array<{ id: string; name: string | null; email: string | null; image: string | null }> = []

  for (const membership of memberships) {
    for (const member of membership.community.members) {
      if (!userSet.has(member.user.id)) {
        userSet.add(member.user.id)
        result.push(member.user)
      }
    }
  }

  return NextResponse.json(result)
}
