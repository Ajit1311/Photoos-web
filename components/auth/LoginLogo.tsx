export function LoginLogo() {
  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#0F589B] shadow-xl">
        <img
          src="/PhotoOS-brand-master.png"
          alt="PhotoOS"
          className="h-[76%] w-[76%] object-contain"
        />
      </div>

      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          PhotoOS
        </h1>

        <p className="max-w-sm text-sm text-muted-foreground">
          Photography Business Operating System
        </p>
      </div>
    </div>
  );
}
