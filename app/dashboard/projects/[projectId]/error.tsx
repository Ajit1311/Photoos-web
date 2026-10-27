"use client";

export default function Error({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6">
      <h2 className="text-lg font-semibold text-red-700">
        Failed to load project
      </h2>

      <button
        onClick={reset}
        className="mt-4 rounded-lg border px-4 py-2"
      >
        Try Again
      </button>
    </div>
  );
}