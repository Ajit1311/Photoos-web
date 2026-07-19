"use client";

import { useEffect, useState } from "react";

import { workspaceService } from "@/services/events/workspace.service";

export function useWorkspace(eventId: string) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      await workspaceService.initialize(eventId);
      setLoading(false);
    }

    if (eventId) {
      load();
    }
  }, [eventId]);

  return {
    loading,
  };
}