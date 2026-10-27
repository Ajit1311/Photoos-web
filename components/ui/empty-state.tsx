import * as React from "react";
import { LucideIcon, FolderOpen } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  icon: Icon = FolderOpen,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = "",
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/40 px-6 py-12 text-center backdrop-blur-xs transition-colors",
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border/80 bg-muted/60 text-muted-foreground shadow-2xs">
        <Icon className="h-7 w-7 stroke-[1.5]" />
      </div>

      <h3 className="mt-4 text-base font-semibold tracking-tight text-foreground">
        {title}
      </h3>

      <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-muted-foreground">
        {description}
      </p>

      {(actionLabel || secondaryActionLabel || children) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {actionLabel && onAction && (
            <Button
              variant="default"
              size="sm"
              onClick={onAction}
              className="shadow-xs"
            >
              {actionLabel}
            </Button>
          )}

          {secondaryActionLabel && onSecondaryAction && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSecondaryAction}
            >
              {secondaryActionLabel}
            </Button>
          )}

          {children}
        </div>
      )}
    </div>
  );
}

