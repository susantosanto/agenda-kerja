"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Crown, User } from "lucide-react"

interface CommunityMembersProps {
  members: Array<{
    user: {
      id: string
      name: string | null
      email: string | null
      image: string | null
    }
    role: "OWNER" | "ADMIN" | "MEMBER"
  }>
}

export function CommunityMembers({ members }: CommunityMembersProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "OWNER":
        return (
          <Badge variant="default" className="gap-1 bg-yellow-500 hover:bg-yellow-600">
            <Crown className="h-3 w-3" />
            Owner
          </Badge>
        )
      case "ADMIN":
        return (
          <Badge variant="secondary" className="gap-1">
            <User className="h-3 w-3" />
            Admin
          </Badge>
        )
      default:
        return <Badge variant="outline">Member</Badge>
    }
  }

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Anggota ({members.length})</h3>
      </div>
      <div className="space-y-3">
        {members.map((member) => (
          <div
            key={member.user.id}
            className="flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={member.user.image || ""} />
                <AvatarFallback className="text-xs">
                  {getInitials(member.user.name || "U")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">
                  {member.user.name || "Tanpa nama"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {member.user.email || "Tanpa email"}
                </p>
              </div>
            </div>
            {getRoleBadge(member.role)}
          </div>
        ))}
      </div>
    </div>
  )
}
