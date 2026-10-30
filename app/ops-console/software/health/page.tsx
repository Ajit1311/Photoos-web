"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SoftwareHealthRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/ops-console/software/system-health");
  }, [router]);

  return null;
}

