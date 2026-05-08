"use client"

import { ReactNode, useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Header } from "./header"
import { MobileNav } from "./mobile-nav"
import { X, Menu } from "lucide-react"

interface SlackLayoutProps {
  children: ReactNode
  sidebar?: ReactNode
  detailPane?: ReactNode
  showDetailPane?: boolean
}

export function SlackLayout({ 
  children, 
  sidebar, 
  detailPane, 
  showDetailPane = false 
}: SlackLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false)

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen || isMobileDetailOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
  }, [isMobileMenuOpen, isMobileDetailOpen])

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* GLOBAL HEADER - Premium */}
      <div className="relative z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* MOBILE SIDEBAR OVERLAY - above bottom nav */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-md z-[65] md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* MOBILE SIDEBAR DRAWER - Premium */}
        <div className={cn(
          "fixed inset-y-0 left-0 w-[300px] bg-sidebar-background z-[70] md:hidden transition-transform duration-300 ease-out shadow-2xl border-r border-border",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.12em]">Menu</span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {sidebar}
            </div>
          </div>
        </div>

        {/* DESKTOP SIDEBAR - Premium Light */}
        {sidebar && (
          <div className="hidden md:flex flex-col w-64 bg-sidebar-background border-r border-border shrink-0 overflow-y-auto">
            {sidebar}
          </div>
        )}

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden bg-background">
          {/* pb-[72px] on mobile = space for bottom nav */}
          <div className="flex-1 overflow-y-auto pb-[72px] md:pb-0">
            {children}
          </div>
        </div>

        {/* DETAIL/THREAD PANE - Responsive */}
        {showDetailPane && detailPane && (
          <>
            {/* Mobile Detail Overlay */}
            <div 
              className={cn(
                "fixed inset-0 bg-background/60 backdrop-blur-sm z-[60] lg:hidden",
                isMobileDetailOpen ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
              onClick={() => setIsMobileDetailOpen(false)}
            />
            
            {/* Detail Pane */}
            <div className={cn(
              "bg-card border-l border-border overflow-y-auto z-[70] transition-all duration-300",
              "hidden lg:flex lg:flex-col lg:w-80 lg:shrink-0",
              "fixed inset-y-0 right-0 w-full sm:w-[400px] lg:static",
              isMobileDetailOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
            )}>
              <div className="flex flex-col h-full">
                <div className="p-4 lg:hidden border-b flex justify-between items-center bg-card sticky top-0 z-10">
                  <span className="font-semibold text-sm uppercase tracking-wide">Detail</span>
                  <button onClick={() => setIsMobileDetailOpen(false)} className="p-1.5 hover:bg-muted rounded-md transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {detailPane}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <MobileNav />
    </div>
  )
}
