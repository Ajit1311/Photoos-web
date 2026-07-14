import type {
  Client,
} from "@/types/client";

import type {
  ClientDto,
} from "@/types/api/client";

export function mapClientDtoToClient(
  dto: ClientDto,
): Client {

  return {

    id: dto.id,

    name: dto.name,

    phone: dto.phone,

    email: dto.email,

    address: dto.address,

    status:
      dto.status === "inactive"
        ? "inactive"
        : "active",

    createdAt:
      dto.created_at,

    updatedAt:
      dto.updated_at,

  };

}

export function mapClientDtosToClients(
  dtos: ClientDto[],
): Client[] {

  return dtos.map(
    mapClientDtoToClient,
  );

}