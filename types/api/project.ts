export type ProjectDto = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  event_type: string | null;
  event_date: string | null;
  client_id: string;
  project_manager_id: string | null;
  budget: number;
  advance_amount: number;
  balance_amount: number;
  notes: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export type PaginationDto = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type GetProjectsResponse = {
  projects: ProjectDto[];
  pagination: PaginationDto;
};
export type CreateProjectRequest = {
  title: string;

  description: string | null;

  event_type: string | null;

  event_date: string | null;

  client_id: string;

  project_manager_id: string | null;

  budget: number;

  advance_amount: number;

  notes: string | null;

  metadata: Record<string, unknown> | null;
};