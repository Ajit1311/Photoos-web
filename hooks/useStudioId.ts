"use client";

import { useEffect, useState } from "react";
import { useBootstrapContext } from "@/context/BootstrapContext";
import { resolveUserStudio } from "@/lib/auth/resolve-user-studio";

export function useStudioId() {
  const { data, loading } = useBootstrapContext();

  const [fallbackStudioId, setFallbackStudioId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("photoos_active_studio_id");
    }
    return null;
  });

  const membershipStudioId =
    data?.workspace?.membership?.studioId ?? null;

  const workspaceStudioId =
    data?.workspace?.studio?.id ?? null;

  const resolvedStudioId =
    membershipStudioId ?? workspaceStudioId ?? fallbackStudioId ?? null;

  useEffect(() => {
    if (resolvedStudioId && typeof window !== "undefined") {
      localStorage.setItem("photoos_active_studio_id", resolvedStudioId);
    } else if (!resolvedStudioId && !loading) {
      void resolveUserStudio().then((res) => {
        if (res?.studioId) {
          setFallbackStudioId(res.studioId);
          if (typeof window !== "undefined") {
            localStorage.setItem("photoos_active_studio_id", res.studioId);
          }
        }
      });
    }
  }, [resolvedStudioId, loading]);

  return {
    studioId: resolvedStudioId,
    bootstrap: data,
    bootstrapLoading: loading && !resolvedStudioId,
  };
}