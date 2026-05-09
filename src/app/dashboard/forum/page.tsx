"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { SlackLayout } from "@/components/layout/slack-layout"
import { Sidebar } from "@/components/layout/sidebar"
import { ChatBox } from "@/components/chat/chat-box"
import { Loader2, MessageSquare } from "lucide-react"

export default function ForumPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
        <p className="text-slate-500 font-medium animate-pulse tracking-widest uppercase text-[10px]">Loading Forum...</p>
      </div>
    )
  }

  if (status === "unauthenticated") {
    router.push("/signin")
    return null
  }

  return (
    <SlackLayout sidebar={<Sidebar />}>
      <div className="flex flex-col h-full bg-background overflow-hidden">
        {/* Header */}
        <div className="shrink-0 border-b border-zinc-800/50 bg-card/50 backdrop-blur-sm">
          <div className="px-6 py-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Forum Diskusi</h1>
              <p className="text-xs text-muted-foreground">Obrolan global semua anggota</p>
            </div>
          </div>
        </div>

        {/* Chat */}
        <div className="flex-1 overflow-hidden">
          <ChatBox />
        </div>
      </div>
    </SlackLayout>
  )
}
