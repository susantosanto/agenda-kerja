"use client"

import * as React from "react"
import { createContext, useContext, useState } from "react"
import { cn } from "@/lib/utils"

const TooltipContext = createContext<{ 
  delayDuration: number 
  children?: React.ReactNode 
}>({ 
  delayDuration: 200 
})

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

const Tooltip = ({
  children,
  content,
  delayDuration = 200,
}: {
  children: React.ReactNode
  content?: string
  delayDuration?: number
}) => {
  const [show, setShow] = useState(false)
  const [timeout, setTimeout] = useState<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    const timer = setTimeout(() => setShow(true), delayDuration)
    setTimeout(timer)
  }

  const handleMouseLeave = () => {
    if (timeout) clearTimeout(timeout)
    setShow(false)
  }

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {show && content && (
        <div className="absolute z-50 px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-md animate-fade-in">
          {content}
        </div>
      )}
    </div>
  )
}

const TooltipTrigger = ({ children }: { children: React.ReactNode }) => <>{children}</>

const TooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-fade-in",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }