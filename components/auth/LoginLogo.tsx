export function LoginLogo() {
  return (
    <div className="flex flex-col items-center space-y-6">

      {/* REPLACED: Logo Icon color updated to #4F4FF7 */}
      <div
        className="flex h-20 w-20 items-center justify-center rounded-3xl shadow-xl"
        style={{
          backgroundColor: "#4F4FF7",
        }}
      >
        <span className="text-3xl font-bold text-primary-foreground">
          P
        </span>
      </div>

      <div className="space-y-2 text-center">

        {/* REPLACED: PhotoOS text with dual styling */}
        <h1 className="text-4xl font-bold tracking-tight">
          <span className="text-foreground">
            Photo
          </span>
          <span
            className="font-extrabold"
            style={{
              color: "#4F4FF7",
            }}
          >
            OS
          </span>
        </h1>

        <p className="max-w-sm text-sm text-muted-foreground">
          Photography Business Operating System
        </p>

      </div>

    </div>
  );
}