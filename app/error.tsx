"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console without exposing secrets
    console.error("[AppError] Unhandled route error:", error.message);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-16 text-center">
      <div className="relative mb-6 flex items-center justify-center">
        <div className="absolute -inset-4 rounded-full bg-destructive/10 blur-xl" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive shadow-xs">
          <AlertTriangle className="h-8 w-8 stroke-[1.8]" />
        </div>
      </div>

      <div className="inline-flex items-center gap-1.5 rounded-full border border-destructive/20 bg-destructive/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-destructive">
        System Notice
      </div>

      <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Something didn&apos;t load properly
      </h1>

      <p className="mt-2.5 max-w-md text-sm leading-relaxed text-muted-foreground">
        An unexpected condition occurred while processing this page. Our error monitoring
        has received notice of this event.
      </p>

      {error.digest && (
        <p className="mt-3 font-mono text-[11px] text-muted-foreground/60">
          Incident ID: {error.digest}
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="default"
          onClick={() => {
            if (typeof window !== "undefined") {
              window.location.reload();
            } else {
              reset();
            }
          }}
          className="gap-2 shadow-xs"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
        <Link href="/dashboard">
          <Button variant="outline" className="gap-2">
            <Home className="h-4 w-4" />
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}

