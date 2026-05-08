import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function POST() {
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // NextAuth handles sign out via its own API
  // This endpoint is for custom sign out logic if needed
  return NextResponse.json({ success: true })
}
