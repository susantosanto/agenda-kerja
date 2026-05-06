"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Crown, Settings, Users } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface CommunityHeaderProps {
  community: {
    id: string
    name: string
    description: string | null
    inviteCode: string
    ownerId: string
    createdAt: Date
    updatedAt: Date
  }
  isOwner: boolean
}

export function CommunityHeader({ community, isOwner }: CommunityHeaderProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{community.name}</h1>
            {isOwner && (
              <Badge variant="secondary" className="gap-1">
                <Crown className="h-3 w-3" />
                Owner
              </Badge>
            )}
          </div>
          {community.description && (
            <p className="text-muted-foreground">{community.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Kode undangan: {community.inviteCode}</span>
            </div>
            <div>
              Dibuat:{" "}
              {format(new Date(community.createdAt), "d MMMM yyyy", { locale: id })}
            </div>
          </div>
        </div>
        {isOwner && (
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="h-4 w-4" />
            Pengaturan Community
          </Button>
        )}
      </div>
    </div>
  )
}
