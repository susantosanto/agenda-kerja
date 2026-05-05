import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateInviteCode } from "@/lib/utils"
import { NextResponse } from "next/server"

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
  const { name, description } = body

  const community = await prisma.community.create({
    data: {
      name,
      description,
      inviteCode: generateInviteCode(),
      ownerId: user.id,
      members: {
        create: {
          userId: user.id,
          role: "OWNER",
        },
      },
    },
    include: {
      owner: { select: { id: true, name: true, email: true, image: true } },
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
        },
      },
    },
  })

  return NextResponse.json(community)
}

export async function GET() {
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

  const memberships = await prisma.communityMember.findMany({
    where: { userId: user.id },
    include: {
      community: {
        include: {
          owner: { select: { id: true, name: true, email: true, image: true } },
          members: {
            include: {
              user: { select: { id: true, name: true, email: true, image: true } },
            },
          },
          _count: { select: { lists: true, labels: true } },
        },
      },
    },
  })

  return NextResponse.json(memberships.map((m) => m.community))
}