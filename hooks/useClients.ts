"use client";

import { useCallback, useEffect, useState } from "react";
import { useBootstrapContext } from "@/context/BootstrapContext";
import { clientRepository } from "@/lib/repositories/client.repository";
import type { Client } from "@/types/client";

export function useClients() {
  const { data: bootstrap } = useBootstrapContext();

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // load फंक्शन तसेच ठेवले आहे कारण हुक बाहेर 'reload' म्हणून ते रिटर्न करतोय
  const load = useCallback(
    async (search = "") => {
      if (!bootstrap) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const studioId = bootstrap.workspace.membership.studioId;
        const result = await clientRepository.getAll(
          studioId,
          1,
          25,
          search
        );
        setClients(result.clients);
      } catch (err) {
        console.error(err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Unable to load clients.");
        }
      } finally {
        setLoading(false);
      }
    },
    [bootstrap]
  );

  // तुमच्या सांगण्यानुसार रिप्लेस केलेला नवीन useEffect
  useEffect(() => {
    if (!bootstrap) {
      return;
    }

    const studioId = bootstrap.workspace.membership.studioId;
    let cancelled = false;

    async function fetchClients() {
      setLoading(true);
      setError(null);

      try {
        const result = await clientRepository.getAll(
          studioId,
          1,
          25,
          ""
        );

        if (!cancelled) {
          setClients(result.clients);
        }
      } catch (err) {
        if (!cancelled) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError("Unable to load clients.");
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchClients();

    return () => {
      cancelled = true;
    };
  }, [bootstrap]);

  return {
    clients,
    loading,
    error,
    reload: load, // जर बाहेरून मॅन्युअली रीलोड करायचे असेल तर
  };
}