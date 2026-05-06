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
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
            refetchInterval: 30000,
          },
        },
      })
  )

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delayDuration={200}>
          <ToastProvider>
            {children}
          </ToastProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </SessionProvider>
  )
}