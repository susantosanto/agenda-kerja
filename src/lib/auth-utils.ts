import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function currentUser() {
  const session = await auth()
  if (!session?.user?.email) return null

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })
  return user
}

export async function requireAuth() {
  const user = await currentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return user
}

export async function getUserCommunities(userId: string) {
  const memberships = await prisma.communityMember.findMany({
    where: { userId },
    include: {
      community: {
        include: {
          owner: { select: { id: true, name: true, email: true, image: true } },
          members: {
            include: {
              user: { select: { id: true, name: true, email: true, image: true } },
            },
          },
          _count: { select: { lists: true } },
        },
      },
    },
  })
  return memberships.map((m) => m.community)
}

export async function getCommunityWithMembers(communityId: string, userId: string) {
  const membership = await prisma.communityMember.findUnique({
    where: {
      userId_communityId: { userId, communityId },
    },
  })
  if (!membership) return null

  const community = await prisma.community.findUnique({
    where: { id: communityId },
    include: {
      owner: { select: { id: true, name: true, email: true, image: true } },
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
        },
      },
      lists: {
        where: { isArchived: false },
        orderBy: [{ isPinned: "desc" }, { order: "asc" }],
        include: {
          _count: { select: { tasks: true } },
        },
      },
    },
  })
  return community
}