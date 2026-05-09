import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98] cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground font-bold border border-white/5 shadow-[0_4px_12px_rgba(0,0,0,0.5)] hover:bg-zinc-700 transition-all active:scale-95",
        destructive: "bg-red-500 text-white shadow-md hover:bg-red-600",
        outline: "border border-white/[0.03] bg-white/[0.01] text-white/90 hover:bg-white/[0.05] hover:border-white/[0.1] hover:text-white",
        secondary: "bg-zinc-900 text-white border border-white/[0.02] hover:bg-zinc-800",
        ghost: "text-white/40 hover:text-white hover:bg-white/[0.03]",
        link: "text-white underline-offset-4 hover:underline",
        success: "bg-emerald-500/5 text-emerald-500 border border-emerald-500/10 hover:bg-emerald-500/10",
        warning: "bg-amber-500/5 text-amber-500 border border-amber-500/10 hover:bg-amber-500/10",
        surface: "bg-zinc-900/40 text-white border border-white/[0.03] backdrop-blur-md hover:bg-zinc-800",
      },
      size: {
        default: "h-10 px-5 py-2 text-sm",
        sm: "h-8 px-3 text-xs rounded-full",
        lg: "h-11 px-6 text-base rounded-full",
        xl: "h-12 px-8 text-base rounded-full",
        icon: "h-10 w-10 rounded-full",
        "icon-sm": "h-8 w-8 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)


export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }