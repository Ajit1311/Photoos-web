"use client";

interface GalleryBulkActionsProps {
    selectedCount: number;
    totalCount: number;
    failedCount: number; // Added failedCount prop
    onSelectAll: () => void;
    onInvertSelection: () => void;
    onClearSelection: () => void;
    onDownload: () => void;
    onRetry: () => void;
    onRemove: () => void;
}

export default function GalleryBulkActions({
    selectedCount,
    totalCount,
    failedCount, // Destructured prop
    onSelectAll,
    onInvertSelection,
    onClearSelection,
    onDownload,
    onRetry,
    onRemove,
}: GalleryBulkActionsProps) {
    
    const isNoneSelected = selectedCount === 0;

    return (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
            <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-700">
                    {selectedCount} of {totalCount} selected
                </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    onClick={onSelectAll}
                    className="rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Select All
                </button>

                <button
                    type="button"
                    onClick={onInvertSelection}
                    disabled={isNoneSelected}
                    className="rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Invert
                </button>

                <button
                    type="button"
                    onClick={onDownload}
                    disabled={isNoneSelected}
                    className="rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Download
                </button>

                {/* Retry button disabled if selection is 0 or failed count is 0 */}
                <button
                    type="button"
                    onClick={onRetry}
                    disabled={selectedCount === 0 || failedCount === 0}
                    className="rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Retry
                </button>

                <button
                    type="button"
                    onClick={onRemove}
                    disabled={isNoneSelected}
                    className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Remove
                </button>

                <button
                    type="button"
                    onClick={onClearSelection}
                    disabled={isNoneSelected}
                    className="rounded-lg border bg-slate-100 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Clear
                </button>
            </div>
        </div>
    );
}