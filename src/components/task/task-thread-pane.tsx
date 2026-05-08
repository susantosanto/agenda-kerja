"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TaskThreadPaneProps {
  isOpen: boolean
  onClose: () => void
  taskId?: string
}

export function TaskThreadPane({ isOpen, onClose, taskId }: TaskThreadPaneProps) {
  if (!isOpen) return null

  return (
    <div className="flex flex-col h-full border-l bg-card">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <CardTitle className="text-lg">Task Details</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {taskId ? (
            <>
              {/* Task Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Task Title Here</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Task description and details would go here...
                  </p>
                </CardContent>
              </Card>

              {/* Thread/Comments */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Thread</h4>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                      U
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">This is a comment in the thread.</p>
                      <p className="text-xs text-muted-foreground">2 min ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Select a task to view details</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
