import Link from "next/link";

export function LoginFooter() {
  return (
    <div className="mt-8 border-t border-border pt-6">

      <div className="flex flex-col items-center gap-3 text-center">

        <p className="text-xs text-muted-foreground">
          Version 1.0.0
        </p>

        <div className="flex items-center gap-4 text-xs">

          <Link
            href="/privacy"
            className="transition-colors hover:text-primary"
          >
            Privacy Policy
          </Link>

          <span className="text-muted-foreground">
            •
          </span>

          <Link
            href="/terms"
            className="transition-colors hover:text-primary"
          >
            Terms of Service
          </Link>

        </div>

        <p className="text-xs text-muted-foreground">
          © 2026 PhotoOS. All rights reserved.
        </p>

      </div>

    </div>
  );
}