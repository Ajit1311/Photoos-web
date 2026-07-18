"use client";

import { useQuery } from "@tanstack/react-query";

import {
  bootstrapRepository,
} from "@/lib/repositories/bootstrap.repository";

import type {
  BootstrapResponse,
} from "@/types/bootstrap/bootstrap";

const BOOTSTRAP_QUERY_KEY = [
  "bootstrap",
];

export function useBootstrap() {
  const query =
    useQuery<BootstrapResponse, Error>({
      queryKey:
        BOOTSTRAP_QUERY_KEY,

      queryFn: () =>
        bootstrapRepository.load(),

      staleTime: 1000 * 60 * 5,

      gcTime:
        1000 *
        60 *
        10,

      retry: 1,

      refetchOnWindowFocus:
        false,
    });

  return {

    data:
      query.data ?? null,

    loading:
      query.isPending,

    error:
      query.error ?? null,

    reload:
      async () => {

        await query.refetch();

      },

  };

}