import { Camera } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-4 flex items-center justify-center">
        <div className="absolute -inset-3 animate-pulse rounded-full bg-primary/10 blur-xl" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-border/80 bg-card text-primary shadow-xs">
          <Camera className="h-7 w-7 animate-pulse stroke-[1.8]" />
        </div>
      </div>
      <p className="text-xs font-medium tracking-wide uppercase text-muted-foreground animate-pulse">
        Loading PhotoOS Workspace...
      </p>
    </div>
  );
}

