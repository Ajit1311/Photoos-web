"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function CorporateLoginRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("mode", "corporate");
    router.replace(`/login?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0A3F61] text-white">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#EF8619]" />
        <p className="text-sm font-medium tracking-wide">
          Connecting to PhotoOS Corporate Portal...
        </p>
      </div>
    </main>
  );
}

export default function CorporateLoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#0A3F61] text-white">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#EF8619]" />
            <p className="text-sm font-medium tracking-wide">
              Connecting to PhotoOS Corporate Portal...
            </p>
          </div>
        </main>
      }
    >
      <CorporateLoginRedirectContent />
    </Suspense>
  );
}
