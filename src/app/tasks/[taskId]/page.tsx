"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { TaskDetail } from "@/components/task/task-detail"
import { Loader2 } from "lucide-react"

export default function TaskDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()

  const taskId = params.taskId as string

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (status === "unauthenticated") {
    router.push("/signin")
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:pl-72">
          <TaskDetail taskId={taskId} />
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
