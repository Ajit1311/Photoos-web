export function AuthDivider() {
  return (
    <div className="flex items-center gap-4">

      <div className="h-px flex-1 bg-border" />

      <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
        OR
      </span>

      <div className="h-px flex-1 bg-border" />

    </div>
  );
}