"use client";

import {
  useAppQuery,
} from "@/hooks/useAppQuery";

import {
  useStudioId,
} from "@/hooks/useStudioId";

import {
  QUERY_KEYS,
} from "@/hooks/query-keys";

import {
  clientsRepository,
} from "@/lib/repositories/clients.repository";

import type {
  ClientListResponse,
  ClientDto,
} from "@/types/api/client";

type UseClientsOptions = {
  page?: number;
  limit?: number;
  search?: string;
  allPages?: boolean;
};

export function useClients(
  options: UseClientsOptions = {},
) {
  const {
    studioId,
  } = useStudioId();

  const page =
    options.page ?? 1;

  const limit =
    options.limit ?? 25;

  const search =
    options.search ?? "";

  const allPages =
    options.allPages ?? false;

  const query =
    useAppQuery<ClientListResponse>({
      queryKey: [
        ...QUERY_KEYS.clients,
        studioId,
        page,
        limit,
        search,
        allPages,
      ],

      enabled:
        Boolean(studioId),

      queryFn:
        async () => {
          if (!studioId) {
            throw new Error(
              "Active studio ID is missing.",
            );
          }

          const firstPage =
            await clientsRepository.list(
              studioId,
              page,
              limit,
              search,
            );

          if (
            !allPages ||
            firstPage.pagination.totalPages <= 1
          ) {
            return firstPage;
          }

          const allClients: ClientDto[] = [
            ...firstPage.clients,
          ];

          for (
            let currentPage = page + 1;
            currentPage <=
              firstPage.pagination.totalPages;
            currentPage += 1
          ) {
            const response =
              await clientsRepository.list(
                studioId,
                currentPage,
                limit,
                search,
              );

            allClients.push(
              ...response.clients,
            );
          }

          const uniqueClients =
            Array.from(
              new Map(
                allClients.map(
                  (client) => [
                    client.id,
                    client,
                  ],
                ),
              ).values(),
            );

          return {
            clients: uniqueClients,
            pagination: {
              ...firstPage.pagination,
              page,
              total:
                firstPage.pagination.total,
              totalPages:
                firstPage.pagination.totalPages,
            },
          };
        },
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

    refreshing:
      query.isFetching,

    error:
      query.error ?? null,

    reload:
      query.refetch,
  };
}