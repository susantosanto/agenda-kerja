"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
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
  
  // Optimized caching: stale 5 minutes, keep data longer
  const { data: tasks, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["all-tasks-view"],
    queryFn: fetchAllTasks,
    enabled: !!session,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (was cacheTime)
  })

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
        <main className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10">

          {/* ─── AGENDA KERJA — PREMIUM HERO ─── */}
          <div className="container mx-auto max-w-6xl px-4 lg:px-8 animate-in fade-in slide-in-from-top-4 duration-1000">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-background via-primary/[0.03] to-background border border-primary/10 group p-4 md:p-6">

              {/* ── ORBS CAHAYA ── */}
              <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gradient-to-br from-primary/15 to-accent/10 blur-[60px] group-hover:from-primary/20 group-hover:to-accent/15 transition-all duration-1000" />
              <div className="absolute -bottom-12 -left-12 h-24 w-24 rounded-full bg-accent/10 blur-[40px]" />

              {/* ── SHIMMER LINES ── */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

              {/* ── ISI KONTEN ── */}
              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">

                {/* LEFT: Icon Premium */}
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 ring-1 ring-primary/10">
                    <Target className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                </div>

                {/* CENTER: Typography */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[8px] font-bold text-primary uppercase tracking-widest">Agenda Kerja</span>
                    <div className="h-1 w-1 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
                  </div>
                  <h1 className="text-lg md:text-xl lg:text-2xl font-black text-foreground tracking-tight leading-tight">
                    OPS GUGUS{' '}
                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      KH. ZAENAL MUSTOFA
                    </span>
                  </h1>
                </div>

                {/* RIGHT: Badges */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <ShieldCheck className="h-2.5 w-2.5 text-amber-500" />
                    <span className="text-[8px] font-bold text-amber-500 uppercase tracking-wider">Official</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TASK LIST AREA - Inline loading without blocking UI */}
          <div className="container mx-auto max-w-6xl px-4 lg:px-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
            {isLoading ? (
              // Skeleton loader instead of full screen
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Skeleton className="h-10 w-32 rounded-xl" />
                  <Skeleton className="h-10 w-32 rounded-xl" />
                  <Skeleton className="h-10 w-32 rounded-xl" />
                </div>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-24 rounded-2xl" />
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
