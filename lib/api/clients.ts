import { supabase } from "@/lib/supabase/client";

import type {
  ClientDto,
  ClientListResponse,
  CreateClientRequest,
  UpdateClientRequest,
} from "@/types/api/client";

const FUNCTION_NAME = "clients";

export async function getClients(
  studioId: string,
  page = 1,
  limit = 25,
  search = "",
): Promise<ClientListResponse> {

  const query =
    new URLSearchParams();

  query.set(
    "page",
    page.toString(),
  );

  query.set(
    "limit",
    limit.toString(),
  );

  if (search.trim()) {

    query.set(
      "search",
      search.trim(),
    );

  }

  const {
    data,
    error,
  } =
    await supabase.functions.invoke(
      `${FUNCTION_NAME}?${query.toString()}`,
      {
        method: "GET",

        headers: {
          "x-studio-id":
            studioId,
        },
      },
    );

  if (error) {
    throw error;
  }

  if (!data?.success) {

    throw new Error(
      "Failed to load clients.",
    );

  }

  return data.data as ClientListResponse;

}

export async function getClient(
  studioId: string,
  clientId: string,
): Promise<ClientDto> {

  const {
    data,
    error,
  } =
    await supabase.functions.invoke(
      `${FUNCTION_NAME}/${clientId}`,
      {
        method: "GET",

        headers: {
          "x-studio-id":
            studioId,
        },
      },
    );

  if (error) {
    throw error;
  }

  if (!data?.success) {

    throw new Error(
      "Failed to load client.",
    );

  }

  return data.data as ClientDto;

}

export async function createClient(
  studioId: string,
  payload: CreateClientRequest,
): Promise<ClientDto> {

  const {
    data,
    error,
  } =
    await supabase.functions.invoke(
      FUNCTION_NAME,
      {
        method: "POST",

        body: payload,

        headers: {
          "x-studio-id":
            studioId,
        },
      },
    );

  if (error) {
    throw error;
  }

  if (!data?.success) {

    throw new Error(
      "Failed to create client.",
    );

  }

  return data.data as ClientDto;

}

export async function updateClient(
  studioId: string,
  clientId: string,
  payload: UpdateClientRequest,
): Promise<ClientDto> {

  const {
    data,
    error,
  } =
    await supabase.functions.invoke(
      `${FUNCTION_NAME}/${clientId}`,
      {
        method: "PATCH",

        body: payload,

        headers: {
          "x-studio-id":
            studioId,
        },
      },
    );

  if (error) {
    throw error;
  }

  if (!data?.success) {

    throw new Error(
      "Failed to update client.",
    );

  }

  return data.data as ClientDto;

}