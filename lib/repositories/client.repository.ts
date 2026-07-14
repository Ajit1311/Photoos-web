import {
  clientService,
  type ClientListResult,
} from "@/lib/services/client.service";

import type {
  Client,
} from "@/types/client";

import type {
  CreateClientRequest,
  UpdateClientRequest,
} from "@/types/api/client";

class ClientRepository {

  async getAll(
    studioId: string,
    page = 1,
    limit = 25,
    search = "",
  ): Promise<ClientListResult> {

    return clientService.getAll(
      studioId,
      page,
      limit,
      search,
    );

  }

  async getById(
    studioId: string,
    clientId: string,
  ): Promise<Client> {

    return clientService.getById(
      studioId,
      clientId,
    );

  }

  async create(
    studioId: string,
    payload: CreateClientRequest,
  ): Promise<Client> {

    return clientService.create(
      studioId,
      payload,
    );

  }

  async update(
    studioId: string,
    clientId: string,
    payload: UpdateClientRequest,
  ): Promise<Client> {

    return clientService.update(
      studioId,
      clientId,
      payload,
    );

  }

}

export const clientRepository =
  new ClientRepository();