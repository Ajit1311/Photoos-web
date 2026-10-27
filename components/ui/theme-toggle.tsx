"use client";

import * as React from "react";
import { Moon, Sun, Laptop } from "lucide-react";
import { useTheme } from "next-themes";

function subscribe() {
  return () => {};
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  // Safe hydration check in React 19 without cascading render
  const mounted = React.useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  if (!mounted) {
    return (
      <div
        className={`inline-flex h-9 w-9 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-border/60 bg-card/40 text-muted-foreground sm:min-h-[36px] sm:min-w-[36px] ${className}`}
        aria-hidden="true"
      />
    );
  }

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const getLabel = () => {
    if (theme === "light") return "Light mode active (click for Dark)";
    if (theme === "dark") return "Dark mode active (click for System)";
    return "System theme active (click for Light)";
  };

  return (
    <button
      type="button"
      onClick={cycleTheme}
      title={getLabel()}
      aria-label={getLabel()}
      className={`relative inline-flex h-9 w-9 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-border/80 bg-card/80 text-foreground shadow-xs transition-all duration-200 hover:border-primary/40 hover:bg-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-[36px] sm:min-w-[36px] ${className}`}
    >
      {theme === "dark" ? (
        <Moon className="h-4 w-4 transition-transform duration-200" />
      ) : theme === "light" ? (
        <Sun className="h-4 w-4 transition-transform duration-200" />
      ) : (
        <Laptop className="h-4 w-4 transition-transform duration-200" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}

