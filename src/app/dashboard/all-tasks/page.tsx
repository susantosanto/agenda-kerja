"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useRef, useState } from "react"
import { SlackLayout } from "@/components/layout/slack-layout"
import { Sidebar } from "@/components/layout/sidebar"
import { TaskList } from "@/components/task/task-list"
import { PremiumLoader } from "@/components/ui/premium-loader"
import { Target, ShieldCheck, Zap, Sparkles } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

async function fetchAllTasks() {
  const res = await fetch("/api/tasks")
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

export default function AllTasksPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isConnected, setIsConnected] = useState(false)
  
  // Optimized caching: stale 5 minutes, keep data longer
  const { data: tasks, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["all-tasks-view"],
    queryFn: fetchAllTasks,
    enabled: !!session,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (was cacheTime)
  })

  // Connect to SSE for real-time task updates
  useEffect(() => {
    if (!session?.user?.id) return

    let eventSource: EventSource | null = null

    const connect = () => {
      try {
        eventSource = new EventSource("/api/realtime/all-tasks", {
          withCredentials: true
        })

        eventSource.onopen = () => {
          console.log("[ALL-TASKS] SSE Connected")
          setIsConnected(true)
        }

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            
            if (data.type === "connected") {
              console.log("[ALL-TASKS] Handshake done")
              return
            }

            console.log("[ALL-TASKS] Received:", data.type)
            
            // Refresh task list for any task change
            if (data.type === "task-created" || data.type === "task-updated" || data.type === "task-deleted") {
              queryClient.invalidateQueries({ queryKey: ["all-tasks-view"] })
              queryClient.invalidateQueries({ queryKey: ["tasks"] })
            }
          } catch (e) {
            console.error("[ALL-TASKS] Parse error:", e)
          }
        }

        eventSource.onerror = () => {
          console.log("[ALL-TASKS] SSE error, reconnecting...")
          setIsConnected(false)
          if (eventSource) {
            eventSource.close()
            eventSource = null
          }
          setTimeout(connect, 5000)
        }
      } catch (error) {
        console.error("[ALL-TASKS] Failed to connect:", error)
        setTimeout(connect, 5000)
      }
    }

    // Delay connection slightly
    const timer = setTimeout(connect, 1000)

    return () => {
      clearTimeout(timer)
      if (eventSource) {
        eventSource.close()
      }
    }
  }, [session?.user?.id, queryClient])

  if (status === "loading") {
    return <PremiumLoader fullScreen size="xl" text="Memuat workspace..." />
  }

  if (status === "unauthenticated") {
    router.push("/signin")
    return null
  }

  return (
    <SlackLayout 
      sidebar={<Sidebar />}
    >
      <div className="flex flex-col h-full bg-background overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10 space-y-6 sm:space-y-10">

          {/* ─── AGENDA KERJA — HERO ─── */}
          <div className="container mx-auto max-w-6xl px-3 sm:px-4 lg:px-8 animate-in fade-in slide-in-from-top-4 duration-1000">
            <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-background via-primary/[0.03] to-background border border-primary/10 group p-3 sm:p-4 md:p-6">

              {/* ── ORBS (hidden on mobile) ── */}
              <div className="hidden sm:block absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gradient-to-br from-primary/15 to-accent/10 blur-[60px] group-hover:from-primary/20 group-hover:to-accent/15 transition-all duration-1000" />
              <div className="hidden sm:block absolute -bottom-12 -left-12 h-24 w-24 rounded-full bg-accent/10 blur-[40px]" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

              {/* ── ISI KONTEN ── */}
              <div className="relative z-10 flex flex-row items-center gap-2 sm:gap-4">

                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-lg sm:rounded-xl bg-white flex items-center justify-center shadow-2xl shadow-white/5 ring-1 ring-white/10">
                    <Target className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-black" />
                  </div>
                </div>

                {/* Typography */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-0 sm:mb-1">
                    <span className="text-[7px] sm:text-[8px] font-black text-white/40 uppercase tracking-[0.4em]">Agenda Kerja</span>
                    <div className="h-0.5 w-0.5 sm:h-1 sm:w-1 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
                  </div>
                  <h1 className="text-sm sm:text-lg md:text-xl lg:text-2xl font-black text-white tracking-tight leading-tight truncate">
                    OPS GUGUS{' '}
                    <span className="text-white/40">
                      KH. ZAENAL MUSTOFA
                    </span>
                  </h1>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                  <div className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <ShieldCheck className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-amber-500" />
                    <span className="text-[6px] sm:text-[8px] font-bold text-amber-500 uppercase tracking-wider hidden xs:inline">Official</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TASK LIST AREA */}
          <div className="container mx-auto max-w-6xl px-3 sm:px-4 lg:px-8 pb-16 sm:pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
            {isLoading ? (
              // Skeleton loader instead of full screen
              <div className="space-y-3 sm:space-y-4">
                <div className="flex gap-2 sm:gap-3 overflow-x-auto">
                  <Skeleton className="h-8 sm:h-10 w-24 sm:w-32 rounded-lg sm:rounded-xl" />
                  <Skeleton className="h-8 sm:h-10 w-24 sm:w-32 rounded-lg sm:rounded-xl" />
                  <Skeleton className="h-8 sm:h-10 w-24 sm:w-32 rounded-lg sm:rounded-xl" />
                </div>
                <div className="space-y-2 sm:space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-20 sm:h-24 rounded-xl sm:rounded-2xl" />
                  ))}
                </div>
              </div>
            ) : (
              <TaskList 
                tasks={tasks || []} 
                onTaskUpdated={refetch}
              />
            )}
          </div>
        </main>
      </div>
    </SlackLayout>
  )
}
