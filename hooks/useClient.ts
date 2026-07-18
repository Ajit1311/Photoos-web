"use client";

import { useQuery } from "@tanstack/react-query";

import { useBootstrapContext } from "@/context/BootstrapContext";

import { clientsRepository } from "@/lib/repositories/clients.repository";

import type {
  ClientDto,
} from "@/types/api/client";

export function useClient(
  clientId: string,
) {

  const {
    data: bootstrap,
  } =
    useBootstrapContext();

  const studioId =
    bootstrap?.workspace?.studio?.id;

  return useQuery<ClientDto, Error>({

    queryKey: [
      "client",
      studioId,
      clientId,
    ],

    enabled:
      !!studioId &&
      !!clientId,

    queryFn: () =>
      clientsRepository.get(
        studioId!,
        clientId,
      ),

    staleTime:
      1000 * 60,

  });

}