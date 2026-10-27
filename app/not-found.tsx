import Link from "next/link";
import { Camera, Compass, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-16 text-center selection:bg-primary/20 selection:text-primary">
      {/* Visual Accent */}
      <div className="relative mb-8 flex items-center justify-center">
        <div className="absolute -inset-4 rounded-full bg-primary/10 blur-2xl dark:bg-sky-500/10" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-border/80 bg-card text-primary shadow-md backdrop-blur-sm">
          <Camera className="h-10 w-10 stroke-[1.6]" />
        </div>
      </div>

      {/* Code badge */}
      <div className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/60 px-3.5 py-1 text-xs font-semibold tracking-wider uppercase text-muted-foreground">
        <Compass className="h-3.5 w-3.5" />
        404 &bull; Page Not Found
      </div>

      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        This frame seems to be missing
      </h1>

      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        The gallery, project, or destination you were looking for doesn&apos;t exist,
        has been moved to another album, or requires private access permissions.
      </p>

      {/* Actions */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/dashboard">
          <Button variant="default" size="default" className="gap-2 shadow-xs">
            <Home className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <Link href="/login">
          <Button variant="outline" size="default" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go to Login
          </Button>
        </Link>
      </div>

      {/* Footer subtle brand */}
      <p className="mt-16 text-xs text-muted-foreground/60">
        PhotoOS &bull; Professional Photography Studio Platform
      </p>
    </div>
  );
}

