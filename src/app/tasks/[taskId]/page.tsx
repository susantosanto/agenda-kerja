"use client"

import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { SlackLayout } from "@/components/layout/slack-layout"
import { Sidebar } from "@/components/layout/sidebar"
import { TaskDetail } from "@/components/task/task-detail"
import { PremiumLoader } from "@/components/ui/premium-loader"

export default function TaskDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()

  const taskId = params.taskId as string

  if (status === "loading") {
    return <PremiumLoader fullScreen size="xl" text="Memuat..." />
  }

  if (status === "unauthenticated") {
    router.push("/signin")
    return null
  }

  return (
    <SlackLayout sidebar={<Sidebar />}>
      <div className="flex flex-col h-full bg-background overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <TaskDetail taskId={taskId} />
        </main>
      </div>
    </SlackLayout>
  )
}
