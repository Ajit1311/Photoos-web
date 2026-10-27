"use client";

import {
    RefreshCw,
    Search,
} from "lucide-react";

type TeamFiltersProps = {
    search: string;
    onSearchChange: (
        value: string,
    ) => void;
    onRefresh: () => void;
    refreshing: boolean;
};

export function TeamFilters({
    search,
    onSearchChange,
    onRefresh,
    refreshing,
}: TeamFiltersProps) {
    return (
        <div className="rounded-xl border bg-card p-4">
            <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <input
                        type="text"
                        value={search}
                        onChange={(event) =>
                            onSearchChange(
                                event.target.value,
                            )
                        }
                        placeholder="Search by email, employee code or role..."
                        className="h-10 w-full rounded-lg border bg-background pl-10 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-ring"
                    />
                </div>

                <button
                    type="button"
                    onClick={onRefresh}
                    disabled={refreshing}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
                >
                    <RefreshCw
                        className={`h-4 w-4 ${
                            refreshing
                                ? "animate-spin"
                                : ""
                        }`}
                    />

                    Refresh
                </button>
            </div>
        </div>
    );
}
