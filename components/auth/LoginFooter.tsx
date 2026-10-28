import Link from "next/link";
import { LEGAL_CONFIG } from "@/config/legal";

export function LoginFooter() {
  return (
    <div className="mt-8 border-t border-border pt-6">

      <div className="flex flex-col items-center gap-3 text-center">

        <p className="text-xs text-muted-foreground">
          Version {LEGAL_CONFIG.version}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 text-xs">

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

          <span className="text-muted-foreground">
            •
          </span>

          <Link
            href="/platform-agreement"
            className="transition-colors hover:text-primary"
          >
            Platform Agreement
          </Link>

        </div>

        <p className="text-xs text-muted-foreground">
          © 2026 PhotoOS. All rights reserved.
        </p>

      </div>

    </div>
  );
}