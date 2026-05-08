"use client"

import { useParams } from "next/navigation"
import { SlackLayout } from "@/components/layout/slack-layout"
import { Sidebar } from "@/components/layout/sidebar"
import { TaskDetail } from "@/components/task/task-detail"
import { PremiumLoader } from "@/components/ui/premium-loader"
import { Suspense } from "react"

function TaskDetailContent({ taskId }: { taskId: string }) {
  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <TaskDetail taskId={taskId} />
      </main>
    </div>
  )
}

export default function TaskDetailPage() {
  const params = useParams()
  const taskId = params.taskId as string

  return (
    <Suspense fallback={<PremiumLoader fullScreen size="xl" text="Memuat..." />}>
      <SlackLayout sidebar={<Sidebar />}>
        <TaskDetailContent taskId={taskId} />
      </SlackLayout>
    </Suspense>
  )
}
