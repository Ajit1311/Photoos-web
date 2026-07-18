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
} from "@/types/api/client";

class ClientsRepository {

  async list(
    studioId: string,
    page = 1,
    limit = 25,
    search = "",
  ): Promise<ClientListResponse> {

    return getClients(
      studioId,
      page,
      limit,
      search,
    );

  }

  async get(
    studioId: string,
    clientId: string,
  ): Promise<ClientDto> {

    return getClient(
      studioId,
      clientId,
    );

  }

  async create(
    studioId: string,
    payload: CreateClientRequest,
  ): Promise<ClientDto> {

    return createClient(
      studioId,
      payload,
    );

  }

  async update(
    studioId: string,
    clientId: string,
    payload: UpdateClientRequest,
  ): Promise<ClientDto> {

    return updateClient(
      studioId,
      clientId,
      payload,
    );

  }

}

export const clientsRepository =
  new ClientsRepository();