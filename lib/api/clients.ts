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

  const offset =
    (page - 1) * limit;

  const accessToken =
    await getAccessToken();

  if (!accessToken) {
    throw new Error(
      "You must be signed in to load clients.",
    );
  }

  const {
    data,
    error,
  } =
    await supabase.functions.invoke(
      LIST_FUNCTION,
      {
        method: "POST",

        body: {
          status: null,

          search:
            search.trim() || null,

          limit,

          offset,
        },

        headers: {
          Authorization:
            `Bearer ${accessToken}`,

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
      data?.error?.message ??
        "Failed to load clients.",
    );

  }

  const workerData =
    data.data as ClientListWorkerResponse;

  const total =
    Number(workerData?.total ?? 0);

  const clients =
    Array.isArray(workerData?.clients)
      ? workerData.clients.map(
          (item) => ({
            ...item.client,

            metadata: {
              ...(item.client.metadata ?? {}),

              projects_count:
                item.projects_count,
            },
          }),
        )
      : [];

  return {

    clients,

    pagination: {

      page,

      limit,

      total,

      totalPages:
        Math.max(
          1,
          Math.ceil(
            total / limit,
          ),
        ),

    },

  };

}


export async function getClient(
  studioId: string,
  clientId: string,
): Promise<ClientDetailsResponse> {

  const accessToken =
    await getAccessToken();

  if (!accessToken) {
    throw new Error(
      "You must be signed in to load client.",
    );
  }

  const {
    data,
    error,
  } =
    await supabase.functions.invoke(
      GET_FUNCTION,
      {
        method: "POST",

        body: {
          client_id:
            clientId,
        },

        headers: {
          Authorization:
            `Bearer ${accessToken}`,

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
      data?.error?.message ??
        "Failed to load client.",
    );

  }

  if (
    !data.data ||
    !data.data.client
  ) {

    throw new Error(
      "Client response is invalid.",
    );

  }

  return data.data as ClientDetailsResponse;

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
      CREATE_FUNCTION,
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

    let backendMessage:
      string | null = null;


    try {

      const context =
        (
          error as {
            context?: unknown;
          }
        ).context;


      if (
        context instanceof Response
      ) {

        const responseBody =
          await context
            .clone()
            .json()
            .catch(
              () => null,
            );


        if (
          responseBody &&
          typeof responseBody ===
            "object"
        ) {

          const body =
            responseBody as {
              success?: boolean;

              error?: {
                code?: string;

                message?: string;

                details?: unknown;
              };

              message?: string;
            };


          if (
            typeof body.error?.message ===
            "string"
          ) {

            backendMessage =
              body.error.message;

          } else if (
            typeof body.message ===
            "string"
          ) {

            backendMessage =
              body.message;

          }

        }

      }

    } catch {
      /*
       * Keep the original Supabase error
       * if the Edge Function response cannot
       * be parsed.
       */
    }


    if (backendMessage) {

      throw new Error(
        backendMessage,
      );

    }


    throw new Error(
      error.message ||
        "Failed to create client.",
    );

  }


  if (!data?.success) {

    throw new Error(
      data?.error?.message ??
        "Failed to create client.",
    );

  }


  if (!data.data) {

    throw new Error(
      "Client creation returned an empty response.",
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
      UPDATE_FUNCTION,
      {
        method: "POST",

        body: {

          client_id:
            clientId,

          ...payload,

        },

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
      data?.error?.message ??
        "Failed to update client.",
    );

  }

  return data.data as ClientDto;

}