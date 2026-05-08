import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98] cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-md hover:shadow-lg hover:translate-y-[-1px] active:translate-y-0 active:shadow-sm",
        destructive: "bg-destructive text-destructive-foreground shadow-md hover:shadow-lg hover:translate-y-[-1px]",
        outline: "border border-border bg-background shadow-sm hover:shadow-md hover:bg-secondary hover:translate-y-[-1px] active:translate-y-0",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:shadow-md hover:translate-y-[-1px] active:translate-y-0",
        ghost: "hover:bg-secondary/80 hover:translate-y-[-1px] active:translate-y-0",
        link: "text-primary underline-offset-4 hover:underline",
        success: "bg-emerald-600 text-white shadow-md hover:shadow-lg hover:translate-y-[-1px] active:translate-y-0",
        warning: "bg-amber-600 text-white shadow-md hover:shadow-lg hover:translate-y-[-1px] active:translate-y-0",
        surface: "bg-card text-foreground shadow-sm hover:shadow-md border border-border hover:translate-y-[-1px] active:translate-y-0",
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