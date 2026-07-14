export type ClientDto = {
  id: string;

  name: string;

  phone: string;

  email: string | null;

  address: string | null;

  status: string;

  created_at: string;

  updated_at: string;
};

export type CreateClientRequest = {
  name: string;

  phone: string;

  email: string | null;

  address: string | null;
};

export type UpdateClientRequest = {
  name: string;

  phone: string;

  email: string | null;

  address: string | null;

  status: string;
};

export type ClientListResponse = {
  clients: ClientDto[];

  pagination: {
    page: number;

    limit: number;

    total: number;

    totalPages: number;
  };
};