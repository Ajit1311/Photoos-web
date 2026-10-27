import {
  createClient,
  getClient,
  getClients,
  updateClient,
} from "@/lib/api/clients";

import {
  mapClientDtoToClient,
  mapClientDtosToClients,
} from "@/lib/mappers/client.mapper";

import type {
  Client,
} from "@/types/client";

import type {
  PaginationDto,
} from "@/types/api/project";

import type {
  CreateClientRequest,
  UpdateClientRequest,
} from "@/types/api/client";

export type ClientListResult = {
  clients: Client[];

  pagination: PaginationDto;
};

class ClientService {

  async getAll(
    studioId: string,
    page = 1,
    limit = 25,
    search = "",
  ): Promise<ClientListResult> {

    const response =
      await getClients(
        studioId,
        page,
        limit,
        search,
      );

    return {

      clients:
        mapClientDtosToClients(
          response.clients,
        ),

      pagination:
        response.pagination,

    };

  }

  async getById(
    studioId: string,
    clientId: string,
  ): Promise<Client> {

    const response =
      await getClient(
        studioId,
        clientId,
      );

    return mapClientDtoToClient(
      response.client,
    );

  }

  async create(
    studioId: string,
    payload: CreateClientRequest,
  ): Promise<Client> {

    const dto =
      await createClient(
        studioId,
        payload,
      );

    return mapClientDtoToClient(
      dto,
    );

  }

  async update(
    studioId: string,
    clientId: string,
    payload: UpdateClientRequest,
  ): Promise<Client> {

    const dto =
      await updateClient(
        studioId,
        clientId,
        payload,
      );

    return mapClientDtoToClient(
      dto,
    );

  }

}

export const clientService =
  new ClientService();