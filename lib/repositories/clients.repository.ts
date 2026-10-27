import {
  getClients,
  getClient,
  createClient,
  updateClient,
} from "@/lib/api/clients";

import type {
  ClientDto,
  ClientListResponse,
  CreateClientRequest,
  UpdateClientRequest,
  ClientDetailsResponse,
} from "@/types/api/client";

class ClientsRepository {

  async list(
    studioId: string,
    page = 1,
    limit = 25,
    search = "",
  ): Promise<ClientListResponse> {

    const response =
      await getClients(
        studioId,
        page,
        limit,
        search,
      );

    return response;

  }

  async get(
  studioId: string,
  clientId: string,
): Promise<ClientDetailsResponse> {

  const response =
    await getClient(
      studioId,
      clientId,
    );

  return response;

}

  async create(
    studioId: string,
    payload: CreateClientRequest,
  ): Promise<ClientDto> {

    const response =
      await createClient(
        studioId,
        payload,
      );

    return response;

  }

  async update(
    studioId: string,
    clientId: string,
    payload: UpdateClientRequest,
  ): Promise<ClientDto> {

    const response =
      await updateClient(
        studioId,
        clientId,
        payload,
      );

    return response;

  }

}

export const clientsRepository =
  new ClientsRepository();