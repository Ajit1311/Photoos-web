"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { getSession } from "@/lib/auth/auth.service";
import { getBootstrap } from "@/lib/api/bootstrap";

export default function LoadingPage() {
  const router = useRouter();

  useEffect(() => {
    async function bootstrap() {
      try {
        const {
          data: { session },
        } = await getSession();

        if (!session) {
          router.replace("/login");
          return;
        }

        const data = await getBootstrap();

        if (data.bootstrapRequired) {
          router.replace("/setup/studio");
          return;
        }

        router.replace("/dashboard");
      } catch (error) {
        console.error(error);
        router.replace("/login");
      }
    }

    bootstrap();
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="space-y-4 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />

        <h2 className="text-xl font-semibold">
          Signing you in...
        </h2>

        <p className="text-sm text-muted-foreground">
          Preparing your workspace.
        </p>
      </div>
    </main>
  );
}