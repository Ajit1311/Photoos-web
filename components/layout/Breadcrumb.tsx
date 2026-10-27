"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Breadcrumb() {
  const pathname = usePathname();

  const segments = pathname
    .split("/")
    .filter(Boolean);

  if (segments.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Link
        href="/dashboard"
        className="transition-colors hover:text-foreground"
      >
        Dashboard
      </Link>

      {segments.slice(1).map((segment, index) => {
        const isLast = index === segments.slice(1).length - 1;
        return (
          <div
            key={`${segment}-${index}`}
            className="flex items-center gap-1.5"
          >
            <ChevronRight size={12} className="text-muted-foreground/50 shrink-0" />
            <span
              className={`capitalize ${
                isLast
                  ? "font-medium text-foreground"
                  : "transition-colors hover:text-foreground"
              }`}
            >
              {segment.replace(/-/g, " ")}
            </span>
          </div>
        );
      })}
    </nav>
  );
}
