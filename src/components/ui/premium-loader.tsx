"use client"

import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface PremiumLoaderProps {
  size?: "sm" | "md" | "lg" | "xl"
  text?: string
  className?: string
  fullScreen?: boolean
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
}

export function PremiumLoader({ 
  size = "md", 
  text = "Loading...", 
  className,
  fullScreen = false 
}: PremiumLoaderProps) {
  const content = (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      <div className="relative">
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-md animate-pulse" />
        {/* Inner loader */}
        <Loader2 className={cn(
          sizeClasses[size],
          "animate-spin text-primary relative z-10"
        )} />
        {/* Pulse ring */}
        <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
      </div>
      {text && (
        <p className="text-xs font-bold text-muted-foreground animate-pulse tracking-widest uppercase">
          {text}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        {/* Animated gradient background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        {/* Content */}
        <div className="relative z-10">
          {content}
        </div>
      </div>
    )
  }

  return content
}

// Skeleton loader for content placeholders
export function SkeletonLoader({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse space-y-4", className)}>
      <div className="h-4 bg-muted rounded-md w-3/4" />
      <div className="h-4 bg-muted rounded-md w-1/2" />
      <div className="h-4 bg-muted rounded-md w-5/6" />
    </div>
  )
}

// Premium page transition wrapper
export function PageTransition({ 
  children, 
  isLoading 
}: { 
  children: React.ReactNode
  isLoading?: boolean 
}) {
  return (
    <div className="relative">
      {/* Gradient overlay for smooth transitions */}
      <div className="fixed inset-0 bg-background pointer-events-none z-50 transition-opacity duration-500" 
           style={{ opacity: isLoading ? 1 : 0 }} />
      
      {children}
    </div>
  )
}