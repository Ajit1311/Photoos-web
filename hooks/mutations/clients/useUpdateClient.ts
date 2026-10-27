"use client";

import {
  useQueryClient,
} from "@tanstack/react-query";

import {
  useAppMutation,
} from "@/hooks/useAppMutation";

import {
  QUERY_KEYS,
} from "@/hooks/query-keys";

import {
  useStudioId,
} from "@/hooks/useStudioId";

import {
  clientsRepository,
} from "@/lib/repositories/clients.repository";

import type {
  ClientDto,
  UpdateClientRequest,
} from "@/types/api/client";

type UpdateClientVariables = {
  clientId: string;
  payload: UpdateClientRequest;
};

export function useUpdateClient() {

  const queryClient =
    useQueryClient();

  const {
    studioId,
  } = useStudioId();

  return useAppMutation<
    ClientDto,
    Error,
    UpdateClientVariables
  >({

    mutationFn:
      async ({
        clientId,
        payload,
      }) => {

        if (!studioId) {

          throw new Error(
            "Studio ID is required.",
          );

        }

        return clientsRepository.update(
          studioId,
          clientId,
          payload,
        );

      },

    onSuccess:
      async (client) => {

        if (!studioId) {
          return;
        }

        const clientQueryKey =
          QUERY_KEYS.client(
            studioId,
            client.id,
          );

        /*
         * Immediately update the
         * currently cached client.
         *
         * This makes the detail page
         * reflect the saved values
         * without waiting for a refetch.
         */
        queryClient.setQueryData(
          clientQueryKey,
          client,
        );

        /*
         * Mark the client detail query
         * stale and refetch it.
         *
         * This guarantees that the UI
         * eventually matches the database.
         */
        await queryClient.invalidateQueries({
          queryKey:
            clientQueryKey,
        });

      },

    invalidateKeys: [
      QUERY_KEYS.clients,
    ],

  });

}