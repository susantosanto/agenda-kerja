"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { format, formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"
import {
  ArrowLeft,
  Loader2,
  MessageSquare,
  Activity,
  Calendar,
  User,
  Tag,
  Star,
  MoreHorizontal,
  Trash2,
  Edit,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { TaskItem } from "./task-item"
import { SubtaskItem } from "./subtask-item"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

interface TaskDetailProps {
  taskId: string
}

interface Comment {
  id: string
  content: string
  createdAt: Date
  user: {
    id: string
    name: string | null
    image: string | null
  }
}

interface Activity {
  id: string
  type: string
  details: string
  createdAt: Date
  user: {
    id: string
    name: string | null
    image: string | null
  }
}

export function TaskDetail({ taskId }: TaskDetailProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const router = useRouter()

  const [task, setTask] = useState<any>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)
  const [showSubtasks, setShowSubtasks] = useState(true)

  useEffect(() => {
    fetchTask()
    fetchComments()
    fetchActivity()
  }, [taskId])

  const fetchTask = async () => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`)
      if (!res.ok) throw new Error("Task tidak ditemukan")
      const data = await res.json()
      setTask(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat task",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/comments`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setComments(data)
    } catch (error) {
      console.error("Failed to fetch comments:", error)
    }
  }

  const fetchActivity = async () => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/activity`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setActivities(data)
    } catch (error) {
      console.error("Failed to fetch activity:", error)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    setSubmittingComment(true)
    try {
      const res = await fetch(`/api/tasks/${taskId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment.trim() }),
      })
      if (!res.ok) throw new Error("Gagal mengirim komentar")
      setNewComment("")
      fetchComments()
      fetchActivity()
      toast({ title: "Berhasil", description: "Komentar ditambahkan" })
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mengirim komentar",
        variant: "destructive",
      })
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleSubtaskToggle = async (subtaskId: string, completed: boolean) => {
    try {
      const res = await fetch(`/api/subtasks/${subtaskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      })
      if (!res.ok) throw new Error()
      fetchTask()
      fetchActivity()
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mengubah status subtask",
        variant: "destructive",
      })
    }
  }

  const handleSubtaskUpdate = async (subtaskId: string, title: string) => {
    try {
      const res = await fetch(`/api/subtasks/${subtaskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      })
      if (!res.ok) throw new Error()
      fetchTask()
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memperbarui subtask",
        variant: "destructive",
      })
    }
  }

  const handleSubtaskDelete = async (subtaskId: string) => {
    try {
      const res = await fetch(`/api/subtasks/${subtaskId}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error()
      fetchTask()
      fetchActivity()
      toast({ title: "Berhasil", description: "Subtask dihapus" })
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus subtask",
        variant: "destructive",
      })
    }
  }

  const handleSubtaskCreate = async (title: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/subtasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      })
      if (!res.ok) throw new Error()
      fetchTask()
      fetchActivity()
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menambahkan subtask",
        variant: "destructive",
      })
      throw error
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const priorityColors = {
    P1: "bg-red-500 text-white",
    P2: "bg-orange-500 text-white",
    P3: "bg-blue-500 text-white",
    P4: "bg-gray-500 text-white",
  }

  const priorityLabels = {
    P1: "P1 - Tinggi",
    P2: "P2 - Sedang",
    P3: "P3 - Rendah",
    P4: "P4 - Minimal",
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!task) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Task tidak ditemukan</p>
      </div>
    )
  }

  const completedSubtasks = task.subtasks?.filter((s: any) => s.completed).length || 0
  const totalSubtasks = task.subtasks?.length || 0

  return (
    <div className="mx-auto max-w-5xl">
      {/* Back button */}
      <Button
        variant="ghost"
        className="mb-4 gap-2"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Header */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    {task.title}
                  </h1>
                  {task.description && (
                    <p className="mt-2 text-muted-foreground">
                      {task.description}
                    </p>
                  )}
                </div>

                {/* Meta info */}
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <Badge className={priorityColors[task.priority]}>
                    {priorityLabels[task.priority]}
                  </Badge>
                  <Badge variant="outline">
                    {task.status === "TODO"
                      ? "To Do"
                      : task.status === "IN_PROGRESS"
                      ? "In Progress"
                      : "Done"}
                  </Badge>
                  {task.dueDate && (
                    <div
                      className={cn(
                        "flex items-center gap-1",
                        new Date(task.dueDate) < new Date() && task.status !== "DONE"
                          ? "text-destructive font-medium"
                          : ""
                      )}
                    >
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(task.dueDate), "d MMMM yyyy, HH:mm", {
                          locale: id,
                        })}
                      </span>
                    </div>
                  )}
                  {task.startDate && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Mulai:{" "}
                        {format(new Date(task.startDate), "d MMM yyyy, HH:mm", {
                          locale: id,
                        })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Assignees */}
                {task.assignees?.length > 0 && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div className="flex -space-x-2">
                      {task.assignees.map((assignment: any) => (
                        <Avatar
                          key={assignment.user.id}
                          className="h-8 w-8 border-2 border-background"
                          title={assignment.user.name || ""}
                        >
                          <AvatarImage src={assignment.user.image || ""} />
                          <AvatarFallback className="text-xs">
                            {getInitials(assignment.user.name || "U")}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {task.assignees.length} assignee
                    </span>
                  </div>
                )}

                {/* Labels */}
                {task.labels?.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <div className="flex gap-2">
                      {task.labels.map(({ label }: any) => (
                        <Badge
                          key={label.id}
                          variant="outline"
                          style={{
                            borderColor: label.color,
                            color: label.color,
                          }}
                        >
                          {label.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="gap-2">
                    <Star className="h-4 w-4" />
                    {task.starred ? "Unstar" : "Star"}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2">
                    <Edit className="h-4 w-4" />
                    Edit Task
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2 text-destructive">
                    <Trash2 className="h-4 w-4" />
                    Hapus Task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Subtasks */}
          {totalSubtasks > 0 && (
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Subtasks ({completedSubtasks}/{totalSubtasks})
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSubtasks(!showSubtasks)}
                >
                  {showSubtasks ? "Sembunyikan" : "Tampilkan"}
                </Button>
              </div>
              {showSubtasks && (
                <div className="space-y-1">
                  {task.subtasks?.map((subtask: any) => (
                    <SubtaskItem
                      key={subtask.id}
                      subtask={subtask}
                      onToggle={(completed) =>
                        handleSubtaskToggle(subtask.id, completed)
                      }
                      onUpdate={(title) =>
                        handleSubtaskUpdate(subtask.id, title)
                      }
                      onDelete={() => handleSubtaskDelete(subtask.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Comments Section */}
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <MessageSquare className="h-5 w-5" />
              Komentar ({comments.length})
            </h3>

            {/* Comment Form */}
            <div className="mb-4 flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback>
                  {getInitials(session?.user?.name || "U")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="Tulis komentar..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="mb-2 min-h-[80px]"
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={handleAddComment}
                    disabled={submittingComment || !newComment.trim()}
                  >
                    {submittingComment && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Kirim
                  </Button>
                </div>
              </div>
            </div>

            {/* Comments List */}
            <Separator className="my-4" />
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  Belum ada komentar
                </p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.user.image || ""} />
                      <AvatarFallback>
                        {getInitials(comment.user.name || "U")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {comment.user.name || "Anonim"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                            locale: id,
                          })}
                        </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Activity Log */}
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Activity className="h-5 w-5" />
              Aktivitas
            </h3>
            <div className="space-y-3">
              {activities.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  Belum ada aktivitas
                </p>
              ) : (
                activities.map((activity) => (
                  <div key={activity.id} className="flex gap-3 text-sm">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={activity.user.image || ""} />
                      <AvatarFallback className="text-xs">
                        {getInitials(activity.user.name || "U")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <span className="font-medium">
                        {activity.user.name || "Anonim"}
                      </span>{" "}
                      {activity.details}
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.createdAt), {
                          addSuffix: true,
                          locale: id,
                        })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <h3 className="mb-3 font-semibold">Info Cepat</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dibuat</span>
                <span>
                  {format(new Date(task.createdAt), "d MMM yyyy", { locale: id })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Diperbarui</span>
                <span>
                  {format(new Date(task.updatedAt), "d MMM yyyy", { locale: id })}
                </span>
              </div>
              {task.createdBy && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dibuat oleh</span>
                  <span>{task.createdBy.name || "Anonim"}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
