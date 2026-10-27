"use client";

export default function WorkspaceSkeleton() {
  return (
    <main className="min-h-screen bg-slate-100">
      <div className="animate-pulse">

        <div className="border-b border-slate-200 bg-white">
          <div className="px-8 py-6">

            <div className="h-10 w-80 rounded-lg bg-slate-200" />

            <div className="mt-4 h-5 w-56 rounded bg-slate-200" />

            <div className="mt-3 h-4 w-72 rounded bg-slate-200" />

            <div className="mt-8 grid grid-cols-7 gap-3">
              {Array.from({ length: 7 }).map((_, index) => (
                <div
                  key={index}
                  className="h-24 rounded-xl bg-slate-200"
                />
              ))}
            </div>

          </div>
        </div>

        <div className="p-8">
          <div className="h-96 rounded-2xl bg-white" />
        </div>

      </div>
    </main>
  );
}