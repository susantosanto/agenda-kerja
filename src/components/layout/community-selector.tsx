"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Plus, Users, Settings, ChevronRight, Check } from "lucide-react"

interface Community {
  id: string
  name: string
  description?: string
  color?: string
}

interface CommunitySelectorProps {
  currentCommunityId?: string
}

export function CommunitySelector({ currentCommunityId }: CommunitySelectorProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newCommunityName, setNewCommunityName] = useState("")
  const [newCommunityDesc, setNewCommunityDesc] = useState("")

  const { data: communities, isLoading } = useQuery({
    queryKey: ["communities"],
    queryFn: async () => {
      const res = await fetch("/api/communities")
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
  })

  const createCommunity = useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const res = await fetch("/api/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to create")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communities"] })
      setShowCreateDialog(false)
      setNewCommunityName("")
      setNewCommunityDesc("")
    },
  })

  const handleCreateCommunity = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCommunityName.trim()) return
    createCommunity.mutate({ name: newCommunityName, description: newCommunityDesc })
  }

  const currentCommunity = communities?.find((c: Community) => c.id === currentCommunityId)

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-9 gap-2 px-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-gradient-to-br from-indigo-500 to-purple-600">
              {currentCommunity ? (
                <span className="text-xs text-white font-bold">
                  {currentCommunity.name[0].toUpperCase()}
                </span>
              ) : (
                <Users className="h-3 w-3 text-white" />
              )}
            </div>
            <span className="max-w-[120px] truncate text-sm font-medium">
              {currentCommunity?.name || "Select Community"}
            </span>
            <ChevronRight className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Communities</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {isLoading ? (
            <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
          ) : communities?.length === 0 ? (
            <DropdownMenuItem disabled>No communities yet</DropdownMenuItem>
          ) : (
            communities?.map((community: Community) => (
              <DropdownMenuItem
                key={community.id}
                onClick={() => {
                  router.push(`/dashboard?community=${community.id}`)
                  setOpen(false)
                }}
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-sm mr-2" style={{ backgroundColor: community.color || "#6366f1" }}>
                  <span className="text-xs text-white font-bold">
                    {community.name[0].toUpperCase()}
                  </span>
                </div>
                <span className="flex-1">{community.name}</span>
                {currentCommunityId === community.id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </DropdownMenuItem>
            ))
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Community
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/settings")}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create Community Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Community</DialogTitle>
            <DialogDescription>
              Create a new community to start collaborating with your team.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateCommunity} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={newCommunityName}
                onChange={(e) => setNewCommunityName(e.target.value)}
                placeholder="Community name"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description (optional)</label>
              <Input
                value={newCommunityDesc}
                onChange={(e) => setNewCommunityDesc(e.target.value)}
                placeholder="Brief description"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createCommunity.isPending}>
                {createCommunity.isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
