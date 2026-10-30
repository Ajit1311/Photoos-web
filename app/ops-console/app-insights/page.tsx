"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AppInsightsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/ops-console/app-insights/app-analytics");
  }, [router]);

  return null;
}
