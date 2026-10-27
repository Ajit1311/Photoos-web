"use client";

import {
  useStudioId,
} from "@/hooks/useStudioId";

import {
  useAppMutation,
} from "@/hooks/useAppMutation";

import {
  QUERY_KEYS,
} from "@/hooks/query-keys";

import {
  clientsRepository,
} from "@/lib/repositories/clients.repository";

import type {
  ClientDto,
  CreateClientRequest,
} from "@/types/api/client";

export function useCreateClient() {

  const {
    studioId,
  } = useStudioId();

  return useAppMutation<
    ClientDto,
    Error,
    CreateClientRequest
  >({

    mutationFn:
      async (
        payload,
      ) => {

        if (!studioId) {

          throw new Error(
            "Studio ID is required.",
          );

        }

        return clientsRepository.create(
          studioId,
          payload,
        );

      },

    invalidateKeys: [

      QUERY_KEYS.clients,

    ],

  });

}