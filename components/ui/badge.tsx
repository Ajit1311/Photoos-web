import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5.5 w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-tight whitespace-nowrap transition-all duration-150 focus-visible:border-ring focus-visible:ring-[2px] focus-visible:ring-ring/40 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-2xs [a]:hover:bg-primary/90",
        brand:
          "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:border-sky-400/30 dark:bg-sky-500/20 dark:text-sky-300",
        secondary:
          "border-border/60 bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        success:
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/20 dark:text-emerald-300",
        warning:
          "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:border-amber-400/30 dark:bg-amber-500/20 dark:text-amber-300",
        info:
          "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:border-blue-400/30 dark:bg-blue-500/20 dark:text-blue-300",
        destructive:
          "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:border-rose-400/30 dark:bg-rose-500/20 dark:text-rose-300",
        outline:
          "border-border/80 bg-background/50 text-foreground [a]:hover:bg-muted",
        ghost:
          "border-transparent hover:bg-muted text-muted-foreground hover:text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends useRender.ComponentProps<"span">,
    VariantProps<typeof badgeVariants> {}

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: BadgeProps) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
