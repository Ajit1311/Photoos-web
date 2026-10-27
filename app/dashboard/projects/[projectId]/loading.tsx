export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-72 rounded bg-slate-200" />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="h-48 rounded-xl bg-slate-200" />
        <div className="h-48 rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}