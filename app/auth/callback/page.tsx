"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase/client";

export default function AuthCallbackPage() {

  const router = useRouter();

  useEffect(() => {

    async function completeLogin() {

      const {
        data,
        error,
      } = await supabase.auth.getSession();

      if (error) {

        console.error(error);

        router.replace("/login");

        return;

      }

      if (!data.session) {

        router.replace("/login");

        return;

      }

      router.replace("/auth/loading");

    }

    completeLogin();

  }, [router]);

  return (

    <main className="flex min-h-screen items-center justify-center">

      <div className="text-center">

        <h2 className="text-xl font-semibold">
          Signing you in...
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Please wait.
        </p>

      </div>

    </main>

  );

}