import { supabase } from "@/lib/supabase/client";
import { getAccessToken } from "@/lib/auth/session";

import type {
  ClientDto,
  ClientListResponse,
  ClientDetailsResponse,
  CreateClientRequest,
  UpdateClientRequest,
} from "@/types/api/client";

const LIST_FUNCTION = "client-list-worker";
const GET_FUNCTION = "client-get-worker";
const CREATE_FUNCTION = "client-create-worker";
const UPDATE_FUNCTION = "client-update-worker";

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

  // 1. Primary: Server-side API route
  try {
    const accessToken = await getAccessToken();
    const headers: Record<string, string> = {};
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const params = new URLSearchParams({
      studioId: studioId || "",
      page: String(page),
      limit: String(limit),
      search: search.trim(),
    });

    const res = await fetch(`/api/clients?${params.toString()}`, {
      method: "GET",
      headers,
    });

    if (res.ok) {
      const data = await res.json().catch(() => null);
      if (data?.success && data?.data) {
        return data.data as ClientListResponse;
      }
    }
  } catch (apiErr) {
    console.warn("[getClients] API route notice, falling back:", apiErr);
  }

  // 2. Fallback: Edge function
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

  // 3. Fallback: Direct Supabase DB query
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
  // 1. Primary: Server-side API route
  try {
    const accessToken = await getAccessToken();
    const headers: Record<string, string> = {};
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const res = await fetch(`/api/clients/${encodeURIComponent(clientId)}`, {
      method: "GET",
      headers,
    });

    if (res.ok) {
      const data = await res.json().catch(() => null);
      if (data?.success && data?.data) {
        return data.data as ClientDetailsResponse;
      }
    }
  } catch (apiErr) {
    console.warn("[getClient] API route notice, falling back:", apiErr);
  }

  // 2. Fallback: Edge function
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

  // 3. Fallback: Direct Supabase DB query
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
  let lastError: string | null = null;

  // 1. Primary: Server-side API route (resolves studio, handles service role, bypasses RLS)
  try {
    const accessToken = await getAccessToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const res = await fetch("/api/clients", {
      method: "POST",
      headers,
      body: JSON.stringify({
        studio_id: studioId,
        ...payload,
      }),
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data?.success && data?.data) {
      if (data?.studio_id && typeof window !== "undefined") {
        localStorage.setItem("photoos_active_studio_id", data.studio_id);
        localStorage.setItem("photoos_studio_id", data.studio_id);
      }
      return data.data as ClientDto;
    }

    if (data?.error) {
      if (res.status === 409) {
        throw new Error(data.error);
      }
      lastError = data.error;
    }
  } catch (apiErr: any) {
    if (apiErr?.message && apiErr.message.includes("already exists")) {
      throw apiErr;
    }
    console.warn("[createClient] API route notice, trying fallbacks:", apiErr);
  }

  // 2. Fallback: Edge function
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

    if (error?.message) {
      lastError = error.message;
    }
  } catch (edgeErr: any) {
    console.warn("[createClient] Edge function notice, falling back to direct DB:", edgeErr);
    if (edgeErr?.message) {
      lastError = edgeErr.message;
    }
  }

  // 3. Fallback: Direct Supabase DB insert
  try {
    const randomPart = typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID().slice(0, 8).toUpperCase()
      : Date.now().toString(36).toUpperCase();
    const clientCode = `CLI_${randomPart}`;
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

    if (dbError?.message) {
      lastError = dbError.message;
    }
  } catch (dbErr: any) {
    console.warn("[createClient] DB fallback error:", dbErr);
    if (dbErr?.message) {
      lastError = dbErr.message;
    }
  }

  throw new Error(lastError || "Failed to create client.");
}

export async function updateClient(
  studioId: string,
  clientId: string,
  payload: UpdateClientRequest,
): Promise<ClientDto> {
  // 1. Primary: Server-side API route
  try {
    const accessToken = await getAccessToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const res = await fetch(`/api/clients/${encodeURIComponent(clientId)}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json().catch(() => null);
      if (data?.success && data?.data) {
        return data.data as ClientDto;
      }
    }
  } catch (apiErr) {
    console.warn("[updateClient] API route notice, falling back:", apiErr);
  }

  // 2. Fallback: Edge function
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

  // 3. Fallback: Direct Supabase DB update
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
