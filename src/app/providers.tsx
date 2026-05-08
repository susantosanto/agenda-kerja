"use client"

import { SessionProvider } from "next-auth/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, createContext, useContext } from "react"
import { ToastProvider } from "@/components/ui/toast"

const TooltipContext = createContext<{ delayDuration: number }>({ delayDuration: 200 })

export function useTooltip() {
  return useContext(TooltipContext)
}

export function TooltipProvider({ 
  children, 
  delayDuration = 200 
}: { 
  children: React.ReactNode
  delayDuration?: number 
}) {
  return (
    <TooltipContext.Provider value={{ delayDuration }}>
      {children}
    </TooltipContext.Provider>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Optimized: 5 min stale time, no background polling
            staleTime: 5 * 60 * 1000,
            gcTime: 30 * 60 * 1000, // Keep unused data for 30 min
            refetchOnWindowFocus: false, // Don't refetch when tab gains focus
            retry: 1,
            // Removed refetchInterval to save bandwidth
          },
        },
      })
  )

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delayDuration={200}>
          <ToastProvider>
            <div className="dark min-h-screen bg-background text-foreground">
              {children}
            </div>
          </ToastProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </SessionProvider>
  )
}