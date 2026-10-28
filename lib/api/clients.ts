import { supabase } from "@/lib/supabase/client";
import { getAccessToken } from "@/lib/auth/session";

import type {
  ClientDto,
  ClientListResponse,
  ClientDetailsResponse,
  CreateClientRequest,
  UpdateClientRequest,
} from "@/types/api/client";


const LIST_FUNCTION =
  "client-list-worker";


const GET_FUNCTION =
  "client-get-worker";


const CREATE_FUNCTION =
  "client-create-worker";


const UPDATE_FUNCTION =
  "client-update-worker";


type ClientListWorkerItem = {
  client: ClientDto;

  projects_count: number;
};


type ClientListWorkerResponse = {
  total: number;

  clients: ClientListWorkerItem[];
};


export async function getClients(
  studioId: string,
  page = 1,
  limit = 25,
  search = "",
): Promise<ClientListResponse> {
  const offset = (page - 1) * limit;

  // 1. Try edge function first if token is available
  try {
    const accessToken = await getAccessToken();

    if (accessToken) {
      const { data, error } = await supabase.functions.invoke(
        LIST_FUNCTION,
        {
          method: "POST",
          body: {
            status: null,
            search: search.trim() || null,
            limit,
            offset,
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "x-studio-id": studioId,
          },
        },
      );

      if (!error && data?.success && data?.data) {
        const workerData = data.data as ClientListWorkerResponse;
        const total = Number(workerData?.total ?? 0);
        const clients = Array.isArray(workerData?.clients)
          ? workerData.clients.map((item) => ({
              ...item.client,
              metadata: {
                ...(item.client.metadata ?? {}),
                projects_count: item.projects_count,
              },
            }))
          : [];

        return {
          clients,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.max(1, Math.ceil(total / limit)),
          },
        };
      }
    }
  } catch (edgeErr) {
    console.warn("[getClients] Edge function notice, falling back to direct DB:", edgeErr);
  }

  // 2. Direct Supabase DB query fallback
  try {
    let query = supabase
      .from("clients")
      .select("*", { count: "exact" })
      .eq("studio_id", studioId)
      .order("created_at", { ascending: false });

    if (search.trim()) {
      query = query.or(
        `display_name.ilike.%${search.trim()}%,company_name.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%,phone.ilike.%${search.trim()}%`,
      );
    }

    const { data: dbClients, count, error: dbError } = await query.range(
      offset,
      offset + limit - 1,
    );

    if (!dbError && dbClients) {
      const total = count ?? dbClients.length;
      return {
        clients: dbClients.map((client) => ({
          ...client,
          metadata: {
            ...(client.metadata ?? {}),
            projects_count: 0,
          },
        })) as ClientDto[],
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      };
    }
  } catch (dbErr) {
    console.warn("[getClients] DB fallback error:", dbErr);
  }

  // 3. Resilient empty state fallback
  return {
    clients: [],
    pagination: {
      page,
      limit,
      total: 0,
      totalPages: 1,
    },
  };
}

export async function getClient(
  studioId: string,
  clientId: string,
): Promise<ClientDetailsResponse> {
  // 1. Try edge function first
  try {
    const accessToken = await getAccessToken();
    if (accessToken) {
      const { data, error } = await supabase.functions.invoke(
        GET_FUNCTION,
        {
          method: "POST",
          body: {
            client_id: clientId,
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "x-studio-id": studioId,
          },
        },
      );

      if (!error && data?.success && data?.data?.client) {
        return data.data as ClientDetailsResponse;
      }
    }
  } catch (edgeErr) {
    console.warn("[getClient] Edge function notice, falling back to direct DB:", edgeErr);
  }

  // 2. Direct Supabase DB query fallback
  try {
    const { data: dbClient, error: dbError } = await supabase
      .from("clients")
      .select("*")
      .eq("id", clientId)
      .eq("studio_id", studioId)
      .maybeSingle();

    if (!dbError && dbClient) {
      return {
        client: {
          ...dbClient,
          metadata: {
            ...(dbClient.metadata ?? {}),
            projects_count: 0,
          },
        } as ClientDto,
        projects: [],
      } as ClientDetailsResponse;
    }
  } catch (dbErr) {
    console.warn("[getClient] DB fallback error:", dbErr);
  }

  throw new Error("Client not found.");
}


export async function createClient(
  studioId: string,
  payload: CreateClientRequest,
): Promise<ClientDto> {
  // 1. Try edge function first
  try {
    const accessToken = await getAccessToken();
    const { data, error } = await supabase.functions.invoke(
      CREATE_FUNCTION,
      {
        method: "POST",
        body: payload,
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          "x-studio-id": studioId,
        },
      },
    );

    if (!error && data?.success && data?.data) {
      return data.data as ClientDto;
    }
  } catch (edgeErr) {
    console.warn("[createClient] Edge function notice, falling back to direct DB:", edgeErr);
  }

  // 2. Direct Supabase DB insert fallback
  try {
    const clientCode = `CLI_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const { data: newClient, error: dbError } = await supabase
      .from("clients")
      .insert({
        studio_id: studioId,
        code: clientCode,
        display_name: payload.display_name,
        first_name: payload.first_name ?? null,
        last_name: payload.last_name ?? null,
        company_name: payload.company_name ?? null,
        email: payload.email ?? null,
        phone: payload.phone ?? null,
        notes: payload.notes ?? null,
        status: ((payload as Record<string, unknown>).status as string) ?? "lead",
        metadata: payload.metadata ?? {},
      })
      .select()
      .single();

    if (!dbError && newClient) {
      return newClient as ClientDto;
    }
  } catch (dbErr) {
    console.warn("[createClient] DB fallback error:", dbErr);
  }

  throw new Error("Failed to create client.");
}


export async function updateClient(
  studioId: string,
  clientId: string,
  payload: UpdateClientRequest,
): Promise<ClientDto> {
  // 1. Try edge function first
  try {
    const accessToken = await getAccessToken();
    const { data, error } = await supabase.functions.invoke(
      UPDATE_FUNCTION,
      {
        method: "POST",
        body: {
          client_id: clientId,
          ...payload,
        },
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          "x-studio-id": studioId,
        },
      },
    );

    if (!error && data?.success && data?.data) {
      return data.data as ClientDto;
    }
  } catch (edgeErr) {
    console.warn("[updateClient] Edge function notice, falling back to direct DB:", edgeErr);
  }

  // 2. Direct Supabase DB update fallback
  try {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (payload.display_name !== undefined) updateData.display_name = payload.display_name;
    if (payload.first_name !== undefined) updateData.first_name = payload.first_name;
    if (payload.last_name !== undefined) updateData.last_name = payload.last_name;
    if (payload.company_name !== undefined) updateData.company_name = payload.company_name;
    if (payload.email !== undefined) updateData.email = payload.email;
    if (payload.phone !== undefined) updateData.phone = payload.phone;
    if (payload.notes !== undefined) updateData.notes = payload.notes;
    if (payload.status !== undefined) updateData.status = payload.status;
    if (payload.metadata !== undefined) updateData.metadata = payload.metadata;

    const { data: updatedClient, error: dbError } = await supabase
      .from("clients")
      .update(updateData)
      .eq("id", clientId)
      .eq("studio_id", studioId)
      .select()
      .single();

    if (!dbError && updatedClient) {
      return updatedClient as ClientDto;
    }
  } catch (dbErr) {
    console.warn("[updateClient] DB fallback error:", dbErr);
  }

  throw new Error("Failed to update client.");
}