export interface ClientDto {
  id: string;

  studio_id: string;

  assigned_to: string | null;

  code: string | null;

  display_name: string;

  first_name: string | null;

  last_name: string | null;

  company_name: string | null;

  email: string | null;

  phone: string | null;

  alternate_phone: string | null;

  lead_source: string | null;

  address: string | null;

  city: string | null;

  state: string | null;

  country: string | null;

  postal_code: string | null;

  notes: string | null;

  status: string;

  metadata: Record<string, unknown> | null;

  created_at: string;

  updated_at: string;
}


export interface ClientProjectDto {
  id: string;

  code: string | null;

  title: string;

  status: string;

  event_type: string | null;

  budget: number;

  created_at: string;
}


export interface ClientDetailsResponse {
  client: ClientDto;

  projects: ClientProjectDto[];
}


export type ClientListResponse = {
  clients: ClientDto[];

  pagination: {
    page: number;

    limit: number;

    total: number;

    totalPages: number;
  };
};


export type CreateClientRequest = {
  display_name: string;

  first_name?: string;

  last_name?: string;

  company_name?: string;

  email?: string;

  phone?: string;

  alternate_phone?: string;

  lead_source?: string;

  address?: string;

  city?: string;

  state?: string;

  country?: string;

  postal_code?: string;

  notes?: string;

  metadata?: Record<string, unknown>;
};


export type UpdateClientRequest = {
  display_name?: string;

  first_name?: string;

  last_name?: string;

  company_name?: string;

  email?: string;

  phone?: string;

  alternate_phone?: string;

  lead_source?: string;

  address?: string;

  city?: string;

  state?: string;

  country?: string;

  postal_code?: string;

  notes?: string;

  status?: string;

  metadata?: Record<string, unknown>;
};