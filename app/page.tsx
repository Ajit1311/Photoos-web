import Logo from "@/components/logo/Logo";
import { APP_DESCRIPTION } from "@/constants/app";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="space-y-4 text-center">
        <Logo size="lg" />

        <p className="text-xl text-slate-400">
          {APP_DESCRIPTION}
        </p>
      </div>
    </main>
  );
}