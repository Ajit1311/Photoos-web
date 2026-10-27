import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-transparent bg-clip-padding text-sm font-medium tracking-tight whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/92 hover:shadow-sm active:bg-primary/95",
        brand:
          "bg-[#0A3F61] text-white shadow-xs hover:bg-[#083653] dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400",
        outline:
          "border-border/80 bg-card/60 text-foreground shadow-2xs hover:border-border hover:bg-muted/80 hover:text-foreground dark:border-border/70 dark:bg-card/40 dark:hover:bg-muted/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-2xs hover:bg-secondary/80",
        ghost:
          "hover:bg-muted/80 hover:text-foreground dark:hover:bg-muted/60",
        destructive:
          "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/30 dark:bg-destructive/20 dark:hover:bg-destructive/30",
        link:
          "text-primary underline-offset-4 hover:underline p-0 h-auto active:scale-100",
      },
      size: {
        default: "h-9.5 px-3.5 py-2 text-sm sm:h-9 sm:px-3 sm:text-xs",
        xs: "h-7 px-2 text-xs rounded-lg [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8.5 px-2.5 text-xs rounded-lg [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 px-5 text-base rounded-xl [&_svg:not([class*='size-'])]:size-5",
        touch: "min-h-[44px] px-4 py-2.5 text-sm sm:h-10 sm:min-h-0",
        icon: "size-9.5 sm:size-9 rounded-xl",
        "icon-xs": "size-7 rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8.5 rounded-lg [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-11 rounded-xl [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends ButtonPrimitive.Props,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

function Button({
  className,
  variant = "default",
  size = "default",
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {loading && (
        <Loader2 className="animate-spin text-current" aria-hidden="true" />
      )}
      {children}
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }
