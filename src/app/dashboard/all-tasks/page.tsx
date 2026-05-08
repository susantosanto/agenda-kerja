"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { SlackLayout } from "@/components/layout/slack-layout"
import { Sidebar } from "@/components/layout/sidebar"
import { TaskList } from "@/components/task/task-list"
import { PremiumLoader } from "@/components/ui/premium-loader"
import { 
  Loader2, 
  ListTodo, 
  Sparkles, 
  ShieldCheck, 
  Trophy, 
  Zap,
  TrendingUp,
  Target,
  CheckCircle2
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

async function fetchAllTasks() {
  const res = await fetch("/api/tasks")
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

export default function AllTasksPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const { data: tasks, isLoading, refetch } = useQuery({
    queryKey: ["all-tasks-view"],
    queryFn: fetchAllTasks,
    enabled: !!session,
  })

  if (status === "loading" || isLoading) {
    return <PremiumLoader fullScreen size="xl" text="Memuat workspace..." />
  }

  if (status === "unauthenticated") {
    router.push("/signin")
    return null
  }

  const completedCount = tasks?.filter((t: any) => t.status === "DONE").length || 0
  const totalCount = tasks?.length || 0

  return (
    <SlackLayout 
      sidebar={<Sidebar />}
    >
      <div className="flex flex-col h-full bg-background overflow-hidden">
        
        <main className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10">
          
          {/* PREMIUM HERO SECTION */}
          <div className="animate-in fade-in slide-in-from-top-4 duration-1000">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Intelligence Dashboard</span>
                </div>
                <h1 className="text-5xl font-black tracking-tighter text-foreground leading-none">
                  All <span className="text-primary">Tasks</span>
                </h1>
                <p className="text-muted-foreground mt-4 text-lg font-medium tracking-tight">
                  Unified management for your community operations.
                </p>
              </div>

              {/* ARCHITECT SIGNATURE - COMPACT & PREMIUM */}
              <div className="flex flex-col items-end opacity-60 hover:opacity-100 transition-opacity duration-500 cursor-default">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-px w-6 bg-border" />
                  <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.3em]">System Architect</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-black tracking-widest text-foreground">SANTO X/CODE</span>
                </div>
              </div>
            </div>

            {/* PREMIUM PROGRESS BAR - SUPER CLEAN */}
            <div className="mt-10">
              {/* AGENDA KERJA - Mobile Only */}
              <div className="md:hidden mb-6">
                <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[9px] font-black text-primary uppercase tracking-wider">Agenda Kerja</span>
                  </div>
                  <p className="text-xs font-bold text-foreground leading-tight">OPS GUGUS KH. ZAENAL MUSTOFA</p>
                </div>
              </div>

              {/* Progress Stats - Compact & Premium */}
              <div className="flex items-center gap-3 p-4 bg-card/50 border border-border/30 rounded-2xl">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-muted-foreground">Progress</span>
                    <span className="text-xs font-black text-foreground">{completedCount}/{totalCount} tasks</span>
                  </div>
                  <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-1000"
                      style={{ width: `${totalCount > 0 ? (completedCount/totalCount)*100 : 0}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-primary">{totalCount > 0 ? Math.round((completedCount/totalCount)*100) : 0}%</p>
                  <p className="text-[9px] font-medium text-muted-foreground uppercase">Done</p>
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-border/50 w-full" />

          {/* TASK LIST AREA */}
          <div className="max-w-5xl mx-auto w-full pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
            <TaskList 
              tasks={tasks || []} 
              onTaskUpdated={refetch}
            />
          </div>
        </main>
      </div>
    </SlackLayout>
  )
}
