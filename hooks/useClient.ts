"use client";

import {
  useQuery,
} from "@tanstack/react-query";

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
  ClientDetailsResponse,
  ClientDto,
} from "@/types/api/client";


export type ClientWithProjects =
  ClientDto & {
    projects:
      ClientDetailsResponse["projects"];
  };


export function useClient(
  clientId: string,
) {

  const {
    studioId,
  } = useStudioId();

  return useQuery<
    ClientWithProjects,
    Error
  >({

    queryKey:
      QUERY_KEYS.client(
        studioId ?? "",
        clientId,
      ),

    enabled:
      Boolean(studioId) &&
      Boolean(clientId),

    queryFn:
      async () => {

        const response =
          await clientsRepository.get(
            studioId!,
            clientId,
          );

        return {
          ...response.client,

          projects:
            response.projects ?? [],
        };

      },

    staleTime:
      1000 * 60,

    gcTime:
      1000 * 60 * 10,

    retry:
      2,

    refetchOnWindowFocus:
      false,

  });

}