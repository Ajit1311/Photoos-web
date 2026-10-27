"use client";

import Link from "next/link";

interface WorkspaceEmptyProps {
  title?: string;
  description?: string;
}

export default function WorkspaceEmpty({
  title = "Workspace not found",
  description = "This event does not exist or you don't have permission to access it.",
}: WorkspaceEmptyProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

        <div className="flex flex-col items-center text-center">

          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <span className="text-2xl">📁</span>
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-900">
            {title}
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            {description}
          </p>

          <div className="mt-6 flex gap-3">
            <Link
              href="/dashboard/events"
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Back to Events
            </Link>

            <button
              onClick={() => window.location.reload()}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Refresh
            </button>
          </div>

        </div>

      </div>
    </main>
  );
}