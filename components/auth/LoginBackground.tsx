export function LoginBackground() {
  return (
    <>
      {/* Top Glow */}
      <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      {/* Bottom Left Glow */}
      <div className="absolute bottom-0 left-0 h-[420px] w-[420px] rounded-full bg-blue-500/10 blur-3xl" />

      {/* Bottom Right Glow */}
      <div className="absolute right-0 top-1/3 h-[360px] w-[360px] rounded-full bg-cyan-500/10 blur-3xl" />

      {/* Grid */}
      <div
        className="
          absolute inset-0
          bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)]
          bg-[size:40px_40px]
          opacity-40
        "
      />

      {/* Radial Fade */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,hsl(var(--background))_90%)]" />
    </>
  );
}