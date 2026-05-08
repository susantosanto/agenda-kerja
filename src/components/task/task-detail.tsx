"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
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
  CheckCircle2,
  Circle,
  Plus,
  Bell,
  BellOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { SubtaskItem } from "./subtask-item"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { SkeletonLoader } from "@/components/ui/premium-loader"
import { ClipboardImage } from "@/components/ui/clipboard-image"
import { createRealtimeClient, requestNotificationPermission, playNotificationSound, showBrowserNotification } from "@/lib/realtime"

interface TaskDetailProps {
  taskId: string
}

type CommentType = {
  id: string
  content: string
  imageUrl?: string | null
  createdAt: string
  user: { id: string; name: string | null; image: string | null }
}

interface ImageAttachment {
  id: string
  url: string
  preview: string
}

type ActivityType = {
  id: string
  type: string
  details: string
  createdAt: string
  user: { id: string; name: string | null; image: string | null }
}

const priorityConfig = {
  P1: {
    label: "Kritis",
    bg: "bg-red-500/10 text-red-500 border-red-500/20",
    glow: "shadow-red-500/20",
    icon: "🔥",
  },
  P2: {
    label: "Tinggi",
    bg: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    glow: "shadow-orange-500/20",
    icon: "⚡",
  },
  P3: {
    label: "Medium",
    bg: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    glow: "shadow-blue-500/20",
    icon: "📋",
  },
  P4: {
    label: "Rendah",
    bg: "bg-slate-500/10 text-slate-500 border-slate-500/20",
    glow: "shadow-slate-500/20",
    icon: "📌",
  },
}

