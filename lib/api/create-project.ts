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