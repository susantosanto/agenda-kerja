"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Pin, Archive } from "lucide-react"
import { ListActions } from "./list-actions"
import { useRouter } from "next/navigation"

interface ListCardProps {
  list: {
    id: string
    name: string
    description: string | null
    color: string
    order: number
    archived: boolean
    pinned: boolean
    createdAt: Date
    updatedAt: Date
    _count: {
      tasks: number
    }
  }
  onAction?: () => void
}

export function ListCard({ list, onAction }: ListCardProps) {
  const router = useRouter()
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card
      className="group cursor-pointer transition-shadow hover:shadow-md"
      style={{
        borderLeft: `4px solid ${list.color}`,
      }}
      onClick={() => router.push(`/lists/${list.id}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-semibold">{list.name}</CardTitle>
              {list.pinned && (
                <Pin className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            {list.description && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {list.description}
              </p>
            )}
          </div>
          <ListActions list={list} onAction={onAction || (() => {})} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: list.color }}
            />
            <span className="text-muted-foreground">
              {list._count.tasks} tugas
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            Diperbarui:{" "}
            {format(new Date(list.updatedAt), "d MMM", { locale: id })}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
