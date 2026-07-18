"use client";

import { useQuery } from "@tanstack/react-query";

import {
  useBootstrapContext,
} from "@/context/BootstrapContext";

import {
  clientsRepository,
} from "@/lib/repositories/clients.repository";

import type {
  ClientListResponse,
} from "@/types/api/client";

const CLIENTS_QUERY_KEY = [
  "clients",
];

type UseClientsOptions = {
  page?: number;
  limit?: number;
  search?: string;
};

export function useClients(
  options: UseClientsOptions = {},
) {

  const {
    data: bootstrap,
  } =
    useBootstrapContext();

  const studioId =
    bootstrap?.workspace?.studio?.id;

  const page =
    options.page ?? 1;

  const limit =
    options.limit ?? 25;

  const search =
    options.search ?? "";

  const query =
    useQuery<ClientListResponse, Error>({

      queryKey: [
        ...CLIENTS_QUERY_KEY,
        studioId,
        page,
        limit,
        search,
      ],

      enabled:
        !!studioId,

      queryFn: () =>
        clientsRepository.list(
          studioId!,
          page,
          limit,
          search,
        ),

      staleTime:
        1000 * 60,

      gcTime:
        1000 *
        60 *
        10,

      retry: 2,

      refetchOnWindowFocus:
        false,

    });

  return {

    data:
      query.data ?? null,

    clients:
      query.data?.clients ?? [],

    pagination:
      query.data?.pagination ?? null,

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