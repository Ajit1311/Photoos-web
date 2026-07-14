export type ClientStatus =
  | "active"
  | "inactive";

export interface Client {

  id: string;

  name: string;

  phone: string;

  email: string | null;

  address: string | null;

  status: ClientStatus;

  createdAt: string;

  updatedAt: string;

}

export interface ClientSearchResult {

  clients: Client[];

  total: number;

}