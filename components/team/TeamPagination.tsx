"use client";

import {
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

type TeamPaginationProps = {
    page: number;
    totalPages: number;
    total: number;
    onPageChange: (
        page: number,
    ) => void;
};

export function TeamPagination({
    page,
    totalPages,
    total,
    onPageChange,
}: TeamPaginationProps) {
    return (
        <div className="flex flex-col gap-4 rounded-xl border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
                {total} team member
                {total === 1 ? "" : "s"}
            </p>

            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() =>
                        onPageChange(page - 1)
                    }
                    disabled={page <= 1}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border disabled:pointer-events-none disabled:opacity-40"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>

                <span className="text-sm">
                    Page {page} of {totalPages}
                </span>

                <button
                    type="button"
                    onClick={() =>
                        onPageChange(page + 1)
                    }
                    disabled={
                        page >= totalPages
                    }
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border disabled:pointer-events-none disabled:opacity-40"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