const statusConfig = {
  TODO: { label: "Belum Dimulai", bg: "bg-slate-500/10 text-slate-500 border-slate-500/20" },
  IN_PROGRESS: { label: "Sedang Dikerjakan", bg: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  DONE: { label: "Selesai", bg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
}

export function TaskDetail({ taskId }: TaskDetailProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const router = useRouter()
  const queryClient = useQueryClient()

  const [showSubtasks, setShowSubtasks] = useState(true)
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("")
  const [addingSubtask, setAddingSubtask] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [attachedImages, setAttachedImages] = useState<ImageAttachment[]>([])
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const realtimeRef = useRef<ReturnType<typeof createRealtimeClient> | null>(null)

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission()
  }, [])

  // Set up real-time connection - delay slightly to not block initial render
  useEffect(() => {
    if (!taskId) return

    // Small delay to not block initial render
    const connectTimer = setTimeout(() => {
      const realtimeClient = createRealtimeClient()
      realtimeRef.current = realtimeClient

      realtimeClient.connect(taskId, {
        onCommentAdded: (comment) => {
          // Don't add if it's our own comment (already added optimistically)
          if (comment.user.id === session?.user?.id) return

          // Add comment to list
          queryClient.setQueryData<CommentType[]>(["task-comments", taskId], (old) => {
            if (!old) return [comment]
            // Check if already exists
            if (old.some((c) => c.id === comment.id)) return old
            return [...old, comment]
          })

          // Show notification
          if (notificationsEnabled) {
            playNotificationSound("comment")
            showBrowserNotification(
              "Komentar Baru",
              `${comment.user.name} mengomentari task`,
              taskId
            )
          }

          toast({
            title: "Komentar Baru",
            description: `${comment.user.name} mengomentari task ini`,
          })
        },
        onError: () => {
          // Silently fail - will reconnect on next page load
        },
      })
    }, 500) // 500ms delay

    return () => {
      clearTimeout(connectTimer)
      if (realtimeRef.current) {
        realtimeRef.current.disconnect(taskId)
      }
    }
  }, [taskId, session?.user?.id, notificationsEnabled])

  const { data: task, isLoading: taskLoading, refetch: refetchTask } = useQuery({
    queryKey: ["task", taskId],
    queryFn: async () => {
      const res = await fetch(`/api/tasks/${taskId}`)
      if (!res.ok) throw new Error("Task tidak ditemukan")
      return res.json()
    },
    enabled: !!taskId,
    staleTime: 5 * 60 * 1000, // 5 min cache
    gcTime: 10 * 60 * 1000, // 10 min garbage collection
    placeholderData: (previousData) => previousData, // Keep old data while fetching
  })

  const { data: comments = [], refetch: refetchComments } = useQuery<CommentType[]>({
    queryKey: ["task-comments", taskId],
    queryFn: async () => {
      const res = await fetch(`/api/tasks/${taskId}/comments`)
      if (!res.ok) throw new Error()
      return res.json()
    },
    enabled: !!taskId,
    staleTime: 5 * 60 * 1000, // 5 min cache
    gcTime: 10 * 60 * 1000,
    placeholderData: (previousData) => previousData ?? [],
  })

  const { data: activities = [] } = useQuery<ActivityType[]>({
    queryKey: ["task-activity", taskId],
    queryFn: async () => {
      const res = await fetch(`/api/tasks/${taskId}/activity`)
      if (!res.ok) throw new Error()
      return res.json()
    },
    enabled: !!taskId,
    staleTime: 5 * 60 * 1000, // 5 min cache
    gcTime: 10 * 60 * 1000,
    placeholderData: (previousData) => previousData ?? [],
  })

  // Toggle star mutation
  const toggleStarMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ starred: !task?.starred }),
      })
      if (!res.ok) throw new Error()
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] })
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      queryClient.invalidateQueries({ queryKey: ["all-tasks-view"] })
    },
  })

  // Add comment mutation with optimistic update
  const addCommentMutation = useMutation({
    mutationFn: async ({ content, imageUrl }: { content: string; imageUrl?: string }) => {
      const res = await fetch(`/api/tasks/${taskId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, imageUrl }),
      })
      if (!res.ok) throw new Error()
      return res.json()
    },
    onMutate: async ({ content, imageUrl }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["task-comments", taskId] })

      // Snapshot previous value
      const previousComments = queryClient.getQueryData<CommentType[]>(["task-comments", taskId])

      // Optimistically add comment
      const optimisticComment: CommentType = {
        id: `temp-${Date.now()}`,
        content,
        imageUrl,
        createdAt: new Date().toISOString(),
        user: {
          id: session?.user?.id || "",
          name: session?.user?.name || "Anda",
          image: session?.user?.image || null,
        },
      }

      queryClient.setQueryData<CommentType[]>(["task-comments", taskId], (old) => 
        old ? [...old, optimisticComment] : [optimisticComment]
      )

      setNewComment("")
      setAttachedImages([])

      return { previousComments }
    },
    onError: (_err, _vars, context) => {
      // Rollback on error
      if (context?.previousComments) {
        queryClient.setQueryData(["task-comments", taskId], context.previousComments)
      }
      toast({ title: "Error", description: "Gagal mengirim komentar", variant: "destructive" })
    },
    onSettled: () => {
      // Always refetch to ensure data is sync
      queryClient.invalidateQueries({ queryKey: ["task-comments", taskId] })
      queryClient.invalidateQueries({ queryKey: ["task-activity", taskId] })
    },
  })

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-comments", taskId] })
      queryClient.invalidateQueries({ queryKey: ["task-activity", taskId] })
    },
    onError: () => {
      toast({ title: "Error", description: "Gagal menghapus komentar", variant: "destructive" })
    },
  })

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      return res.json()
    },
    onSuccess: () => {
      toast({ title: "Berhasil", description: "Task dihapus" })
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      queryClient.invalidateQueries({ queryKey: ["all-tasks-view"] })
      router.back()
    },
    onError: () => {
      toast({ title: "Error", description: "Gagal menghapus task", variant: "destructive" })
    },
  })

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (taskLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="h-10 w-32 bg-muted rounded-lg animate-pulse" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
              <SkeletonLoader className="w-3/4 h-8" />
              <SkeletonLoader className="w-full h-4" />
              <div className="flex gap-2 pt-4">
                <div className="h-7 w-24 bg-muted rounded-full animate-pulse" />
                <div className="h-7 w-24 bg-muted rounded-full animate-pulse" />
              </div>
            </div>
          </div>
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <SkeletonLoader />
          </div>
        </div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Task tidak ditemukan</p>
      </div>
    )
  }

  const completedSubtasks = task.subtasks?.filter((s: any) => s.completed).length || 0
  const totalSubtasks = task.subtasks?.length || 0
  const progress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0
  const priority = priorityConfig[task.priority as keyof typeof priorityConfig]
  const status = statusConfig[task.status as keyof typeof statusConfig]
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE"

  return (
    <div className="mx-auto max-w-5xl">
      {/* Premium Header */}
      <div className="flex items-center justify-between mb-8">
        <Button
          variant="ghost"
          className="gap-2 hover:bg-muted/50 rounded-xl"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
        
        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "rounded-xl hover:bg-muted/50",
              notificationsEnabled && "text-primary"
            )}
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            title={notificationsEnabled ? "Matikan notifikasi" : "Aktifkan notifikasi"}
          >
            {notificationsEnabled ? (
              <Bell className="h-5 w-5" />
            ) : (
              <BellOff className="h-5 w-5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl hover:bg-muted/50"
            onClick={() => toggleStarMutation.mutate()}
          >
            <Star
              className={cn(
                "h-5 w-5 transition-all",
                task.starred
                  ? "fill-amber-400 text-amber-400 scale-110"
                  : "text-muted-foreground"
              )}
            />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-xl hover:bg-muted/50">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border-border shadow-xl p-1.5 w-48">
              <DropdownMenuItem className="rounded-lg gap-2 text-sm font-medium cursor-pointer">
                <Edit className="h-4 w-4" />
                Edit Task
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem
                onClick={() => deleteTaskMutation.mutate()}
                className="rounded-lg gap-2 text-sm font-medium text-destructive cursor-pointer focus:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Hapus Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Header Card */}
          <div className="rounded-2xl border bg-card/80 backdrop-blur-sm p-8 shadow-sm relative overflow-hidden">
            {/* Glow Effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 space-y-6">
              {/* Badges Row */}
              <div className="flex flex-wrap items-center gap-3">
                <Badge className={cn("px-3 py-1 rounded-lg text-xs font-bold border", priority.bg, priority.glow)}>
                  {priority.icon} {priority.label}
                </Badge>
                <Badge className={cn("px-3 py-1 rounded-lg text-xs font-bold border", status.bg)}>
                  {status.label}
                </Badge>
                {task.starred && (
                  <Badge className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-500 border-amber-500/20">
                    ⭐ Di starred
                  </Badge>
                )}
                {isOverdue && (
                  <Badge className="px-3 py-1 rounded-lg text-xs font-bold bg-red-500/10 text-red-500 border-red-500/20">
                    ⚠️ Terlambat
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl font-black tracking-tight text-foreground leading-tight">
                {task.title}
              </h1>

              {/* Description */}
              {task.description && (
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {task.description}
                </p>
              )}

              {/* Dates Info */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                {task.startDate && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/50 border border-border/50 text-sm">
                    <Calendar className="h-4 w-4 text-emerald-500" />
                    <span className="text-muted-foreground">Mulai:</span>
                    <span className="font-semibold">
                      {format(new Date(task.startDate), "d MMM yyyy, HH:mm", { locale: id })}
                    </span>
                  </div>
                )}
                {task.dueDate && (
                  <div className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl border text-sm",
                    isOverdue
                      ? "bg-red-500/5 border-red-500/20"
                      : "bg-muted/50 border-border/50"
                  )}>
                    <Calendar className={cn("h-4 w-4", isOverdue ? "text-red-500" : "text-amber-500")} />
                    <span className={cn("text-muted-foreground", isOverdue && "text-red-500")}>Tenggat:</span>
                    <span className={cn("font-semibold", isOverdue && "text-red-500")}>
                      {format(new Date(task.dueDate), "d MMM yyyy, HH:mm", { locale: id })}
                    </span>
                  </div>
                )}
              </div>

              {/* Assignees */}
              {task.assignees?.length > 0 && (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground font-medium">Penanggung Jawab:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {task.assignees.map((assignment: any) => (
                        <Avatar
                          key={assignment.user.id}
                          className="h-8 w-8 border-2 border-card"
                          title={assignment.user.name || ""}
                        >
                          <AvatarImage src={assignment.user.image || ""} />
                          <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                            {getInitials(assignment.user.name || "U")}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <span className="text-sm font-semibold">
                      {task.assignees.map((a: any) => a.user.name || "Anonim").join(", ")}
                    </span>
                  </div>
                </div>
              )}

              {/* Labels */}
              {task.labels?.length > 0 && (
                <div className="flex flex-wrap items-center gap-3">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-wrap gap-2">
                    {task.labels.map(({ label }: any) => (
                      <Badge
                        key={label.id}
                        className="px-3 py-1 rounded-lg text-xs font-bold"
                        style={{
                          backgroundColor: `${label.color}15`,
                          color: label.color,
                          borderColor: `${label.color}30`,
                        }}
                      >
                        {label.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Subtasks Section */}
          <div className="rounded-2xl border bg-card/80 backdrop-blur-sm p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold">Subtasks</h3>
                <Badge variant="secondary" className="rounded-lg font-bold">
                  {completedSubtasks}/{totalSubtasks}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSubtasks(!showSubtasks)}
                className="rounded-lg text-xs font-medium"
              >
                {showSubtasks ? "Sembunyikan" : "Tampilkan"}
              </Button>
            </div>

            {/* Progress Bar */}
            {totalSubtasks > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">Progress</span>
                  <span className="text-xs font-bold text-primary">{progress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Subtasks List */}
            {showSubtasks && (
              <div className="space-y-2">
                {task.subtasks?.map((subtask: any) => (
                  <SubtaskItem
                    key={subtask.id}
                    subtask={subtask}
                    onToggle={() => handleSubtaskToggle(subtask.id, !subtask.completed)}
                    onUpdate={(title) => handleSubtaskUpdate(subtask.id, title)}
                    onDelete={() => handleSubtaskDelete(subtask.id)}
                  />
                ))}

                {/* Add Subtask */}
                <div className="pt-4 border-t border-border/50 mt-4">
                  {addingSubtask ? (
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Judul subtask..."
                        value={newSubtaskTitle}
                        onChange={(e) => setNewSubtaskTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && newSubtaskTitle.trim()) {
                            handleSubtaskCreate()
                          }
                          if (e.key === "Escape") {
                            setAddingSubtask(false)
                            setNewSubtaskTitle("")
                          }
                        }}
                        className="flex-1 rounded-xl"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={handleSubtaskCreate}
                        disabled={!newSubtaskTitle.trim()}
                        className="rounded-xl"
                      >
                        Tambah
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setAddingSubtask(false)
                          setNewSubtaskTitle("")
                        }}
                        className="rounded-xl"
                      >
                        Batal
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground rounded-xl"
                      onClick={() => setAddingSubtask(true)}
                    >
                      <Plus className="h-4 w-4" />
                      Tambah subtask
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="rounded-2xl border bg-card/80 backdrop-blur-sm p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-bold">Komentar</h3>
              <Badge variant="secondary" className="rounded-lg font-bold">
                {comments.length}
              </Badge>
            </div>

            {/* Comment Form */}
            <div className="flex gap-3 mb-6">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {getInitials(session?.user?.name || "U")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                {/* Image attachments */}
                <ClipboardImage
                  onImagesChange={setAttachedImages}
                  disabled={addCommentMutation.isPending}
                />
                <Textarea
                  placeholder="Tulis komentar... (Ctrl+V untuk paste screenshot)"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && (newComment.trim() || attachedImages.length > 0)) {
                      e.preventDefault()
                      addCommentMutation.mutate({
                        content: newComment.trim(),
                        imageUrl: attachedImages.length > 0 ? attachedImages[0].url : undefined
                      })
                    }
                  }}
                  className="min-h-[80px] resize-none rounded-xl"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={() => addCommentMutation.mutate({
                      content: newComment.trim(),
                      imageUrl: attachedImages.length > 0 ? attachedImages[0].url : undefined
                    })}
                    disabled={addCommentMutation.isPending || (!newComment.trim() && attachedImages.length === 0)}
                    className="rounded-xl font-bold"
                  >
                    {addCommentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Kirim Komentar
                  </Button>
                </div>
              </div>
            </div>

            {/* Comments List */}
            <Separator className="my-6" />
            <div className="space-y-6">
              {comments.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground text-sm">Belum ada komentar</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={comment.user.image || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {getInitials(comment.user.name || "U")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{comment.user.name || "Anonim"}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.createdAt), {
                              addSuffix: true,
                              locale: id,
                            })}
                          </span>
                        </div>
                        {comment.user.id === session?.user?.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => deleteCommentMutation.mutate(comment.id)}
                            disabled={deleteCommentMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      {/* Image attachment */}
                      {comment.imageUrl && (
                        <img
                          src={comment.imageUrl}
                          alt="Attachment"
                          className="mb-2 max-w-[300px] rounded-lg cursor-pointer hover:opacity-90 transition-opacity border border-border/50"
                          onClick={() => window.open(comment.imageUrl!, "_blank")}
                        />
                      )}
                      <p className="text-sm leading-relaxed bg-muted/30 rounded-xl p-3">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Activity Log */}
          <div className="rounded-2xl border bg-card/80 backdrop-blur-sm p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-bold">Aktivitas</h3>
              <Badge variant="secondary" className="rounded-lg font-bold">
                {activities.length}
              </Badge>
            </div>
            <div className="space-y-4">
              {activities.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground text-sm">Belum ada aktivitas</p>
                </div>
              ) : (
                activities.map((activity, index) => (
                  <div key={activity.id} className="flex gap-3 animate-in fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={activity.user.image || ""} />
                      <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                        {getInitials(activity.user.name || "U")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 pt-1">
                      <p className="text-sm">
                        <span className="font-bold">{activity.user.name || "Anonim"}</span>{" "}
                        <span className="text-muted-foreground">{activity.details}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(activity.createdAt), {
                          addSuffix: true,
                          locale: id,
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Quick Info Card */}
          <div className="rounded-2xl border bg-card/80 backdrop-blur-sm p-6 shadow-sm sticky top-6">
            <h3 className="font-bold text-sm mb-4 uppercase tracking-wider text-muted-foreground">Info Task</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Dibuat</span>
                <span className="text-sm font-semibold">
                  {format(new Date(task.createdAt), "d MMM yyyy", { locale: id })}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Diperbarui</span>
                <span className="text-sm font-semibold">
                  {format(new Date(task.updatedAt), "d MMM yyyy", { locale: id })}
                </span>
              </div>
              {task.createdBy && (
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Pembuat</span>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={task.createdBy.image || ""} />
                      <AvatarFallback className="text-[10px]">
                        {getInitials(task.createdBy.name || "U")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-semibold">{task.createdBy.name || "Anonim"}</span>
                  </div>
                </div>
              )}
              {task.duration && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Durasi</span>
                  <span className="text-sm font-semibold">{task.duration} menit</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Handler functions
  function handleSubtaskToggle(subtaskId: string, completed: boolean) {
    // Optimistic update
    queryClient.setQueryData(["task", taskId], (old: any) => ({
      ...old,
      subtasks: old?.subtasks?.map((s: any) => 
        s.id === subtaskId ? { ...s, completed } : s
      ),
    }))

    fetch(`/api/subtasks/${subtaskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
    })
      .then((res) => {
        if (!res.ok) throw new Error()
        queryClient.invalidateQueries({ queryKey: ["task", taskId] })
        queryClient.invalidateQueries({ queryKey: ["task-activity", taskId] })
      })
      .catch(() => {
        // Rollback
        queryClient.invalidateQueries({ queryKey: ["task", taskId] })
        toast({ title: "Error", description: "Gagal mengubah status subtask", variant: "destructive" })
      })
  }

  function handleSubtaskUpdate(subtaskId: string, title: string) {
    return fetch(`/api/subtasks/${subtaskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    })
      .then((res) => {
        if (!res.ok) throw new Error()
        refetchTask()
      })
      .catch(() => {
        toast({ title: "Error", description: "Gagal memperbarui subtask", variant: "destructive" })
        throw new Error()
      })
  }

  function handleSubtaskDelete(subtaskId: string) {
    fetch(`/api/subtasks/${subtaskId}`, { method: "DELETE" })
      .then((res) => {
        if (!res.ok) throw new Error()
        refetchTask()
        queryClient.invalidateQueries({ queryKey: ["task-activity", taskId] })
        toast({ title: "Berhasil", description: "Subtask dihapus" })
      })
      .catch(() => {
        toast({ title: "Error", description: "Gagal menghapus subtask", variant: "destructive" })
      })
  }

  function handleSubtaskCreate() {
    if (!newSubtaskTitle.trim()) return
    
    const tempId = `temp-${Date.now()}`
    const optimisticSubtask = {
      id: tempId,
      title: newSubtaskTitle.trim(),
      completed: false,
    }

    // Optimistic add
    queryClient.setQueryData(["task", taskId], (old: any) => ({
      ...old,
      subtasks: [...(old?.subtasks || []), optimisticSubtask],
    }))

    setNewSubtaskTitle("")
    setAddingSubtask(false)

    fetch(`/api/tasks/${taskId}/subtasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newSubtaskTitle.trim() }),
    })
      .then((res) => {
        if (!res.ok) throw new Error()
        queryClient.invalidateQueries({ queryKey: ["task", taskId] })
        queryClient.invalidateQueries({ queryKey: ["task-activity", taskId] })
        toast({ title: "Berhasil", description: "Subtask ditambahkan" })
      })
      .catch(() => {
        // Rollback - remove temp subtask
        queryClient.setQueryData(["task", taskId], (old: any) => ({
          ...old,
          subtasks: old?.subtasks?.filter((s: any) => s.id !== tempId),
        }))
        toast({ title: "Error", description: "Gagal menambahkan subtask", variant: "destructive" })
      })
  }
}