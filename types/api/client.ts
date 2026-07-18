export type ClientDto = {
  id: string;

  studio_id: string;

  assigned_to: string | null;

  code: string | null;

  display_name: string;

  company_name: string | null;

  email: string | null;

  phone: string | null;

  notes: string | null;

  status: string;

  metadata: Record<string, unknown> | null;

  created_at: string;

  updated_at: string;
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

export type CreateClientRequest = {
  name: string;
  email?: string;
  phone?: string;
  company_name?: string;
  notes?: string;
};

export type UpdateClientRequest = {
  name?: string;
  email?: string;
  phone?: string;
  company_name?: string;
  notes?: string;
};